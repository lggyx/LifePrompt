/**
 * ArticleDetailPage - Full article view with metadata and actions
 * Connected to SQLite, supports Markdown rendering and image display
 */

import { useState, useEffect, useCallback } from 'react';
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
  Save,
  X,
  ImagePlus,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import PillTag from '../components/ui/PillTag';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { SOURCE_TYPE_LABELS } from '../utils/constants';
import { springs } from '../utils/animations';
import { useArticle } from '../hooks/useArticles';
import useToastStore from '../stores/useToastStore';

function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const articleId = Number(id);
  const { article, isLoading, update, remove } = useArticle(articleId);
  const toast = useToastStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (article) {
      setEditTitle(article.title || '');
      setEditContent(article.content || '');
    }
  }, [article]);

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = useCallback(async () => {
    try {
      await update({ title: editTitle, content: editContent });
      setIsEditing(false);
      toast.show('保存成功', 'success');
    } catch (err) {
      toast.show('保存失败：' + err.message, 'error');
    }
  }, [editTitle, editContent, update, toast]);

  const handleDelete = useCallback(async () => {
    try {
      await remove();
      setShowDeleteConfirm(false);
      toast.show('文章已删除', 'success');
      navigate('/articles');
    } catch (err) {
      toast.show('删除失败：' + err.message, 'error');
    }
  }, [remove, navigate, toast]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      try {
        const currentImages = article?.images || [];
        await update({
          images: [
            ...currentImages.map((img) => ({
              data: img.data,
              mimeType: img.mimeType,
              caption: img.caption,
            })),
            { data: dataUrl, mimeType: file.type },
          ],
        });
        toast.show('图片已添加', 'success');
      } catch (err) {
        toast.show('添加图片失败：' + err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  }, [article, update, toast]);

  if (isLoading || !article) {
    return (
      <PageTransition>
        <TopBar title="文章详情" showBack />
        <div style={{ padding: 'var(--space-md)' }}>
          <GlassCard hoverable={false} padding="var(--space-lg)">
            <div style={{ height: 24, width: '60%', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }} />
            <div style={{ height: 16, width: '40%', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-sm)', marginBottom: 24 }} />
            <div style={{ height: 120, width: '100%', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-sm)' }} />
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <TopBar
        title={isEditing ? '编辑文章' : '文章详情'}
        showBack
        rightActions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {isEditing ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleSave}
                  style={actionButtonStyle('var(--tertiary-container)', 'var(--on-tertiary-container)')}
                >
                  <Save size={18} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(article.title || '');
                    setEditContent(article.content || '');
                  }}
                  style={actionButtonStyle('var(--surface-container)', 'var(--on-surface)')}
                >
                  <X size={18} />
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => navigate(`/publish/${id}`)}
                  style={actionButtonStyle('var(--primary-container)', 'var(--on-primary-container)')}
                >
                  <Send size={18} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setIsEditing(true)}
                  style={actionButtonStyle('var(--surface-container)', 'var(--on-surface)')}
                >
                  <Edit3 size={18} />
                </motion.button>
              </>
            )}
          </div>
        }
      />

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Title */}
        {isEditing ? (
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={{
              width: '100%',
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--on-surface)',
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid var(--primary-container)',
              outline: 'none',
              marginBottom: 'var(--space-md)',
              fontFamily: 'var(--font-body)',
            }}
          />
        ) : (
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
        )}

        {/* Meta info */}
        {!isEditing && (
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
        )}

        {/* Tags */}
        {!isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, ...springs.smooth }}
            style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}
          >
            {(article.tags || []).map((tag) => (
              <PillTag key={tag} selected>
                <Tag size={12} /> {tag}
              </PillTag>
            ))}
          </motion.div>
        )}

        {/* AI Summary Card */}
        {!isEditing && article.aiGeneratedSummary && (
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
        )}

        {/* Images */}
        {!isEditing && article.images && article.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, ...springs.smooth }}
            style={{ marginBottom: 'var(--space-md)' }}
          >
            <GlassCard hoverable={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {article.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.data}
                    alt={img.caption || `图片 ${idx + 1}`}
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      maxHeight: 400,
                    }}
                  />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...springs.pop }}
        >
          <GlassCard hoverable={false}>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="使用 Markdown 格式编写内容..."
                  style={{
                    width: '100%',
                    minHeight: 300,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--on-surface)',
                    fontSize: '15px',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    resize: 'vertical',
                    lineHeight: 1.8,
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px dashed var(--outline-variant)',
                      color: 'var(--on-surface-variant)',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <ImagePlus size={14} />
                    添加图片
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            ) : (
              <MarkdownRenderer content={article.content || '（暂无内容）'} />
            )}
          </GlassCard>
        </motion.div>

        {/* Actions */}
        {!isEditing && (
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
              onClick={() => setIsEditing(true)}
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
        )}
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
                  onClick={handleDelete}
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
