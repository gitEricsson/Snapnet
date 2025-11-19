import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { BaseUserService } from './base-user.service';
import { CreateUserDto, UpdateUserDto } from './dto/base-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { BaseUserEntity } from './base-user.entity';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/utils/common/constant/enum.constant';

@ApiTags('Users')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class BaseUserController {
  private static instance: BaseUserController;

  constructor(private readonly usersService: BaseUserService) {
    if (BaseUserController.instance) {
      return BaseUserController.instance;
    }
    BaseUserController.instance = this;
  }

 @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN) // Only admins can list all users
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users fetched',
    type: BaseUserEntity,
    isArray: true,
  })
  @ApiForbiddenResponse({ description: 'Forbidden. Admin access required.' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EMPLOYEE) // Users can view their own profile
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User found', type: BaseUserEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Forbidden. Cannot access this user.' })
  async findOne(@Param('id') id: string, @Req() req) {
    if (req.user.role === Role.EMPLOYEE && req.user.userId !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated',
    type: BaseUserEntity,
  })
  
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ): Promise<BaseUserEntity> {
    const role = String(req.user?.role || '').toUpperCase();
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
    if (!isAdmin && req.user?.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.delete(id);
  }
}
