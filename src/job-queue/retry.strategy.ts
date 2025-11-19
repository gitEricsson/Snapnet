import { Injectable } from '@nestjs/common';

export interface RetryStrategy {
  getDelay(attempt: number): number;
}

@Injectable()
export class FixedRetryStrategy implements RetryStrategy {
  constructor(private readonly delayMs = 2000) {}
  getDelay(_: number) {
    return this.delayMs;
  }
}

@Injectable()
export class ExponentialRetryStrategy implements RetryStrategy {
  constructor(
    private readonly baseMs = 1000,
    private readonly capMs = 30000
  ) {}
  getDelay(attempt: number) {
    const delay = Math.min(this.capMs, this.baseMs * Math.pow(2, attempt - 1));
    return delay;
  }
}
