/**
 * AppShell - Main app layout wrapper
 * Contains safe area handling, top bar, content area, bottom nav
 */

import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

// Routes where bottom nav should NOT be shown
const NO_NAV_ROUTES = [
  '/onboarding',
  '/capture',
  '/capture/',
  '/publish/',
  '/article/',
];

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
