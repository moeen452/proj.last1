const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const sendEmail = require('../../common/email');
const { t } = require('../../common/i18n');

const prisma = new PrismaClient();
const REFRESH_TOKEN_TTL_MS = Number(process.env.REFRESH_TOKEN_TTL_MS || 30 * 24 * 60 * 60 * 1000);

const createError = (message, statusCode = 400, code = 'BAD_REQUEST') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const getSafeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  preferredLanguage: user.preferredLanguage,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw createError('JWT secret is missing', 500, 'SERVER_ERROR');
  }
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

const createRefreshToken = async (userId, userAgent, ipAddress) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  return prisma.refreshToken.create({
    data: {
      userId,
      token,
      userAgent,
      ipAddress,
      expiresAt,
      isActive: true,
    },
  });
};

const buildSessionPayload = (refreshToken) => ({
  id: refreshToken.id,
  userAgent: refreshToken.userAgent,
  ipAddress: refreshToken.ipAddress,
  expiresAt: refreshToken.expiresAt,
  createdAt: refreshToken.createdAt,
  isActive: refreshToken.isActive,
});

const createSendTokens = async (user, userAgent, ipAddress) => {
  const token = signToken(user);
  const refreshRecord = await createRefreshToken(user.id, userAgent, ipAddress);
  return { token, refreshToken: refreshRecord.token, user: getSafeUser(user) };
};

const getUserByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } });
};

const getUserById = async (id) => {
  return prisma.user.findUnique({ where: { id: Number(id) } });
};

const signup = async (payload, userAgent, ipAddress, lang = 'en') => {
  const { fullName, email, password, passwordConfirm } = payload;
  if (!fullName || !email || !password || !passwordConfirm) {
    throw createError(t('MISSING_FIELDS', lang), 400, 'MISSING_FIELDS');
  }
  if (password !== passwordConfirm) {
    throw createError(t('PASSWORD_CONFIRM_MISMATCH', lang), 400, 'PASSWORD_CONFIRM_MISMATCH');
  }
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw createError(t('EMAIL_ALREADY_REGISTERED', lang), 409, 'EMAIL_ALREADY_REGISTERED');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: 'owner',
      preferredLanguage: lang,
    },
  });

  return createSendTokens(user, userAgent, ipAddress);
};

const login = async (payload, userAgent, ipAddress, lang = 'en') => {
  const { email, password } = payload;
  if (!email || !password) {
    throw createError(t('MISSING_FIELDS', lang), 400, 'MISSING_FIELDS');
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw createError(t('INVALID_CREDENTIALS', lang), 401, 'INVALID_CREDENTIALS');
  }
  return createSendTokens(user, userAgent, ipAddress);
};

const logout = async (userId, refreshToken, lang = 'en') => {
  if (!refreshToken) {
    return { success: true };
  }
  await prisma.refreshToken.updateMany({
    where: {
      token: refreshToken,
      userId: Number(userId),
      isActive: true,
    },
    data: { isActive: false },
  });
  return { success: true };
};

const refreshAccessToken = async (refreshToken, authorization, userAgent, ipAddress, lang = 'en') => {
  if (!refreshToken) {
    throw createError(t('REFRESH_TOKEN_REQUIRED', lang), 401, 'REFRESH_TOKEN_REQUIRED');
  }

  const existingToken = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
  });

  if (!existingToken) {
    throw createError(t('INVALID_REFRESH_TOKEN', lang), 401, 'INVALID_REFRESH_TOKEN');
  }

  const user = await getUserById(existingToken.userId);
  if (!user) {
    throw createError(t('USER_NOT_FOUND', lang), 401, 'USER_NOT_FOUND');
  }

  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, isActive: true },
    data: { isActive: false },
  });

  return createSendTokens(user, userAgent, ipAddress);
};

const logoutAllDevices = async (userId, lang = 'en') => {
  await prisma.refreshToken.updateMany({
    where: {
      userId: Number(userId),
      isActive: true,
    },
    data: { isActive: false },
  });
  return { success: true };
};

