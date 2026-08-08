import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Kiosk PIN generation for existing employees...');

  const employees = await prisma.employee.findMany();
  let updatedCount = 0;

  for (const emp of employees) {
    // Generate a secure 4-digit PIN for employees who don't have one (or reset existing)
    // For testing purposes, we'll assign '1234' and hash it.
    // In production, this should be a randomly generated PIN securely delivered to the employee.
    const plainPin = '1234';
    const hashedPin = await bcrypt.hash(plainPin, 10);

    await prisma.employee.update({
      where: { id: emp.id },
      data: { hashedPin },
    });

    updatedCount++;
    console.log(`Updated employee ${emp.employeeId} with hashed PIN.`);
  }

  console.log(`Successfully generated hashed PINs for ${updatedCount} employees.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
