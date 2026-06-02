const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 إضافة بيانات الاستثمار وجولات التمويل والإشعارات...');

  // 1. الحصول على المستخدم الحالي (الأول)
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ لا يوجد مستخدم. قم بتسجيل الدخول أولاً.');
    return;
  }
  console.log('👤 المستخدم:', user.id, user.email);

  // 2. الحصول على أول شركة موجودة (أو إنشاؤها)
  let startup = await prisma.startup.findFirst();
  if (!startup) {
    startup = await prisma.startup.create({
      data: {
        userId: user.id,
        name: 'شركة استثمارية تجريبية',
        slug: 'investment-startup',
        description: 'شركة للاختبار',
        approvalStatus: 'approved',
        rating: 4.8,
        location: 'الرياض',
        foundedYear: '2020',
        officeHours: '09:00-18:00'
      }
    });
    console.log('✅ تم إنشاء شركة جديدة ID:', startup.id);
  } else {
    console.log('✅ شركة موجودة ID:', startup.id);
  }

  // 3. إضافة جولات تمويل (Funding Rounds)
  // تعريف بيانات الجولات
  const fundingRoundsData = [
    { roundType: 'Seed', amount: '250000', roundDate: new Date('2020-01-15'), availableEquityPercentage: null, currentValuation: null },
    { roundType: 'Pre-Seed', amount: '50000', roundDate: new Date('2019-06-01'), availableEquityPercentage: null, currentValuation: null },
    { roundType: 'Series A', amount: '15000000', roundDate: new Date('2024-06-01'), availableEquityPercentage: 12.5, currentValuation: 45000000 },
    { roundType: 'Series B', amount: '45000000', roundDate: new Date('2024-03-01'), availableEquityPercentage: 8.0, currentValuation: 120000000 }
  ];

  for (const round of fundingRoundsData) {
    // تحقق إذا كانت الجولة موجودة مسبقاً بنفس النوع والتاريخ (تقريباً)
    const existingRound = await prisma.fundingRound.findFirst({
      where: {
        startupId: startup.id,
        roundType: round.roundType,
        roundDate: round.roundDate
      }
    });
    if (!existingRound) {
      await prisma.fundingRound.create({
        data: {
          startupId: startup.id,
          roundType: round.roundType,
          amount: round.amount,
          roundDate: round.roundDate,
          availableEquityPercentage: round.availableEquityPercentage,
          currentValuation: round.currentValuation
        }
      });
      console.log(`✅ أضيفت جولة ${round.roundType} بمبلغ ${round.amount}`);
    } else {
      console.log(`⚠️ جولة ${round.roundType} موجودة مسبقاً، تم تخطيها.`);
    }
  }

  // 4. إضافة استثمار (Investment) للمستخدم الحالي في هذه الشركة
  // نختار جولة Series A لنربط الاستثمار بها (اختياري، لكننا سنضيف استثماراً جديداً)
  const seriesARound = await prisma.fundingRound.findFirst({
    where: { startupId: startup.id, roundType: 'Series A' }
  });
  
  const existingInvestment = await prisma.investment.findFirst({
    where: { userId: user.id, startupId: startup.id }
  });
  
  if (!existingInvestment) {
    await prisma.investment.create({
      data: {
        userId: user.id,
        startupId: startup.id,
        amount: '10000',        // 10,000 دولار
        shares: 2.5,            // 2.5% أسهم (مثال)
        note: 'استثمار تجريبي من المستخدم'
      }
    });
    console.log('✅ تم إضافة استثمار تجريبي للمستخدم في هذه الشركة');
  } else {
    console.log('⚠️ استثمار موجود مسبقاً لهذا المستخدم في هذه الشركة، تم تخطيه.');
  }

  // 5. إضافة إشعارات متعلقة بالاستثمار وجولات التمويل
  // حذف الإشعارات القديمة لنفس النوع لتجنب التكرار (اختياري)
  // await prisma.notification.deleteMany({ where: { userId: user.id, type: { in: ['investment', 'funding'] } } });

  const investmentNotification = await prisma.notification.findFirst({
    where: { userId: user.id, type: 'investment', message: { contains: 'استثمار' } }
  });
  if (!investmentNotification) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        startupId: startup.id,
        type: 'investment',
        message: `🎉 تم استثمار مبلغ 10,000 دولار في شركة ${startup.name}`,
        isRead: false
      }
    });
    console.log('✅ أضيف إشعار استثمار للمستخدم');
  } else {
    console.log('⚠️ إشعار استثمار موجود مسبقاً');
  }

  const fundingNotification = await prisma.notification.findFirst({
    where: { userId: user.id, type: 'funding', message: { contains: 'جولة' } }
  });
  if (!fundingNotification) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        startupId: startup.id,
        type: 'funding',
        message: `💰 أعلنت شركة ${startup.name} عن جولة تمويل ${seriesARound?.roundType || 'جديدة'} بقيمة ${seriesARound?.amount || 'غير محددة'}`,
        isRead: false
      }
    });
    console.log('✅ أضيف إشعار تمويل للمستخدم');
  } else {
    console.log('⚠️ إشعار تمويل موجود مسبقاً');
  }

  console.log('\n🎉 البيانات جاهزة بالكامل!');
  console.log(`🔹 الشركة: ${startup.name} (ID: ${startup.id})`);
  console.log(`🔹 جولات التمويل المضافة: Seed, Pre-Seed, Series A, Series B`);
  console.log(`🔹 استثمار للمستخدم: مبلغ 10,000 دولار`);
  console.log(`🔹 إشعارات استثمار وتمويل جديدة`);
  console.log('\n📌 يمكنك الآن اختبار الـ endpoints التالية:');
  console.log(`   - GET /audience/startups/${startup.id}/funding-rounds`);
  console.log(`   - GET /audience/startups/${startup.id}/equity`);
  console.log(`   - GET /audience/startups/${startup.id}/stock-growth`);
  console.log(`   - GET /audience/notifications (سترى إشعارات الاستثمار والتمويل)`);
  console.log(`   - POST /audience/startups/${startup.id}/invest (يمكنك تجربة استثمار جديد)`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());