import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'super-secret-key-for-atlas-fitness-development-only',
    });
  }

  validate(payload: any) {
    if (payload.type === 'KIOSK') {
      return { id: payload.sub, deviceCode: payload.deviceCode, type: 'KIOSK' };
    }
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
    };
  }
}
