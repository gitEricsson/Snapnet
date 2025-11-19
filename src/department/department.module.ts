import { Module, forwardRef } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentEntity } from './department.entity';
import { EmployeeModule } from '../employee/employee.module';
import { DepartmentRepository } from './department.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([DepartmentEntity]),
    forwardRef(() => EmployeeModule),
  ],
  controllers: [DepartmentController],
  providers: [
    DepartmentService,
    DepartmentRepository,
  ],
  exports: [DepartmentService, TypeOrmModule, DepartmentRepository],
})
export class DepartmentModule {}