/**
 * AppShell - Main app layout wrapper
 * Contains safe area handling, top bar, content area, bottom nav, global toast
 */

import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';
import { useToastStore } from '../../stores/useToastStore';
import Toast from '../ui/Toast';

// Routes where bottom nav should NOT be shown
const NO_NAV_ROUTES = [
  '/onboarding',
  '/capture',
  '/capture/',
  '/publish/',
  '/article/',
  '/search',
];

function ToastLayer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        left: 16,
        right: 16,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function AppShell({ children }) {
  const location = useLocation();

  const showNav = !NO_NAV_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        background: 'var(--background)',
        transition: 'background var(--duration-slow) var(--ease-smooth)',
      }}
    >
      {/* Global Toast Layer */}
      <ToastLayer />

      {/* Main content area */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: showNav ? 'calc(64px + env(safe-area-inset-bottom, 0px) + 8px)' : '0',
          position: 'relative',
        }}
      >
        {children}
      </main>

      {/* Bottom navigation */}
      {showNav && <BottomNav />}
    </div>
  );
}

export default AppShell;
