import { Module } from '@nestjs/common';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { ProblemModule } from 'src/problem/problem.module';
import { SubmissionModule } from 'src/submission/submission.module';
import { ScoreboardController } from './scoreboard.controller';
import { ScoreboardService } from './scoreboard.service';

@Module({
  imports: [
    AssignmentModule,
    ProblemModule,
    SubmissionModule,
  ],
  controllers: [ScoreboardController],
  providers: [ScoreboardService]
})
export class ScoreboardModule {}
