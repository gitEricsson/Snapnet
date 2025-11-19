import { Body, Controller, ForbiddenException, Get, HttpStatus, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { Roles } from '../decorators/role.decorator';
import { Role } from '../utils/common/constant/enum.constant';
import { RolesGuard } from '../guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Leave Requests')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  @Roles(Role.EMPLOYEE, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a leave request' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Leave request created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async create(@Body() dto: CreateLeaveRequestDto, @Req() req) {
    const leaveRequest = await this.leaveRequestService.createLeaveRequest({
      ...dto,
      employeeId: dto.employeeId || req.user.employeeId, // Allow admins to create for others
    });
    
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Leave request created successfully',
      data: leaveRequest,
    };
  }

  @Get('employee/:employeeId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get leave requests for an employee' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leave requests retrieved successfully' })
  async getEmployeeLeaveRequests(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Req() req
  ) {
    // Employees can only view their own leave requests
    if (req.user.role === Role.EMPLOYEE && req.user.employeeId !== employeeId) {
      throw new ForbiddenException('You can only view your own leave requests');
    }

    const requests = await this.leaveRequestService.findByEmployeeId(employeeId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Leave requests retrieved successfully',
      data: requests,
    };
  }
}