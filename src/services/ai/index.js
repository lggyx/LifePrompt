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
