const express = require('express');
const router = express.Router();
const controller = require('./website.controller');
const { authenticate } = require('../../common/auth.middleware');
const asyncHandler = require('../../common/asyncHandler');

// ════════════════════════════════════════
// Website Public API
// ════════════════════════════════════════

// List all published websites for the public audience
router.get('/', asyncHandler(controller.getPublishedWebsites));

// Public website viewer by startup slug
router.get('/:slug', asyncHandler(controller.getWebsiteBySlug));

// Update website sections (owner / admin)
router.patch('/:id/sections', authenticate, asyncHandler(controller.updateSections));

// Publish website (owner / admin)
router.patch('/:id/publish', authenticate, asyncHandler(controller.publishWebsite));

module.exports = router;
