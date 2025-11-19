import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { DepartmentEntity } from '../department/department.entity';
import { LeaveRequestEntity } from '../leave-request/leave-request.entity';
import { BaseUserEntity } from '../base-user/base-user.entity';

@Entity({ name: 'employees' })
@Index(['departmentId']) // Composite index for department and status
@Index(['userId'], { unique: true }) // Unique index for user ID
export class EmployeeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => BaseUserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: BaseUserEntity;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId!: string;

  @ManyToOne(() => DepartmentEntity, (department) => department.employees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'department_id' })
  department!: DepartmentEntity;

  @OneToMany(() => LeaveRequestEntity, (leave) => leave.employee)
  leaveRequests!: LeaveRequestEntity[];
}
