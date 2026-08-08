import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService, CreateDepartmentDto } from './departments.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async getDepartments() {
    return this.departmentsService.getDepartments();
  }

  @Get(':id')
  async getDepartmentById(@Param('id') id: string) {
    return this.departmentsService.getDepartmentById(id);
  }

  @Roles('OWNER', 'MANAGER')
  @Post()
  async createDepartment(@Body() data: CreateDepartmentDto) {
    return this.departmentsService.createDepartment(data);
  }

  @Roles('OWNER', 'MANAGER')
  @Put(':id')
  async updateDepartment(
    @Param('id') id: string,
    @Body() data: CreateDepartmentDto,
  ) {
    return this.departmentsService.updateDepartment(id, data);
  }

  @Roles('OWNER', 'MANAGER')
  @Delete(':id')
  async deleteDepartment(@Param('id') id: string) {
    return this.departmentsService.deleteDepartment(id);
  }
}
