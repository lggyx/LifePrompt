/**
 * ShortcutConfigPage - Floating window & notification bar shortcut settings
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MousePointerClick,
  Bell,
  Move,
  Droplets,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { listContainerVariants, listItemVariants, springs } from '../utils/animations';
import { useToastStore } from '../stores/useToastStore';

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
          transition: 'background var(--duration-normal)',
        }}
      >
        <Icon size={20} color={checked ? 'var(--primary)' : 'var(--outline)'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--on-surface)' }}>
          {label}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '2px' }}>
          {description}
        </div>
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

function SliderRow({ label, value, min, max, step, onChange, icon: Icon }) {
  return (
    <motion.div
      variants={listItemVariants}
      style={{
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--outline-variant)',
        background: 'var(--surface-container-low)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        {Icon && <Icon size={18} color="var(--outline)" />}
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>
          {label}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: 4,
          borderRadius: 'var(--radius-full)',
          background: 'var(--surface-variant)',
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      />
    </motion.div>
  );
}

function ShortcutConfigPage() {
  const toast = useToastStore();
  const [settings, setSettings] = useState({
    floatingEnabled: true,
    floatingPosition: 'right',
    floatingOpacity: 0.8,
    notificationEnabled: true,
    notificationShortcut: true,
    screenshotPermission: false,
    overlayPermission: false,
  });

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const requestPermission = (type) => {
    toast.info(`正在申请${type === 'screenshot' ? '截图' : '悬浮窗'}权限...`);
    setTimeout(() => {
      updateSetting(type === 'screenshot' ? 'screenshotPermission' : 'overlayPermission', true);
      toast.success('权限申请成功');
    }, 1200);
  };

  const saveSettings = () => {
    toast.success('快捷键设置已保存');
  };

  return (
    <PageTransition>
      <TopBar title="快捷键设置" showBack />

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Permission Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.pop}
        >
          <GlassCard style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
              权限状态
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <PermissionItem
                label="截图权限"
                granted={settings.screenshotPermission}
                onRequest={() => requestPermission('screenshot')}
              />
              <PermissionItem
                label="悬浮窗权限"
                granted={settings.overlayPermission}
                onRequest={() => requestPermission('overlay')}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Floating Window */}
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
        >
          <span className="label-caps" style={{ color: 'var(--outline)' }}>
            悬浮窗截图
          </span>

          <ToggleRow
            icon={MousePointerClick}
            label="启用悬浮窗"
            description="在屏幕边缘显示快捷截图按钮"
            checked={settings.floatingEnabled}
            onChange={(v) => updateSetting('floatingEnabled', v)}
          />

          {settings.floatingEnabled && (
            <>
              <motion.div
                variants={listItemVariants}
                style={{
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container-low)',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
                  悬浮窗位置
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['left', 'right'].map((pos) => (
                    <motion.button
                      key={pos}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateSetting('floatingPosition', pos)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border:
                          settings.floatingPosition === pos
                            ? '2px solid var(--primary)'
                            : '1px solid var(--outline-variant)',
                        background:
                          settings.floatingPosition === pos
                            ? 'var(--primary-container)'
                            : 'var(--surface)',
                        color:
                          settings.floatingPosition === pos
                            ? 'var(--on-primary-container)'
                            : 'var(--on-surface)',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Move size={16} />
                      {pos === 'left' ? '左侧' : '右侧'}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <SliderRow
                icon={Droplets}
                label="悬浮窗透明度"
                value={settings.floatingOpacity}
                min={0.3}
                max={1}
                step={0.05}
                onChange={(v) => updateSetting('floatingOpacity', v)}
              />
            </>
          )}

          <span
            className="label-caps"
            style={{ color: 'var(--outline)', marginTop: 'var(--space-md)' }}
          >
            通知栏快捷方式
          </span>

          <ToggleRow
            icon={Bell}
            label="通知栏快捷入口"
            description="在通知栏显示快捷截图按钮"
            checked={settings.notificationEnabled}
            onChange={(v) => updateSetting('notificationEnabled', v)}
          />

          {settings.notificationEnabled && (
            <ToggleRow
              icon={Bell}
              label="常驻通知"
              description="保持通知栏快捷方式始终可见"
              checked={settings.notificationShortcut}
              onChange={(v) => updateSetting('notificationShortcut', v)}
            />
          )}
        </motion.div>

        {/* Save */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}
        >
          <NeonButton variant="primary" fullWidth onClick={saveSettings}>
            保存设置
          </NeonButton>
        </motion.div>
      </div>
    </PageTransition>
  );
}

function PermissionItem({ label, granted, onRequest }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: '10px var(--space-md)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface)',
      }}
    >
      {granted ? (
        <ShieldCheck size={20} color="var(--tertiary)" />
      ) : (
        <ShieldAlert size={20} color="var(--error)" />
      )}
      <span style={{ flex: 1, fontSize: '14px', color: 'var(--on-surface)' }}>{label}</span>
      <span
        style={{
          fontSize: '12px',
          color: granted ? 'var(--tertiary)' : 'var(--error)',
          fontWeight: 500,
        }}
      >
        {granted ? '已授权' : '未授权'}
      </span>
      {!granted && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRequest}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--primary)',
            background: 'var(--primary-container)',
            color: 'var(--on-primary-container)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          申请
        </motion.button>
      )}
    </div>
  );
}

export default ShortcutConfigPage;
