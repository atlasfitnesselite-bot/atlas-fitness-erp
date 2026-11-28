import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { getJwtSecret } from './jwt.config';
import { EmailService } from '../billing/email.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, EmailService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
