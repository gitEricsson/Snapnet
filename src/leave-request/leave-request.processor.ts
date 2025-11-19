import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { LeaveStatus } from '../utils/common/constant/enum.constant';
import { LeaveRequestRepository } from './leave-request.repository';
import { RedisService } from '../redis/redis.service';
import { ProducerService } from '../job-queue/producer.service';
import { RetryService } from '../job-queue/retry.service';
import { LeaveRequestedMsg } from './interface/leave-requested-msg.interface';

@Injectable()
export class LeaveRequestProcessor {
  private readonly logger = new Logger(LeaveRequestProcessor.name);
  private readonly exchange = 'workforce.events';
  private readonly queue = 'leave.requests';
  private readonly maxAttempts = 5;

  constructor(
    private readonly leaveRepo: LeaveRequestRepository,
    private readonly redis: RedisService,
    private readonly producer: ProducerService,
    private readonly retryService: RetryService
  ) {}

  // subscribe to leave.requested
  @RabbitSubscribe({
    exchange: 'workforce.events',
    routingKey: 'leave.requested',
    queue: 'leave.requests',
    queueOptions: { durable: true },
  })
  public async handleLeaveRequested(msg: LeaveRequestedMsg) {
    this.logger.log(`Received leave.requested requestId=${msg.requestId}`);
    // idempotency: ensure we only process once (setNX)
    const idempotencyKey = `leave:processed:${msg.requestId}`;
    const acquired = await this.redis.setNxExpire(idempotencyKey, '1', 60 * 60); // 1 hour
    if (!acquired) {
      this.logger.log(
        `Skipping already-processed leave request ${msg.requestId}`
      );
      return;
    }

    try {
      const start = new Date(msg.startDate);
      const end = new Date(msg.endDate);
      const msPerDay = 1000 * 60 * 60 * 24;
      const days = Math.ceil((end.getTime() - start.getTime()) / msPerDay) + 1;

      const newStatus =
        days <= 2 ? LeaveStatus.APPROVED : LeaveStatus.PENDING_APPROVAL;

      const updated = await this.leaveRepo.updateStatus(
        msg.requestId,
        newStatus
      );
      this.logger.log(`Leave ${msg.requestId} updated to ${newStatus}`);

      // If moved to PENDING_APPROVAL we might publish an escalation message, for now we log.
      // Optionally publish events for other services:
      await this.producer.publishLeaveRequested({
        requestId: msg.requestId,
        processedAt: new Date().toISOString(),
        status: newStatus,
      });
    } catch (err) {
      this.logger.error(
        `Error processing leave.requested id=${msg.requestId}`,
        err as any
      );
      // Retry logic
      const attempts = msg.attempts ?? 0;
      const willRetry = attempts < this.maxAttempts;
      if (willRetry) {
        const payload = { ...msg, attempts };
        const republished = await this.retryService.handleRetry(
          attempts,
          this.maxAttempts,
          async (p) => this.producer.publishLeaveRequested(p),
          payload
        );
        if (!republished) {
          // fallthrough to DLQ
          await this.producer.publishToDlq('leave.requested', {
            ...msg,
            error: String(err),
          });
        }
      } else {
        // publish to DLQ
        await this.producer.publishToDlq('leave.requested', {
          ...msg,
          error: String(err),
        });
      }
    }
  }
}
