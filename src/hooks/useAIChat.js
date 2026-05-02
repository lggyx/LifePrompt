/**
 * useAIChat Hook
 * React hook for AI chat with streaming support and article context
 */

import { useState, useCallback } from 'react';
import useAIStore from '../stores/useAIStore';
import { aiService } from '../services/ai';

export function useAIChat() {
  const {
    messages,
    isLoading,
    error,
    addMessage,
    clearMessages,
    setLoading,
    setError,
    resetError,
    getActiveConfig,
  } = useAIStore();

  const [streamingContent, setStreamingContent] = useState('');

  const sendMessage = useCallback(
    async (content, options = {}) => {
      if (!content.trim()) return;

      const config = getActiveConfig();
      if (!config) {
        setError('请先配置 AI 模型');
        return;
      }

      const userMsg = {
        role: 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      addMessage(userMsg);
      setLoading(true);
      setStreamingContent('');
      setError(null);

      try {
        const history = messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await aiService.chat(config, {
          messages: [...history, { role: 'user', content: content.trim() }],
          articles: options.articles,
          systemPrompt: options.systemPrompt,
          onStream: (chunk) => {
            setStreamingContent((prev) => prev + chunk);
          },
        });

        const assistantMsg = {
          role: 'assistant',
          content: response,
          model: config.model,
          createdAt: new Date().toISOString(),
        };
        addMessage(assistantMsg);
        setStreamingContent('');
      } catch (err) {
        setError(err.message || 'AI 服务调用失败');
      } finally {
        setLoading(false);
      }
    },
    [messages, addMessage, setLoading, setError, getActiveConfig]
  );

  const generateTitle = useCallback(
    async (content) => {
      const config = getActiveConfig();
      if (!config) throw new Error('未配置 AI 模型');
      return aiService.generateTitle(config, content);
    },
    [getActiveConfig]
  );

  const generateSummary = useCallback(
    async (content) => {
      const config = getActiveConfig();
      if (!config) throw new Error('未配置 AI 模型');
      return aiService.generateSummary(config, content);
    },
    [getActiveConfig]
  );

  const generateTags = useCallback(
    async (content, existingTags = []) => {
      const config = getActiveConfig();
      if (!config) throw new Error('未配置 AI 模型');
      return aiService.generateTags(config, content, existingTags);
    },
    [getActiveConfig]
  );

  const publishFormat = useCallback(
    async (article, platform) => {
      const config = getActiveConfig();
      if (!config) throw new Error('未配置 AI 模型');
      return aiService.publishFormat(config, article, platform);
    },
    [getActiveConfig]
  );

  const generateArticle = useCallback(
    async (content, sourceType = 'text') => {
      const config = getActiveConfig();
      if (!config) throw new Error('未配置 AI 模型');
      return aiService.generateArticle(config, content, sourceType);
    },
    [getActiveConfig]
  );

  const refine = useCallback(
    async (selectedText, instruction) => {
      const config = getActiveConfig();
      if (!config) throw new Error('未配置 AI 模型');
      return aiService.refine(config, selectedText, instruction);
    },
    [getActiveConfig]
  );

  const analyzeImage = useCallback(
    async (base64Image, mimeType = 'image/jpeg') => {
      const config = getActiveConfig();
      if (!config) throw new Error('未配置 AI 模型');
      return aiService.analyzeImage(config, base64Image, mimeType);
    },
    [getActiveConfig]
  );

  return {
    messages,
    isLoading,
    error,
    streamingContent,
    sendMessage,
    clearMessages,
    generateTitle,
    generateSummary,
    generateTags,
    publishFormat,
    generateArticle,
    refine,
    analyzeImage,
    resetError,
  };
}
