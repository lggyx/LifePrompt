# LifePrompt 开发计划

## 阶段一：项目基础搭建

### 1.1 依赖安装与配置
- [ ] 安装路由库：`react-router-dom`
- [ ] 安装状态管理：`zustand`
- [ ] 安装动画库：`framer-motion`
- [ ] 安装图标库：`lucide-react`
- [ ] 安装本地数据库：`dexie` + `dexie-react-hooks`
- [ ] 安装虚拟滚动：`react-window`
- [ ] 安装字体加载：`@fontsource/sora` + `@fontsource/space-grotesk`
- [ ] 安装二维码生成：`qrcode`（局域网配对用）
- [ ] 安装日期处理：`date-fns`
- [ ] 配置 Vite PWA 插件（可选，支持离线）

### 1.2 主题系统搭建
- [ ] 在 `index.css` 定义 Light/Night 两套 CSS 变量
- [ ] 创建 `ThemeProvider` 组件，支持手动/跟随系统切换
- [ ] 创建 `ThemeToggle` 组件
- [ ] 实现主题切换过渡动画
- [ ] 配置字体加载（Sora + Space Grotesk）

### 1.3 数据库初始化
- [ ] 创建 `db.js` 定义 Dexie Schema
  - `articles`: id, title, summary, content, tags[], imageUrl, sourceType, sourceUrl, createdAt, updatedAt, isPublished, publishPlatform
  - `tags`: id, name, color, count
  - `userProfile`: id, constraints, chatHistory, createdAt
  - `settings`: key, value
  - `syncQueue`: id, action, payload, status, createdAt
- [ ] 创建数据仓库层（articleRepo, tagRepo, settingsRepo）
- [ ] 添加数据库迁移逻辑

### 1.4 全局布局搭建
- [ ] 创建 `AppShell` 组件（含安全区域适配）
- [ ] 创建 `BottomNav` 底部导航（5个Tab）
- [ ] 创建 `TopBar` 顶部栏
- [ ] 创建 `PageTransition` 页面过渡包装器
- [ ] 配置 `react-router-dom` 路由结构
- [ ] 实现页面切换动画（slide + fade spring）

### 1.5 假数据生成器
- [ ] 创建 `mockData.js` 生成假文章数据（20-30条）
- [ ] 包含不同标签、图片、来源类型
- [ ] 生成假用户画像约束数据
- [ ] 开发模式下自动填充到数据库

---

## 阶段二：初始化功能

### 2.1 AI模型配置页面 (`/settings/ai`)
- [ ] 创建 `AIConfigPage` 页面
- [ ] 支持添加/编辑/删除 AI 配置：
  - 模型类型选择：OpenAI / Claude / 通义千问
  - API Key 输入（密码掩码）
  - Base URL 自定义
  - 模型选择（如 gpt-4o, claude-3-sonnet 等）
  - 温度参数滑块
- [ ] 测试连接功能（发送一条简单消息验证）
- [ ] 配置持久化到 localStorage（加密存储）
- [ ] UI：表单布局 + 卡片列表展示已配置模型

### 2.2 用户画像生成 (`/onboarding/profile`)
- [ ] 创建 `UserProfilePage` 页面
- [ ] 创建 `ProfileChat` 对话组件：
  - 预设引导问题（5-8轮对话，约3-5分钟）
  - AI 根据回答逐步构建用户画像
  - 流式打字机效果显示 AI 回复
- [ ] 对话完成后生成 `constraints.json` 结构：
  - 用户风格偏好（正式/随意/幽默等）
  - 常用标签偏好
  - 标题生成偏好
  - 概述长度偏好
- [ ] 约束文件展示与编辑
- [ ] 持久化到 IndexedDB
- [ ] 首次启动引导流程（Onboarding）

### 2.3 快捷键设置 (`/settings/shortcuts`)
- [ ] 创建 `ShortcutConfigPage` 页面
- [ ] 配置项：
  - 截图触发方式：悬浮窗按钮 / 通知栏快捷方式
  - 悬浮窗位置：左/右边缘
  - 悬浮窗透明度
  - 通知栏快捷开关
- [ ] 使用 Capacitor App 插件注册快捷方式
- [ ] Android 悬浮窗权限申请逻辑
- [ ] 设置持久化

---

## 阶段三：内容捕获功能

### 3.1 截图识别
- [ ] 创建 `FloatingCapture` 悬浮窗组件（Android原生插件）
- [ ] 创建 `ScreenshotService` 服务：
  - 触发系统截图或自定义截图
  - 将图片转为 base64
- [ ] 截图后唤起 AI 图片识别：
  - 调用多模态模型（如 GPT-4o Vision）
  - 提取文字内容 + 理解图片语义
- [ ] 结合用户画像约束生成元数据：
  - 标题（符合用户风格）
  - 概述（符合用户偏好长度）
  - 标签（从用户偏好标签池中选取）
- [ ] 生成 Article 数据并保存到数据库
- [ ] 截图快照保存到本地文件系统

