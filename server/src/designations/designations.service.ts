import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateDesignationDto {
  name: string;
  level?: string;
  description?: string;
  status?: string;
}

@Injectable()
export class DesignationsService {
  constructor(private prisma: PrismaService) {}

  async getDesignations() {
    const desigs = await this.prisma.designation.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    return desigs.map((d) => ({
      ...d,
      employeeCount: d._count.employees,
    }));
  }

  async getDesignationById(id: string) {
    const desig = await this.prisma.designation.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
    if (!desig) throw new NotFoundException('Designation not found');
    return {
      ...desig,
      employeeCount: desig._count.employees,
    };
  }

  async createDesignation(data: CreateDesignationDto) {
    const existing = await this.prisma.designation.findUnique({
      where: { name: data.name },
    });
    if (existing)
      throw new ConflictException('Designation name already exists');

    return this.prisma.designation.create({
      data: {
        name: data.name,
        level: data.level,
        description: data.description,
        status: data.status || 'ACTIVE',
      },
    });
  }

  async updateDesignation(id: string, data: CreateDesignationDto) {
    await this.getDesignationById(id);
    return this.prisma.designation.update({
      where: { id },
      data: {
        name: data.name,
        level: data.level,
        description: data.description,
        status: data.status,
      },
    });
  }

  async deleteDesignation(id: string) {
    await this.getDesignationById(id);
    return this.prisma.designation.delete({ where: { id } });
  }
}
