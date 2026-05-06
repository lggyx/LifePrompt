"""
WebSocket 客户端示例 - 支持 Token 认证、接收图片、发送检索请求

运行方式:
    python ws_client_example.py
"""
import socketio
import json
import sys


class WebSocketClient:
    def __init__(self, server_url="http://localhost:43218", token=None):
        self.sio = socketio.Client()
        self.server_url = server_url
        self.token = token
        self.authenticated = False

        # 注册事件处理器
        self.sio.on("connect", self.on_connect)
        self.sio.on("disconnect", self.on_disconnect)
        self.sio.on("connected", self.on_connected_event)
        self.sio.on("authenticated", self.on_authenticated)
        self.sio.on("auth_error", self.on_auth_error)
        self.sio.on("image_uploaded", self.on_image_uploaded)
        self.sio.on("search_response", self.on_search_response)

    def on_connect(self):
        print("✓ 已连接到服务器")
        if self.token:
            print("→ 发送认证信息...")
            self.sio.emit("authenticate", {"token": self.token})

    def on_disconnect(self):
        print("✗ 与服务器断开连接")
        self.authenticated = False

    def on_connected_event(self, data):
        print(f"服务器连接响应: {data}")

    def on_authenticated(self, data):
        self.authenticated = True
        print(f"✓ 认证成功: {data}")

    def on_auth_error(self, data):
        self.authenticated = False
        print(f"✗ 认证失败: {data}")

    def on_image_uploaded(self, data):
        """接收到图片上传事件"""
        print(f"\n📸 收到新图片!")
        print(f"  文件名: {data.get('filename')}")
        print(f"  路径: {data.get('path')}")
        print(f"  MIME类型: {data.get('mime_type')}")
        print(f"  上传者: {data.get('uploader')}")
        print(f"  时间戳: {data.get('timestamp')}")
        print(f"  图片数据长度: {len(data.get('image', ''))} 字符")
        print("  ---")

    def on_search_response(self, data):
        """接收到检索响应"""
        print(f"\n🔍 检索响应:")
        if data.get("success"):
            print(f"  查询: {data.get('query')}")
            print(f"  响应:\n{data.get('response')}")
        else:
            print(f"  错误: {data.get('error')}")
        print("  ---")

    def connect(self):
        """连接到 WebSocket 服务器"""
        try:
            params = {}
            if self.token:
                params["token"] = self.token
            self.sio.connect(self.server_url, auth=params)
            print(f"正在连接到 {self.server_url}...")
        except Exception as e:
            print(f"连接失败: {e}")
            return False
        return True

    def send_search(self, query):
        """发送信息检索请求"""
        if not self.authenticated:
            print("尚未认证，无法发送检索请求")
            return
        self.sio.emit("search_request", {"query": query})
        print(f"→ 已发送检索请求: {query}")

    def wait(self):
        """保持连接等待事件"""
        try:
            while self.sio.connected:
                cmd = input("\n请输入命令 (search <查询内容> / quit): ").strip()
                if cmd.lower() == "quit":
                    break
                if cmd.lower().startswith("search "):
                    self.send_search(cmd[7:])
                elif cmd:
                    print("未知命令，可用: search <内容>, quit")
        except KeyboardInterrupt:
            print("\n用户中断，正在断开连接...")
        finally:
            self.sio.disconnect()


def interactive_login(server_url="http://localhost:43218"):
    """交互式登录并获取 token"""
    import requests
    print("\n=== WebSocket 客户端 ===")
    print("1. 注册")
    print("2. 登录")
    print("3. 匿名连接（不认证）")
    choice = input("请选择: ").strip()

    if choice == "3":
        return None

    username = input("用户名: ").strip()
    password = input("密码: ").strip()

    url = f"{server_url}/auth/register" if choice == "1" else f"{server_url}/auth/login"
    try:
        resp = requests.post(url, json={"username": username, "password": password})
        data = resp.json()
        if data.get("success"):
            print(f"✓ {'注册' if choice == '1' else '登录'}成功!")
            return data.get("token")
        else:
            print(f"✗ 失败: {data.get('error')}")
            return None
    except Exception as e:
        print(f"请求失败: {e}")
        return None


if __name__ == "__main__":
    server_url = "http://localhost:43218"
    token = None

    if len(sys.argv) > 1 and sys.argv[1] == "--anonymous":
        print("以匿名模式连接...")
    else:
        token = interactive_login(server_url)

    client = WebSocketClient(server_url, token=token)
    if client.connect():
        if token:
            print("等待接收图片和检索响应... (输入 search <内容> 进行检索, quit 退出)")
        else:
            print("匿名连接，仅接收公共消息... (quit 退出)")
        client.wait()
