import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentRepository } from '../department/department.repository';
import { EmployeeRepository } from './employee.repository';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';
import { EmployeeEntity } from './employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
  }

  async createEmployee(dto: CreateEmployeeDto) {
    const department = await this.departmentRepository.findById(dto.departmentId);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const existing = await this.employeeRepository.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException('Employee with this email already exists');
    }

    const employee = this.employeeRepository.create({
      departmentId: dto.departmentId,
    });

    const saved = await this.employeeRepository.save(employee);
    return { ...saved, department };
  }

  async getEmployeeWithHistory(employeeId: string) {
    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const leaveHistory = await this.employeeRepository.preloadLeaveHistory(employeeId);

    return {
      employee,
      leaveHistory,
    };
  }

    async findById(id: string): Promise<EmployeeEntity | null> {
    const cached = await this.redisService.getCachedEmployee(id);
    if (cached) {
      return cached;
    }

    const employee = await this.employeeRepository.findById(id);
    if (employee) {
      await this.redisService.setCachedEmployee(id, employee);
    }
    return employee;
  }

  // Cache invalidation when employee is updated
  async invalidateEmployeeCache(employeeId: string) {
    await this.redisService.invalidateEmployeeCache(employeeId);
    // Also invalidate any department caches this employee is part of
    const employee = await this.employeeRepository.findById(employeeId);
    if (employee?.departmentId) {
      await this.redisService.invalidateDepartmentCache(employee.departmentId);
    }
  }
}
