// src/common/i18n.js
// ظƒظ„ ط±ط³ط§ط¦ظ„ ط§ظ„ط®ط·ط£ ط¨ط§ظ„ط¹ط±ط¨ظٹ ظˆط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹ ظپظٹ ظ…ظƒط§ظ† ظˆط§طط¯

const messages = {
  // Auth
  EMAIL_EXISTS:              { ar: 'هذا الإيميل مسجل مسبقا',                   en: 'Email already registered' },
  INVALID_CREDENTIALS:       { ar: 'إيميل أو كلمة مرور خاطئة',                  en: 'Invalid email or password' },
  EMAIL_ALREADY_REGISTERED:  { ar: 'هذا الإيميل مسجل مسبقا',                   en: 'Email already registered' },
  PASSWORD_CONFIRM_MISMATCH: { ar: 'كلمة المرور وتأكيدها غير متطابقين',        en: 'Password and confirmation do not match' },
  USER_NOT_FOUND:            { ar: 'المستخدم غير موجود',                      en: 'User not found' },
  PASSWORD_RESET_CODE_SENT:  { ar: 'تم إرسال رمز إعادة التعيين',               en: 'Password reset code sent' },
  PASSWORD_RESET_EMAIL_ERROR: { ar: 'حدث خطأ أثناء إرسال البريد الإلكتروني',   en: 'Error sending password reset email' },
  INVALID_OR_EXPIRED_CODE:   { ar: 'رمز إعادة التعيين غير صحيح أو منتهي الصلاحية', en: 'Invalid or expired reset code' },
  CODE_VERIFIED:             { ar: 'تم التحقق من الرمز بنجاح',                 en: 'Code verified successfully' },
  TOKEN_INVALID_OR_EXPIRED:  { ar: 'الرمز غير صالح أو منتهي الصلاحية',        en: 'Token invalid or expired' },
  PASSWORD_RESET_SUCCESS:    { ar: 'تم إعادة تعيين كلمة المرور بنجاح',        en: 'Password reset successful' },
  PASSWORD_UPDATE_SUCCESS:   { ar: 'تم تحديث كلمة المرور بنجاح',             en: 'Password updated successfully' },
  CURRENT_PASSWORD_WRONG:    { ar: 'كلمة المرور الحالية غير صحيحة',           en: 'Current password is incorrect' },
  REFRESH_TOKEN_REQUIRED:    { ar: 'رمز التحديث مطلوب',                       en: 'Refresh token required' },
  INVALID_REFRESH_TOKEN:     { ar: 'رمز التحديث غير صالح',                    en: 'Invalid refresh token' },
  LOGOUT_SUCCESS:            { ar: 'تم تسجيل الخروج بنجاح',                   en: 'Logout successful' },
  LOGOUT_ALL_DEVICES_SUCCESS:{ ar: 'تم تسجيل الخروج من جميع الأجهزة',         en: 'Logged out from all devices' },
  SESSION_REVOKED:           { ar: 'تم إلغاء الجلسة بنجاح',                   en: 'Session revoked successfully' },
  TOKEN_REFRESHED:           { ar: 'تم تحديث رمز الدخول بنجاح',               en: 'Access token refreshed successfully' },
  SIGNUP_SUCCESS:            { ar: 'تم إنشاء الحساب بنجاح',                   en: 'Signup successful' },
  LOGIN_SUCCESS:             { ar: 'تم تسجيل الدخول بنجاح',                   en: 'Login successful' },
  EMAIL_NOT_VERIFIED:        { ar: 'يرجى تأكيد بريدك الإلكتروني أولا',       en: 'Please verify your email first' },
  INVALID_TOKEN:             { ar: 'الرمز غير صحيح أو انتهت صلاحيته',          en: 'Invalid or expired token' },
  TOKEN_EXPIRED:             { ar: 'انتهت الجلسة سجل دخولك مجددا',           en: 'Session expired, please login again' },
  UNAUTHORIZED:              { ar: 'يجب تسجيل الدخول أولا',                   en: 'Authentication required' },
  FORBIDDEN:                 { ar: 'ليس لديك صلاحية',                         en: 'Access denied' },

  // Startup
  STARTUP_EXISTS:            { ar: 'لديك شركة ناشئة بالفعل',                  en: 'You already have a startup' },
  STARTUP_NOT_FOUND:         { ar: 'الشركة الناشئة غير موجودة',               en: 'Startup not found' },

  // General
  NOT_FOUND:                 { ar: 'المورد غير موجود',                        en: 'Resource not found' },
  SERVER_ERROR:              { ar: 'خطأ في السيرفر',                         en: 'Internal server error' },
  MISSING_FIELDS:            { ar: 'جميع الحقول مطلوبة',                     en: 'All fields are required' },
};

const t = (code, lang = 'en') => {
  const msg = messages[code];
  if (!msg) return code;
  return lang === 'ar' ? msg.ar : msg.en;
};

module.exports = { t };
