import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { RedisModule } from '../redis/redis.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [RedisModule, EmailModule],
  providers: [UtilsService],
  exports: [RedisModule, EmailModule, UtilsService],
})
export class UtilsModule {}
