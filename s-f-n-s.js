const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 إضافة بيانات الإشعارات والمتابعة والدعم...');

  // 1. الحصول على مستخدم موجود (الذي تستخدمه في Login)
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ لا يوجد مستخدم. قم بتسجيل الدخول أولاً عبر /auth/signup ثم أعد تشغيل السكريبت.');
    return;
  }
  console.log('👤 المستخدم:', user.id, user.email);

  // 2. الحصول على شركة موجودة (أو إنشاء واحدة إذا لم توجد)
  let startup = await prisma.startup.findFirst();
  if (!startup) {
    startup = await prisma.startup.create({
      data: {
        userId: user.id,
        name: 'شركة التقنية المتطورة',
        slug: 'tech-startup',
        description: 'حلول تقنية مبتكرة',
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

  // 3. متابعة الشركة (إذا لم يكن المستخدم يتابعها بالفعل)
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
    // تحديث عدد المتابعين في جدول الشركة
    await prisma.startup.update({
      where: { id: startup.id },
      data: { followersCount: { increment: 1 } }
    });
    console.log('✅ متابعة: المستخدم يتابع الشركة الآن');
  } else {
    console.log('✅ المتابعة موجودة بالفعل');
  }

  // 4. إشعارات متنوعة
  // حذف الإشعارات القديمة للمستخدم لتجنب التكرار (اختياري، يمكنك التعليق عليه)
  // await prisma.notification.deleteMany({ where: { userId: user.id } });

  const notificationsData = [
    {
      type: 'follow',
      message: 'قام مستخدم جديد بمتابعة شركتك الناشئة',
      startupId: startup.id
    },
    {
      type: 'news',
      message: 'تم نشر خبر جديد عن شركتك: "إطلاق منتج جديد"',
      startupId: startup.id
    },
    {
      type: 'message',
      message: 'تلقيت رسالة جديدة من فريق الدعم بخصوص طلبك',
      startupId: null  // إشعار عام بدون شركة
    }
  ];

  for (const notif of notificationsData) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: notif.type,
        message: notif.message,
        startupId: notif.startupId,
        isRead: false
      }
    });
  }
  console.log('✅ تم إضافة 3 إشعارات جديدة للمستخدم');

  // 5. رسائل دعم (Support Messages)
  const supportMessages = [
    { name: 'أحمد محمد', email: 'ahmed@example.com', subject: 'استفسار عن خدمة', message: 'أود معرفة المزيد عن منصتكم.', status: 'pending' },
    { name: 'سارة علي', email: 'sara@example.com', subject: 'مشكلة تقنية', message: 'تواجهني صعوبة في تسجيل الدخول.', status: 'pending' },
    { name: 'محمود حسن', email: 'mahmoud@example.com', subject: 'اقتراح تعاون', message: 'نود الشراكة معكم في مشروع قادم.', status: 'pending' }
  ];

  for (const msg of supportMessages) {
    await prisma.supportMessage.upsert({
      where: { id: undefined }, // لا نريد تحديث موجود، ننشئ دائماً جديد
      update: {},
      create: msg
    });
  }
  console.log('✅ تم إضافة 3 رسائل دعم جديدة');

  console.log('\n🎉 البيانات جاهزة تماماً!');
  console.log(`🔹 يمكنك الآن اختبار:`);
  console.log(`   - GET /audience/notifications → سترى 3 إشعارات`);
  console.log(`   - GET /audience/following → سترى الشركة التي تتابعها`);
  console.log(`   - GET /audience/favorites (إذا أضفت مفضلة سابقاً)`);
  console.log(`   - POST /audience/contact (لإرسال رسالة دعم جديدة)`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());