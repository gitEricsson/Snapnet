import { Body, Controller, ForbiddenException, Get, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentEmployeesDto } from './dto/list-department-employees.dto';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/role.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../utils/common/constant/enum.constant';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Departments')
@ApiBearerAuth('accessToken')
@UseGuards(RolesGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  
  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a department' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Department created successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden. Admin access required.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. Authentication required.' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    const department = await this.departmentService.createDepartment(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Department created successfully',
      data: { department },
    };
  }

  @Get(':departmentId/employees')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List employees in a department (paginated)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Employees fetched successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden. Authentication required.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. Authentication required.' })
  async listEmployees(
    @Param('departmentId', new ParseUUIDPipe()) departmentId: string,
    @Query() query: ListDepartmentEmployeesDto,
    @Req() req
  ) {
    // If the user is an employee, they can only view employees in their own department
    if (req.user.role === Role.EMPLOYEE && req.user.departmentId !== departmentId) {
      throw new ForbiddenException('You can only view employees in your own department');
    }

    const result = await this.departmentService.listDepartmentEmployees(departmentId, query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Employees fetched successfully',
      data: result,
    };
  }
}
