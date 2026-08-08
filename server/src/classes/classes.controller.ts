import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@Controller('classes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  create(@Body() createClassDto: any) {
    return this.classesService.createClass(createClassDto);
  }

  @Get('today')
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  findToday() {
    return this.classesService.findToday();
  }

  @Post('book')
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  bookClass(@Body() body: { classId: string, memberId: string }) {
    return this.classesService.bookClass(body.classId, body.memberId);
  }
}
