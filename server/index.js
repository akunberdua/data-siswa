const app = require('./app');

// Jika dijalankan langsung di lokal (node index.js atau npm run dev)
if (require.main === module || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`⚠️ Port ${PORT} sedang digunakan oleh aplikasi lain.`);
    } else {
      console.error('Server listener error:', err.message);
    }
  });
}

// Export Express app untuk Vercel Serverless Function & Vercel Services
module.exports = app;

