/**
 * MarkdownRenderer - Renders Markdown content with theme-aware styling
 * Uses 'marked' for parsing (lightweight, no ESM issues)
 */

import { useMemo } from 'react';
import { marked } from 'marked';

function MarkdownRenderer({ content, style = {} }) {
  const html = useMemo(() => {
    if (!content) return '';
    return marked.parse(content, {
      breaks: true,
      gfm: true,
    });
  }, [content]);

  return (
    <div
      className="markdown-body"
      style={{
        fontSize: '15px',
        lineHeight: 1.8,
        color: 'var(--on-surface)',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MarkdownRenderer;
