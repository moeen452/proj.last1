const { PrismaClient } = require('@prisma/client');
const { t }            = require('../../common/i18n');
const prisma = new PrismaClient();

const findApprovedStartups = async ({ page = 1, limit = 10, search, category }) => {
  const skip = (page - 1) * limit;

  const where = {
    approvalStatus: 'approved',
    ...(category && { category: { equals: category, mode: 'insensitive' } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { story: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [data, total] = await Promise.all([
    prisma.startup.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        isSuccessStory: true,
        createdAt: true
      }
    }),
    prisma.startup.count({ where })
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

const findStartupBySlug = async (slug, lang) => {
  const startup = await prisma.startup.findFirst({
    where: {
      slug,
      approvalStatus: 'approved'
    },
    include: {
      website: {
        include: {
          sections: { orderBy: { orderIndex: 'asc' } }
        }
      }
    }
  });

  if (!startup) {
    const err = new Error(t('STARTUP_NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'STARTUP_NOT_FOUND';
    throw err;
  }

  if (startup.website?.sections) {
    startup.website.sections = startup.website.sections.map((section) => ({
      ...section,
      content: JSON.parse(section.content)
    }));
  }

  return startup;
};

const createInquiry = async (startupId, { name, email, message }, lang) => {
  const startup = await prisma.startup.findUnique({ where: { id: Number(startupId) } });

  if (!startup || startup.approvalStatus !== 'approved') {
    const err = new Error(t('STARTUP_NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'STARTUP_NOT_FOUND';
    throw err;
  }

  return prisma.contactInquiry.create({
    data: {
      startupId: Number(startupId),
      name,
      email,
      message,
      status: 'pending'
    }
  });
};

const toggleFollowStartup = async (userId, startupId, lang) => {
  const startup = await prisma.startup.findUnique({ where: { id: Number(startupId) } });

  if (!startup || startup.approvalStatus !== 'approved') {
    const err = new Error(t('STARTUP_NOT_FOUND', lang));
    err.statusCode = 404;
    err.code = 'STARTUP_NOT_FOUND';
    throw err;
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      userId_startupId: {
        userId: Number(userId),
        startupId: Number(startupId)
      }
    }
  });

  if (existingFollow) {
    await prisma.follow.delete({ where: { id: existingFollow.id } });
    return { following: false };
  }

  await prisma.follow.create({
    data: {
      userId: Number(userId),
      startupId: Number(startupId)
    }
  });

  return { following: true };
};

const getUserNotifications = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: 'desc' }
  });

  return notifications;
};

const findSuccessStories = async () => {
  const startups = await prisma.startup.findMany({
    where: {
      approvalStatus: 'approved',
      isSuccessStory: true
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      description: true,
      successHighlights: true,
      createdAt: true
    }
  });

  return { data: startups };
};

module.exports = {
  findApprovedStartups,
  findStartupBySlug,
  createInquiry,
  toggleFollowStartup,
  getUserNotifications,
  findSuccessStories
};
