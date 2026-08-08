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
  DesignationsService,
  CreateDesignationDto,
} from './designations.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('designations')
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @Get()
  async getDesignations() {
    return this.designationsService.getDesignations();
  }

  @Get(':id')
  async getDesignationById(@Param('id') id: string) {
    return this.designationsService.getDesignationById(id);
  }

  @Roles('OWNER', 'MANAGER')
  @Post()
  async createDesignation(@Body() data: CreateDesignationDto) {
    return this.designationsService.createDesignation(data);
  }

  @Roles('OWNER', 'MANAGER')
  @Put(':id')
  async updateDesignation(
    @Param('id') id: string,
    @Body() data: CreateDesignationDto,
  ) {
    return this.designationsService.updateDesignation(id, data);
  }

  @Roles('OWNER', 'MANAGER')
  @Delete(':id')
  async deleteDesignation(@Param('id') id: string) {
    return this.designationsService.deleteDesignation(id);
  }
}
