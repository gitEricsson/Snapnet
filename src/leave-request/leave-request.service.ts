// src/leave-request/leave-request.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveRequestRepository } from './leave-request.repository';
import { EmployeeRepository } from '../employee/employee.repository';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveStatus } from '../utils/common/constant/enum.constant';
import { ProducerService } from '../job-queue/producer.service';

@Injectable()
export class LeaveRequestService {
  constructor(
    private readonly leaveRequestRepository: LeaveRequestRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly producer: ProducerService
  ) {}

  async createLeaveRequest(dto: CreateLeaveRequestDto) {
    // Check if employee exists
    const employee = await this.employeeRepository.findById(dto.employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check for date conflicts
    const hasConflict = await this.leaveRequestRepository.hasDateConflict(
      dto.employeeId,
      dto.startDate,
      dto.endDate
    );

    if (hasConflict) {
      throw new ConflictException(
        'Leave request conflicts with existing leave'
      );
    }

    // Create the leave request
    const leaveRequest = this.leaveRequestRepository.create({
      employeeId: dto.employeeId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: LeaveStatus.PENDING,
    });

    const saved = await this.leaveRequestRepository.save(leaveRequest);

    await this.producer.publishLeaveRequested({
      requestId: saved.id,
      employeeId: saved.employeeId,
      startDate: saved.startDate,
      endDate: saved.endDate,
      attempts: 0,
    });

    return saved;
  }

  async findByEmployeeId(employeeId: string) {
    return this.leaveRequestRepository.findByEmployeeId(employeeId);
  }
}
