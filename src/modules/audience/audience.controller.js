const service = require('./audience.service');

const getLang = (req) => {
  const lang = req.headers['accept-language'];
  return lang && lang.startsWith('ar') ? 'ar' : 'en';
};

const getApprovedStartups = async (req, res, next) => {
  try {
    const { page, limit, search, category, sort, stage, location, minRating, minInvestment, maxInvestment } = req.query;
    const result = await service.findApprovedStartups({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search || '',
      category: category || '',
      sort: sort || '',
      stage: stage || '',
      location: location || '',
      minRating: minRating ? Number(minRating) : undefined,
      minInvestment: minInvestment ? Number(minInvestment) : undefined,
      maxInvestment: maxInvestment ? Number(maxInvestment) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getFeaturedStartups = async (req, res, next) => {
  try {
    const startups = await service.getFeaturedStartups();
    res.json({ success: true, data: startups });
  } catch (err) { next(err); }
};

const getLatestStartups = async (req, res, next) => {
  try {
    const startups = await service.getLatestStartups();
    res.json({ success: true, data: startups });
  } catch (err) { next(err); }
};

const getStartupDetails = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const result = await service.getStartupDetails(req.params.slug, userId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getStartupDetailsById = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const result = await service.getStartupDetailsById(Number(req.params.startupId), userId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await service.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

const getStartupContacts = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const contacts = await service.getStartupContacts(Number(startupId));
    res.json({ success: true, data: contacts });
  } catch (err) { next(err); }
};

const searchStartups = async (req, res, next) => {
  try {
    const { page, limit, search, category, sort } = req.query;
    const result = await service.findApprovedStartups({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search || '',
      category: category || '',
      sort: sort || ''
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const sendSupportMessage = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: { message: lang === 'ar' ? 'الاسم والإيميل والموضوع والرسالة مطلوبة' : 'Name, email, subject and message are required' }
      });
    }
    const supportMessage = await service.sendSupportMessage({ name, email, subject, message });
    res.status(201).json({ success: true, data: { supportMessage } });
  } catch (err) { next(err); }
};

const sendInquiry = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { name, email, message } = req.body;
    const { startupId } = req.params;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: { message: lang === 'ar' ? 'الاسم والإيميل والرسالة مطلوبة' : 'Name, email and message are required' }
      });
    }
    const inquiry = await service.sendInquiry(Number(startupId), { name, email, message });
    res.status(201).json({ success: true, data: { inquiry } });
  } catch (err) { next(err); }
};

const followStartup = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const result = await service.followStartup(req.user.id, Number(startupId));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getMyFollowing = async (req, res, next) => {
  try {
    const startups = await service.getMyFollowing(req.user.id);
    res.json({ success: true, data: startups });
  } catch (err) { next(err); }
};

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await service.getUserNotifications(req.user.id);
    res.json({ success: true, data: { notifications } });
  } catch (err) { next(err); }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await service.markAllNotificationsAsRead(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const result = await service.markNotificationRead(req.user.id, Number(notificationId));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const result = await service.deleteNotification(req.user.id, Number(notificationId));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ========== Favorites (كانت مفقودة في الكونترولر) ==========
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await service.getFavorites(req.user.id);
    res.json({ success: true, data: favorites });
  } catch (err) { next(err); }
};

const addFavorite = async (req, res, next) => {
  try {
    const { startupId } = req.body;
    if (!startupId) {
      return res.status(400).json({ success: false, error: { message: 'startupId is required' } });
    }
    const favorite = await service.addFavorite(req.user.id, startupId);
    res.status(201).json({ success: true, data: favorite });
  } catch (err) { next(err); }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const result = await service.removeFavorite(req.user.id, Number(startupId));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ========== دوال الاستثمار والنمو والحجوزات القادمة ==========
const getAvailableEquity = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const equity = await service.getAvailableEquity(Number(startupId));
    res.json({ success: true, data: equity });
  } catch (err) { next(err); }
};

