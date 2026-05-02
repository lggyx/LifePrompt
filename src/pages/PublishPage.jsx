/**
 * PublishPage - One-click article publishing workflow
 * Integrated with real AI publishFormat, Markdown preview, editing, AI refine dialog,
 * and media account selection from SQLite.
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
  ChevronDown,
  ShieldAlert,
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
import { mediaAccountsRepo } from '../services/storage/db';
import {
  PUBLISH_PLATFORMS,
  PUBLISH_PLATFORM_LABELS,
} from '../utils/constants';

const PLATFORM_ICONS = {
  [PUBLISH_PLATFORMS.WECHAT]: '📱',
  [PUBLISH_PLATFORMS.XIAOHONGSHU]: '📕',
  [PUBLISH_PLATFORMS.WEIBO]: '📢',
  [PUBLISH_PLATFORMS.ZHIHU]: '💡',
  [PUBLISH_PLATFORMS.JUEJIN]: '⚡',
  [PUBLISH_PLATFORMS.CUSTOM]: '🔧',
};

const PLATFORM_COLORS = {
  [PUBLISH_PLATFORMS.WECHAT]: '#07C160',
  [PUBLISH_PLATFORMS.XIAOHONGSHU]: '#FF2442',
  [PUBLISH_PLATFORMS.WEIBO]: '#E6162D',
  [PUBLISH_PLATFORMS.ZHIHU]: '#0084FF',
  [PUBLISH_PLATFORMS.JUEJIN]: '#1E80FF',
  [PUBLISH_PLATFORMS.CUSTOM]: 'var(--outline)',
};

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

  // Media accounts
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const textareaRef = useRef(null);
  const accountDropdownRef = useRef(null);

  // Load article and generate publish format on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Load media accounts
        try {
          const rows = mediaAccountsRepo.getActive();
          const parsed = rows.map((r) => ({ ...r, isActive: r.isActive === 1 }));
          setAccounts(parsed);
          if (parsed.length > 0 && !selectedAccountId) {
            setSelectedAccountId(parsed[0].id);
          }
        } catch (e) {
          console.warn('[PublishPage] load accounts failed:', e);
        }

        const article = getArticleById(Number(id));
        if (!article) {
          throw new Error('文章不存在');
        }
        setEditedTitle(article.title || '');
        setEditedContent(article.content || '');
        setStep('generating');

        const account = accounts.find((a) => a.id === selectedAccountId);
        const platform = account?.platform || 'wechat';
        const formatted = await publishFormat(article, platform);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
        setShowAccountDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const handlePublish = () => {
    if (accounts.length > 0 && !selectedAccountId) {
      useToastStore.getState().error('请先选择一个发布账号');
      return;
    }
    setStep('publishing');
    setTimeout(() => {
      setStep('success');
      useToastStore.getState().success('发布成功');
    }, 2000);
  };

  const handleRegenerate = async () => {
    setStep('generating');
    try {
      const article = getArticleById(Number(id));
      const account = accounts.find((a) => a.id === selectedAccountId);
      const platform = account?.platform || 'wechat';
      const formatted = await publishFormat(article, platform);
      setEditedContent(formatted);
      setStep('preview');
      useToastStore.getState().success('已根据新平台重新生成');
    } catch (err) {
      setStep('preview');
      useToastStore.getState().error(err.message || '重新生成失败');
    }
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
            正在根据{selectedAccount ? PUBLISH_PLATFORM_LABELS[selectedAccount.platform] : '微信公众号'}风格改写
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
          <h3 style={{ marginTop: 'var(--space-lg)' }}>
            正在发布到{selectedAccount ? PUBLISH_PLATFORM_LABELS[selectedAccount.platform] : '微信公众号'}...
          </h3>
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
            文章已成功发布到{selectedAccount ? PUBLISH_PLATFORM_LABELS[selectedAccount.platform] : '微信公众号'}<br />
            你可以在平台后台查看
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

        {/* Platform & Account Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...springs.pop }}
        >
          <GlassCard style={{ marginBottom: 'var(--space-lg)' }}>
            <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
              发布平台与账号
            </span>

            {accounts.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-sm) 0' }}>
                <ShieldAlert size={20} color="var(--outline)" />
                <span style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                  尚未配置媒体账号，
                </span>
                <button
                  onClick={() => navigate('/settings/media')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  去设置
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }} ref={accountDropdownRef}>
                <button
                  onClick={() => setShowAccountDropdown((prev) => !prev)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--outline-variant)',
                    background: 'var(--surface-container-lowest)',
                    color: 'var(--on-surface)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {selectedAccount ? (
                    <>
                      <span style={{ fontSize: '18px' }}>
                        {PLATFORM_ICONS[selectedAccount.platform]}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{selectedAccount.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                          {PUBLISH_PLATFORM_LABELS[selectedAccount.platform]}
                        </div>
                      </div>
                    </>
                  ) : (
                    <span style={{ color: 'var(--on-surface-variant)' }}>选择发布账号...</span>
                  )}
                  <ChevronDown
                    size={18}
                    color="var(--outline)"
                    style={{
                      transform: showAccountDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>

                <AnimatePresence>
                  {showAccountDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--surface)',
                        border: '1px solid var(--outline-variant)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--elevation-2)',
                        zIndex: 50,
                        maxHeight: 240,
                        overflowY: 'auto',
                      }}
                    >
                      {accounts.map((account) => (
                        <button
                          key={account.id}
                          onClick={() => {
                            setSelectedAccountId(account.id);
                            setShowAccountDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            padding: '10px var(--space-md)',
                            background: selectedAccountId === account.id ? 'var(--primary-container)' : 'transparent',
                            border: 'none',
                            borderBottom: '1px solid var(--outline-variant)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'var(--on-surface)',
                            fontSize: '14px',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>{PLATFORM_ICONS[account.platform]}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{account.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                              {PUBLISH_PLATFORM_LABELS[account.platform]}
                              {account.appId ? ` · ${account.appId}` : ''}
                            </div>
                          </div>
                          {selectedAccountId === account.id && (
                            <CheckCircle2 size={16} color="var(--primary)" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {selectedAccount && (
              <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <PillTag selected>
                  {PUBLISH_PLATFORM_LABELS[selectedAccount.platform]}
                </PillTag>
                <button
                  onClick={handleRegenerate}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 0',
                  }}
                >
                  <Sparkles size={14} /> 按此平台风格重新生成
                </button>
              </div>
            )}
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
