import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Role } from 'src/account/account.enum';
import { AccountService } from 'src/account/account.service';
import JwtAuthGuard from 'src/auth/gaurd/jwtAuth.gaurd';
import { ProblemService } from 'src/problem/problem.service';
import { AssignmentService } from './assignment.service';
import CreateDto from './dto/create.dto';
import RoleGaurd from 'src/auth/gaurd/roles.gaurd';
import RequestWithAccount from 'src/auth/dto/reqWithAccount.interface';
import { TParamId } from 'utils/types';
import { SubmissionService } from 'src/submission/submission.service';
import { array2Map } from 'utils/func';
import SearchQueryDto from './dto/searchQuery.dto';
import { Http400Exception } from 'utils/Exceptions/http400.exception';

@Controller('assignment')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly accountService: AccountService,
    private readonly problemService: ProblemService,
  ) {}

  @Get('/coefficient')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGaurd(Role.Admin))
  async getCoefficient(
    @Query() { rule, finish, extra }: any,
  ) {
    try {
      const res = await this.assignmentService.getCoefficient(rule, extra, finish);
      return res;
    } catch (err) {
      throw err;
    }
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getAssignments(
    @Req() { user }: RequestWithAccount,
    @Query() { keyword: searchKeyword, except, page, limit, sorter_field, sorter_type }: SearchQueryDto,
  ) {
    try {
      let data;
      const keyword = searchKeyword ? searchKeyword.trim() : '';
      const exceptIds = except?.split(',') || [];

      switch (user.role) {
        case Role.Admin:
          data = await this.assignmentService.getAll(null, { keyword, exceptIds, page, limit, sorter: { field: sorter_field, type: sorter_type } });
          break;
        case Role.User:
          data = await this.assignmentService.getAll(user, { page, limit, sorter: { field: sorter_field, type: sorter_type } });
          break;
        default:
          break;
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async selectAssignment(
    @Req() { user }: RequestWithAccount,
    @Param('id') id: string, 
  ) {
    try {
      const assignment = await this.assignmentService.getById(id);
      await this.accountService.updateSelectedAssignment(user, assignment);
      return this.assignmentService.transformData(assignment)[0];
    } catch (err) {
      throw err;
    }
  }

  @Patch('/:id/set-selected')
  @UseGuards(JwtAuthGuard)
  async updateSelectedAssignment(
    @Req() { user }: RequestWithAccount,
    @Param('id') id: string, 
  ) {
    try {
      const assignment = await this.assignmentService.getById(id);
      const accountUpdated = await this.accountService.updateSelectedAssignment(user, assignment);
      return !!accountUpdated;
    } catch (err) {
      throw err;
    }
  }

  @Get('/:id/problems')
  @UseGuards(JwtAuthGuard)
  async getAssignmentProblems(
    @Req() { user }: RequestWithAccount,
    @Param('id') id: string, 
  ) {
    try {
      const assignment = await this.assignmentService.getById(id);
      await this.accountService.updateSelectedAssignment(user, assignment);
      const problems = await this.assignmentService.getProblemsByAssignment(assignment);
      return {
        assignment: this.assignmentService.transformData(assignment)[0],
        problems,
      };
    } catch (err) {
      throw err;
    }
  }

  @Post('/')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGaurd(Role.Admin))
  async createAssignment(@Body() data: CreateDto): Promise<any> {
    try {
      const { participants: participantIds, problems, late_rules, ...baseData } = data;
      const { keys: problemIds, map: problemInputMapping } = array2Map(problems, "id", true);
      const { found: participants } = await this.accountService.getByIds(participantIds || []);
      const { found: problemsData } = await this.problemService.getByIds(problemIds || []);
      // Validate late_rule
      const lateRules = this.assignmentService.validateCoefficientRules(late_rules);
      // Create a new assignment
      const newAssignment = await this.assignmentService.create({
        ...baseData,
        coefficient_rules: JSON.stringify(lateRules),
      });
      // Add participants & problem to current assignment
      if (participants.length > 0) {
        await this.assignmentService.updateParticipants(newAssignment, participants);
      }
      if (problems.length > 0) {
        await this.assignmentService.updateProblems(newAssignment, problemsData, problemInputMapping);
      }
      // Return
      const assignmentInfo = await this.assignmentService.getById(newAssignment.id);
      return this.assignmentService.transformData(assignmentInfo)[0];
    } catch (err) {
      throw err;
    }
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGaurd(Role.Admin))
  async updateAssignment(
    @Param() { id }: TParamId,
    @Body() data: CreateDto,
  ): Promise<any> {
    try {
      const { participants: participantIds, problems, late_rules, ...baseData } = data;
      const { keys: problemIds, map: problemInputMapping } = array2Map(problems, "id", true);
      const { found: participants } = await this.accountService.getByIds(participantIds || []);
      const { found: problemsData } = await this.problemService.getByIds(problemIds || []);
      // Validate rule
      const lateRules = this.assignmentService.validateCoefficientRules(late_rules);
      // Get assignment need to update
      const assignment = await this.assignmentService.getById(id);
      const { assignment: res, coefficient } = await this.assignmentService.update(assignment, {
        ...baseData,
        coefficient_rules: JSON.stringify(lateRules),
      });
      // Update participants & problem to current assignment
      if (participants.length > 0) {
        await this.assignmentService.updateParticipants(assignment, participants);
      }
      if (problems.length > 0) {
        await this.assignmentService.updateProblems(assignment, problemsData, problemInputMapping);
      }
      return {
        assignment: this.assignmentService.transformData(res)[0],
        coefficient,
      }
    } catch (err) {
      throw err;
    }
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGaurd(Role.Admin))
  async deleteAssignment(
    @Param() { id }: TParamId,
  ): Promise<Number> {
    try {
      // Get assignment need to update
      const assignment = await this.assignmentService.getById(id);
      // Delete
      return await this.assignmentService.delete(assignment);
    } catch (err) {
      throw err;
    }
  }
}
