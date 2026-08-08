import { Controller, Get, Post, Body, Put, Param, UseGuards, Request } from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@Controller('visitors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @Post()
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  create(@Body() createVisitorDto: any, @Request() req: any) {
    // Ideally map req.user.id to employeeId, but keeping it simple for now
    return this.visitorService.create(createVisitorDto, req.user.id);
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  findAll() {
    return this.visitorService.findAll();
  }

  @Get('today')
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  findToday() {
    return this.visitorService.findToday();
  }

  @Put(':id/checkout')
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  checkout(@Param('id') id: string) {
    return this.visitorService.checkout(id);
  }
}
