const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CAFE role and user...');

  try {
    // 1. Ensure the CAFE role exists
    const cafeRole = await prisma.role.upsert({
      where: { name: 'CAFE' },
      update: {},
      create: { name: 'CAFE', description: 'Kitchen and Cafe Staff' },
    });

    // 2. Create the cafe user
    const hashedPassword = await bcrypt.hash('Password123', 10);
    const cafeUser = await prisma.user.upsert({
      where: { email: 'cafe@atlasfitness.com' },
      update: {
        password: hashedPassword,
        isActive: true,
      },
      create: {
        name: 'Kitchen Staff',
        email: 'cafe@atlasfitness.com',
        password: hashedPassword,
        isActive: true,
      },
    });

    // 3. Link UserRole
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: cafeUser.id,
          roleId: cafeRole.id,
        },
      },
      update: {},
      create: {
        userId: cafeUser.id,
        roleId: cafeRole.id,
      },
    });

    // 4. Ensure an Employee record exists for Attendance
    await prisma.employee.upsert({
      where: { userId: cafeUser.id },
      update: {},
      create: {
        userId: cafeUser.id,
        employeeId: 'EMP-CAFE-01',
        designationId: null, // Optional
        departmentId: null,  // Optional
        employmentTypeId: null,
        status: 'ACTIVE',
        joiningDate: new Date()
      },
    });

    console.log('Successfully seeded cafe user: cafe@atlasfitness.com / Password123');
  } catch (error) {
    console.error('Error seeding cafe user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
