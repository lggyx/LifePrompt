/**
 * nativeBridge - Capacitor native plugin wrapper
 * Provides Android-specific functionality: permissions, floating window, notifications, share handling
 */

import { App } from '@capacitor/app';
import { Clipboard } from '@capacitor/clipboard';
import { Haptics } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Network } from '@capacitor/network';
import { Camera } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

// Detect if running in Capacitor native environment
const isNative = () => {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform();
};

const isAndroid = () => {
  return isNative() && window.Capacitor?.getPlatform() === 'android';
};

// ===== PERMISSIONS =====

const ANDROID_PERMISSIONS = {
  CAMERA: 'android.permission.CAMERA',
  READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
  WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
  READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
  POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
  SYSTEM_ALERT_WINDOW: 'android.permission.SYSTEM_ALERT_WINDOW',
  RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
};

/**
 * Request permission using Capacitor's native bridge
 * Falls back gracefully on web
 */
async function requestPermission(permission) {
  if (!isAndroid()) return { granted: true };
  try {
    // Use the Permissions plugin via native bridge
    const result = await window.Capacitor.Plugins.Permissions?.query({ name: permission });
    if (result?.state === 'granted') return { granted: true };

    const requestResult = await window.Capacitor.Plugins.Permissions?.request({ name: permission });
    return { granted: requestResult?.state === 'granted' };
  } catch (e) {
    console.warn('Permission request failed:', e);
    return { granted: false, error: e.message };
  }
}

async function requestCameraPermission() {
  return requestPermission(ANDROID_PERMISSIONS.CAMERA);
}

async function requestStoragePermission() {
  if (!isAndroid()) return { granted: true };
  // For Android 13+, use READ_MEDIA_IMAGES
  const sdk = await getSdkVersion();
  const perm = sdk >= 33 ? ANDROID_PERMISSIONS.READ_MEDIA_IMAGES : ANDROID_PERMISSIONS.READ_EXTERNAL_STORAGE;
  return requestPermission(perm);
}

async function requestNotificationPermission() {
  return requestPermission(ANDROID_PERMISSIONS.POST_NOTIFICATIONS);
}

async function requestOverlayPermission() {
  if (!isAndroid()) return { granted: true };
  try {
    const result = await window.Capacitor.Plugins.LifePromptNative?.requestOverlayPermission();
    return { granted: result?.granted || false };
  } catch (e) {
    console.warn('Overlay permission request failed:', e);
    return { granted: false };
  }
}

async function getSdkVersion() {
  if (!isAndroid()) return 0;
  try {
    const info = await window.Capacitor.Plugins.Device?.getInfo();
    return info?.sdkVersion || 0;
  } catch {
    return 0;
  }
}

// ===== FLOATING WINDOW =====

async function startFloatingWindow() {
  if (!isAndroid()) {
    console.log('Floating window only available on Android');
    return { success: false };
  }
  try {
    const result = await window.Capacitor.Plugins.LifePromptNative?.startFloatingWindow();
    return result || { success: true };
  } catch (e) {
    console.warn('Start floating window failed:', e);
    return { success: false, error: e.message };
  }
}

