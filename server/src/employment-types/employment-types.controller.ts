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
import {
  EmploymentTypesService,
  CreateEmploymentTypeDto,
} from './employment-types.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('employment-types')
export class EmploymentTypesController {
  constructor(
    private readonly employmentTypesService: EmploymentTypesService,
  ) {}

  @Get()
  async getEmploymentTypes() {
    return this.employmentTypesService.getEmploymentTypes();
  }

  @Get(':id')
  async getEmploymentTypeById(@Param('id') id: string) {
    return this.employmentTypesService.getEmploymentTypeById(id);
  }

  @Roles('OWNER', 'MANAGER')
  @Post()
  async createEmploymentType(@Body() data: CreateEmploymentTypeDto) {
    return this.employmentTypesService.createEmploymentType(data);
  }

  @Roles('OWNER', 'MANAGER')
  @Put(':id')
  async updateEmploymentType(
    @Param('id') id: string,
    @Body() data: CreateEmploymentTypeDto,
  ) {
    return this.employmentTypesService.updateEmploymentType(id, data);
  }

  @Roles('OWNER', 'MANAGER')
  @Delete(':id')
  async deleteEmploymentType(@Param('id') id: string) {
    return this.employmentTypesService.deleteEmploymentType(id);
  }
}
