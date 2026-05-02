/**
 * ThemeToggle - Animated light/dark mode switch button
 */

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import useThemeStore, { THEME_VALUES } from '../../stores/useThemeStore';
import { springs } from '../../utils/animations';

function ThemeToggle({ size = 24, className = '' }) {
  const { theme, toggleTheme } = useThemeStore();
  const isNight = theme === THEME_VALUES.NIGHT;

  return (
    <motion.button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      transition={springs.pop}
      aria-label={isNight ? '切换到亮色模式' : '切换到暗色模式'}
      style={{
        width: size + 16,
        height: size + 16,
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--outline-variant)',
        background: 'var(--surface-container)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isNight ? 180 : 0,
          scale: isNight ? 0 : 1,
          opacity: isNight ? 0 : 1,
        }}
        transition={springs.smooth}
        style={{ position: 'absolute' }}
      >
        <Sun size={size} color="var(--on-surface)" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: isNight ? 0 : -180,
          scale: isNight ? 1 : 0,
          opacity: isNight ? 1 : 0,
        }}
        transition={springs.smooth}
        style={{ position: 'absolute' }}
      >
        <Moon size={size} color="var(--primary)" />
      </motion.div>
    </motion.button>
  );
}

export default ThemeToggle;
