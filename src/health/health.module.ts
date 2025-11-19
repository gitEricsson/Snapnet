import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '../utils/common/config/config.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '../utils/common/config/config.service';

@Module({
  imports: [
    RedisModule,
    ConfigModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        exchanges: [
          {
            name: config.rabbitmqExchange,
            type: 'topic',
          },
        ],
        uri: config.rabbitmqUrl,
        connectionInitOptions: { wait: true, reject: false },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}