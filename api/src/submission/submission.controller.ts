import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { AssignmentService } from 'src/assignment/assignment.service';
import RequestWithAccount from 'src/auth/dto/reqWithAccount.interface';
import JwtAuthGuard from 'src/auth/gaurd/jwtAuth.gaurd';
import { ProblemService } from 'src/problem/problem.service';
import { isAdmin } from 'utils/func';
import { SubmissionService } from './submission.service';
import { SubmissionFilter } from './submission.types';

@Controller('submission')
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly assignmentService: AssignmentService,
    private readonly accountService: AccountService,
    private readonly problemService: ProblemService,
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
          ? this.assignmentService.transformData(assData)[0]
          : undefined;
      }
      const { data, total } = await this.submissionService.get(queryParams);
      const dataTransformed = data.map(({ assignment, submitter, problem, ...dataItem}) => {
        const assignmentTransformed = this.assignmentService.transformData(assignment)[0];
        const problemTransformed = this.problemService.transformData(user, problem)[0];
        const accountTransformed = this.accountService.transformAccountData(user, submitter)[0];
        return {
          submitter: accountTransformed,
          problem: problemTransformed,
          assignment: assignmentTransformed,
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
}
