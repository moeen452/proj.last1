const express = require('express');
const router = express.Router();
const controller = require('./audience.controller');
const asyncHandler = require('../../common/asyncHandler');
const { authenticate, optionalAuthenticate } = require('../../common/auth.middleware');

// ════════════════════════════════════════
// Public APIs (بدون مصادقة)
// ════════════════════════════════════════
router.get('/startups', asyncHandler(controller.getApprovedStartups));
router.get('/startups/featured', asyncHandler(controller.getFeaturedStartups));
router.get('/startups/latest', asyncHandler(controller.getLatestStartups));
router.get('/startups/:slug', optionalAuthenticate, asyncHandler(controller.getStartupDetails));
router.get('/startups/id/:startupId', optionalAuthenticate, asyncHandler(controller.getStartupDetailsById));
router.get('/startups/:startupId/contacts', asyncHandler(controller.getStartupContacts));
router.post('/startups/:startupId/inquiries', asyncHandler(controller.sendInquiry));
router.get('/success-stories', asyncHandler(controller.getSuccessStories));
router.get('/categories', asyncHandler(controller.getCategories));
router.get('/startups/search', asyncHandler(controller.searchStartups));

router.get('/news', asyncHandler(controller.getNewsFeed));
router.get('/news/:newsId', optionalAuthenticate, asyncHandler(controller.getNewsDetails));
router.post('/contact', asyncHandler(controller.sendSupportMessage));

// ════════════════════════════════════════
// Protected APIs (تتطلب مصادقة)
// ════════════════════════════════════════
router.use(authenticate);

// Startups interactions
router.post('/startups/:startupId/follow', asyncHandler(controller.followStartup));
router.post('/startups/:startupId/invest', asyncHandler(controller.investInStartup));
router.get('/startups/:startupId/equity', asyncHandler(controller.getAvailableEquity));
router.get('/startups/:startupId/stock-growth', asyncHandler(controller.getStockPriceGrowth));

// Consultations
router.get('/consultations/slots', asyncHandler(controller.getAvailableSlots));
router.post('/consultations/book', asyncHandler(controller.bookConsultation));
router.get('/consultations/upcoming', asyncHandler(controller.getUserUpcomingBookings));

// Favorites
router.get('/favorites', asyncHandler(controller.getFavorites));
router.post('/favorites', asyncHandler(controller.addFavorite));
router.delete('/favorites/:startupId', asyncHandler(controller.removeFavorite));

// Following & Notifications
router.get('/following', asyncHandler(controller.getMyFollowing));
router.get('/notifications', asyncHandler(controller.getMyNotifications));
router.put('/notifications/mark-read', asyncHandler(controller.markAllNotificationsRead));
router.post('/notifications/:notificationId/mark-read', asyncHandler(controller.markNotificationRead));
router.delete('/notifications/:notificationId', asyncHandler(controller.deleteNotification));

// News Interactions
router.post('/news/:newsId/like', asyncHandler(controller.likeNews));
router.post('/news/:newsId/comment', asyncHandler(controller.commentOnNews));
router.post('/news/:newsId/share', asyncHandler(controller.shareNews));

// Hub
router.post('/hub/events/:eventId/register', asyncHandler(controller.registerForEvent));
router.post('/hub/jobs/:jobId/apply', asyncHandler(controller.applyForJob));
router.post('/hub/trainings/:trainingId/register', asyncHandler(controller.registerForTraining));
router.get('/hub/events', asyncHandler(controller.getHubEvents));
router.get('/hub/trainings', asyncHandler(controller.getHubTrainings));
router.get('/hub/jobs', asyncHandler(controller.getHubJobs));
router.get('/startups/:startupId/funding-rounds', asyncHandler(controller.getStartupFundingRounds));

// Profile
router.get('/profile', asyncHandler(controller.getProfile));
router.patch('/profile', asyncHandler(controller.updateProfile));

module.exports = router;