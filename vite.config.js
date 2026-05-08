import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'lifeprompt:proxy',
      configureServer(server) {
        // Link capture proxy — fetch remote web pages on the server side,
        // bypassing CORS so the content extractor can work in the browser.
        server.middlewares.use(
          '/api/proxy',
          async (req, res) => {
            const targetUrl = req.query.url;
            if (!targetUrl) {
              res.status(400).json({ error: 'Missing url parameter' });
              return;
            }

            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 12000);

              const response = await fetch(targetUrl, {
                signal: controller.signal,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (LifePrompt Capture/1.0; +https://lifeprompt.app)',
                  Accept: 'text/html,application/xhtml+xml,*/*',
                  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                },
              });

              clearTimeout(timeout);

              const text = await response.text();

              // Strip unsafe headers
              res.removeHeader('X-Frame-Options');
              res.removeHeader('CSP');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.status(response.status).send(text);
            } catch (err) {
              res.status(502).json({
                error: 'Proxy fetch failed',
                message: err.message,
              });
            }
          }
        );
      },
    },
  ],
})
