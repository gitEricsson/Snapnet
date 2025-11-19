import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseUserEntity } from './base-user.entity';
import { Role } from '../utils/common/constant/enum.constant';
import { EmployeeEntity } from '../employee/employee.entity';
import { AdminEntity } from '../admin/admin.entity';

type CreateWithProfilesPayload = Partial<BaseUserEntity> & {
  role: Role;
  employeeProfile?: {
    departmentId: string;
    meta?: Record<string, any>;
  };
  adminProfile?: {
    title?: string;
    permissions?: string[];
    meta?: Record<string, any>;
  };
};

@Injectable()
export class BaseUserRepository {
  constructor(
    @InjectRepository(BaseUserEntity)
    private readonly repository: Repository<BaseUserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  create(payload: Partial<BaseUserEntity>) {
    const user = this.repository.create({
      ...payload,
      email: payload.email?.toLowerCase(),
    });
    return this.repository.save(user);
  }

  save(user: BaseUserEntity) {
    return this.repository.save(user);
  }

  findById(id: string): Promise<BaseUserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<BaseUserEntity | null> {
    return this.repository.findOne({ where: { email: email.toLowerCase() } });
  }

  findByEmailWithPassword(email: string) {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  async updateLastLogin(id: string) {
    await this.repository.update(id, { lastLoginAt: new Date() });
  }

  async createWithProfiles(payload: CreateWithProfilesPayload): Promise<BaseUserEntity> {
    return this.dataSource.transaction(async (manager) => {
      const { employeeProfile, adminProfile, role, ...userData } = payload;

      const user = manager.create(BaseUserEntity, {
        ...userData,
        role,
        email: userData.email?.toLowerCase(),
        profile: adminProfile?.meta ?? employeeProfile?.meta ?? null,
      });

      const savedUser = await manager.save(user);

      if (role === Role.EMPLOYEE && employeeProfile) {
        const employee = manager.create(EmployeeEntity, {
          userId: savedUser.id,
          departmentId: employeeProfile.departmentId,
        });
        await manager.save(employee);
      }

      if ((role === Role.ADMIN || role === Role.SUPER_ADMIN) && adminProfile) {
        const admin = manager.create(AdminEntity, {
          userId: savedUser.id,
          title: adminProfile.title,
          permissions: adminProfile.permissions,
        });
        await manager.save(admin);
      }

      return savedUser;
    });
  }

  async findAll(): Promise<BaseUserEntity[]> {
    return this.repository.find();
  }

  async update(
    id: string,
    payload: Partial<BaseUserEntity>,
  ): Promise<BaseUserEntity | null> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) {
      return null;
    }

    const merged = this.repository.merge(existing, {
      ...payload,
      email: payload.email?.toLowerCase() ?? existing.email,
    });

    return this.repository.save(merged);
  }

  async delete(id: string): Promise<BaseUserEntity | null> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) {
      return null;
    }

    await this.repository.remove(existing);
    return existing;
  }
}
