/**
 * GlassesInboxPage - Smart glasses image inbox
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Glasses, CheckCircle2, Clock, Sparkles, Trash2 } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import PillTag from '../components/ui/PillTag';
import { listContainerVariants, listItemVariants, springs } from '../utils/animations';

function GlassesInboxPage() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Mock glasses images
    const mockImages = [
      {
        id: 'g-1',
        title: '会议白板笔记',
        summary: '产品开发会议的关键决策点和行动项',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        thumbnail: null,
      },
      {
        id: 'g-2',
        title: '书籍摘录',
        summary: '"深度工作"中关于注意力管理的要点',
        status: 'processed',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        thumbnail: null,
      },
      {
        id: 'g-3',
        title: '街头广告牌',
        summary: '有趣的营销策略文案',
        status: 'pending',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        thumbnail: null,
      },
      {
        id: 'g-4',
        title: '餐厅菜单',
        summary: '值得尝试的新菜品',
        status: 'processed',
        createdAt: new Date(Date.now() - 18000000).toISOString(),
        thumbnail: null,
      },
    ];
    setImages(mockImages);
  }, []);

  const handleProcess = (id) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, status: 'processing' } : img))
    );
    setTimeout(() => {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'processed' } : img
        )
      );
    }, 2000);
  };

  const handleDelete = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <PageTransition>
      <TopBar
        title="眼镜收件箱"
        rightActions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Glasses size={20} color="var(--primary)" />
            <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>
              已连接
            </span>
          </div>
        }
      />

      <div style={{ padding: 'var(--space-md)' }}>
        {images.length === 0 ? (
          <GlassCard style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
            <Glasses size={48} color="var(--outline)" style={{ marginBottom: 'var(--space-md)' }} />
            <h3 style={{ marginBottom: 'var(--space-sm)' }}>收件箱为空</h3>
            <p style={{ fontSize: '14px' }}>
              当你的智能眼镜推送图片时，它们会出现在这里
            </p>
          </GlassCard>
        ) : (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
          >
            {images.map((img) => (
              <motion.div key={img.id} variants={listItemVariants}>
                <GlassCard hoverable={false}>
                  <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    {/* Thumbnail placeholder */}
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
                      }}
                    >
                      <Glasses size={28} color="var(--outline)" />
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
                          {img.title}
                        </h3>
                        {img.status === 'processed' && (
                          <CheckCircle2 size={16} color="var(--tertiary)" />
                        )}
                        {img.status === 'processing' && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Clock size={16} color="var(--primary)" />
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
                        {img.summary}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: 'var(--outline)' }}>
                          {formatTime(img.createdAt)}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {img.status === 'pending' && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleProcess(img.id)}
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
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(img.id)}
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
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

export default GlassesInboxPage;
