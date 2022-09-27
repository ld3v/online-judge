import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as  moment from 'moment';
import "moment-timezone";
import { AppModule } from './app.module';
import CustomLogger from './logger/customLogger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT');
  moment.tz.setDefault("Asia/Ho_Chi_Minh");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors({
    origin: ['https://wecode.nqhuy.dev', 'http://localhost:11000'],
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'sentry-trace', 'Authorization'],
    // credentials: true,
    maxAge: 30,
  });
  app.useLogger(app.get(CustomLogger));
  app.use(cookieParser());
  await app.listen(port);
  console.info(`Running with port ${port}`);
}
bootstrap();
