/**
 * Mock Data Generator for Development
 * Generates rich Markdown content to showcase all rendering features.
 */

import { SOURCE_TYPES } from './constants';

const MOCK_TITLES = [
  '如何构建高效的第二大脑系统',
  'AI辅助写作的五个关键原则',
  '深度工作：在碎片化时代保持专注',
  '知识管理的终极形态是什么',
  '从信息囤积到知识创造的转变',
  '费曼技巧：用最简单的话解释复杂概念',
  '笔记链接的力量：为什么你的笔记需要网络',
  '认知卸载：让外部系统为你记忆',
  '渐进式总结：构建可复用的知识资产',
  'Zettelkasten方法完全指南',
  '数字花园：种植你的知识树',
  '卡片笔记写作法实践心得',
  '信息筛选的艺术：在海量内容中找到金矿',
  '用AI重塑个人知识工作流',
  '思维导图 vs 概念图：选择你的思考工具',
  '构建个人Wiki：从消费者到创造者',
  '阅读笔记的最佳实践分享',
  '如何让知识真正为你所用',
  '创意产生的秘诀：连接不同的想法',
  '学习即连接：神经科学与知识管理',
];

const MOCK_SUMMARIES = [
  '本文探讨了如何利用现代工具和方法论构建一个高效的个人信息管理系统，让知识真正服务于创造力。',
  '通过分析多个成功案例，总结出AI辅助写作中最重要的五个原则，帮助提升内容质量与创作效率。',
  '在注意力经济时代，深度工作的能力变得稀缺且珍贵。文章分享了实践深度工作的具体策略。',
  '从图书馆到数字笔记，知识管理工具不断演进。但终极形态或许是让AI成为你的知识伙伴。',
  '大多数人陷入了信息囤积的陷阱。本文提供了从被动收集到主动创造的转变路径。',
  '费曼技巧不仅是一种学习方法，更是一种思维方式。通过教别人来检验自己的理解深度。',
  '孤立的信息没有价值，只有当它们被连接起来，形成网络，才能产生新的洞见。',
  '人脑的记忆容量有限，认知卸载让我们把记忆外包给系统，释放大脑用于思考。',
  '渐进式总结是一种分层的笔记方法，让你在不同深度都能快速找到所需信息。',
  '德国社会学家Niklas Luhmann的卡片盒方法如何帮助他出版了70多本书。',
  '数字花园是一种公开的、不断演化的笔记系统，介于个人笔记和博客之间。',
  '实践卡片笔记写作法三年后的反思，哪些方法有效，哪些需要调整。',
  '信息过载时代，筛选能力比收集能力更重要。建立你的信息过滤系统。',
  'AI不仅是工具，更是思维伙伴。如何让AI深度融入你的知识工作流。',
  '思维导图适合发散思考，概念图适合建立关联。了解它们的区别和适用场景。',
  '从知识的消费者转变为创造者，个人Wiki是一个绝佳的起点。',
  '分享我的阅读笔记模板和工作流，以及如何让笔记真正产生价值。',
  '知识不是存在笔记里，而是体现在行动中。让知识指导决策的方法。',
  '创意不是凭空产生的，而是已有想法的新组合。建立你的创意触发器。',
  '神经科学研究表明，学习本质上是建立新的神经连接。这与知识管理何其相似。',
];

const MOCK_TAGS = [
  { name: '知识管理', color: '#00f0ff' },
  { name: 'AI', color: '#ff00e5' },
  { name: '笔记方法', color: '#adff00' },
  { name: '效率', color: '#006970' },
  { name: '学习', color: '#a90097' },
  { name: '写作', color: '#456800' },
  { name: '思维', color: '#ff2d78' },
  { name: '工具', color: '#00ffcc' },
  { name: '阅读', color: '#ffe04a' },
  { name: '创意', color: '#ba1a1a' },
];

const MOCK_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
];

function randomPick(arr, count = 1) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

function randomDate(daysBack = 60) {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return past.toISOString();
}

