import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const testDbConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [join(__dirname, '../src/**/*.entity{.ts,.js}')],
  synchronize: true,
  dropSchema: true,
  logging: false,
};