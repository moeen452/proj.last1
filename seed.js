const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إضافة البيانات الشاملة...');

  // إنشاء مستخدمين (إذا لم يكونوا موجودين)
  const user1 = await prisma.user.upsert({
    where: { email: 'owner1@example.com' },
    update: {},
    create: {
      email: 'owner1@example.com',
      fullName: 'مالك الشركة التقنية',
      passwordHash: '$2a$12$dummyhash1',
      role: 'owner',
      preferredLanguage: 'ar'
    }
  });
  const user2 = await prisma.user.upsert({
    where: { email: 'owner2@example.com' },
    update: {},
    create: {
      email: 'owner2@example.com',
      fullName: 'مالك شركة التجارة',
      passwordHash: '$2a$12$dummyhash2',
      role: 'owner',
      preferredLanguage: 'ar'
    }
  });
  console.log('👤 المستخدمين:', user1.id, user2.id);

  // === الشركة الأولى (تقنية) ===
  const startup1 = await prisma.startup.upsert({
    where: { slug: 'advanced-tech' },
    update: {},
    create: {
      userId: user1.id,
      name: 'شركة التقنية المتطورة',
      slug: 'advanced-tech',
      description: 'حلول تقنية مبتكرة',
      approvalStatus: 'approved',
      rating: 4.8,
      reviewsCount: 468,
      location: 'الرياض',
      foundedYear: '2020',
      vision: 'الريادة التقنية',
      mission: 'تمكين الأعمال',
      officeHours: '09:00-18:00',
      customerSatisfaction: 98,
      totalClients: 200,
      servicesCount: 4,
      features: JSON.stringify(['AI', 'Cloud', 'Web', 'Mobile'])
    }
  });
  console.log('🏢 الشركة التقنية:', startup1.name, 'ID:', startup1.id);

  // === الشركة الثانية (تجارة) ===
  const startup2 = await prisma.startup.upsert({
    where: { slug: 'global-commerce' },
    update: {},
    create: {
      userId: user2.id,
      name: 'شركة التجارة العالمية',
      slug: 'global-commerce',
      description: 'تجارة إلكترونية متكاملة',
      approvalStatus: 'approved',
      rating: 4.5,
      reviewsCount: 320,
      location: 'جدة',
      foundedYear: '2018',
      vision: 'ربط الأسواق',
      mission: 'تسهيل التجارة',
      officeHours: '10:00-17:00'
    }
  });
  console.log('🏢 شركة التجارة:', startup2.name, 'ID:', startup2.id);

  // === أخبار ===
  const news1 = await prisma.newsArticle.upsert({
    where: { id: 1 },
    update: {},
    create: {
      startupId: startup1.id,
      title: 'ثورة تقنية في الذكاء الاصطناعي',
      content: 'أحدث التطورات في مجال الذكاء الاصطناعي والتعلم الآلي...',
      author: 'أحمد محمد',
      sourceCompany: 'TechHub',
      views: 2500,
      likes: 89,
      comments: 245,
      shares: 1200,
      tags: JSON.stringify(['AI', 'Tech']),
      publishedAt: new Date('2026-05-26')
    }
  });
  const news2 = await prisma.newsArticle.create({
    data: {
      startupId: startup2.id,
      title: 'نمو التجارة الإلكترونية في الشرق الأوسط',
      content: 'تقرير مفصل عن السوق الرقمية...',
      author: 'فاطمة الزهراء',
      sourceCompany: 'CommerceInsight',
      views: 1800,
      likes: 67,
      comments: 89,
      shares: 430,
      tags: JSON.stringify(['E-commerce', 'Growth']),
      publishedAt: new Date('2026-05-28')
    }
  });
  console.log('📰 الأخبار:', news1.title, 'ID:', news1.id, 'و', news2.title, 'ID:', news2.id);

  // === جهات اتصال ===
  await prisma.contact.createMany({
    data: [
      { startupId: startup1.id, name: 'أحمد محمد', title: 'CEO', email: 'ahmed@tech.com', phone: '+966500000001' },
      { startupId: startup2.id, name: 'نورة العلي', title: 'مديرة التسويق', email: 'nora@commerce.com', phone: '+966500000002' }
    ],
    skipDuplicates: true
  });

  // === فعالية (Event) ===
  const event = await prisma.event.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'مؤتمر النمو السنوي 2025',
      description: 'أكبر تجمع لرواد الأعمال',
      type: 'event',
      location: 'الرياض',
      date: new Date('2025-03-15'),
      time: '10:00',
      price: 'مجاني',
      isOnline: false,
      status: 'upcoming'
    }
  });
  console.log('📅 فعالية:', event.title, 'ID:', event.id);

  // === وظيفة (Job) ===
  const job = await prisma.job.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'مطور Full Stack',
      description: 'خبرة في React و Node.js',
      company: startup1.name,
      location: 'عن بعد',
      salary: '$80k - $120k',
      type: 'full-time',
      status: 'open'
    }
  });
  console.log('💼 وظيفة:', job.title, 'ID:', job.id);

  // === تدريب (Training) ===
  const training = await prisma.training.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'برنامج إتقان واجهات المستخدم',
      description: 'تعلم أحدث أطر التصميم',
      instructor: 'د. خالد',
      location: 'أونلاين',
      startDate: new Date('2025-06-01'),
      capacity: 50,
      price: 'مجاني',
      status: 'upcoming'
    }
  });
  console.log('🎓 تدريب:', training.title, 'ID:', training.id);

  // === مواعيد استشارة (Consultation Slots) ===
  await prisma.consultationSlot.createMany({
    data: [
      { consultantId: user1.id, startTime: new Date('2025-03-07T09:00:00Z'), endTime: new Date('2025-03-07T10:00:00Z'), isBooked: false },
      { consultantId: user1.id, startTime: new Date('2025-03-07T11:30:00Z'), endTime: new Date('2025-03-07T12:30:00Z'), isBooked: false }
    ],
    skipDuplicates: true
  });

  console.log('\n🎉 البيانات جاهزة بالكامل!');
  console.log(`🔹 startupId الأولى = ${startup1.id} (slug: advanced-tech)`);
  console.log(`🔹 startupId الثانية = ${startup2.id} (slug: global-commerce)`);
  console.log(`🔹 newsId = ${news1.id}, ${news2.id}`);
  console.log(`🔹 eventId = ${event.id}, jobId = ${job.id}, trainingId = ${training.id}`);
  console.log(`🔹 استخدم مستخدم email ${user1.email} لتسجيل الدخول (كلمة مرور وهمية لكن يجب استخدام حساب حقيقي مسجل)`);
  console.log(`⚠️ ملاحظة: كلمات المرور في هذه السكريبت وهمية. استخدم حساباً قمت بتسجيله فعلاً عبر /signup.`);
}

main()
  .catch(e => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());