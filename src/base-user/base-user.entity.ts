import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../utils/common/constant/enum.constant';

@Entity({ name: 'users' })
export class BaseUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Index('idx_users_email', { unique: true })
  @Column({ length: 180 })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
  role!: Role;

  @Column({ name: 'profile_id', type: 'uuid', nullable: true })
  profileId?: string | null;

  @Column({ type: 'json', nullable: true })
  profile?: Record<string, any> | null;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

export type UserSafe = Omit<BaseUserEntity, 'password'>;

export const toUserSafe = (user: BaseUserEntity): UserSafe => {
  const { password, ...safe } = user;
  return safe;
};
