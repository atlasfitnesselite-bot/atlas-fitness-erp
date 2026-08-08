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

class LoginDto {
  email: string;
  password?: string;
}

class RegisterDto {
  email: string;
  password?: string;
  name?: string;
  role?: string;
}

class RefreshDto {
  token: string;
}

class ForgotPasswordDto {
  email: string;
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
  resetPassword(@Body() body: Record<string, string>) {
    return this.authService.resetPassword(body);
  }
}
