const service = require('./auth.service');
const { t } = require('../../common/i18n');

const getLang = (req) => {
  const lang = req.headers['accept-language'];
  return lang && lang.startsWith('ar') ? 'ar' : 'en';
};

const signup = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await service.signup(req.body, req.headers['user-agent'], req.ip, lang);
    res.status(201).json({ success: true, message: t('SIGNUP_SUCCESS', lang), data: result });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await service.login(req.body, req.headers['user-agent'], req.ip, lang);
    res.json({ success: true, message: t('LOGIN_SUCCESS', lang), data: result });
  } catch (err) {
    next(err);
  }
};

const getRefreshTokenFromRequest = (req) => {
  return req.body?.refreshToken || req.cookies?.refreshToken || req.headers['x-refresh-token'] || req.headers['refresh-token'];
};

const logout = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const refreshToken = getRefreshTokenFromRequest(req);
    await service.logout(req.user?.id, refreshToken, lang);
    res.json({ success: true, message: t('LOGOUT_SUCCESS', lang) });
  } catch (err) {
    next(err);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const refreshToken = getRefreshTokenFromRequest(req);
    const result = await service.refreshAccessToken(refreshToken, req.headers.authorization, req.headers['user-agent'], req.ip, lang);
    res.json({ success: true, message: t('TOKEN_REFRESHED', lang), data: result });
  } catch (err) {
    next(err);
  }
};

const logoutAllDevices = async (req, res, next) => {
  try {
    const lang = getLang(req);
    await service.logoutAllDevices(req.user.id, lang);
    res.json({ success: true, message: t('LOGOUT_ALL_DEVICES_SUCCESS', lang) });
  } catch (err) {
    next(err);
  }
};

const getActiveSessions = async (req, res, next) => {
  try {
    const sessions = await service.getActiveSessions(req.user.id);
    res.json({ success: true, data: { sessions } });
  } catch (err) {
    next(err);
  }
};

const revokeSession = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const sessionId = req.params.sessionId;
    await service.revokeSession(req.user.id, sessionId, lang);
    res.json({ success: true, message: t('SESSION_REVOKED', lang) });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const lang = getLang(req);
    await service.forgotPassword(req.body.email, lang);
    res.json({ success: true, message: t('PASSWORD_RESET_CODE_SENT', lang) });
  } catch (err) {
    next(err);
  }
};

const checkResetCode = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await service.checkResetCode(req.body.email, req.body.resetCode, lang);
    res.json({ success: true, message: t('CODE_VERIFIED', lang), data: result });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await service.resetPassword(req.body.resetToken, req.body.password, req.body.passwordConfirm, req.headers['user-agent'], req.ip, lang);
    res.json({ success: true, message: t('PASSWORD_RESET_SUCCESS', lang), data: result });
  } catch (err) {
    next(err);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const result = await service.updatePassword(req.user.id, req.body.passwordCurrent, req.body.password, req.body.passwordConfirm, req.headers['user-agent'], req.ip, lang);
    res.json({ success: true, message: t('PASSWORD_UPDATE_SUCCESS', lang), data: result });
  } catch (err) {
    next(err);
  }
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
