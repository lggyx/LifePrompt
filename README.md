# LifePrompt

> 灵感速记与 AI 增强的个人知识管理系统

LifePrompt 是一款基于 **React + Vite** 构建的跨平台灵感记录应用，通过 **Capacitor** 打包为 Android 原生应用。支持图文采集、AI 智能对话、知识图谱可视化、多端同步与离线存储，帮助用户随时捕获灵感并构建个人知识库。

---

## ✨ 核心功能

| 功能模块 | 说明 |
|---------|------|
| 📝 灵感采集 | 快速记录文字、拍照、剪贴板粘贴，支持标签分类 |
| 🤖 AI 对话 | 集成多模型 AI（OpenAI / Claude / Kimi / 通义千问），智能润色与总结 |
| 🌐 知识图谱 | Three.js 3D 可视化文章关联与标签星系 |
| ☁️ 多端同步 | LAN 局域网备份、云端备份、眼镜设备同步 |
| 🔍 全局搜索 | 实时检索文章、标签与内容 |
| 🌙 主题切换 | 支持浅色 / 深色模式，毛玻璃 UI 设计 |
| 📤 一键发布 | 对接多平台媒体账号，快速分发内容 |

---

## 🛠 技术栈

- **前端框架**: React 19 + React Router 7
- **构建工具**: Vite 8
- **移动端**: Capacitor 8（Android 原生容器）
- **状态管理**: Zustand 5
- **3D 可视化**: React Three Fiber + Three.js
- **动画**: Framer Motion
- **本地数据库**: Dexie（IndexedDB）+ sql.js
- **样式**: 原生 CSS + 玻璃拟态（Glassmorphism）设计
- **字体**: Sora + Space Grotesk

---

## 📁 项目结构

```
LifePrompt/
├── android/                  # Capacitor Android 原生项目（由 npx cap add android 生成）
├── public/                   # 静态资源（图标、WASM 文件）
├── src/
│   ├── assets/               # 图片、字体资源
│   ├── components/
│   │   ├── layout/           # 布局组件（AppShell、TopBar、BottomNav、PageTransition）
│   │   ├── providers/        # 全局 Provider（ThemeProvider）
│   │   ├── three/            # 3D 知识图谱相关组件
│   │   └── ui/               # 基础 UI 组件（GlassCard、NeonButton、Toast 等）
│   ├── hooks/                # 自定义 Hooks（useArticles、useTags、useAIChat）
│   ├── pages/                # 页面组件（20+ 页面）
│   ├── services/
│   │   ├── ai/               # AI 服务集成（openai、claude、kimi、qianwen、profileEngine）
│   │   ├── capture/          # 采集相关服务
│   │   ├── native/           # 原生桥接（nativeBridge.js）
│   │   ├── publish/          # 发布服务
│   │   ├── storage/          # 本地存储（db.js）
│   │   └── sync/             # 同步服务（glassesClient.js）
│   ├── stores/               # Zustand 全局状态（Article、AI、Settings、Theme、Toast 等）
│   ├── utils/                # 工具函数（动画、常量、Mock 数据）
│   ├── App.jsx               # 根组件
│   └── main.jsx              # 入口文件
├── capacitor.config.json     # Capacitor 配置文件
├── vite.config.js            # Vite 构建配置
├── package.json
└── README.md
```

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- npm ≥ 9
- Android Studio（如需构建 Android 应用）
- JDK 17+（推荐 Android Studio 自带版本）

### 1. 克隆并安装依赖

```bash
npm install
```

### 2. 开发模式（Web）

```bash
npm run dev
```

浏览器访问 `http://localhost:5173`。

---

## 📱 Capacitor 完整配置流程

以下为本项目从零搭建的完整命令记录，也可用于重新初始化：

### 1. 创建 Vite React 项目

```bash
npm create vite@latest ./ -- --template react
```

### 2. 安装 Capacitor 核心依赖

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar
```

### 3. 安装额外插件

```bash
npm install @capacitor/camera @capacitor/filesystem @capacitor/network @capacitor/share @capacitor/clipboard
```

### 4. 初始化 Capacitor

```bash
npx cap init "LifePrompt" "com.lggyx.lifeprompt"
```

### 5. 构建 Web 项目

```bash
npm run build
```

### 6. 添加 Android 平台

```bash
npx cap add android
```

> 执行后会在项目根目录生成 `android/` 文件夹，可使用 Android Studio 打开并运行。

---

## 🔧 后续常用命令

| 操作 | 命令 |
|------|------|
| 同步 Web 代码到 Android | `npx cap sync` |
| 打开 Android Studio | `npx cap open android` |
| 运行到设备 | `npx cap run android` |
| 复制资源到原生项目 | `npx cap copy` |
| 构建 Web 生产包 | `npm run build` |
| 同步 + 打开 Android Studio | `npm run build && npx cap sync && npx cap open android` |

---

## ⚙️ Capacitor 配置说明

项目根目录的 [`capacitor.config.json`](capacitor.config.json) 已配置以下关键项：

- **appId**: `com.lggyx.lifeprompt`
- **appName**: `LifePrompt`
- **webDir**: `dist`（Vite 默认构建输出目录）
- **Android 配置**: 允许混合内容、启用 WebView 调试
- **StatusBar**: 不覆盖 WebView，默认样式，背景色 `#f8f9fa`
- **Keyboard**: `body` 自适应模式，暗色键盘样式
- **SplashScreen**: 2 秒启动图，背景色 `#006970`

---

## 🧪 构建与发布

### Web 构建

```bash
npm run build
```

输出目录为 `dist/`，可直接部署到静态托管服务。

### Android APK / AAB 构建

```bash
npm run build
npx cap sync android
npx cap open android
```

在 Android Studio 中：

- **调试**: `Build → Build Bundle(s) / APK(s) → Build APK(s)`
- **发布**: `Build → Generate Signed Bundle / APK`

---

## 📝 开发规范

- 使用 ESLint 进行代码检查：`npm run lint`
- 项目使用 ES Modules（`"type": "module"`）
- 所有文件路径使用相对路径，确保 Capacitor 打包后路径正确

---

## 📄 License

MIT License © 2026 LifePrompt Team
