import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
  status?: string;
  managerId?: string;
}

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async getDepartments() {
    const depts = await this.prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    return depts.map((d) => ({
      ...d,
      employeeCount: d._count.employees,
    }));
  }

  async getDepartmentById(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
    if (!dept) throw new NotFoundException('Department not found');
    return {
      ...dept,
      employeeCount: dept._count.employees,
    };
  }

  async createDepartment(data: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { name: data.name },
    });
    if (existing) throw new ConflictException('Department name already exists');

    const existingCode = await this.prisma.department.findUnique({
      where: { code: data.code },
    });
    if (existingCode)
      throw new ConflictException('Department code already exists');

    return this.prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        status: data.status || 'ACTIVE',
        managerId: data.managerId,
      },
    });
  }

  async updateDepartment(id: string, data: CreateDepartmentDto) {
    await this.getDepartmentById(id);
    return this.prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        status: data.status,
        managerId: data.managerId,
      },
    });
  }

  async deleteDepartment(id: string) {
    await this.getDepartmentById(id);
    return this.prisma.department.delete({ where: { id } });
  }
}
