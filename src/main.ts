import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './utils/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './utils/common/filters/http-exception.filter';
import { ConfigService } from './utils/common/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const logger = new Logger('Bootstrap');

  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
            transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // app.useGlobalInterceptors(app.get(TransformInterceptor));
  // app.useGlobalFilters(app.get(HttpExceptionFilter));

  const config = new DocumentBuilder()
    .setTitle('Workforce Management API')
    .setDescription('APIs for managing departments, employees, and leave requests')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'X-API-KEY')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.port;
  const appUrl = configService.appUrl || 'http://localhost';
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
  logger.log(`API Documentation available at: ${appUrl}/api/docs`);
}

bootstrap();