// Rich Markdown templates to showcase all MarkdownRenderer features
const RICH_MARKDOWN_TEMPLATES = [
  // Template 0: Headings + lists + bold/italic + quote
  (title, summary) => `# ${title}

> *"知识管理不是关于存储更多信息，而是关于在正确的时间找到正确的想法。"*

${summary}

## 核心要点

构建第二大脑系统需要关注以下三个层面：

1. **捕获层** — 快速收集任何值得记录的信息
2. **处理层** — 定期回顾并提炼核心洞见
3. **输出层** — 将知识转化为可分享的内容

### 捕获工具对比

| 工具 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| 剪藏插件 | 网页文章 | 一键保存 | 格式混乱 |
| 语音输入 | 灵感闪现 | 速度快 | 需后期整理 |
| 手写笔记 | 深度阅读 | 记忆深刻 | 检索困难 |

---

## 实践建议

- *每天*花 10 分钟回顾当日捕获的内容
- **每周**进行一次"渐进式总结"，提炼核心观点
- 每月输出至少一篇完整的文章或笔记

记住：***完美的系统不存在，持续迭代才是关键。***`,

  // Template 1: Code blocks + inline code + tables
  (title, summary) => `# ${title}

${summary}

## 五个关键原则

### 1. 明确意图

在开始写作前，先问自己：

\`\`\`markdown
## 写作检查清单
- [ ] 目标读者是谁？
- [ ] 核心观点是什么？
- [ ] 希望读者采取什么行动？
\`\`\`

### 2. 结构化表达

使用\`标题层级\`来组织内容，让读者能快速扫描：

\`\`\`javascript
// 示例：文章结构生成器
function generateOutline(topic) {
  return {
    introduction: '为什么' + topic + '很重要',
    body: ['核心概念', '实践方法', '常见误区'],
    conclusion: '下一步行动'
  };
}
\`\`\`

### 3. 数据驱动

用表格呈现对比信息：

| 原则 | 描述 | 优先级 |
|------|------|--------|
| 意图明确 | 写作前定义目标 | P0 |
| 结构清晰 | 使用大纲组织 | P0 |
| 数据支撑 | 引用可靠来源 | P1 |
| 迭代优化 | 多次修改打磨 | P1 |
| 读者视角 | 站在读者角度 | P2 |

---

> **提示**：AI 是助手而非替代者。最好的内容诞生于人机协作。`,

  // Template 2: Deep work strategies with nested lists
  (title, summary) => `# ${title}

${summary}

## 深度工作的四个策略

## 1. 时间块管理

将一天划分为不同的时间块：

- **深度工作时间**
  - 早晨 2 小时（无干扰）
  - 下午 1 小时（专注单一任务）
- *浅层工作时间*
  - 回复邮件和消息
  - 参加会议
- **恢复时间**
  - 冥想或散步
  - 完全脱离工作

## 2. 环境设计

创建一个支持专注的物理和数字环境：

1. 物理环境
   1. 清理桌面，只保留当前任务所需物品
   2. 使用降噪耳机或白噪音
   3. 调整光线，避免眩光
2. 数字环境
   1. 关闭所有非必要通知
   2. 使用网站拦截器（如 *Cold Turkey*）
   3. 将手机放到另一个房间

## 3. 仪式感

建立进入深度工作的固定仪式：

\`\`\`markdown
1. 倒一杯咖啡或茶
2. 戴上耳机播放专注音乐
3. 设定计时器（推荐 50 分钟）
4. 在纸上写下"如果分心，记下来继续"
5. 开始工作
\`\`\`

---

*深度工作不是天赋，而是一种可以训练的能力。*`,

  // Template 3: Knowledge management with images and blockquotes
  (title, summary) => `# ${title}

${summary}

## 知识管理的演进

> *"我们生活在一个信息丰富但知识贫乏的时代。"*
> —— 某知名知识管理学者

### 从收藏到创造

很多人把知识管理误解为**信息收藏**。真正的知识管理是一个创造过程：

\`\`\`
信息 → 捕获 → 处理 → 连接 → 创造 → 分享
\`\`\`

### 关键转变

| 旧模式 | 新模式 |
|--------|--------|
| 收藏文章 | 提取洞见 |
| 复制粘贴 | 用自己的话重写 |
| 孤立笔记 | 双向链接 |
| 完美分类 | 渐进式组织 |

### 推荐工具栈

1. **捕获**: Readwise Reader, Instapaper
2. **处理**: Obsidian, Notion
3. **输出**: 博客, Newsletter
4. **分发**: Twitter, 即刻

---

![知识管理循环图](${MOCK_IMAGE_URLS[0]})

> 建立一个持续迭代的知识管理系统，比追求完美的初始设置更重要。`,

  // Template 4: Feynman technique with steps
  (title, summary) => `# ${title}

${summary}

## 费曼技巧的四个步骤

### 步骤一：选择一个概念

选择你想要深入理解的概念。把它写在一张纸的**顶端**。

### 步骤二：假装教给别人

用*最简单*的语言解释这个概念，就像你在教一个 12 岁的孩子：

\`\`\`markdown
- 避免使用专业术语
- 使用类比和比喻
- 用具体例子代替抽象定义
\`\`\`

### 步骤三：发现知识缺口

在解释过程中，你会发现自己**卡住的地方**。这些就是你的知识缺口：

1. 哪些部分解释不清楚？
2. 哪些术语你其实不理解？
3. 类比是否准确？

### 步骤四：简化和类比

回到原始材料，填补知识缺口。然后**简化**你的解释：

| 复杂度 | 改进方法 |
|--------|----------|
| 术语过多 | 替换为日常语言 |
| 逻辑跳跃 | 补充中间步骤 |
| 缺乏例子 | 添加具体场景 |

---

> **核心洞察**：如果你不能用简单的语言解释一个概念，说明你还没有真正理解它。

*费曼技巧的本质是\`诚实\`——诚实地面对自己的无知。*`,

  // Template 5: Networked thinking with links and emphasis
  (title, summary) => `# ${title}

${summary}

## 为什么笔记需要网络

### 孤立笔记的问题

传统的笔记方法把信息存储在**孤立的文件夹**中：

\`\`\`
📁 工作/
  ├── 会议记录.md
  ├── 项目计划.md
📁 学习/
  ├── 读书笔记.md
  ├── 课程笔记.md
\`\`\`

这种结构的问题是：**知识被割裂了**。

### 网络化的力量

当笔记之间建立*双向链接*，新的洞见会自然浮现：

\`\`\`markdown
- [[会议记录]] 中提到的策略与 [[读书笔记]] 中的理论相呼应
- [[项目计划]] 可以借鉴 [[课程笔记]] 中的方法论
- 通过反链发现：哪些笔记引用了这个概念？
\`\`\`

### 实践建议

1. **每次新建笔记时**，思考：它与我已有的哪些笔记相关？
2. **定期回顾**图谱视图，发现意外的连接
3. **不要过度链接**——只建立真正有意义的关联

### 常见误区

| 误区 | 正确做法 |
|------|----------|
| 链接所有内容 | 只链接有实质关联的 |
| 追求完美的分类 | 让连接自然生长 |
| 忽视孤立笔记 | 定期清理无连接笔记 |

---

笔记网络的价值在于**涌现性**——整体大于部分之和。`,

  // Template 6: Cognitive offloading
  (title, summary) => `# ${title}

${summary}

## 什么是认知卸载

认知卸载（Cognitive Offloading）是指将**记忆和计算任务**外包给外部系统，从而释放大脑的认知资源用于更高层次的思考。

### 人脑的局限

科学研究显示：

- 工作记忆容量约为 *4±1 个组块*
- 短期记忆只能保持约 **20-30 秒**
- 多任务切换会显著降低效率

\`\`\`markdown
> 我们的大脑是为思考而生，不是为了存储。
\`\`\`

### 卸载策略矩阵

| 认知任务 | 外部工具 | 示例 |
|----------|----------|------|
| 信息存储 | 笔记系统 | Obsidian, Notion |
| 任务提醒 | 日历/待办 | Google Calendar, Todoist |
| 复杂计算 | 计算器/代码 | Python, Excel |
| 创意发散 | 思维导图 | XMind, Miro |
| 长期记忆 | 间隔重复 | Anki, RemNote |

### 实施步骤

1. **识别**占用你大量脑力的重复性任务
2. **选择**合适的外部工具来承载这些任务
3. **建立**使用习惯，让工具成为延伸
4. **定期**审视和优化你的外部系统

---

*当外部系统承担了记忆负担，大脑才能真正自由地创造。*`,

  // Template 7: Progressive summarization
  (title, summary) => `# ${title}

${summary}

## 渐进式总结的五个层次

渐进式总结是由 *Tiago Forte* 提出的一种分层笔记方法。

### 层次结构

\`\`\`markdown
Layer 0: 原始捕获（全文保存）
Layer 1: 初次阅读（高亮关键段落）
Layer 2: 二次阅读（高亮高亮中的精华）
Layer 3: 总结（用自己的话写摘要）
Layer 4: 提炼（创造一个引人注目的标题）
Layer 5: 融合（与其他笔记建立连接）
\`\`\`

### 为什么要分层？

| 层次 | 时间投入 | 使用场景 |
|------|----------|----------|
| 0-1 | 低 | 快速浏览，判断价值 |
| 2-3 | 中 | 需要深入理解时使用 |
| 4-5 | 高 | 创作时直接引用 |

### 实践要点

1. **不要一次性完成所有层次**——根据需要使用
2. **高亮要克制**——通常不超过原文的 20%
3. **用自己的话重写**——这是检验理解的标准

---

> 渐进式总结的精髓：**在不同深度投入不同精力**。

一篇笔记可能在今天只需要 Layer 1，但半年后当你写作相关主题时，它需要提升到 Layer 4。`,

  // Template 8: Zettelkasten guide
  (title, summary) => `# ${title}

${summary}

## Zettelkasten 的核心原则

### 三种笔记类型

1. ** fleeting notes（闪念笔记）**
   - 临时性的想法记录
   - 需要在 1-2 天内处理
   - *可以非常随意*

2. ** literature notes（文献笔记）**
   - 阅读时的理解和摘录
   - **必须用自己的话写**
   - 标注出处

3. ** permanent notes（永久笔记）**
   - 原子化的独立观点
   - 可以脱离上下文理解
   - 与其他永久笔记连接

### 永久笔记的标准格式

\`\`\`markdown
# 笔记标题

- **来源**: [[文献笔记]] 或 [[闪念笔记]]
- **相关**: [[相关笔记1]], [[相关笔记2]]

核心观点用一段完整的话表达。

可以包含例子或类比。
\`\`\`

### 连接规则

| 规则 | 说明 |
|------|------|
| 一个想法一条笔记 | 保持原子化 |
| 用自己的话写 | 确保真正理解 |
| 建立上下文连接 | 链接到相关笔记 |
| 定期回顾图谱 | 发现新的洞见 |

---

Niklas Luhmann 一生积累了 **90,000** 张卡片，出版了 70 多本书。他的成功不在于卡片数量，而在于**连接的质量**。`,

  // Template 9: Digital garden
  (title, summary) => `# ${title}

${summary}

## 数字花园 vs 博客

| 特征 | 博客 | 数字花园 |
|------|------|----------|
| 发布频率 | 定期 | 持续演化 |
| 内容状态 | 完成品 | 进行中的工作 |
| 组织方式 | 时间线 | 主题网络 |
| 完美主义 | 高 | 低 |
| 读者期望 | 完整文章 | 碎片化想法 |

### 数字花园的哲学

> *"种下一颗种子，让它慢慢生长。"*

数字花园的核心是**公开思考**：

1. 分享**未完成的**想法
2. 允许笔记**随时间演化**
3. 用*双向链接*替代严格的分类
4. 关注**想法的连接**而非孤立的文章

### 技术栈推荐

\`\`\`markdown
- 简单起步: Notion 公开页面
- 进阶选择: Obsidian + Publish
- 极客方案: Next.js + MDX + 自定义图谱
- 平衡之选: Docusaurus, Quartz
\`\`\`

### 维护建议

- 每周花时间"修剪"旧笔记
- 标记笔记的成熟度：\`seedling\` → \`budding\` → \`evergreen\`
- 不要害怕删除或大幅修改旧内容

---

*数字花园不是展示完美知识的地方，而是记录思考过程的空间。*`,
];

