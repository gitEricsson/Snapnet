import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsUUID,
  IsObject,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../utils/common/constant/enum.constant';

export class SignupDto {
  @ApiProperty({ description: 'Full name of the user', example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'User email address', example: 'jane.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Account password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ enum: Role, default: Role.EMPLOYEE })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: 'Department identifier (required for employees)' })
  @ValidateIf((dto) => (dto.role ?? Role.EMPLOYEE) === Role.EMPLOYEE)
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata to persist with the profile' })
  @IsOptional()
  @IsObject()
  profile?: Record<string, any>;
}

export class LoginDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ description: 'Persist refresh token longer' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}