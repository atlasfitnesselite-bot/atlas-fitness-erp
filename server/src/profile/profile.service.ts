import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  UpdatePreferencesDto,
} from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        userRoles: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
        employee: {
          select: {
            department: true,
            designation: true,
            profilePicture: true,
          },
        },
        userPreferences: true,
        themeSettings: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Password updated successfully' };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.userPreferences.upsert({
      where: { userId },
      update: {
        language: dto.language,
        emailAlerts: dto.emailAlerts,
        pushAlerts: dto.pushAlerts,
      },
      create: {
        userId,
        language: dto.language ?? 'en',
        emailAlerts: dto.emailAlerts ?? true,
        pushAlerts: dto.pushAlerts ?? true,
      },
    });
  }
}
