/**
 * Link Parser — fetch + extract main content from web pages
 *
 * Flow:
 *   1. Try direct browser fetch (works for CORS-permissive sites)
 *   2. Fall back to Vite dev server /api/proxy (server-side fetch, no CORS)
 *   3. Parse HTML with jsdom → rule-based extraction → Markdown
 */

/* ======================== jsdom-backed extractor ======================== */

/** Build a jsdom JSDOM instance (loaded lazily to keep bundle lean) */
async function getJSDOM(html, url) {
  const { JSDOM } = await import('jsdom');
  return new JSDOM(html, { url });
}

/* ======================== HTML → Markdown converter ======================== */

const BLOCK_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'div', 'section', 'article', 'main',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'blockquote', 'pre', 'table', 'tbody', 'tr', 'td', 'th',
]);
const SKIP_TAGS = new Set([
  'script', 'style', 'noscript', 'template', 'svg', 'nav',
  'header', 'footer', 'aside', 'iframe', 'form', 'button',
  'input', 'select', 'textarea',
]);

function htmlToText(node, chunks) {
  if (node.nodeType === 3) {
    const t = node.textContent;
    if (t) chunks.push(t);
    return;
  }
  if (node.nodeType !== 1) return;

  const tag = node.tagName.toLowerCase();
  if (SKIP_TAGS.has(tag)) return;
  if (/^(meta|link|title)$/i.test(tag)) return;

  const isBlock = BLOCK_TAGS.has(tag);
  if (isBlock) chunks.push('\n\n');

  switch (tag) {
    case 'h1': chunks.push('# '); break;
    case 'h2': chunks.push('## '); break;
    case 'h3': chunks.push('### '); break;
    case 'h4': chunks.push('#### '); break;
    case 'h5': chunks.push('##### '); break;
    case 'h6': chunks.push('###### '); break;
    case 'strong': case 'b': chunks.push('**'); break;
    case 'em': case 'i': chunks.push('*'); break;
    case 'code': chunks.push('`'); break;
    case 'pre': chunks.push('```\n'); break;
    case 'a': chunks.push('['); break;
    case 'img': chunks.push(`![${node.alt || ''}](${node.src || ''})`); return;
    case 'br': chunks.push('\n'); return;
    case 'hr': chunks.push('\n---\n'); return;
    case 'blockquote': chunks.push('\n> '); return;
  }

  for (const child of node.childNodes) htmlToText(child, chunks);

  switch (tag) {
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      chunks.push('\n'); break;
    case 'strong': case 'b': chunks.push('**'); break;
    case 'em': case 'i': chunks.push('*'); break;
    case 'code': chunks.push('`'); break;
    case 'pre': chunks.push('\n```'); break;
    case 'a': chunks.push(`](${node.getAttribute('href') || ''})`); break;
    case 'blockquote': chunks.push('\n'); break;
    case 'p': case 'div': case 'section':
    case 'tr': case 'td': case 'th': chunks.push('\n'); break;
  }
}

function domToMarkdown(root) {
  const chunks = [];
  for (const child of root.childNodes) htmlToText(child, chunks);
  return chunks.join('').replace(/\n{3,}/g, '\n\n').trim();
}

/* ======================== Heuristic extraction ======================== */

function findMainEl(doc) {
  const selectors = [
    'article', 'main', '[role="main"]',
    '.post-content', '.article-content', '.entry-content',
    '.article-body', '.post-body', '.content-body',
    '#main', '#content',
  ];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el && el.textContent.trim().length > 200) return el;
  }
  return doc.body;
}

function stripNoise(el) {
  const bad = [
    'nav', 'header', 'footer', 'aside', 'iframe', 'noscript', 'style',
    'script', 'svg', 'form', 'button', 'input', 'select', 'textarea',
  ];
  bad.forEach((t) => { try { el.querySelectorAll(t).forEach((n) => n.remove()); } catch {} });
  try {
    el.querySelectorAll('[class*="comment"],[class*="sidebar"],[class*="menu"],[class*="cookie"],[class*="banner"]').forEach((n) => n.remove());
  } catch {}
  return el;
}

function readMeta(doc) {
  const ogTitle = doc.querySelector('meta[property="og:title"]');
  const metaDesc = doc.querySelector('meta[name="description"]');
  const titleEl = doc.querySelector('title');
  let title = titleEl ? titleEl.textContent.trim() : '';
  if (ogTitle && 'content' in ogTitle && ogTitle.content) title = ogTitle.content.trim();
  const excerpt = (metaDesc && 'content' in metaDesc && metaDesc.content) || '';
  return { title, excerpt };
}

/**
 * Parse raw HTML → { title, content(markdown), excerpt }
 * @param {string} html  Raw HTML
 * @param {string} url   Source URL
 */
async function extractContent(html, url = '') {
  const dom = await getJSDOM(html, url);
  const doc = dom.window.document;
  const { title, excerpt } = readMeta(doc);

  let mainEl = findMainEl(doc);
  let md = domToMarkdown(stripNoise(mainEl.cloneNode(true)));

  if (md.length < 200) {
    md = domToMarkdown(stripNoise(doc.body.cloneNode(true)));
  }

  if (md.length > 10000) md = md.slice(0, 10000) + '\n\n…[内容过长，已截断]';

  return { title, content: md, excerpt };
}

/* ======================== HTTP fetch ======================== */

async function fetchHtml(url) {
  // Strategy 1: direct fetch
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const text = await res.text();
      if (text.length > 200) return text;
    }
  } catch { /* CORS or network blocked */ }

  // Strategy 2: Vite dev proxy
  try {
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) return await res.text();
  } catch { /* proxy not available */ }

  return null;
}

/* ======================== Public API ======================== */

/**
 * Parse a URL → { title, content, excerpt }
 */
export async function parseLink(url) {
  const urlTrim = url.trim();
  if (!urlTrim) throw new Error('请输入完整的 URL');
  try { new URL(urlTrim); }
  catch { throw new Error('请输入有效的 URL，例如 https://example.com/article'); }

  const html = await fetchHtml(urlTrim);

  if (!html) {
    const host = new URL(urlTrim).hostname;
    return {
      title: host,
      content: '',
      excerpt: `无法抓取页面内容，可能该页面禁止抓取或网络受限。\n\n您可以尝试手动复制文章内容，使用「文本」捕获模式。\n\n链接：${urlTrim}`,
    };
  }

  return extractContent(html, urlTrim);
}

export { extractContent };
