/**
 * MindMapPage - Mind map visualization of articles and tags
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import { listContainerVariants, listItemVariants } from '../utils/animations';

function MindMapPage() {
  const [scale, setScale] = useState(1);
  const [nodes, setNodes] = useState([]);

  // Mock mind map data
  useEffect(() => {
    const mockNodes = [
      { id: 'root', x: 50, y: 50, label: '我的文章', type: 'root', size: 60 },
      { id: 'tag-1', x: 20, y: 20, label: '知识管理', type: 'tag', size: 40, parent: 'root' },
      { id: 'tag-2', x: 80, y: 20, label: 'AI', type: 'tag', size: 40, parent: 'root' },
      { id: 'tag-3', x: 20, y: 80, label: '效率', type: 'tag', size: 40, parent: 'root' },
      { id: 'tag-4', x: 80, y: 80, label: '学习', type: 'tag', size: 40, parent: 'root' },
      { id: 'art-1', x: 10, y: 10, label: '第二大脑', type: 'article', size: 24, parent: 'tag-1' },
      { id: 'art-2', x: 30, y: 10, label: '笔记方法', type: 'article', size: 24, parent: 'tag-1' },
      { id: 'art-3', x: 70, y: 10, label: 'GPT-4o', type: 'article', size: 24, parent: 'tag-2' },
      { id: 'art-4', x: 90, y: 10, label: 'Claude技巧', type: 'article', size: 24, parent: 'tag-2' },
      { id: 'art-5', x: 10, y: 90, label: '深度工作', type: 'article', size: 24, parent: 'tag-3' },
      { id: 'art-6', x: 30, y: 90, label: '番茄钟', type: 'article', size: 24, parent: 'tag-3' },
      { id: 'art-7', x: 70, y: 90, label: '费曼技巧', type: 'article', size: 24, parent: 'tag-4' },
      { id: 'art-8', x: 90, y: 90, label: '间隔重复', type: 'article', size: 24, parent: 'tag-4' },
    ];
    setNodes(mockNodes);
  }, []);

  const getNodeColor = (type) => {
    switch (type) {
      case 'root': return 'var(--primary-container)';
      case 'tag': return 'var(--secondary-container)';
      case 'article': return 'var(--tertiary-container)';
      default: return 'var(--surface-container)';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'root': return 'var(--on-primary-container)';
      case 'tag': return 'var(--on-secondary-container)';
      case 'article': return 'var(--on-tertiary-container)';
      default: return 'var(--on-surface)';
    }
  };

  return (
    <PageTransition>
      <TopBar
        title="脑图"
        rightActions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setScale((s) => Math.min(s + 0.2, 3))}
              style={iconButtonStyle}
            >
              <ZoomIn size={18} color="var(--on-surface)" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
              style={iconButtonStyle}
            >
              <ZoomOut size={18} color="var(--on-surface)" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setScale(1)}
              style={iconButtonStyle}
            >
              <RefreshCw size={18} color="var(--on-surface)" />
            </motion.button>
          </div>
        }
      />

      <div
        style={{
          padding: 'var(--space-md)',
          height: 'calc(100dvh - 56px - 64px - env(safe-area-inset-bottom, 0px))',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--background)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform var(--duration-slow) var(--ease-smooth)',
          }}
        >
          {/* SVG lines connecting nodes */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {nodes.filter(n => n.parent).map(node => {
              const parent = nodes.find(n => n.id === node.parent);
              if (!parent) return null;
              return (
                <line
                  key={`line-${node.id}`}
                  x1={`${parent.x}%`}
                  y1={`${parent.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke="var(--outline-variant)"
                  strokeWidth="1"
                  opacity="0.5"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {nodes.map((node) => (
              <motion.div
                key={node.id}
                variants={listItemVariants}
                whileHover={{ scale: 1.15, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'absolute',
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: node.size,
                  height: node.size,
                  borderRadius: 'var(--radius-full)',
                  background: getNodeColor(node.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--glow-primary)',
                  zIndex: node.type === 'root' ? 5 : 2,
                  border: '2px solid var(--outline-variant)',
                }}
              >
                <span
                  style={{
                    fontSize: node.type === 'root' ? '12px' : '10px',
                    fontWeight: 600,
                    color: getTextColor(node.type),
                    textAlign: 'center',
                    padding: '2px',
                    wordBreak: 'break-word',
                    lineHeight: 1.2,
                  }}
                >
                  {node.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Info card */}
        <GlassCard
          hoverable={false}
          padding="var(--space-sm)"
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}
        >
          <Brain size={20} color="var(--primary)" />
          <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
            点击节点展开/折叠 · 双指缩放 · 拖拽移动
          </span>
        </GlassCard>
      </div>
    </PageTransition>
  );
}

const iconButtonStyle = {
  width: 36,
  height: 36,
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--outline-variant)',
  background: 'var(--surface-container)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

export default MindMapPage;
