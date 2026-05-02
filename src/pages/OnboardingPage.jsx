/**
 * OnboardingPage - First-time user onboarding flow
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Shield, Rocket, ChevronRight, SkipForward } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { onboardingSlideVariants, springs } from '../utils/animations';

const ONBOARDING_SLIDES = [
  {
    icon: Brain,
    title: '欢迎来到 LifePrompt',
    description: '你的个人知识管理助手。通过 AI 的力量，将碎片化的信息转化为结构化的知识资产。',
    color: 'var(--primary)',
  },
  {
    icon: Sparkles,
    title: 'AI 智能处理',
    description: '截图、链接、眼镜图片——无论什么来源，AI 都能自动识别内容，生成标题、概述和标签。',
    color: 'var(--secondary)',
  },
  {
    icon: Shield,
    title: '个性化体验',
    description: '通过简单的对话，让 AI 了解你的写作风格。之后的每一次处理，都会更加贴合你的表达习惯。',
    color: 'var(--tertiary)',
  },
  {
    icon: Rocket,
    title: '准备好开始了',
    description: '配置你的 AI 模型，生成用户画像，然后开始捕获和整理你的知识吧！',
    color: 'var(--primary)',
  },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextSlide = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    } else {
      navigate('/onboarding/profile');
    }
  };

  const skip = () => {
    navigate('/');
  };

  const slide = ONBOARDING_SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <PageTransition>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Skip button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={skip}
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
            right: '16px',
            zIndex: 10,
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--outline-variant)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            color: 'var(--on-surface-variant)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <SkipForward size={14} /> 跳过
        </motion.button>

        {/* Slide content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-xl)',
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={onboardingSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                width: '100%',
                maxWidth: 400,
                textAlign: 'center',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 'var(--radius-2xl)',
                  background: `${slide.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-lg)',
                  boxShadow: `0 0 30px ${slide.color}20`,
                }}
              >
                <Icon size={48} color={slide.color} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ...springs.pop }}
                style={{ marginBottom: 'var(--space-md)', fontSize: '24px' }}
              >
                {slide.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ...springs.pop }}
                style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: 'var(--on-surface-variant)',
                }}
              >
                {slide.description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom controls */}
        <div
          style={{
            padding: 'var(--space-lg) var(--space-xl) calc(var(--space-lg) + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: 'var(--space-lg)',
            }}
          >
            {ONBOARDING_SLIDES.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === currentSlide ? 24 : 8,
                  backgroundColor: i === currentSlide ? slide.color : 'var(--outline-variant)',
                }}
                transition={springs.smooth}
                style={{
                  height: 8,
                  borderRadius: 'var(--radius-full)',
                }}
              />
            ))}
          </div>

          {/* Next button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <NeonButton
              variant="primary"
              fullWidth
              size="lg"
              onClick={nextSlide}
              icon={ChevronRight}
            >
              {currentSlide === ONBOARDING_SLIDES.length - 1 ? '开始配置' : '下一步'}
            </NeonButton>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default OnboardingPage;
