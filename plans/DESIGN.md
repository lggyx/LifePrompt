# LifePrompt 设计系统文档

## 概述

LifePrompt 采用双主题设计系统：
- **Lumina Solarpunk (Light)**：明亮玻璃态风格， optimistic "daylight tech"
- **Neon Tokyo (Night)**：暗色霓虹赛博朋克风格，"electric nightscape"

两套主题共享相同的组件结构、动画系统和交互模式，仅颜色与氛围不同。

## 色彩系统

### Light 主题

| Token | 值 | 用途 |
|-------|-----|------|
| `--surface` | `#f8f9fa` | 主背景 |
| `--surface-dim` | `#d9dadb` | 暗色表面 |
| `--surface-container-lowest` | `#ffffff` | 最亮容器 |
| `--surface-container` | `#edeeef` | 卡片背景 |
| `--surface-container-high` | `#e7e8e9` | 高亮容器 |
| `--on-surface` | `#191c1d` | 主文字 |
| `--on-surface-variant` | `#3b494b` | 次要文字 |
| `--outline` | `#6a7a7b` | 边框/分割线 |
| `--outline-variant` | `#b9cacb` | 浅边框 |
| `--primary` | `#006970` | 主色（深青） |
| `--on-primary` | `#ffffff` | 主色上文字 |
| `--primary-container` | `#00f0ff` | 主色容器（霓虹青） |
| `--on-primary-container` | `#006970` | 主色容器文字 |
| `--inverse-primary` | `#00dbe9` | 反色主色 |
| `--secondary` | `#a90097` | 次要色（品红） |
| `--on-secondary` | `#ffffff` | 次要色文字 |
| `--secondary-container` | `#d300bd` | 次要容器 |
| `--tertiary` | `#456800` | 第三色（暗绿） |
| `--tertiary-container` | `#a2ef00` | 第三容器（霓虹绿） |
| `--error` | `#ba1a1a` | 错误 |
| `--error-container` | `#ffdad6` | 错误容器 |
| `--background` | `#f8f9fa` | 全局背景 |
| `--on-background` | `#191c1d` | 背景上文字 |
| `--surface-variant` | `#e1e3e4` | 表面变体 |

### Night 主题

| Token | 值 | 用途 |
|-------|-----|------|
| `--surface` | `#0a0a12` | 主背景（近黑蓝） |
| `--surface-container-lowest` | `#050508` | 最深容器 |
| `--surface-container` | `#131320` | 卡片背景 |
| `--surface-container-high` | `#1a1a2e` | 高亮容器 |
| `--on-surface` | `#e0e0f0` | 主文字 |
| `--on-surface-variant` | `#9ca3af` | 次要文字 |
| `--outline` | `#2e303a` | 边框/分割线 |
| `--outline-variant` | `#3a3d4d` | 浅边框 |
| `--primary` | `#ff2d78` | 主色（霓虹粉） |
| `--on-primary` | `#0a0a12` | 主色上文字 |
| `--primary-container` | `#ff2d7820` | 主色容器（半透明） |
| `--on-primary-container` | `#ff2d78` | 主色容器文字 |
| `--inverse-primary` | `#ff5c97` | 反色主色 |
| `--secondary` | `#00ffcc` | 次要色（霓虹青） |
| `--on-secondary` | `#0a0a12` | 次要色文字 |
| `--secondary-container` | `#00ffcc20` | 次要容器 |
| `--tertiary` | `#ffe04a` | 第三色（霓虹黄） |
| `--tertiary-container` | `#ffe04a20` | 第三容器 |
| `--error` | `#ff4444` | 错误 |
| `--error-container` | `#ff444420` | 错误容器 |
| `--background` | `#0a0a12` | 全局背景 |
| `--on-background` | `#e0e0f0` | 背景上文字 |
| `--surface-variant` | `#1a1a2e` | 表面变体 |

### 动态发光变量（Night专用）