const getActiveSessions = async (userId) => {
  const sessions = await prisma.refreshToken.findMany({
    where: { userId: Number(userId), isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  return sessions.map(buildSessionPayload);
};

const revokeSession = async (userId, sessionId, lang = 'en') => {
  const session = await prisma.refreshToken.findUnique({ where: { id: Number(sessionId) } });
  if (!session || session.userId !== Number(userId)) {
    throw createError(t('SESSION_NOT_FOUND', lang), 404, 'SESSION_NOT_FOUND');
  }
  if (!session.isActive) {
    throw createError(t('SESSION_ALREADY_REVOKED', lang), 400, 'SESSION_ALREADY_REVOKED');
  }
  await prisma.refreshToken.update({ where: { id: Number(sessionId) }, data: { isActive: false } });
  return { success: true };
};

const forgotPassword = async (email, lang = 'en') => {
  if (!email) {
    throw createError(t('MISSING_FIELDS', lang), 400, 'MISSING_FIELDS');
  }
  const user = await getUserByEmail(email);
  if (!user) {
    throw createError(t('USER_NOT_FOUND', lang), 404, 'USER_NOT_FOUND');
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetCode: resetCode,
      passwordResetExpiry: expiresAt,
      passwordResetToken: null,
    },
  });

  const message = `Your password reset code is: ${resetCode}\nThis code will expire in 10 minutes.\nIf you didn't request a password reset, please ignore this message.`;

  try {
    await sendEmail({ email: user.email, subject: 'Password reset code', message });
  } catch (err) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetCode: null, passwordResetExpiry: null },
    });
    throw createError(t('PASSWORD_RESET_EMAIL_ERROR', lang), 500, 'PASSWORD_RESET_EMAIL_ERROR');
  }

  return { success: true };
};

const checkResetCode = async (email, resetCode, lang = 'en') => {
  if (!email || !resetCode) {
    throw createError(t('MISSING_FIELDS', lang), 400, 'MISSING_FIELDS');
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
      passwordResetCode: resetCode,
      passwordResetExpiry: { gt: new Date() },
    },
  });
  if (!user) {
    throw createError(t('INVALID_OR_EXPIRED_CODE', lang), 400, 'INVALID_OR_EXPIRED_CODE');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpiry: expiresAt,
      passwordResetCode: null,
    },
  });

  return { resetToken, email: user.email, fullName: user.fullName };
};

const resetPassword = async (resetToken, password, passwordConfirm, userAgent, ipAddress, lang = 'en') => {
  if (!resetToken || !password || !passwordConfirm) {
    throw createError(t('MISSING_FIELDS', lang), 400, 'MISSING_FIELDS');
  }
  if (password !== passwordConfirm) {
    throw createError(t('PASSWORD_CONFIRM_MISMATCH', lang), 400, 'PASSWORD_CONFIRM_MISMATCH');
  }

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw createError(t('TOKEN_INVALID_OR_EXPIRED', lang), 400, 'TOKEN_INVALID_OR_EXPIRED');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetCode: null,
      passwordResetExpiry: null,
    },
  });

  return createSendTokens(user, userAgent, ipAddress);
};

const updatePassword = async (userId, currentPassword, password, passwordConfirm, userAgent, ipAddress, lang = 'en') => {
  if (!currentPassword || !password || !passwordConfirm) {
    throw createError(t('MISSING_FIELDS', lang), 400, 'MISSING_FIELDS');
  }
  if (password !== passwordConfirm) {
    throw createError(t('PASSWORD_CONFIRM_MISMATCH', lang), 400, 'PASSWORD_CONFIRM_MISMATCH');
  }

  const user = await getUserById(userId);
  if (!user) {
    throw createError(t('USER_NOT_FOUND', lang), 404, 'USER_NOT_FOUND');
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw createError(t('CURRENT_PASSWORD_WRONG', lang), 401, 'CURRENT_PASSWORD_WRONG');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return createSendTokens(user, userAgent, ipAddress);
};

module.exports = {
  signup,
  login,
  logout,
  refreshAccessToken,
  logoutAllDevices,
  getActiveSessions,
  revokeSession,
  forgotPassword,
  checkResetCode,
  resetPassword,
  updatePassword,
};
