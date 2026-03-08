// src/modules/startup/startup.router.js
const express    = require('express');
const router     = express.Router();
const controller = require('./startup.controller');
const { authenticate, authorize } = require('../../common/auth.middleware');
const asyncHandler = require('../../common/asyncHandler');
// ════════════════════════════════════════
// المسارات
// ════════════════════════════════════════

// إنشاء startup — يحتاج تسجيل دخول
router.post('/', authenticate, asyncHandler(controller.create));

// جلب startup الخاص بي — يحتاج تسجيل دخول
// مهم: /my قبل /:id حتى لا يُفسَّر "my" كـ ID
router.get('/my', authenticate, asyncHandler(controller.getMyStartup));

// قائمة الشركات للجمهور — لا يحتاج تسجيل
router.get('/', asyncHandler(controller.getAll));

// موافقة الأدمن — يحتاج تسجيل دخول + دور admin
router.patch('/:id/approve', authenticate, authorize('admin'), asyncHandler(controller.approveStartup));

module.exports = router;
