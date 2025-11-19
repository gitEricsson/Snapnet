import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenService } from './jwt-token.service';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '../utils/common/config/config.module';
import { ConfigService } from '../utils/common/config/config.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expires = configService.get<string>('auth.jwt.accessExpiry');
        const expiresIn =
          expires && /^\d+$/.test(expires) ? Number(expires) : 3600;
        return {
          secret: configService.get<string>('auth.jwt.accessSecret'),
          signOptions: {
            expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    RedisModule,
  ],
  providers: [JwtTokenService],
  exports: [JwtTokenService, PassportModule, JwtModule],
})
export class JwtTokenModule {}
