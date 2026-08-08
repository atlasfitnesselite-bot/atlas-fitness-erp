import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateEmploymentTypeDto {
  name: string;
  description?: string;
  status?: string;
}

@Injectable()
export class EmploymentTypesService {
  constructor(private prisma: PrismaService) {}

  async getEmploymentTypes() {
    const types = await this.prisma.employmentType.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    return types.map((t) => ({
      ...t,
      employeeCount: t._count.employees,
    }));
  }

  async getEmploymentTypeById(id: string) {
    const type = await this.prisma.employmentType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
    if (!type) throw new NotFoundException('Employment type not found');
    return {
      ...type,
      employeeCount: type._count.employees,
    };
  }

  async createEmploymentType(data: CreateEmploymentTypeDto) {
    const existing = await this.prisma.employmentType.findUnique({
      where: { name: data.name },
    });
    if (existing)
      throw new ConflictException('Employment type name already exists');

    return this.prisma.employmentType.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || 'ACTIVE',
      },
    });
  }

  async updateEmploymentType(id: string, data: CreateEmploymentTypeDto) {
    await this.getEmploymentTypeById(id);
    return this.prisma.employmentType.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
      },
    });
  }

  async deleteEmploymentType(id: string) {
    await this.getEmploymentTypeById(id);
    return this.prisma.employmentType.delete({ where: { id } });
  }
}
