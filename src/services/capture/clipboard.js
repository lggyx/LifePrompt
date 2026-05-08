/**
 * Clipboard Utilities
 * - Detect clipboard URL / text on mount
 * - Read / write clipboard (with fallback)
 */

const Clipboard = {};

/**
 * Check if the browser's Clipboard API is available.
 */
Clipboard.isAvailable = () => {
  return !!(navigator.clipboard && navigator.clipboard.readText);
};

/**
 * Read text from clipboard.
 * Falls back to deprecated execCommand if Clipboard API is unavailable.
 */
Clipboard.readText = async () => {
  if (navigator.clipboard && navigator.clipboard.readText) {
    return navigator.clipboard.readText();
  }
  // Deprecated but still functional fallback
  if (document.execCommand) {
    return new Promise((resolve) => {
      const ta = document.createElement('textarea');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('paste');
      resolve(ta.value);
      document.body.removeChild(ta);
    });
  }
  throw new Error('Clipboard not available in this context');
};

/**
 * Detect whether the text looks like a URL.
 */
Clipboard.detectUrl = (text) => {
  const trimmed = (text || '').trim();
  if (!trimmed) return null;
  try { return new URL(trimmed).href; }
  catch { return null; }
};

/**
 * Detect whether the text looks like a meaningful article (not too short).
 */
Clipboard.isArticleText = (text) => {
  const trimmed = (text || '').trim();
  return trimmed.length >= 40;
};

export default Clipboard;
