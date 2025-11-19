import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeEntity } from './employee.entity';
import { LeaveRequestEntity } from '../leave-request/leave-request.entity';

@Injectable()
export class EmployeeRepository {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly repository: Repository<EmployeeEntity>,
  ) {}

  create(payload: Partial<EmployeeEntity>) {
    return this.repository.create(payload);
  }

  async save(entity: EmployeeEntity): Promise<EmployeeEntity> {
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<EmployeeEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['department', 'leaveRequests'],
    });
  }

  async findByEmail(email: string): Promise<EmployeeEntity | null> {
    return this.repository
      .createQueryBuilder('employee')
      .innerJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.leaveRequests', 'leaveRequests')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  async findByDepartmentId(
    departmentId: string,
    page = 1,
    limit = 25,
  ): Promise<[EmployeeEntity[], number]> {
    return this.repository.findAndCount({
      where: { departmentId },
      relations: ['department'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async preloadLeaveHistory(employeeId: string): Promise<LeaveRequestEntity[]> {
    return this.repository.manager.find(LeaveRequestEntity, {
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }
}
