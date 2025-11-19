import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { RedisModule } from '../redis/redis.module';
import { MessagingModule } from '../job-queue/messaging.module';
import { ConfigModule } from '../utils/common/config/config.module';

@Module({
  imports: [RedisModule, MessagingModule, ConfigModule],
  controllers: [HealthController],
})
export class HealthModule {}
