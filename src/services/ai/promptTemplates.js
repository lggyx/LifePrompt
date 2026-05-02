/**
 * Prompt Templates for AI operations
 */

export const PROMPT_TEMPLATES = {
  title: (content, profile) => `
请根据以下内容生成一个标题。

用户画像：
- 风格：${profile?.style || 'analytical'}
- 语气：${profile?.tone || 'professional'}
- 标题长度偏好：${profile?.preferredTitleLength || 'medium'}
- 忌讳词汇：${(profile?.avoidWords || []).join(', ') || '无'}

要求：
1. 标题简洁有力，优先使用动词开头，偶尔使用问句
2. 能准确概括内容核心
3. 符合用户画像风格

内容：
${content}

请只返回标题文本，不要有任何解释。`,

  summary: (content, profile) => `
请对以下内容生成概述。

用户画像：
- 风格：${profile?.style || 'analytical'}
- 语气：${profile?.tone || 'professional'}
- 概述长度偏好：${profile?.preferredSummaryLength || 'short'}
- 常用表达：${(profile?.favoriteExpressions || []).join(', ') || '无'}

要求：
1. 2-3句话，包含核心观点和行动建议
2. 专业但不枯燥，有洞见但不卖弄
3. 符合用户画像风格

内容：
${content}

请只返回概述文本，不要有任何解释。`,

  tags: (content, existingTags = []) => `
请为以下内容推荐标签。

已有标签库：${existingTags.join(', ') || '无'}

要求：
1. 优先使用已建立的标签体系，新标签需有明确语义
2. 推荐3-5个标签
3. 标签应准确反映内容主题

内容：
${content}

请只返回标签列表，用逗号分隔，不要有任何解释。`,

  publishWechat: (article, profile) => `
请将以下文章改写为适合微信公众号发布的格式。

用户画像：
- 风格：${profile?.style || 'analytical'}
- 语气：${profile?.tone || 'professional'}
- 常用表达：${(profile?.favoriteExpressions || []).join(', ') || '无'}

要求：
1. 标题吸引眼球但不做标题党
2. 开头有引人入胜的导语
3. 段落清晰，适合手机阅读
4. 结尾有总结或互动引导
5. 保持专业但不枯燥的语气

原文标题：${article.title}
原文概述：${article.summary}
原文内容：
${article.content}

请输出完整的公众号文章正文。`,

  chatSystem: (profile) => `
你是 LifePrompt 用户的 AI 助手，帮助用户管理知识、整理笔记、生成内容。

用户画像：
- 风格：${profile?.style || 'analytical'}
- 语气：${profile?.tone || 'professional'}

在回答时：
1. 保持专业但有亲和力的语气
2. 回答简洁，优先给出 actionable 的建议
3. 可以引用用户知识库中的相关内容
4. 使用 Markdown 格式输出`,

  chatWithArticles: (articles, profile) => {
    const articleContext = articles
      .map(
        (a, i) =>
          `[文章${i + 1}] ${a.title}\n标签：${(a.tags || []).join(', ')}\n概述：${a.summary}\n内容：${a.content?.slice(0, 500) || ''}`
      )
      .join('\n\n');

    return `
你是 LifePrompt 用户的 AI 助手。

用户画像：
- 风格：${profile?.style || 'analytical'}
- 语气：${profile?.tone || 'professional'}

以下是与用户问题相关的文章：
${articleContext}

请基于以上文章和对话历史回答用户的问题。回答应：
1. 引用相关文章内容
2. 给出结构化的建议
3. 使用 Markdown 格式
4. 保持专业但有亲和力的语气`;
  },
};

export default PROMPT_TEMPLATES;
