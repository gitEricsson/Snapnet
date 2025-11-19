import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from './employee.repository';
import { EmployeeEntity } from './employee.entity';
import { LeaveRequestEntity } from '../leave-request/leave-request.entity';
import { DepartmentModule } from '../department/department.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeEntity, LeaveRequestEntity]),
    forwardRef(() => DepartmentModule),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository],
  exports: [EmployeeService, EmployeeRepository, TypeOrmModule],
})
export class EmployeeModule {}