import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequestController } from './leave-request.controller';
import { LeaveRequestService } from './leave-request.service';
import { LeaveRequestRepository } from './leave-request.repository';
import { LeaveRequestEntity } from './leave-request.entity';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequestEntity]), EmployeeModule
  ],
  controllers: [LeaveRequestController],
  providers: [LeaveRequestService, LeaveRequestRepository],
  exports: [LeaveRequestService, LeaveRequestRepository],
})
export class LeaveRequestModule {}
