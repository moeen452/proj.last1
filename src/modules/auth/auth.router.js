const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');
const asyncHandler = require('../../common/asyncHandler');
const { authenticate, optionalAuthenticate } = require('../../common/auth.middleware');

router.post('/signup', asyncHandler(controller.signup));
router.post('/login', asyncHandler(controller.login));
router.post('/logout', optionalAuthenticate, asyncHandler(controller.logout));
router.post('/refreshToken', asyncHandler(controller.refreshAccessToken));
router.post('/logout-all', authenticate, asyncHandler(controller.logoutAllDevices));
router.get('/sessions', authenticate, asyncHandler(controller.getActiveSessions));
router.delete('/sessions/:sessionId', authenticate, asyncHandler(controller.revokeSession));
router.post('/forgotPassword', asyncHandler(controller.forgotPassword));
router.post('/checkResetCode', asyncHandler(controller.checkResetCode));
router.patch('/resetPassword', asyncHandler(controller.resetPassword));
router.patch('/updateMyPassword', authenticate, asyncHandler(controller.updatePassword));

module.exports = router;
