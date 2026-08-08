import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateCompanySettingsDto,
  UpdateThemeSettingsDto,
} from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanySettings() {
    const settings = await this.prisma.companySettings.findFirst();
    if (!settings) {
      return {
        companyName: 'Atlas Fitness',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        companyLogo: null,
        companyContact: null,
      };
    }
    return settings;
  }

  async updateCompanySettings(userId: string, dto: UpdateCompanySettingsDto) {
    const existing = await this.prisma.companySettings.findFirst();
    if (existing) {
      return this.prisma.companySettings.update({
        where: { id: existing.id },
        data: { ...dto, userId },
      });
    }
    return this.prisma.companySettings.create({
      data: {
        companyName: dto.companyName || 'Atlas Fitness',
        timezone: dto.timezone || 'UTC',
        dateFormat: dto.dateFormat || 'YYYY-MM-DD',
        companyLogo: dto.companyLogo,
        companyContact: dto.companyContact,
        userId,
      },
    });
  }

  async getThemeSettings(userId: string) {
    let settings = await this.prisma.themeSettings.findUnique({
      where: { userId },
    });
    if (!settings) {
      settings = await this.prisma.themeSettings.create({
        data: {
          userId,
          primaryColor: '#DC2626',
          secondaryColor: '#0F172A',
          mode: 'light',
        },
      });
    }
    return settings;
  }

  async updateThemeSettings(userId: string, dto: UpdateThemeSettingsDto) {
    return this.prisma.themeSettings.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        primaryColor: dto.primaryColor || '#DC2626',
        secondaryColor: dto.secondaryColor || '#0F172A',
        mode: dto.mode || 'light',
      },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    // Delete existing permissions for the role
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Create new permissions
    if (permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });
    }

    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }
}
