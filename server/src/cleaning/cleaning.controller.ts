import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CleaningService } from './cleaning.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('cleaning')
export class CleaningController {
  constructor(private readonly cleaningService: CleaningService) {}

  @Get('areas')
  getAreas() {
    return this.cleaningService.getAreas();
  }

  @Post('areas')
  createArea(@Body() data: { name: string; description?: string }) {
    return this.cleaningService.createArea(data);
  }

  @Get('checklists')
  getChecklists(
    @Query('date') date?: string,
    @Query('areaId') areaId?: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string
  ) {
    return this.cleaningService.getChecklists({ date, areaId, status, assignedTo });
  }

  @Post('checklists')
  createChecklist(@Body() data: { areaId: string; date: string; shift: string; assignedTo?: string; tasks: string[] }) {
    return this.cleaningService.createChecklist(data);
  }

  @Put('checklists/:id/status')
  updateChecklistStatus(
    @Param('id') id: string,
    @Body() data: { status: string },
    @Request() req: any
  ) {
    return this.cleaningService.updateChecklistStatus(id, {
      status: data.status,
      verifiedBy: data.status === 'VERIFIED' ? req.user.id : undefined
    });
  }

  @Put('tasks/:id')
  updateTask(
    @Param('id') id: string,
    @Body() data: { isCompleted?: boolean; photoProof?: string; remarks?: string }
  ) {
    return this.cleaningService.updateTask(id, data);
  }
}
