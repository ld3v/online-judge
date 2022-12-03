import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { isJSON } from 'class-validator';
import * as moment from 'moment';
import { AccountService } from 'src/account/account.service';
import { Account } from 'src/account/entities/account.entity';
import CustomLogger from 'src/logger/customLogger';
import { Problem } from 'src/problem/entities/problem.entity';
import { TProblemWithAssignment } from 'src/problem/problem.types';
import { QueueState } from 'src/queue/queue.enum';
import { TJudgeAssignmentProblem } from 'src/setting/setting.utils';
import { Submission } from 'src/submission/entities/submission.entity';
import { SubmissionService } from 'src/submission/submission.service';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { Http503Exception } from 'utils/Exceptions/http503.exception';
import { Http506Exception } from 'utils/Exceptions/http506.exception';
import { array2Map, isArrNumbers, isObj, jsonParsed } from 'utils/func';
import { FoundAndNotFoundResult, IAssignment, SuccessAndFailed } from 'utils/types';
import { AssignmentAccountRepository, AssignmentProblemRepository, AssignmentRepository } from './assignment.repository';
import { IAssignmentEntity, IAssignmentProblemInput, IAssignmentTransformed, ICoefficientInfo, ICoefficientRule, TSearchQuery } from './assignment.types';
import { Assignment } from './entities/assignment.entity';
import { AssignmentAccount } from './entities/assignment_account.entity';
import { AssignmentProblem } from './entities/assignment_problem.entity';

