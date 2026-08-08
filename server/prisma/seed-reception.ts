import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'reception@atlasfitness.com';
  const password = 'Password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create or ensure Role exists
  let receptionRole = await prisma.role.findUnique({ where: { name: 'RECEPTION' } });
  if (!receptionRole) {
    receptionRole = await prisma.role.create({ data: { name: 'RECEPTION' } });
    console.log('Created RECEPTION role');
  }

  // 2. Create or ensure User exists
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Front Desk Reception',
      },
    });
    console.log('Created user reception@atlasfitness.com');

    // Assign Role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: receptionRole.id,
      },
    });
  } else {
    console.log('User reception@atlasfitness.com already exists');
  }

  // 3. Create or ensure Employee exists
  let employee = await prisma.employee.findUnique({ where: { email } });
  if (!employee) {
    employee = await prisma.employee.create({
      data: {
        employeeId: 'EMP-REC-001',
        firstName: 'Front',
        lastName: 'Desk',
        email,
        mobile: '1234567891',
        status: 'ACTIVE',
        userId: user.id,
        joiningDate: new Date(),
      },
    });
    console.log('Created employee record for reception');
  } else {
    // Make sure userId is linked
    if (!employee.userId) {
      await prisma.employee.update({
        where: { email },
        data: { userId: user.id }
      })
    }
  }

  console.log('Reception seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
