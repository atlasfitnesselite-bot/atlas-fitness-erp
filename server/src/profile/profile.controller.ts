import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from './profile.service';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  UpdatePreferencesDto,
} from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
  ) {
    return this.profileService.getProfile(req.user.id);
  }

  @Put()
  updateProfile(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(req.user.id, dto);
  }

  @Put('password')
  changePassword(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(req.user.id, dto);
  }

  @Put('preferences')
  updatePreferences(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.profileService.updatePreferences(req.user.id, dto);
  }
}
