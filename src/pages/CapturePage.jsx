/**
 * CapturePage — Content capture hub (text · link · image)
 * Updated: unified CaptureService integration, real AI analysis for all three modes.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Link2,
  Type,
  Image,
  Sparkles,
  Loader2,
  CheckCircle2,
  Save,
  Send,
  AlertCircle,
  ClipboardPaste,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import PillTag from '../components/ui/PillTag';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { springs } from '../utils/animations';
import useAIStore from '../stores/useAIStore';
import useArticleStore from '../stores/useArticleStore';
import { useToastStore } from '../stores/useToastStore';
import { CAPTURE_TYPE } from '../services/capture/index';

/* ======================== MODE CARDS ======================== */

const CAPTURE_MODES = [
  {
    id: CAPTURE_TYPE.TEXT,
    label: '文本',
    icon: Type,
    description: '粘贴或输入文本内容',
    color: 'var(--primary)',
  },
  {
    id: CAPTURE_TYPE.LINK,
    label: '链接',
    icon: Link2,
    description: '粘贴网页链接自动抓取',
    color: 'var(--secondary)',
  },
  {
    id: CAPTURE_TYPE.IMAGE,
    label: '图片',
    icon: Image,
    description: '上传图片，AI 视觉识别',
    color: 'var(--tertiary)',
  },
];

/* ================================================================ */

