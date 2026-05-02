/**
 * Framer Motion Animation Variants & Configurations
 */

import { ANIMATION } from './constants';

// ===== SPRING PRESETS =====
export const springs = {
  pop: ANIMATION.SPRING_POP,
  smooth: ANIMATION.SPRING_SMOOTH,
  press: ANIMATION.SPRING_PRESS,
  bounce: ANIMATION.SPRING_BOUNCE,
  STAGGER_CONTAINER: ANIMATION.STAGGER_CONTAINER,
  STAGGER_ITEM: ANIMATION.STAGGER_ITEM,
};

// ===== PAGE TRANSITIONS =====
export const pageVariants = {
  initial: { opacity: 0, x: 20, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -20, scale: 0.98 },
};

export const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// ===== LIST STAGGER =====
export const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION.STAGGER_CHILDREN,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.pop,
  },
};

// ===== CARD ANIMATIONS =====
export const cardVariants = {
  rest: {
    scale: 1,
    y: 0,
    transition: springs.smooth,
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: springs.pop,
  },
  tap: {
    scale: 0.96,
    transition: springs.press,
  },
};

// ===== MODAL / BOTTOM SHEET =====
export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const bottomSheetVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 35,
    },
  },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.pop,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

// ===== FAB / FLOATING BUTTON =====
export const fabVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, transition: springs.pop },
  tap: { scale: 0.9, rotate: 45, transition: springs.press },
};

// ===== TOAST =====
export const toastVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.pop,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// ===== BUTTON PRESS =====
export const buttonTap = {
  scale: 0.94,
  transition: { type: 'spring', stiffness: 500, damping: 15 },
};

// ===== TOGGLE SWITCH =====
export const toggleThumbVariants = {
  off: { x: 0 },
  on: { x: 20 },
};

// ===== FADE IN UP (for sections) =====
export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      delay: 0.1,
    },
  },
};

// ===== GLASS CARD GLOW ON HOVER =====
export const glassGlowVariants = {
  rest: {
    boxShadow: '0 0 0 0 transparent',
    transition: { duration: 0.3 },
  },
  hover: {
    boxShadow: 'var(--glow-primary)',
    transition: { duration: 0.3 },
  },
};

// ===== ONBOARDING SLIDE =====
export const onboardingSlideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: springs.smooth,
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

// ===== LOADING SKELETON PULSE =====
export const skeletonVariants = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ===== SEARCH BAR EXPAND =====
export const searchExpandVariants = {
  collapsed: { width: '48px' },
  expanded: {
    width: '100%',
    transition: springs.smooth,
  },
};

// ===== CHIP SELECT =====
export const chipVariants = {
  unselected: {
    scale: 1,
    backgroundColor: 'var(--surface-container)',
    color: 'var(--on-surface-variant)',
  },
  selected: {
    scale: 1.05,
    backgroundColor: 'var(--primary-container)',
    color: 'var(--on-primary-container)',
    transition: springs.pop,
  },
  tap: {
    scale: 0.95,
    transition: springs.press,
  },
};

// ===== CHAT MESSAGE =====
export const chatMessageVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.smooth,
  },
};

// ===== TYPING INDICATOR DOTS =====
export const typingDotVariants = {
  animate: (i) => ({
    y: [0, -6, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.15,
      ease: 'easeInOut',
    },
  }),
};

// ===== MINDMAP NODE =====
export const mindmapNodeVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      delay: Math.random() * 0.3,
    },
  },
  hover: {
    scale: 1.15,
    transition: springs.pop,
  },
  tap: {
    scale: 0.95,
    transition: springs.press,
  },
};
