import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  use(req: Request, res: Response, next: (error?: unknown) => void) {
    const { method, url } = req;

    const timestamp = new Date().toISOString();
    res.on('finish', () => {
      const { statusCode } = res;
      this.logger.log(
        `"Request [${method}] ${url} ${statusCode} ${timestamp}"`,
      );
    });
    next();
  }
}
