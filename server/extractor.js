/**
 * extractor.js — Node.js HTML → Markdown extractor
 * Used by the Vite dev server `/api/extract` proxy endpoint.
 * Runs only on the server, NOT bundled for browser.
 */

const { JSDOM } = require('jsdom');

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

function walk(node, chunks) {
  if (node.nodeType === 3) {
    const t = node.textContent;
    if (t) chunks.push(t);
    return;
  }
  if (node.nodeType !== 1) return;

  const tag = node.tagName.toLowerCase();
  if (SKIP_TAGS.has(tag)) return;
  if (/^(meta|link|title)$/i.test(tag)) return;

  const block = BLOCK_TAGS.has(tag);
  if (block) chunks.push('\n\n');

  const selfOpen = {
    h1: '# ', h2: '## ', h3: '### ', h4: '#### ', h5: '##### ', h6: '###### ',
    strong: '**', b: '**', em: '*', i: '*',
    code: '`', a: '[',
    pre: '```\n', blockquote: '\n> ',
    li: '\n- ', hr: '\n---\n',
  };
  if (selfOpen[tag]) chunks.push(selfOpen[tag]);

  if (tag === 'img') {
    chunks.push(`![${node.alt || ''}](${node.src || ''})`);
    return;
  }
  if (tag === 'br') { chunks.push('\n'); return; }

  for (const child of node.childNodes) walk(child, chunks);

  const selfClose = {
    h1: '\n', h2: '\n', h3: '\n', h4: '\n', h5: '\n', h6: '\n',
    strong: '**', b: '**', em: '*', i: '*',
    code: '`', pre: '\n```', a: `](${node.href || ''})`,
    blockquote: '\n', p: '\n', div: '\n', section: '\n',
    tr: '\n', td: '\n', th: '\n',
  };
  if (selfClose[tag]) chunks.push(selfClose[tag]);
}

function toMarkdown(html) {
  const dom = new JSDOM(html);
  const chunks = [];
  for (const child of dom.window.document.body.childNodes) walk(child, chunks);
  return chunks.join('').replace(/\n{3,}/g, '\n\n').trim();
}

function findMain(doc) {
  for (const sel of [
    'article', 'main', '[role="main"]',
    '.post-content', '.article-content', '.entry-content',
    '.article-body', '.post-body', '.content-body',
    '#main', '#content',
  ]) {
    const el = doc.querySelector(sel);
    if (el && el.textContent.trim().length > 200) return el;
  }
  return doc.body;
}

function strip(el) {
  ['nav', 'header', 'footer', 'aside', 'iframe', 'noscript',
   'style', 'script', 'svg', 'form', 'button', 'input', 'select', 'textarea',
  ].forEach((t) => { try { el.querySelectorAll(t).forEach((n) => n.remove()); } catch {} });
  try { el.querySelectorAll('[class*="comment"],[class*="sidebar"],[class*="menu"],[class*="cookie"],[class*="banner"]').forEach((n) => n.remove()); } catch {}
  return el;
}

function meta(doc) {
  const og = doc.querySelector('meta[property="og:title"]');
  const desc = doc.querySelector('meta[name="description"]');
  const titleEl = doc.querySelector('title');
  let title = titleEl ? titleEl.textContent.trim() : '';
  if (og && 'content' in og && og.content) title = og.content.trim();
  const excerpt = (desc && 'content' in desc && desc.content) || '';
  return { title, excerpt };
}

/**
 * Parse HTML string → { title, content, excerpt }
 */
function extract(html, url = '') {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;
  const { title, excerpt } = meta(doc);

  let el = findMain(doc);
  let md = toMarkdown(strip(el.cloneNode(true)));

  if (md.length < 200) {
    md = toMarkdown(strip(doc.body.cloneNode(true)));
  }
  if (md.length > 10000) md = md.slice(0, 10000) + '\n\n…[内容过长，已截断]';

  return { title, content: md, excerpt };
}

module.exports = { extract, toMarkdown };
