import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    BaseUserModule, // Import UsersModule to use UsersService
    JwtTokenModule, // Import JwtTokenModule for token management
    RedisModule, // Import RedisModule for caching and token storage
    UtilsModule, // Utils for hashing
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // Register PassportModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Apply RolesGuard globally to all routes
    },
  ],
  exports: [
    AuthService, // Export AuthService for use in other modules
    // Note: We don't need to export RolesGuard here since it's provided via APP_GUARD
  ]
})
export class AuthModule {}
