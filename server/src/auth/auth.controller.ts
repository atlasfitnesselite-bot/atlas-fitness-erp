import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

class RefreshDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const dbUser = await this.authService.findUserByEmail(body.email);
    
    const user = await this.authService.validateUser(
      body.email,
      body.password || '',
    );
    
    if (!user) {
      if (dbUser) {
        await this.authService.recordLogin(dbUser.id, ipAddress, userAgent, 'FAILED');
      }
      throw new UnauthorizedException('Invalid credentials');
    }
    
    await this.authService.recordLogin(user.id, ipAddress, userAgent, 'SUCCESS');
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(@Req() req: { user?: { id?: string } }) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException();
    }
    return this.authService.logout(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Post('kiosk/launch')
  launchKiosk(@Body() body: { deviceCode: string }) {
    return this.authService.launchKiosk(body.deviceCode);
  }

  @Post('refresh')
  refresh(@Body() body: RefreshDto) {
    return this.authService.refreshToken(body.token);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