const getStockPriceGrowth = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const growth = await service.getStockPriceGrowth(Number(startupId));
    res.json({ success: true, data: growth });
  } catch (err) { next(err); }
};

const getUserUpcomingBookings = async (req, res, next) => {
  try {
    const bookings = await service.getUserUpcomingBookings(req.user.id);
    res.json({ success: true, data: bookings });
  } catch (err) { next(err); }
};

// ========== الدوال التفاعلية الموجودة سابقاً ==========
const investInStartup = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const { amount, shares, note, roundType, roundDate } = req.body;
    const investment = await service.investInStartup(req.user.id, Number(startupId), {
      amount,
      shares,
      note,
      roundType,
      roundDate
    });
    res.status(201).json({ success: true, data: investment });
  } catch (err) { next(err); }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const { consultantId, from, to } = req.query;
    const slots = await service.getAvailableSlots(Number(consultantId) || req.user.id, {
      from,
      to
    });
    res.json({ success: true, data: slots });
  } catch (err) { next(err); }
};

const bookConsultation = async (req, res, next) => {
  try {
    const { slotId } = req.body;
    if (!slotId) {
      return res.status(400).json({ success: false, error: { message: 'slotId is required' } });
    }
    const booking = await service.bookConsultation(req.user.id, Number(slotId));
    res.status(201).json({ success: true, data: booking });
  } catch (err) { next(err); }
};

const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const registration = await service.registerForEvent(req.user.id, Number(eventId));
    res.status(201).json({ success: true, data: registration });
  } catch (err) { next(err); }
};

const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { resumeUrl, coverLetter } = req.body;
    const application = await service.applyForJob(req.user.id, Number(jobId), { resumeUrl, coverLetter });
    res.status(201).json({ success: true, data: application });
  } catch (err) { next(err); }
};

const registerForTraining = async (req, res, next) => {
  try {
    const { trainingId } = req.params;
    const registration = await service.registerForTraining(req.user.id, Number(trainingId));
    res.status(201).json({ success: true, data: registration });
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await service.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const profile = await service.updateProfile(req.user.id, updates);
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
};

const getHubEvents = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await service.getHubContent('event', Number(page) || 1, Number(limit) || 10);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getHubTrainings = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await service.getHubContent('training', Number(page) || 1, Number(limit) || 10);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getHubJobs = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await service.getHubContent('job', Number(page) || 1, Number(limit) || 10);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getNewsFeed = async (req, res, next) => {
  try {
    const { startupId, page, limit } = req.query;
    const result = await service.getNewsFeed(startupId, Number(page) || 1, Number(limit) || 10);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getNewsDetails = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const news = await service.getNewsDetails(req.params.newsId, userId);
    res.json({ success: true, data: { news } });
  } catch (err) { next(err); }
};

const getSuccessStories = async (req, res, next) => {
  try {
    const result = await service.getSuccessStories();
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};
const getStartupFundingRounds = async (req, res, next) => {
  try {
    const { startupId } = req.params;
    const rounds = await service.getStartupFundingRounds(Number(startupId));
    res.json({ success: true, data: rounds });
  } catch (err) { next(err); }
};

module.exports = {
  getApprovedStartups,
  getFeaturedStartups,
  getLatestStartups,
  getStartupDetails,
  getStartupDetailsById,
  getStartupContacts,
  getCategories,
  searchStartups,
  sendSupportMessage,
  sendInquiry,
  followStartup,
  getMyFollowing,
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
  getFavorites,
  addFavorite,
  removeFavorite,
  getAvailableEquity,
  getStockPriceGrowth,
  getUserUpcomingBookings,
  investInStartup,
  getAvailableSlots,
  bookConsultation,
  registerForEvent,
  applyForJob,
  registerForTraining,
  getProfile,
  updateProfile,
  getHubEvents,
  getHubTrainings,
  getHubJobs,
  getNewsFeed,
  getNewsDetails,
  getSuccessStories,
  getStartupFundingRounds
};