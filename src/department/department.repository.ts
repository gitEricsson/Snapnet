import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEntity } from './department.entity';

@Injectable()
export class DepartmentRepository {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly repository: Repository<DepartmentEntity>,
  ) {}

  create(payload: Partial<DepartmentEntity>) {
    return this.repository.create(payload);
  }

  async save(entity: DepartmentEntity): Promise<DepartmentEntity> {
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<DepartmentEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<DepartmentEntity | null> {
    return this.repository.findOne({ where: { name } });
  }
}
