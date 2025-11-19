import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthService } from './health.service';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../utils/common/constant/enum.constant';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('/health')
  @ApiOperation({ summary: 'Liveness check' })
  @ApiOkResponse({ description: 'Service is alive' })
  async health() {
    return this.healthService.getLiveness();
  }

  /**
   * Protected endpoint that checks queue (Redis + RabbitMQ) health.
   * Only accessible to users with Role.ADMIN.
   */
  @Get('/queue-health')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Queue and dependent services health check (admin)',
  })
  @ApiOkResponse({ description: 'Queue and dependent services OK' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or insufficient role' })
  async queueHealth() {
    return this.healthService.getQueueHealth();
  }
}
