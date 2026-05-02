/**
 * TopBar - App header with title, back button, and actions
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

function TopBar({
  title,
  showBack = false,
  showThemeToggle = true,
  rightActions,
  onBack,
  transparent = false,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-md)',
        gap: 'var(--space-sm)',
        background: transparent
          ? 'transparent'
          : 'var(--glass-bg)',
        backdropFilter: transparent ? 'none' : 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(20px) saturate(180%)',
        borderBottom: transparent ? 'none' : '1px solid var(--outline-variant)',
        transition: 'background var(--duration-normal) var(--ease-smooth)',
      }}
    >
      {showBack && (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--surface-container)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} color="var(--on-surface)" />
        </motion.button>
      )}

      <h1
        style={{
          flex: 1,
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--on-surface)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h1>

      {rightActions && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {rightActions}
        </div>
      )}

      {showThemeToggle && !rightActions && (
        <ThemeToggle size={18} />
      )}
    </header>
  );
}

export default TopBar;
