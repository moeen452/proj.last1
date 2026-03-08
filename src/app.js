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

// ── Routes ─────────────────────────────────────
const modules = require('./modules');
app.use('/api/v1/auth',     modules.auth);
app.use('/api/v1/startups', modules.startup);
// app.use('/api/v1/brands',   modules.brands);

// ── Health Check ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running ✅' });
});

// ── Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    console.error(`\n${'─'.repeat(60)}`);
    console.error(`❌ Error: ${err.message}`);
    console.error(`📍 Code: ${err.code || 'UNKNOWN'}`);
    console.error(`🔗 URL: ${req.method} ${req.path}`);
    console.error(`${'─'.repeat(60)}\n`);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message || 'Server error',
      code:    err.code    || 'SERVER_ERROR'
    }
  });
});

module.exports = app;