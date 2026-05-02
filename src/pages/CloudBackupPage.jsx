/**
 * CloudBackupPage - Cloud backup, login, and sync settings
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  User,
  Mail,
  Lock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { listContainerVariants, listItemVariants, springs, fadeInUp } from '../utils/animations';
import { useToastStore } from '../stores/useToastStore';

function CloudBackupPage() {
  const toast = useToastStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lastSync, setLastSync] = useState(null);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const handleLogin = () => {
    if (!email || !password) {
      toast.warning('请输入邮箱和密码');
      return;
    }
    toast.info('正在登录...');
    setTimeout(() => {
      setIsLoggedIn(true);
      setUserInfo({ email, name: email.split('@')[0], avatar: null });
      setShowLogin(false);
      toast.success('登录成功');
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    setSyncEnabled(false);
    setAutoSync(false);
    toast.info('已退出登录');
  };

  const handleSync = () => {
    if (!isLoggedIn) {
      toast.warning('请先登录');
      return;
    }
    setIsSyncing(true);
    toast.info('正在同步数据...');
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date());
      toast.success('同步完成');
    }, 2500);
  };

  const toggleSync = () => {
    if (!isLoggedIn) {
      toast.warning('请先登录以启用云同步');
      return;
    }
    setSyncEnabled(!syncEnabled);
    toast.success(!syncEnabled ? '云同步已启用' : '云同步已关闭');
  };

  return (
    <PageTransition>
      <TopBar title="云备份" showBack />

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Login State Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springs.pop}>
          <GlassCard style={{ marginBottom: 'var(--space-lg)' }}>
            {isLoggedIn && userInfo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--primary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: 'var(--on-primary-container)',
                    flexShrink: 0,
                  }}
                >
                  {userInfo.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>
                    {userInfo.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '2px' }}>
                    {userInfo.email}
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--error)',
                    background: 'var(--error-container)',
                    color: 'var(--error)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <LogOut size={14} />
                  退出
                </motion.button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--surface-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-md)',
                  }}
                >
                  <CloudOff size={32} color="var(--outline)" />
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>
                  未登录
                </div>
                <div style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '4px', marginBottom: 'var(--space-md)' }}>
                  登录后可开启云备份与多设备同步
                </div>
                <NeonButton variant="primary" onClick={() => setShowLogin(true)} icon={LogIn}>
                  登录 / 注册
                </NeonButton>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <AnimatePresence>
          {showLogin && !isLoggedIn && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ marginBottom: 'var(--space-lg)' }}
            >
              <GlassCard>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <InputField
                    icon={Mail}
                    type="email"
                    placeholder="邮箱地址"
                    value={email}
                    onChange={setEmail}
                  />
                  <InputField
                    icon={Lock}
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={setPassword}
                  />
                  <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <NeonButton variant="ghost" fullWidth onClick={() => setShowLogin(false)}>
                      取消
                    </NeonButton>
                    <NeonButton variant="primary" fullWidth onClick={handleLogin}>
                      登录
                    </NeonButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Settings */}
        {isLoggedIn && (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
          >
            <span className="label-caps" style={{ color: 'var(--outline)' }}>
              同步设置
            </span>

            <ToggleRow
              icon={Cloud}
              label="云同步"
              description="自动将数据备份到云端"
              checked={syncEnabled}
              onChange={toggleSync}
            />

            {syncEnabled && (
              <ToggleRow
                icon={RefreshCw}
                label="自动同步"
                description="应用启动时自动执行同步"
                checked={autoSync}
                onChange={() => {
                  setAutoSync(!autoSync);
                  toast.success(!autoSync ? '自动同步已开启' : '自动同步已关闭');
                }}
              />
            )}

            <motion.div variants={listItemVariants}>
              <GlassCard>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>上次同步</div>
                    <div style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '2px' }}>
                      {lastSync ? lastSync.toLocaleString('zh-CN') : '从未同步'}
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSync}
                    disabled={isSyncing}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '1px solid var(--outline-variant)',
                      background: 'var(--surface-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isSyncing ? 'wait' : 'pointer',
                    }}
                  >
                    <motion.div
                      animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ repeat: isSyncing ? Infinity : 0, duration: 1, ease: 'linear' }}
                    >
                      <RefreshCw size={18} color="var(--primary)" />
                    </motion.div>
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>

            <span
              className="label-caps"
              style={{ color: 'var(--outline)', marginTop: 'var(--space-md)' }}
            >
              云端数据
            </span>

            <motion.div variants={listItemVariants}>
              <GlassCard>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <StatRow label="云端文章" value="0 篇" />
                  <StatRow label="云端标签" value="0 个" />
                  <StatRow label="占用空间" value="0 MB" />
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={listItemVariants} style={{ marginTop: 'var(--space-md)' }}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => toast.warning('此操作将清空云端所有数据')}
                style={{
                  width: '100%',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--error)',
                  background: 'var(--error-container)',
                  color: 'var(--error)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <Trash2 size={18} />
                清空云端数据
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }) {
  return (
    <motion.div
      variants={listItemVariants}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--outline-variant)',
        background: 'var(--surface-container-low)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          background: checked ? 'var(--primary-container)' : 'var(--surface-container)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={checked ? 'var(--primary)' : 'var(--outline)'} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--on-surface)' }}>{label}</div>
        <div style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '2px' }}>{description}</div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </motion.div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => onChange(!checked)}
      style={{
        width: 48,
        height: 28,
        borderRadius: 'var(--radius-full)',
        background: checked ? 'var(--primary)' : 'var(--surface-variant)',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background var(--duration-normal)',
      }}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={springs.smooth}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'var(--on-primary)',
          position: 'absolute',
          top: 2,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      />
    </motion.button>
  );
}

function InputField({ icon: Icon, type, placeholder, value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: '12px var(--space-md)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--outline-variant)',
        background: 'var(--surface)',
      }}
    >
      <Icon size={18} color="var(--outline)" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          fontSize: '15px',
          color: 'var(--on-surface)',
          outline: 'none',
          fontFamily: 'var(--font-body)',
        }}
      />
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>{value}</span>
    </div>
  );
}

export default CloudBackupPage;
