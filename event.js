const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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
  console.log('✅ تم إنشاء فعالية بالرقم:', event.id);
}

main();