/**
 * Claude API Service
 */

import { AI_PROVIDERS } from '../../utils/constants';

const PROVIDER = AI_PROVIDERS.CLAUDE;

async function* streamClaude(config, body) {
  const url = `${config.baseUrl || 'https://api.anthropic.com/v1'}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: config.temperature ?? 0.7,
      stream: true,
      ...body,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => 'Unknown error');
    throw new Error(`Claude API error: ${response.status} ${err}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const data = JSON.parse(trimmed.slice(6));
          const delta = data.delta?.text;
          if (delta) yield delta;
        } catch {
          // ignore
        }
      }
    }
  }
}

async function chat(config, messages, onStream) {
  // Convert OpenAI format to Claude format
  const systemMsg = messages.find((m) => m.role === 'system');
  const nonSystem = messages.filter((m) => m.role !== 'system');

  const body = {
    messages: nonSystem.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    system: systemMsg?.content,
  };

  if (onStream) {
    let full = '';
    for await (const chunk of streamClaude(config, body)) {
      full += chunk;
      onStream(chunk);
    }
    return full;
  }

  const url = `${config.baseUrl || 'https://api.anthropic.com/v1'}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: config.temperature ?? 0.7,
      ...body,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => 'Unknown error');
    throw new Error(`Claude API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

export default {
  provider: PROVIDER,
  chat,
  stream: streamClaude,
};