const SORTER_FIELDS = ['start_time', 'finish_time'];

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(AssignmentRepository)
    private readonly assignmentRepository: AssignmentRepository,
    @InjectRepository(AssignmentAccountRepository)
    private readonly assignmentAccountRepository: AssignmentAccountRepository,
    @InjectRepository(AssignmentProblemRepository)
    private readonly assignmentProblemRepository: AssignmentProblemRepository,

    private readonly accountService: AccountService,
    private readonly submissionService: SubmissionService,
    private readonly httpService: HttpService,
    private readonly logger: CustomLogger,
    private readonly configService: ConfigService,
  ) {}

  public async create (data: IAssignment): Promise<Assignment> {
    const newAss = this.assignmentRepository.create(data);
    return await this.assignmentRepository.save(newAss);
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
      curAss.coefficient_rules !== data.coefficient_rules ||
      curAss.start_time !== data.start_time ||
      curAss.finish_time !== data.finish_time ||
      curAss.extra_time !== data.extra_time
    ) {
      // Update submissions's coefficient.
      const coefficientRules = updateData.coefficient_rules ? JSON.parse(updateData.coefficient_rules) : [];
      const { coefficient } = await this.getCoefficient(
        coefficientRules,
        updateData.extra_time,
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
      if (!curAss) {
        if (showErrIfErr) {
          throw new Http400Exception('assignment.notfound', {
            notFoundId: `${id}`,
          });
        }
        return null;
      }
      // const assignmentsWithCoef = await this.joinCoefficient([curAss]);
      return curAss
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
  public async getAll(participant: Account = null, { keyword, exceptIds, page, limit, sorter }: TSearchQuery = {}, withCoef: boolean = true, withTransform: boolean = true) {
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
    if (sorter && SORTER_FIELDS.includes(sorter.field) && sorter.type) {
      assignmentQuery = assignmentQuery.orderBy(
        `assignment.${sorter.field}`,
        sorter.type,
      );
    }
    const countItems = await assignmentQuery.getCount();
    // Pagination
    const pageSkip = Number(page) - 1;
    const limitItem = Number(limit);
    if (!Number.isNaN(pageSkip) && !Number.isNaN(limitItem) && limitItem > 0 && pageSkip >= 0) {
      assignmentQuery = assignmentQuery.skip(limitItem * pageSkip).take(limitItem);
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
      .leftJoinAndSelect("problem.languages", "problem_language")
      .leftJoinAndSelect("problem_language.language", "language")
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
      langExtAvailable: assProblem.problem.languages.map(probLang => probLang.language.extension),
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
        if (finalSub.queue.state === QueueState.Processing) {
          problemWithAssMapping[finalSub.problem.id].status = 'secondary';
          return;
        }
        if (finalSub.pre_score == 10000) {
          problemWithAssMapping[finalSub.problem.id].status = 'success';
          return;
        }
        problemWithAssMapping[finalSub.problem.id].status = 'danger';
        problemWithAssMapping[finalSub.problem.id].preScore = finalSub.pre_score;
      });

      return Object.values(problemWithAssMapping);
    } catch (err) {
      throw err;
    }
  }

  /**
   * This func will return all of data for AssignmentProblem.
   * ### -> Need transform to PUBLIC data before send to user.
   * 
   * @param {Assignment} assignment Assignment
   * @param {Problem} problem Problem
   * @returns {Promise<AssignmentProblem>}
   */
  public async getAssProbByAssAndProb(assignment: Assignment, problem: Problem): Promise<AssignmentProblem> {
    try {
      if (!assignment || !problem) {
        return null;
      }
      const assProb = await this.assignmentProblemRepository.findOne({
        assignment,
        problem,
      });
      return assProb;
    } catch (err) {
      this.logger.error(err);
      throw new Http503Exception('getAssProb-by-Ass&Prob.unknown-error');
    }
  }

  // Other
  // Transform assignment to public data
  public transformData(...assignments: IAssignmentEntity[]): IAssignmentTransformed[] {
    return assignments.map((assignment: IAssignmentEntity) => {
      const { problems, accounts, submissions, coefficient_rules, ...info } = assignment;
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
      // Late rules
      const lateRules = coefficient_rules ? JSON.parse(coefficient_rules) : [];
      return {
        id: info.id,
        name: info.name,
        description: info.description,
        startTime: info.start_time,
        finishTime: info.finish_time,
        extraTime: info.extra_time,
        lateRules,
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
      const coef = await this.getCoefficientByAssignment(ass);
      return Object.assign(ass, coef);
    });
    const assWithCoefData = await Promise.all(assWithCoef);
    return assWithCoefData;
  }

  /**
   * This func will call to `JUDGE` to get coefficient value by running `late_rule`.
   * @param {ICoefficientRule[]} rules Assignment's `coefficient_rules`..
   * @param {number} extra_time Assignment's extra_time (minutes).
   * @param {Date} finish Assignment's finish-time. TIME string.
   */
  public getCoefficient(rules: ICoefficientRule[], extra_time: number, finish?: Date ): ICoefficientInfo {
    const now = moment();
    const finish_time = finish ? moment(finish) : null;

    // Not finish assignment
    if (!finish_time || now.isBefore(finish_time, 'seconds')) {
      return {
        coefficient: 100,
        finished: false,
      }
    }

    // Finished
    const finishTimeWithExtra = finish_time.clone().add(extra_time, 'minutes');
    if (now.isAfter(finishTimeWithExtra)) {
      return {
        coefficient: 0,
        finished: true,
      }
    }

    if (!Array.isArray(rules) || rules.length === 0) {
      return {
        coefficient: now.isAfter(finishTimeWithExtra) ? 0 : 100,
        finished: false,
      }
    }

    // Run through rules
    const delayMins = now.diff(finish_time, 'minutes');
    const ruleLength = rules.length;
    for (let i = 0; i < ruleLength; i += 1) {
      const rule = rules[i];
      // Check delay-range
      const delayRange = [
        rule.DELAY_RANGE[0] + (rule.BASE_MINS || 0),
        rule.DELAY_RANGE[1] + (rule.BASE_MINS || 0),
      ];
      const delaySpace = rule.DELAY_RANGE[1] - rule.DELAY_RANGE[0];
      const delayMinsInRange = delayMins - delayRange[0];

      if (delayRange[0] > delayMins || delayRange[1] < delayMins) {
        // Not in this range
        continue;
      }
      // Check value type = "VOT" or "CONST"
      if (Array.isArray(rule.VARIANT_OVER_TIME) && rule.VARIANT_OVER_TIME.length === 2) {
        const votSpace = rule.VARIANT_OVER_TIME[1] - rule.VARIANT_OVER_TIME[0];
        const coefVOT = rule.VARIANT_OVER_TIME[1] - ((delayMinsInRange / delaySpace) * votSpace);

        return {
          coefficient: coefVOT,
          finished: false,
        };
      }
      return {
        coefficient: rule.CONST,
        finished: false,
      }
    }
  }

  public async getCoefficientByAssignment(assignment: Assignment) {
    const rules = assignment.coefficient_rules ? JSON.parse(assignment.coefficient_rules) : [];
    return await this.getCoefficient(
      rules,
      assignment.extra_time,
      !!assignment.finish_time && new Date(assignment.finish_time),
    );
  }

  public validateCoefficientRules(rules: ICoefficientRule[]): ICoefficientRule[] {
    if (!Array.isArray(rules)) {
      throw new Http400Exception('assignment.form.coefficient-rules.invalid', {
        errors: [{
          msg: 'assignment.form.coefficient-rules.invalid',
          value: { e: 'format' }
        }]});
    }
    const errors: { msg: string, value?: { i: number, e?: string } }[] = [];
    rules.forEach((v, i) => {
      const index = i + 1;
      if (!isObj(v)) {
        errors.push({ msg: 'assignment.form.coefficient-rule.invalid', value: { i: index } });
        return;
      }
      if (!v.DELAY_RANGE || !isArrNumbers(v.DELAY_RANGE, 2)) {
        const delayRangeErr = !v.DELAY_RANGE ? 'format' : 'logic';
        errors.push({ msg: 'assignment.form.coefficient-rule.time-range.invalid', value: { i: index, e: delayRangeErr } });
      }
      if ((!v.CONST && !v.VARIANT_OVER_TIME) || (v.CONST && v.VARIANT_OVER_TIME)) {
        const errProblem = (!v.CONST && !v.VARIANT_OVER_TIME)
          ? "empty"
          : "conflict"
        errors.push({ msg: `assignment.form.coefficient-rule.coefficient-value.${errProblem}`, value: { i: index } });
        return;
      }
      // Need update this validate rule.
      if (v.CONST && (typeof v.CONST !== 'number' || isNaN(v.CONST))) {
        errors.push({ msg: 'assignment.form.coefficient-rule.coefficient-value.const-invalid', value: { i: index, e: 'const_is-nan'} });
      }
      if (v.VARIANT_OVER_TIME && !isArrNumbers(v.DELAY_RANGE, 2)) {
        errors.push({ msg: 'assignment.form.coefficient-rule.coefficient-value.vot-invalid', value: { i: index, e: 'vot_is-not_range' }});
      }
    });
    if (errors.length > 0) {
      throw new Http400Exception('assignment.coefficient-rules.invalid', { errors });
    }
    return rules;
  }
}
