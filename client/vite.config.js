import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            if (!res.headersSent) {
              res.writeHead(503, {
                'Content-Type': 'application/json',
              });
              res.end(
                JSON.stringify({
                  message:
                    'Server backend (port 5000) belum berjalan. Silakan jalankan perintah "npm run dev" di terminal agar backend dan frontend berjalan bersamaan.',
                })
              );
            }
          });
        },
      },
    },
  },
})
