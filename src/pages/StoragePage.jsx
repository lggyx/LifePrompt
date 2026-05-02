/**
 * StoragePage - Local storage stats, export/import, and data cleanup
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  HardDrive,
  FileText,
  Tag,
  Image,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  PieChart,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { listContainerVariants, listItemVariants, springs } from '../utils/animations';
import { useToastStore } from '../stores/useToastStore';

function StoragePage() {
  const toast = useToastStore();
  const [stats, setStats] = useState({
    articles: 0,
    tags: 0,
    images: 0,
    totalSize: 0,
    tempSize: 0,
  });
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    // Mock stats
    setStats({
      articles: 42,
      tags: 18,
      images: 15,
      totalSize: 12.5,
      tempSize: 1.2,
    });
  }, []);

  const handleExport = () => {
    toast.info('正在导出数据...');
    setTimeout(() => {
      const data = JSON.stringify({ version: '1.0', exportDate: new Date().toISOString() });
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifeprompt-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('数据导出成功');
    }, 1500);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      toast.info('正在导入数据...');
      setTimeout(() => {
        toast.success(`成功导入 ${file.name}`);
      }, 1500);
    };
    input.click();
  };

  const handleCleanup = () => {
    setIsCleaning(true);
    toast.info('正在清理临时文件...');
    setTimeout(() => {
      setStats((prev) => ({ ...prev, tempSize: 0 }));
      setIsCleaning(false);
      toast.success(`清理完成，释放了 ${stats.tempSize} MB`);
    }, 2000);
  };

  const usagePercent = Math.min((stats.totalSize / 50) * 100, 100);

  return (
    <PageTransition>
      <TopBar title="存储管理" showBack />

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Storage Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springs.pop}>
          <GlassCard style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PieChart size={24} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--outline)' }}>已用存储</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>
                  {stats.totalSize.toFixed(1)} <span style={{ fontSize: '14px', fontWeight: 400 }}>MB / 50 MB</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
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
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  borderRadius: 'var(--radius-full)',
                  background:
                    usagePercent > 80
                      ? 'var(--error)'
                      : usagePercent > 60
                        ? 'var(--tertiary-fixed)'
                        : 'var(--primary)',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--outline)' }}>
                {usagePercent.toFixed(0)}% 已用
              </span>
              <span style={{ fontSize: '12px', color: 'var(--outline)' }}>
                {(50 - stats.totalSize).toFixed(1)} MB 可用
              </span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <StatCard icon={FileText} label="文章" value={stats.articles} color="var(--primary)" />
          <StatCard icon={Tag} label="标签" value={stats.tags} color="var(--secondary)" />
          <StatCard icon={Image} label="图片" value={stats.images} color="var(--tertiary)" />
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
        >
          <span className="label-caps" style={{ color: 'var(--outline)' }}>
            数据操作
          </span>

          <motion.div variants={listItemVariants}>
            <GlassCard onClick={handleExport} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--tertiary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Download size={20} color="var(--tertiary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--on-surface)' }}>
                    导出数据
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '2px' }}>
                    将所有数据导出为 JSON 文件
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={listItemVariants}>
            <GlassCard onClick={handleImport} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--secondary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Upload size={20} color="var(--secondary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--on-surface)' }}>
                    导入数据
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '2px' }}>
                    从备份文件恢复数据
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <span
            className="label-caps"
            style={{ color: 'var(--outline)', marginTop: 'var(--space-md)' }}
          >
            维护
          </span>

          <motion.div variants={listItemVariants}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--error-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={20} color="var(--error)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--on-surface)' }}>
                    清理临时文件
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '2px' }}>
                    临时文件占用 {stats.tempSize.toFixed(1)} MB
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCleanup}
                  disabled={isCleaning || stats.tempSize === 0}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--error)',
                    background: 'var(--error-container)',
                    color: 'var(--error)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: isCleaning ? 'wait' : 'pointer',
                    opacity: stats.tempSize === 0 ? 0.5 : 1,
                  }}
                >
                  {isCleaning ? '清理中...' : '清理'}
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      variants={listItemVariants}
      style={{
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--outline-variant)',
        background: 'var(--surface-container-low)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-sm)',
        }}
      >
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--on-surface)' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '2px' }}>{label}</div>
    </motion.div>
  );
}

export default StoragePage;
