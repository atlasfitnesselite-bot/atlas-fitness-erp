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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async findUserByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    login(user) {
        const roles = user.userRoles
            ? user.userRoles.map((ur) => ur.role.name)
            : [];
        const payload = { email: user.email, sub: user.id, roles };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles,
            },
        };
    }
    async recordLogin(userId, ipAddress, userAgent, status) {
        if (!userId)
            return;
        try {
            await this.prisma.loginHistory.create({
                data: {
                    userId,
                    ipAddress: ipAddress || 'Unknown',
                    userAgent: userAgent || 'Unknown',
                    status,
                }
            });
        }
        catch (e) {
            console.error('Failed to record login history', e);
        }
    }
    async register(data) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(data.password || '', 10);
        const roleName = data.role || 'MEMBER';
        let roleRecord = await this.prisma.role.findUnique({
            where: { name: roleName },
        });
        if (!roleRecord) {
            roleRecord = await this.prisma.role.create({
                data: { name: roleName, description: `Default ${roleName} role` },
            });
        }
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name || '',
                userRoles: {
                    create: {
                        roleId: roleRecord.id,
                    },
                },
            },
        });
        const { password, ...result } = user;
        return result;
    }
    async launchKiosk(deviceCode) {
        let device = await this.prisma.attendanceDevice.findUnique({
            where: { code: deviceCode },
        });
        if (!device) {
            device = await this.prisma.attendanceDevice.create({
                data: {
                    code: deviceCode,
                    name: `Kiosk ${deviceCode}`,
                },
            });
        }
        const payload = { sub: device.id, deviceCode, type: 'KIOSK' };
        const access_token = this.jwtService.sign(payload, { expiresIn: '12h' });
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 12);
        await this.prisma.kioskSession.create({
            data: {
                deviceId: device.id,
                token: access_token,
                expiresAt,
            },
        });
        return { access_token, device };
    }
    async logout(userId) {
        if (userId) {
            await this.prisma.session.deleteMany({
                where: { userId },
            });
        }
        return { success: true };
    }
    async refreshToken(token) {
        const session = await this.prisma.session.findUnique({
            where: { refreshToken: token },
            include: {
                user: {
                    include: {
                        userRoles: {
                            include: { role: true },
                        },
                    },
                },
            },
        });
        if (!session || session.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const roles = session.user.userRoles.map((ur) => ur.role.name);
        const payload = { email: session.user.email, sub: session.user.id, roles };
        const access_token = this.jwtService.sign(payload);
        return { success: true, access_token };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { success: true, message: 'Reset link sent' };
        }
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });
        return { success: true, message: 'Reset link sent', token: resetToken };
    }
    async resetPassword(data) {
        const { token, newPassword } = data;
        if (!token || !newPassword) {
            throw new common_1.ConflictException('Token and new password are required');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        return { success: true, message: 'Password reset successful' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map