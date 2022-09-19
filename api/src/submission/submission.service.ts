import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from 'src/assignment/entities/assignment.entity';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { Http503Exception } from 'utils/Exceptions/http503.exception';
import { ISubmission } from 'utils/types';
import { Submission } from './entities/submission.entity';
import { SubmissionRepository } from './submission.repository';
import { SubmissionFilter } from './submission.types';



@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(SubmissionRepository)
    private readonly submissionRepository: SubmissionRepository,
  ) {}

  public async create (data: ISubmission) {
    const newSubmission = this.submissionRepository.create(data);
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
      .leftJoinAndSelect("sub.assignment", "assignment");
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
    if (!Number.isNaN(pageSkip) && !Number.isNaN(limitItem) && limit > 0 && Number(page) > 0) {
      submissionsQuery = submissionsQuery.limit(limit).skip(limit * (page - 1));
    }
    const submissions =  await submissionsQuery.getMany();
    return {
      data: submissions,
      total: countItems,
    }
  }

  // [FINAL SUBMISSION] - All services, which reference to FINAL SUBMISSION.

  public async getFinalSubmissions(assignment: Assignment) {
    const submissions = await this.submissionRepository.createQueryBuilder("sub")
      .leftJoinAndSelect("sub.submitter", "account")
      .leftJoinAndSelect("sub.language", "lang")
      .leftJoinAndSelect("sub.problem", "problem")
      .leftJoinAndSelect("sub.assignment", "assignment")
      .where("assignment.id = :assignmentId AND sub.is_final = true", { assignmentId: assignment.id })
      .getMany();
    return submissions;
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

  // public transformData()
}
