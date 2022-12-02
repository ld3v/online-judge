import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Queue } from 'bull';
import { AssignmentService } from 'src/assignment/assignment.service';
import RequestWithAccount from 'src/auth/dto/reqWithAccount.interface';
import JwtAuthGuard from 'src/auth/gaurd/jwtAuth.gaurd';
import { LanguageService } from 'src/language/language.service';
import { ProblemService } from 'src/problem/problem.service';
import { Queue as QueueEntity } from 'src/queue/entities/queue.entity';
import { QueueName } from 'src/queue/queue.enum';
import { QueueService } from 'src/queue/queue.service';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { isAdmin } from 'utils/func';
import CreateDto from './dto/create.dto';
import { SubmissionService } from './submission.service';
import { IAddSubmission, SubmissionFilter } from './submission.types';

@Controller('submission')
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly assignmentService: AssignmentService,
    private readonly problemService: ProblemService,
    private readonly languageService: LanguageService,
    @InjectQueue('submission')
    private readonly submissionQueue: Queue,
    private readonly queueService: QueueService,
  ) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async get(
    @Req() { user }: RequestWithAccount,
    @Query() { assignmentId, langId, problemId, accountId, page, limit }: SubmissionFilter) {
    try {
      const queryParams = isAdmin(
        user,
        { assignmentId, langId, problemId, accountId, page, limit },
        { assignmentId, page, limit },
      );
      let assignmentData = undefined;
      if (assignmentId) {
        const assData = await this.assignmentService.getById(assignmentId, false);
        assignmentData = assData
          ? {
            id: assData.id,
            name: assData.name,
          }
          : undefined;
      }
      const { data, total } = await this.submissionService.get(queryParams);
      const dataTransformed = data.map(({ assignment, submitter, problem, ...dataItem}) => {
        // const assignmentTransformed = this.assignmentService.transformData(assignment)[0];
        // const problemTransformed = this.problemService.transformData(user, problem)[0];
        // const accountTransformed = this.accountService.transformAccountData(user, submitter)[0];
        // Only return enough data
        return {
          submitter: {
            id: submitter.id,
            display_name: submitter.display_name,
          },
          problem: {
            id: problem.id,
            name: problem.name,
          },
          assignmentId: assignment.id,
          ...dataItem,
        };
      })
      // Authorize for user, admin
      return {
        data: dataTransformed,
        assignment: assignmentData,
        total,
      };
    } catch (err) {
      throw err;
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createSubmission (
    @Req() { user }: RequestWithAccount,
    @Body() data: CreateDto,
  ) {
    try {
      // Get and check exist input
      const assignment = await this.assignmentService.getById(data.assignmentId);
      const { problem } = await this.problemService.getById(data.problemId);
      const language = await this.languageService.getByExtension(data.languageExtension);
      // Get 'score' from Assignment-Problem relation.
      const assProb = await this.assignmentService.getAssProbByAssAndProb(assignment, problem);
      if (!assProb) {
        throw new Http400Exception('submission.assignment-problem.notfound', {
          msg: 'The problem that you try to solve, is NOT IN any assignments!'
        })
      }

      // Get 'timeLimit' & 'memoryLimit' from Problem-Language relation.
      const probLang = await this.problemService.getProbLangByProbAndLang(problem, language);
      if (!probLang) {
        throw new Http400Exception('submission.language.not-allowed', {
          msg: 'The language you use to solve the problem is NOT ALLOWED for this assignment!'
        })
      }

      const queueId = QueueEntity.genId();
      const newQueue = await this.queueService.add({
        id: queueId,
        name: QueueName.Submission,
      });
      const { coefficient } = this.assignmentService.getCoefficient(
        assignment.coefficient_rules ? JSON.parse(assignment.coefficient_rules) : [],
        assignment.extra_time,
        assignment.finish_time
      );
      // Add submission to db
      const submissionData: IAddSubmission = {
        assignment,
        problem,
        language,
        coefficient: `${coefficient}`,
        queue: newQueue,
        code: data.code,
      };
      const addSubmit = await this.submissionService.create(
        submissionData,
        user,
        newQueue,
        language.extension,
      );
      // Add job to queue
      const timeLimit = Math.round(probLang.time_limit) / 1000;
      const timeLimitInt = Math.floor(timeLimit) + 1;

      await this.submissionQueue.add(
        'submission',
        {
          username: user.username,
          filename: `solution_${addSubmit.id}`,
          fileExtension: language.extension,
          problemId: problem.id,
          submissionId: addSubmit.id,
          timeLimit,
          timeLimitInt,
          memoryLimit: probLang.memory_limit,
          diffCmd: problem.diff_cmd,
          diffArg: problem.diff_arg,
          problemScore: assProb.score,
        },
        { jobId: queueId }
      );

      // Return data
      return {
        id: addSubmit.id,
        queueState: addSubmit.queue.state,
        createdAt: addSubmit.created_at,
      };
    } catch (err) {
      throw err;
    }
  }
}