### 3.2 链接识别
- [ ] 创建 `LinkCapturePage` 页面
- [ ] 创建 `LinkDetector` 组件：
  - 应用打开时自动检测剪贴板内容
  - 识别 URL 格式
  - 弹出确认框询问是否处理
- [ ] 支持三种输入方式：
  1. 自动检测剪贴板
  2. 其他应用分享（Capacitor Share 插件接收）
  3. 手动粘贴输入
- [ ] 创建 `LinkParser` 服务：
  - 抓取网页内容（通过后端代理或 fetch + CORS 绕过）
  - 提取文章正文（Readability 算法或 AI 提取）
- [ ] AI 生成元数据并保存

### 3.3 眼镜图片识别 (`/glasses`)
- [ ] 创建 `GlassesInboxPage` 页面
- [ ] 模拟眼镜推送接口（先用定时器模拟）
- [ ] 创建 `ImageAnalyzer` 服务：
  - 接收图片 base64
  - 调用 AI 多模态模型分析
- [ ] 生成元数据并保存
- [ ] 收件箱列表展示未处理/已处理状态

### 3.4 手动添加 (`/capture`)
- [ ] 创建通用内容捕获页面
- [ ] 支持：纯文本输入、图片上传、链接粘贴
- [ ] 一键 AI 处理按钮
- [ ] 元数据预览与手动编辑

---

## 阶段四：数据展示功能

### 4.1 主页布局 (`/` 或 `/home`)
- [ ] 创建 `HomePage` 页面
- [ ] 上方：脑图区域（占 40% 屏幕）
- [ ] 下方：AI 对话框 + 文章搜索列表
- [ ] 实现上下区域可拖拽调整比例

### 4.2 脑图组件 (`/mindmap`)
- [ ] 创建 `MindMapCanvas` 组件
- [ ] 使用 D3-force 或自定义力导向算法：
  - 中心节点："我的文章"
  - 一级节点：标签分类
  - 二级节点：文章（关联到标签）
- [ ] 交互：
  - 拖拽节点
  - 缩放/平移画布
  - 点击节点展开/折叠
  - 点击文章节点跳转到详情
- [ ] 动画：节点进入弹性动画，连线绘制动画
- [ ] 支持全屏模式

### 4.3 AI 对话框 (`/chat`)
- [ ] 创建 `AIChatPage` 页面
- [ ] 创建 `ChatDialog` 组件：
  - 消息气泡（用户/AI 区分样式）
  - 流式输出动画
  - 输入框 + 发送按钮
  - 快捷操作按钮（搜索文章、总结、生成标题等）
- [ ] 上下文增强：
  - 根据用户输入语义搜索本地文章
  - 将相关文章作为上下文喂给 AI
  - AI 回答中可引用文章（带链接）
- [ ] 对话历史持久化

### 4.4 文章列表 (`/articles`)
- [ ] 创建 `ArticleListPage` 页面
- [ ] 创建 `ArticleGrid` 组件
- [ ] 三种视图模式切换：
  1. **Compact**: 仅标题，小卡片，网格布局（3列）
  2. **Standard**: 标题+概述，中卡片，列表/网格布局（2列）
  3. **Rich**: 标题+概述+图片，大卡片，列表布局（1列）
- [ ] 创建 `ViewToggle` 组件（带动画切换）
- [ ] 布局自适应动画（layout animation）
- [ ] 虚拟滚动优化（长列表）

### 4.5 文章详情 (`/article/:id`)
- [ ] 创建 `ArticleDetailPage` 页面
- [ ] 展示：标题、概述、标签、来源、原文内容/快照、创建时间
- [ ] 操作按钮：编辑、删除、分享、发布
- [ ] 左右滑动切换上一篇/下一篇

### 4.6 标签与分类筛选
- [ ] 在 `ArticleListPage` 添加 `FilterChips` 组件
- [ ] 支持按标签筛选（多选）
- [ ] 支持按来源类型筛选（截图/链接/眼镜/手动）
- [ ] 支持按时间范围筛选
- [ ] 支持搜索关键词
- [ ] 筛选结果实时更新

---

## 阶段五：数据管理功能

### 5.1 云备份与登录 (`/settings/cloud`)
- [ ] 创建 `CloudBackupPage` 页面
- [ ] 登录系统：
  - 用户名/密码登录
  - JWT Token 管理
  - 登录状态持久化
- [ ] 云同步逻辑：
  - 增量同步（仅同步变更）
  - 同步状态指示器
  - 手动同步按钮
  - 自动同步开关（WiFi 下自动）
- [ ] 冲突解决 UI
- [ ] 注销与清除云端数据

### 5.2 一键发布 (`/publish/:id`)
- [ ] 创建 `PublishPage` 页面
- [ ] 创建 `PublishFlow` 组件：
  1. 点击发布按钮 -> AI 开始生成文章
  2. 展示生成进度（骨架屏/进度条）
  3. 生成完成后展示预览
  4. 用户审阅并编辑
  5. 确认发布到目标平台
