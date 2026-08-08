import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@Controller('facilities')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  // --- Maintenance ---
  @Get('maintenance')
  @Roles('OWNER', 'MANAGER')
  getMaintenanceTickets() {
    return this.facilitiesService.getMaintenanceTickets();
  }

  @Post('maintenance')
  @Roles('OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CLEANING')
  createMaintenanceTicket(@Body() data: any) {
    return this.facilitiesService.createMaintenanceTicket(data);
  }

  @Put('maintenance/:id/resolve')
  @Roles('OWNER', 'MANAGER')
  resolveMaintenanceTicket(@Param('id') id: string) {
    return this.facilitiesService.resolveMaintenanceTicket(id);
  }

  // --- Cleaning ---
  @Get('cleaning')
  @Roles('OWNER', 'MANAGER', 'CLEANING')
  getCleaningZones() {
    return this.facilitiesService.getCleaningZones();
  }

  @Post('cleaning')
  @Roles('OWNER', 'MANAGER')
  createCleaningZone(@Body() data: any) {
    return this.facilitiesService.createCleaningZone(data);
  }

  @Put('cleaning/task/:id')
  @Roles('OWNER', 'MANAGER', 'CLEANING')
  toggleCleaningTask(@Param('id') id: string, @Body('isCompleted') isCompleted: boolean) {
    return this.facilitiesService.toggleCleaningTask(id, isCompleted);
  }
}