function generateRichMarkdownContent(index, title, summary) {
  const template = RICH_MARKDOWN_TEMPLATES[index % RICH_MARKDOWN_TEMPLATES.length];
  return template(title, summary);
}

export function generateMockArticles(count = 20) {
  const articles = [];
  for (let i = 0; i < count; i++) {
    const titleIdx = i % MOCK_TITLES.length;
    const summaryIdx = i % MOCK_SUMMARIES.length;
    const tagCount = Math.floor(Math.random() * 3) + 1;
    const pickedTags = randomPick(MOCK_TAGS, tagCount);
    const tags = Array.isArray(pickedTags) ? pickedTags.map((t) => t.name) : [pickedTags.name];
    const sourceTypes = Object.values(SOURCE_TYPES);
    const sourceType = sourceTypes[i % sourceTypes.length];
    const title = MOCK_TITLES[titleIdx];
    const summary = MOCK_SUMMARIES[summaryIdx];

    // Generate rich Markdown content with embedded image references for some articles
    let content = generateRichMarkdownContent(i, title, summary);

    // Add inline markdown images for ~30% articles to test image rendering inside Markdown
    if (i % 3 === 0) {
      const imgUrl = MOCK_IMAGE_URLS[i % MOCK_IMAGE_URLS.length];
      content += `\n\n---\n\n![相关配图](${imgUrl})\n\n*图片来源：Unsplash*`;
    }

    // Build images array for storage (used by both article image gallery and markdown renderer)
    const images = [];
    if (i % 4 === 0) {
      // 25% of articles have gallery images stored in SQLite
      const imgUrl = MOCK_IMAGE_URLS[i % MOCK_IMAGE_URLS.length];
      images.push({
        data: imgUrl,
        mimeType: 'image/jpeg',
        caption: `${title} 配图`,
      });
    }
    if (i % 7 === 0) {
      // Extra image for some articles
      const extraUrl = MOCK_IMAGE_URLS[(i + 3) % MOCK_IMAGE_URLS.length];
      images.push({
        data: extraUrl,
        mimeType: 'image/jpeg',
        caption: '补充说明图',
      });
    }

    articles.push({
      id: `article-${i + 1}`,
      title,
      summary,
      content,
      tags,
      images: images.length > 0 ? images : undefined,
      imageUrl: i % 5 === 0 ? randomPick(MOCK_IMAGE_URLS) : null,
      sourceType,
      sourceUrl: sourceType === SOURCE_TYPES.LINK ? `https://example.com/article-${i + 1}` : null,
      screenshotData: sourceType === SOURCE_TYPES.SCREENSHOT ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' : null,
      createdAt: randomDate(),
      updatedAt: randomDate(7),
      isPublished: i % 6 === 0,
      publishPlatform: i % 6 === 0 ? (i % 2 === 0 ? 'wechat' : 'zhihu') : null,
      aiGeneratedTitle: i % 2 === 0 ? title : null,
      aiGeneratedSummary: i % 2 === 0 ? summary : null,
      aiGeneratedTags: i % 2 === 0 ? tags : null,
    });
  }
  return articles;
}

