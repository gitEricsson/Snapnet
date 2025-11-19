import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './utils/common/config/database/database.module';
import { RedisModule } from './redis/redis.module';
import { DepartmentModule } from './department/department.module';
import { AuthModule } from './auth/auth.module';
import { JwtTokenModule } from './jwt-token/jwt-token.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './utils/common/filters/http-exception.filter';
import { TransformInterceptor } from './utils/common/interceptors/transform.interceptor';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { RateLimiterMiddleware } from './middleware/rate-limiter.middleware';
import { MessagingModule } from './job-queue/messaging.module';
import { HealthModule } from './health/health.module';
import { EmployeeModule } from './employee/employee.module';
import { LeaveRequestModule } from './leave-request/leave-request.module';
import { EmailModule } from './email/email.module';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';




@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      isGlobal: true, // Makes the cache available across the entire application
      ttl: 5000, // Default TTL in milliseconds
    }),
    DatabaseModule,
    RedisModule,
    DepartmentModule,
    MessagingModule,
    HealthModule,
    AuthModule,
    JwtTokenModule,
    EmployeeModule,
    LeaveRequestModule,
    EmailModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
 {
      provide: APP_INTERCEPTOR,
      useFactory: (configService: ConfigService) => {
        return new TransformInterceptor(configService);
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, RateLimiterMiddleware).forRoutes('*');
  }
}
