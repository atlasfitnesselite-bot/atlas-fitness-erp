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
import { PermissionsService, CreatePermissionDto } from './permissions.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Roles('OWNER')
  @Get()
  async getPermissions() {
    return this.permissionsService.getPermissions();
  }

  @Roles('OWNER')
  @Post()
  async createPermission(@Body() data: CreatePermissionDto) {
    return this.permissionsService.createPermission(data);
  }

  @Roles('OWNER')
  @Put(':id')
  async updatePermission(
    @Param('id') id: string,
    @Body() data: CreatePermissionDto,
  ) {
    return this.permissionsService.updatePermission(id, data);
  }

  @Roles('OWNER')
  @Delete(':id')
  async deletePermission(@Param('id') id: string) {
    return this.permissionsService.deletePermission(id);
  }
}