- [ ] 微信公众号发布：
  - 配置公众号 AppID/AppSecret
  - 调用微信 API 发布草稿/群发
  - 展示发布状态
- [ ] 支持平台扩展架构（预留接口）

### 5.3 本地数据配置 (`/settings/storage`)
- [ ] 创建存储设置页面
- [ ] 展示本地数据统计：
  - 文章数量、占用空间
  - 图片数量、占用空间
- [ ] 同步配置项：
  - 是否允许上传到云服务器（开关）
  - AI 配置同步开关
  - 微信公众号配置同步开关
- [ ] 数据导出/导入（JSON 备份文件）
- [ ] 清空数据（带二次确认）

### 5.4 局域网备份 (`/settings/lan`)
- [ ] 创建 `LANBackupPage` 页面
- [ ] 实现局域网发现机制：
  - WebRTC 或 mDNS/UDP 广播
  - 生成配对码（6位数字）
- [ ] 配对流程：
  - 设备 A 开启热点 -> 显示配对码
  - 设备 B 输入配对码 -> 建立连接
- [ ] 数据传输：
  - 加密传输（AES，密钥从配对码派生）
  - 进度显示
  - 增量同步
- [ ] 断开连接与清理

---

## 阶段六：辅助功能与完善

### 6.1 设置中心 (`/settings`)
- [ ] 创建 `SettingsPage` 主页
- [ ] 设置分类列表：
  - AI 模型配置
  - 快捷键设置
  - 主题设置
  - 云备份
  - 局域网备份
  - 存储管理
  - 用户画像查看/重置
  - 关于/版本信息
- [ ] 每个设置项的详情页面

### 6.2 首次引导 (`/onboarding`)
- [ ] 创建 `OnboardingPage` 页面
- [ ] 3-4 页引导：
  1. 欢迎页 + 应用介绍
  2. AI 配置引导（可选跳过）
  3. 用户画像生成（核心步骤）
  4. 完成页 + 进入应用
- [ ] 可滑动翻页，带指示器
- [ ] 跳过按钮（后续可在设置中补全）

### 6.3 搜索功能
- [ ] 全局搜索栏（顶部）
- [ ] 本地数据库全文搜索（Dexie.js）
- [ ] 搜索结果高亮
- [ ] 搜索历史
- [ ] 搜索建议（标签、文章标题）

### 6.4 通知与Toast
- [ ] 创建全局 Toast 系统
- [ ] 操作成功/失败提示
- [ ] 同步状态通知
- [ ] 截图/链接捕获成功通知

### 6.5 数据清理与维护
- [ ] 定期清理过期临时文件
- [ ] 数据库压缩/VACUUM
- [ ] 图片缓存管理

---

## 阶段七：Capacitor 集成与打包

### 7.1 Android 平台配置
- [ ] `npx cap add android`
- [ ] 配置 `capacitor.config.json`：
  - 插件配置（StatusBar, Keyboard, Camera 等）
  - Android 权限声明
- [ ] 自定义 Android Native 插件：
  - 悬浮窗服务（FloatingWindowPlugin）
  - 截图触发器（ScreenshotTriggerPlugin）
  - 通知栏快捷方式（QuickTilePlugin）

### 7.2 权限管理
- [ ] Android 权限申请封装：
  - 悬浮窗权限（SYSTEM_ALERT_WINDOW）
  - 存储权限（Android 13+ 适配）
  - 相机权限
  - 通知权限
  - 网络权限
- [ ] 权限引导 UI

### 7.3 构建与签名
- [ ] 配置 Gradle 构建
- [ ] 生成签名密钥
- [ ] 发布 APK/AAB 构建流程

---

## 阶段八：测试与优化

### 8.1 功能测试
- [ ] 各页面路由测试
- [ ] 数据库 CRUD 测试
- [ ] AI 服务 Mock 测试
- [ ] 截图流程测试
- [ ] 链接捕获测试
- [ ] 云同步测试
- [ ] 发布流程测试

### 8.2 性能优化
- [ ] 首次加载速度优化（代码分割）
- [ ] 列表滚动性能（虚拟滚动）
- [ ] 图片懒加载与缓存
- [ ] 动画性能（will-change, GPU 加速）
- [ ] 内存泄漏检查

### 8.3 UI/UX 打磨
- [ ] 所有页面过渡动画检查
- [ ] 微交互完整性检查
- [ ] 暗色模式全面覆盖
- [ ] 无障碍测试
- [ ] 不同屏幕尺寸适配

---

## 技术债务与后续扩展

### 已预留扩展点
1. **更多 AI 模型**：通过统一接口，新增模型只需实现 adapter
2. **更多发布平台**：继承 `PlatformBase` 类即可
3. **更多输入源**：通过 `CaptureService` 统一入口
4. **桌面端**：Capacitor 可扩展 Electron
5. **iOS 支持**：Capacitor 同时支持

### 待决策事项
- 是否需要后端服务（链接抓取、云同步 API）
- 图片存储策略（本地/云端/混合）
- 多设备实时同步方案（WebSocket / SSE）
