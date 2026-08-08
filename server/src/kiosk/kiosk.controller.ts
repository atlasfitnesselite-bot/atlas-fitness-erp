import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { KioskService } from './kiosk.service';
import { MemberCheckInDto, EmployeeCheckInDto } from './dto/kiosk.dto';

@Controller('kiosk')
export class KioskController {
  constructor(private readonly kioskService: KioskService) {}

  @Post('member-checkin')
  @HttpCode(HttpStatus.OK)
  async memberCheckIn(@Body() dto: MemberCheckInDto) {
    return this.kioskService.memberCheckIn(dto);
  }

  @Post('employee-checkin')
  @HttpCode(HttpStatus.OK)
  async employeeCheckIn(@Body() dto: EmployeeCheckInDto) {
    return this.kioskService.employeeCheckIn(dto);
  }
}
