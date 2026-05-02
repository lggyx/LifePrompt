/**
 * GlassCard - Glassmorphism card container
 * Light: frosted white glass | Night: tinted dark glass with neon border
 */

import { motion } from 'framer-motion';
import { cardVariants, glassGlowVariants } from '../../utils/animations';

function GlassCard({
  children,
  className = '',
  hoverable = true,
  glowOnHover = false,
  padding = 'var(--space-md)',
  onClick,
  style = {},
  ...props
}) {
  const baseStyle = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid var(--outline-variant)',
    borderRadius: 'var(--radius-lg)',
    padding,
    boxShadow: 'var(--glass-inner-glow)',
    transition: `border-color var(--duration-normal) var(--ease-smooth),
                 box-shadow var(--duration-normal) var(--ease-smooth)`,
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  if (!hoverable) {
    return (
      <div className={`glass-card ${className}`} style={baseStyle} onClick={onClick} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`glass-card ${className}`}
      style={baseStyle}
      variants={glowOnHover ? glassGlowVariants : cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;
