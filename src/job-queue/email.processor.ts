import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { EmailService } from '../email/email.service';
import { RedisService } from '../redis/redis.service';
import { ProducerService } from './producer.service';
import { RetryService } from './retry.service';
import { ConfigService } from '@nestjs/config';

interface UserRegisteredMsg {
  userId: string;
  email: string;
  name: string;
  attempts?: number;
}

@Injectable()
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  private readonly maxAttempts: number;

  constructor(
    private readonly emailService: EmailService,
    private readonly redis: RedisService,
    private readonly producer: ProducerService,
    private readonly retryService: RetryService,
    private readonly config: ConfigService
  ) {
    this.maxAttempts = this.config.emailMaxRetries;
  }

  @RabbitSubscribe({
    exchange: 'workforce.events',
    routingKey: 'user.registered',
    queue: 'email.welcome',
    queueOptions: { durable: true },
  })
  async handleUserRegistered(msg: UserRegisteredMsg) {
    const key = `welcome:processed:${msg.userId}`;
    const acquired = await this.redis.setNxExpire(key, '1', 60 * 60 * 24); // idempotency 1 day
    if (!acquired) {
      this.logger.log(`Welcome email already sent for user ${msg.userId}`);
      return;
    }

    try {
      await this.emailService.sendWelcomeEmail(msg.email, msg.name);
      this.logger.log(`Welcome email sent to ${msg.email}`);
    } catch (err) {
      this.logger.error(
        `Failed to send welcome email to ${msg.email}`,
        err as any
      );

      // remove idempotency key so the requeued job can acquire it again
      await this.redis.delete(key);

      const attempts = msg.attempts ?? 0;
      if (attempts < this.maxAttempts) {
        // schedule a retry using the configured RetryService -> it will republish with attempts++
        await this.retryService.handleRetry(
          attempts,
          this.maxAttempts,
          async (p: UserRegisteredMsg) =>
            this.producer.publishUserRegistered(p),
          { ...msg, attempts }
        );
        return;
      }

      // exhausted retries -> send to DLQ for manual inspection
      await this.producer.publishToDlq('user.registered', {
        ...msg,
        error: String(err),
      });

      throw err;
    }
  }
}
