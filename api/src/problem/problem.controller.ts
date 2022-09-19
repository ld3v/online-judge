import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Role } from 'src/account/account.enum';
import { Account } from 'src/account/entities/account.entity';
import RequestWithAccount from 'src/auth/dto/reqWithAccount.interface';
import JwtAuthGuard from 'src/auth/gaurd/jwtAuth.gaurd';
import RoleGuard from 'src/auth/gaurd/roles.gaurd';
import { LanguageService } from 'src/language/language.service';
import { array2Map, isAdmin } from 'utils/func';
import { TParamId } from 'utils/types';
import CreateDto from './dto/create.dto';
import UpdateDto from './dto/update.dto';
import { Problem } from './entities/problem.entity';
import { ProblemService } from './problem.service';
import { ProblemFilter } from './problem.types';

@Controller('problem')
export class ProblemController {
  constructor (
    private readonly problemService: ProblemService,
    private readonly langService: LanguageService,
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getAll(
    @Req() { user }: RequestWithAccount,
    @Query() { assignmentIds, langIds, accountId, except, keyword, page, limit }: ProblemFilter,
  ) {
    try {
      const queryParamsByRole = isAdmin(
        user,
        { assignmentIds, langIds, accountId, except, keyword, page, limit },
        { assignmentIds, page, limit },
      );
      const { data, total } = await this.problemService.getAll(queryParamsByRole);
      return {
        data: this.transformProblem(user, ...data),
        total,
      };
    } catch (err) {
      throw err;
    }
  }

  @Post('/')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async create(
    @Req() { user }: RequestWithAccount,
    @Body() data: CreateDto,
  ) {
    try {
      const { languages, ...problemData } = data;
      const { map: langMapping } = array2Map(languages, 'language_id');
      const languageIds = Object.keys(langMapping);
      const { found: langsData } = await this.langService.getByIds(languageIds);
      const newProb = await this.problemService.create(problemData, user);
      // Add lang to the new problem.
      await this.problemService.addProblemLangs(newProb, langsData, langMapping);
      // Get problem and send to FE
      const problemCreated = await this.problemService.getById(newProb.id);
      return this.transformProblem(user, problemCreated)[0];
    } catch (err) {
      throw err;
    }
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async getProblemById(
    @Req() { user }: RequestWithAccount,
    @Param('id') id: string, 
  ) {
    try {
      const problem = await this.problemService.getById(id);
      return this.transformProblem(user, problem)[0];
    } catch (err) {
      throw err;
    }
  }

  // Update a problem, and its language.
  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async update(
    @Req() { user }: RequestWithAccount,
    @Param() { id }: TParamId,
    @Body() data: UpdateDto,
  ) {
    try {
      const curProb = await this.problemService.getById(id);
      const problemData = this.transformProblem(user, curProb)[0];
      const { languages, ...problemDataNeedUpdate } = data;
      // Update problem
      await this.problemService.update(curProb, problemDataNeedUpdate);
      // Update language, or create new.
      const {
        noKeyItems: problemLangNeedCreate,
        // hasKeyItems: problemLangNeedUpdate,
        keys: problemLangIDsNeedUpdate,
        map: problemLangNeedUpdateMapping,
      } = array2Map(languages, 'id');
      // Get lang need to create from `language` input.
      const { map: langMapping, keys: langIds } = array2Map(problemLangNeedCreate, 'language_id');
      const { found: langsData } = await this.langService.getByIds(langIds);
      await this.problemService.addProblemLangs(curProb, langsData, langMapping);
      // Get langs need to update from `language` input.
      const {
        found: problemLangNeedUpdateData,
      } = await this.problemService.getProblemLangByIds(problemLangIDsNeedUpdate);
      await this.problemService.updateProblemLangs(problemLangNeedUpdateData, problemLangNeedUpdateMapping);
      // Get langs need to delete.
      const currentProblemLangIds = problemData.languages.map(lang => lang.id);
      const problemLangIdsNeedDel = currentProblemLangIds.filter(probLangId => !problemLangIDsNeedUpdate.includes(probLangId));
      await this.problemService.deleteProblemLangsByIds(problemLangIdsNeedDel);

      // Get problem after update and send to FE
      const problemUpdated = await this.problemService.getById(id);
      return this.transformProblem(user, problemUpdated)[0];
    } catch (err) {
      throw err;
    }
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async deleteProblem (
    @Param() { id }: TParamId,
  ) {
    try {
      const problemNeedDel = await this.problemService.getById(id);
      return await this.problemService.deleteById(problemNeedDel.id);
    } catch (err) {
      throw err;
    }
  }


  private transformProblem (requester: Account, ...problems: Problem[]) {
    const ifAdmin = (value: any) => requester.role === Role.Admin ? value : undefined;
    const problemTransformed = problems.map(problem => {
      const created_by = {
        id: problem.created_by.id,
        display_name: problem.created_by.display_name,
      }
      const languages = problem.languages.map(lang => (
        lang.language
          ? {
            id: lang.id,
            langId: lang.language.id,
            name: lang.language.name,
            timeLimit: lang.time_limit,
            memoryLimit: lang.memory_limit,
          }
          : undefined
        )).filter(lang => lang);
      const assignments = problem.assignments.map(ass => (
        ass.assignment
          ? {
            id: ass.assignment.id,
            name: ass.assignment.name,
          }
          : undefined
      )).filter(ass => ass);
      return {
        id: problem.id,
        name: problem.name,
        content: problem.content,
        note: ifAdmin(problem.admin_note),
        diff_cmd: ifAdmin(problem.diff_cmd),
        diff_arg: ifAdmin(problem.diff_arg),
        created_by: ifAdmin(created_by),
        assignments: ifAdmin(assignments),
        languages,
      }
    });
    return problemTransformed;
  }
}
