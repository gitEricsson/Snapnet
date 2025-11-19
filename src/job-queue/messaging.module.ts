import { Module, forwardRef } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule } from '../utils/common/config/config.module';
import { ConfigService } from '../utils/common/config/config.service';
import { ProducerService } from './producer.service';
import { RetryService } from './retry.service';
import { LeaveRequestProcessor } from '../leave-request/leave-request.processor';
import { EmailProcessor } from './email.processor';
import { LeaveRequestModule } from '../leave-request/leave-request.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => LeaveRequestModule),
    EmailModule,
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