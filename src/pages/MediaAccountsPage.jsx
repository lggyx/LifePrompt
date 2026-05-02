/**
 * MediaAccountsPage - Manage social media platform accounts
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronRight,
  Shield,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { springs, listContainerVariants, listItemVariants } from '../utils/animations';
import { mediaAccountsRepo } from '../services/storage/db';
import {
  PUBLISH_PLATFORMS,
  PUBLISH_PLATFORM_LABELS,
  MEDIA_ACCOUNT_FIELDS,
} from '../utils/constants';
import { useToastStore } from '../stores/useToastStore';

const PLATFORM_ICONS = {
  [PUBLISH_PLATFORMS.WECHAT]: '📱',
  [PUBLISH_PLATFORMS.XIAOHONGSHU]: '📕',
  [PUBLISH_PLATFORMS.WEIBO]: '📢',
  [PUBLISH_PLATFORMS.ZHIHU]: '💡',
  [PUBLISH_PLATFORMS.JUEJIN]: '⚡',
  [PUBLISH_PLATFORMS.CUSTOM]: '🔧',
};

const PLATFORM_COLORS = {
  [PUBLISH_PLATFORMS.WECHAT]: '#07C160',
  [PUBLISH_PLATFORMS.XIAOHONGSHU]: '#FF2442',
  [PUBLISH_PLATFORMS.WEIBO]: '#E6162D',
  [PUBLISH_PLATFORMS.ZHIHU]: '#0084FF',
  [PUBLISH_PLATFORMS.JUEJIN]: '#1E80FF',
  [PUBLISH_PLATFORMS.CUSTOM]: 'var(--outline)',
};

function MediaAccountsPage() {
  const navigate = useNavigate();
  const toast = useToastStore();

  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    platform: PUBLISH_PLATFORMS.WECHAT,
    name: '',
    appId: '',
    appSecret: '',
    accessToken: '',
    refreshToken: '',
    extra: '',
    isActive: true,
  });

  const [showSecrets, setShowSecrets] = useState({});

  const loadAccounts = useCallback(() => {
    try {
      const rows = mediaAccountsRepo.getAll();
      setAccounts(
        rows.map((r) => ({
          ...r,
          isActive: r.isActive === 1,
          extra: r.extra ? JSON.parse(r.extra) : null,
        }))
      );
    } catch (err) {
      console.error('[MediaAccounts] load failed:', err);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const resetForm = () => {
    setForm({
      platform: PUBLISH_PLATFORMS.WECHAT,
      name: '',
      appId: '',
      appSecret: '',
      accessToken: '',
      refreshToken: '',
      extra: '',
      isActive: true,
    });
    setEditingId(null);
    setShowSecrets({});
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (account) => {
    setForm({
      platform: account.platform,
      name: account.name || '',
      appId: account.appId || '',
      appSecret: account.appSecret || '',
      accessToken: account.accessToken || '',
      refreshToken: account.refreshToken || '',
      extra: account.extra ? JSON.stringify(account.extra, null, 2) : '',
      isActive: account.isActive,
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('确定要删除这个媒体账号吗？')) return;
    try {
      mediaAccountsRepo.delete(id);
      loadAccounts();
      toast.success('已删除');
    } catch (err) {
      toast.error('删除失败');
    }
  };

  const handleToggleActive = (account) => {
    try {
      mediaAccountsRepo.setActive(account.id, !account.isActive);
      loadAccounts();
    } catch (err) {
      toast.error('操作失败');
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('请输入账号名称');
      return;
    }
    if (!form.platform) {
      toast.error('请选择平台');
      return;
    }

    const payload = {
      platform: form.platform,
      name: form.name.trim(),
      appId: form.appId.trim() || null,
      appSecret: form.appSecret.trim() || null,
      accessToken: form.accessToken.trim() || null,
      refreshToken: form.refreshToken.trim() || null,
      extra: null,
      isActive: form.isActive,
    };

    if (form.extra.trim()) {
      try {
        payload.extra = JSON.parse(form.extra);
      } catch {
        toast.error('扩展字段必须是合法的 JSON');
        return;
      }
    }

    try {
      if (editingId) {
        mediaAccountsRepo.update(editingId, payload);
        toast.success('已更新');
      } else {
        mediaAccountsRepo.create(payload);
        toast.success('已添加');
      }
      loadAccounts();
      setShowForm(false);
      resetForm();
    } catch (err) {
      toast.error('保存失败');
      console.error(err);
    }
  };

  const toggleShowSecret = (key) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fields = MEDIA_ACCOUNT_FIELDS[form.platform] || [];

  return (
    <PageTransition>
      <TopBar title="媒体账号管理" showBack onBack={() => navigate('/settings')} />

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Header + Add */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.pop}
          style={{ marginBottom: 'var(--space-md)' }}
        >
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <Shield size={20} color="var(--primary)" />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>已配置的账号</h3>
                  <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: '2px 0 0' }}>
                    管理各平台发布所需的隐私凭证
                  </p>
                </div>
              </div>
              <NeonButton variant="primary" onClick={handleAdd} icon={Plus}>
                添加
              </NeonButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Account list */}
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}
        >
          <AnimatePresence>
            {accounts.map((account) => (
              <motion.div key={account.id} variants={listItemVariants} layout>
                <GlassCard>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: `${PLATFORM_COLORS[account.platform]}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0,
                      }}
                    >
                      {PLATFORM_ICONS[account.platform]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--on-surface)' }}>
                          {account.name}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: `${PLATFORM_COLORS[account.platform]}20`,
                            color: PLATFORM_COLORS[account.platform],
                            fontWeight: 500,
                          }}
                        >
                          {PUBLISH_PLATFORM_LABELS[account.platform]}
                        </span>
                        {!account.isActive && (
                          <span
                            style={{
                              fontSize: '12px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--surface-container-highest)',
                              color: 'var(--outline)',
                            }}
                          >
                            已停用
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--on-surface-variant)',
                          margin: '4px 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {account.appId ? `ID: ${account.appId}` : '未配置 AppID'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggleActive(account)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: 'var(--radius-md)',
                          color: account.isActive ? 'var(--tertiary)' : 'var(--outline)',
                        }}
                        title={account.isActive ? '停用' : '启用'}
                      >
                        {account.isActive ? <Check size={18} /> : <X size={18} />}
                      </button>
                      <button
                        onClick={() => handleEdit(account)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--primary)',
                        }}
                        title="编辑"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--error)',
                        }}
                        title="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {accounts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: 'var(--space-2xl) var(--space-md)',
                color: 'var(--outline)',
              }}
            >
              <Newspaper size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
              <p style={{ fontSize: '15px', margin: 0 }}>暂无媒体账号</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>点击「添加」配置你的第一个平台账号</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Form Dialog */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              padding: 'var(--space-md)',
            }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={springs.pop}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 480,
                maxHeight: '85dvh',
                overflowY: 'auto',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--outline-variant)',
                boxShadow: 'var(--elevation-3)',
              }}
            >
              <div
                style={{
                  padding: 'var(--space-md)',
                  borderBottom: '1px solid var(--outline-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                  {editingId ? '编辑账号' : '添加账号'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Platform */}
                <div>
                  <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                    平台 *
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.values(PUBLISH_PLATFORMS).map((p) => (
                      <button
                        key={p}
                        onClick={() => setForm((prev) => ({ ...prev, platform: p }))}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid',
                          borderColor: form.platform === p ? PLATFORM_COLORS[p] : 'var(--outline-variant)',
                          background: form.platform === p ? `${PLATFORM_COLORS[p]}15` : 'var(--surface-container-low)',
                          color: form.platform === p ? PLATFORM_COLORS[p] : 'var(--on-surface)',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>{PLATFORM_ICONS[p]}</span>
                        {PUBLISH_PLATFORM_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                    账号名称 *
                  </span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：我的公众号"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--outline-variant)',
                      background: 'var(--surface-container-lowest)',
                      color: 'var(--on-surface)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Dynamic fields */}
                {fields.map((field) => (
                  <div key={field.key}>
                    <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                      {field.label}
                      {field.required && <span style={{ color: 'var(--error)' }}>*</span>}
                    </span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showSecrets[field.key] ? 'text' : field.type}
                        value={form[field.key] || ''}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={`输入${field.label}`}
                        style={{
                          width: '100%',
                          padding: '10px',
                          paddingRight: field.type === 'password' ? '40px' : '10px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--outline-variant)',
                          background: 'var(--surface-container-lowest)',
                          color: 'var(--on-surface)',
                          fontSize: '14px',
                          fontFamily: 'var(--font-body)',
                          outline: 'none',
                        }}
                      />
                      {field.type === 'password' && (
                        <button
                          onClick={() => toggleShowSecret(field.key)}
                          style={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--on-surface-variant)',
                            padding: '4px',
                          }}
                        >
                          {showSecrets[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Refresh Token */}
                <div>
                  <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                    Refresh Token
                  </span>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSecrets['refreshToken'] ? 'text' : 'password'}
                      value={form.refreshToken}
                      onChange={(e) => setForm((prev) => ({ ...prev, refreshToken: e.target.value }))}
                      placeholder="可选"
                      style={{
                        width: '100%',
                        padding: '10px',
                        paddingRight: '40px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--outline-variant)',
                        background: 'var(--surface-container-lowest)',
                        color: 'var(--on-surface)',
                        fontSize: '14px',
                        fontFamily: 'var(--font-body)',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => toggleShowSecret('refreshToken')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--on-surface-variant)',
                        padding: '4px',
                      }}
                    >
                      {showSecrets['refreshToken'] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Extra JSON */}
                <div>
                  <span className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                    扩展配置 (JSON)
                  </span>
                  <textarea
                    value={form.extra}
                    onChange={(e) => setForm((prev) => ({ ...prev, extra: e.target.value }))}
                    placeholder={`{"customField": "value"}`}
                    style={{
                      width: '100%',
                      minHeight: 80,
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--outline-variant)',
                      background: 'var(--surface-container-lowest)',
                      color: 'var(--on-surface)',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: 1.5,
                    }}
                  />
                </div>

                {/* Active toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <button
                    onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      border: 'none',
                      background: form.isActive ? 'var(--tertiary)' : 'var(--outline-variant)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    <motion.div
                      animate={{ x: form.isActive ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: 2,
                      }}
                    />
                  </button>
                  <span style={{ fontSize: '14px', color: 'var(--on-surface)' }}>
                    {form.isActive ? '启用' : '停用'}
                  </span>
                </div>

                <NeonButton variant="primary" fullWidth onClick={handleSave}>
                  {editingId ? '保存修改' : '添加账号'}
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export default MediaAccountsPage;
