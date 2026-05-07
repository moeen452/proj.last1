const service = require('./website.service');

const getLang = (req) => {
  const lang = req.headers['accept-language'];
  return lang && lang.startsWith('ar') ? 'ar' : 'en';
};

// ════════════════════════════════════════
// GET /api/v1/websites?page=1&limit=10&search=...
// ════════════════════════════════════════
const getPublishedWebsites = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await service.findPublished({
      page:   Number(page)  || 1,
      limit:  Number(limit) || 10,
      search: search || ''
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// GET /api/v1/websites/:slug
// ════════════════════════════════════════
const getWebsiteBySlug = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const website = await service.findBySlug(req.params.slug, lang);
    res.json({ success: true, data: { website } });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// PATCH /api/v1/websites/:id/sections
// ════════════════════════════════════════
const updateSections = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { sections } = req.body;

    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: lang === 'ar' ? 'بيانات الأقسام غير صحيحة' : 'Invalid sections payload' }
      });
    }

    const website = await service.updateSections(req.params.id, req.user.id, req.user.role, sections, lang);
    res.json({ success: true, data: { website } });
  } catch (err) { next(err); }
};

// ════════════════════════════════════════
// PATCH /api/v1/websites/:id/publish
// ════════════════════════════════════════
const publishWebsite = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const website = await service.publish(req.params.id, req.user.id, req.user.role, lang);
    res.json({ success: true, data: { website } });
  } catch (err) { next(err); }
};

module.exports = { getPublishedWebsites, getWebsiteBySlug, updateSections, publishWebsite };
