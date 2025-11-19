import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule } from '../utils/common/config/config.module';
import { ConfigService } from '../utils/common/config/config.service';
import { ProducerService } from './producer.service';
import { RetryService } from './retry.service';
import { LeaveRequestProcessor } from '../leave-request/leave-request.processor';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
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
  providers: [
    ProducerService,
    RetryService,
    LeaveRequestProcessor,
    EmailProcessor,
  ],
  exports: [ProducerService],
})
export class MessagingModule {}
