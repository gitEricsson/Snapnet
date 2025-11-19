import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseUserService } from './base-user.service';
import { BaseUserController } from './base-user.controller';
import { BaseUserRepository } from './base-user.repository';
import { BaseUserEntity } from './base-user.entity';
import { UtilsModule } from '../utils/utils.module';
import { RedisModule } from '../redis/redis.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([BaseUserEntity]),
    UtilsModule,
    RedisModule,
  ],
  controllers: [BaseUserController],
  providers: [BaseUserService, BaseUserRepository],
  exports: [BaseUserService, BaseUserRepository], // Export to be used by other modules, e.g., AuthModule
})
export class BaseUserModule {}
