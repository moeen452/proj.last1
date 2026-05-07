const service = require('./audience.service');

const getLang = (req) => {
  const lang = req.headers['accept-language'];
  return lang && lang.startsWith('ar') ? 'ar' : 'en';
};

const getApprovedStartups = async (req, res, next) => {
  try {
    const { page, limit, search, category } = req.query;
    const result = await service.findApprovedStartups({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search || '',
      category: category || ''
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getStartupDetails = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const startup = await service.findStartupBySlug(req.params.slug, lang);
    res.json({ success: true, data: { startup } });
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

    const inquiry = await service.createInquiry(Number(startupId), { name, email, message }, lang);
    res.status(201).json({ success: true, data: { inquiry } });
  } catch (err) { next(err); }
};

const followStartup = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { startupId } = req.params;
    const result = await service.toggleFollowStartup(req.user.id, Number(startupId), lang);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await service.getUserNotifications(req.user.id);
    res.json({ success: true, data: { notifications } });
  } catch (err) { next(err); }
};

const getSuccessStories = async (req, res, next) => {
  try {
    const result = await service.findSuccessStories();
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

module.exports = { getApprovedStartups, getStartupDetails, sendInquiry, followStartup, getMyNotifications, getSuccessStories };
