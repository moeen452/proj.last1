const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 إعداد بيانات الاستشارات من الصفر...');

  // 1. جلب أول مستخدم في قاعدة البيانات (الذي تسجل به)
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ لا يوجد مستخدم، قم بإنشاء مستخدم عبر Sign Up أولاً.');
    return;
  }
  console.log(`✅ المستخدم الحالي: ID=${user.id}, Email=${user.email}`);

  // 2. حذف أي بيانات قديمة لهذا المستخدم (كمستشار)
  await prisma.consultationBooking.deleteMany({
    where: { slot: { consultantId: user.id } }
  });
  await prisma.consultationSlot.deleteMany({
    where: { consultantId: user.id }
  });
  console.log('🗑️ تم حذف المواعيد والحجوزات القديمة.');

  // 3. إنشاء موعدين جديدين (كلاهما في المستقبل)
  const now = new Date();
  const slot1Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0); // غداً 10 صباحاً
  const slot1End = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0, 0);
  const slot2Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0, 0); // بعد غد 2 ظهراً
  const slot2End = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 0, 0);

  const slot1 = await prisma.consultationSlot.create({
    data: {
      consultantId: user.id,
      startTime: slot1Start,
      endTime: slot1End,
      isBooked: false
    }
  });
  const slot2 = await prisma.consultationSlot.create({
    data: {
      consultantId: user.id,
      startTime: slot2Start,
      endTime: slot2End,
      isBooked: false
    }
  });
  console.log(`✅ تم إنشاء موعدين:`);
  console.log(`   - غير محجوز (ID: ${slot1.id})`);
  console.log(`   - غير محجوز (ID: ${slot2.id})`);

  // 4. حجز الموعد الثاني للمستخدم نفسه
  await prisma.consultationBooking.create({
    data: {
      slotId: slot2.id,
      userId: user.id,
      status: 'booked'
    }
  });
  await prisma.consultationSlot.update({
    where: { id: slot2.id },
    data: { isBooked: true }
  });
  console.log(`✅ تم حجز الموعد ID ${slot2.id} للمستخدم.`);

  console.log('\n🎉 البيانات جاهزة تماماً!');
  console.log(`🔹 استخدم هذه القيم في Postman:`);
  console.log(`   - consultantId = ${user.id}`);
  console.log(`   - slotId غير المحجوز = ${slot1.id} (يمكنك حجزه)`);
  console.log(`   - slotId المحجوز = ${slot2.id} (يظهر في upcoming)`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());