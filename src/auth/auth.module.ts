import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BaseUserModule } from '../base-user/base-user.module';
import { ConfigModule } from '../utils/common/config/config.module';
import { UtilsModule } from '../utils/utils.module';
import { JwtTokenModule } from '../jwt-token/jwt-token.module';
import { RedisModule } from '../redis/redis.module';
import { RolesGuard } from '../guards/roles.guard';
import { MessagingModule } from '../job-queue/messaging.module';

@Module({
  imports: [
    BaseUserModule,
    JwtTokenModule,
    RedisModule,
    UtilsModule,
    ConfigModule,
    forwardRef(() => MessagingModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService]
})
export class AuthModule {}