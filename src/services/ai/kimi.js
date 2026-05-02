/**
 * Kimi (Moonshot) API Service
 * OpenAI-compatible API format
 */

import { AI_PROVIDERS } from '../../utils/constants';

const PROVIDER = AI_PROVIDERS.KIMI;

async function* streamKimi(config, body) {
  const url = `${config.baseUrl || 'https://api.moonshot.cn/v1'}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'moonshot-v1-8k',
      temperature: config.temperature ?? 0.7,
      stream: true,
      ...body,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => 'Unknown error');
    throw new Error(`Kimi API error: ${response.status} ${err}`);
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
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const data = JSON.parse(trimmed.slice(6));
          const delta = data.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // ignore malformed JSON
        }
      }
    }
  }
}

async function chat(config, messages, onStream) {
  if (onStream) {
    let full = '';
    for await (const chunk of streamKimi(config, { messages })) {
      full += chunk;
      onStream(chunk);
    }
    return full;
  }

  const url = `${config.baseUrl || 'https://api.moonshot.cn/v1'}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'moonshot-v1-8k',
      temperature: config.temperature ?? 0.7,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => 'Unknown error');
    throw new Error(`Kimi API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export default {
  provider: PROVIDER,
  chat,
  stream: streamKimi,
};
