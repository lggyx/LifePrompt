/**
 * AIConfigPage - AI model configuration (OpenAI / Claude / Qianwen)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  Key,
  Server,
  Thermometer,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { AI_PROVIDERS, AI_PROVIDER_CONFIGS } from '../utils/constants';
import { springs, listContainerVariants, listItemVariants } from '../utils/animations';

function AIConfigPage() {
  const [configs, setConfigs] = useState([
    {
      id: '1',
      provider: AI_PROVIDERS.OPENAI,
      name: 'OpenAI GPT-4o',
      apiKey: '',
      baseUrl: AI_PROVIDER_CONFIGS[AI_PROVIDERS.OPENAI].baseUrl,
      model: AI_PROVIDER_CONFIGS[AI_PROVIDERS.OPENAI].defaultModel,
      temperature: 0.7,
      isActive: true,
      isExpanded: false,
      isTesting: false,
      testStatus: null,
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    provider: AI_PROVIDERS.OPENAI,
    name: '',
    apiKey: '',
    baseUrl: '',
    model: '',
    temperature: 0.7,
  });

  const toggleExpand = (id) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isExpanded: !c.isExpanded } : c))
    );
  };

  const setActive = (id) => {
    setConfigs((prev) =>
      prev.map((c) => ({ ...c, isActive: c.id === id }))
    );
  };

  const handleTest = (id) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isTesting: true, testStatus: null } : c))
    );
    setTimeout(() => {
      setConfigs((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isTesting: false, testStatus: Math.random() > 0.3 ? 'success' : 'error' } : c
        )
      );
    }, 2000);
  };

  const handleDelete = (id) => {
    setConfigs((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAdd = () => {
    if (!newConfig.name || !newConfig.apiKey) return;
    const providerConfig = AI_PROVIDER_CONFIGS[newConfig.provider];
    setConfigs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ...newConfig,
        baseUrl: newConfig.baseUrl || providerConfig.baseUrl,
        model: newConfig.model || providerConfig.defaultModel,
        isActive: false,
        isExpanded: false,
        isTesting: false,
        testStatus: null,
      },
    ]);
    setShowAddForm(false);
    setNewConfig({
      provider: AI_PROVIDERS.OPENAI,
      name: '',
      apiKey: '',
      baseUrl: '',
      model: '',
      temperature: 0.7,
    });
  };

  const updateConfig = (id, field, value) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  return (
    <PageTransition>
      <TopBar title="AI 模型配置" showBack />

      <div style={{ padding: 'var(--space-md)' }}>
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
        >
          {configs.map((config) => (
            <motion.div key={config.id} variants={listItemVariants}>
              <GlassCard hoverable={false}>
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleExpand(config.id)}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 'var(--radius-full)',
                      background: config.isActive ? 'var(--tertiary)' : 'var(--outline-variant)',
                      boxShadow: config.isActive ? 'var(--glow-tertiary)' : 'none',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{config.name}</h3>
                    <p style={{ fontSize: '13px', margin: '2px 0 0', color: 'var(--on-surface-variant)' }}>
                      {AI_PROVIDER_CONFIGS[config.provider].name} · {config.model}
                    </p>
                  </div>

                  {config.testStatus === 'success' && (
                    <Check size={18} color="var(--tertiary)" />
                  )}
                  {config.testStatus === 'error' && (
                    <AlertCircle size={18} color="var(--error)" />
                  )}

                  <motion.div
                    animate={{ rotate: config.isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} color="var(--outline)" />
                  </motion.div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {config.isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={springs.smooth}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ paddingTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {/* API Key */}
                        <div>
                          <label className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                            <Key size={12} style={{ display: 'inline', marginRight: '4px' }} /> API Key
                          </label>
                          <input
                            type="password"
                            value={config.apiKey}
                            onChange={(e) => updateConfig(config.id, 'apiKey', e.target.value)}
                            placeholder="sk-..."
                            style={inputStyle}
                          />
                        </div>

                        {/* Base URL */}
                        <div>
                          <label className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                            <Server size={12} style={{ display: 'inline', marginRight: '4px' }} /> Base URL
                          </label>
                          <input
                            type="text"
                            value={config.baseUrl}
                            onChange={(e) => updateConfig(config.id, 'baseUrl', e.target.value)}
                            style={inputStyle}
                          />
                        </div>

                        {/* Model */}
                        <div>
                          <label className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                            模型
                          </label>
                          <select
                            value={config.model}
                            onChange={(e) => updateConfig(config.id, 'model', e.target.value)}
                            style={{ ...inputStyle, cursor: 'pointer' }}
                          >
                            {AI_PROVIDER_CONFIGS[config.provider].models.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>

                        {/* Temperature */}
                        <div>
                          <label className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                            <Thermometer size={12} style={{ display: 'inline', marginRight: '4px' }} /> 温度: {config.temperature}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={config.temperature}
                            onChange={(e) => updateConfig(config.id, 'temperature', parseFloat(e.target.value))}
                            style={{ width: '100%' }}
                          />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                          <NeonButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTest(config.id)}
                            disabled={config.isTesting}
                          >
                            {config.isTesting ? (
                              <><Loader2 size={14} className="spin" /> 测试中...</>
                            ) : (
                              <><Check size={14} /> 测试连接</>
                            )}
                          </NeonButton>
                          {!config.isActive && (
                            <NeonButton variant="primary" size="sm" onClick={() => setActive(config.id)}>
                              设为默认
                            </NeonButton>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(config.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 'var(--radius-full)',
                              border: '1px solid var(--error)',
                              background: 'transparent',
                              color: 'var(--error)',
                              fontSize: '13px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Trash2 size={14} /> 删除
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Add new */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: 'var(--space-lg)' }}
        >
          {!showAddForm ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddForm(true)}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                border: '2px dashed var(--outline-variant)',
                background: 'transparent',
                color: 'var(--on-surface-variant)',
                fontSize: '15px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <Plus size={20} /> 添加 AI 配置
            </motion.button>
          ) : (
            <GlassCard>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
                添加新配置
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div>
                  <label className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                    提供商
                  </label>
                  <select
                    value={newConfig.provider}
                    onChange={(e) => setNewConfig((prev) => ({ ...prev, provider: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {Object.values(AI_PROVIDERS).map((p) => (
                      <option key={p} value={p}>{AI_PROVIDER_CONFIGS[p].name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                    名称
                  </label>
                  <input
                    type="text"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：OpenAI GPT-4o"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="label-caps" style={{ color: 'var(--outline)', marginBottom: '6px', display: 'block' }}>
                    API Key
                  </label>
                  <input
                    type="password"
                    value={newConfig.apiKey}
                    onChange={(e) => setNewConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="sk-..."
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                  <NeonButton variant="ghost" fullWidth onClick={() => setShowAddForm(false)}>
                    取消
                  </NeonButton>
                  <NeonButton variant="primary" fullWidth onClick={handleAdd} disabled={!newConfig.name || !newConfig.apiKey}>
                    添加
                  </NeonButton>
                </div>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--outline-variant)',
  background: 'var(--surface-container-lowest)',
  color: 'var(--on-surface)',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border-color var(--duration-fast) var(--ease-smooth)',
};

export default AIConfigPage;
