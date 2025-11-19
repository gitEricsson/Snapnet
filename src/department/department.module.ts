import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentEntity } from './department.entity';
import { EmployeeModule } from '../employee/employee.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([DepartmentEntity]), EmployeeModule
    ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
