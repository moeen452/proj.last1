const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 إضافة بيانات المفضلة والمتابعة والاستشارات...');

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
        name: 'شركة تقنية تجريبية',
        slug: 'test-startup',
        description: 'شركة للاختبار',
        approvalStatus: 'approved',
        rating: 4.5,
        location: 'الرياض',
        foundedYear: '2023',
        officeHours: '09:00-17:00'
      }
    });
    console.log('✅ تم إنشاء شركة جديدة ID:', startup.id);
  } else {
    console.log('✅ شركة موجودة ID:', startup.id);
  }

  // 3. إضافة المفضلة (Favorite) إذا لم تكن موجودة
  const existingFavorite = await prisma.favorite.findUnique({
    where: { userId_startupId: { userId: user.id, startupId: startup.id } }
  });
  if (!existingFavorite) {
    await prisma.favorite.create({
      data: {
        userId: user.id,
        startupId: startup.id
      }
    });
    console.log('✅ تم إضافة الشركة إلى المفضلة');
  } else {
    console.log('✅ المفضلة موجودة بالفعل');
  }

  // 4. إضافة متابعة (Follow) إذا لم تكن موجودة
  const existingFollow = await prisma.follow.findUnique({
    where: { userId_startupId: { userId: user.id, startupId: startup.id } }
  });
  if (!existingFollow) {
    await prisma.follow.create({
      data: {
        userId: user.id,
        startupId: startup.id
      }
    });
    await prisma.startup.update({
      where: { id: startup.id },
      data: { followersCount: { increment: 1 } }
    });
    console.log('✅ تم إضافة متابعة للشركة');
  } else {
    console.log('✅ المتابعة موجودة بالفعل');
  }

  // 5. إضافة مواعيد استشارة (Consultation Slots) للمستخدم كمستشار (consultantId = user.id)
  // التأكد من عدم وجود مواعيد مكررة في نفس التوقيت
  const now = new Date();
  const slot1Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 10, 0, 0); // بعد 7 أيام 10 صباحاً
  const slot1End = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 11, 0, 0);
  const slot2Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8, 14, 0, 0); // بعد 8 أيام 2 مساءً
  const slot2End = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8, 15, 0, 0);

  const existingSlot1 = await prisma.consultationSlot.findFirst({
    where: { consultantId: user.id, startTime: slot1Start }
  });
  if (!existingSlot1) {
    await prisma.consultationSlot.create({
      data: {
        consultantId: user.id,
        startTime: slot1Start,
        endTime: slot1End,
        isBooked: false
      }
    });
    console.log('✅ تم إضافة موعد استشارة 1 (غير محجوز)');
  } else {
    console.log('✅ موعد الاستشارة 1 موجود بالفعل');
  }

  const existingSlot2 = await prisma.consultationSlot.findFirst({
    where: { consultantId: user.id, startTime: slot2Start }
  });
  if (!existingSlot2) {
    await prisma.consultationSlot.create({
      data: {
        consultantId: user.id,
        startTime: slot2Start,
        endTime: slot2End,
        isBooked: false
      }
    });
    console.log('✅ تم إضافة موعد استشارة 2 (غير محجوز)');
  } else {
    console.log('✅ موعد الاستشارة 2 موجود بالفعل');
  }

  // 6. حجز استشارة (Booking) على أول موعد غير محجوز
  const availableSlot = await prisma.consultationSlot.findFirst({
    where: { consultantId: user.id, isBooked: false }
  });
  if (availableSlot) {
    const existingBooking = await prisma.consultationBooking.findFirst({
      where: { slotId: availableSlot.id, userId: user.id }
    });
    if (!existingBooking) {
      await prisma.consultationBooking.create({
        data: {
          slotId: availableSlot.id,
          userId: user.id,
          status: 'booked'
        }
      });
      await prisma.consultationSlot.update({
        where: { id: availableSlot.id },
        data: { isBooked: true }
      });
      console.log(`✅ تم حجز استشارة على الموعد ID: ${availableSlot.id}`);
    } else {
      console.log('✅ حجز موجود بالفعل لهذا الموعد');
    }
  } else {
    console.log('⚠️ لا توجد مواعيد استشارة متاحة للحجز');
  }

  console.log('\n🎉 البيانات جاهزة!');
  console.log(`🔹 المفضلة والمتابعة للشركة ID: ${startup.id}`);
  console.log(`🔹 مواعيد استشارة للمستخدم ID: ${user.id}`);
  console.log(`🔹 يمكنك الآن اختبار:`);
  console.log(`   - GET /audience/favorites`);
  console.log(`   - GET /audience/following`);
  console.log(`   - GET /audience/consultations/slots?consultantId=${user.id}`);
  console.log(`   - GET /audience/consultations/upcoming`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());