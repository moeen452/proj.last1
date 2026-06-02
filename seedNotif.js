// seed-notifications-extra.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 إضافة إشعارات إضافية متنوعة...');

  // 1. الحصول على أول مستخدم (الذي تستخدمه في Login)
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ لا يوجد مستخدم. قم بتسجيل الدخول أولاً.');
    return;
  }
  console.log('👤 المستخدم:', user.id, user.email);

  // 2. الحصول على شركة موجودة (لربط الإشعارات بها اختيارياً)
  const startup = await prisma.startup.findFirst();
  const startupId = startup ? startup.id : null;
  if (startupId) console.log('🏢 سيتم ربط بعض الإشعارات بالشركة ID:', startupId);
  else console.log('⚠️ لا توجد شركة، سيتم إنشاء إشعارات بدون startupId');

  // 3. قائمة الإشعارات الجديدة (نصوص فريدة)
  const newNotifications = [
    {
      type: 'follow',
      message: '📢 قام 5 مستخدمين جدد بمتابعة شركتك الناشئة اليوم!',
      startupId: startupId
    },
    {
      type: 'news',
      message: '📰 خبر جديد: تم إطلاق تحديث رئيسي لمنصتك. تابع التفاصيل.',
      startupId: startupId
    },
    {
      type: 'message',
      message: '💬 لديك رسالة جديدة من فريق الدعم بخصوص طلبك رقم #1024',
      startupId: null
    },
    {
      type: 'update',
      message: '🔄 تم تحديث ملفك الشخصي بنجاح. يمكنك الآن إضافة شعار جديد.',
      startupId: null
    },
    {
      type: 'reminder',
      message: '⏰ تذكير: غداً موعد الاجتماع الشهري مع فريق التسويق الساعة 10 صباحاً.',
      startupId: null
    }
  ];

  let addedCount = 0;
  for (const notif of newNotifications) {
    // التحقق من عدم وجود إشعار مطابق (نفس النوع والرسالة) خلال آخر 5 دقائق
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existing = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: notif.type,
        message: notif.message,
        createdAt: { gte: fiveMinutesAgo }
      }
    });
    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: notif.type,
          message: notif.message,
          startupId: notif.startupId,
          isRead: false
        }
      });
      console.log(`✅ أضيف إشعار نوع: ${notif.type}`);
      addedCount++;
    } else {
      console.log(`⚠️ إشعار نوع ${notif.type} موجود مسبقاً (تم إنشاؤه حديثاً)، تم تخطيه.`);
    }
  }

  console.log(`\n🎉 تمت إضافة ${addedCount} إشعارات جديدة.`);
  console.log('📌 يمكنك اختبارها عبر: GET /audience/notifications (مع التوكن)');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());