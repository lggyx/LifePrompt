# LifePrompt 功能完善计划

连接假数据展示模块与真实数据持久化层，完成核心功能开发。

## 项目现状分析

### 已完成的阶段一（基础搭建）
- [x] 依赖安装 - 全部已安装
- [x] 主题系统 - Light/Night双主题，含ThemeProvider和ThemeToggle
- [x] 数据库 - Dexie Schema定义完整，articleRepo/tagRepo/settingsRepo/userProfileRepo已实现
- [x] 全局布局 - AppShell/BottomNav/TopBar/PageTransition已完成
- [x] 假数据生成器 - mockData.js已完善

### 使用假数据的功能模块（需修复）

| 模块 | 文件路径 | 问题描述 |
|------|----------|----------|
| **文章列表** | `src/pages/ArticleListPage.jsx:48-73` | 使用硬编码mockArticles数组，未连接articleRepo |
| **文章详情** | `src/pages/ArticleDetailPage.jsx:31-63` | 使用硬编码article对象，未从数据库读取 |
| **脑图** | `src/pages/MindMapPage.jsx:17-35` | 使用硬编码mockNodes，未从数据库生成 |
| **AI对话** | `src/pages/AIChatPage.jsx:49-68` | 使用随机responses数组模拟AI回复 |
| **AI配置** | `src/pages/AIConfigPage.jsx:26-74` | 配置仅保存在React state，未持久化到数据库 |
| **用户画像** | `src/pages/UserProfilePage.jsx:119-118` | 对话结果未保存到userProfileRepo |
| **内容捕获** | `src/pages/CapturePage.jsx:57-68` | 模拟AI处理，结果未保存到数据库 |
| **云备份** | `src/pages/CloudBackupPage.jsx:40-74` | 模拟登录/同步，无真实API调用 |
| **局域网备份** | `src/pages/LANBackupPage.jsx:37-89` | 模拟配对和传输，无真实WebRTC/mDNS |

### 未完成的核心功能

| 功能模块 | 缺失内容 |
|----------|----------|
| **AI服务层** | `src/services/ai/` 目录为空，需要实现openai.js/claude.js/qianwen.js |
| **截图捕获** | `src/services/capture/` 目录为空，需要实现screenshot.js/linkParser.js/imageAnalyzer.js |
| **同步服务** | `src/services/sync/` 目录为空 |
| **发布服务** | `src/services/publish/` 目录为空 |
| **状态管理** | 仅有useThemeStore和useToastStore，缺少useArticleStore/useAIStore等 |
| **Hooks** | `src/hooks/` 目录为空 |

## 修复方案

### 阶段A：建立数据连接（优先）

#### A1. 创建缺失的Zustand Stores
创建以下store文件，连接数据库层：
- `src/stores/useArticleStore.js` - 文章CRUD + 订阅DB变更
- `src/stores/useTagStore.js` - 标签管理 + 自动计数更新
- `src/stores/useAIStore.js` - AI配置持久化到settingsRepo
- `src/stores/useUserProfileStore.js` - 用户画像持久化

#### A2. 替换假数据 - 文章列表页
修改 `src/pages/ArticleListPage.jsx`：
- 移除硬编码mockArticles
- 使用useArticleStore订阅文章列表
- 标签筛选改用真实tag数据

#### A3. 替换假数据 - 文章详情页
修改 `src/pages/ArticleDetailPage.jsx`：
- 通过useParams获取id
- 使用articleRepo.getById()获取真实数据
- 删除按钮调用articleRepo.delete()

#### A4. 替换假数据 - 脑图页
修改 `src/pages/MindMapPage.jsx`：
- 使用真实文章和标签数据生成节点
- 实现力导向布局算法或接入D3-force

### 阶段B：AI服务层实现

#### B1. 创建AI服务入口
创建 `src/services/ai/index.js`：
```javascript
// 统一AI调用接口，根据配置路由到不同提供商
export async function chat(messages, config) { ... }
export async function generateTitle(content, profile) { ... }
export async function generateSummary(content, profile) { ... }
export async function generateTags(content, profile) { ... }
export async function analyzeImage(imageBase64, config) { ... }
```

#### B2. 实现各提供商适配器
- `src/services/ai/openai.js` - OpenAI API封装
- `src/services/ai/claude.js` - Claude API封装
- `src/services/ai/qianwen.js` - 通义千问API封装
- `src/services/ai/promptTemplates.js` - 提示词模板

#### B3. 实现用户画像引擎
创建 `src/services/ai/profileEngine.js`：
- 根据用户画像约束生成个性化提示词
- 整合到AI调用流程

#### B4. 替换AI对话假数据
修改 `src/pages/AIChatPage.jsx`：
- 接入真实AI服务
- 对话历史保存到chatHistory表

### 阶段C：内容捕获功能

#### C1. 创建捕获服务
- `src/services/capture/screenshot.js` - 调用Capacitor Camera插件
- `src/services/capture/linkParser.js` - 抓取网页内容（需代理绕过CORS）
- `src/services/capture/imageAnalyzer.js` - 调用多模态AI分析

#### C2. 实现捕获页保存逻辑
修改 `src/pages/CapturePage.jsx`：
- 调用AI服务处理内容
- 结果保存到articleRepo
- 成功后跳转文章列表

### 阶段D：高级功能（可选优先级）

#### D1. 云同步
- 需要后端API支持（Express/Fastify）
- JWT认证 + 增量同步协议

#### D2. 局域网备份
- WebRTC数据通道或WebSocket
- 配对码 + AES加密

#### D3. 发布功能
- 微信公众号OAuth流程
- 草稿创建/群发API

## 最小可行修复（MVP）

如果只需让现有功能可用，优先完成：

1. **创建useArticleStore** - 连接文章列表和详情到真实数据
2. **创建useAIStore** - 让AI配置持久化
3. **实现AI服务基础版** - 至少支持OpenAI，让AI对话可用
4. **修复CapturePage保存逻辑** - 让捕获的内容能真实保存

## 文件修改清单

### 新建文件
```
src/stores/useArticleStore.js
src/stores/useTagStore.js
src/stores/useAIStore.js
src/stores/useUserProfileStore.js
src/services/ai/index.js
src/services/ai/openai.js
src/services/ai/promptTemplates.js
src/services/capture/screenshot.js
src/services/capture/linkParser.js
src/services/capture/imageAnalyzer.js
```

### 需修改的文件
```
src/pages/ArticleListPage.jsx    # 替换假数据
src/pages/ArticleDetailPage.jsx  # 替换假数据，实现删除
src/pages/MindMapPage.jsx        # 替换假数据
src/pages/AIChatPage.jsx         # 接入真实AI
src/pages/AIConfigPage.jsx       # 接入useAIStore
src/pages/CapturePage.jsx        # 实现保存逻辑
src/pages/UserProfilePage.jsx    # 接入useUserProfileStore
```

## 建议的下一步行动

1. 确认哪些功能是当前最优先需要可用的
2. 是否需要我先实现MVP级别的修复
3. 或者按照完整计划逐步推进
