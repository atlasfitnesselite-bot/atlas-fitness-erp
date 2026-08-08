import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Assuming standard Prisma location
import { MemberCheckInDto, EmployeeCheckInDto } from './dto/kiosk.dto';
import { EventsGateway } from '../events/events.gateway';
import * as bcrypt from 'bcrypt';

@Injectable()
export class KioskService {
  constructor(
    private readonly prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async memberCheckIn(dto: MemberCheckInDto) {
    const { identifier } = dto;

    // Find member by memberId or mobile
    const member = await this.prisma.member.findFirst({
      where: {
        OR: [
          { memberId: identifier },
          { mobile: identifier },
        ],
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found with the provided identifier.');
    }

    // Create check-in record
    await this.prisma.memberCheckIn.create({
      data: {
        memberId: member.id,
      },
    });

    this.eventsGateway.server.emit('live_checkin', { type: 'MEMBER', name: member.firstName });

    return {
      success: true,
      memberName: `${member.firstName} ${member.lastName}`.trim(),
      message: 'Check-in successful',
    };
  }

  async employeeCheckIn(dto: EmployeeCheckInDto) {
    const { employeeId, pin } = dto;

    // Look up Employee by employeeId
    const employee = await this.prisma.employee.findUnique({
      where: { employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found with the provided ID.');
    }

    // Compare pin using bcrypt
    const isPinValid = employee.hashedPin ? await bcrypt.compare(pin, employee.hashedPin) : false;
    if (!isPinValid) {
      throw new UnauthorizedException('Invalid PIN.');
    }

    // Create an attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day for the date field

    await this.prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        clockIn: new Date(),
        status: 'PRESENT',
      },
    });

    this.eventsGateway.server.emit('live_checkin', { type: 'STAFF', name: employee.firstName });

    return {
      success: true,
      employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
      message: 'Employee check-in successful',
    };
  }
}
