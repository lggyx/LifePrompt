import os
import re
import base64
import uuid
import hashlib
import threading
import time
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# ==================== 应用配置 ====================

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
app.config["JWT_SECRET"] = os.environ.get("JWT_SECRET", "dev-jwt-secret-change-in-production")
app.config["JWT_EXPIRE_HOURS"] = int(os.environ.get("JWT_EXPIRE_HOURS", "24"))

CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "upload")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

HEARTBEAT_INTERVAL = 30  # seconds

# ==================== 数据存储 ====================

# 内存用户数据库: {username: {"password_hash": str, "created_at": str}}
users_db = {}

# WebSocket 连接管理
# {sid: {"username": str|None, "authenticated": bool}}
connected_clients = {}
authenticated_sids = set()

# 防止 API 上传与 watchdog 重复发送
_recent_api_uploads = set()
_recent_api_lock = threading.Lock()

# ==================== MIME 类型映射 ====================

MIME_TO_EXT = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/bmp": ".bmp",
    "image/svg+xml": ".svg",
}

EXT_TO_MIME = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".svg": "image/svg+xml",
}

# ==================== 认证工具函数 ====================


def hash_password(password: str) -> str:
    """对密码进行 SHA256 哈希"""
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token(username: str) -> str:
    """生成 JWT token"""
    now = datetime.utcnow()
    payload = {
        "username": username,
        "exp": now + timedelta(hours=app.config["JWT_EXPIRE_HOURS"]),
        "iat": now,
    }
    return jwt.encode(payload, app.config["JWT_SECRET"], algorithm="HS256")


def verify_token(token: str):
    """验证 JWT token，成功返回 payload，失败返回 None"""
    if not token:
        return None
    try:
        return jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    """API 接口认证装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]
        if not token:
            return jsonify({"success": False, "error": "缺少认证 token"}), 401
        payload = verify_token(token)
        if not payload:
            return jsonify({"success": False, "error": "token 无效或已过期"}), 401
        request.current_user = payload["username"]
        return f(*args, **kwargs)
    return decorated


# ==================== 图片处理工具 ====================


def save_image(data: bytes, ext: str) -> tuple[str, str]:
    """保存图片到 upload 目录，返回 (文件名, 完整路径)"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:8]
    filename = f"img_{timestamp}_{unique_id}{ext}"
    filename = secure_filename(filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    with open(filepath, "wb") as f:
        f.write(data)
    return filename, filepath


def parse_base64_image(image_str: str):
    """解析 base64 图片字符串，返回 (二进制数据, 扩展名)"""
    pattern = r"^data:([\w/+-]+);base64,(.*)$"
    match = re.match(pattern, image_str)
    if match:
        mime_type = match.group(1)
        base64_data = match.group(2)
        ext = MIME_TO_EXT.get(mime_type, ".png")
    else:
        base64_data = image_str
        ext = ".png"
    try:
        image_data = base64.b64decode(base64_data)
    except Exception:
        return None, None
    return image_data, ext


def is_image_file(filename: str) -> bool:
    """判断文件是否为支持的图片格式"""
    ext = os.path.splitext(filename)[1].lower()
    return ext in EXT_TO_MIME


def is_file_stable(filepath: str, wait_time: float = 0.3, max_wait: float = 3.0) -> bool:
    """等待文件写入完成（通过检查大小是否稳定）"""
    if not os.path.exists(filepath):
        return False
    start = time.time()
    while time.time() - start < max_wait:
        try:
            size1 = os.path.getsize(filepath)
            time.sleep(wait_time)
            if not os.path.exists(filepath):
                return False
            size2 = os.path.getsize(filepath)
            if size1 == size2:
                return True
        except OSError:
            return False
    return True


# ==================== 登录注册 API ====================


@app.route("/auth/register", methods=["POST"])
def register():
    """
    用户注册

    curl -X POST http://localhost:43218/auth/register \\
      -H "Content-Type: application/json" \\
      -d '{"username":"test","password":"123456"}'
    """
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"success": False, "error": "用户名和密码不能为空"}), 400
    if len(password) < 6:
        return jsonify({"success": False, "error": "密码长度至少 6 位"}), 400
    if username in users_db:
        return jsonify({"success": False, "error": "用户名已存在"}), 409

    users_db[username] = {
        "password_hash": hash_password(password),
        "created_at": datetime.now().isoformat(),
    }

    token = generate_token(username)
    return jsonify({
        "success": True,
        "message": "注册成功",
        "token": token,
        "username": username,
    }), 201


