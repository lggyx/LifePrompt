/**
 * AIChatPage - AI dialog interface with local article context
 * Connected to real AI service via useAIChat hook
 * Mobile-first responsive layout
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { chatMessageVariants, typingDotVariants } from '../utils/animations';
import { useAIChat } from '../hooks/useAIChat';
import { useArticles } from '../hooks/useArticles';

function AIChatPage() {
  const {
    messages,
    isLoading,
    error,
    streamingContent,
    sendMessage,
    clearMessages,
    resetError,
  } = useAIChat();
  const { articles } = useArticles();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isLoading, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const content = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(content, {
      articles: articles.slice(0, 5),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: '总结文章', icon: Sparkles },
    { label: '生成标题', icon: Sparkles },
    { label: '推荐标签', icon: Sparkles },
    { label: '知识问答', icon: Sparkles },
  ];

  return (
    <PageTransition>
      <TopBar title="AI 助手" />

      {/*
        页面根容器：
        - 不设置固定 height，依靠 AppShell.main 的 flex:1 自然填充
        - 使用 flex column 让消息区域自动占满剩余空间
      */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        }}
      >
        {/* Messages area */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
          }}
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={`${msg.id || msg.createdAt}`}
                variants={chatMessageVariants}
                initial="hidden"
                animate="visible"
                layout
                style={{
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  alignItems: 'flex-start',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--primary-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                      boxShadow: 'var(--glow-primary)',
                    }}
                  >
                    <Bot size={14} color="var(--on-primary-container)" />
                  </div>
                )}

                <GlassCard
                  hoverable={false}
                  padding="10px 14px"
                  style={{
                    maxWidth: 'min(85%, 520px)',
                    background:
                      msg.role === 'user'
                        ? 'var(--secondary-container)'
                        : 'var(--glass-bg)',
                    borderRadius:
                      msg.role === 'user'
                        ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)'
                        : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownRenderer
                      content={msg.content}
                      style={{ fontSize: '14px', lineHeight: 1.6 }}
                    />
                  ) : (
                    <p
                      style={{
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: 'var(--on-secondary-container)',
                        whiteSpace: 'pre-wrap',
                        margin: 0,
                      }}
                    >
                      {msg.content}
                    </p>
                  )}
                </GlassCard>

                {msg.role === 'user' && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--secondary-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <User size={14} color="var(--on-secondary-container)" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Streaming indicator */}
            {isLoading && streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                    boxShadow: 'var(--glow-primary)',
                  }}
                >
                  <Bot size={14} color="var(--on-primary-container)" />
                </div>
                <GlassCard
                  hoverable={false}
                  padding="10px 14px"
                  style={{ maxWidth: 'min(85%, 520px)' }}
                >
                  <MarkdownRenderer
                    content={streamingContent}
                    style={{ fontSize: '14px', lineHeight: 1.6 }}
                  />
                </GlassCard>
              </motion.div>
            )}

            {/* Typing indicator */}
            {isLoading && !streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                    boxShadow: 'var(--glow-primary)',
                  }}
                >
                  <Bot size={14} color="var(--on-primary-container)" />
                </div>
                <GlassCard hoverable={false} padding="12px 16px">
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        custom={i}
                        variants={typingDotVariants}
                        animate="animate"
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--primary)',
                        }}
                      />
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                background: 'var(--error-container)',
                color: 'var(--error)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={resetError}
            >
              {error} (点击关闭)
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions */}
        {!isLoading && messages.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '0 var(--space-md)',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              marginBottom: 'var(--space-sm)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {quickActions.map((action) => (
              <motion.button
                key={action.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setInput(action.label);
                  inputRef.current?.focus();
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container)',
                  color: 'var(--on-surface-variant)',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <action.icon size={14} />
                {action.label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Input area */}
        <div
          style={{
            padding: 'var(--space-md)',
            borderTop: '1px solid var(--outline-variant)',
            background: 'var(--surface)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              alignItems: 'flex-end',
            }}
          >
            <GlassCard
              hoverable={false}
              padding="10px 14px"
              style={{ flex: 1 }}
            >
              <textarea
                ref={(el) => {
                  textareaRef.current = el;
                  inputRef.current = el;
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                rows={1}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--on-surface)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  resize: 'none',
                  maxHeight: 120,
                  lineHeight: 1.5,
                  overflowY: 'auto',
                }}
              />
            </GlassCard>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background:
                  input.trim() && !isLoading
                    ? 'var(--primary-container)'
                    : 'var(--surface-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                flexShrink: 0,
                boxShadow:
                  input.trim() && !isLoading
                    ? 'var(--glow-primary)'
                    : 'none',
              }}
            >
              {isLoading ? (
                <Loader2 size={20} color="var(--on-surface-variant)" className="spin" />
              ) : (
                <Send
                  size={20}
                  color={
                    input.trim()
                      ? 'var(--on-primary-container)'
                      : 'var(--on-surface-variant)'
                  }
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default AIChatPage;
