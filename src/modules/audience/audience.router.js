const express = require('express');
const router = express.Router();
const controller = require('./audience.controller');
const asyncHandler = require('../../common/asyncHandler');
const { authenticate } = require('../../common/auth.middleware');

// ════════════════════════════════════════
// Audience / Explore Public API
// ════════════════════════════════════════
router.get('/startups', asyncHandler(controller.getApprovedStartups));
router.get('/startups/:slug', asyncHandler(controller.getStartupDetails));
router.post('/startups/:startupId/inquiries', asyncHandler(controller.sendInquiry));
router.get('/success-stories', asyncHandler(controller.getSuccessStories));

// Protected audience actions
router.use(authenticate);
router.post('/startups/:startupId/follow', asyncHandler(controller.followStartup));
router.get('/notifications', asyncHandler(controller.getMyNotifications));

module.exports = router;
