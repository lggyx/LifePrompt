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

  generateArticle: (content, sourceType, profile) => `
请根据以下${sourceType === 'link' ? '网页链接内容' : sourceType === 'image' ? '图片内容描述' : '文本内容'}，生成一篇完整的文章，并以严格JSON格式返回。

用户画像：
- 风格：${profile?.style || 'analytical'}
- 语气：${profile?.tone || 'professional'}
- 标题长度偏好：${profile?.preferredTitleLength || 'medium'}
- 概述长度偏好：${profile?.preferredSummaryLength || 'short'}
- 常用表达：${(profile?.favoriteExpressions || []).join(', ') || '无'}
- 忌讳词汇：${(profile?.avoidWords || []).join(', ') || '无'}

要求：
1. 标题简洁有力，能准确概括内容核心
2. 摘要2-3句话，包含核心观点和行动建议
3. 正文内容基于原始输入进行扩展，结构清晰，使用 Markdown 格式
4. 推荐3-5个标签，优先使用语义明确的词汇
5. 符合用户画像风格与语气
6. 严格按以下JSON格式返回，不要添加任何其他解释或 markdown 代码块包裹

{
  "title": "文章标题",
  "summary": "文章摘要",
  "content": "正文内容（Markdown格式）",
  "tags": ["标签1", "标签2", "标签3"]
}

原始内容：
${content}`,

  refine: (selectedText, instruction, profile) => `
请根据用户的修改指令，对以下段落进行改写。

用户画像：
- 风格：${profile?.style || 'analytical'}
- 语气：${profile?.tone || 'professional'}
- 常用表达：${(profile?.favoriteExpressions || []).join(', ') || '无'}
- 忌讳词汇：${(profile?.avoidWords || []).join(', ') || '无'}

修改指令：${instruction}

原文段落：
${selectedText}

要求：
1. 只返回改写后的段落文本
2. 不要添加任何解释、前缀或后缀
3. 保持 Markdown 格式一致
4. 符合用户画像风格与语气`,

analyzeImage: (profile) => `
请分析这张图片的内容，生成一篇知识笔记，并以严格JSON格式返回。

用户画像：
- 风格：${profile?.style || 'analytical'}
- 语气：${profile?.tone || 'professional'}
- 标题长度偏好：${profile?.preferredTitleLength || 'medium'}
- 概述长度偏好：${profile?.preferredSummaryLength || 'short'}
- 常用表达：${(profile?.favoriteExpressions || []).join(', ') || '无'}
- 忌讳词汇：${(profile?.avoidWords || []).join(', ') || '无'}

要求：
1. title：简洁有力、准确概括图片核心内容的标题
2. summary：2-3句话，描述图片中的关键信息和价值
3. content：对图片内容的详细解读和延伸思考，使用 Markdown 格式，可以包含：
 - 图片中可见的关键元素描述
 - 你的理解和联想
 -  actionable 的后续建议或笔记
4. tags：3-5个标签，反映图片主题和内容类型
5. 严格按以下JSON格式返回，不要添加任何其他解释或 markdown 代码块包裹

{
"title": "笔记标题",
"summary": "笔记摘要",
"content": "详细内容（Markdown格式）",
"tags": ["标签1", "标签2", "标签3"]
}`,
};

export default PROMPT_TEMPLATES;
