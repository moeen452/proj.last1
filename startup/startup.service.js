// startup/startup.service.js
const { PrismaClient } = require('@prisma/client');
const { t }            = require('../common/i18n');
const prisma = new PrismaClient();

// ════════════════════════════════════════
// CREATE
// ════════════════════════════════════════
const create = async (userId, { name, description }, lang) => {

  // ① تحقق أن المستخدم ليس لديه startup
  const existing = await prisma.startup.findFirst({ where: { userId } });
  if (existing) {
    const err = new Error(t('STARTUP_EXISTS', lang));
    err.statusCode = 409;
    err.code = 'STARTUP_EXISTS';
    throw err;
  }

  // ② أنشئ slug فريد من الاسم
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  let slug    = baseSlug || 'startup';
  let counter = 1;
  while (await prisma.startup.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  // ③ أنشئ startup + website + أقسام في transaction
  const startup = await prisma.$transaction(async (tx) => {

    const newStartup = await tx.startup.create({
      data: { userId, name, slug, description }
    });

    const website = await tx.website.create({
      data: { startupId: newStartup.id }
    });

    // content محفوظ كـ String (JSON.stringify) لأن SQLite لا يدعم Json
    await tx.websiteSection.createMany({
      data: [
        { websiteId: website.id, sectionType: 'hero',     orderIndex: 0, content: JSON.stringify({ en: {}, ar: {} }) },
        { websiteId: website.id, sectionType: 'services', orderIndex: 1, content: JSON.stringify({ en: {}, ar: {} }) },
        { websiteId: website.id, sectionType: 'pricing',  orderIndex: 2, content: JSON.stringify({ en: {}, ar: {} }) },
        { websiteId: website.id, sectionType: 'contact',  orderIndex: 3, content: JSON.stringify({ en: {}, ar: {} }) },
        { websiteId: website.id, sectionType: 'news',     orderIndex: 4, content: JSON.stringify({ en: {}, ar: {} }) },
      ]
    });

    return newStartup;
  });

  return startup;
};

// ════════════════════════════════════════
// FIND MY STARTUP
// ════════════════════════════════════════
const findMyStartup = async (userId, lang) => {

  const startup = await prisma.startup.findFirst({
    where: { userId },
    include: {
      website: {
        include: {
          sections: { orderBy: { orderIndex: 'asc' } }
        }
      },
      brands: true,
    }
  });

  if (!startup) {
    const err = new Error(t('STARTUP_NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'STARTUP_NOT_FOUND';
    throw err;
  }

  // حوّل content من String إلى Object عند الإرجاع
  if (startup.website?.sections) {
    startup.website.sections = startup.website.sections.map(section => ({
      ...section,
      content: JSON.parse(section.content)
    }));
  }

  return startup;
};

// ════════════════════════════════════════
// FIND ALL — للجمهور
// ════════════════════════════════════════
const findAll = async ({ page = 1, limit = 10, search }) => {

  const skip = (page - 1) * limit;

  const where = {
    approvalStatus: 'approved',
    ...(search && {
      OR: [
        { name:        { contains: search } },
        { description: { contains: search } },
      ]
    })
  };

  const [data, total] = await Promise.all([
    prisma.startup.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      select:  { id: true, name: true, slug: true, description: true, createdAt: true }
    }),
    prisma.startup.count({ where })
  ]);

  return {
    data,
    meta: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

// ════════════════════════════════════════
// APPROVE — موافقة الأدمن
// ════════════════════════════════════════
const approve = async (startupId, lang) => {

  const startup = await prisma.startup.findUnique({
    where: { id: Number(startupId) }
  });

  if (!startup) {
    const err = new Error(t('STARTUP_NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'STARTUP_NOT_FOUND';
    throw err;
  }

  const updated = await prisma.startup.update({
    where: { id: Number(startupId) },
    data:  { approvalStatus: 'approved', approvedAt: new Date() }
  });

  return updated;
};

module.exports = { create, findMyStartup, findAll, approve };