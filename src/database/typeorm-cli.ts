import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';

config({
  path: path.join(__dirname, '../../.env'),
});

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get<string>('DB_USERNAME', 'root'),
  password: configService.get<string>('DB_PASSWORD', ''),
  database: configService.get<string>('DB_NAME', 'snapnet'),
  entities: [
    'src/**/*.entity.ts',
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: configService.get('NODE_ENV') !== 'production',
  extra: {
    connectionLimit: 10,
  },
});