// fix-support.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const supportMessages = [
    { name: 'أحمد محمد', email: 'ahmed@example.com', subject: 'استفسار عن خدمة', message: 'أود معرفة المزيد عن منصتكم.', status: 'pending' },
    { name: 'سارة علي', email: 'sara@example.com', subject: 'مشكلة تقنية', message: 'تواجهني صعوبة في تسجيل الدخول.', status: 'pending' },
    { name: 'محمود حسن', email: 'mahmoud@example.com', subject: 'اقتراح تعاون', message: 'نود الشراكة معكم في مشروع قادم.', status: 'pending' }
  ];

  for (const msg of supportMessages) {
    await prisma.supportMessage.create({ data: msg });
    console.log(`✅ أضيفت رسالة من: ${msg.name}`);
  }
  console.log('✅ تمت إضافة رسائل الدعم');
}

main().finally(() => prisma.$disconnect());