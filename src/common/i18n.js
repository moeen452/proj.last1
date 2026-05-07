// src/common/i18n.js
// كل رسائل الخطأ بالعربي والإنجليزي في مكان واحد

const messages = {
  // Auth
  EMAIL_EXISTS:        { ar: 'هذا الإيميل مسجل مسبقاً',              en: 'Email already registered' },
  INVALID_CREDENTIALS: { ar: 'إيميل أو كلمة مرور خاطئة',             en: 'Invalid email or password' },
  EMAIL_NOT_VERIFIED:  { ar: 'يرجى تأكيد بريدك الإلكتروني أولاً',    en: 'Please verify your email first' },
  INVALID_TOKEN:       { ar: 'الرمز غير صحيح أو انتهت صلاحيته',      en: 'Invalid or expired token' },
  TOKEN_EXPIRED:       { ar: 'انتهت الجلسة، سجل دخولك مجدداً',       en: 'Session expired, please login again' },
  UNAUTHORIZED:        { ar: 'يجب تسجيل الدخول أولاً',               en: 'Authentication required' },
  FORBIDDEN:           { ar: 'ليس لديك صلاحية',                      en: 'Access denied' },

  // Startup
  STARTUP_EXISTS:      { ar: 'لديك شركة ناشئة بالفعل',               en: 'You already have a startup' },
  STARTUP_NOT_FOUND:   { ar: 'الشركة الناشئة غير موجودة',             en: 'Startup not found' },

  // Website
  WEBSITE_NOT_FOUND:            { ar: 'الموقع غير موجود',                       en: 'Website not found' },
  WEBSITE_NOT_PUBLISHED:        { ar: 'الموقع غير منشور',                       en: 'Website is not published' },
  WEBSITE_UPDATE_FORBIDDEN:     { ar: 'لا تملك صلاحية تعديل هذا الموقع',        en: 'You are not allowed to edit this website' },
  WEBSITE_PUBLISH_FORBIDDEN:    { ar: 'لا تملك صلاحية نشر هذا الموقع',         en: 'You are not allowed to publish this website' },
  WEBSITE_SECTION_INVALID:      { ar: 'بيانات أقسام الموقع غير صحيحة',           en: 'Website sections data is invalid' },

  // General
  NOT_FOUND:           { ar: 'العنصر غير موجود',                     en: 'Resource not found' },
  SERVER_ERROR:        { ar: 'خطأ في السيرفر',                       en: 'Internal server error' },
  MISSING_FIELDS:      { ar: 'جميع الحقول مطلوبة',                   en: 'All fields are required' },
};

// الدالة الرئيسية — تُستخدم في كل service
// lang تأتي من req.headers['accept-language']
const t = (code, lang = 'en') => {
  const msg = messages[code];
  if (!msg) return code;
  return lang === 'ar' ? msg.ar : msg.en;
};

module.exports = { t };