export function generateMockTags() {
  return MOCK_TAGS.map((tag, i) => ({
    id: `tag-${i + 1}`,
    name: tag.name,
    color: tag.color,
    count: Math.floor(Math.random() * 10) + 1,
    createdAt: new Date().toISOString(),
  }));
}

export function generateMockUserProfile() {
  return {
    id: 'profile-1',
    style: 'analytical',
    tone: 'professional-yet-approachable',
    preferredTitleLength: 'medium',
    preferredSummaryLength: 'short',
    preferredTags: ['知识管理', 'AI', '效率', '学习'],
    avoidWords: [],
    favoriteExpressions: ['值得注意的是', '从本质上讲', '实践表明'],
    constraints: {
      titleStyle: '简洁有力，使用动词开头，偶尔使用问句',
      summaryStyle: '2-3句话，包含核心观点和行动建议',
      tagStyle: '优先使用已建立的标签体系，新标签需有明确语义',
      toneGuidelines: '专业但不枯燥，有洞见但不卖弄',
    },
    chatHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateMockAIConfigs() {
  return [
    {
      id: 'ai-1',
      provider: 'openai',
      name: 'OpenAI GPT-4o',
      apiKey: 'sk-****',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      temperature: 0.7,
      isActive: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ai-2',
      provider: 'claude',
      name: 'Claude Sonnet',
      apiKey: 'sk-ant-****',
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.5,
      isActive: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function generateMockSettings() {
  return {
    theme: 'light',
    viewMode: 'standard',
    syncEnabled: false,
    autoSync: false,
    hapticsEnabled: true,
    screenshotTrigger: 'floating',
    floatingPosition: 'right',
    floatingOpacity: 0.8,
    notificationShortcut: true,
    wechatAppId: '',
    wechatAppSecret: '',
    allowCloudUpload: false,
  };
}
