const { PrismaClient } = require('@prisma/client');
const { t }            = require('../../common/i18n');
const prisma = new PrismaClient();

const findPublished = async ({ page = 1, limit = 10, search }) => {
  const skip = (page - 1) * limit;

  const where = {
    isPublished: true,
    startup: { approvalStatus: 'approved' },
    ...(search && {
      OR: [
        { startup: { name: { contains: search } } },
        { startup: { description: { contains: search } } }
      ]
    })
  };

  const [data, total] = await Promise.all([
    prisma.website.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        startup: {
          select: { id: true, name: true, slug: true, description: true }
        }
      }
    }),
    prisma.website.count({ where })
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const findBySlug = async (slug, lang) => {
  const website = await prisma.website.findFirst({
    where: {
      isPublished: true,
      startup: { slug, approvalStatus: 'approved' }
    },
    include: {
      startup: {
        select: { id: true, name: true, slug: true, description: true }
      },
      sections: {
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!website) {
    const err = new Error(t('WEBSITE_NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'WEBSITE_NOT_FOUND';
    throw err;
  }

  website.sections = website.sections.map((section) => ({
    ...section,
    content: JSON.parse(section.content)
  }));

  return website;
};

const publish = async (websiteId, userId, role, lang) => {
  const website = await prisma.website.findUnique({
    where: { id: Number(websiteId) },
    include: {
      startup: {
        select: { id: true, userId: true, slug: true }
      }
    }
  });

  if (!website) {
    const err = new Error(t('WEBSITE_NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'WEBSITE_NOT_FOUND';
    throw err;
  }

  if (role !== 'admin' && Number(userId) !== website.startup.userId) {
    const err = new Error(t('WEBSITE_PUBLISH_FORBIDDEN', lang));
    err.statusCode = 403;
    err.code = 'WEBSITE_PUBLISH_FORBIDDEN';
    throw err;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const publishedUrl = `${frontendUrl.replace(/\/$/, '')}/startups/${website.startup.slug}`;

  return prisma.website.update({
    where: { id: Number(websiteId) },
    data: {
      isPublished: true,
      publishedUrl,
      updatedAt: new Date()
    }
  });
};

const updateSections = async (websiteId, userId, role, sections, lang) => {
  const website = await prisma.website.findUnique({
    where: { id: Number(websiteId) },
    include: {
      startup: true,
      sections: true
    }
  });

  if (!website) {
    const err = new Error(t('WEBSITE_NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'WEBSITE_NOT_FOUND';
    throw err;
  }

  if (Number(userId) !== website.startup.userId && role !== 'admin') {
    const err = new Error(t('WEBSITE_UPDATE_FORBIDDEN', lang));
    err.statusCode = 403;
    err.code = 'WEBSITE_UPDATE_FORBIDDEN';
    throw err;
  }

  const existingByType = website.sections.reduce((map, section) => {
    map[section.sectionType] = section;
    return map;
  }, {});

  const updates = sections.map((section) => {
    const existing = existingByType[section.sectionType];
    if (!existing) {
      const err = new Error(t('WEBSITE_SECTION_INVALID', lang));
      err.statusCode = 400;
      err.code = 'WEBSITE_SECTION_INVALID';
      throw err;
    }

    return {
      id: existing.id,
      data: {
        content: JSON.stringify(section.content || {}),
        isVisible: section.isVisible ?? existing.isVisible,
        orderIndex: section.orderIndex ?? existing.orderIndex
      }
    };
  });

  const updatedSections = await prisma.$transaction(
    updates.map((update) => prisma.websiteSection.update({
      where: { id: update.id },
      data: update.data
    }))
  );

  return updatedSections.map((section) => ({
    ...section,
    content: JSON.parse(section.content)
  }));
};

module.exports = { findPublished, findBySlug, publish, updateSections };
