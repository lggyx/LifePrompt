import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'lifeprompt:proxy',
      configureServer(server) {
        // ── Link capture proxy (fetch remote HTML server-side, bypass CORS) ──
        server.middlewares.use('/api/proxy', async (req, res) => {
          const targetUrl = req.query.url;
          if (!targetUrl) {
            res.status(400).json({ error: 'Missing url parameter' });
            return;
          }

          try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 12000);

            const response = await fetch(decodeURIComponent(targetUrl), {
              signal: ctrl.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (LifePrompt/1.0; +https://lifeprompt.app)',
                Accept: 'text/html,application/xhtml+xml,*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
              },
            });

            clearTimeout(t);

            const text = await response.text();

            // Don't leak proxy security headers
            res.removeHeader('X-Frame-Options');
            res.removeHeader('Content-Security-Policy');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.status(response.status).send(text);
          } catch (err) {
            res.status(502).json({ error: 'Proxy fetch failed', message: err.message });
          }
        });

        // ── Link content extraction (Node.js side, jsdom) ──
        // Called from browser as /api/extract?url=... — returns { title, content, excerpt }
        server.middlewares.use('/api/extract', async (req, res) => {
          const targetUrl = req.query.url;
          if (!targetUrl) {
            res.status(400).json({ error: 'Missing url parameter' });
            return;
          }

          try {
            // 1. Fetch raw HTML via /api/proxy
            const proxyRes = await fetch(`/api/proxy?url=${encodeURIComponent(decodeURIComponent(targetUrl))}`, {
              signal: AbortSignal.timeout(15000),
              headers: { 'Accept': 'text/html' },
            });
            if (!proxyRes.ok) {
              res.status(502).json({ error: 'Failed to fetch page', status: proxyRes.status });
              return;
            }
            const html = await proxyRes.text();

            // 2. Extract with jsdom
            const { extract } = require('./server/extractor');
            const result = extract(html, decodeURIComponent(targetUrl));

            // 3. Or fall through to client-side extraction
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.status(200).json(result);
          } catch (err) {
            res.status(500).json({ error: 'Extraction failed', message: err.message });
          }
        });
      },
    },
  ],
});
