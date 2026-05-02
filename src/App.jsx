/**
 * App.jsx - Root component with routing and theme
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ThemeProvider from './components/providers/ThemeProvider';
import AppShell from './components/layout/AppShell';

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
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/ai" element={<AIConfigPage />} />
        <Route path="/settings/shortcuts" element={<SettingsPage />} />
        <Route path="/settings/cloud" element={<SettingsPage />} />
        <Route path="/settings/lan" element={<SettingsPage />} />
        <Route path="/settings/storage" element={<SettingsPage />} />
        <Route path="/publish/:id" element={<PublishPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/onboarding/profile" element={<UserProfilePage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppShell>
          <AnimatedRoutes />
        </AppShell>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
