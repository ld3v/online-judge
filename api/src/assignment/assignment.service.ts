import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { AccountService } from 'src/account/account.service';
import { Account } from 'src/account/entities/account.entity';
import CustomLogger from 'src/logger/customLogger';
import { Problem } from 'src/problem/entities/problem.entity';
import { ProblemService } from 'src/problem/problem.service';
import { TProblemWithAssignment } from 'src/problem/problem.types';
import { TJudgeAssignmentProblem } from 'src/setting/setting.utils';
import { Submission } from 'src/submission/entities/submission.entity';
import { SubmissionService } from 'src/submission/submission.service';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { Http506Exception } from 'utils/Exceptions/http506.exception';
import { array2Map } from 'utils/func';
import { FoundAndNotFoundResult, IAssignment, SuccessAndFailed } from 'utils/types';
import { AssignmentAccountRepository, AssignmentProblemRepository, AssignmentRepository } from './assignment.repository';
import { IAssignmentEntity, IAssignmentProblemInput, IAssignmentTransformed, ICoefficientInfo, TSearchQuery } from './assignment.types';
import { Assignment } from './entities/assignment.entity';
import { AssignmentAccount } from './entities/assignment_account.entity';
import { AssignmentProblem } from './entities/assignment_problem.entity';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(AssignmentRepository)
    private readonly assignmentRepository: AssignmentRepository,
    @InjectRepository(AssignmentAccountRepository)
    private readonly assignmentAccountRepository: AssignmentAccountRepository,
    @InjectRepository(AssignmentProblemRepository)
    private readonly assignmentProblemRepository: AssignmentProblemRepository,

    private readonly problemService: ProblemService,
    private readonly accountService: AccountService,
    private readonly submissionService: SubmissionService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger,
  ) {}

  public async create (data: IAssignment): Promise<Assignment> {
    const newProb = this.assignmentRepository.create(data);
    return await this.assignmentRepository.save(newProb);
  }

  public async createMulti (
    assignmentsInfo: {
      assignment: Assignment,
      judgeId: number;
      judgeProblems: TJudgeAssignmentProblem[];
      participantUsernames: string[]
    }[]
  ): Promise<SuccessAndFailed<Assignment> & {
    judgeAssIdMap2AssId: Record<number, string>,
    judgeAssIdMap2JudgeAssProblems: Record<number, TJudgeAssignmentProblem[]>
  }> {
    const judgeAssIdMap2AssId: Record<number, string> = {};
    const judgeAssIdMap2JudgeAssProblems: Record<number, TJudgeAssignmentProblem[]> = {};
    const createPromises = assignmentsInfo.map(async ({ assignment, judgeId, judgeProblems, participantUsernames }) => {
      try {
        const assCreated = await this.assignmentRepository.save(assignment);
        judgeAssIdMap2AssId[judgeId] = assCreated.id;
        judgeAssIdMap2JudgeAssProblems[judgeId] = judgeProblems;
        // Handle update participants for assignment
        const { found: accounts } = participantUsernames.length > 0
          ? await this.accountService.getByUsernames(participantUsernames, false)
          : { found: [] };
        if (accounts.length > 0) {
          await this.updateParticipants(assCreated, accounts);
        }
        return assCreated;
      } catch (err) {
        return err;
      }
    });
    const res = await Promise.all(createPromises);

    const success =  res.filter(r => !(r instanceof Error));
    const failed = res.filter(r => r instanceof Error);

    return {
      success,
      failed,
      judgeAssIdMap2AssId,
      judgeAssIdMap2JudgeAssProblems,
    };
  }

  public async update (curAss: Assignment, data: IAssignment): Promise<{ assignment: Assignment; coefficient?: string }> {
    // Update base data
    const updateData = {
      ...curAss,
      ...data,
    };
    // Update submissions's coefficient if 'rule', 'start_time, 'finish_time', or 'extra_time' changed.
    let coefficientValue = '0';
    if (
      curAss.late_rule !== data.late_rule ||
      curAss.start_time !== data.start_time ||
      curAss.finish_time !== data.finish_time ||
      curAss.extra_time !== data.extra_time
    ) {
      // Update submissions's coefficient.
      const { coefficient } = await this.getCoefficient(
        updateData.late_rule,
        updateData.extra_time,
        updateData.start_time,
        updateData.finish_time,
      );
      if (coefficient && coefficient !== "error") {
        coefficientValue = coefficient;
        await this.submissionService.updateCoefficientForAll(curAss, coefficient);
      } else {
        coefficientValue = undefined;
      }
    }
    const resUpdate = await this.assignmentRepository.save(updateData);
    return {
      assignment: resUpdate,
      coefficient: coefficientValue,
    };
  }

  public async updateById (id: string, data: IAssignment): Promise<Assignment> {
    const curAss = await this.assignmentRepository.findOne(id);
    // Update base data
    const updateProb = {
      ...curAss,
      ...data,
    };
    return await this.assignmentRepository.save(updateProb);
  }

  /**
   * This func is used to update participants in assignment
   * @param curAss Assignment need to update
   * @param participants Participant list need to update
   * @returns Participant if success.
   */
  public async updateParticipants (curAss: Assignment, participants: Account[]) {
    try {
      const allAssAcc = await this.assignmentAccountRepository.createQueryBuilder('assAcc')
        .leftJoinAndSelect('assAcc.account', 'account')
        .leftJoinAndSelect('assAcc.assignment', 'assignment')
        .where('assignment.id = :curAssId', { curAssId: curAss.id})
        .getMany();
      const participantIds = participants.map(p => p.id);
      const currentParticipantIds = allAssAcc.map(assAcc => assAcc.account.id);
      // Filter to remove current
      const relationIdsNeedRemove = allAssAcc.filter(assAcc => participantIds.includes(assAcc.account.id)).map(relation => relation.id);
      if (relationIdsNeedRemove.length > 0) {
        await this.assignmentAccountRepository.delete(relationIdsNeedRemove);
      }
      // Filter to create new
      const participantsNeedCreate = participants.filter(({ id }) => !currentParticipantIds.includes(id));
      const newParticipants = participantsNeedCreate.map(p => this.assignmentAccountRepository.create({
        assignment: curAss,
        account: p,
      }));
      await this.assignmentAccountRepository.save(newParticipants);
      return participants;
    } catch (err) {
      console.error('assignment.service/updateParticipants:', err);
      throw err;
    }
  }

  /**
   * This func is used to update problems in assignment
   * @param curAss Assignment need to update
   * @param {Problem[]} problems Problems list need to update (Query from problemIds)
   * @param {Record<string, IAssignmentProblemInput>} problemInputMapping Problems with `name` & `score`.
   * @returns Problems if success.
   */
  public async updateProblems (curAss: Assignment, problems: Problem[], problemInputMapping: Record<string, IAssignmentProblemInput>) {
    try {
      const ass = await this.assignmentRepository.findOne(curAss.id);
      const allAssProblems = await this.assignmentProblemRepository.createQueryBuilder('assProblem')
        .leftJoinAndSelect('assProblem.problem', 'problem')
        .leftJoinAndSelect('assProblem.assignment', 'assignment')
        .where('assignment.id = :curAssId', { curAssId: curAss.id})
        .getMany();
      const currentProblemIds = allAssProblems.map(assProblem => assProblem.problem.id);
      // Filter to remove current
      const relationIdsNeedRemove = allAssProblems
        .filter(assProblem => !problemInputMapping[assProblem.problem.id])
        .map(relation => relation.id);
      if (relationIdsNeedRemove.length > 0) {
        await this.assignmentProblemRepository.delete(relationIdsNeedRemove);
      }
      // Update exist
      const updateProblems = allAssProblems
        .filter(assProblem => problemInputMapping[assProblem.problem.id])
        .map((assProblem) => Object.assign(assProblem, {
          problem_name: problemInputMapping[assProblem.problem.id].name,
          ordering: problemInputMapping[assProblem.problem.id].ordering,
          score: problemInputMapping[assProblem.problem.id].score,
        }));
      // Filter to create new
      const problemsNeedCreate = problems.filter(({ id }) => !currentProblemIds.includes(id));
      const newProblems = problemsNeedCreate.map(p => this.assignmentProblemRepository.create({
        assignment: ass,
        problem: p,
        problem_name: problemInputMapping[p.id].name,
        score: problemInputMapping[p.id].score,
        ordering: problemInputMapping[p.id].ordering
      }));
      await this.assignmentProblemRepository.save(newProblems);
      await this.assignmentProblemRepository.save(updateProblems);
      return problems;
    } catch (err) {
      console.error('assignment.service/updateProblems:', err);
      throw err;
    }
  }

  public async delete (ass: Assignment): Promise<number> {
    const res = await this.assignmentRepository.delete(ass.id);
    if (!res.affected) {
      throw new Http400Exception('assignment.notfound');
    }
    // Delete reference relations
    await this.assignmentAccountRepository.delete({
      assignment: ass,
    });
    await this.assignmentProblemRepository.delete({
      assignment: ass,
    });
    return res.affected;
  }

  /**
   * ## DANGER
   * This func will **REMOVE** all of assignment in the current system!
   */
  public async removeAll (): Promise<Assignment[]> {
    const assignmentNeedRemove = await this.assignmentRepository.find();
    const res = await this.assignmentRepository.remove(assignmentNeedRemove);
    return res;
  }

  /**
   * This func is used to get assignment by its ID.
   * @param {string} id Assignment's ID
   * @param {boolean} showErrIfErr Is show err when not found? Default is `true`.
   * @returns Assignment if found.
   */
  public async getById(id: string, showErrIfErr: boolean = true) {
    try {
      const curAss = await this.assignmentRepository.createQueryBuilder('assignment')
        .leftJoinAndSelect('assignment.accounts', 'participant')
        .leftJoinAndSelect('participant.account', 'account')
        .leftJoinAndSelect('assignment.problems', 'assignment_problem')
        .leftJoinAndSelect('assignment_problem.problem', 'problem')
        .orderBy('assignment_problem.ordering', 'ASC')
        .where('assignment.id = :id', { id })
        .getOne();
      if (!curAss && showErrIfErr) {
        throw new Http400Exception('assignment.notfound', {
          notFoundId: `${id}`,
        });
      }
      const assignmentsWithCoef = await this.joinCoefficient([curAss]);
      return assignmentsWithCoef[0]
    } catch (err) {
      throw err;
    }
  }
  
  public async getByIds(ids: string[], showErrIfErr: boolean = true): Promise<FoundAndNotFoundResult<Assignment>> {
    const assignmentItems = await this.assignmentRepository.createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.accounts', 'participants')
      .leftJoinAndSelect('assignment.problems', 'problems')
      .where("assignment.id IN (:...ids)", { ids })
      .getMany();
    const assignmentFoundIds = assignmentItems.map(problem => problem.id);
    const assignmentNotFoundIds = ids.filter(id => !assignmentFoundIds.includes(id));

    if (showErrIfErr && assignmentNotFoundIds.length > 0) {
      throw new Http400Exception('assignment.notfound', {
        notFoundKeys: assignmentNotFoundIds,
      });
    }

    return {
      found: assignmentItems,
      foundKeys: assignmentFoundIds,
      notFoundKeys: assignmentNotFoundIds,
    };
  }

  /**
   * This func is used to get all of assignments in system.
   * @param participant Account use to filter result
   * @param {string[]} exceptIds Result without assignment's id in [...exceptIds].
   * @param {boolean} withCoef Calculate & return with coefficient. Default is `true`.
   * @param {boolean} withTransform Transform data to public. Default is `true`.
   * @returns 
   */
  public async getAll(participant: Account = null, { keyword, exceptIds, page, limit }: TSearchQuery = {}, withCoef: boolean = true, withTransform: boolean = true) {
    let assignmentQuery = this.assignmentRepository.createQueryBuilder("assignment")
      .leftJoinAndSelect('assignment.accounts', 'participants')
      .leftJoinAndSelect('participants.account', 'account')
      .leftJoinAndSelect('assignment.submissions', 'submissions')
      .leftJoinAndSelect('assignment.problems', 'problems')
      .leftJoinAndSelect('problems.problem', 'problem');
    if (participant) {
      assignmentQuery = assignmentQuery.andWhere(
        '(account.id = :participantId OR assignment.is_public = true)',
        { participantId: participant.id }
      );
    }
    if (keyword) {
      assignmentQuery = assignmentQuery.andWhere(
        '(assignment.name ILIKE :keyword OR assignment.description ILIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }
    if (Array.isArray(exceptIds) && exceptIds.length > 0) {
      assignmentQuery = assignmentQuery.andWhere(
        'assignment.id NOT IN (:...exceptIds)',
        { exceptIds }
      )
    }
    const countItems = await assignmentQuery.getCount();
    // Pagination
    const pageSkip = Number(page) - 1;
    const limitItem = Number(limit);
    if (!Number.isNaN(pageSkip) && !Number.isNaN(limitItem) && limit > 0 && Number(page) > 0) {
      assignmentQuery = assignmentQuery.limit(limit).skip(limit * (page - 1));
    }

    let assignments = await assignmentQuery.getMany();
    if (withCoef) {
      assignments = await this.joinCoefficient(assignments);
    }
    return {
      data: withTransform ? this.transformData(...assignments) : assignments,
      total: countItems,
    };
  }

  // Problems
  public async getProblemWithAssignment(assignment: Assignment): Promise<TProblemWithAssignment[]> {
    const assProblems = await this.assignmentProblemRepository.createQueryBuilder('assProblem')
      .leftJoinAndSelect("assProblem.assignment", "assignment")
      .leftJoinAndSelect("assProblem.problem", "problem")
      .where('assignment.id = :id', { id: assignment.id })
      .orderBy('assProblem.ordering')
      .getMany();
    if (assProblems.length === 0) {
      return [];
    }
    const problemWithAssData = assProblems.map(assProblem => ({
      id: assProblem.problem.id,
      name: assProblem.problem.name,
      content: assProblem.problem.content,
      problemName: assProblem.problem_name,
      score: assProblem.score,
    }));;
    return problemWithAssData;
  }

  public async getProblemsByAssignment(assignment: Assignment): Promise<TProblemWithAssignment[]> {
    try {
      const problemWithAssData = await this.getProblemWithAssignment(assignment);
      const { map: problemWithAssMapping } = array2Map<TProblemWithAssignment>(problemWithAssData, "id");

      // Problem status (Line 94-107: wecode/controller/View_problem.php)
      const subs = await this.submissionService.getFinalSubmissions(assignment);
      subs.forEach(finalSub => {
        if (finalSub.status === 'PENDING') {
          problemWithAssMapping[finalSub.problem.id].status = 'secondary';
          return;
        }
        if (finalSub.pre_score == 10000) {
          problemWithAssMapping[finalSub.problem.id].status = 'success';
          return;
        }
        problemWithAssMapping[finalSub.problem.id].status = 'danger';
      });

      return Object.values(problemWithAssMapping);
    } catch (err) {
      throw err;
    }
  }

  // Other
  // Transform assignment to public data
  public transformData(...assignments: IAssignmentEntity[]): IAssignmentTransformed[] {
    return assignments.map((assignment: IAssignmentEntity) => {
      const { problems, accounts, submissions, ...info } = assignment;
      // Problems
      const problemData = (Array.isArray(problems) && problems.length > 0) ? problems.map((assProb: AssignmentProblem) => ({
          id: assProb.problem.id,
          ordering: assProb.ordering,
          name: assProb.problem.name,
          problemName: assProb.problem_name,
          score: assProb.score,
        })) : [];
      // Participants
      const participantData = (Array.isArray(accounts) && accounts.length > 0) ? accounts.map((assAcc: AssignmentAccount) => ({
        id: assAcc.account.id,
        displayName: assAcc.account.display_name,
      })) : [];
      // Submissions
      const submissionData = (Array.isArray(submissions) && submissions.length > 0) ? submissions.map((sub: Submission) => ({
        id: sub.id,
      })) : [];
      return {
        id: info.id,
        name: info.name,
        description: info.description,
        startTime: info.start_time,
        finishTime: info.finish_time,
        extraTime: info.extra_time,
        lateRule: info.late_rule,
        open: info.open,
        createdAt: info.created_at,
        coefficient: info.coefficient,
        finished: info.finished,
        problems: problemData,
        participants: participantData,
        submissions: submissionData,
      };
    });
  }

  // Transform assignment-problem

  /**
   * Add coefficient to each assignment.
   * @param assignments Assignments list
   * @returns Assignments with coefficient value
   */
  private async joinCoefficient(assignments: Assignment[]): Promise<(Assignment & ICoefficientInfo)[]> {
    const assWithCoef = assignments.map(async (ass: Assignment) => {
      const { late_rule, start_time, finish_time, extra_time } = ass;
      const start = new Date(start_time);
      const finish = finish_time ? new Date(finish_time) : undefined;
      const coef = await this.getCoefficient(late_rule, extra_time, start, finish);
      return Object.assign(ass, coef);
    });
    const assWithCoefData = await Promise.all(assWithCoef);
    return assWithCoefData;
  }

  /**
   * This func will call to `JUDGE` to get coefficient value by running `late_rule`.
   * @param {string} rule Assignment's `late_rule`. <?PHP code ?>.
   * @param {Date} start Assignment's start-time. TIME string.
   * @param {Date} finish Assignment's finish-time. TIME string.
   * @param {number} extra_time Assignment's extra_time.
   */
  public async getCoefficient(rule: string, extra_time: number, start: Date, finish?: Date, ): Promise<ICoefficientInfo> {
    const start_time = moment(start).format('YYYY-MM-DD HH:mm:ss');
    // In judge, the assignment never finish when finish before start.
    const finish_time = finish
      ? moment(finish).format('YYYY-MM-DD HH:mm:ss')
      : moment(start).subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss');
    try {
      const judgeURL = this.configService.get('JUDGE_URL');
      if (!judgeURL) {
        throw new Http506Exception("judge.no-url");
      }
      const url = `${this.configService.get('JUDGE_URL')}/third_party/coefficient`;
      const res = await this.httpService.axiosRef.get(url, {
        params: { rule, start_time, finish_time, extra_time },
      });
      const { is_error, msg, coefficient, finished }: any = res.data || {};
      if (is_error) {
        console.error('[EXCEPTION.JUDGE.ERR-REQUEST]', msg);
        return {
          coefficient: '--',
          finished: false,
        }
      }
      return {
        coefficient,
        finished
      }
    } catch (err) {
      console.error('[EXCEPTION.JUDGE.NO-CONNECT]', err);
      return {
        coefficient: '--',
        finished: false,
      }
    }
  }
}