async function stopFloatingWindow() {
  if (!isAndroid()) return { success: false };
  try {
    const result = await window.Capacitor.Plugins.LifePromptNative?.stopFloatingWindow();
    return result || { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ===== NOTIFICATION SHORTCUT =====

async function startNotificationShortcut() {
  if (!isAndroid()) {
    console.log('Notification shortcut only available on Android');
    return { success: false };
  }
  try {
    const result = await window.Capacitor.Plugins.LifePromptNative?.startNotificationService();
    return result || { success: true };
  } catch (e) {
    console.warn('Start notification service failed:', e);
    return { success: false, error: e.message };
  }
}

async function stopNotificationShortcut() {
  if (!isAndroid()) return { success: false };
  try {
    const result = await window.Capacitor.Plugins.LifePromptNative?.stopNotificationService();
    return result || { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ===== CLIPBOARD =====

async function readClipboard() {
  try {
    const result = await Clipboard.read();
    return result.value || '';
  } catch (e) {
    console.warn('Read clipboard failed:', e);
    return '';
  }
}

async function writeClipboard(text) {
  try {
    await Clipboard.write({ string: text });
    return true;
  } catch (e) {
    console.warn('Write clipboard failed:', e);
    return false;
  }
}

// ===== HAPTICS =====

async function hapticFeedback(type = 'light') {
  if (!isNative()) return;
  try {
    switch (type) {
      case 'light':
        await Haptics.impact({ style: 'light' });
        break;
      case 'medium':
        await Haptics.impact({ style: 'medium' });
        break;
      case 'heavy':
        await Haptics.impact({ style: 'heavy' });
        break;
      case 'success':
        await Haptics.notification({ type: 'success' });
        break;
      case 'error':
        await Haptics.notification({ type: 'error' });
        break;
      case 'warning':
        await Haptics.notification({ type: 'warning' });
        break;
      default:
        await Haptics.impact({ style: 'light' });
    }
  } catch (e) {
    // Haptics not available, ignore
  }
}

// ===== SHARE =====

async function nativeShare(options) {
  try {
    await Share.share(options);
    return true;
  } catch (e) {
    // User cancelled or share failed
    return false;
  }
}

// ===== CAMERA / FILESYSTEM =====

async function takePhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: 'base64',
      source: 'camera',
    });
    return image;
  } catch (e) {
    console.warn('Take photo failed:', e);
    return null;
  }
}

async function pickImage() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: 'base64',
      source: 'photos',
    });
    return image;
  } catch (e) {
    console.warn('Pick image failed:', e);
    return null;
  }
}

async function saveFile(path, data) {
  try {
    const result = await Filesystem.writeFile({
      path,
      data,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    return result;
  } catch (e) {
    console.warn('Save file failed:', e);
    return null;
  }
}

async function readFile(path) {
  try {
    const result = await Filesystem.readFile({
      path,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    return result.data;
  } catch (e) {
    console.warn('Read file failed:', e);
    return null;
  }
}

// ===== NETWORK =====

async function getNetworkStatus() {
  try {
    const status = await Network.getStatus();
    return status;
  } catch (e) {
    return { connected: true, connectionType: 'unknown' };
  }
}

// ===== APP STATE =====

function onAppStateChange(callback) {
  const listener = App.addListener('appStateChange', callback);
  return () => listener.remove();
}

function onBackButton(callback) {
  const listener = App.addListener('backButton', callback);
  return () => listener.remove();
}

// ===== STATUS BAR =====

async function setStatusBarStyle(dark) {
  if (!isNative()) return;
  try {
    await StatusBar.setStyle({ style: dark ? 'dark' : 'light' });
  } catch (e) {
    // Ignore
  }
}

async function hideStatusBar() {
  if (!isNative()) return;
  try {
    await StatusBar.hide();
  } catch (e) {
    // Ignore
  }
}

async function showStatusBar() {
  if (!isNative()) return;
  try {
    await StatusBar.show();
  } catch (e) {
    // Ignore
  }
}

// ===== KEYBOARD =====

async function setKeyboardStyle(dark) {
  if (!isNative()) return;
  try {
    await Keyboard.setStyle({ style: dark ? 'dark' : 'light' });
  } catch (e) {
    // Ignore
  }
}

// ===== EXPORT =====

export const nativeBridge = {
  isNative,
  isAndroid,

  // Permissions
  requestPermission,
  requestCameraPermission,
  requestStoragePermission,
  requestNotificationPermission,
  requestOverlayPermission,
  getSdkVersion,

  // Floating window
  startFloatingWindow,
  stopFloatingWindow,

  // Notification shortcut
  startNotificationShortcut,
  stopNotificationShortcut,

  // Clipboard
  readClipboard,
  writeClipboard,

  // Haptics
  hapticFeedback,

  // Share
  nativeShare,

  // Camera / Filesystem
  takePhoto,
  pickImage,
  saveFile,
  readFile,

  // Network
  getNetworkStatus,

  // App state
  onAppStateChange,
  onBackButton,

  // Status bar
  setStatusBarStyle,
  hideStatusBar,
  showStatusBar,

  // Keyboard
  setKeyboardStyle,
};

export default nativeBridge;
