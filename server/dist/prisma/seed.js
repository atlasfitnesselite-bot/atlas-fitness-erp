"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const roles = ['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING'];
    const roleRecords = {};
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
        }
        else {
            console.log(`Role already exists: ${roleName}`);
        }
        roleRecords[roleName] = role;
    }
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
    ];
    for (const u of defaultUsers) {
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
        let pinCode = '1234';
        if (u.role === 'MANAGER')
            pinCode = '4321';
        if (u.role === 'OWNER')
            pinCode = '0000';
        const empId = `EMP-${u.role === 'OWNER' ? '001' : u.role === 'MANAGER' ? '002' : '003'}`;
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
//# sourceMappingURL=seed.js.map