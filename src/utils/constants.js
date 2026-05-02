/**
 * Application Constants
 */

export const APP_NAME = 'LifePrompt';
export const APP_VERSION = '0.1.0';

// ===== ROUTES =====
export const ROUTES = {
  HOME: '/',
  MINDMAP: '/mindmap',
  ARTICLES: '/articles',
  ARTICLE_DETAIL: '/article/:id',
  CAPTURE: '/capture',
  LINK_CAPTURE: '/capture/link',
  GLASSES: '/glasses',
  CHAT: '/chat',
  SETTINGS: '/settings',
  SETTINGS_AI: '/settings/ai',
  SETTINGS_SHORTCUTS: '/settings/shortcuts',
  SETTINGS_CLOUD: '/settings/cloud',
  SETTINGS_LAN: '/settings/lan',
  SETTINGS_STORAGE: '/settings/storage',
  PUBLISH: '/publish/:id',
  ONBOARDING: '/onboarding',
  USER_PROFILE: '/onboarding/profile',
};

// ===== BOTTOM NAV TABS =====
export const BOTTOM_TABS = [
  { path: ROUTES.MINDMAP, label: '脑图', icon: 'Brain' },
  { path: ROUTES.ARTICLES, label: '文章', icon: 'FileText' },
  { path: ROUTES.CAPTURE, label: '捕获', icon: 'PlusCircle', isSpecial: true },
  { path: ROUTES.CHAT, label: 'AI', icon: 'MessageSquare' },
  { path: ROUTES.SETTINGS, label: '设置', icon: 'Settings' },
];

// ===== SOURCE TYPES =====
export const SOURCE_TYPES = {
  SCREENSHOT: 'screenshot',
  LINK: 'link',
  GLASSES: 'glasses',
  MANUAL: 'manual',
};

export const SOURCE_TYPE_LABELS = {
  [SOURCE_TYPES.SCREENSHOT]: '截图',
  [SOURCE_TYPES.LINK]: '链接',
  [SOURCE_TYPES.GLASSES]: '眼镜',
  [SOURCE_TYPES.MANUAL]: '手动',
};

export const SOURCE_TYPE_COLORS = {
  [SOURCE_TYPES.SCREENSHOT]: '--tertiary',
  [SOURCE_TYPES.LINK]: '--secondary',
  [SOURCE_TYPES.GLASSES]: '--primary',
  [SOURCE_TYPES.MANUAL]: '--outline',
};

// ===== VIEW MODES =====
export const VIEW_MODES = {
  COMPACT: 'compact',
  STANDARD: 'standard',
  RICH: 'rich',
};

export const VIEW_MODE_LABELS = {
  [VIEW_MODES.COMPACT]: '紧凑',
  [VIEW_MODES.STANDARD]: '标准',
  [VIEW_MODES.RICH]: '丰富',
};

// ===== AI MODELS =====
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  CLAUDE: 'claude',
  QIANWEN: 'qianwen',
};

export const AI_PROVIDER_CONFIGS = {
  [AI_PROVIDERS.OPENAI]: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    defaultModel: 'gpt-4o',
    supportsVision: true,
  },
  [AI_PROVIDERS.CLAUDE]: {
    name: 'Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    defaultModel: 'claude-3-5-sonnet-20241022',
    supportsVision: true,
  },
  [AI_PROVIDERS.QIANWEN]: {
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-vl-max', 'qwen-max', 'qwen-plus'],
    defaultModel: 'qwen-vl-max',
    supportsVision: true,
  },
};

// ===== STORAGE KEYS =====
export const STORAGE_KEYS = {
  THEME: 'lp_theme',
  AI_CONFIGS: 'lp_ai_configs',
  ACTIVE_AI: 'lp_active_ai',
  USER_PROFILE: 'lp_user_profile',
  SETTINGS: 'lp_settings',
  AUTH_TOKEN: 'lp_auth_token',
  USER_INFO: 'lp_user_info',
  ONBOARDING_DONE: 'lp_onboarding_done',
  VIEW_MODE: 'lp_view_mode',
  SYNC_ENABLED: 'lp_sync_enabled',
};

// ===== SYNC STATUS =====
export const SYNC_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  ERROR: 'error',
};

// ===== PUBLISH PLATFORMS =====
export const PUBLISH_PLATFORMS = {
  WECHAT: 'wechat',
};

export const PUBLISH_PLATFORM_LABELS = {
  [PUBLISH_PLATFORMS.WECHAT]: '微信公众号',
};

// ===== ANIMATION CONSTANTS =====
export const ANIMATION = {
  SPRING_POP: { type: 'spring', stiffness: 400, damping: 25 },
  SPRING_SMOOTH: { type: 'spring', stiffness: 300, damping: 30 },
  SPRING_PRESS: { type: 'spring', stiffness: 500, damping: 15 },
  SPRING_BOUNCE: { type: 'spring', stiffness: 350, damping: 12 },
  STAGGER_CHILDREN: 0.05,
  STAGGER_CONTAINER: { staggerChildren: 0.05 },
  STAGGER_ITEM: {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  FADE_IN: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  SLIDE_UP: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  SCALE_IN: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
};

// ===== HAPTIC FEEDBACK TYPES =====
export const HAPTIC_TYPES = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
};

// ===== DEFAULT SETTINGS =====
export const DEFAULT_SETTINGS = {
  theme: 'light',
  viewMode: VIEW_MODES.STANDARD,
  syncEnabled: false,
  autoSync: false,
  hapticsEnabled: true,
  screenshotTrigger: 'floating', // 'floating' | 'notification'
  floatingPosition: 'right',
  floatingOpacity: 0.8,
  notificationShortcut: true,
};
