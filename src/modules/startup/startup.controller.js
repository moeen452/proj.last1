// src/modules/startup/startup.controller.js
const service = require('./startup.service');

const getLang = (req) => {
  const lang = req.headers['accept-language'];
  return lang && lang.startsWith('ar') ? 'ar' : 'en';
};

// ════════════════════════════════════════
// POST /api/v1/startups
// ════════════════════════════════════════
const create = async (req, res, next) => {
  try {
    const lang    = getLang(req);
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: lang === 'ar' ? 'اسم الشركة مطلوب' : 'Startup name is required' }
      });
    }

    const startup = await service.create(req.user.id, { name, description }, lang);
    res.status(201).json({ success: true, data: { startup } });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// GET /api/v1/startups/my
// ════════════════════════════════════════
const getMyStartup = async (req, res, next) => {
  try {
    const lang    = getLang(req);
    const startup = await service.findMyStartup(req.user.id, lang);
    res.json({ success: true, data: { startup } });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// GET /api/v1/startups?page=1&search=...
// ════════════════════════════════════════
const getAll = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await service.findAll({
      page:   Number(page)  || 1,
      limit:  Number(limit) || 10,
      search: search || ''
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// PATCH /api/v1/startups/:id/approve
// ════════════════════════════════════════
const approveStartup = async (req, res, next) => {
  try {
    const lang    = getLang(req);
    const startup = await service.approve(req.params.id, lang);
    res.json({ success: true, data: { startup } });
  } catch (err) { next(err); }
};

module.exports = { create, getMyStartup, getAll, approveStartup };
