import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '../config.service';
import { DepartmentEntity } from '../../../../department/department.entity';
import { EmployeeEntity } from '../../../../employee/employee.entity';
import { LeaveRequestEntity } from '../../../../leave-request/leave-request.entity';
import { BaseUserEntity } from '../../../../base-user/base-user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: Number(configService.get<number>('DB_PORT') ?? 3306),
        username: configService.get<string>('DB_USERNAME') ?? 'root',
        password: configService.get<string>('DB_PASSWORD') ?? '',
        database: configService.get<string>('DB_NAME') ?? 'snapnet',
        entities: [DepartmentEntity, EmployeeEntity, LeaveRequestEntity, BaseUserEntity],
        synchronize: false,
        migrationsRun: true,
        logging: configService.nodeEnv !== 'production',
        extra: {
          connectionLimit: 10,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
