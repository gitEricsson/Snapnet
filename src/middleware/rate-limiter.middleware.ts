import {
  Injectable,
  NestMiddleware,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const ip = req.ip;
    const key = `rate_limit:${ip}`;

    const count = (await this.cacheManager.get<number>(key)) || 0;
    const maxRequests = this.configService.getOrThrow<number>('rateLimit.max');

    if (count >= maxRequests) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const windowMs = this.configService.get<number>('rateLimit.windowMs');
    await this.cacheManager.set(key, count + 1, windowMs);

    next();
  }
}