| Token | 值 |
|-------|-----|
| `--glow-primary` | `0 0 16px rgba(255, 45, 120, 0.4)` |
| `--glow-secondary` | `0 0 12px rgba(0, 255, 204, 0.3)` |
| `--glow-text-primary` | `0 0 8px currentColor` |
| `--glow-border` | `inset 0 0 12px rgba(255, 45, 120, 0.1)` |
| `--scan-line` | `linear-gradient(transparent 50%, rgba(0,255,204,0.02) 50%)` |

## 排版系统

| Token | 字体 | 大小 | 字重 | 行高 | 字间距 |
|-------|------|------|------|------|--------|
| `--font-heading` | Sora | - | - | - | - |
| `--font-body` | Sora | - | - | - | - |
| `--font-label` | Space Grotesk | - | - | - | - |
| `--font-mono` | Space Grotesk | - | - | - | - |
| `h1` | Sora | 48px | 800 | 1.1 | -0.02em |
| `h2` | Sora | 32px | 700 | 1.2 | -0.01em |
| `h3` | Sora | 24px | 600 | 1.3 | 0 |
| `body-lg` | Sora | 18px | 400 | 1.6 | 0 |
| `body-md` | Sora | 16px | 400 | 1.5 | 0 |
| `body-sm` | Sora | 14px | 400 | 1.4 | 0 |
| `label-caps` | Space Grotesk | 12px | 700 | 1 | 0.1em |
| `mono-data` | Space Grotesk | 14px | 500 | 1.4 | 0 |

## 间距系统

| Token | 值 |
|-------|-----|
| `--space-unit` | 4px |
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 40px |
| `--space-2xl` | 64px |
| `--container-max` | 1280px |
| `--gutter` | 24px |

## 圆角系统

| Token | 值 |
|-------|-----|
| `--radius-sm` | 0.25rem (4px) |
| `--radius-md` | 0.5rem (8px) |
| `--radius-lg` | 0.75rem (12px) |
| `--radius-xl` | 1rem (16px) |
| `--radius-2xl` | 1.5rem (24px) |
| `--radius-full` | 9999px |

## 动画系统

### 过渡曲线

| 名称 | cubic-bezier | 用途 |
|------|-------------|------|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 弹性进入（卡片弹出） |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | 平滑过渡（页面切换） |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | 快速退出（关闭弹窗） |
| `--ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | 弹跳反馈（按钮点击） |

### 时长标准

| 名称 | 时长 | 用途 |
|------|------|------|
| `--duration-instant` | 100ms | 微交互（hover状态） |
| `--duration-fast` | 200ms | 快速反馈（按钮点击） |
| `--duration-normal` | 300ms | 标准过渡（卡片展开） |
| `--duration-slow` | 500ms | 缓慢过渡（页面切换） |
| `--duration-dramatic` | 800ms | 戏剧性效果（首次加载） |

### Framer Motion Spring 配置

```javascript
// 弹性卡片弹出
const springPop = { type: "spring", stiffness: 400, damping: 25 };

// 平滑页面切换
const springSmooth = { type: "spring", stiffness: 300, damping: 30 };

// 按钮按压反馈
const springPress = { type: "spring", stiffness: 500, damping: 15 };

// 列表项交错进入
const staggerContainer = { staggerChildren: 0.05 };
const staggerItem = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
```

## 组件规范

### GlassCard 玻璃卡片

**Light 模式：**
- Background: `rgba(255, 255, 255, 0.7)`
- Backdrop-filter: `blur(20px)`
- Border: `1px solid var(--outline-variant)`
- Inner glow: `inset 0 1px 0 rgba(255,255,255,0.5)`
- Hover: border 过渡到 primary 渐变

**Night 模式：**
- Background: `rgba(26, 26, 46, 0.6)`
- Backdrop-filter: `blur(20px)`
- Border: `1px solid rgba(255, 45, 120, 0.2)`
- Hover: border glow + `--glow-border`

### NeonButton 霓虹按钮

**Primary (Light):**
- Background: `#00f0ff`
- Text: `#0a0a12`
- Border-radius: `--radius-full`
- Hover: scale(1.02) + 轻微阴影

**Primary (Night):**
- Background: `transparent`
- Border: `1px solid #ff2d78`
- Text: `#ff2d78`
- Text-shadow: `--glow-text-primary`
- Hover: `box-shadow: --glow-primary`

