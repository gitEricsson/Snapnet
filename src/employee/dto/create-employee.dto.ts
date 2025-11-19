import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Jane Doe', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @ApiProperty({ example: '9f7d4852-8e09-42b9-92b0-8b3c98522d42' })
  @IsUUID()
  departmentId!: string;
}
