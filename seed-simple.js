const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إضافة البيانات البسيطة...');

  // استخدم أول مستخدم موجود في قاعدة البيانات (الذي سجلته أنت)
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('❌ لا يوجد مستخدم. قم بتسجيل الدخول أولاً عبر /signup ثم أعد تشغيل هذا السكريبت.');
    return;
  }
  console.log('👤 المستخدم:', user.id, user.email);

  // 1. إنشاء شركة ناشئة واحدة فقط (لتجنب تضارب userId)
  const startup = await prisma.startup.upsert({
    where: { slug: 'my-tech-startup' },
    update: {},
    create: {
      userId: user.id,
      name: 'شركة التقنية المتطورة',
      slug: 'my-tech-startup',
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
  console.log('✅ شركة:', startup.name, 'ID:', startup.id);

  // 2. إنشاء خبر
  const news = await prisma.newsArticle.upsert({
    where: { id: 1 },
    update: {},
    create: {
      startupId: startup.id,
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
  console.log('✅ خبر:', news.title, 'ID:', news.id);

  // 3. جهة اتصال للشركة
  await prisma.contact.upsert({
    where: { id: 1 },
    update: {},
    create: {
      startupId: startup.id,
      name: 'أحمد محمد',
      title: 'المؤسس والرئيس التنفيذي',
      email: 'ahmed@tech.com',
      phone: '+966501234567'
    }
  });
  console.log('✅ جهة اتصال تمت إضافتها');

  // 4. فعالية
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
      status: 'upcoming'
    }
  });
  console.log('✅ فعالية:', event.title, 'ID:', event.id);

  // 5. وظيفة
  const job = await prisma.job.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'مطور Full Stack',
      description: 'خبرة في React و Node.js',
      company: startup.name,
      location: 'عن بعد',
      salary: '$80k - $120k',
      type: 'full-time',
      status: 'open'
    }
  });
  console.log('✅ وظيفة:', job.title, 'ID:', job.id);

  // 6. تدريب
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
  console.log('✅ تدريب:', training.title, 'ID:', training.id);

  // 7. مواعيد استشارة (Consultation Slots)
  await prisma.consultationSlot.createMany({
    data: [
      { consultantId: user.id, startTime: new Date('2025-03-07T09:00:00Z'), endTime: new Date('2025-03-07T10:00:00Z'), isBooked: false },
      { consultantId: user.id, startTime: new Date('2025-03-07T11:30:00Z'), endTime: new Date('2025-03-07T12:30:00Z'), isBooked: false }
    ],
    skipDuplicates: true
  });
  console.log('✅ مواعيد استشارة تمت إضافتها');

  console.log('\n🎉 البيانات جاهزة!');
  console.log(`🔹 startupId = ${startup.id}`);
  console.log(`🔹 newsId = ${news.id}`);
  console.log(`🔹 eventId = ${event.id}, jobId = ${job.id}, trainingId = ${training.id}`);
  console.log(`🔹 استخدم حساب المستخدم الذي قمت بتسجيله مسبقاً (${user.email}) للدخول.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());