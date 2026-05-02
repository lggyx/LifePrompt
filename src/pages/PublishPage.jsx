/**
 * PublishPage - One-click article publishing workflow
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Loader2,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import PillTag from '../components/ui/PillTag';
import { springs } from '../utils/animations';

function PublishPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('generating'); // generating | preview | publishing | success | error
  const [progress, setProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  // Simulate generation
  useState(() => {
    if (step === 'generating') {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              const content = {
                title: '如何构建高效的第二大脑系统：从理论到实践',
                content: `在信息爆炸的时代，我们每天都在接收海量的信息。但真正有价值的是那些经过整理、连接和输出的知识。

## 什么是第二大脑

第二大脑是一种外部化的个人知识管理系统。它不仅仅是一个笔记工具，而是你思维的延伸。

## 为什么需要第二大脑

1. **认知卸载**：将记忆负担转移给系统
2. **连接想法**：发现不同领域之间的关联
3. **复利效应**：知识资产随时间增值

## 如何开始

从小处着手，先建立收集的习惯，再逐步完善整理和输出的流程。`,
                platform: 'wechat',
              };
              setGeneratedContent(content);
              setEditedTitle(content.title);
              setEditedContent(content.content);
              setStep('preview');
            }, 500);
            return 100;
          }
          return p + Math.random() * 15;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  });

  const handlePublish = () => {
    setStep('publishing');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  if (step === 'generating') {
    return (
      <PageTransition>
        <TopBar title="生成文章中" showBack />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100dvh - 56px)',
            padding: 'var(--space-md)',
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={48} color="var(--primary)" />
          </motion.div>
          <h3 style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-sm)' }}>
            AI 正在生成文章...
          </h3>
          <div
            style={{
              width: '100%',
              maxWidth: 300,
              height: 4,
              borderRadius: 'var(--radius-full)',
              background: 'var(--surface-container)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ width: `${Math.min(progress, 100)}%` }}
              style={{
                height: '100%',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-container)',
                boxShadow: 'var(--glow-primary)',
              }}
            />
          </div>
          <p style={{ marginTop: 'var(--space-sm)', fontSize: '14px' }}>
            {progress < 30 && '分析原文内容...'}
            {progress >= 30 && progress < 60 && '生成文章结构...'}
            {progress >= 60 && progress < 90 && '润色语言表达...'}
            {progress >= 90 && '即将完成...'}
          </p>
        </div>
      </PageTransition>
    );
  }

  if (step === 'publishing') {
    return (
      <PageTransition>
        <TopBar title="发布中" showBack />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100dvh - 56px)',
          }}
        >
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100dvh - 56px)',
            padding: 'var(--space-md)',
          }}
        >
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

  return (
    <PageTransition>
      <TopBar title="发布文章" showBack />
      <div style={{ padding: 'var(--space-md)' }}>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...springs.pop }}
        >
          <GlassCard style={{ marginBottom: 'var(--space-md)' }}>
            <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '8px', display: 'block' }}>
              内容预览
            </span>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              style={{
                width: '100%',
                minHeight: 300,
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
          </GlassCard>
        </motion.div>

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
      </div>
    </PageTransition>
  );
}

export default PublishPage;
