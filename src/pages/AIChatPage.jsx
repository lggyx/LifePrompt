/**
 * AIChatPage - AI dialog interface with local article context
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import { springs, chatMessageVariants, typingDotVariants } from '../utils/animations';

function AIChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的 AI 助手。你可以问我关于你收藏的文章的问题，或者让我帮你总结、分类、生成内容。',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response with typing effect
    setTimeout(() => {
      const responses = [
        '根据你收藏的文章，关于第二大脑系统，我可以为你总结几个核心要点：PARA 方法、渐进式总结和笔记链接。你想深入了解哪个方面？',
        '我发现你有3篇关于AI辅助写作的文章。需要我帮你生成一个综合总结吗？',
        '基于你的阅读习惯，我建议给这篇文章打上"效率"和"知识管理"的标签。你觉得如何？',
        '这是根据你提供的链接内容生成的标题建议：\n1. 如何构建个人知识管理系统\n2. 从信息囤积到知识创造\n3. 第二大脑方法论实践指南',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: randomResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
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

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100dvh - 56px - 64px - env(safe-area-inset-bottom, 0px))',
          overflow: 'hidden',
        }}
      >
        {/* Messages area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
          }}
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
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
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--primary-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: 'var(--glow-primary)',
                    }}
                  >
                    <Bot size={16} color="var(--on-primary-container)" />
                  </div>
                )}

                <GlassCard
                  hoverable={false}
                  padding="var(--space-sm) var(--space-md)"
                  style={{
                    maxWidth: '75%',
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
                  <p
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color:
                        msg.role === 'user'
                          ? 'var(--on-secondary-container)'
                          : 'var(--on-surface)',
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                    }}
                  >
                    {msg.content}
                  </p>
                </GlassCard>

                {msg.role === 'user' && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--secondary-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={16} color="var(--on-secondary-container)" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: 'var(--glow-primary)',
                  }}
                >
                  <Bot size={16} color="var(--on-primary-container)" />
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

          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions */}
        {!isTyping && messages.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '0 var(--space-md)',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              marginBottom: 'var(--space-sm)',
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
              padding="var(--space-sm) var(--space-md)"
              style={{ flex: 1 }}
            >
              <textarea
                ref={inputRef}
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
                }}
              />
            </GlassCard>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background:
                  input.trim() && !isTyping
                    ? 'var(--primary-container)'
                    : 'var(--surface-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                flexShrink: 0,
                boxShadow:
                  input.trim() && !isTyping
                    ? 'var(--glow-primary)'
                    : 'none',
              }}
            >
              {isTyping ? (
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
