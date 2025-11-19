import { Body, Controller, ForbiddenException, Get, HttpStatus, Param, ParseUUIDPipe, Post, Req  } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeService } from './employee.service';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/role.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../utils/common/constant/enum.constant';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';



@ApiTags('Employees')
@ApiBearerAuth('accessToken')
@UseGuards(RolesGuard) // Apply RolesGuard to all routes in this controller
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get(':employeeId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EMPLOYEE) // Allow employees to view their own profile
  @ApiOperation({ summary: 'Get an employee with leave history' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Employee retrieved successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden. User does not have the required role.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. Authentication required.' })
  async findOne(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Req() req
  ) {
    // If the user is an employee, they can only view their own profile
    if (req.user.role === Role.EMPLOYEE && req.user.employeeId !== employeeId) {
      throw new ForbiddenException('You can only view your own profile');
    }

    const result = await this.employeeService.getEmployeeWithHistory(employeeId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Employee retrieved successfully',
      data: result,
    };
  }
}
