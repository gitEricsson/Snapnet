import { Injectable, Logger } from '@nestjs/common';
import {
  RetryStrategy,
  ExponentialRetryStrategy,
  FixedRetryStrategy,
} from './retry.strategy';
import { ConfigService } from '../utils/common/config/config.service';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);
  private readonly strategy: RetryStrategy;

  constructor(private readonly config?: ConfigService) {
    // select strategy based on config (RETRY_STRATEGY = 'fixed' | 'exponential')
    const strategyName =
      this.config?.retryStrategy;

    if (strategyName === 'fixed') {
      const fixedDelay = Number(
        this.config?.retryFixedDelayMs ?? 2000
      );
      this.strategy = new FixedRetryStrategy(fixedDelay);
      this.logger.log(
        `RetryService configured with FixedRetryStrategy delay=${fixedDelay}ms`
      );
    } else {
      const base = this.config?.retryBaseMs ?? 1000;
      const cap = this.config?.retryCapMs ?? 30000;
      this.strategy = new ExponentialRetryStrategy(base, cap);
      this.logger.log(
        `RetryService configured with ExponentialRetryStrategy base=${base}ms cap=${cap}ms`
      );
    }
  }

  getDelay(attempt: number) {
    return this.strategy.getDelay(attempt);
  }

  async handleRetry<T extends Record<string, any>>(
    attempt: number,
    maxAttempts: number,
    publishFn: (payload: T) => Promise<void>,
    payload: T
  ): Promise<boolean> {
    if (attempt >= maxAttempts) {
      return false;
    }
    const delay = this.getDelay(attempt + 1);
    this.logger.log(`Scheduling retry #${attempt + 1} in ${delay}ms`);
    await new Promise((res) => setTimeout(res, delay));
    // increment attempt counter on payload so processors can see it
    (payload as any).attempts = attempt + 1;
    await publishFn(payload);
    return true;
  }
}
