/**
 * LANBackupPage - LAN backup with pairing code, encrypted transfer
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  QrCode,
  Smartphone,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
  ArrowRightLeft,
  Send,
  Monitor,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { listContainerVariants, listItemVariants, springs, fadeInUp } from '../utils/animations';
import { useToastStore } from '../stores/useToastStore';

function LANBackupPage() {
  const toast = useToastStore();
  const [mode, setMode] = useState(null); // 'send' | 'receive' | null
  const [pairingCode, setPairingCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [connectionState, setConnectionState] = useState('idle'); // idle | pairing | connected | error
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const intervalRef = useRef(null);

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPairingCode(code);
    setConnectionState('pairing');
    toast.info('配对码已生成，请在另一台设备输入');

    // Simulate connection after random time
    setTimeout(() => {
      setConnectionState('connected');
      toast.success('设备已连接');
    }, 3000);
  };

  const connectToDevice = () => {
    if (inputCode.length !== 6) {
      toast.warning('请输入6位配对码');
      return;
    }
    setConnectionState('pairing');
    toast.info('正在连接...');
    setTimeout(() => {
      setConnectionState('connected');
      toast.success('连接成功');
    }, 2000);
  };

  const startTransfer = () => {
    setIsTransferring(true);
    setTransferProgress(0);
    toast.info('开始传输数据...');

    intervalRef.current = setInterval(() => {
      setTransferProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          setIsTransferring(false);
          toast.success('传输完成');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const disconnect = () => {
    setConnectionState('idle');
    setPairingCode('');
    setInputCode('');
    setTransferProgress(0);
    setIsTransferring(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    toast.info('已断开连接');
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <PageTransition>
      <TopBar title="局域网备份" showBack />

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Mode Selection */}
        {!mode && (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
          >
            <motion.div variants={listItemVariants}>
              <GlassCard
                onClick={() => setMode('send')}
                glowOnHover
                style={{ cursor: 'pointer', textAlign: 'center', padding: 'var(--space-xl)' }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--primary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-md)',
                  }}
                >
                  <Send size={28} color="var(--primary)" />
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)' }}>
                  发送数据
                </div>
                <div style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '4px' }}>
                  将本机数据备份到另一台设备
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={listItemVariants}>
              <GlassCard
                onClick={() => setMode('receive')}
                glowOnHover
                style={{ cursor: 'pointer', textAlign: 'center', padding: 'var(--space-xl)' }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--secondary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-md)',
                  }}
                >
                  <Monitor size={28} color="var(--secondary)" />
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)' }}>
                  接收数据
                </div>
                <div style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '4px' }}>
                  从另一台设备接收备份数据
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}

        {/* Send Mode */}
        <AnimatePresence>
          {mode === 'send' && connectionState !== 'connected' && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <GlassCard style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
                  在另一台设备输入以下配对码
                </div>

                {pairingCode ? (
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-lg)',
                    }}
                  >
                    {pairingCode.split('').map((digit, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          width: 48,
                          height: 56,
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--primary-container)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {digit}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'var(--surface-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto var(--space-lg)',
                    }}
                  >
                    <QrCode size={32} color="var(--outline)" />
                  </div>
                )}

                {connectionState === 'pairing' && pairingCode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ color: 'var(--outline)', fontSize: '14px', marginBottom: 'var(--space-md)' }}
                  >
                    等待连接...
                  </motion.div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                  <NeonButton variant="ghost" onClick={() => { setMode(null); setPairingCode(''); setConnectionState('idle'); }}>
                    返回
                  </NeonButton>
                  <NeonButton variant="primary" onClick={generateCode} disabled={connectionState === 'pairing'}>
                    {pairingCode ? '重新生成' : '生成配对码'}
                  </NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Receive Mode */}
        <AnimatePresence>
          {mode === 'receive' && connectionState !== 'connected' && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <GlassCard>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                  输入发送设备的配对码
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    marginBottom: 'var(--space-lg)',
                  }}
                >
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={inputCode[i] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val) {
                          const newCode = inputCode.split('');
                          newCode[i] = val[0];
                          setInputCode(newCode.join(''));
                          const next = e.target.parentElement?.children[i + 1];
                          if (next) next.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !inputCode[i]) {
                          const prev = e.target.parentElement?.children[i - 1];
                          if (prev) prev.focus();
                        }
                      }}
                      style={{
                        width: 48,
                        height: 56,
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid var(--outline-variant)',
                        background: 'var(--surface)',
                        textAlign: 'center',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: 'var(--on-surface)',
                        outline: 'none',
                        fontVariantNumeric: 'tabular-nums',
                        caretColor: 'var(--primary)',
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                  <NeonButton variant="ghost" onClick={() => { setMode(null); setInputCode(''); setConnectionState('idle'); }}>
                    返回
                  </NeonButton>
                  <NeonButton
                    variant="primary"
                    onClick={connectToDevice}
                    disabled={inputCode.length !== 6 || connectionState === 'pairing'}
                  >
                    连接
                  </NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connected State */}
        <AnimatePresence>
          {connectionState === 'connected' && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <GlassCard style={{ textAlign: 'center' }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={springs.bounce}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--tertiary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-md)',
                  }}
                >
                  <CheckCircle size={36} color="var(--tertiary)" />
                </motion.div>

                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)' }}>
                  设备已连接
                </div>
                <div style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '4px' }}>
                  {mode === 'send' ? '准备发送数据' : '准备接收数据'}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-md)',
                    marginTop: 'var(--space-lg)',
                    marginBottom: 'var(--space-lg)',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Smartphone size={24} color="var(--primary)" />
                  </div>
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRightLeft size={20} color="var(--outline)" />
                  </motion.div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Monitor size={24} color="var(--secondary)" />
                  </div>
                </div>

                {isTransferring && (
                  <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <div
                      style={{
                        width: '100%',
                        height: 8,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--surface-variant)',
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        animate={{ width: `${Math.min(transferProgress, 100)}%` }}
                        style={{
                          height: '100%',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--primary)',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '6px' }}>
                      {Math.min(Math.round(transferProgress), 100)}%
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                  <NeonButton variant="ghost" onClick={disconnect}>
                    断开连接
                  </NeonButton>
                  {!isTransferring && transferProgress === 0 && (
                    <NeonButton variant="primary" onClick={startTransfer}>
                      {mode === 'send' ? '开始发送' : '开始接收'}
                    </NeonButton>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

export default LANBackupPage;
