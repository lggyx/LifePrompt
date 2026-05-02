/**
 * SettingsPage - Main settings hub with categorized options
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Keyboard,
  Cloud,
  Wifi,
  Database,
  UserCircle,
  Palette,
  Info,
  ChevronRight,
  LogOut,
  Newspaper,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import ThemeToggle from '../components/ui/ThemeToggle';
import { listContainerVariants, listItemVariants, springs } from '../utils/animations';

const settingsGroups = [
  {
    title: '个性化',
    items: [
      { icon: Brain, label: 'AI 模型配置', path: '/settings/ai', color: 'var(--primary)' },
      { icon: UserCircle, label: '用户画像', path: '/onboarding/profile', color: 'var(--secondary)' },
      { icon: Keyboard, label: '快捷键设置', path: '/settings/shortcuts', color: 'var(--tertiary)' },
    ],
  },
  {
    title: '数据与同步',
    items: [
      { icon: Cloud, label: '云备份', path: '/settings/cloud', color: 'var(--primary)' },
      { icon: Wifi, label: '局域网备份', path: '/settings/lan', color: 'var(--secondary)' },
      { icon: Database, label: '存储管理', path: '/settings/storage', color: 'var(--tertiary)' },
      { icon: Newspaper, label: '媒体账号', path: '/settings/media', color: 'var(--primary)' },
    ],
  },
  {
    title: '其他',
    items: [
      { icon: Info, label: '关于', path: '#', color: 'var(--outline)' },
    ],
  },
];

function SettingsPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <TopBar title="设置" />

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Theme toggle card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.pop}
        >
          <GlassCard style={{ marginBottom: 'var(--space-lg)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                  主题模式
                </h3>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  在明亮与暗色模式间切换
                </p>
              </div>
              <ThemeToggle size={20} />
            </div>
          </GlassCard>
        </motion.div>

        {/* Settings groups */}
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
        >
          {settingsGroups.map((group) => (
            <motion.div key={group.title} variants={listItemVariants}>
              <span
                className="label-caps"
                style={{
                  color: 'var(--outline)',
                  marginBottom: 'var(--space-sm)',
                  display: 'block',
                }}
              >
                {group.title}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {group.items.map((item) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => item.path !== '#' && navigate(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      padding: 'var(--space-md)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--outline-variant)',
                      background: 'var(--surface-container-low)',
                      cursor: item.path !== '#' ? 'pointer' : 'default',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: `${item.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <item.icon size={20} color={item.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: 'var(--on-surface)',
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    {item.path !== '#' && (
                      <ChevronRight size={18} color="var(--outline)" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* App info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            textAlign: 'center',
            marginTop: 'var(--space-2xl)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <p style={{ fontSize: '13px', color: 'var(--outline)', margin: 0 }}>
            LifePrompt v0.1.0
          </p>
          <p style={{ fontSize: '12px', color: 'var(--outline-variant)', marginTop: '4px' }}>
            构建你的第二大脑
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}

export default SettingsPage;
