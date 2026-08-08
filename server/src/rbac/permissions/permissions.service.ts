import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class CreatePermissionDto {
  action: string;
  resource: string;
  description?: string;
}

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async getPermissions() {
    return this.prisma.permission.findMany();
  }

  async createPermission(data: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: {
        action: data.action,
        resource: data.resource,
        description: data.description,
      },
    });
  }

  async updatePermission(id: string, data: CreatePermissionDto) {
    return this.prisma.permission.update({
      where: { id },
      data: {
        action: data.action,
        resource: data.resource,
        description: data.description,
      },
    });
  }

  async deletePermission(id: string) {
    return this.prisma.permission.delete({ where: { id } });
  }
}
