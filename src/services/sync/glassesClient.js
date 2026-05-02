/**
 * Glasses WebSocket Client
 * Connects to Python WebSocket server for real-time image push from smart glasses.
 *
 * Server protocol:
 *  1. On connect, client sends: { "type": "auth", "username": "<user>", "password": "<pass>" }
 *  2. Server responds: { "type": "auth_success" } or { "type": "auth_failed", "message": "..." }
 *  3. Server pushes new images: { "type": "uploaded_image", "filename": "...", "data": "base64...",
 *                                 "mime_type": "image/jpeg", "uploader": "filesystem" }
 *  4. Heartbeat: server → client every 30s: { "type": "ping" }, client replies: { "type": "pong" }
 */

const WS_URL = 'ws://localhost:8765';

class GlassesClient {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.pingTimer = null;
    this.connected = false;
    this.authenticated = false;
    this.listeners = new Set();
    this.imageBuffer = [];
  }

  connect(auth = { username: 'default', password: '' }) {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    try {
      this.ws = new WebSocket(WS_URL);
    } catch (err) {
      console.error('[GlassesClient] Failed to create WebSocket:', err);
      this._scheduleReconnect(auth);
      return;
    }

    this.ws.onopen = () => {
      console.log('[GlassesClient] Connected');
      this.connected = true;
      // Send auth immediately
      this._send({ type: 'auth', username: auth.username, password: auth.password });
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this._handleMessage(msg, auth);
      } catch (err) {
        console.warn('[GlassesClient] Invalid JSON:', event.data);
      }
    };

    this.ws.onclose = () => {
      console.log('[GlassesClient] Disconnected');
      this.connected = false;
      this.authenticated = false;
      this._clearPing();
      this._scheduleReconnect(auth);
    };

    this.ws.onerror = (err) => {
      console.error('[GlassesClient] WebSocket error:', err);
    };
  }

  disconnect() {
    this._clearPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.authenticated = false;
  }

  _send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  _handleMessage(msg, auth) {
    switch (msg.type) {
      case 'auth_success':
        this.authenticated = true;
        console.log('[GlassesClient] Authenticated');
        this._notify({ type: 'status', status: 'connected' });
        this._startPing();
        break;

      case 'auth_failed':
        console.error('[GlassesClient] Auth failed:', msg.message);
        this.authenticated = false;
        this._notify({ type: 'status', status: 'auth_failed', message: msg.message });
        break;

      case 'uploaded_image': {
        const imageRecord = {
          id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          imageData: msg.data,
          mimeType: msg.mime_type || 'image/jpeg',
          filename: msg.filename,
          title: null,
          summary: null,
          content: null,
          tags: null,
          status: 'pending',
          uploader: msg.uploader || 'unknown',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.imageBuffer.push(imageRecord);
        this._notify({ type: 'image', record: imageRecord });
        break;
      }

      case 'ping':
        this._send({ type: 'pong' });
        break;

      case 'error':
        console.error('[GlassesClient] Server error:', msg.message);
        this._notify({ type: 'error', message: msg.message });
        break;

      default:
        console.log('[GlassesClient] Unknown message type:', msg.type);
    }
  }

  _startPing() {
    this._clearPing();
    this.pingTimer = setInterval(() => {
      if (this.connected && this.authenticated) {
        this._send({ type: 'ping' });
      }
    }, 30000);
  }

  _clearPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  _scheduleReconnect(auth) {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log('[GlassesClient] Reconnecting...');
      this.connect(auth);
    }, 5000);
  }

  // Listener pattern
  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify(event) {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('[GlassesClient] Listener error:', err);
      }
    });
  }

  getBufferedImages() {
    return [...this.imageBuffer];
  }

  clearBuffer() {
    this.imageBuffer = [];
  }
}

export const glassesClient = new GlassesClient();
export default glassesClient;
