import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { ProblemModule } from 'src/problem/problem.module';
import { SubmissionController } from './submission.controller';
import { SubmissionRepository } from './submission.repository';
import { SubmissionService } from './submission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionRepository]),
    forwardRef(() => AssignmentModule),
    ProblemModule,
    AccountModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
