/**
 * BottomNav - Fixed bottom navigation bar with 5 tabs
 */

import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  FileText,
  PlusCircle,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { BOTTOM_TABS } from '../../utils/constants';

const ICON_MAP = {
  Brain,
  FileText,
  PlusCircle,
  MessageSquare,
  Settings,
};

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/capture') return location.pathname.startsWith('/capture');
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav
      className="safe-bottom"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid var(--outline-variant)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        paddingTop: '8px',
        zIndex: 100,
      }}
    >
      {BOTTOM_TABS.map((tab) => {
        const Icon = ICON_MAP[tab.icon];
        const active = isActive(tab.path);
        const isSpecial = tab.isSpecial;

        return (
          <motion.button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            whileTap={{ scale: 0.85 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '4px 12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              position: 'relative',
              flex: 1,
            }}
          >
            {isSpecial ? (
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9, rotate: 90 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '-20px',
                  boxShadow: 'var(--glow-primary)',
                }}
              >
                <Icon size={24} color="var(--on-primary-container)" />
              </motion.div>
            ) : (
              <>
                <motion.div
                  animate={{
                    scale: active ? 1.1 : 1,
                    y: active ? -2 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Icon
                    size={22}
                    color={active ? 'var(--primary)' : 'var(--on-surface-variant)'}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                </motion.div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {tab.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      width: 20,
                      height: 3,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--primary-container)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
