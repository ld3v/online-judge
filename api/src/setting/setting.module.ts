import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { LanguageModule } from 'src/language/language.module';
import { LoggerModule } from 'src/logger/logger.module';
import { ProblemModule } from 'src/problem/problem.module';
import { QueueModule } from 'src/queue/queue.module';
import { SettingController } from './setting.controller';
import { SettingProcessor } from './setting.processor';
import { SettingRepository } from './setting.repository';
import { SettingService } from './setting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingRepository]),
    BullModule.registerQueue({ name: 'setting' }),
    forwardRef(() => AccountModule),
    AssignmentModule,
    LanguageModule,
    QueueModule,
    HttpModule,
    ConfigModule,
    LoggerModule,
    ProblemModule,
  ],
  controllers: [SettingController],
  providers: [SettingService, SettingProcessor],
  exports: [SettingService],
})
export class SettingModule {}
