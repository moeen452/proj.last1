// src/server.js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🔗 Environment: ${ENV}`);
  console.log(`${'═'.repeat(80)}\n`);
});

// ── Graceful Shutdown ──────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server;
