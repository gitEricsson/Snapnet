import { PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../utils/common/constant/enum.constant';

export class BaseProfileDto {
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  meta?: Record<string, any>;
}

export class EmployeeProfileDto {
  @IsUUID()
  departmentId!: string;

  @IsOptional()
  meta?: Record<string, any>;
}

export class AdminProfileDto extends BaseProfileDto {
  @IsOptional()
  @IsBoolean()
  superAdmin?: boolean;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsEnum(Role)
  role!: Role;

  @ValidateNested()
  @IsOptional()
  @Type(() => EmployeeProfileDto)
  employeeProfile?: EmployeeProfileDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => AdminProfileDto)
  adminProfile?: AdminProfileDto;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
