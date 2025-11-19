import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Not, Repository } from 'typeorm';
import { LeaveStatus } from '../utils/common/constant/enum.constant';
import { LeaveRequestEntity } from './leave-request.entity';

@Injectable()
export class LeaveRequestRepository {
  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly repository: Repository<LeaveRequestEntity>,
  ) {}

  create(payload: Partial<LeaveRequestEntity>) {
    return this.repository.create(payload);
  }

  async save(entity: LeaveRequestEntity): Promise<LeaveRequestEntity> {
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<LeaveRequestEntity | null> {
    return this.repository.findOne({ where: { id }, relations: ['employee'] });
  }

  async findBy(where: FindOptionsWhere<LeaveRequestEntity>) {
    return this.repository.find({ where });
  }

  async updateStatus(id: string, status: LeaveStatus) {
    await this.repository.update(id, { status });
    return this.findById(id);
  }

  async getPendingInRange(start: Date, end: Date) {
    return this.repository.find({
      where: {
        status: LeaveStatus.PENDING,
        startDate: Between(start, end),
      },
    });
  }


  async hasDateConflict(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.repository.findOne({
      where: {
        employeeId,
        status: Not(LeaveStatus.REJECTED),
        startDate: Between(startDate, endDate),
      },
    });
  }

  async findByEmployeeId(employeeId: string) {
    return this.repository.find({
      where: {
        employeeId,
        status: Not(LeaveStatus.REJECTED),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