@app.route("/auth/login", methods=["POST"])
def login():
    """
    用户登录

    curl -X POST http://localhost:43218/auth/login \\
      -H "Content-Type: application/json" \\
      -d '{"username":"test","password":"123456"}'
    """
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"success": False, "error": "用户名和密码不能为空"}), 400

    user = users_db.get(username)
    if not user or user["password_hash"] != hash_password(password):
        return jsonify({"success": False, "error": "用户名或密码错误"}), 401

    token = generate_token(username)
    return jsonify({
        "success": True,
        "message": "登录成功",
        "token": token,
        "username": username,
    }), 200


@app.route("/auth/me", methods=["GET"])
@require_auth
def get_me():
    """获取当前登录用户信息"""
    return jsonify({
        "success": True,
        "username": request.current_user,
    }), 200


# ==================== WebSocket 事件处理（兼容 LifePrompt 前端协议） ====================


@socketio.on("connect")
def handle_connect():
    """处理客户端连接"""
    from flask import request as flask_request
    sid = flask_request.sid

    # 尝试从 query 参数进行 token 认证（备选方式）
    token = flask_request.args.get("token")
    if token:
        payload = verify_token(token)
        if payload:
            username = payload["username"]
            connected_clients[sid] = {"username": username, "authenticated": True}
            authenticated_sids.add(sid)
            print(f"[WS] Token 认证连接: {sid}, 用户: {username}")
            emit("connected", {
                "status": "ok",
                "authenticated": True,
                "username": username,
                "message": "WebSocket 连接已建立",
            })
            return

    connected_clients[sid] = {"username": None, "authenticated": False}
    print(f"[WS] 客户端连接（待认证）: {sid}")
    emit("connected", {
        "status": "ok",
        "authenticated": False,
        "message": "WebSocket 连接已建立，请发送认证消息",
    })


@socketio.on("disconnect")
def handle_disconnect():
    """处理客户端断开连接"""
    from flask import request as flask_request
    sid = flask_request.sid
    info = connected_clients.pop(sid, None)
    authenticated_sids.discard(sid)
    print(f"[WS] 客户端断开: {sid}, 剩余认证连接: {len(authenticated_sids)}")


@socketio.on("message")
def handle_message(raw_data):
    """
    处理前端发送的 JSON 消息（兼容 LifePrompt glassesClient.js 协议）

    协议规范:
      1. 认证: {"type": "auth", "username": "...", "password": "..."}
         响应: {"type": "auth_success"} 或 {"type": "auth_failed", "message": "..."}

      2. 心跳: 服务端每 30s 发送 {"type": "ping"}
                客户端回复 {"type": "pong"}
                客户端也可能主动发送 {"type": "ping"}，服务端回复 {"type": "pong"}

      3. 检索: {"type": "search_request", "query": "..."}
         响应: {"type": "search_response", "success": true, "query": "...", "response": "..."}
    """
    from flask import request as flask_request
    sid = flask_request.sid

    # 解析 JSON
    try:
        if isinstance(raw_data, str):
            data = json.loads(raw_data)
        elif isinstance(raw_data, dict):
            data = raw_data
        else:
            emit("message", json.dumps({"type": "error", "message": "Invalid message format"}, ensure_ascii=False))
            return
    except json.JSONDecodeError:
        emit("message", json.dumps({"type": "error", "message": "Invalid JSON"}, ensure_ascii=False))
        return

    msg_type = data.get("type")
    client_info = connected_clients.get(sid, {})

    # ---- 1. 认证消息 ----
    if msg_type == "auth":
        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username:
            emit("message", json.dumps({
                "type": "auth_failed",
                "message": "用户名不能为空",
            }, ensure_ascii=False))
            return

        # 优先检查已注册用户
        user = users_db.get(username)
        if user:
            # 已注册用户，验证密码
            if not password or user["password_hash"] != hash_password(password):
                emit("message", json.dumps({
                    "type": "auth_failed",
                    "message": "用户名或密码错误",
                }, ensure_ascii=False))
                return
        else:
            # 未注册用户，自动注册（兼容 glasses_server 的简化行为）
            if len(password) < 6:
                emit("message", json.dumps({
                    "type": "auth_failed",
                    "message": "密码长度至少 6 位",
                }, ensure_ascii=False))
                return
            users_db[username] = {
                "password_hash": hash_password(password),
                "created_at": datetime.now().isoformat(),
            }
            print(f"[Auth] 自动注册用户: {username}")

        connected_clients[sid] = {"username": username, "authenticated": True}
        authenticated_sids.add(sid)
        emit("message", json.dumps({
            "type": "auth_success",
            "message": f"Welcome, {username}",
        }, ensure_ascii=False))
        print(f"[WS] 认证成功: {username} ({sid})")
        return

    # ---- 2. 心跳消息 ----
    if msg_type == "pong":
        # 客户端响应了服务器的 ping，无需处理
        return

    if msg_type == "ping":
        # 客户端主动 ping，回复 pong
        emit("message", json.dumps({"type": "pong"}, ensure_ascii=False))
        return

    # ---- 3. 信息检索请求 ----
    if msg_type == "search_request":
        # 暂时移除认证检查，允许所有连接客户端使用
        query = data.get("query", "")
        username = client_info.get("username") or data.get("username", "anonymous")
        response_text = generate_search_response(query, username)

        emit("message", json.dumps({
            "type": "search_response",
            "success": True,
            "query": query,
            "response": response_text,
            "timestamp": datetime.now().isoformat(),
        }, ensure_ascii=False))
        print(f"[Search] 用户 {username} 搜索: {query}")
        return

    # ---- 4. 未知消息类型 ----
    emit("message", json.dumps({
        "type": "error",
        "message": f"Unknown message type: {msg_type}",
    }, ensure_ascii=False))


