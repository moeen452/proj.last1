// src/modules/auth/auth.service.js
const bcrypt           = require('bcryptjs');
const crypto           = require('crypto');
const jwt              = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { t }            = require('../../common/i18n');

const prisma = new PrismaClient();

// ════════════════════════════════════════
// REGISTER
// ════════════════════════════════════════
const register = async ({ fullName, email, password }, lang) => {

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    const err = new Error(t('EMAIL_EXISTS', lang));
    err.statusCode = 409;
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  const passwordHash      = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiry       = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      emailVerificationToken:  verificationToken,
      emailVerificationExpiry: tokenExpiry
    },
    select: { id: true, email: true, fullName: true, role: true }
  });

  const verifyUrl = `http://localhost:3000/api/v1/auth/verify-email?token=${verificationToken}`;
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`📧 تم إنشاء حساب جديد: ${email}`);
  console.log(`🔗 رابط التحقق:`);
  console.log(`   ${verifyUrl}`);
  console.log(`⏱️  صلاحية الرمز: 24 ساعة`);
  console.log(`${'═'.repeat(80)}\n`);

  return user;
};

// ════════════════════════════════════════
// VERIFY EMAIL (عبر رابط)
// ════════════════════════════════════════
const verifyEmail = async (token, lang) => {

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken:  token,
      emailVerificationExpiry: { gt: new Date() }
    }
  });

  if (!user) {
    const err = new Error(t('INVALID_TOKEN', lang));
    err.statusCode = 400;
    err.code = 'INVALID_TOKEN';
    throw err;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified:         true,
      emailVerificationToken:  null,
      emailVerificationExpiry: null,
    }
  });

  console.log(`✅ تم تأكيد الإيميل: ${user.email}`);
  return { message: lang === 'ar' ? 'تم تأكيد الإيميل ✅' : 'Email verified ✅' };
};

// ════════════════════════════════════════
// DEV VERIFY (يدوي - للتطوير فقط)
// ════════════════════════════════════════
const devVerify = async (email, lang) => {

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const err = new Error(t('NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  await prisma.user.update({
    where: { email },
    data: {
      isEmailVerified:         true,
      emailVerificationToken:  null,
      emailVerificationExpiry: null,
    }
  });

  console.log(`✅ [DEV] تم تأكيد الإيميل يدوياً: ${email}`);
  return true;
};

// ════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════
const login = async ({ email, password }, lang) => {

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const err = new Error(t('INVALID_CREDENTIALS', lang));
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const err = new Error(t('INVALID_CREDENTIALS', lang));
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  if (!user.isEmailVerified) {
    const err = new Error(t('EMAIL_NOT_VERIFIED', lang));
    err.statusCode = 401;
    err.code = 'EMAIL_NOT_VERIFIED';
    throw err;
  }

  const payload      = { id: user.id, email: user.email, role: user.role };
  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET,  { expiresIn: '7d'  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
  };
};

// ════════════════════════════════════════
// REFRESH
// ════════════════════════════════════════
const refresh = async (refreshToken, lang) => {

  if (!refreshToken) {
    const err = new Error(t('UNAUTHORIZED', lang));
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  try {
    const decoded     = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    return { accessToken };
  } catch {
    const err = new Error(t('TOKEN_EXPIRED', lang));
    err.statusCode = 401;
    err.code = 'TOKEN_EXPIRED';
    throw err;
  }
};

// ════════════════════════════════════════
// GET ME
// ════════════════════════════════════════
const getMe = async (userId) => {
  return await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true }
  });
};

module.exports = { register, verifyEmail, devVerify, login, refresh, getMe };