**Secondary (Light):**
- Background: `rgba(255,255,255,0.1)`
- Border: `1px solid #d300bd`
- Backdrop-filter: `blur(10px)`

**Secondary (Night):**
- Background: `transparent`
- Border: `1px solid #00ffcc`
- Text: `#00ffcc`
- Hover: `box-shadow: --glow-secondary`

### PillTag 胶囊标签

- Border-radius: `--radius-full`
- Padding: `4px 12px`
- Font: `label-caps`
- Light: 背景 `--surface-container`, 文字 `--on-surface-variant`
- Night: 背景 `--surface-container`, 文字 `--secondary`, 可选 glow
- Active: Light用 `--tertiary-container`, Night用 `--secondary-container`

### GhostInput 幽灵输入框

- Background: transparent
- Border-bottom: `2px solid var(--outline-variant)`
- Focus: border-bottom 变 primary，文字发光
- Light focus glow: `0 0 8px rgba(0, 240, 255, 0.3)`
- Night focus glow: `0 0 12px rgba(255, 45, 120, 0.4)`

### BottomSheet 底部抽屉

- 从底部滑入，backdrop blur
- 高度：auto / 50% / 100%
- 拖动关闭手势支持
- 进入动画：`translateY(100%)` -> `translateY(0)`，spring
- 背景：GlassCard 样式

### ViewToggle 视图切换

三种模式图标按钮组：
1. **Compact**: 仅标题（小卡片）
2. **Standard**: 标题+概述（中卡片）
3. **Rich**: 标题+概述+图片（大卡片）

切换动画：卡片尺寸变化使用 layout animation

## 页面布局规范

### AppShell 应用外壳

```
+------------------+
|   Status Bar     |  <- Capacitor管理
+------------------+
|    Top Bar       |  <- 标题 + 操作按钮，高度 56px
+------------------+
|                  |
|   Main Content   |  <- 页面内容，可滚动
|                  |
+------------------+
|  Bottom Nav      |  <- 5个Tab，高度 64px + safe-area
+------------------+
|   Safe Area      |  <- 底部安全区域
+------------------+
```

### 底部导航 Tab 定义

| 图标 | 标签 | 路由 |
|------|------|------|
| 脑图图标 | 脑图 | `/mindmap` |
| 文章图标 | 文章 | `/articles` |
| 加号图标 | 捕获 | `/capture`（底部弹出菜单） |
| 对话图标 | AI | `/chat` |
| 设置图标 | 设置 | `/settings` |

## 交互反馈规范

### 触觉反馈（Haptics）

| 场景 | 反馈类型 |
|------|----------|
| 按钮点击 | Light Impact |
| 截图成功 | Medium Impact |
| 删除确认 | Heavy Impact |
| 发布成功 | Success Notification |
| 错误提示 | Error Notification |

### 视觉反馈

| 场景 | 效果 |
|------|------|
| 按钮 hover | scale(1.02) + 颜色变化 |
| 按钮 active/press | scale(0.96) + 200ms |
| 卡片 hover | border 发光 + 轻微上浮 translateY(-2px) |
| 列表项进入 | stagger 动画，从 opacity:0, y:20 |
| 页面切换 | slide + fade，300ms spring |
| 刷新/加载 | 骨架屏 shimmer 效果 |
| 拖拽排序 | scale(1.05) + shadow 增强 |
| 开关切换 | 弹簧动画，圆点带拖尾 |

## 响应式断点

由于主要是移动端应用，断点较少：

| 名称 | 宽度 | 说明 |
|------|------|------|
| Mobile | < 600px | 主要目标，单列布局 |
| Tablet | 600px - 900px | 平板，可选双列 |
| Desktop | > 900px | 桌面预览，最大宽度 480px 居中 |

## 无障碍规范

- 所有交互元素最小 44x44px 触控区域
- 颜色对比度 >= 4.5:1（文字）
- 支持 prefers-reduced-motion 减少动画
- 语义化 HTML + ARIA 标签
- 键盘导航支持（桌面调试）
