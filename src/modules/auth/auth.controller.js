// src/modules/auth/auth.controller.js
const service = require('./auth.service');

// ── مساعد يقرأ اللغة من الـ Header ──────────────
const getLang = (req) => {
  const lang = req.headers['accept-language'];
  return lang && lang.startsWith('ar') ? 'ar' : 'en';
};

// ════════════════════════════════════════
// REGISTER
// ════════════════════════════════════════
const register = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { fullName, email, password } = req.body;
    const user = await service.register({ fullName, email, password }, lang);
    res.status(201).json({
      success: true,
      data: {
        user,
        message: lang === 'ar'
          ? 'تم التسجيل. تحقق من بريدك.'
          : 'Registered. Please verify your email.'
      }
    });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// VERIFY EMAIL (عبر رابط)
// ════════════════════════════════════════
const verifyEmail = async (req, res, next) => {
  try {
    const lang   = getLang(req);
    const result = await service.verifyEmail(req.query.token, lang);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// DEV VERIFY (يدوي للتطوير فقط)
// ════════════════════════════════════════
const devVerify = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { email } = req.body;
    await service.devVerify(email, lang);
    res.json({
      success: true,
      data: {
        message: lang === 'ar'
          ? 'تم تأكيد الإيميل بنجاح ✅'
          : 'Email verified successfully ✅'
      }
    });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════
const login = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await service.login({ email, password }, lang);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, data: { accessToken, user } });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// REFRESH
// ════════════════════════════════════════
const refresh = async (req, res, next) => {
  try {
    const lang   = getLang(req);
    const result = await service.refresh(req.cookies.refreshToken, lang);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════
const logout = async (req, res, next) => {
  try {
    const lang = getLang(req);
    res.clearCookie('refreshToken');
    res.json({
      success: true,
      data: { message: lang === 'ar' ? 'تم الخروج بنجاح' : 'Logged out successfully' }
    });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// GET ME
// ════════════════════════════════════════
const getMe = async (req, res, next) => {
  try {
    const user = await service.getMe(req.user.id);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

module.exports = { register, verifyEmail, devVerify, login, refresh, logout, getMe };