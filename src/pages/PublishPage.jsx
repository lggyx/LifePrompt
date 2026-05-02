/**
 * PublishPage - One-click article publishing workflow
 * Integrated with real AI publishFormat, Markdown preview, editing, and AI refine dialog
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Wand2,
  X,
  Sparkles,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import PillTag from '../components/ui/PillTag';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { springs } from '../utils/animations';
import { useAIChat } from '../hooks/useAIChat';
import useArticleStore from '../stores/useArticleStore';
import { useToastStore } from '../stores/useToastStore';

function PublishPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { publishFormat, refine } = useAIChat();
  const getArticleById = useArticleStore((state) => state.getArticleById);

  const [step, setStep] = useState('loading'); // loading | generating | preview | publishing | success | error
  const [errorMsg, setErrorMsg] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  // AI refinement dialog state
  const [showRefineDialog, setShowRefineDialog] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showRefineButton, setShowRefineButton] = useState(false);
  const [refineButtonPos, setRefineButtonPos] = useState({ x: 0, y: 0 });

  const textareaRef = useRef(null);

  // Load article and generate publish format on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const article = getArticleById(Number(id));
        if (!article) {
          throw new Error('文章不存在');
        }
        setEditedTitle(article.title || '');
        setEditedContent(article.content || '');
        setStep('generating');

        const formatted = await publishFormat(article, 'wechat');
        if (cancelled) return;

        setEditedContent(formatted);
        setStep('preview');
      } catch (err) {
        if (cancelled) return;
        const msg = err.message || '加载失败';
        setErrorMsg(msg);
        setStep('error');
        useToastStore.getState().error(msg);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [id, getArticleById, publishFormat]);

  // Handle text selection in textarea
  const handleTextareaMouseUp = useCallback((e) => {
    setTimeout(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const text = ta.value.slice(start, end);
      if (text && text.trim().length > 0) {
        setSelectedText(text);
        setSelectionRange({ start, end });
        setRefineButtonPos({ x: e.clientX, y: e.clientY - 48 });
        setShowRefineButton(true);
      } else {
        setShowRefineButton(false);
      }
    }, 10);
  }, []);

  const handleOpenRefineDialog = useCallback(() => {
    setShowRefineDialog(true);
    setShowRefineButton(false);
  }, []);

  const handleRefine = async () => {
    if (!refineInstruction.trim() || !selectedText) return;

    setIsRefining(true);
    try {
      const newText = await refine(selectedText, refineInstruction.trim());
      const { start, end } = selectionRange;
      const before = editedContent.slice(0, start);
      const after = editedContent.slice(end);
      setEditedContent(before + newText + after);
      useToastStore.getState().success('AI 改写完成');
      setShowRefineDialog(false);
      setRefineInstruction('');
      setShowRefineButton(false);
    } catch (err) {
      useToastStore.getState().error(err.message || 'AI 改写失败');
    } finally {
      setIsRefining(false);
    }
  };

  const handlePublish = () => {
    setStep('publishing');
    setTimeout(() => {
      setStep('success');
      useToastStore.getState().success('发布成功');
    }, 2000);
  };

  if (step === 'loading') {
    return (
      <PageTransition>
        <TopBar title="加载中" showBack />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100dvh - 56px)',
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={48} color="var(--primary)" />
          </motion.div>
          <h3 style={{ marginTop: 'var(--space-lg)' }}>加载文章中...</h3>
        </div>
      </PageTransition>
    );
  }

  if (step === 'generating') {
    return (
      <PageTransition>
        <TopBar title="生成发布内容" showBack />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100dvh - 56px)',
          padding: 'var(--space-md)',
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={48} color="var(--primary)" />
          </motion.div>
          <h3 style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-sm)' }}>
            AI 正在改写发布内容...
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
            正在根据微信公众号风格改写
          </p>
        </div>
      </PageTransition>
    );
  }

  if (step === 'error') {
    return (
      <PageTransition>
        <TopBar title="出错了" showBack onBack={() => navigate(-1)} />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100dvh - 56px)',
          padding: 'var(--space-md)',
        }}>
          <AlertCircle size={64} color="var(--error)" style={{ marginBottom: 'var(--space-md)' }} />
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>加载失败</h3>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', textAlign: 'center' }}>
            {errorMsg}
          </p>
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <NeonButton variant="primary" onClick={() => navigate(-1)}>
              返回
            </NeonButton>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (step === 'publishing') {
    return (
      <PageTransition>
        <TopBar title="发布中" showBack />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100dvh - 56px)',
        }}>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Send size={48} color="var(--primary)" />
          </motion.div>
          <h3 style={{ marginTop: 'var(--space-lg)' }}>正在发布到微信公众号...</h3>
        </div>
      </PageTransition>
    );
  }

  if (step === 'success') {
    return (
      <PageTransition>
        <TopBar title="发布成功" showBack />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100dvh - 56px)',
          padding: 'var(--space-md)',
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={springs.bounce}
          >
            <CheckCircle2 size={64} color="var(--tertiary)" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...springs.pop }}
            style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-sm)' }}
          >
            发布成功！
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}
          >
            文章已成功发布到微信公众号<br />
            你可以在公众号后台查看
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ...springs.pop }}
            style={{ display: 'flex', gap: 'var(--space-sm)', width: '100%', maxWidth: 320 }}
          >
            <NeonButton variant="ghost" fullWidth onClick={() => navigate('/articles')}>
              返回文章列表
            </NeonButton>
            <NeonButton variant="primary" fullWidth onClick={() => {}}>
              <ExternalLink size={16} /> 查看文章
            </NeonButton>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // ========== Preview Step ==========
  return (
    <PageTransition>
      <TopBar title="发布文章" showBack />
      <div style={{ padding: 'var(--space-md)', position: 'relative' }}>
        {/* Title edit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.pop}
        >
          <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
            <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
              标题
            </span>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                background: 'var(--surface-container-lowest)',
                color: 'var(--on-surface)',
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
            />
          </GlassCard>
        </motion.div>

        {/* Content edit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...springs.pop }}
        >
          <GlassCard style={{ marginBottom: 'var(--space-md)', position: 'relative' }}>
            <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
              内容编辑
            </span>
            <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: '0 0 8px' }}>
              选中文本后点击「AI 微调」进行局部改写
            </p>
            <textarea
              ref={textareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onMouseUp={handleTextareaMouseUp}
              placeholder="在此编辑文章内容，选中文本可使用 AI 微调..."
              style={{
                width: '100%',
                minHeight: 200,
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                background: 'var(--surface-container-lowest)',
                color: 'var(--on-surface)',
                fontSize: '14px',
                lineHeight: 1.8,
                fontFamily: 'var(--font-body)',
                outline: 'none',
                resize: 'vertical',
              }}
            />
            {showRefineButton && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={handleOpenRefineDialog}
                style={{
                  position: 'fixed',
                  left: refineButtonPos.x,
                  top: refineButtonPos.y,
                  transform: 'translate(-50%, -100%)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: 'var(--glow-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 100,
                  whiteSpace: 'nowrap',
                }}
              >
                <Wand2 size={14} /> AI 微调
              </motion.button>
            )}
          </GlassCard>
        </motion.div>

        {/* Markdown preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ...springs.pop }}
        >
          <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
            <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
              Markdown 预览
            </span>
            <div
              style={{
                maxHeight: 300,
                overflowY: 'auto',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-container-lowest)',
                padding: 'var(--space-sm)',
              }}
            >
              <MarkdownRenderer content={editedContent} />
            </div>
          </GlassCard>
        </motion.div>

        {/* Platform */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...springs.pop }}
        >
          <GlassCard style={{ marginBottom: 'var(--space-lg)' }}>
            <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
              发布平台
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <PillTag selected>微信公众号</PillTag>
              <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                更多平台即将支持...
              </span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: 'var(--space-sm)' }}
        >
          <NeonButton variant="ghost" fullWidth onClick={() => navigate(-1)}>
            取消
          </NeonButton>
          <NeonButton variant="primary" fullWidth onClick={handlePublish}>
            <Send size={16} /> 确认发布
          </NeonButton>
        </motion.div>

        {/* AI Refine Dialog */}
        <AnimatePresence>
          {showRefineDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 200,
                padding: 'var(--space-md)',
              }}
              onClick={() => setShowRefineDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={springs.pop}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: 480,
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--outline-variant)',
                  boxShadow: 'var(--elevation-3)',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  padding: 'var(--space-md)',
                  borderBottom: '1px solid var(--outline-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={18} color="var(--primary)" /> AI 微调
                  </h3>
                  <button
                    onClick={() => setShowRefineDialog(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div>
                    <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                      选中的文本
                    </span>
                    <div style={{
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-container-lowest)',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      maxHeight: 120,
                      overflowY: 'auto',
                      color: 'var(--on-surface-variant)',
                    }}>
                      {selectedText}
                    </div>
                  </div>

                  <div>
                    <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                      修改指令
                    </span>
                    <textarea
                      value={refineInstruction}
                      onChange={(e) => setRefineInstruction(e.target.value)}
                      placeholder="例如：把这段写得更专业、更简洁、增加数据支撑..."
                      style={{
                        width: '100%',
                        minHeight: 80,
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--outline-variant)',
                        background: 'var(--surface-container-lowest)',
                        color: 'var(--on-surface)',
                        fontSize: '14px',
                        fontFamily: 'var(--font-body)',
                        outline: 'none',
                        resize: 'vertical',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>

                  <NeonButton
                    variant="primary"
                    fullWidth
                    disabled={!refineInstruction.trim() || isRefining}
                    onClick={handleRefine}
                    icon={isRefining ? Loader2 : Wand2}
                  >
                    {isRefining ? 'AI 改写中...' : '确认改写'}
                  </NeonButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

export default PublishPage;
