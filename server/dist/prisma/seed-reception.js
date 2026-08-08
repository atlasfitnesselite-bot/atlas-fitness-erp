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
    const email = 'reception@atlasfitness.com';
    const password = 'Password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    let receptionRole = await prisma.role.findUnique({ where: { name: 'RECEPTION' } });
    if (!receptionRole) {
        receptionRole = await prisma.role.create({ data: { name: 'RECEPTION' } });
        console.log('Created RECEPTION role');
    }
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
        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: receptionRole.id,
            },
        });
    }
    else {
        console.log('User reception@atlasfitness.com already exists');
    }
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
    }
    else {
        if (!employee.userId) {
            await prisma.employee.update({
                where: { email },
                data: { userId: user.id }
            });
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
//# sourceMappingURL=seed-reception.js.map