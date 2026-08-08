import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitorService {
  constructor(private prisma: PrismaService) {}

  create(createVisitorDto: any, employeeId?: string) {
    return this.prisma.visitorEntry.create({
      data: {
        name: createVisitorDto.name,
        phone: createVisitorDto.phone,
        purpose: createVisitorDto.purpose,
        handledBy: employeeId,
      },
    });
  }

  findAll() {
    return this.prisma.visitorEntry.findMany({
      orderBy: { checkIn: 'desc' },
    });
  }

  findToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return this.prisma.visitorEntry.findMany({
      where: {
        checkIn: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { checkIn: 'desc' },
    });
  }

  checkout(id: string) {
    return this.prisma.visitorEntry.update({
      where: { id },
      data: { checkOut: new Date() },
    });
  }
}
