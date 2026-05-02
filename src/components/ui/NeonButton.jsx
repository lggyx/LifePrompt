/**
 * NeonButton - Primary/Secondary action buttons with neon glow effects
 * Light: solid cyan fill | Night: transparent with neon border + glow
 */

import { motion } from 'framer-motion';
import { buttonTap, springs } from '../../utils/animations';

function NeonButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  const sizeStyles = {
    sm: { padding: '6px 14px', fontSize: '13px', borderRadius: 'var(--radius-full)' },
    md: { padding: '10px 20px', fontSize: '15px', borderRadius: 'var(--radius-full)' },
    lg: { padding: '14px 28px', fontSize: '16px', borderRadius: 'var(--radius-full)' },
  };

  const variantStyles = {
    primary: {
      background: 'var(--primary-container)',
      color: 'var(--on-primary-container)',
      border: 'none',
      fontWeight: 600,
    },
    secondary: {
      background: 'transparent',
      color: 'var(--secondary)',
      border: '1px solid var(--secondary)',
      fontWeight: 500,
    },
    ghost: {
      background: 'transparent',
      color: 'var(--on-surface-variant)',
      border: '1px solid var(--outline-variant)',
      fontWeight: 500,
    },
    danger: {
      background: 'var(--error-container)',
      color: 'var(--error)',
      border: '1px solid var(--error)',
      fontWeight: 500,
    },
  };

  const style = {
    ...sizeStyles[size],
    ...variantStyles[variant],
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-body)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `box-shadow var(--duration-normal) var(--ease-smooth),
                 transform var(--duration-fast) var(--ease-smooth)`,
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <motion.button
      className={`neon-button neon-button--${variant} ${className}`}
      style={style}
      whileTap={disabled ? {} : buttonTap}
      whileHover={disabled ? {} : { boxShadow: 'var(--glow-primary)' }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children}
    </motion.button>
  );
}

export default NeonButton;
