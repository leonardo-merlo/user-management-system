import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    configService: ConfigService,
  ) {
    // No fallback secret: a default value would let anyone who reads the
    // source code sign valid tokens.
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('Missing env var JWT_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
  }): Promise<Omit<User, 'password'>> {
    try {
      return await this.userService.findOne(payload.sub);
    } catch {
      // A valid token for a deleted user is no longer accepted.
      throw new UnauthorizedException('User not found');
    }
  }
}
