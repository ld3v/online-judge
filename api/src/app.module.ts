import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database.module';
import { MailModule } from './mail/mail.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ProblemModule } from './problem/problem.module';
import { NotificationModule } from './notification/notification.module';
import { AssignmentModule } from './assignment/assignment.module';
import { LanguageModule } from './language/language.module';
import { SubmissionModule } from './submission/submission.module';
import { ScoreboardModule } from './scoreboard/scoreboard.module';
import { SettingModule } from './setting/setting.module';
import { LocalFileModule } from './files/localFile.module';
import { BullModule } from '@nestjs/bull';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
        REDIS_PORT: Joi.number().required(),
        APP_ACCOUNT_USER: Joi.string().required(),
        APP_ACCOUNT_PASS: Joi.string().required(),
        TEST_OUTPUT_DIRECTORY_PATH: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_DATE: Joi.string().required(),
        MAIL_UI_PORT: Joi.number().required(),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().required(),
        MAIL_USER: Joi.string().required(),
        MAIL_PASS: Joi.string().required(),
        MAIL_FROM: Joi.string().required(),
        MAINTENANCE: Joi.string().allow(""),
        AUTH_SECRET_STR: Joi.string().required(),
        JUDGE_URL: Joi.string().allow(""),
      }),
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
        },
      }),
      inject: [ConfigService],
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 30000,
        maxRedirects: 5,
      }),
    }),
    DatabaseModule,
    AccountModule,
    AuthModule,
    MailModule,
    AppModule,
    AssignmentModule,
    ProblemModule,
    NotificationModule,
    LanguageModule,
    SubmissionModule,
    ScoreboardModule,
    SettingModule,
    LocalFileModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
