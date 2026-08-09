import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    {
      name: 'save-json-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/save') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                // Write the updated configuration directly to src/data.json
                fs.writeFileSync('./src/data.json', JSON.stringify(data, null, 2), 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './admin.html'
      }
    }
  }
});
