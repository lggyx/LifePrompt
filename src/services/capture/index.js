/**
 * Capture Service — unified content capture layer
 *
 * Three capture types:
 *   Text   — raw text → AI generates title+tags → structured article
 *   Link   — fetch + parse page → AI generates metadata → structured article
 *   Image  — AI image analysis → structured article
 *
 * All three modes return a uniform article object:
 *   { title, summary, content, tags, sourceType, sourceUrl, screenshotData }
 */

export const CAPTURE_TYPE = {
  TEXT: 'text',
  LINK: 'link',
  IMAGE: 'image',
};

/**
 * Main capture entry point.
 *
 * @param {string} type       'text' | 'link' | 'image'
 * @param {object} payload    Type-specific data
 * @param {object} aiConfig   Active AI config from aiConfigRepo
 * @returns {Promise<object>}
 */
async function capture(type, payload, aiConfig) {
  switch (type) {
    case CAPTURE_TYPE.TEXT:
      return captureText(payload.text, aiConfig);
    case CAPTURE_TYPE.LINK:
      return captureLink(payload.url, aiConfig);
    case CAPTURE_TYPE.IMAGE:
      return captureImage(payload.base64, payload.mimeType, payload.fileName, aiConfig);
    default:
      throw new Error(`Unknown capture type: ${type}`);
  }
}

/* ======================== TEXT ======================== */

async function captureText(text, aiConfig) {
  const trimmed = (text || '').trim();
  if (!trimmed) throw new Error('文本内容不能为空');

  const [title, tags] = await Promise.all([
    callAI('Title', '根据以下内容生成标题（最多30字），只返回标题文字。', trimmed, aiConfig),
    callAI_Tags(trimmed, aiConfig),
  ]);

  return {
    title: title || '未命名笔记',
    summary: '',
    content: trimmed,
    tags: tags || [],
    sourceType: CAPTURE_TYPE.TEXT,
    sourceUrl: null,
    screenshotData: null,
  };
}

/* ======================== LINK ======================== */

async function captureLink(url, aiConfig) {
  const urlTrim = (url || '').trim();
  if (!urlTrim) throw new Error('请输入网页链接');

  try { new URL(urlTrim); }
  catch { throw new Error('请输入有效的 URL，例如 https://example.com/article'); }

  // Step 1 — fetch + extract page content
  const { parseLink } = await import('./linkParser');
  const { title: extractedTitle, content: extractedContent, excerpt } = await parseLink(urlTrim);

  // Step 2 — AI generates metadata from extracted content
  const promptText = `以下是抓取的网页内容，请基于此生成摘要和标签。\n\n${extractedContent || excerpt || urlTrim}`;

  const [title, summary, tags] = await Promise.all([
    callAI('Title (for link)', '根据以下网页内容生成标题（最多40字），只返回标题文字。', promptText.slice(0, 500), aiConfig),
    callAI('Summary', '根据以下网页内容写一段2-3句的摘要，只返回摘要文字。', promptText.slice(0, 4000), aiConfig),
    callAI_Tags(promptText.slice(0, 6000), aiConfig),
  ]);

  const effectiveTitle = extractedTitle || title || urlTrim;

  // Build article content with source attribution
  const finalContent = extractedContent
    ? `> **来源：** ${urlTrim}\n\n${excerpt || extractedContent.slice(0, 500)}...\n\n---\n\n${extractedContent}`
    : `> **来源：** ${urlTrim}\n\n${excerpt || ''}`;

  return {
    title: effectiveTitle.slice(0, 200),
    summary: summary || excerpt || '',
    content: finalContent,
    tags: tags || [],
    sourceType: CAPTURE_TYPE.LINK,
    sourceUrl: urlTrim,
    screenshotData: null,
  };
}

/* ======================== IMAGE ======================== */

async function captureImage(base64, mimeType, _fileName, aiConfig) {
  if (!base64) throw new Error('请先选择图片');

  const dataUrl = base64.startsWith('data:')
    ? base64
    : `data:${mimeType || 'image/jpeg'};base64,${base64}`;

  // Route to the appropriate AI provider's image analysis
  const { aiService } = await import('../ai');
  const result = await aiService.analyzeImage(aiConfig, dataUrl, mimeType || 'image/jpeg');

  return {
    title: result.title,
    summary: result.summary,
    content: result.content,
    tags: result.tags || [],
    sourceType: CAPTURE_TYPE.IMAGE,
    sourceUrl: null,
    screenshotData: dataUrl,
  };
}

/* ======================== LOW-LEVEL AI CALLS ======================== */

function getBaseUrl(aiConfig) {
  return (aiConfig?.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
}

async function callChat(aiConfig, messages) {
  const baseUrl = getBaseUrl(aiConfig);
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aiConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: aiConfig.model || 'gpt-4o',
      temperature: 0.5,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

async function callAI(label, systemPrompt, userText, aiConfig) {
  if (!(aiConfig && aiConfig.apiKey)) return '';
  try {
    return await callChat(aiConfig, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userText },
    ]);
  } catch (_e) {
    return '';
  }
}

async function callAI_Tags(content, aiConfig) {
  if (!(aiConfig && aiConfig.apiKey)) return [];
  try {
    const raw = await callChat(aiConfig, [
      { role: 'system', content: '推荐3-5个标签，用逗号分隔，只返回标签文字。' },
      { role: 'user', content },
    ]);
    return raw.split(/[,，、\n]/).map((t) => t.trim()).filter(Boolean).slice(0, 5);
  } catch {
    return [];
  }
}

/* ======================== EXPORTS ======================== */

export const CaptureService = {
  capture,
  captureText,
  captureLink,
  captureImage,
};

export default CaptureService;
