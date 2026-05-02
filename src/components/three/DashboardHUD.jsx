import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FileText, Tag, Clock, TrendingUp } from 'lucide-react';

export function DashboardHUD({ articles, tags, theme, onTagClick }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isNight = theme === 'night';

  // 统计数据
  const stats = {
    totalArticles: articles.length,
    totalTags: tags.length,
    thisWeek: articles.filter((a) => {
      const date = new Date(a.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date > weekAgo;
    }).length,
  };

  // 标签分布
  const tagDistribution = tags.map((tag) => ({
    name: tag.name,
    count: articles.filter((a) => a.tags?.includes(tag.name)).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // 最近文章
  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '80px 16px 16px',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {/* 顶部统计卡片 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {/* 总文章数 */}
        <StatCard
          icon={<FileText size={18} />}
          value={stats.totalArticles}
          label="文章"
          color={isNight ? '#ff2d78' : '#00f0ff'}
          isNight={isNight}
          delay={0}
        />
        <StatCard
          icon={<Tag size={18} />}
          value={stats.totalTags}
          label="标签"
          color={isNight ? '#00ffcc' : '#d300bd'}
          isNight={isNight}
          delay={0.1}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          value={stats.thisWeek}
          label="本周新增"
          color={isNight ? '#ffe04a' : '#a2ef00'}
          isNight={isNight}
          delay={0.2}
        />
      </motion.div>

      {/* 标签分布 & 最近活动 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
        }}
      >
        {/* 标签分布 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            flex: 1,
            background: isNight
              ? 'rgba(19, 19, 32, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isNight ? 'rgba(255, 45, 120, 0.2)' : 'rgba(0, 111, 112, 0.15)'}`,
            borderRadius: '16px',
            padding: '16px',
            pointerEvents: 'auto',
          }}
        >
          <h4
            style={{
              margin: '0 0 12px 0',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: isNight ? '#9ca3af' : '#6a7a7b',
            }}
          >
            标签分布
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tagDistribution.map((tag, i) => (
              <TagBar
                key={tag.name}
                tag={tag}
                maxCount={tagDistribution[0]?.count || 1}
                isNight={isNight}
                index={i}
                onClick={() => onTagClick?.(tag.name)}
              />
            ))}
          </div>
        </motion.div>

        
      </div>
      {/* 最近活动 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            flex: 1,
            background: isNight
              ? 'rgba(19, 19, 32, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isNight ? 'rgba(0, 255, 204, 0.2)' : 'rgba(0, 111, 112, 0.15)'}`,
            borderRadius: '16px',
            padding: '16px',
            pointerEvents: 'auto',
            margin:"5px 0 0 0"
          }}
        >
          <h4
            style={{
              margin: '0 0 12px 0',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: isNight ? '#9ca3af' : '#6a7a7b',
            }}
          >
            最近捕获
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentArticles.map((article, i) => (
              <RecentItem
                key={article.id}
                article={article}
                isNight={isNight}
                index={i}
              />
            ))}
          </div>
        </motion.div>
    </div>
  );
}

function StatCard({ icon, value, label, color, isNight, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      style={{
        flex: 1,
        background: isNight
          ? 'rgba(19, 19, 32, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: isNight
            ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.2)`
            : color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isNight ? color : '#ffffff',
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: isNight ? '#e0e0f0' : '#191c1d',
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: isNight ? '#9ca3af' : '#6a7a7b',
            marginTop: '2px',
          }}
        >
          {label}
        </div>
      </div>
    </motion.div>
  );
}

function TagBar({ tag, maxCount, isNight, index, onClick }) {
  const colors = ['#ff2d78', '#00ffcc', '#ffe04a', '#00f0ff', '#d300bd'];
  const color = colors[index % colors.length];
  const percentage = (tag.count / maxCount) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: '100%' }}
      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          color: isNight ? '#e0e0f0' : '#191c1d',
          minWidth: '60px',
          fontWeight: 500,
        }}
      >
        {tag.name}
      </span>
      <div
        style={{
          flex: 1,
          height: '6px',
          background: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
          style={{
            height: '100%',
            background: color,
            borderRadius: '3px',
            boxShadow: isNight ? `0 0 8px ${color}` : 'none',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '11px',
          color: isNight ? '#9ca3af' : '#6a7a7b',
          minWidth: '20px',
          textAlign: 'right',
        }}
      >
        {tag.count}
      </span>
    </motion.div>
  );
}

function RecentItem({ article, isNight, index }) {
  const daysAgo = Math.floor(
    (Date.now() - new Date(article.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        borderRadius: '8px',
        background: isNight ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      }}
    >
      <Clock size={12} color={isNight ? '#9ca3af' : '#6a7a7b'} />
      <span
        style={{
          flex: 1,
          fontSize: '12px',
          color: isNight ? '#e0e0f0' : '#191c1d',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {article.title}
      </span>
      <span
        style={{
          fontSize: '10px',
          color: isNight ? '#9ca3af' : '#6a7a7b',
        }}
      >
        {daysAgo === 0 ? '今天' : `${daysAgo}天前`}
      </span>
    </motion.div>
  );
}
