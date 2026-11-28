import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

interface LoginUser {
  id: string;
  email: string;
  name?: string;
  employee?: { profilePicture?: string | null } | null;
  userRoles?: { role: { name: string } }[];
}

interface RegisterDto {
  email: string;
  password?: string;
  name?: string;
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        employee: { select: { profilePicture: true } },
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  login(user: LoginUser) {
    // Extract role names
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
        avatar: user.employee?.profilePicture || null,
        roles,
      },
    };
  }

  async recordLogin(userId: string, ipAddress: string, userAgent: string, status: string) {
    if (!userId) return;
    try {
      await this.prisma.loginHistory.create({
        data: {
          userId,
          ipAddress: ipAddress || 'Unknown',
          userAgent: userAgent || 'Unknown',
          status,
        }
      });
    } catch (e) {
      console.error('Failed to record login history', e);
    }
  }

  async register(data: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password || '', 10);
    const roleName = data.role || 'MEMBER';

    const roleRecord = await this.prisma.role.findUnique({
      where: { name: roleName },
    });
    if (!roleRecord) {
      throw new ConflictException(`Invalid role: ${roleName}`);
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async launchKiosk(deviceCode: string) {
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

    // Generate a dedicated Kiosk token
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

  async logout(userId: string) {
    if (userId) {
      await this.prisma.session.deleteMany({
        where: { userId },
      });
    }
    return { success: true };
  }

  async refreshToken(token: string) {
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
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const roles = session.user.userRoles.map((ur) => ur.role.name);
    const payload = { email: session.user.email, sub: session.user.id, roles };
    const access_token = this.jwtService.sign(payload);

    return { success: true, access_token };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: true, message: 'Reset link sent' };
    }

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    return { success: true, message: 'Reset link sent' };
  }

  async resetPassword(data: any) {
    const { token, newPassword } = data;
    if (!token || !newPassword) {
      throw new ConflictException('Token and new password are required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
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
}
