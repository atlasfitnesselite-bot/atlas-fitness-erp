import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class CreateRoleDto {
  name: string;
  description?: string;
}

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getRoles() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
  }

  async createRole(data: CreateRoleDto) {
    return this.prisma.role.create({
      data: { name: data.name, description: data.description },
    });
  }

  async updateRole(id: string, data: CreateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: { name: data.name, description: data.description },
    });
  }

  async deleteRole(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }
}
