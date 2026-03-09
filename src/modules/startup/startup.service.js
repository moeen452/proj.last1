// src/modules/startup/startup.service.js
const { PrismaClient } = require('@prisma/client');
const { t }            = require('../../common/i18n');
const prisma = new PrismaClient();

// ════════════════════════════════════════
// CREATE
// ════════════════════════════════════════
const create = async (userId, { name, description }, lang) => {

  const existing = await prisma.startup.findFirst({ where: { userId } });
  if (existing) {
    const err = new Error(t('STARTUP_EXISTS', lang));
    err.statusCode = 409;
    err.code = 'STARTUP_EXISTS';
    throw err;
  }

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

  const startup = await prisma.$transaction(async (tx) => {

    const newStartup = await tx.startup.create({
      data: { userId, name, slug, description }
    });

    const website = await tx.website.create({
      data: { startupId: newStartup.id }
    });

    await tx.websiteSection.createMany({
      data: [
        { websiteId: website.id, sectionType: 'hero',     orderIndex: 0, content: JSON.stringify({ en: {}, ar: {} }) },
        { websiteId: website.id, sectionType: 'services', orderIndex: 1, content: JSON.stringify({ en: {}, ar: {} }) },
        { websiteId: website.id, sectionType: 'pricing',  orderIndex: 2, content: JSON.stringify({ en: {}, ar: {} }) },
        { websiteId: website.id, sectionType: 'contact',  orderIndex: 3, content: JSON.stringify({ en: {}, ar: {} }) },
        { websiteId: website.id, sectionType: 'news',     orderIndex: 4, content: JSON.stringify({ en: {}, ar: {} }) },
      ]
    });

    // أرجع startup مع website والأقسام
    return await tx.startup.findUnique({
      where: { id: newStartup.id },
      include: {
        website: {
          include: { sections: { orderBy: { orderIndex: 'asc' } } }
        }
      }
    });
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
        include: { sections: { orderBy: { orderIndex: 'asc' } } }
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

  if (startup.website?.sections) {
    startup.website.sections = startup.website.sections.map(s => ({
      ...s,
      content: JSON.parse(s.content)
    }));
  }

  return startup;
};

// ════════════════════════════════════════
// UPDATE — صاحب الـ startup فقط
// ════════════════════════════════════════
const update = async (startupId, userId, { name, description }, lang) => {

  // تأكد أن الـ startup موجود
  const startup = await prisma.startup.findUnique({
    where: { id: Number(startupId) }
  });

  if (!startup) {
    const err = new Error(t('STARTUP_NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'STARTUP_NOT_FOUND';
    throw err;
  }

  // تأكد أن المستخدم هو صاحب الـ startup
  if (startup.userId !== userId) {
    const err = new Error(t('FORBIDDEN', lang));
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  // حدّث فقط الحقول المرسلة
  const updated = await prisma.startup.update({
    where: { id: Number(startupId) },
    data: {
      ...(name        && { name }),
      ...(description && { description }),
    }
  });

  return updated;
};

// ════════════════════════════════════════
// FIND ALL — للجمهور (approved فقط)
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
// FIND BY SLUG — للجمهور
// ════════════════════════════════════════
const findBySlug = async (slug, lang) => {

  const startup = await prisma.startup.findUnique({
    where: { slug },
    include: {
      website: {
        include: { sections: { orderBy: { orderIndex: 'asc' } } }
      }
    }
  });

  if (!startup || startup.approvalStatus !== 'approved') {
    const err = new Error(t('STARTUP_NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'STARTUP_NOT_FOUND';
    throw err;
  }

  if (startup.website?.sections) {
    startup.website.sections = startup.website.sections.map(s => ({
      ...s,
      content: JSON.parse(s.content)
    }));
  }

  return startup;
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

  return await prisma.startup.update({
    where: { id: Number(startupId) },
    data:  { approvalStatus: 'approved', approvedAt: new Date() }
  });
};

// ════════════════════════════════════════
// SUSPEND — تعليق الأدمن
// ════════════════════════════════════════
const suspend = async (startupId, lang) => {

  const startup = await prisma.startup.findUnique({
    where: { id: Number(startupId) }
  });

  if (!startup) {
    const err = new Error(t('STARTUP_NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'STARTUP_NOT_FOUND';
    throw err;
  }

  return await prisma.startup.update({
    where: { id: Number(startupId) },
    data:  { approvalStatus: 'suspended' }
  });
};

module.exports = { create, findMyStartup, update, findAll, findBySlug, approve, suspend };