import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  private static instance: ConfigService;

  constructor(private nestConfigService: NestConfigService) {
    if (ConfigService.instance) {
      return ConfigService.instance;
    }
    ConfigService.instance = this;
  }

  get databaseHost(): string {
    return this.nestConfigService.get<string>('DB_HOST') ?? 'localhost';
  }

  get databasePort(): number {
    return Number(this.nestConfigService.get<number>('DB_PORT') ?? 3306);
  }

  get databaseUsername(): string {
    return this.nestConfigService.get<string>('DB_USERNAME') ?? 'root';
  }

  get databasePassword(): string {
    return this.nestConfigService.get<string>('DB_PASSWORD') ?? '';
  }


  get databaseName(): string {
    return this.nestConfigService.get<string>('DB_NAME') ?? 'snapnet';
  }
  get databaseUrl(): string {
    return this.nestConfigService.get<string>('DATABASE_URL');
  }

  get appUrl(): string {
    return this.nestConfigService.get<string>('APP_URL') || 'http://localhost';
  }

  get jwtSecret(): string {
    return this.nestConfigService.get<string>('JWT_SECRET');
  }

  get jwtExpirationTime(): string {
    return this.nestConfigService.get<string>('JWT_EXPIRATION_TIME') || '1h';
  }

  get port(): number {
    return this.nestConfigService.get<number>('PORT') || 3000;
  }

  get nodeEnv(): string {
    return this.nestConfigService.get<string>('NODE_ENV') || 'development';
  }

  // Redis configuration
  get redisHost(): string {
    return this.nestConfigService.get<string>('REDIS_HOST') || 'localhost';
  }

  get redisPort(): number {
    return this.nestConfigService.get<number>('REDIS_PORT') || 6379;
  }

  get redisUsername(): string | undefined {
    return this.nestConfigService.get<string>('REDIS_USERNAME');
  }

  get redisPassword(): string | undefined {
    return this.nestConfigService.get<string>('REDIS_PASSWORD');
  }

  get redisDb(): number {
    return this.nestConfigService.get<number>('REDIS_DB') || 0;
  }

  // Mail configuration
  get mailHost(): string {
    return this.nestConfigService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
  }

  get mailPort(): number {
    return this.nestConfigService.get<number>('SMTP_PORT') || 587;
  }

  get mailUsername(): string {
    return this.nestConfigService.get<string>('SMTP_USER') || '';
  }

  get mailPassword(): string {
    return this.nestConfigService.get<string>('SMTP_PASS') || '';
  }

  get mailFrom(): string {
    return (
      this.nestConfigService.get<string>('SMTP_FROM') || 'noreply@egwu.com'
    );
  }

  get appName(): string {
    return this.nestConfigService.get<string>('APP_NAME') || 'Snapnet';
  }

  get adminEmail(): string {
    return (
      this.nestConfigService.get<string>('ADMIN_EMAIL') || 'admin@snapnet.com'
    );
  }

  // JWT configuration
  get jwtAccessSecret(): string {
    return this.nestConfigService.get<string>('JWT_ACCESS_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.nestConfigService.get<string>('JWT_REFRESH_SECRET');
  }

  get jwtAccessExpiry(): string {
    return this.nestConfigService.get<string>('JWT_ACCESS_EXPIRY');
  }

  get jwtRefreshExpiry(): string {
    return this.nestConfigService.get<string>('JWT_REFRESH_EXPIRY');
  }

  // Auth tokens TTL (in seconds)
  get accessTokenTtl(): number {
    return this.nestConfigService.get<number>('ACCESS_TOKEN_TTL') || 3600; // 1 hour
  }

  get refreshTokenTtl(): number {
    return this.nestConfigService.get<number>('REFRESH_TOKEN_TTL') || 604800; // 7 days
  }

  // Cache configuration
  get cacheMaxItems(): number {
    return this.nestConfigService.get<number>('CACHE_MAX_ITEMS') || 1000;
  }

  // Rate limit configuration
  get rateLimitMaxRequests(): number {
    return this.nestConfigService.get<number>('RATE_LIMIT_MAX_REQUESTS') || 3;
  }

  get rateLimitWindowMs(): number {
    return this.nestConfigService.get<number>('RATE_LIMIT_WINDOW_MS') || 60000; // 1 minute
  }

  // Return the default TTL for a given key
  get defaultTTL(): number {
    return this.nestConfigService.get<number>('DEFAULT_TTL') || 60000;
  }

  get cacheTTL(): number {
    return this.nestConfigService.get<number>('CACHE_TTL') || 60000;
  }

  get rabbitmqExchange(): string {
    return (
      this.nestConfigService.get<string>('RABBITMQ_EXCHANGE') ||
      'workforce.events'
    );
  }

  get rabbitmqUrl(): string {
    return (
      this.nestConfigService.get<string>('RABBITMQ_URL') ||
      'amqp://guest:guest@localhost:5672'
    );
  }

  get rabbitmqDlq(): string {
    return (
      this.nestConfigService.get<string>('RABBITMQ_DLQ') || 'leave.requests.dlq'
    );
  }

  get retryStrategy(): string {
    return (
      this.nestConfigService.get<string>('RETRY_STRATEGY') || 'exponential'
    );
  }

  get retryFixedDelayMs(): number {
    return Number(
      this.nestConfigService.get<number>('RETRY_FIXED_DELAY_MS') ?? 2000
    );
  }

  get retryBaseMs(): number {
    const base = Number(
      this.nestConfigService.get<number>('RETRY_BASE_MS') ?? 1000
    );
    return base;
  }

  get retryCapMs(): number {
    const cap = Number(
      this.nestConfigService.get<number>('RETRY_CAP_MS') ?? 30000
    );
    return cap;
  }

  get emailMaxRetries(): number {
    return Number(this.nestConfigService.get<number>('EMAIL_MAX_RETRIES') ?? 5);
  }

  // Generic getter method for any config value
  get<T = any>(key: string): T {
    return this.nestConfigService.get<T>(key);
  }
}
