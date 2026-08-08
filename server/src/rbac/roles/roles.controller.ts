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
import { RolesService, CreateRoleDto } from './roles.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Roles('OWNER')
  @Get()
  async getRoles() {
    return this.rolesService.getRoles();
  }

  @Roles('OWNER')
  @Post()
  async createRole(@Body() data: CreateRoleDto) {
    return this.rolesService.createRole(data);
  }

  @Roles('OWNER')
  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() data: CreateRoleDto) {
    return this.rolesService.updateRole(id, data);
  }

  @Roles('OWNER')
  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
}
