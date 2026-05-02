/**
 * ArticleDetailPage - Full article view with metadata and actions
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Trash2,
  ExternalLink,
  Edit3,
  Send,
  Tag,
  Clock,
  Eye,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import PillTag from '../components/ui/PillTag';
import { SOURCE_TYPE_LABELS } from '../utils/constants';
import { springs } from '../utils/animations';

function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mock article data
  const article = {
    id,
    title: '如何构建高效的第二大脑系统',
    summary: '本文探讨了如何利用现代工具和方法论构建一个高效的个人信息管理系统，让知识真正服务于创造力。通过系统化地收集、整理、连接和输出知识，我们可以将碎片化的信息转化为可复用的智慧资产。',
    content: `第二大脑（Second Brain）是由 Tiago Forte 提出的一种个人知识管理方法论。它的核心理念是将我们的大脑从记忆负担中解放出来，让外部系统承担存储和检索的功能，从而释放大脑进行更高层次的创造性思考。

## 核心概念

### PARA 方法
PARA 代表 Projects（项目）、Areas（领域）、Resources（资源）、Archives（归档）。这是一种基于行动的组织方式，而不是基于主题的。

### 渐进式总结
渐进式总结是一种分层笔记方法，通过多次提炼，将原始信息浓缩为可快速回顾的精华。

### 笔记之间的链接
孤立的信息没有价值，只有当它们被连接起来，形成网络，才能产生新的洞见。链接笔记是第二大脑的核心机制。

## 实践建议

1. 开始收集：不要追求完美，先开始记录
2. 定期回顾：每周花30分钟整理笔记
3. 主动输出：将笔记转化为文章、演讲或项目
4. 持续迭代：根据反馈调整你的系统`,
    tags: ['知识管理', '效率', '笔记方法'],
    sourceType: 'link',
    sourceUrl: 'https://example.com/second-brain',
    createdAt: '2024-12-15T10:30:00Z',
    imageUrl: null,
    isPublished: false,
    aiGeneratedTitle: '如何构建高效的第二大脑系统',
    aiGeneratedSummary: '探索第二大脑方法论，学习如何通过PARA方法、渐进式总结和笔记链接构建个人知识管理系统。',
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PageTransition>
      <TopBar
        title="文章详情"
        showBack
        rightActions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => navigate(`/publish/${id}`)}
              style={actionButtonStyle('var(--primary-container)', 'var(--on-primary-container)')}
            >
              <Send size={18} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              style={actionButtonStyle('var(--surface-container)', 'var(--on-surface)')}
            >
              <Share2 size={18} />
            </motion.button>
          </div>
        }
      />

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.pop}
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--on-surface)',
            lineHeight: 1.3,
            marginBottom: 'var(--space-md)',
          }}
        >
          {article.title}
        </motion.h1>

        {/* Meta info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, ...springs.smooth }}
          style={{
            display: 'flex',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-md)',
            flexWrap: 'wrap',
          }}
        >
          <span style={metaItemStyle}>
            <Clock size={14} /> {formatDate(article.createdAt)}
          </span>
          <span style={metaItemStyle}>
            <Eye size={14} /> {SOURCE_TYPE_LABELS[article.sourceType]}
          </span>
          {article.sourceUrl && (
            <motion.a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.95 }}
              style={{ ...metaItemStyle, color: 'var(--primary)', textDecoration: 'none' }}
            >
              <ExternalLink size={14} /> 查看来源
            </motion.a>
          )}
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, ...springs.smooth }}
          style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}
        >
          {article.tags.map((tag) => (
            <PillTag key={tag} selected>
              <Tag size={12} /> {tag}
            </PillTag>
          ))}
        </motion.div>

        {/* AI Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...springs.pop }}
        >
          <GlassCard style={{ marginBottom: 'var(--space-md)', borderLeft: '3px solid var(--primary-container)' }}>
            <span className="label-caps" style={{ color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>
              AI 概述
            </span>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--on-surface-variant)', margin: 0 }}>
              {article.aiGeneratedSummary}
            </p>
          </GlassCard>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...springs.pop }}
        >
          <GlassCard hoverable={false}>
            <div
              style={{
                fontSize: '15px',
                lineHeight: 1.8,
                color: 'var(--on-surface)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {article.content}
            </div>
          </GlassCard>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            marginTop: 'var(--space-lg)',
          }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1,
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--outline-variant)',
              background: 'var(--surface-container)',
              color: 'var(--on-surface)',
              fontSize: '15px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <Edit3 size={18} /> 编辑
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              flex: 1,
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--error)',
              background: 'var(--error-container)',
              color: 'var(--error)',
              fontSize: '15px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={18} /> 删除
          </motion.button>
        </motion.div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-md)',
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springs.pop}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard style={{ maxWidth: 320, textAlign: 'center' }}>
              <Trash2 size={40} color="var(--error)" style={{ marginBottom: 'var(--space-md)' }} />
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>确认删除？</h3>
              <p style={{ marginBottom: 'var(--space-lg)', fontSize: '14px' }}>
                此操作无法撤销。文章将被永久删除。
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--outline-variant)',
                    background: 'var(--surface-container)',
                    color: 'var(--on-surface)',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    navigate('/articles');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--error)',
                    color: 'var(--on-error)',
                    cursor: 'pointer',
                  }}
                >
                  删除
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </PageTransition>
  );
}

const actionButtonStyle = (bg, color) => ({
  width: 40,
  height: 40,
  borderRadius: 'var(--radius-full)',
  border: 'none',
  background: bg,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
});

const metaItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '13px',
  color: 'var(--on-surface-variant)',
};

export default ArticleDetailPage;
