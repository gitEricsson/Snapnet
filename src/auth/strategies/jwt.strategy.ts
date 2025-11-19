import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IJwtPayload } from '../../jwt-token/jwt-token.interface';
import { ConfigService } from '../../utils/common/config/config.service';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: IJwtPayload) {
    const user = await this.authService.retrieveUserFromJwt(payload);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
