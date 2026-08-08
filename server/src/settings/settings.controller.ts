import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { SettingsService } from './settings.service';
import {
  UpdateCompanySettingsDto,
  UpdateThemeSettingsDto,
  UpdateRolePermissionsDto,
} from './dto/settings.dto';

@Controller('settings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('company')
  @Roles('OWNER', 'MANAGER')
  getCompanySettings() {
    return this.settingsService.getCompanySettings();
  }

  @Put('company')
  @Roles('OWNER')
  updateCompanySettings(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
    @Body() dto: UpdateCompanySettingsDto,
  ) {
    return this.settingsService.updateCompanySettings(req.user.id, dto);
  }

  @Get('theme')
  getThemeSettings(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
  ) {
    return this.settingsService.getThemeSettings(req.user.id);
  }

  @Put('theme')
  updateThemeSettings(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
    @Body() dto: UpdateThemeSettingsDto,
  ) {
    return this.settingsService.updateThemeSettings(req.user.id, dto);
  }

  @Get('roles')
  @Roles('OWNER')
  getAllRoles() {
    return this.settingsService.getAllRoles();
  }

  @Put('roles/:id')
  @Roles('OWNER')
  updateRolePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.settingsService.updateRolePermissions(id, dto.permissionIds);
  }
}
