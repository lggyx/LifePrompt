/**
 * App.jsx - Root component with routing, theme, and DB initialization
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ThemeProvider from './components/providers/ThemeProvider';
import AppShell from './components/layout/AppShell';
import { initDatabase, articleRepo, aiConfigRepo } from './services/storage/db';
import { generateMockArticles } from './utils/mockData';
import { glassesClient } from './services/sync/glassesClient';

// Pages
import HomePage from './pages/HomePage';
import MindMapPage from './pages/MindMapPage';
import ArticleListPage from './pages/ArticleListPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import CapturePage from './pages/CapturePage';
import GlassesInboxPage from './pages/GlassesInboxPage';
import AIChatPage from './pages/AIChatPage';
import SettingsPage from './pages/SettingsPage';
import AIConfigPage from './pages/AIConfigPage';
import PublishPage from './pages/PublishPage';
import UserProfilePage from './pages/UserProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import ShortcutConfigPage from './pages/ShortcutConfigPage';
import CloudBackupPage from './pages/CloudBackupPage';
import StoragePage from './pages/StoragePage';
import LANBackupPage from './pages/LANBackupPage';
import SearchPage from './pages/SearchPage';
import MediaAccountsPage from './pages/MediaAccountsPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/mindmap" element={<MindMapPage />} />
        <Route path="/articles" element={<ArticleListPage />} />
        <Route path="/article/:id" element={<ArticleDetailPage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/glasses" element={<GlassesInboxPage />} />
        <Route path="/chat" element={<AIChatPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/ai" element={<AIConfigPage />} />
        <Route path="/settings/shortcuts" element={<ShortcutConfigPage />} />
        <Route path="/settings/cloud" element={<CloudBackupPage />} />
        <Route path="/settings/lan" element={<LANBackupPage />} />
        <Route path="/settings/storage" element={<StoragePage />} />
        <Route path="/settings/media" element={<MediaAccountsPage />} />
        <Route path="/publish/:id" element={<PublishPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/onboarding/profile" element={<UserProfilePage />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppInitializer({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase(async () => {
          // Seed mock articles if database is empty
          const mockArticles = generateMockArticles(15);
          mockArticles.forEach((article) => {
            articleRepo.create(article);
          });
          console.log('[App] Seeded mock articles');
        });

        // Detect old-format articles and re-seed for development
        const existing = articleRepo.getAll({ limit: 1 });
        const needsReseed = existing.length > 0 && existing[0].content?.includes('这是一段更详细的文章内容');
        if (needsReseed) {
          const all = articleRepo.getAll();
          all.forEach((a) => articleRepo.delete(a.id));
          const mockArticles = generateMockArticles(15);
          mockArticles.forEach((article) => {
            articleRepo.create(article);
          });
          console.log('[App] Reseeded with rich Markdown content');
        }

        // Seed default AI config if none exists
        const configs = aiConfigRepo.getAll();
        if (configs.length === 0) {
          aiConfigRepo.create({
            provider: 'qianwen',
            name: '通义千问 Debug',
            apiKey: '',
            baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            model: 'qwen3.5-flash',
            temperature: 0.7,
            isActive: 1,
          });
          console.log('[App] Seeded default AI config');
        }

        // Initialize WebSocket connection for glasses inbox
        // Connection is lazy — only connects when user navigates to /glasses
        // We expose a global trigger so GlassesInboxPage can initiate
        window.__initGlassesWS = () => {
          if (!glassesClient.connected) {
            glassesClient.connect({ username: 'default', password: '' });
          }
        };
      } catch (err) {
        console.error('[App] Database init failed:', err);
      } finally {
        setReady(true);
      }
    }
    init();
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface)',
          color: 'var(--on-surface)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid var(--primary-container)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>初始化数据库...</p>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppInitializer>
          <AppShell>
            <AnimatedRoutes />
          </AppShell>
        </AppInitializer>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
