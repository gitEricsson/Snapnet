import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

export interface IResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  service: string;
  version: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IResponse> {
  constructor(private readonly configService: ConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse> {
    const request = context.switchToHttp().getRequest();
    const timestamp = new Date().toISOString();

    return next.handle().pipe(
      map((data) => {
        const { statusCode, message, ...rest } = data;
        const response: IResponse = {
          statusCode: statusCode || 200,
          message: message || 'Success',
          timestamp,
          path: request.url,
          service: this.configService.getOrThrow<string>('app.name'),
          version: this.configService.getOrThrow<string>('app.version'),
          ...rest,
        };

        return response;
      }),
    );
  }
}
