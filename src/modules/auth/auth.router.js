const express    = require('express');
const router     = express.Router();
const controller = require('./auth.controller');
const { authenticate } = require('../../common/auth.middleware');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../../common/asyncHandler');

// ─── أداة التحقق من البيانات ──────────────────────
function validateRequest(validations) {
    return [
        ...validations,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false,
                    errors: errors.array() 
                });
            }
            next();
        },
    ];
}

// ─── المسارات ─────────────────────────────────────

// التسجيل
router.post('/register', 
    validateRequest([
        body('fullName').notEmpty().withMessage('الاسم مطلوب'),
        body('email').isEmail().withMessage('إيميل غير صحيح'),
        body('password').isLength({ min: 6 }).withMessage('كلمة المرور 6 أحرف على الأقل'),
    ]),
    asyncHandler(controller.register)
);

// تأكيد الإيميل
router.get('/verify-email', asyncHandler(controller.verifyEmail));

// تسجيل الدخول
router.post('/login', 
    validateRequest([
        body('email').isEmail().withMessage('إيميل غير صحيح'),
        body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
    ]),
    asyncHandler(controller.login)
);

// تجديد التوكن — من الـ Cookie مباشرة بدون validation
router.post('/refresh', asyncHandler(controller.refresh));

// الخروج — يحتاج تسجيل دخول
router.post('/logout', authenticate, asyncHandler(controller.logout));

// بيانات المستخدم — يحتاج تسجيل دخول
router.get('/me', authenticate, asyncHandler(controller.getMe));

module.exports = router;
