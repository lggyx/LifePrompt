/**
 * ArticleListPage - Article list with view mode toggle and filters
 * Connected to SQLite via useArticles hook
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useArticles } from '../hooks/useArticles';
import useUISearchStore from '../stores/useUISearchStore';

const TIME_RANGES = [
  { label: '今天', days: 1 },
  { label: '最近7天', days: 7 },
  { label: '最近30天', days: 30 },
  { label: '全部', days: 0 },
];

const viewModeIcons = {
  [VIEW_MODES.COMPACT]: LayoutGrid,
  [VIEW_MODES.STANDARD]: List,
  [VIEW_MODES.RICH]: Rows3,
};

function ArticleListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tagFilterFromUrl = searchParams.get('tag');

  const { articles, tags, isLoading, loadArticles, searchArticles, filterByTag, filterBySourceType } = useArticles();

  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    showFilters,
    toggleFilters,
    selectedTags,
    toggleTag,
    clearTags,
    selectedSources,
    toggleSource,
    clearSources,
    timeRange,
    setTimeRange,
    resetAll,
  } = useUISearchStore();

  // Initial load
  useEffect(() => {
    if (tagFilterFromUrl) {
      filterByTag(tagFilterFromUrl);
    } else {
      loadArticles();
    }
  }, [loadArticles, tagFilterFromUrl, filterByTag]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchArticles(searchQuery);
      } else if (!tagFilterFromUrl) {
        loadArticles();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchArticles, loadArticles, tagFilterFromUrl]);

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    if (selectedTags.length > 0) {
      result = result.filter((a) => selectedTags.some((t) => a.tags?.includes(t)));
    }
    if (selectedSources.length > 0) {
      result = result.filter((a) => selectedSources.includes(a.sourceType));
    }
    if (timeRange > 0) {
      const cutoff = new Date(Date.now() - timeRange * 86400000);
      result = result.filter((a) => new Date(a.createdAt) >= cutoff);
    }

    return result;
  }, [articles, selectedTags, selectedSources, timeRange]);

  const renderArticleCard = (article) => {
    const isCompact = viewMode === VIEW_MODES.COMPACT;
    const isRich = viewMode === VIEW_MODES.RICH;
    const hasImage = article.images && article.images.length > 0;

    return (
      <motion.div
        key={article.id}
        variants={listItemVariants}
        layout
        layoutId={String(article.id)}
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
          {(hasImage || article.imageUrl) && isRich && (
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
              {hasImage ? (
                <img
                  src={article.images[0].data}
                  alt={article.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--outline)' }}>
                  📷 {article.title.slice(0, 15)}...
                </span>
              )}
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
              {(article.tags || []).map((tag) => (
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
              onClick={() => toggleFilters()}
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
                    {tags.map((tag) => (
                      <PillTag
                        key={tag.name}
                        selected={selectedTags.includes(tag.name)}
                        onClick={() => toggleTag(tag.name)}
                        size="sm"
                      >
                        {tag.name}
                      </PillTag>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
                    时间范围
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {TIME_RANGES.map((range) => (
                      <PillTag
                        key={range.days}
                        selected={timeRange === range.days}
                        onClick={() => setTimeRange(range.days)}
                        size="sm"
                      >
                        {range.label}
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
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <GlassCard key={i} hoverable={false} padding="var(--space-md)">
                <div style={{ height: 16, width: '60%', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }} />
                <div style={{ height: 12, width: '100%', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-sm)' }} />
              </GlassCard>
            ))}
          </div>
        ) : (
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
        )}

        {filteredArticles.length === 0 && !isLoading && (
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