function CapturePage() {
  const navigate = useNavigate();
  const { getActiveConfig } = useAIStore();
  const createArticle = useArticleStore((s) => s.createArticle);
  const toast = useToastStore();

  /* ---- State ---- */
  const [mode, setMode] = useState(null);
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [clipboardDetected, setClipboardDetected] = useState(false);

  const fileInputRef = useRef(null);

  /* ---- Persist uploaded images in memory ---- */
  const [, forceUpdate] = useState(0);

  /* ======================== RESET ======================== */

  const resetAll = useCallback(() => {
    setMode(null);
    setContent('');
    setLinkUrl('');
    setImagePreview(null);
    setImageName('');
    setResult(null);
    setError(null);
    setClipboardDetected(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  /* ======================== CLIPBOARD ======================== */

  useEffect(() => {
    if (mode !== CAPTURE_TYPE.LINK) return;

    let mounted = true;
    (async () => {
      try {
        const text = await navigator.clipboard?.readText?.();
        if (!mounted) return;
        if (text?.trim()) {
          const url = CAPTURE_TYPE.detectUrl(text);
          if (url) {
            setLinkUrl(url);
            setClipboardDetected(true);
            return;
          }
        }
      } catch {
        // Clipboard read permission denied — silently skip
      }
    })();

    return () => { mounted = false; };
  }, [mode]);

  /* ======================== PROCESS ======================== */

  const handleProcess = useCallback(async () => {
    if (isProcessing) return;

    const aiConfig = getActiveConfig();
    if (!aiConfig) {
      setError('请先到「设置 → AI 配置」添加并激活一个 AI 模型');
      toast.error('请先配置 AI 模型');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Dynamic import — code-splits the capture layer
      const { CaptureService } = await import('../services/capture/index');
      let generated;

      if (mode === CAPTURE_TYPE.TEXT) {
        if (!content.trim()) throw new Error('内容不能为空');
        generated = await CaptureService.captureText(content, aiConfig);

      } else if (mode === CAPTURE_TYPE.LINK) {
        const url = linkUrl.trim();
        if (!url) throw new Error('请输入网页链接');
        generated = await CaptureService.captureLink(linkUrl, aiConfig);

      } else if (mode === CAPTURE_TYPE.IMAGE) {
        if (!imagePreview) throw new Error('请先选择图片');
        generated = await CaptureService.captureImage(
          imagePreview,
          'image/jpeg',
          imageName || 'image.jpg',
          aiConfig
        );
      }

      if (!generated?.title) generated.title = '未命名笔记';
      setResult(generated);
      toast.success('AI 处理完成 ✨');
    } catch (err) {
      const msg = err.message || String(err) || '处理失败，请重试';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [mode, content, linkUrl, imagePreview, imageName, isProcessing, getActiveConfig, toast]);

  /* ======================== SAVE ======================== */

  const handleSave = useCallback(
    async (goPublish = false) => {
      if (!result) return;

      try {
        const articleId = await createArticle({
          title: result.title,
          summary: result.summary,
          content: result.content,
          sourceType: result.sourceType ?? CAPTURE_TYPE.TEXT,
          sourceUrl: result.sourceUrl ?? null,
          screenshotData: result.screenshotData ?? null,
          tags: result.tags || [],
          aiGeneratedTitle: result.title,
          aiGeneratedSummary: result.summary,
        });

        toast.success('已保存到文章库 ✅');

        if (goPublish) {
          navigate(`/publish/${articleId}`);
        } else {
          navigate('/articles');
        }
      } catch (err) {
        const msg = err.message || '保存失败';
        toast.error(msg);
      }
    },
    [result, createArticle, navigate, toast]
  );

  /* ======================== IMAGE UPLOAD ======================== */

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size guard: 10 MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片不能超过 10 MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }, [toast]);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setImageName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  /* ================================================================
     RENDER — Result View
  ================================================================ */

  if (result) {
    return (
      <PageTransition>
        <TopBar title="处理结果" showBack onBack={() => setResult(null)} />
        <div style={{ padding: 'var(--space-md)' }}>
          {/* Success card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
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
              <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                已根据你的 AI 配置生成元数据
              </p>
            </GlassCard>
          </motion.div>

          {/* Title */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08, ...springs.pop }}>
            <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
              <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>标题</span>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{result.title}</h3>
            </GlassCard>
          </motion.div>

          {/* Summary */}
          {result.summary && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.14, ...springs.pop }}>
              <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
                <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>摘要</span>
                <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
              </GlassCard>
            </motion.div>
          )}

          {/* Content preview */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, ...springs.pop }}>
            <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
              <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>正文预览</span>
              <div style={{ maxHeight: 240, overflowY: 'auto', borderRadius: 'var(--radius-md)', background: 'var(--surface-container-lowest)', padding: 'var(--space-sm)' }}>
                <MarkdownRenderer content={result.content} />
              </div>
            </GlassCard>
          </motion.div>

          {/* Tags */}
          {result.tags?.length > 0 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.26, ...springs.pop }}>
              <GlassCard style={{ marginBottom: 'var(--space-lg)' }}>
                <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>标签</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {result.tags.map((tag) => (
                    <PillTag key={tag} selected>{tag}</PillTag>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: 'flex', gap: 'var(--space-sm)', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <NeonButton variant="ghost" fullWidth onClick={() => setResult(null)}>重新输入</NeonButton>
              <NeonButton variant="primary" fullWidth onClick={() => handleSave(false)} icon={Save}>保存到文章</NeonButton>
            </div>
            <NeonButton variant="secondary" fullWidth onClick={() => handleSave(true)} icon={Send}>保存并去发布</NeonButton>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  /* ================================================================
     RENDER — Capture Form Cards
  ================================================================ */

  if (!mode) {
    return (
      <PageTransition>
        <TopBar title="内容捕获" />
        <div style={{ padding: 'var(--space-md)' }}>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', color: 'var(--on-surface-variant)', marginBottom: 'var(--space-md)' }}
          >
            选择一种方式捕获内容
          </motion.p>
          {CAPTURE_MODES.map((m) => (
            <motion.div key={m.id} variants={springs.STAGGER_ITEM} whileTap={{ scale: 0.97 }} style={{ marginBottom: 'var(--space-md)' }}>
              <GlassCard
                onClick={() => setMode(m.id)}
                glowOnHover
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: `${m.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <m.icon size={28} color={m.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{m.label}</h3>
                  <p style={{ fontSize: '14px', margin: 0, color: 'var(--on-surface-variant)' }}>{m.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          {/* Screenshot shortcut (placeholder — native floating window, TBD in stage 7) */}
          <motion.div variants={springs.STAGGER_ITEM} whileTap={{ scale: 0.97 }} style={{ marginBottom: 'var(--space-md)' }}>
            <GlassCard
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)', border: '1px dashed var(--outline-variant)' }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Camera size={28} color="var(--outline)" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px', color: 'var(--outline)' }}>截图识别</h3>
                <p style={{ fontSize: '14px', margin: 0, color: 'var(--outline)' }}>使用悬浮窗或通知栏快捷方式截图</p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  /* ================================================================
     RENDER — Mode Form
  ================================================================ */

  return (
    <PageTransition>
      <TopBar title={`内容捕获 · ${
        mode === CAPTURE_TYPE.TEXT ? '文本' :
        mode === CAPTURE_TYPE.LINK ? '链接' : '图片'
      }`} showBack onBack={resetAll} />

      <div style={{ padding: 'var(--space-md)' }}>
        {error && (
          <GlassCard style={{ marginBottom: 'var(--space-md)', border: '1px solid var(--error)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)' }}>
            <AlertCircle size={18} color="var(--error)" />
            <span style={{ fontSize: '14px', color: 'var(--error)' }}>{error}</span>
          </GlassCard>
        )}

        {/* ---- TEXT MODE ---- */}
        {mode === CAPTURE_TYPE.TEXT && (
          <>
            <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="粘贴或输入文本内容…"
                style={{ width: '100%', minHeight: 200, border: 'none', background: 'transparent', color: 'var(--on-surface)', fontSize: '15px', fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
              />
            </GlassCard>
            <NeonButton variant="primary" fullWidth disabled={!content.trim() || isProcessing} onClick={handleProcess} icon={isProcessing ? Loader2 : Sparkles}>
              {isProcessing ? 'AI 处理中…' : 'AI 智能处理'}
            </NeonButton>
          </>
        )}

        {/* ---- LINK MODE ---- */}
        {mode === CAPTURE_TYPE.LINK && (
          <>
            {clipboardDetected && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '13px', marginBottom: 'var(--space-sm)' }}>
                📋 检测到剪贴板中的链接，已帮你自动填写
              </motion.p>
            )}
            <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-sm)' }}>
                <Link2 size={18} color="var(--outline)" />
                <span style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>粘贴网页链接</span>
              </div>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => { setLinkUrl(e.target.value); setClipboardDetected(false); }}
                placeholder="https://example.com/article"
                style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', fontSize: '15px', fontFamily: 'var(--font-body)', outline: 'none' }}
              />
            </GlassCard>
            <NeonButton variant="primary" fullWidth disabled={!linkUrl.trim() || isProcessing} onClick={handleProcess} icon={isProcessing ? Loader2 : Sparkles}>
              {isProcessing ? '抓取并分析中…' : '抓取并分析'}
            </NeonButton>
          </>
        )}

        {/* ---- IMAGE MODE ---- */}
        {mode === CAPTURE_TYPE.IMAGE && (
          <>
            <GlassCard
              onClick={() => fileInputRef.current?.click()}
              glowOnHover
              style={{
                marginBottom: 'var(--space-md)',
                minHeight: imagePreview ? 200 : 200,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: imagePreview ? 'flex-start' : 'center',
                border: imagePreview ? '1px solid var(--outline-variant)' : '2px dashed var(--outline-variant)',
                cursor: 'pointer',
                padding: imagePreview ? 'var(--space-sm)' : 0,
                overflow: 'hidden',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
              {imagePreview ? (
                <div style={{ width: '100%' }}>
                  <img src={imagePreview} alt="Preview"
                    style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 'var(--radius-md)', display: 'block' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-sm)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{imageName}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '13px', cursor: 'pointer' }}
                    >移除</button>
                  </div>
                </div>
              ) : (
                <>
                  <Image size={48} color="var(--outline)" style={{ marginBottom: 'var(--space-sm)' }} />
                  <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center', margin: 0 }}>
                    点击选择图片或拍照<br /><span style={{ fontSize: '13px' }}>支持 JPG、PNG、WEBP，不超过 10 MB</span>
                  </p>
                </>
              )}
            </GlassCard>
            <NeonButton variant="primary" fullWidth disabled={!imagePreview || isProcessing} onClick={handleProcess} icon={isProcessing ? Loader2 : Sparkles}>
              {isProcessing ? 'AI 图片识别中…' : 'AI 图片识别'}
            </NeonButton>
          </>
        )}
      </div>

      {/* Return footer */}
      <AnimatePresence>
        {mode && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
            <div style={{ padding: 'var(--space-md)', paddingTop: 0 }}>
              <button
                onClick={resetAll}
                style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: 'none',
                  background: 'transparent', color: 'var(--on-surface-variant)', fontSize: '14px', cursor: 'pointer' }}
              >
                返回选择其他方式
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export default CapturePage;
