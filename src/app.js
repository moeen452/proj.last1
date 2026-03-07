// src/app.js
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// ── Middlewares ──────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// ── Routes (نضيف كل route بعد إنشاء ملفاتها) ────
app.use('/api/v1/auth',     require('../auth/auth.router'));
app.use('/api/v1/startups', require('../startup/startup.router'));
// app.use('/api/v1/brands',   require('../brands/brands.router'));

// ── Health Check ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running ✅' });
});

// ── Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message || 'Server error',
      code:    err.code    || 'SERVER_ERROR'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
});