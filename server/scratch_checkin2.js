const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = '7da71594-5db6-4ecd-8f77-15bcf257ea9c'; // Cafe user
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) {
    console.log("NO EMPLOYEE");
    return;
  }
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date: todayDate } },
  });
  console.log('selfStatus result:', existing);
}

main().finally(() => prisma.$disconnect());
