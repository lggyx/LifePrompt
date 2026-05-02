/**
 * ArticleListPage - Article list with view mode toggle and filters
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  Rows3,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import PillTag from '../components/ui/PillTag';
import { VIEW_MODES, SOURCE_TYPES, SOURCE_TYPE_LABELS } from '../utils/constants';
import { listContainerVariants, listItemVariants, springs } from '../utils/animations';

const viewModeIcons = {
  [VIEW_MODES.COMPACT]: LayoutGrid,
  [VIEW_MODES.STANDARD]: List,
  [VIEW_MODES.RICH]: Rows3,
};

function ArticleListPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [viewMode, setViewMode] = useState(VIEW_MODES.STANDARD);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);

  const mockTags = ['知识管理', 'AI', '效率', '学习', '写作', '笔记方法', '思维', '工具'];

  // Mock articles
  useEffect(() => {
    const mockArticles = Array.from({ length: 20 }, (_, i) => ({
      id: `article-${i + 1}`,
      title: [
        '如何构建高效的第二大脑系统',
        'AI辅助写作的五个关键原则',
        '深度工作：在碎片化时代保持专注',
        '知识管理的终极形态是什么',
        '从信息囤积到知识创造的转变',
        '费曼技巧：用最简单的话解释复杂概念',
        '笔记链接的力量',
        '认知卸载：让外部系统为你记忆',
        '渐进式总结方法',
        'Zettelkasten完全指南',
      ][i % 10],
      summary: '本文探讨了如何利用现代工具和方法论构建一个高效的个人信息管理系统，让知识真正服务于创造力。',
      tags: [mockTags[i % mockTags.length], mockTags[(i + 1) % mockTags.length]],
      imageUrl: i % 3 === 0
        ? `https://images.unsplash.com/photo-${1516321318423 + i}?w=400&h=300&fit=crop`
        : null,
      sourceType: Object.values(SOURCE_TYPES)[i % 4],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));
    setArticles(mockArticles);
  }, []);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleSource = (source) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const filteredArticles = articles.filter((article) => {
    if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedTags.length > 0 && !selectedTags.some((t) => article.tags.includes(t))) {
      return false;
    }
    if (selectedSources.length > 0 && !selectedSources.includes(article.sourceType)) {
      return false;
    }
    return true;
  });

  const renderArticleCard = (article) => {
    const isCompact = viewMode === VIEW_MODES.COMPACT;
    const isRich = viewMode === VIEW_MODES.RICH;

    return (
      <motion.div
        key={article.id}
        variants={listItemVariants}
        layout
        layoutId={article.id}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/article/${article.id}`)}
        style={{ cursor: 'pointer' }}
      >
        <GlassCard
          hoverable={false}
          padding={isCompact ? 'var(--space-sm)' : 'var(--space-md)'}
          style={{
            display: 'flex',
            flexDirection: isRich ? 'column' : 'row',
            gap: 'var(--space-sm)',
            alignItems: isRich ? 'stretch' : 'center',
          }}
        >
          {article.imageUrl && isRich && (
            <div
              style={{
                width: '100%',
                height: 160,
                borderRadius: 'var(--radius-md)',
                background: `linear-gradient(135deg, var(--surface-container), var(--surface-container-high))`,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--outline)' }}>
                📷 {article.title.slice(0, 15)}...
              </span>
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: isCompact ? '14px' : '16px',
                fontWeight: 600,
                color: 'var(--on-surface)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: 0,
              }}
            >
              {article.title}
            </h3>

            {!isCompact && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--on-surface-variant)',
                  marginTop: '4px',
                  display: '-webkit-box',
                  WebkitLineClamp: isRich ? 3 : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.5,
                }}
              >
                {article.summary}
              </p>
            )}

            <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
              {article.tags.map((tag) => (
                <PillTag key={tag} size="sm">
                  {tag}
                </PillTag>
              ))}
              <PillTag size="sm" color="var(--outline)">
                {SOURCE_TYPE_LABELS[article.sourceType]}
              </PillTag>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  return (
    <PageTransition>
      <TopBar
        title="文章"
        rightActions={
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.values(VIEW_MODES).map((mode) => {
              const Icon = viewModeIcons[mode];
              return (
                <motion.button
                  key={mode}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setViewMode(mode)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: viewMode === mode ? 'var(--primary-container)' : 'var(--surface-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Icon
                    size={16}
                    color={viewMode === mode ? 'var(--on-primary-container)' : 'var(--on-surface-variant)'}
                  />
                </motion.button>
              );
            })}
          </div>
        }
      />

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Search bar */}
        <GlassCard hoverable={false} padding="var(--space-sm)" style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} color="var(--outline)" />
            <input
              type="text"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: 'var(--on-surface)',
                fontSize: '15px',
                outline: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
            {searchQuery && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={16} color="var(--outline)" />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setShowFilters(!showFilters)}
              style={{
                border: 'none',
                background: showFilters ? 'var(--primary-container)' : 'none',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                padding: '4px',
              }}
            >
              <SlidersHorizontal
                size={18}
                color={showFilters ? 'var(--on-primary-container)' : 'var(--outline)'}
              />
            </motion.button>
          </div>
        </GlassCard>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={springs.smooth}
              style={{ overflow: 'hidden', marginBottom: 'var(--space-md)' }}
            >
              <GlassCard hoverable={false} padding="var(--space-sm)">
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
                    标签
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {mockTags.map((tag) => (
                      <PillTag
                        key={tag}
                        selected={selectedTags.includes(tag)}
                        onClick={() => toggleTag(tag)}
                        size="sm"
                      >
                        {tag}
                      </PillTag>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
                    来源
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {Object.values(SOURCE_TYPES).map((source) => (
                      <PillTag
                        key={source}
                        selected={selectedSources.includes(source)}
                        onClick={() => toggleSource(source)}
                        size="sm"
                      >
                        {SOURCE_TYPE_LABELS[source]}
                      </PillTag>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Article list */}
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: viewMode === VIEW_MODES.COMPACT
              ? 'repeat(auto-fill, minmax(140px, 1fr))'
              : '1fr',
            gap: viewMode === VIEW_MODES.COMPACT ? 'var(--space-sm)' : 'var(--space-md)',
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredArticles.map(renderArticleCard)}
          </AnimatePresence>
        </motion.div>

        {filteredArticles.length === 0 && (
          <GlassCard
            hoverable={false}
            style={{
              textAlign: 'center',
              padding: 'var(--space-xl)',
              marginTop: 'var(--space-lg)',
            }}
          >
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '15px' }}>
              没有找到匹配的文章
            </p>
          </GlassCard>
        )}
      </div>
    </PageTransition>
  );
}

export default ArticleListPage;
