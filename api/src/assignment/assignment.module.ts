import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { ProblemModule } from 'src/problem/problem.module';
import { ProblemService } from 'src/problem/problem.service';
import { AssignmentAccountRepository, AssignmentProblemRepository, AssignmentRepository } from './assignment.repository';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SubmissionModule } from 'src/submission/submission.module';
import { LoggerModule } from 'src/logger/logger.module';
import { SettingModule } from 'src/setting/setting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssignmentRepository, AssignmentProblemRepository, AssignmentAccountRepository]),
    forwardRef(() => SubmissionModule),
    forwardRef(() => SettingModule),
    forwardRef(() => AccountModule),
    ProblemModule,
    HttpModule,
    ConfigModule,
    LoggerModule,
  ],
  providers: [AssignmentService],
  controllers: [AssignmentController],
  exports: [AssignmentService],
})
export class AssignmentModule {}
