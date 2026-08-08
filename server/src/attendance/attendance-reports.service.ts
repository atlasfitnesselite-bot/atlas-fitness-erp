import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(
    type: string,
    format: string,
    generatedBy: string,
    metadata?: any,
  ) {
    // Generate actual file (mock logic for now)
    const fileUrl = `/reports/${type.toLowerCase()}_${Date.now()}.${format.toLowerCase()}`;

    return this.prisma.attendanceReport.create({
      data: {
        name: `${type} Attendance Report`,
        type,
        format,
        generatedBy,
        fileUrl,
        status: 'COMPLETED',
      },
    });
  }

  async getReports() {
    return this.prisma.attendanceReport.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLateReports(startDate: Date, endDate: Date) {
    return this.prisma.lateRecord.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        attendance: true,
        employee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOvertimeReports(startDate: Date, endDate: Date) {
    return this.prisma.overtime.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        attendance: true,
        employee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBreakReports(startDate: Date, endDate: Date) {
    return this.prisma.breakHistory.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        attendance: true,
        employee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTimeline(employeeId: string, limit: number = 20) {
    return this.prisma.attendanceLog.findMany({
      where: { employeeId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { attendance: true },
    });
  }
}
