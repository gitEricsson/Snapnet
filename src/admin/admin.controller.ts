import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateUserDto } from '../base-user/dto/base-user.dto';
import { AdminEntity } from './admin.entity';
import { Roles } from '../decorators/role.decorator';
import { Role } from '../utils/common/constant/enum.constant';
import { RolesGuard } from '../guards/roles.guard';

@ApiTags('Admins')
@ApiBearerAuth('accessToken')
@UseGuards(RolesGuard) // Apply RolesGuard to all routes in this controller
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN) // Only admins and super admins can create new admin users
  @ApiOperation({ summary: 'Create an admin user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: AdminEntity, description: 'Admin created successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden. User does not have the required role.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. Authentication required.' })
  async create(@Body() dto: CreateUserDto) {
    const admin = await this.adminService.createAdmin(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Admin created successfully',
      data: admin,
    };
  }
}
