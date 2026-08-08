import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async getEquipment(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('location') location?: string,
  ) {
    return this.equipmentService.getEquipment({ category, status, location });
  }

  @Roles('OWNER', 'MANAGER')
  @Post()
  async createEquipment(@Body() data: any) {
    return this.equipmentService.createEquipment(data);
  }

  @Roles('OWNER', 'MANAGER')
  @Put(':id')
  async updateEquipment(@Param('id') id: string, @Body() data: any) {
    return this.equipmentService.updateEquipment(id, data);
  }

  @Get(':id/faults')
  async getFaultReports(@Param('id') id: string) {
    return this.equipmentService.getFaultReports(id);
  }

  @Post(':id/faults')
  async reportFault(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: { user?: { id?: string } },
  ) {
    if (!req.user || !req.user.id) throw new UnauthorizedException();
    return this.equipmentService.reportFault(id, data, req.user.id);
  }

  @Roles('OWNER', 'MANAGER')
  @Put('faults/:faultId/resolve')
  async resolveFault(
    @Param('faultId') faultId: string,
    @Body('technicianNotes') technicianNotes?: string,
  ) {
    return this.equipmentService.resolveFault(faultId, technicianNotes);
  }
}
