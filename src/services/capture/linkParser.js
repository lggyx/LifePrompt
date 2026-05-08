/**
 * linkParser.js — Browser-compatible URL content extraction
 *
 * Strategy:
 *   1. Fetch HTML via Vite proxy (/api/proxy) — server-side fetch, no CORS
 *   2. Parse in-browser with regex/heuristic (no jsdom)
 *   3. For best results, use /api/extract endpoint (runs jsdom on the server)
 *
 * Pure browser module — NO Node.js-only deps.
 */

/* ======================== Heuristic extractor ======================== */

function stripTags(html) {
  return html.replace(/<[^>]+>/g, function (tag) {
    const lower = tag.toLowerCase();
    if (lower.match(/<\/?(p|div|section|article|main|h[1-6]|li|tr|td|th|blockquote)[^>]*>/)) return '\n';
    if (lower.match(/<(br|hr)[^>]*>/)) return '\n';
    if (lower.match(/<[^>]+>/)) return ' ';
    return '';
  });
}

function decodeHtml(str) {
  const map = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
  return str.replace(/&(?:[a-z]+|#\d+|#x[\da-f]+);/gi, (m) => map[m] || m);
}

function extractMetaTags(html) {
  // og:title
  const titleM = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i);
  // description
  const descM = html.match(/<meta\s+(?:name|property)=["'](?:og:)?description["']\s+content=["']([^"']*)["']/i);
  // <title>
  const titleElM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  let title = (titleM ? titleM[1] : (titleElM ? titleElM[1] : ''));
  title = decodeHtml(title.trim());
  const excerpt = descM ? decodeHtml(descM[1]) : '';
  return { title, excerpt };
}

function guessMainContent(html) {
  // Try to find content between common markers
  const bodyClose = html.lastIndexOf('</body>');
  const bodyOpen = html.indexOf('<body');
  const bodyStart = bodyOpen > 0 ? html.indexOf('>', bodyOpen) + 1 : 0;
  const bodyEnd = bodyClose > 0 ? bodyClose : html.length;
  const body = html.slice(bodyStart, bodyEnd);

  // Remove scripts, styles, navs aggressively
  const cleaned = body
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, ' ');

  return stripTags(cleaned).replace(/\s+/g, ' ').trim();
}

function textToMarkdown(raw) {
  return decodeHtml(raw)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ======================== Fetch via Vite proxy ======================== */

async function fetchHtml(url) {
  let raw = null;

  // Strategy 1: direct fetch
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const t = await res.text();
      if (t.length > 200) raw = t;
    }
  } catch { /* CORS or network blocked */ }

  // Strategy 2: Vite dev proxy
  if (!raw) {
    try {
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) raw = await res.text();
    } catch { /* proxy not available */ }
  }

  return raw;
}

/* ======================== /api/extract — server-side jsdom parsing ======================== */

/**
 * Preferred path: ask the Vite dev server to do jsdom extraction.
 * Falls back gracefully if the endpoint is unavailable.
 */
async function extractOnServer(url) {
  try {
    const res = await fetch(`/api/extract?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.content) return data;
    }
  } catch { /* not available — fall through to client-side */ }
  return null;
}

/* ======================== LinkParser — main API ======================== */

function parseLink(url) {
  return (async () => {
    const urlTrim = (url || '').trim();
    if (!urlTrim) throw new Error('请输入完整的 URL');
    try { new URL(urlTrim); }
    catch { throw new Error('请输入有效的 URL，例如 https://example.com/article'); }

    // Try server-side extraction first (jsdom, higher quality)
    const serverResult = await extractOnServer(urlTrim);

    // Fetch HTML
    const html = await fetchHtml(urlTrim);

    // Meta-info
    const { title: metaTitle, excerpt: metaExcerpt } = html
      ? extractMetaTags(html)
      : { title: new URL(urlTrim).hostname, excerpt: '' };

    // Build content
    let content = '';
    let title = metaTitle;

    if (serverResult && serverResult.content) {
      // Server-side extraction succeeded — highest quality
      content = serverResult.content;
      title = serverResult.title || metaTitle;

    } else if (html) {
      // Client-side heuristic extraction
      content = textToMarkdown(guessMainContent(html));
      title = metaTitle;

    } else {
      // Can't fetch — return helpful fallback
      return {
        title: metaTitle || new URL(urlTrim).hostname,
        content: '',
        excerpt: `无法抓取页面内容，可能该页面禁止抓取或网络受限。\n\n您可以尝试手动复制文章内容，使用「文本」捕获模式。\n\n链接：${urlTrim}`,
      };
    }

    return {
      title: title || new URL(urlTrim).hostname,
      content: content.length > 10000 ? content.slice(0, 10000) + '\n\n…[内容过长，已截断]' : content,
      excerpt: metaExcerpt,
    };
  })();
}

/* ======================== Exports ======================== */

export { parseLink };
