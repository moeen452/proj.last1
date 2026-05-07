const jwt        = require('jsonwebtoken');
const { t }      = require('./i18n');

const getLang = (req) => {
  const lang = req.headers['accept-language'];
  return lang && lang.startsWith('ar') ? 'ar' : 'en';
};

const authenticate = (req, res, next) => {
  const lang       = getLang(req);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: t('UNAUTHORIZED', lang), code: 'UNAUTHORIZED' }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = decoded;
    next();
  } catch (err) {
    const code    = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED';
    return res.status(401).json({
      success: false,
      error: { message: t(code, lang), code }
    });
  }
};

const authorize = (...roles) => (req, res, next) => {
  const lang = getLang(req);
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: { message: t('FORBIDDEN', lang), code: 'FORBIDDEN' }
    });
  }
  next();
};

module.exports = { authenticate, authorize };
