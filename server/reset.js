const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function reset() {
  const hash = await bcrypt.hash('Password123', 10);
  await prisma.user.update({
    where: { email: 'owner@atlasfitness.com' },
    data: { password: hash }
  });
  console.log('Password reset successfully');
}
reset().finally(() => prisma.$disconnect());
