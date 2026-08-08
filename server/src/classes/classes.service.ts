import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  createClass(data: any) {
    return this.prisma.groupClass.create({
      data: {
        name: data.name,
        instructorId: data.instructorId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: Number(data.capacity),
      },
    });
  }

  async findToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.prisma.groupClass.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        instructor: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async bookClass(classId: string, memberId: string) {
    const groupClass = await this.prisma.groupClass.findUnique({
      where: { id: classId },
      include: { _count: { select: { bookings: true } } },
    });

    if (!groupClass) throw new BadRequestException('Class not found');
    if (groupClass._count.bookings >= groupClass.capacity) {
      throw new BadRequestException('Class is full');
    }

    // Check if already booked
    const existing = await this.prisma.classBooking.findUnique({
      where: {
        classId_memberId: { classId, memberId }
      }
    });

    if (existing) {
      throw new BadRequestException('Member already booked for this class');
    }

    return this.prisma.classBooking.create({
      data: {
        classId,
        memberId,
      },
    });
  }
}
