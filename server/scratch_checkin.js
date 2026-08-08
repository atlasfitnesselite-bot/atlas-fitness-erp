const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const employee = await prisma.employee.findUnique({
    where: { userId: '7da71594-5db6-4ecd-8f77-15bcf257ea9c' }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendances = await prisma.attendance.findMany({
    where: { employeeId: employee.id }
  });
  console.log('Attendances for Cafe User:');
  console.table(attendances);
}

main().finally(() => prisma.$disconnect());
