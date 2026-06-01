const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==================== STARTUP LIST & FILTERS ====================
const findApprovedStartups = async ({ page = 1, limit = 10, search, category, sort, stage, location, minRating, minInvestment, maxInvestment }) => {
  const skip = (page - 1) * limit;
  
  let orderBy = { updatedAt: 'desc' };
  if (sort === 'latest') orderBy = { createdAt: 'desc' };
  else if (sort === 'mostFollowed') orderBy = { followersCount: 'desc' };
  else if (sort === 'topRated') orderBy = { rating: 'desc' };

  const where = {
    approvalStatus: 'approved',
    ...(category && { category: { equals: category, mode: 'insensitive' } }),
    ...(stage && { stage: { equals: stage, mode: 'insensitive' } }),
    ...(location && { location: { contains: location, mode: 'insensitive' } }),
    ...(minRating && { rating: { gte: minRating } }),
    ...(minInvestment && { requiredInvestment: { gte: minInvestment } }),
    ...(maxInvestment && { requiredInvestment: { lte: maxInvestment } }),
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
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        rating: true,
        reviewsCount: true,
        logoUrl: true,
        stage: true,
        location: true,
        requiredInvestment: true,
        followersCount: true,
        createdAt: true
      }
    }),
    prisma.startup.count({ where })
  ]);

  return { data, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const getFeaturedStartups = async () => {
  return prisma.startup.findMany({
    where: { approvalStatus: 'approved' },
    take: 5,
    orderBy: { rating: 'desc' }
  });
};

const getLatestStartups = async () => {
  return prisma.startup.findMany({
    where: { approvalStatus: 'approved' },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
};

const getStartupDetails = async (slug, userId = null) => {
  const startup = await prisma.startup.findUnique({
    where: { slug },
    include: {
      news: { take: 3, orderBy: { createdAt: 'desc' } },
      contacts: true
    }
  });
  if (!startup || startup.approvalStatus !== 'approved') {
    throw new Error('Startup not found');
  }
  let isFollowing = false;
  if (userId) {
    const follow = await prisma.follow.findUnique({
      where: { userId_startupId: { userId, startupId: startup.id } }
    });
    isFollowing = !!follow;
  }
  
  let featuresArray = [];
  if (startup.features) {
    try { featuresArray = JSON.parse(startup.features); } 
    catch (e) { featuresArray = startup.features.split(',').map(f => f.trim()); }
  }

  const statistics = {
    customerSatisfaction: startup.customerSatisfaction || null,
    totalClients: startup.totalClients || null,
    servicesCount: startup.servicesCount || null
  };
  return { startup: { ...startup, features: featuresArray }, isFollowing, officeHours: startup.officeHours, statistics };
};

const getStartupDetailsById = async (startupId, userId = null) => {
  const startup = await prisma.startup.findUnique({
    where: { id: Number(startupId) },
    include: {
      news: { take: 3, orderBy: { createdAt: 'desc' } },
      contacts: true
    }
  });
  if (!startup || startup.approvalStatus !== 'approved') {
    throw new Error('Startup not found');
  }
  let isFollowing = false;
  if (userId) {
    const follow = await prisma.follow.findUnique({
      where: { userId_startupId: { userId, startupId: Number(startupId) } }
    });
    isFollowing = !!follow;
  }
  
  let featuresArray = [];
  if (startup.features) {
    try { featuresArray = JSON.parse(startup.features); } 
    catch (e) { featuresArray = startup.features.split(',').map(f => f.trim()); }
  }

  const statistics = {
    customerSatisfaction: startup.customerSatisfaction || null,
    totalClients: startup.totalClients || null,
    servicesCount: startup.servicesCount || null
  };
  return { startup: { ...startup, features: featuresArray }, isFollowing, officeHours: startup.officeHours, statistics };
};

const getCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
};

const getStartupContacts = async (startupId) => {
  const startup = await prisma.startup.findUnique({ where: { id: Number(startupId) } });
  if (!startup) throw new Error('Startup not found');
  
  return prisma.contact.findMany({
    where: { startupId: Number(startupId) },
    orderBy: { createdAt: 'asc' }
  });
};

// ==================== MESSAGES & INQUIRIES ====================
const sendSupportMessage = async ({ name, email, subject, message }) => {
  return prisma.supportMessage.create({
    data: { name, email, subject, message }
  });
};

const sendInquiry = async (startupId, { name, email, message }) => {
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

// ==================== FOLLOW & NOTIFICATIONS ====================
const followStartup = async (userId, startupId) => {
  const startup = await prisma.startup.findUnique({ where: { id: Number(startupId) } });
  if (!startup) throw new Error('Startup not found');

  const existing = await prisma.follow.findUnique({
    where: { userId_startupId: { userId, startupId: Number(startupId) } }
  });

  if (existing) {
    await prisma.$transaction([
      prisma.follow.delete({ where: { userId_startupId: { userId, startupId: Number(startupId) } } }),
      prisma.startup.update({
        where: { id: Number(startupId) },
        data: { followersCount: { decrement: 1 } }
      })
    ]);
    return { following: false };
  } else {
    await prisma.$transaction([
      prisma.follow.create({ data: { userId, startupId: Number(startupId) } }),
      prisma.startup.update({
        where: { id: Number(startupId) },
        data: { followersCount: { increment: 1 } }
      }),
      prisma.notification.create({
        data: {
          userId,
          startupId: Number(startupId),
          type: 'follow',
          message: `مستخدم جديد تابع شركتك الناشئة`
        }
      })
    ]);
    return { following: true };
  }
};

const getMyFollowing = async (userId) => {
  return prisma.follow.findMany({
    where: { userId },
    include: { startup: true }
  });
};

const getUserNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

const markAllNotificationsAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
  return { success: true };
};

const markNotificationRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: Number(notificationId) }
  });
  if (!notification || notification.userId !== userId) {
    throw new Error('Notification not found');
  }
  return prisma.notification.update({
    where: { id: Number(notificationId) },
    data: { isRead: true }
  });
};

