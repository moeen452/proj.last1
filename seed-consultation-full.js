// seed-consultation-full.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 إضافة بيانات المواعيد والحجوزات للاستشارات...');

  // 1. الحصول على أول مستخدم (الذي تستخدمه في Login)
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ لا يوجد مستخدم. قم بتسجيل الدخول أولاً عبر /auth/signup ثم أعد تشغيل السكريبت.');
    return;
  }
  console.log('👤 المستخدم:', user.id, user.email);

  // 2. حذف المواعيد والحجوزات القديمة (اختياري – علق إذا أردت الاحتفاظ بها)
  // await prisma.consultationBooking.deleteMany({ where: { userId: user.id } });
  // await prisma.consultationSlot.deleteMany({ where: { consultantId: user.id } });
  // console.log('🗑️ تم تنظيف البيانات القديمة (اختياري)');

  // 3. إنشاء موعدين استشارة (كلاهما في المستقبل)
  const now = new Date();
  // موعد 1: بعد يوم واحد الساعة 10:00 صباحاً (غير محجوز)
  const slot1Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0);
  const slot1End = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0, 0);
  
  // موعد 2: بعد 3 أيام الساعة 14:00 (سيتم حجزه)
  const slot2Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 14, 0, 0);
  const slot2End = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 15, 0, 0);

  // إدراج الموعد الأول (غير محجوز)
  let slot1 = await prisma.consultationSlot.findFirst({
    where: { consultantId: user.id, startTime: slot1Start }
  });
  if (!slot1) {
    slot1 = await prisma.consultationSlot.create({
      data: {
        consultantId: user.id,
        startTime: slot1Start,
        endTime: slot1End,
        isBooked: false
      }
    });
    console.log('✅ موعد استشارة 1 (غير محجوز) ID:', slot1.id);
  } else {
    console.log('⚠️ موعد 1 موجود مسبقاً ID:', slot1.id);
  }

  // إدراج الموعد الثاني (سيُحجز لاحقاً)
  let slot2 = await prisma.consultationSlot.findFirst({
    where: { consultantId: user.id, startTime: slot2Start }
  });
  if (!slot2) {
    slot2 = await prisma.consultationSlot.create({
      data: {
        consultantId: user.id,
        startTime: slot2Start,
        endTime: slot2End,
        isBooked: false
      }
    });
    console.log('✅ موعد استشارة 2 (سيتم حجزه) ID:', slot2.id);
  } else {
    console.log('⚠️ موعد 2 موجود مسبقاً ID:', slot2.id);
  }

  // 4. حجز الموعد الثاني للمستخدم الحالي
  const existingBooking = await prisma.consultationBooking.findFirst({
    where: { slotId: slot2.id, userId: user.id }
  });
  if (!existingBooking) {
    await prisma.consultationBooking.create({
      data: {
        slotId: slot2.id,
        userId: user.id,
        status: 'booked'
      }
    });
    // تحديث حالة الموعد إلى محجوز
    await prisma.consultationSlot.update({
      where: { id: slot2.id },
      data: { isBooked: true }
    });
    console.log('✅ تم حجز الموعد 2 للمستخدم الحالي');
  } else {
    console.log('⚠️ الحجز موجود مسبقاً للموعد 2');
  }

  console.log('\n🎉 البيانات جاهزة!');
  console.log(`🔹 موعد غير محجوز ID: ${slot1.id} (يظهر في /consultations/slots)`);
  console.log(`🔹 موعد محجوز ID: ${slot2.id} (يظهر في /consultations/upcoming)`);
  console.log('\n📌 يمكنك الآن اختبار:');
  console.log(`   - GET /audience/consultations/slots?consultantId=${user.id}`);
  console.log(`   - GET /audience/consultations/upcoming (مع التوكن)`);
  console.log(`   - POST /audience/consultations/book مع {"slotId": ${slot1.id}} (لحجز الموعد الأول)`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());