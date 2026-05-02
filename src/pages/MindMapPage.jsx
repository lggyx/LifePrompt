/**
 * MindMapPage - 3D Knowledge Graph with Three.js + Dashboard HUD
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Maximize2 } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import PageTransition from '../components/layout/PageTransition';
import { DashboardHUD } from '../components/three/DashboardHUD';

// Mock data (will be replaced with real data from IndexedDB)
import { generateMockArticles } from '../utils/mockData';

const DEFAULT_TAGS = [
  { name: '知识管理', color: '#00f0ff' },
  { name: 'AI', color: '#ff2d78' },
  { name: '效率', color: '#ffe04a' },
  { name: '写作', color: '#00ffcc' },
  { name: '学习', color: '#d300bd' },
];

function MindMapPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [articles, setArticles] = useState([]);
  const [tags] = useState(DEFAULT_TAGS);

  // Get current theme
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') || 'light');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Load mock articles (TODO: replace with real data from IndexedDB)
  useEffect(() => {
    const mockArticles = generateMockArticles(15);
    setArticles(mockArticles);
  }, []);

  const handleArticleClick = (article) => {
    navigate(`/articles/${article.id}`);
  };

  const handleTagClick = (tagName) => {
    // Navigate to article list filtered by tag
    navigate(`/articles?tag=${encodeURIComponent(tagName)}`);
  };

  const handleReset = () => {
    // Reset camera position
    window.location.reload();
  };

  const isNight = theme === 'night';

  return (
    <PageTransition>
      <TopBar
        title="知识脑图"
        rightActions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleReset}
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isNight ? 'rgba(255, 255, 255, 0.2)' : 'var(--outline-variant)'}`,
                background: isNight ? 'rgba(255, 255, 255, 0.1)' : 'var(--surface-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={18} color={isNight ? '#e0e0f0' : 'var(--on-surface)'} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                // Toggle fullscreen
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isNight ? 'rgba(255, 255, 255, 0.2)' : 'var(--outline-variant)'}`,
                background: isNight ? 'rgba(255, 255, 255, 0.1)' : 'var(--surface-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Maximize2 size={18} color={isNight ? '#e0e0f0' : 'var(--on-surface)'} />
            </motion.button>
          </div>
        }
      />

      <div
        style={{
          position: 'relative',
          height: 'calc(100dvh - 56px - 24px - 64px - env(safe-area-inset-bottom, 0px))',
          marginTop: '-24px',
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        <DashboardHUD
          articles={articles}
          tags={tags}
          theme={theme}
          onTagClick={handleTagClick}
        />

      </div>
    </PageTransition>
  );
}

export default MindMapPage;
