/**
 * PillTag - Pill-shaped tag/chip component
 */

import { motion } from 'framer-motion';
import { chipVariants } from '../../utils/animations';

function PillTag({
  children,
  color,
  selected = false,
  onClick,
  className = '',
  size = 'md',
  ...props
}) {
  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '11px' },
    md: { padding: '4px 12px', fontSize: '12px' },
    lg: { padding: '6px 16px', fontSize: '13px' },
  };

  const baseStyle = {
    ...sizeStyles[size],
    borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-label)',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    cursor: onClick ? 'pointer' : 'default',
    border: '1px solid transparent',
    transition: `all var(--duration-fast) var(--ease-smooth)`,
    whiteSpace: 'nowrap',
  };

  const dynamicStyle = selected
    ? {
        background: color ? `${color}25` : 'var(--primary-container)',
        color: color || 'var(--on-primary-container)',
        borderColor: color ? `${color}40` : 'var(--primary-container)',
        boxShadow: `0 0 8px ${color ? `${color}30` : 'var(--glow-primary)'}`,
      }
    : {
        background: 'var(--surface-container)',
        color: color || 'var(--on-surface-variant)',
      };

  if (!onClick) {
    return (
      <span className={`pill-tag ${className}`} style={{ ...baseStyle, ...dynamicStyle }} {...props}>
        {children}
      </span>
    );
  }

  return (
    <motion.button
      className={`pill-tag ${className}`}
      style={{ ...baseStyle, ...dynamicStyle }}
      variants={chipVariants}
      initial={selected ? 'selected' : 'unselected'}
      animate={selected ? 'selected' : 'unselected'}
      whileTap="tap"
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default PillTag;
