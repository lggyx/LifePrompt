/**
 * CapturePage - Content capture hub (text, image, link)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Link2,
  Type,
  Image,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import PillTag from '../components/ui/PillTag';
import { springs } from '../utils/animations';

function CapturePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // null | 'text' | 'link' | 'image'
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const captureModes = [
    {
      id: 'text',
      label: '文本',
      icon: Type,
      description: '输入或粘贴文本内容',
      color: 'var(--primary)',
    },
    {
      id: 'link',
      label: '链接',
      icon: Link2,
      description: '粘贴网页链接',
      color: 'var(--secondary)',
    },
    {
      id: 'image',
      label: '图片',
      icon: Image,
      description: '上传或拍摄图片',
      color: 'var(--tertiary)',
    },
  ];

  const handleProcess = async () => {
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setResult({
        title: 'AI辅助写作的五个关键原则',
        summary: '本文探讨了如何利用AI工具提升写作效率，同时保持内容的原创性和个人风格。',
        tags: ['AI', '写作', '效率'],
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleSave = () => {
    // Save to database
    navigate('/articles');
  };

  if (result) {
    return (
      <PageTransition>
        <TopBar title="处理结果" showBack onBack={() => setResult(null)} />
        <div style={{ padding: 'var(--space-md)' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springs.pop}
          >
            <GlassCard
              style={{
                textAlign: 'center',
                marginBottom: 'var(--space-lg)',
                border: '1px solid var(--tertiary)',
              }}
            >
              <CheckCircle2 size={48} color="var(--tertiary)" style={{ marginBottom: 'var(--space-sm)' }} />
              <h3 style={{ marginBottom: '4px' }}>AI 处理完成</h3>
              <p style={{ fontSize: '14px' }}>已根据你的内容偏好生成元数据</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, ...springs.pop }}
          >
            <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
              <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
                标题
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{result.title}</h3>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, ...springs.pop }}
          >
            <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
              <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
                概述
              </span>
              <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, ...springs.pop }}
          >
            <GlassCard style={{ marginBottom: 'var(--space-lg)' }}>
              <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
                标签
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {result.tags.map((tag) => (
                  <PillTag key={tag} selected>
                    {tag}
                  </PillTag>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <NeonButton variant="ghost" fullWidth onClick={() => setResult(null)}>
              重新输入
            </NeonButton>
            <NeonButton variant="primary" fullWidth onClick={handleSave}>
              保存到文章
            </NeonButton>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <TopBar title="内容捕获" showBack />

      <div style={{ padding: 'var(--space-md)' }}>
        {!mode ? (
          <motion.div
            variants={springs.STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', color: 'var(--on-surface-variant)', marginBottom: 'var(--space-sm)' }}
            >
              选择一种方式捕获内容
            </motion.p>

            {captureModes.map((m, i) => (
              <motion.div
                key={m.id}
                variants={springs.STAGGER_ITEM}
                whileTap={{ scale: 0.97 }}
              >
                <GlassCard
                  onClick={() => setMode(m.id)}
                  glowOnHover
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-lg)',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-lg)',
                      background: `${m.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <m.icon size={28} color={m.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{m.label}</h3>
                    <p style={{ fontSize: '14px', margin: 0 }}>{m.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            {/* Screenshot shortcut */}
            <motion.div variants={springs.STAGGER_ITEM} whileTap={{ scale: 0.97 }}>
              <GlassCard
                onClick={() => {}}
                glowOnHover
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-lg)',
                  border: '1px dashed var(--outline-variant)',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--surface-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Camera size={28} color="var(--outline)" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px', color: 'var(--outline)' }}>
                    截图识别
                  </h3>
                  <p style={{ fontSize: '14px', margin: 0, color: 'var(--outline)' }}>
                    使用悬浮窗或通知栏快捷方式截图
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={springs.smooth}
            >
              {mode === 'text' && (
                <>
                  <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="粘贴或输入文本内容..."
                      style={{
                        width: '100%',
                        minHeight: 200,
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--on-surface)',
                        fontSize: '15px',
                        fontFamily: 'var(--font-body)',
                        outline: 'none',
                        resize: 'vertical',
                        lineHeight: 1.6,
                      }}
                    />
                  </GlassCard>
                  <NeonButton
                    variant="primary"
                    fullWidth
                    disabled={!content.trim() || isProcessing}
                    onClick={handleProcess}
                    icon={isProcessing ? Loader2 : Sparkles}
                  >
                    {isProcessing ? 'AI 处理中...' : 'AI 智能处理'}
                  </NeonButton>
                </>
              )}

              {mode === 'link' && (
                <>
                  <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-sm)' }}>
                      <Link2 size={18} color="var(--outline)" />
                      <span style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
                        粘贴网页链接
                      </span>
                    </div>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      style={{
                        width: '100%',
                        padding: 'var(--space-sm)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--outline-variant)',
                        background: 'var(--surface-container-lowest)',
                        color: 'var(--on-surface)',
                        fontSize: '15px',
                        fontFamily: 'var(--font-body)',
                        outline: 'none',
                      }}
                    />
                  </GlassCard>
                  <NeonButton
                    variant="primary"
                    fullWidth
                    disabled={!linkUrl.trim() || isProcessing}
                    onClick={handleProcess}
                    icon={isProcessing ? Loader2 : Sparkles}
                  >
                    {isProcessing ? '抓取并分析中...' : '抓取并分析'}
                  </NeonButton>
                </>
              )}

              {mode === 'image' && (
                <>
                  <GlassCard
                    style={{
                      marginBottom: 'var(--space-md)',
                      minHeight: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed var(--outline-variant)',
                      cursor: 'pointer',
                    }}
                  >
                    <Image size={48} color="var(--outline)" style={{ marginBottom: 'var(--space-sm)' }} />
                    <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center' }}>
                      点击选择图片或拍照<br />
                      <span style={{ fontSize: '13px' }}>支持 JPG、PNG、WEBP</span>
                    </p>
                  </GlassCard>
                  <NeonButton
                    variant="primary"
                    fullWidth
                    disabled={isProcessing}
                    onClick={handleProcess}
                    icon={isProcessing ? Loader2 : Sparkles}
                  >
                    {isProcessing ? 'AI 识别中...' : 'AI 图片识别'}
                  </NeonButton>
                </>
              )}

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setMode(null);
                  setContent('');
                  setLinkUrl('');
                }}
                style={{
                  marginTop: 'var(--space-md)',
                  width: '100%',
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--on-surface-variant)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                返回选择其他方式
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </PageTransition>
  );
}

export default CapturePage;
