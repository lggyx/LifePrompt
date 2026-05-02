/**
 * Mock Data Generator for Development
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
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
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

export function generateMockArticles(count = 20) {
  const articles = [];
  for (let i = 0; i < count; i++) {
    const titleIdx = i % MOCK_TITLES.length;
    const summaryIdx = i % MOCK_SUMMARIES.length;
    const tagCount = Math.floor(Math.random() * 3) + 1;
    const tags = randomPick(MOCK_TAGS, tagCount).map(t => t.name);
    const sourceTypes = Object.values(SOURCE_TYPES);
    const sourceType = sourceTypes[i % sourceTypes.length];

    articles.push({
      id: `article-${i + 1}`,
      title: MOCK_TITLES[titleIdx],
      summary: MOCK_SUMMARIES[summaryIdx],
      content: MOCK_SUMMARIES[summaryIdx] + '\n\n' + '这是一段更详细的文章内容...\n\n'.repeat(5),
      tags,
      imageUrl: i % 3 === 0 ? randomPick(MOCK_IMAGE_URLS) : null,
      sourceType,
      sourceUrl: sourceType === SOURCE_TYPES.LINK ? `https://example.com/article-${i + 1}` : null,
      screenshotData: sourceType === SOURCE_TYPES.SCREENSHOT ? 'data:image/png;base64,iVBORw0KGgo...' : null,
      createdAt: randomDate(),
      updatedAt: randomDate(7),
      isPublished: false,
      publishPlatform: null,
      aiGeneratedTitle: MOCK_TITLES[titleIdx],
      aiGeneratedSummary: MOCK_SUMMARIES[summaryIdx],
      aiGeneratedTags: tags,
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
      isActive: true,
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