const deleteNotification = async (userId, notificationId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: Number(notificationId) }
  });
  if (!notification || notification.userId !== userId) {
    throw new Error('Notification not found');
  }
  await prisma.notification.delete({
    where: { id: Number(notificationId) }
  });
  return { success: true };
};

// ==================== FAVORITES ====================
const getFavorites = async (userId) => {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      startup: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          description: true,
          logoUrl: true,
          rating: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const addFavorite = async (userId, startupId) => {
  const existing = await prisma.favorite.findUnique({
    where: { userId_startupId: { userId, startupId: Number(startupId) } }
  });
  if (existing) return existing;
  return prisma.favorite.create({
    data: { userId, startupId: Number(startupId) }
  });
};

const removeFavorite = async (userId, startupId) => {
  const existing = await prisma.favorite.findUnique({
    where: { userId_startupId: { userId, startupId: Number(startupId) } }
  });
  if (!existing) throw new Error('Favorite not found');
  await prisma.favorite.delete({ where: { id: existing.id } });
  return { success: true };
};

// ==================== INVESTMENT & EQUITY ====================
const investInStartup = async (userId, startupId, { amount, shares, note, roundType, roundDate }) => {
  const startup = await prisma.startup.findUnique({ where: { id: Number(startupId) } });
  if (!startup) throw new Error('Startup not found');

  const investment = await prisma.investment.create({
    data: {
      userId,
      startupId: Number(startupId),
      amount: String(amount),
      shares: shares ? Number(shares) : undefined,
      note
    }
  });

  if (roundType) {
    await prisma.fundingRound.create({
      data: {
        startupId: Number(startupId),
        roundType,
        amount: String(amount),
        roundDate: roundDate ? new Date(roundDate) : undefined
      }
    });
  }

  return investment;
};

const getAvailableEquity = async (startupId) => {
  // نفترض أن أحدث جولة تمويل من نوع 'Series A' هي النشطة
  const activeRound = await prisma.fundingRound.findFirst({
    where: { startupId, roundType: 'Series A' },
    orderBy: { roundDate: 'desc' }
  });
  if (!activeRound) {
    return { availableEquity: null, currentValuation: null };
  }
  // يجب إضافة الحقول التالية إلى نموذج FundingRound في Prisma:
  // availableEquityPercentage Float? , currentValuation Float?
  return {
    availableEquity: activeRound.availableEquityPercentage || 12.5,
    currentValuation: activeRound.currentValuation || 45_000_000,
    roundType: activeRound.roundType,
    roundDate: activeRound.roundDate
  };
};

const getStockPriceGrowth = async (startupId) => {
  const rounds = await prisma.fundingRound.findMany({
    where: { startupId },
    orderBy: { roundDate: 'asc' }
  });
  if (rounds.length < 2) {
    return { years: [], growthRates: [] };
  }
  const years = rounds.map(r => new Date(r.roundDate).getFullYear());
  const growthRates = rounds.map((r, idx) => {
    if (idx === 0) return 100;
    const prevAmount = parseFloat(rounds[idx-1].amount);
    const currAmount = parseFloat(r.amount);
    if (prevAmount === 0) return 0;
    return ((currAmount - prevAmount) / prevAmount) * 100;
  });
  return { years, growthRates };
};

// ==================== CONSULTATIONS & BOOKINGS ====================
const getAvailableSlots = async (consultantId, { from, to } = {}) => {
  const where = { consultantId: Number(consultantId), isBooked: false };
  if (from || to) {
    where.AND = [];
    if (from) where.AND.push({ startTime: { gte: new Date(from) } });
    if (to) where.AND.push({ endTime: { lte: new Date(to) } });
  }
  return prisma.consultationSlot.findMany({ where, orderBy: { startTime: 'asc' } });
};

const bookConsultation = async (userId, slotId) => {
  const slot = await prisma.consultationSlot.findUnique({ where: { id: Number(slotId) } });
  if (!slot) throw new Error('Slot not found');
  if (slot.isBooked) throw new Error('Slot already booked');

  const booking = await prisma.consultationBooking.create({
    data: { slotId: Number(slotId), userId }
  });
  await prisma.consultationSlot.update({ where: { id: Number(slotId) }, data: { isBooked: true } });
  return booking;
};

const getUserUpcomingBookings = async (userId) => {
  const now = new Date();
  const bookings = await prisma.consultationBooking.findMany({
    where: {
      userId,
      slot: { startTime: { gte: now } }
    },
    include: {
      slot: {
        include: { consultant: { select: { fullName: true, email: true } } }
      }
    },
    orderBy: { slot: { startTime: 'asc' } }
  });
  return bookings;
};

// ==================== HUB (EVENTS, TRAININGS, JOBS) ====================
const getHubContent = async (contentType, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  if (contentType === 'event') {
    const [data, total] = await Promise.all([
      prisma.event.findMany({
        orderBy: { date: 'asc' },
        skip,
        take: limit
      }),
      prisma.event.count()
    ]);
    return { data, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  } else if (contentType === 'training') {
    const [data, total] = await Promise.all([
      prisma.training.findMany({
        orderBy: { startDate: 'asc' },
        skip,
        take: limit
      }),
      prisma.training.count()
    ]);
    return { data, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  } else if (contentType === 'job') {
    const [data, total] = await Promise.all([
      prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.job.count()
    ]);
    return { data, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  }
  return { data: [], meta: { page, limit, total: 0, pages: 0 } };
};

const registerForEvent = async (userId, eventId) => {
  try {
    return await prisma.eventRegistration.create({ data: { eventId: Number(eventId), userId } });
  } catch (e) {
    if (e.code === 'P2002') return { alreadyRegistered: true };
    throw e;
  }
};

const applyForJob = async (userId, jobId, { resumeUrl, coverLetter } = {}) => {
  return prisma.jobApplication.create({
    data: { jobId: Number(jobId), userId, resumeUrl, coverLetter }
  });
};

const registerForTraining = async (userId, trainingId) => {
  try {
    return await prisma.trainingRegistration.create({ data: { trainingId: Number(trainingId), userId } });
  } catch (e) {
    if (e.code === 'P2002') return { alreadyRegistered: true };
    throw e;
  }
};

// ==================== PROFILE ====================
const getProfile = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isEmailVerified: true,
      preferredLanguage: true,
      privacySettings: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

const updateProfile = async (userId, updates) => {
  const allowedUpdates = ['fullName', 'preferredLanguage', 'privacySettings'];
  const data = {};
  allowedUpdates.forEach((field) => {
    if (field in updates) data[field] = updates[field];
  });
  if (Object.keys(data).length === 0) throw new Error('No valid profile fields to update');
  return prisma.user.update({
    where: { id: userId },
    data
  });
};

const getStartupFundingRounds = async (startupId) => {
  const rounds = await prisma.fundingRound.findMany({
    where: { startupId: Number(startupId) },
    orderBy: { roundDate: 'asc' }
  });
  return rounds;
};

// ==================== NEWS & SUCCESS STORIES ====================
const getNewsFeed = async (startupId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where = startupId ? { startupId: Number(startupId) } : {};

  const [data, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { startup: { select: { name: true, slug: true } } }
    }),
    prisma.newsArticle.count({ where })
  ]);

  const formattedData = data.map(news => {
    let tagsArray = [];
    if (news.tags) {
      try { tagsArray = JSON.parse(news.tags); } catch (e) { tagsArray = news.tags.split(',').map(t => t.trim()); }
    }
    return { ...news, tags: tagsArray };
  });

  return { data: formattedData, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const getNewsDetails = async (newsId, userId = null) => {
  const newsExists = await prisma.newsArticle.findUnique({ where: { id: Number(newsId) } });
  if (!newsExists) {
    const error = new Error('News not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.newsArticle.update({
    where: { id: Number(newsId) },
    data: { views: { increment: 1 } }
  });

  const news = await prisma.newsArticle.findUnique({
    where: { id: Number(newsId) },
    include: { startup: { select: { name: true, slug: true, id: true } } }
  });

  let tagsArray = [];
  if (news.tags) {
    try { tagsArray = JSON.parse(news.tags); } catch(e) { tagsArray = news.tags.split(',').map(t => t.trim()); }
  }
  return { ...news, tags: tagsArray };
};

const getSuccessStories = async () => {
  return prisma.startup.findMany({
    where: { approvalStatus: 'approved', isSuccessStory: true },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      description: true,
      successHighlights: true,
      logoUrl: true
    }
  });
};

module.exports = {
  findApprovedStartups,
  getFeaturedStartups,
  getLatestStartups,
  getStartupDetails,
  getStartupDetailsById,
  getStartupContacts,
  getCategories,
  sendSupportMessage,
  sendInquiry,
  followStartup,
  getMyFollowing,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationRead,
  deleteNotification,
  getFavorites,
  addFavorite,
  removeFavorite,
  investInStartup,
  getAvailableEquity,
  getStockPriceGrowth,
  getAvailableSlots,
  bookConsultation,
  getUserUpcomingBookings,
  registerForEvent,
  applyForJob,
  registerForTraining,
  getProfile,
  updateProfile,
  getHubContent,
  getNewsFeed,
  getNewsDetails,
  getSuccessStories,
  getStartupFundingRounds
};