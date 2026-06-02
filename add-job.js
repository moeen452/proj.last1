const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const job = await prisma.job.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'مطور Full Stack',
      description: 'خبرة في React و Node.js',
      company: 'شركة تقنية',
      location: 'عن بعد',
      salary: '$80k - $120k',
      type: 'full-time',
      status: 'open'
    }
  });
  console.log('✅ تم إنشاء وظيفة بالرقم:', job.id);
}
main();