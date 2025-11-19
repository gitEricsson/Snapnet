import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseUserEntity } from '../base-user/base-user.entity';

@Entity({ name: 'admin' })
export class AdminEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => BaseUserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: BaseUserEntity;

  @Column({ length: 120, nullable: true })
  title?: string;

  @Column('simple-array', { nullable: true })
  permissions?: string[];
}
