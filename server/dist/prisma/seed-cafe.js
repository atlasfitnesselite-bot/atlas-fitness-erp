"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
    console.log('Seeding CAFE role and user...');
    try {
        const cafeRole = await prisma.role.upsert({
            where: { name: 'CAFE' },
            update: {},
            create: { name: 'CAFE', description: 'Kitchen and Cafe Staff' },
        });
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
        await prisma.employee.upsert({
            where: { userId: cafeUser.id },
            update: {},
            create: {
                userId: cafeUser.id,
                employeeId: 'EMP-CAFE-01',
                designationId: null,
                departmentId: null,
                employmentTypeId: null,
                status: 'ACTIVE',
                joiningDate: new Date()
            },
        });
        console.log('Successfully seeded cafe user: cafe@atlasfitness.com / Password123');
    }
    catch (error) {
        console.error('Error seeding cafe user:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=seed-cafe.js.map