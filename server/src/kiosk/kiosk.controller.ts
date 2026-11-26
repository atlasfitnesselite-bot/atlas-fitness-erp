import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { KioskService } from './kiosk.service';
import { MemberCheckInDto, EmployeeCheckInDto } from './dto/kiosk.dto';

@UseGuards(AuthGuard('jwt'))
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
