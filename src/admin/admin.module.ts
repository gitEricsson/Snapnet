import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminEntity } from './admin.entity';
import { BaseUserModule } from '../base-user/base-user.module';
import { AdminRepository } from './admin.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminEntity]),
    BaseUserModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
  exports: [AdminService, AdminRepository],
})
export class AdminModule {}
