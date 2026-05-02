/**
 * AI Service Unified Entry
 * Provides model-agnostic AI operations
 */

import { AI_PROVIDERS } from '../../utils/constants';
import openai from './openai';
import claude from './claude';
import qianwen from './qianwen';
import kimi from './kimi';
import PROMPT_TEMPLATES from './promptTemplates';
import { profileEngine } from './profileEngine';

const providers = {
  [AI_PROVIDERS.OPENAI]: openai,
  [AI_PROVIDERS.CLAUDE]: claude,
  [AI_PROVIDERS.QIANWEN]: qianwen,
  [AI_PROVIDERS.KIMI]: kimi,
  [AI_PROVIDERS.CUSTOM]: openai, // OpenAI-compatible custom endpoints
};

function getProvider(config) {
  const p = providers[config.provider];
  if (!p) throw new Error(`Unknown provider: ${config.provider}`);
  return p;
}

export const aiService = {
  async chat(config, options = {}) {
    const provider = getProvider(config);
    const profile = profileEngine.getProfile();

    const systemPrompt =
      options.systemPrompt ||
      (options.articles?.length > 0
        ? PROMPT_TEMPLATES.chatWithArticles(options.articles, profile)
        : PROMPT_TEMPLATES.chatSystem(profile));

    const messages = [{ role: 'system', content: systemPrompt }, ...options.messages];

    return provider.chat(config, messages, options.onStream);
  },

  async generateTitle(config, content) {
    const provider = getProvider(config);
    const profile = profileEngine.getProfile();
    const prompt = profileEngine.applyConstraints(
      PROMPT_TEMPLATES.title(content, profile),
      'title'
    );

    const messages = [
      { role: 'system', content: '你是一个专业的标题生成助手。' },
      { role: 'user', content: prompt },
    ];

    const result = await provider.chat(config, messages);
    return result.trim();
  },

  async generateSummary(config, content) {
    const provider = getProvider(config);
    const profile = profileEngine.getProfile();
    const prompt = profileEngine.applyConstraints(
      PROMPT_TEMPLATES.summary(content, profile),
      'summary'
    );

    const messages = [
      { role: 'system', content: '你是一个专业的内容概述助手。' },
      { role: 'user', content: prompt },
    ];

    const result = await provider.chat(config, messages);
    return result.trim();
  },

  async generateTags(config, content, existingTags = []) {
    const provider = getProvider(config);
    const profile = profileEngine.getProfile();
    const prompt = profileEngine.applyConstraints(
      PROMPT_TEMPLATES.tags(content, existingTags),
      'tags'
    );

    const messages = [
      { role: 'system', content: '你是一个专业的标签推荐助手。' },
      { role: 'user', content: prompt },
    ];

    const result = await provider.chat(config, messages);
    return result
      .split(/[,，、\n]/)
      .map((t) => t.trim())
      .filter(Boolean);
  },

  async publishFormat(config, article, platform) {
    const provider = getProvider(config);
    const profile = profileEngine.getProfile();

    let prompt;
    if (platform === 'wechat') {
      prompt = PROMPT_TEMPLATES.publishWechat(article, profile);
    } else {
      prompt = `请将以下文章改写为适合发布的格式。\n\n标题：${article.title}\n内容：${article.content}`;
    }

    const messages = [
      { role: 'system', content: '你是一个专业的内容编辑助手。' },
      { role: 'user', content: prompt },
    ];

    return provider.chat(config, messages);
  },

  async generateArticle(config, content, sourceType = 'text') {
    const provider = getProvider(config);
    const profile = profileEngine.getProfile();

    const prompt = profileEngine.applyConstraints(
      PROMPT_TEMPLATES.generateArticle(content, sourceType, profile),
      'generateArticle'
    );

    const messages = [
      { role: 'system', content: '你是一个专业的内容创作助手，严格以 JSON 格式返回结果。' },
      { role: 'user', content: prompt },
    ];

    const result = await provider.chat(config, messages);

    // Try to extract JSON from response
    let jsonStr = result.trim();
    // Remove markdown code block if present
    if (jsonStr.startsWith('```')) {
      const firstLineEnd = jsonStr.indexOf('\n');
      if (firstLineEnd !== -1) {
        jsonStr = jsonStr.slice(firstLineEnd);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3).trim();
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fallback: try to find the first JSON object
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('AI 返回格式错误，无法解析 JSON');
      }
    }

    return {
      title: parsed.title || '',
      summary: parsed.summary || '',
      content: parsed.content || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };
  },

  async refine(config, selectedText, instruction) {
    const provider = getProvider(config);
    const profile = profileEngine.getProfile();

    const prompt = PROMPT_TEMPLATES.refine(selectedText, instruction, profile);

    const messages = [
      { role: 'system', content: '你是一个专业的文本编辑助手，只返回改写后的文本。' },
      { role: 'user', content: prompt },
    ];

    const result = await provider.chat(config, messages);
    return result.trim();
  },

  async analyzeImage(config, base64Image, mimeType = 'image/jpeg') {
    const provider = getProvider(config);
    const profile = profileEngine.getProfile();

    const prompt = profileEngine.applyConstraints(
      PROMPT_TEMPLATES.analyzeImage(profile),
      'analyzeImage'
    );

    // Build multimodal message content
    const content = [
      { type: 'text', text: prompt },
      {
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64Image}` },
      },
    ];

    const messages = [
      { role: 'system', content: '你是一个专业的视觉内容分析助手，严格以 JSON 格式返回结果。' },
      { role: 'user', content },
    ];

    const result = await provider.chat(config, messages);

    // Extract JSON from response
    let jsonStr = result.trim();
    if (jsonStr.startsWith('```')) {
      const firstLineEnd = jsonStr.indexOf('\n');
      if (firstLineEnd !== -1) jsonStr = jsonStr.slice(firstLineEnd);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3).trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('AI 返回格式错误，无法解析 JSON');
      }
    }

    return {
      title: parsed.title || '',
      summary: parsed.summary || '',
      content: parsed.content || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };
  },

  async testConnection(config) {
    try {
      const provider = getProvider(config);
      const messages = [{ role: 'user', content: 'Hello, reply "OK" only.' }];
      const result = await provider.chat(config, messages);
      return { success: true, message: result };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
};

export default aiService;
