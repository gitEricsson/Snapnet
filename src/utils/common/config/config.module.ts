import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ConfigService } from './config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().optional(),
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().default(3306),
        DB_USERNAME: Joi.string().default('root'),
        DB_PASSWORD: Joi.string().allow(''),
        DB_NAME: Joi.string().default('snapnet'),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().default('1h'),
        ACCESS_TOKEN_TTL: Joi.number().default(3600),
        REFRESH_TOKEN_TTL: Joi.number().default(604800),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRY: Joi.string().required(),
        API_KEY: Joi.string().required(),
        CACHE_MAX_ITEMS: Joi.number().default(1000),
        CACHE_DEFAULT_TTL: Joi.number().default(300),
        CACHE_TTL: Joi.number().default(60000),
        // default TTL used by your getters
        DEFAULT_TTL: Joi.number().default(60000),

        SMTP_HOST: Joi.string().optional(),
        SMTP_PORT: Joi.number().default(587),
        SMTP_USER: Joi.string().optional(),
        SMTP_PASS: Joi.string().optional(),
        SMTP_FROM: Joi.string().optional(),
        RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
        RATE_LIMIT_WINDOW_MS: Joi.number().default(60000),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_USERNAME: Joi.string().optional(),
        REDIS_PASSWORD: Joi.string().optional(),
        REDIS_DB: Joi.number().default(0),
        REDIS_TTL_SECONDS: Joi.number().default(600),
        RABBITMQ_URL: Joi.string().default('amqp://guest:guest@localhost:5672'),
        RABBITMQ_EXCHANGE: Joi.string().default('workforce.events'),
        RABBITMQ_QUEUE: Joi.string().default('leave.requests'),
        RABBITMQ_DLQ: Joi.string().default('leave.requests.dlq'),
        RABBITMQ_PREFETCH: Joi.number().default(10),
        RETRY_STRATEGY: Joi.string()
          .valid('fixed', 'exponential')
          .default('exponential'),
        RETRY_MAX_ATTEMPTS: Joi.number().default(5),
        RETRY_DELAY_MS: Joi.number().default(3000),
        RETRY_FIXED_DELAY_MS: Joi.number().default(2000),
        RETRY_BASE_MS: Joi.number().default(1000),
        RETRY_CAP_MS: Joi.number().default(30000),
        APP_NAME: Joi.string().default('Snapnet'),
        APP_VERSION: Joi.string().default('1.0.0'),
        EMAIL_MAX_RETRIES: Joi.number().default(5),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
