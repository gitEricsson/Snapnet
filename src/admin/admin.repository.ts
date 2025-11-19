import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminEntity } from './admin.entity';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly repository: Repository<AdminEntity>,
  ) {}

  async findByAdminId(id: string): Promise<AdminEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<AdminEntity | null> {
    return this.repository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async findByUserEmail(email: string): Promise<AdminEntity | null> {
    return this.repository
      .createQueryBuilder('admin')
      .innerJoinAndSelect('admin.user', 'user')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }
}
