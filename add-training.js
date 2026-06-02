const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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
  console.log('✅ تم إنشاء تدريب بالرقم:', training.id);
}
main();