import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseUserService } from '../base-user/base-user.service';
import { CreateUserDto } from '../base-user/dto/base-user.dto';
import { Role } from '../utils/common/constant/enum.constant';
import { AdminRepository } from './admin.repository';
import { AdminEntity } from './admin.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly baseUserService: BaseUserService,
    private readonly adminRepository: AdminRepository,
  ) {}

  async createAdmin(dto: CreateUserDto) {
    const role = dto.role;
    if (role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
      throw new BadRequestException('Role must be admin or super_admin for admin creation');
    }

    if (!dto.adminProfile) {
      throw new BadRequestException('adminProfile is required for admin creation');
    }

    return this.baseUserService.create(dto);
  }

  async getAdminByEmail(email: string): Promise<AdminEntity | null> {
    return this.adminRepository.findByUserEmail(email);
  }

  async getAdminByAdminId(id: string): Promise<AdminEntity | null> {
    return this.adminRepository.findByAdminId(id);
  }

  async getAdminByUserId(userId: string): Promise<AdminEntity | null> {
    return this.adminRepository.findByUserId(userId);
  }
}
