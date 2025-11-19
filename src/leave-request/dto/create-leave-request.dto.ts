import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { LeaveStatus } from '../../utils/common/constant/enum.constant';

export class CreateLeaveRequestDto {
  @IsNotEmpty()
  @IsUUID()
  employeeId!: string;

  @IsNotEmpty()
  @IsDate()
  startDate!: Date;

  @IsNotEmpty()
  @IsDate()
  endDate!: Date;

  @IsNotEmpty()
  @IsEnum(LeaveStatus)
  status!: LeaveStatus;
}

