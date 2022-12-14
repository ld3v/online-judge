import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import { Account } from 'src/account/entities/account.entity';
import { Queue as QueueEntity } from 'src/queue/entities/queue.entity';
import { Assignment } from 'src/assignment/entities/assignment.entity';
import { addFile, getFileContent } from 'common/file.helper';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { Http503Exception } from 'utils/Exceptions/http503.exception';
import { Submission } from './entities/submission.entity';
import { SubmissionRepository } from './submission.repository';
import { IAddSubmission, SubmissionFilter } from './submission.types';
import CustomLogger from 'src/logger/customLogger';
import { USER_SOLUTIONS_PATH } from 'utils/constants/path';
import { Problem } from 'src/problem/entities/problem.entity';



@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(SubmissionRepository)
    private readonly submissionRepository: SubmissionRepository,
    private readonly logger: CustomLogger,
  ) {}

  /**
   * Upload with code (**code is text**)
   * 
   * This func will create a new submission, add a new job to queue to run code.
   * @param {IAddSubmission} data Data to create a new submission
   * @param {Account} submitter Who submit
   * @returns 
   */
  public async create (data: IAddSubmission, submitter: Account, queue: QueueEntity, fileExt: string) {
    const newSubmission = new Submission();
    newSubmission.assignment = data.assignment;
    newSubmission.problem = data.problem;
    newSubmission.language = data.language;
    newSubmission.submitter = submitter;
    newSubmission.queue = queue;
    newSubmission.coefficient = data.coefficient;
    newSubmission.id = Submission.genId();
    // Handle write code to file
    const userSolutionFile = `solution_${newSubmission.id}.${fileExt}`;
    await this.createCodeFile(
      data.code,
      path.join(USER_SOLUTIONS_PATH, submitter.username),
      userSolutionFile,
    );
    this.logger.log(
      'Saved code to file: ' +
      path.join(USER_SOLUTIONS_PATH, submitter.username, userSolutionFile)
    );
    return await this.submissionRepository.save(newSubmission);
  }

  /**
   * Update all of coefficient in submission.
   * --
   * This func will be run when anyone update `start_time`, `finish_time` & `late_rule` in assignment.
   * @param assignment Assignment, which updated
   * @param coefficient Value, which calculated by `start`, `finish` & `rule` in assignment.
   * @returns {Submission[]} Submissions if success.
   */
  public async updateCoefficientForAll(assignment: Assignment, coefficient: string): Promise<Submission[]> {
    const submissions = await this.submissionRepository.find({ assignment });
    const submissionsNeedUpdate = submissions.map(sms => ({ ...sms, coefficient }));
    return await this.submissionRepository.save(submissionsNeedUpdate);
  }

  public async getById(id: string, showErrIfErr: boolean = true): Promise<Submission> {
    const submission = await this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "account")
      .leftJoinAndSelect("sub.language", "lang")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment")
      .leftJoinAndSelect("sub.queue", "queue")
      .where("sub.id = :id", { id })
      .getOne();
    if (!submission && showErrIfErr) {
      throw new Http400Exception('submission.notfound', {
        notFoundId: id,
      });
    }
    return submission;
  }

  public async get({
    problemId,
    assignmentId,
    accountId,
    langId,
    page,
    limit
  }: SubmissionFilter): Promise<{ data: Submission[], total: number }> {
    let submissionsQuery = this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "account")
      .leftJoinAndSelect("sub.language", "lang")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment")
      .orderBy("sub.created_at", "DESC");
    if (problemId) {
      submissionsQuery = submissionsQuery.andWhere("problem.id = :problemId", { problemId });
    }
    if (assignmentId) {
      submissionsQuery = submissionsQuery.andWhere("assignment.id = :assignmentId", { assignmentId });
    }
    if (accountId) {
      submissionsQuery = submissionsQuery.andWhere("account.id = :accountId", { accountId });
    }
    if (langId) {
      submissionsQuery = submissionsQuery.andWhere("lang.id = :langId", { langId });
    }
    const countItems = await submissionsQuery.getCount();
    // Pagination
    const pageSkip = Number(page) - 1;
    const limitItem = Number(limit);
    if (!Number.isNaN(pageSkip) && !Number.isNaN(limitItem) && limitItem > 0 && pageSkip >= 0) {
      submissionsQuery = submissionsQuery.skip(limitItem * pageSkip).take(limitItem);
    }
    const submissions =  await submissionsQuery.getMany();
    return {
      data: submissions,
      total: countItems,
    }
  }

  public async updateResultAfterTest(submissionId: string, output: string | number, result: string = '', isShowErrIfErr: boolean = false) {
    const submission = await this.submissionRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.submitter', 'account')
      .leftJoinAndSelect('s.problem', 'problem')
      .where('s.id = :submissionId', { submissionId })
      .getOne();
    let preScore = 0;
    if (!submission) {
      if (isShowErrIfErr) {
        throw new Http503Exception('submission.notfound', { notFoundId: submissionId });
      }
      return false;
    }
    submission.result = result || submission.result;
    if (Number.isNaN(Number(output))) {
      submission.pre_score = 0;
      submission.result = `Tester: ${output}\n${submission.result}`;
    } else {
      submission.pre_score = Number(output);
      preScore = Number(output);
    }
    // Update final
    const finalSubmission = await this.getFinalSubmission(submission.problem, submission.submitter);
    if (
      !finalSubmission ||
      finalSubmission.pre_score < preScore ||
      finalSubmission.pre_score * Number(finalSubmission.coefficient) < preScore * Number(submission.coefficient)
    ) {
      submission.is_final = true;

      if (finalSubmission) {
        finalSubmission.is_final = false;
        await this.submissionRepository.save(finalSubmission);
      }
    }
    await this.submissionRepository.save(submission);
    return true;
  }

  // [FINAL SUBMISSION] - All services, which reference to FINAL SUBMISSION.

  public async getFinalSubmissions(assignment: Assignment) {
    const submissions = await this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "account")
      .leftJoinAndSelect("sub.language", "lang")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment")
      .leftJoinAndSelect("sub.queue", "queue")
      .where("assignment.id = :assignmentId AND sub.is_final = true", { assignmentId: assignment.id })
      .getMany();
    return submissions;
  }

  public async getFinalSubmission(problem: Problem, user: Account) {
    const submission = await this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "account")
      .leftJoinAndSelect("sub.language", "lang")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment")
      .leftJoinAndSelect("sub.queue", "queue")
      .where(
        "problem.id = :problemId AND account.id = :accountId AND sub.is_final = true",
        {
          accountId: user.id,
          problemId: problem.id,
        }
      )
      .orderBy('sub.created_at', 'DESC')
      .getOne();
    return submission;
  }
  
  public async updateFinalSubmission(submission: Submission) {
    // Get and remove current final, if exist.
    const currentFinal = await this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "account")
      .leftJoinAndSelect("sub.language", "lang")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment")
      .where(
        "assignment.id = :assignmentId AND problem.id = :problemId AND sub.is_final = true",
        {
          assignmentId: submission.assignment.id,
          problemId: submission.problem.id,
        }
      )
      .getOne();
    if (currentFinal) {
      if (currentFinal.id === submission.id) {
        return currentFinal;
      }
      currentFinal.is_final = false;
      await this.submissionRepository.save(currentFinal);
    }
    // Update new final
    submission.is_final = true;
    return await this.submissionRepository.save(submission);
  }

  public async countSubGroupByAccountProblem(assignment: Assignment) {
    try {

    } catch (err) {
      console.error(`Something went wrong while counting subs, which grouped by "accountId" & "problemId" for assignment(${assignment.id}):`, err);
      throw new Http503Exception('feature:submission.count-subs.account-problem');
    }
    const tmp = await this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "submitter")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment")
      .andWhere("assignment.id = :assignmentId", { assignmentId: assignment.id })
      .select(["submitter.id as account_id", "problem.id as problem_id", "COUNT (*) AS subs_count"])
      .groupBy("submitter.id, problem.id")
      .getMany();
    const accountResult = {};
    tmp.forEach((item: any) => {
      // Init if not exist
      if (!accountResult[item.submitter.id]) {
        accountResult[item.submitter.id] = {};
      }
      // if (!accountResult[item.submitter.id][item.problem.id]) {
      //   accountResult[item.submitter.id][item.problem.id] = {};
      // }

      accountResult[item.submitter.id][item.problem.id] = item.subs_count;
    })
    return accountResult;
  }

  public async getSubmissionCode (submission: Submission) {
    try {
      const submitter = submission.submitter.username;
      const langExt = submission.language.extension;
      const path = `./upload/user-solutions/${submitter}/solution_${submission.id}.${langExt}`;
      const content = await getFileContent(path, 'utf-8');
      return content;
    } catch (err) {
      console.error(`Error when reading code for submission (${submission.id}) at "${path}":`, err);
      return 'ERR: Code File not found!';
    }
  }

  /**
   * This func will create a new file from submit's code input.
   */
  private async createCodeFile (code: string, dirPath: string, filename: string = "solution") {
    try {
      const resCreateFile = await addFile(dirPath, filename, code);
      return resCreateFile;
    } catch (err) {
      console.error(err);
      throw new Http503Exception('submission.save-code.unknown', { err });
    }
  }
}
