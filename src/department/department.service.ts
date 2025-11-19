import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentRepository } from './department.repository';
import { EmployeeRepository } from '../employee/employee.repository';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentEmployeesDto } from './dto/list-department-employees.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly redisService: RedisService,
  ) {}

  async createDepartment(dto: CreateDepartmentDto) {
    const name = dto.name.trim();
    const existing = await this.departmentRepository.findByName(name);
    if (existing) {
      throw new ConflictException('Department already exists');
    }

    const department = this.departmentRepository.create({ name });
    return this.departmentRepository.save(department);
  }

  async listDepartmentEmployees(
    departmentId: string,
    query: ListDepartmentEmployeesDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;

    const cacheKey = `dept:${departmentId}:employees:${page}:${limit}`;
    const cached = await this.redisService.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    const department = await this.departmentRepository.findById(departmentId);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const [employees, total] = await this.employeeRepository.findByDepartmentId(
      departmentId,
      page,
      limit,
    );

    const pages = Math.ceil(total / limit) || 1;

    const result = {
      department,
      employees,
      meta: {
        total,
        page,
        limit,
        pages,
      },
    };

    await this.redisService.setCached(cacheKey, result);

    return result;
  }

  async invalidateDepartmentCache(departmentId: string) {
    await this.redisService.invalidateDepartmentCache(departmentId);
  }

}
