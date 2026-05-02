/**
 * GlassesInboxPage - Smart glasses image inbox with WebSocket + AI vision
 * Receives real-time image pushes from Python WebSocket server,
 * stores them locally, and uses multimodal AI to analyze & generate notes.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Glasses,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  X,
  Eye,
  ArrowRight,
  Loader2,
  FileText,
  Save,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import PillTag from '../components/ui/PillTag';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { springs, listContainerVariants, listItemVariants } from '../utils/animations';
import { glassesClient } from '../services/sync/glassesClient';
import { glassesInboxRepo } from '../services/storage/db';
import { useAIChat } from '../hooks/useAIChat';
import useArticleStore from '../stores/useArticleStore';
import { useToastStore } from '../stores/useToastStore';

function ensureDataUrl(data, mimeType = 'image/jpeg') {
  if (!data) return null;
  if (data.startsWith('data:')) return data;
  return `data:${mimeType};base64,${data}`;
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function GlassesInboxPage() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { analyzeImage } = useAIChat();
  const createArticle = useArticleStore((s) => s.createArticle);

  const [items, setItems] = useState([]);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [processingId, setProcessingId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [detailTab, setDetailTab] = useState('image'); // 'image' | 'content'
  const itemsRef = useRef([]);

  // Sync ref with state
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Load historical records from SQLite
  useEffect(() => {
    const records = glassesInboxRepo.getAll();
    setItems(records);
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribe = glassesClient.on((event) => {
      if (event.type === 'status') {
        setWsStatus(event.status === 'connected' ? 'connected' : 'disconnected');
      } else if (event.type === 'image') {
        const rec = event.record;
        // Save to SQLite
        const dbId = glassesInboxRepo.create({
          imageData: rec.imageData,
          mimeType: rec.mimeType,
          status: 'pending',
          uploader: rec.uploader,
        });
        const saved = glassesInboxRepo.getById(dbId);
        setItems((prev) => [saved, ...prev]);
        toast.show('收到新图片', 'success');
      } else if (event.type === 'error') {
        toast.show('WebSocket 错误：' + event.message, 'error');
      }
    });

    // Connect WebSocket
    glassesClient.connect({ username: 'default', password: '' });

    return () => {
      unsubscribe();
      glassesClient.disconnect();
    };
  }, [toast]);

  const handleProcess = useCallback(
    async (item) => {
      setProcessingId(item.id);
      try {
        toast.show('AI 正在分析图片...', 'info');

        // Extract raw base64 (remove data URL prefix if present)
        let base64 = item.imageData;
        if (base64.startsWith('data:')) {
          base64 = base64.split(',')[1];
        }

        const result = await analyzeImage(base64, item.mimeType);

        // Update inbox record
        glassesInboxRepo.update(item.id, {
          title: result.title,
          summary: result.summary,
          content: result.content,
          tags: result.tags,
          status: 'processed',
        });

        const updated = glassesInboxRepo.getById(item.id);
        setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));

        toast.show('AI 分析完成', 'success');
      } catch (err) {
        console.error('[GlassesInbox] AI analyze failed:', err);
        toast.show('AI 分析失败：' + err.message, 'error');
      } finally {
        setProcessingId(null);
      }
    },
    [analyzeImage, toast]
  );

  const handleSaveToArticle = useCallback(
    async (item) => {
      try {
        let tags = [];
        try {
          tags = JSON.parse(item.tags);
        } catch {
          tags = [];
        }

        const articleId = await createArticle({
          title: item.title || '无标题笔记',
          summary: item.summary || '',
          content: item.content || '',
          tags,
          sourceType: 'glasses',
          images: item.imageData
            ? [
                {
                  data: ensureDataUrl(item.imageData, item.mimeType),
                  mimeType: item.mimeType,
                  caption: item.title || '眼镜拍摄',
                },
              ]
            : [],
        });

        // Link inbox item to article
        glassesInboxRepo.update(item.id, { status: 'archived', articleId });
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'archived', articleId } : it))
        );

        toast.show('已保存到文章库', 'success');
        setDetailItem(null);
      } catch (err) {
        toast.show('保存失败：' + err.message, 'error');
      }
    },
    [createArticle, toast]
  );

  const handleDelete = useCallback(
    (id) => {
      glassesInboxRepo.delete(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      if (detailItem?.id === id) setDetailItem(null);
      toast.show('已删除', 'info');
    },
    [detailItem, toast]
  );

  const openDetail = useCallback((item) => {
    setDetailItem(item);
    setDetailTab(item.status === 'processed' || item.status === 'archived' ? 'content' : 'image');
  }, []);

  const pendingCount = items.filter((it) => it.status === 'pending').length;

  return (
    <PageTransition>
      <TopBar
        title="眼镜收件箱"
        rightActions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {wsStatus === 'connected' ? (
              <>
                <Wifi size={16} color="var(--tertiary)" />
                <span style={{ fontSize: '13px', color: 'var(--tertiary)', fontWeight: 500 }}>已连接</span>
              </>
            ) : (
              <>
                <WifiOff size={16} color="var(--error)" />
                <span style={{ fontSize: '13px', color: 'var(--error)', fontWeight: 500 }}>未连接</span>
              </>
            )}
          </div>
        }
      />

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 'var(--space-md)' }}
        >
          <GlassCard hoverable={false} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{items.length}</div>
              <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>总计</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'var(--outline-variant)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--secondary)' }}>{pendingCount}</div>
              <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>待处理</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'var(--outline-variant)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tertiary)' }}>
                {items.length - pendingCount}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>已处理</div>
            </div>
          </GlassCard>
        </motion.div>

        {items.length === 0 ? (
          <GlassCard style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
            <Glasses size={48} color="var(--outline)" style={{ marginBottom: 'var(--space-md)' }} />
            <h3 style={{ marginBottom: 'var(--space-sm)' }}>收件箱为空</h3>
            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginBottom: 'var(--space-sm)' }}>
              当你的智能眼镜或文件系统推送图片时，它们会出现在这里
            </p>
            <p style={{ fontSize: '12px', color: 'var(--outline)' }}>
              WebSocket: ws://localhost:8765
            </p>
          </GlassCard>
        ) : (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
          >
            {items.map((item) => {
              const imageUrl = ensureDataUrl(item.imageData, item.mimeType);
              const isProcessing = processingId === item.id;

              return (
                <motion.div key={item.id} variants={listItemVariants}>
                  <GlassCard hoverable={false} onClick={() => openDetail(item)}>
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                      {/* Thumbnail */}
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--surface-container)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid var(--outline-variant)',
                          overflow: 'hidden',
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="thumbnail"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--outline)"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                            }}
                          />
                        ) : (
                          <ImageIcon size={28} color="var(--outline)" />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h3
                            style={{
                              fontSize: '16px',
                              fontWeight: 600,
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.title || '未命名图片'}
                          </h3>
                          {item.status === 'archived' && (
                            <CheckCircle2 size={16} color="var(--tertiary)" />
                          )}
                          {item.status === 'processed' && (
                            <CheckCircle2 size={16} color="var(--primary)" />
                          )}
                          {isProcessing && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Loader2 size={16} color="var(--primary)" />
                            </motion.div>
                          )}
                        </div>

                        <p
                          style={{
                            fontSize: '13px',
                            color: 'var(--on-surface-variant)',
                            margin: '0 0 8px',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.summary || item.content?.slice(0, 80) + '...' || '等待 AI 分析处理'}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: 'var(--outline)' }}>
                            {formatTime(item.createdAt)}
                            {item.uploader && ` · ${item.uploader}`}
                          </span>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            {item.status === 'pending' && !isProcessing && (
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProcess(item);
                                }}
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: 'var(--radius-full)',
                                  border: 'none',
                                  background: 'var(--primary-container)',
                                  color: 'var(--on-primary-container)',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Sparkles size={12} /> AI 处理
                              </motion.button>
                            )}
                            {item.status === 'processed' && (
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveToArticle(item);
                                }}
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: 'var(--radius-full)',
                                  border: 'none',
                                  background: 'var(--tertiary-container)',
                                  color: 'var(--on-tertiary-container)',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Save size={12} /> 保存
                              </motion.button>
                            )}
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              style={{
                                padding: '4px',
                                borderRadius: 'var(--radius-full)',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--error)',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={14} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => setDetailItem(null)}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-md)',
                borderBottom: '1px solid var(--outline-variant)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>
                {detailItem.title || '图片详情'}
              </h3>
              <button
                onClick={() => setDetailItem(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--on-surface)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Tab Switcher */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                padding: 'var(--space-sm) var(--space-md)',
                borderBottom: '1px solid var(--outline-variant)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setDetailTab('image')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: detailTab === 'image' ? 'var(--primary-container)' : 'transparent',
                  color: detailTab === 'image' ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ImageIcon size={14} /> 图片
              </button>
              {(detailItem.status === 'processed' || detailItem.status === 'archived') && (
                <button
                  onClick={() => setDetailTab('content')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: detailTab === 'content' ? 'var(--primary-container)' : 'transparent',
                    color: detailTab === 'content' ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <FileText size={14} /> AI 笔记
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--space-md)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {detailTab === 'image' && (
                <div>
                  <img
                    src={ensureDataUrl(detailItem.imageData, detailItem.mimeType)}
                    alt={detailItem.title || '眼镜图片'}
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius-lg)',
                      objectFit: 'contain',
                      maxHeight: '60vh',
                    }}
                  />
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    {detailItem.tags && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
                        {(() => {
                          try {
                            const tags = JSON.parse(detailItem.tags);
                            return tags.map((t) => <PillTag key={t} selected>{t}</PillTag>);
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                    )}
                    <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0 }}>
                      来源: {detailItem.uploader || 'unknown'} · {formatTime(detailItem.createdAt)}
                    </p>
                  </div>
                </div>
              )}

              {detailTab === 'content' && (
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                    {detailItem.title}
                  </h2>
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--on-surface-variant)',
                      marginBottom: 'var(--space-md)',
                      lineHeight: 1.6,
                    }}
                  >
                    {detailItem.summary}
                  </p>
                  <MarkdownRenderer content={detailItem.content || ''} />
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                padding: 'var(--space-md)',
                borderTop: '1px solid var(--outline-variant)',
                display: 'flex',
                gap: 'var(--space-sm)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {detailItem.status === 'pending' && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleProcess(detailItem)}
                  disabled={processingId === detailItem.id}
                  style={{
                    flex: 1,
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    background: 'var(--primary-container)',
                    color: 'var(--on-primary-container)',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: processingId === detailItem.id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: processingId === detailItem.id ? 0.6 : 1,
                  }}
                >
                  {processingId === detailItem.id ? (
                    <>
                      <Loader2 size={18} className="spin" /> 分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> AI 分析
                    </>
                  )}
                </motion.button>
              )}
              {(detailItem.status === 'processed' || detailItem.status === 'archived') && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSaveToArticle(detailItem)}
                  style={{
                    flex: 1,
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    background: 'var(--tertiary-container)',
                    color: 'var(--on-tertiary-container)',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Save size={18} /> 保存到文章库
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(detailItem.id)}
                style={{
                  flex: 1,
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--error)',
                  background: 'var(--error-container)',
                  color: 'var(--error)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Trash2 size={18} /> 删除
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export default GlassesInboxPage;
