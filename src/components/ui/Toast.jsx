/**
 * Toast - Global toast notification system
 * Uses a global store pattern (created later)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { toastVariants } from '../../utils/animations';
import GlassCard from './GlassCard';

function Toast({ message, type = 'info', onClose }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'var(--tertiary)',
    error: 'var(--error)',
    warning: 'var(--tertiary-fixed)',
    info: 'var(--secondary)',
  };

  const Icon = icons[type];

  return (
    <motion.div
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        left: '16px',
        right: '16px',
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <GlassCard
        hoverable={false}
        padding="12px 20px"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '480px',
          width: '100%',
          pointerEvents: 'auto',
          borderLeft: `3px solid ${colors[type]}`,
        }}
      >
        <Icon size={20} color={colors[type]} />
        <span style={{ flex: 1, color: 'var(--on-surface)', fontSize: '14px' }}>
          {message}
        </span>
      </GlassCard>
    </motion.div>
  );
}

function ToastContainer({ toasts = [], removeToast }) {
  return (
    <AnimatePresence mode="popLayout">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast?.(toast.id)}
        />
      ))}
    </AnimatePresence>
  );
}

export { Toast, ToastContainer };
export default Toast;
