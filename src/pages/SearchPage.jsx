/**
 * SearchPage - Full-text search with highlighting, history, and suggestions
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  FileText,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import { listContainerVariants, listItemVariants, springs, fadeInUp } from '../utils/animations';
import { generateMockArticles } from '../utils/mockData';

const SEARCH_HISTORY_KEY = 'lp_search_history';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(loadHistory);
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  const mockArticles = generateMockArticles(30);
  const allTags = [...new Set(mockArticles.flatMap((a) => a.tags))];

  const performSearch = useCallback(
    (q) => {
      if (!q.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      setIsSearching(true);
      setHasSearched(true);

      // Simulate async search
      setTimeout(() => {
        const lower = q.toLowerCase();
        const filtered = mockArticles.filter(
          (a) =>
            a.title.toLowerCase().includes(lower) ||
            a.excerpt?.toLowerCase().includes(lower) ||
            a.tags?.some((t) => t.toLowerCase().includes(lower))
        );
        setResults(filtered);
        setIsSearching(false);
      }, 400);
    },
    [mockArticles]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        const lower = query.toLowerCase();
        const tagSuggestions = allTags
          .filter((t) => t.toLowerCase().includes(lower))
          .slice(0, 3);
        const titleSuggestions = mockArticles
          .filter((a) => a.title.toLowerCase().includes(lower))
          .slice(0, 3)
          .map((a) => a.title);
        setSuggestions([...tagSuggestions, ...titleSuggestions]);
      } else {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, allTags, mockArticles]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newHistory = [query, ...history.filter((h) => h !== query)].slice(0, 20);
    setHistory(newHistory);
    saveHistory(newHistory);
    performSearch(query);
    setSuggestions([]);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const removeHistoryItem = (item) => {
    const newHistory = history.filter((h) => h !== item);
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          style={{
            background: 'var(--primary-container)',
            color: 'var(--on-primary-container)',
            borderRadius: '2px',
            padding: '0 2px',
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <PageTransition>
      <TopBar title="搜索" showBack />

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Search Input */}
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.pop}
          onSubmit={handleSubmit}
          style={{ marginBottom: 'var(--space-md)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: '12px var(--space-md)',
              borderRadius: 'var(--radius-full)',
              border: '2px solid var(--outline-variant)',
              background: 'var(--surface)',
              transition: 'border-color var(--duration-normal)',
            }}
          >
            <Search size={20} color="var(--outline)" />
            <input
              ref={inputRef}
              type="text"
              placeholder="搜索文章、标签..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '16px',
                color: 'var(--on-surface)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
            {query && (
              <motion.button
                type="button"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => { setQuery(''); setResults([]); setHasSearched(false); inputRef.current?.focus(); }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'var(--surface-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={14} color="var(--outline)" />
              </motion.button>
            )}
          </div>
        </motion.form>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && !hasSearched && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ marginBottom: 'var(--space-md)' }}
            >
              <GlassCard hoverable={false}>
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setQuery(s);
                      performSearch(s);
                      const newHistory = [s, ...history.filter((h) => h !== s)].slice(0, 20);
                      setHistory(newHistory);
                      saveHistory(newHistory);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      padding: '10px 0',
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      borderBottom: i < suggestions.length - 1 ? '1px solid var(--outline-variant)' : 'none',
                      textAlign: 'left',
                    }}
                  >
                    {allTags.includes(s) ? (
                      <Tag size={16} color="var(--secondary)" />
                    ) : (
                      <FileText size={16} color="var(--primary)" />
                    )}
                    <span style={{ flex: 1, fontSize: '14px', color: 'var(--on-surface)' }}>
                      {highlightText(s, query)}
                    </span>
                    <ArrowRight size={16} color="var(--outline)" />
                  </motion.button>
                ))}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="label-caps" style={{ color: 'var(--outline)' }}>
                  搜索结果
                </span>
                <span style={{ fontSize: '13px', color: 'var(--outline)' }}>
                  {isSearching ? '搜索中...' : `找到 ${results.length} 条结果`}
                </span>
              </div>

              {isSearching && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--outline)' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ display: 'inline-block' }}
                  >
                    <Search size={32} color="var(--outline)" />
                  </motion.div>
                  <div style={{ marginTop: 'var(--space-md)', fontSize: '14px' }}>搜索中...</div>
                </div>
              )}

              {!isSearching && results.length === 0 && (
                <GlassCard style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                  <Search size={40} color="var(--outline-variant)" style={{ marginBottom: 'var(--space-md)' }} />
                  <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--on-surface)' }}>
                    未找到相关结果
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '4px' }}>
                    尝试其他关键词或标签
                  </div>
                </GlassCard>
              )}

              {results.map((article) => (
                <motion.div
                  key={article.id}
                  variants={listItemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <GlassCard style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '6px' }}>
                      {highlightText(article.title, query)}
                    </div>
                    {article.excerpt && (
                      <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                        {highlightText(article.excerpt.slice(0, 80) + '...', query)}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {article.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--surface-container)',
                            fontSize: '11px',
                            color: 'var(--on-surface-variant)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {!hasSearched && history.length > 0 && (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="label-caps" style={{ color: 'var(--outline)' }}>
                <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                搜索历史
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={clearHistory}
                style={{
                  fontSize: '12px',
                  color: 'var(--error)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                清空
              </motion.button>
            </div>

            {history.slice(0, 8).map((item, i) => (
              <motion.div key={item} variants={listItemVariants}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setQuery(item);
                    performSearch(item);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--outline-variant)',
                    background: 'var(--surface-container-low)',
                    width: '100%',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Clock size={18} color="var(--outline)" />
                  <span style={{ flex: 1, fontSize: '14px', color: 'var(--on-surface)' }}>{item}</span>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => { e.stopPropagation(); removeHistoryItem(item); }}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: 'none',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={14} color="var(--outline)" />
                  </motion.button>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!hasSearched && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: 'var(--space-2xl) 0', color: 'var(--outline)' }}
          >
            <Search size={48} color="var(--outline-variant)" style={{ marginBottom: 'var(--space-md)' }} />
            <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--on-surface)' }}>
              输入关键词开始搜索
            </div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>
              支持文章标题、内容和标签搜索
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

export default SearchPage;
