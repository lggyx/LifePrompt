/**
 * UserProfilePage - AI-guided user profile generation through conversation
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Loader2, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { springs, chatMessageVariants } from '../utils/animations';

const PROFILE_QUESTIONS = [
  {
    id: 'q1',
    question: '你好！我是你的 AI 助手。在接下来的几分钟里，我会问你几个问题，帮助我了解你的写作风格和偏好。准备好了吗？',
    type: 'intro',
  },
  {
    id: 'q2',
    question: '你平时的写作风格更偏向哪种？\nA) 正式专业\nB) 轻松随意\nC) 幽默风趣\nD) 深度分析',
    type: 'choice',
  },
  {
    id: 'q3',
    question: '当你看到一篇好文章时，你通常会记住它的什么？是核心观点、实用技巧、还是启发性的故事？',
    type: 'open',
  },
  {
    id: 'q4',
    question: '你喜欢什么样的标题风格？\nA) 简洁直接\nB) 引发好奇\nC) 数字列表式\nD) 问题式',
    type: 'choice',
  },
  {
    id: 'q5',
    question: '你常用的口头禅或表达方式有哪些？（例如："值得注意的是"、"本质上"、"从实践来看"）',
    type: 'open',
  },
  {
    id: 'q6',
    question: '你更倾向于阅读哪类内容？这会影响我为你推荐的标签。\nA) 技术/AI\nB) 效率/工具\nC) 思维/认知\nD) 创意/写作',
    type: 'choice',
  },
  {
    id: 'q7',
    question: '最后，你希望 AI 在生成概述时保持多长？\nA) 一句话\nB) 2-3句话\nC) 一段话\nD) 详细总结',
    type: 'choice',
  },
];

function UserProfilePage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: PROFILE_QUESTIONS[0].question,
      questionId: 'q1',
    },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [input, setInput] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const nextIndex = currentQuestionIndex + 1;

    setTimeout(() => {
      if (nextIndex < PROFILE_QUESTIONS.length) {
        const nextQ = PROFILE_QUESTIONS[nextIndex];
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: nextQ.question,
            questionId: nextQ.id,
          },
        ]);
        setCurrentQuestionIndex(nextIndex);
      } else {
        // All questions answered
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-complete-${Date.now()}`,
            role: 'assistant',
            content: '感谢你的回答！我已经了解了你的风格偏好。现在我可以为你生成个性化的约束文件，让 AI 更好地为你服务。',
          },
        ]);
        setIsComplete(true);
      }
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleComplete = () => {
    navigate('/');
  };

  const handleRestart = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: PROFILE_QUESTIONS[0].question,
        questionId: 'q1',
      },
    ]);
    setCurrentQuestionIndex(0);
    setIsComplete(false);
    setInput('');
  };

  const progress = ((currentQuestionIndex) / (PROFILE_QUESTIONS.length - 1)) * 100;

  return (
    <PageTransition>
      <TopBar title="用户画像" showBack />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100dvh - 56px)',
          overflow: 'hidden',
        }}
      >
        {/* Progress bar */}
        <div style={{ padding: 'var(--space-sm) var(--space-md)' }}>
          <div
            style={{
              height: 3,
              borderRadius: 'var(--radius-full)',
              background: 'var(--surface-container)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={springs.smooth}
              style={{
                height: '100%',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-container)',
                boxShadow: 'var(--glow-primary)',
              }}
            />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '4px', textAlign: 'center' }}>
            进度 {Math.round(progress)}%
          </p>
        </div>

        {/* Messages */}
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
                      background: 'var(--secondary-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: 'var(--glow-secondary)',
                    }}
                  >
                    <Sparkles size={16} color="var(--on-secondary-container)" />
                  </div>
                )}

                <GlassCard
                  hoverable={false}
                  padding="var(--space-sm) var(--space-md)"
                  style={{
                    maxWidth: '80%',
                    background:
                      msg.role === 'user'
                        ? 'var(--primary-container)'
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
                          ? 'var(--on-primary-container)'
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
                      background: 'var(--primary-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={16} color="var(--on-primary-container)" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
                  background: 'var(--secondary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={16} color="var(--on-secondary-container)" />
              </div>
              <GlassCard hoverable={false} padding="12px 16px">
                <Loader2 size={16} color="var(--primary)" className="spin" />
              </GlassCard>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Complete state */}
        {isComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 'var(--space-md)',
              borderTop: '1px solid var(--outline-variant)',
            }}
          >
            <GlassCard style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
              <CheckCircle2 size={32} color="var(--tertiary)" style={{ marginBottom: 'var(--space-sm)' }} />
              <h3 style={{ marginBottom: '4px' }}>用户画像已生成</h3>
              <p style={{ fontSize: '13px', margin: 0 }}>AI 将根据你的偏好个性化处理内容</p>
            </GlassCard>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <NeonButton variant="ghost" fullWidth onClick={handleRestart}>
                <RefreshCw size={16} /> 重新开始
              </NeonButton>
              <NeonButton variant="primary" fullWidth onClick={handleComplete}>
                进入应用
              </NeonButton>
            </div>
          </motion.div>
        ) : (
          /* Input */
          <div
            style={{
              padding: 'var(--space-md)',
              borderTop: '1px solid var(--outline-variant)',
            }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-end' }}>
              <GlassCard hoverable={false} padding="var(--space-sm) var(--space-md)" style={{ flex: 1 }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="输入你的回答..."
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
                  background: input.trim() && !isTyping ? 'var(--primary-container)' : 'var(--surface-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  flexShrink: 0,
                  boxShadow: input.trim() && !isTyping ? 'var(--glow-primary)' : 'none',
                }}
              >
                <Send
                  size={20}
                  color={input.trim() && !isTyping ? 'var(--on-primary-container)' : 'var(--on-surface-variant)'}
                />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default UserProfilePage;
