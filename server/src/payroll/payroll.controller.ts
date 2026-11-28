import { Controller, Post, Get, Put, Body, Param, UseGuards, Query, Req } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { SetPayrollStructureDto, GenerateSalarySlipDto } from './dto/payroll.dto';

@Controller('payroll')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('structure/:employeeId')
  @Roles('OWNER', 'MANAGER')
  async getStructure(@Param('employeeId') employeeId: string) {
    return this.payrollService.getStructure(employeeId);
  }

  @Put('structure/:employeeId')
  @Roles('OWNER', 'MANAGER')
  async setStructure(
    @Param('employeeId') employeeId: string,
    @Body() dto: SetPayrollStructureDto,
  ) {
    return this.payrollService.setStructure(employeeId, dto);
  }

  @Post('generate')
  @Roles('OWNER', 'MANAGER')
  async generateSlips(@Body() dto: GenerateSalarySlipDto) {
    return this.payrollService.generateSlips(dto);
  }

  @Get('summary')
  @Roles('OWNER', 'MANAGER')
  async getSummary(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.payrollService.getSummary(
      month ? parseInt(month, 10) : undefined,
      year ? parseInt(year, 10) : undefined
    );
  }

  @Get('slips')
  @Roles('OWNER', 'MANAGER')
  async getAllSlips(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.payrollService.getAllSlips(
      month ? parseInt(month, 10) : undefined,
      year ? parseInt(year, 10) : undefined
    );
  }

  @Put('slips/:id/pay')
  @Roles('OWNER', 'MANAGER')
  async markAsPaid(@Param('id') id: string) {
    return this.payrollService.markAsPaid(id);
  }

  @Put('slips/:id')
  @Roles('OWNER', 'MANAGER')
  async updateSlip(
    @Param('id') id: string,
    @Body() body: { bonuses?: number; otherPenalties?: number }
  ) {
    return this.payrollService.updateSlip(id, body.bonuses || 0, body.otherPenalties || 0);
  }

  @Get('slips/me')
  async getMySlips(
    @Req() req: { user: { id: string } },
    @Query('year') year?: string,
  ) {
    return this.payrollService.getMySlips(req.user.id, year ? parseInt(year, 10) : undefined);
  }

  @Get('slips/employee/:employeeId')
  async getSlips(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: string,
  ) {
    return this.payrollService.getSlips(employeeId, year ? parseInt(year, 10) : undefined);
  }
}
