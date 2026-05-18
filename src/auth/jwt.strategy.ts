import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ignoreExpiration: false, 
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  // Kalau token asli dan belum basi, mesin ini bakal ngebongkar isinya (payload)
  async validate(payload: any) {
    // Data yang di-return di sini bakal otomatis nempel di object `req.user`
    // Jadi nanti di Controller API lu, lu bisa tahu siapa yang lagi request
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}