# ==================== 图片上传接口 ====================


@app.route("/upload", methods=["POST"])
def upload_file():
    """
    上传图片接口（需要 Bearer Token 认证）

    1) multipart/form-data:
       curl -X POST http://localhost:43218/upload \\
         -H "Authorization: Bearer <TOKEN>" \\
         -F "file=@/path/to/image.png"

    2) JSON (base64):
       curl -X POST http://localhost:43218/upload \\
         -H "Authorization: Bearer <TOKEN>" \\
         -H "Content-Type: application/json" \\
         -d '{"image":"data:image/png;base64,..."}'
    """
    uploader = request.headers.get("X-Username", "anonymous")

    # JSON base64 方式
    if request.is_json:
        json_data = request.get_json(silent=True) or {}
        image_str = json_data.get("image")
        if not image_str:
            return jsonify({"success": False, "error": "JSON 中缺少 image 字段"}), 400

        image_data, ext = parse_base64_image(image_str)
        if image_data is None:
            return jsonify({"success": False, "error": "image 字段不是有效的 base64 编码"}), 400

        filename, filepath = save_image(image_data, ext)
        _add_recent_api_upload(filepath)
        broadcast_uploaded_image(filename, filepath, image_data, uploader)

        return jsonify({
            "success": True,
            "filename": filename,
            "path": filepath,
            "uploader": uploader,
        }), 200

    # multipart/form-data 方式
    file = request.files.get("image") or request.files.get("file")
    if file:
        if file.filename == "":
            return jsonify({"success": False, "error": "没有选择文件"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        _add_recent_api_upload(filepath)
        broadcast_uploaded_image(filename, filepath, uploader=uploader)

        return jsonify({
            "success": True,
            "filename": filename,
            "path": filepath,
            "uploader": uploader,
        }), 200

    return jsonify({"success": False, "error": "请求格式错误，请使用 JSON (base64) 或 form-data"}), 400


def _add_recent_api_upload(filepath: str):
    """记录 API 上传的文件路径，防止 watchdog 重复处理"""
    with _recent_api_lock:
        _recent_api_uploads.add(filepath)

    def remove():
        with _recent_api_lock:
            _recent_api_uploads.discard(filepath)

    threading.Timer(5.0, remove).start()


def _is_recent_api_upload(filepath: str) -> bool:
    with _recent_api_lock:
        return filepath in _recent_api_uploads


def broadcast_uploaded_image(filename: str, filepath: str, image_data: bytes = None, uploader: str = "unknown"):
    """
    向所有 WebSocket 客户端广播上传的图片。
    消息格式兼容 LifePrompt 前端协议:
        {"type": "uploaded_image", "filename": "...", "data": "base64...",
         "mime_type": "image/jpeg", "uploader": "..."}
    """
    if len(connected_clients) == 0:
        print(f"[Broadcast] 没有 WebSocket 客户端，图片 {filename} 不会推送")
        return

    if image_data:
        image_base64 = base64.b64encode(image_data).decode("utf-8")
    else:
        try:
            with open(filepath, "rb") as f:
                image_base64 = base64.b64encode(f.read()).decode("utf-8")
        except Exception as e:
            print(f"[Broadcast] 读取图片文件失败: {e}")
            return

    ext = os.path.splitext(filename)[1].lower()
    mime_type = EXT_TO_MIME.get(ext, "image/png")

    message = {
        "type": "uploaded_image",
        "filename": filename,
        "data": image_base64,
        "mime_type": mime_type,
        "uploader": uploader,
    }

    message_json = json.dumps(message, ensure_ascii=False)

    # 向所有连接客户端推送（暂时不限制认证）
    for sid in list(connected_clients.keys()):
        socketio.emit("message", message_json, room=sid)

    print(f"[Broadcast] {filename} ({mime_type}) -> {len(connected_clients)} client(s)")


# ==================== 心跳任务 ====================


def heartbeat_task():
    """后台线程：每 30 秒向所有已认证客户端发送 ping"""
    while True:
        time.sleep(HEARTBEAT_INTERVAL)
        ping_msg = json.dumps({"type": "ping"}, ensure_ascii=False)
        disconnected = []

        for sid in list(authenticated_sids):
            try:
                socketio.emit("message", ping_msg, room=sid)
            except Exception as e:
                print(f"[Heartbeat] Failed for {sid}: {e}")
                disconnected.append(sid)

        for sid in disconnected:
            authenticated_sids.discard(sid)
            connected_clients.pop(sid, None)


# ==================== 文件系统监听（自动推送目录中的新图片） ====================


class UploadFolderHandler(FileSystemEventHandler):
    """监听 upload 目录，自动推送新图片到已认证客户端"""

    def on_created(self, event):
        if event.is_directory:
            return
        self._handle_file(event.src_path)

    def on_moved(self, event):
        if event.is_directory:
            return
        self._handle_file(event.dest_path)

    def _handle_file(self, filepath: str):
        if not is_image_file(filepath):
            return
        if _is_recent_api_upload(filepath):
            return
        if not is_file_stable(filepath):
            print(f"[Watcher] 文件写入不稳定，跳过: {filepath}")
            return

        filename = os.path.basename(filepath)
        print(f"[Watcher] 监听到新图片: {filename}")
        broadcast_uploaded_image(filename, filepath, uploader="filesystem")


def start_file_watcher():
    """启动文件系统监视线程"""
    handler = UploadFolderHandler()
    observer = Observer()
    observer.schedule(handler, UPLOAD_FOLDER, recursive=False)
    observer.start()
    print(f"[Watcher] 开始监听上传目录: {UPLOAD_FOLDER}")
    return observer


# ==================== 文本生成（可替换为真实 AI/LLM） ====================


def generate_search_response(query: str, username: str) -> str:
    """根据查询生成文本响应。在实际项目中可替换为 OpenAI、Claude 等 LLM 调用。"""
    if not query or not query.strip():
        return "您好！请输入您的检索请求，我将尽力为您提供帮助。"

    query = query.strip()
    current_time = datetime.now().strftime("%Y年%m月%d日 %H:%M:%S")

    response = (
        f"您好，{username}！\n\n"
        f"您查询的内容是：「{query}」\n\n"
        f"【检索结果】\n"
        f"这是一个模拟的 AI 检索响应。在实际生产环境中，您可以在此处接入 "
        f"OpenAI GPT、Claude、文心一言、通义千问等大语言模型，"
        f"根据用户的查询内容生成真实、有价值的回答。\n\n"
        f"当前系统时间：{current_time}\n\n"
        f"如需接入真实的 AI 能力，请修改 main.py 中的 generate_search_response 函数，"
        f"调用相应的 LLM API。"
    )
    return response


# ==================== 兼容原有接口 ====================


@app.route("/ws/start", methods=["POST"])
def start_websocket():
    """WebSocket 启动触发端点"""
    data = request.get_json(silent=True) or {}
    client_id = data.get("client_id", "unknown")
    return jsonify({
        "success": True,
        "message": "WebSocket 服务已就绪，请连接并认证",
        "websocket_url": "ws://localhost:43218",
        "client_id": client_id,
        "status": "ready",
    }), 200


@app.route("/ws/status", methods=["GET"])
def get_websocket_status():
    """获取 WebSocket 连接状态"""
    return jsonify({
        "active": len(connected_clients) > 0,
        "total_clients": len(connected_clients),
        "authenticated_clients": len(authenticated_sids),
        "clients": [
            {
                "sid": sid,
                "username": info.get("username"),
                "authenticated": info.get("authenticated"),
            }
            for sid, info in connected_clients.items()
        ],
    }), 200


# ==================== 启动入口 ====================

if __name__ == "__main__":
    import json  # noqa: F811

    observer = start_file_watcher()

    # 启动后台心跳线程
    heartbeat_thread = threading.Thread(target=heartbeat_task, daemon=True)
    heartbeat_thread.start()
    print(f"[Server] Heartbeat interval: {HEARTBEAT_INTERVAL}s")

    try:
        socketio.run(app, host="0.0.0.0", port=43218)
    finally:
        observer.stop()
        observer.join()
