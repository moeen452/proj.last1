const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'يجب تسجيل الدخول أولاً' }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'انتهت الجلسة، سجل دخولك مجدداً', code: 'TOKEN_EXPIRED' }
      });
    }
    return res.status(401).json({
      success: false,
      error: { message: 'توكن غير صحيح' }
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'ليس لديك صلاحية' }
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };