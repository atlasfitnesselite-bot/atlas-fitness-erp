import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, UnauthorizedException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { taskStorage } from './multer.config';
import { TasksService } from './tasks.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('my')
  async getMyTasks(@Req() req: { user?: { id?: string } }) {
    if (!req.user || !req.user.id) throw new UnauthorizedException();
    // Find employee ID for this user
    const employee = await this.tasksService.getEmployeeByUserId(req.user.id);
    if (!employee) return [];
    return this.tasksService.getTasks({ assignedTo: employee.id });
  }

  @Get()
  async getTasks(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('category') category?: string,
  ) {
    return this.tasksService.getTasks({ status, priority, assignedTo, category });
  }

  @Post()
  async createTask(@Body() data: any, @Req() req: { user?: { id?: string } }) {
    if (!req.user || !req.user.id) throw new UnauthorizedException();
    return this.tasksService.createTask(data, req.user.id);
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() data: any) {
    return this.tasksService.updateTask(id, data);
  }

  @Put(':id/complete')
  @UseInterceptors(FileInterceptor('photoProof', { storage: taskStorage }))
  async completeTask(
    @Param('id') id: string,
    @Body() data: { remarks?: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const photoProof = file ? `/uploads/tasks/${file.filename}` : undefined;
    return this.tasksService.completeTask(id, { ...data, photoProof });
  }

  @Roles('OWNER', 'MANAGER')
  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }
}
