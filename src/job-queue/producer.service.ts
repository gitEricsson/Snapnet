import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '../utils/common/config/config.service';

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);
  private readonly exchange: string;

  constructor(
    private readonly amqp: AmqpConnection,
    private readonly config: ConfigService
  ) {
    this.exchange = this.config.rabbitmqExchange;
  }

  async publishLeaveRequested(payload: Record<string, any>) {
    this.logger.log(
      `Publishing leave.requested for requestId=${payload.requestId}`
    );
    await this.amqp.publish(this.exchange, 'leave.requested', payload);
  }

  async publishUserRegistered(payload: Record<string, any>) {
    this.logger.log(`Publishing user.registered for userId=${payload.userId}`);
    await this.amqp.publish(this.exchange, 'user.registered', payload);
  }

  async publishToDlq(routingKey: string, payload: Record<string, any>) {
    const dlq = this.config.rabbitmqDlq;
    this.logger.warn(
      `Publishing to DLQ=${dlq}, original routingKey=${routingKey}`
    );
    await this.amqp.publish(this.exchange, dlq, {
      routingKey,
      payload,
      time: Date.now(),
    });
  }
}
