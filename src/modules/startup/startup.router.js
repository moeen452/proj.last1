// src/modules/startup/startup.router.js
const express    = require('express');
const router     = express.Router();
const controller = require('./startup.controller');
const { authenticate, authorize } = require('../../common/auth.middleware');
const asyncHandler = require('../../common/asyncHandler');

// ════════════════════════════════════════
// المسارات
// ════════════════════════════════════════

// إنشاء startup
router.post('/',
  authenticate,
  asyncHandler(controller.create)
);

// جلب startup الخاص بي
// مهم: /my قبل /:slug حتى لا يُفسَّر "my" كـ slug
router.get('/my',
  authenticate,
  asyncHandler(controller.getMyStartup)
);

// قائمة الشركات للجمهور
router.get('/',
  asyncHandler(controller.getAll)
);

// جلب startup بالـ slug — للجمهور
router.get('/:slug',
  asyncHandler(controller.getBySlug)
);

// تعديل startup — صاحبه فقط
router.patch('/:id',
  authenticate,
  asyncHandler(controller.updateStartup)
);

// موافقة الأدمن
router.patch('/:id/approve',
  authenticate,
  authorize('admin'),
  asyncHandler(controller.approveStartup)
);

// تعليق الأدمن
router.patch('/:id/suspend',
  authenticate,
  authorize('admin'),
  asyncHandler(controller.suspendStartup)
);

module.exports = router;