import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Roles
  const roles = ['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING'];
  const roleRecords: Record<string, any> = {};

  for (const roleName of roles) {
    let role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleName,
          description: `Default role for ${roleName}`,
        },
      });
      console.log(`Created role: ${roleName}`);
    } else {
      console.log(`Role already exists: ${roleName}`);
    }
    roleRecords[roleName] = role;
  }

  // 2. Create Default Users for Roles
  const defaultUsers = [
    {
      name: 'Owner User',
      email: 'owner@atlasfitness.com',
      password: 'Password123',
      role: 'OWNER',
    },
    {
      name: 'Manager User',
      email: 'manager@atlasfitness.com',
      password: 'Password123',
      role: 'MANAGER',
    },
    {
      name: 'Trainer User',
      email: 'trainer@atlasfitness.com',
      password: 'Password123',
      role: 'TRAINER',
    },
    {
      name: 'Reception User',
      email: 'reception@atlasfitness.com',
      password: 'Password123',
      role: 'RECEPTION',
    },
    {
      name: 'Cafe User',
      email: 'cafe@atlasfitness.com',
      password: 'Password123',
      role: 'CAFE',
    },
    {
      name: 'Cleaning User',
      email: 'cleaning@atlasfitness.com',
      password: 'Password123',
      role: 'CLEANING',
    },
  ];

  for (const u of defaultUsers) {
    // Delete existing to ensure clean seed with roles
    const existingUser = await prisma.user.findUnique({
      where: { email: u.email },
    });
    if (existingUser) {
      await prisma.employee.deleteMany({
        where: { userId: existingUser.id },
      });
      await prisma.user.delete({
        where: { id: existingUser.id },
      });
    }

    const hashedPassword = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        userRoles: {
          create: {
            roleId: roleRecords[u.role].id,
          },
        },
      },
    });
    console.log(`Created user: ${u.email} (${u.role})`);

    // Create Employee record for Trainer and Manager so they can clock in/out using PIN
    let pinCode = '1234';
    if (u.role === 'MANAGER') pinCode = '4321';
    if (u.role === 'OWNER') pinCode = '0000';
    if (u.role === 'RECEPTION') pinCode = '1111';
    if (u.role === 'CAFE') pinCode = '2222';
    if (u.role === 'CLEANING') pinCode = '3333';

    const empId = `EMP-${u.role === 'OWNER' ? '001' : u.role === 'MANAGER' ? '002' : u.role === 'TRAINER' ? '003' : u.role === 'RECEPTION' ? '004' : u.role === 'CAFE' ? '005' : '006'}`;
    const nameParts = u.name.split(' ');
    
    await prisma.employee.create({
      data: {
        employeeId: empId,
        firstName: nameParts[0],
        lastName: nameParts[1] || 'User',
        email: u.email,
        hashedPin: await bcrypt.hash(pinCode, 10),
        joiningDate: new Date(),
        userId: user.id,
        status: 'ACTIVE',
      },
    });
    console.log(`Created Employee profile for ${u.email} with PIN: ${pinCode}`);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
