const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} sedang digunakan oleh aplikasi lain.`);
    console.error(`Solusi: Hentikan aplikasi tersebut atau ganti PORT di server/.env (misal PORT=5001).`);
  } else {
    console.error('Server listener error:', err.message);
  }
});
