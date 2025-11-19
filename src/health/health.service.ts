import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '../utils/common/config/config.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly amqp: AmqpConnection,
    private readonly config: ConfigService,
  ) {}

  async getLiveness() {
    return { status: 'ok', uptime: process.uptime() };
  }

  /**
   * Performs light connectivity checks for Redis and RabbitMQ.
   * Uses ConfigService.get(...) to read exchange name (keeps parity with codebase).
   */
  async getQueueHealth() {
    try {
      await this.redis.getHealthCheckProbe();
    } catch (err) {
      this.logger.warn('Redis health check failed', err as any);
      return { status: 'degraded', redis: 'unreachable', error: String(err) };
    }

    // AMQP publish probe (fire-and-forget)
    try {
      const exchange = this.config.get<string>('RABBITMQ_EXCHANGE') || 'workforce.events';
      await this.amqp.publish(exchange, 'health.check', { ts: Date.now() });
    } catch (err) {
      this.logger.warn('RabbitMQ health check failed', err as any);
      return { status: 'degraded', rabbitmq: 'unreachable', error: String(err) };
    }

    return { status: 'ok', redis: 'ok', rabbitmq: 'ok' };
  }
}