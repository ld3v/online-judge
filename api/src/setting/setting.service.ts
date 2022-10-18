import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';
import { Account } from 'src/account/entities/account.entity';
import { AssignmentService } from 'src/assignment/assignment.service';
import { IAssignmentProblemInput } from 'src/assignment/assignment.types';
import { Assignment } from 'src/assignment/entities/assignment.entity';
import { AssignmentProblem } from 'src/assignment/entities/assignment_problem.entity';
import { Language } from 'src/language/entities/language.entity';
import { LanguageService } from 'src/language/language.service';
import CustomLogger from 'src/logger/customLogger';
import { Problem } from 'src/problem/entities/problem.entity';
import { ProblemLanguage } from 'src/problem/entities/problem_language.entity';
import { ProblemService } from 'src/problem/problem.service';
import { DEFAULT_SETTING_VALUES, SETTING_FIELDS_AVAILABLE } from 'utils/constants/settings';
import { Http502Exception } from 'utils/Exceptions/http502.exception';
import { Http506Exception } from 'utils/Exceptions/http506.exception';
import { array2Map } from 'utils/func';
import { ILangAddProblem, SuccessAndFailed } from 'utils/types';
import { SettingRepository } from './setting.repository';
import { ISetting, TSettingFindResult } from './setting.types';
import { judgeAccount2Account, judgeAssignment2Assignment, judgeLang2Lang, judgeProblem2Problem, TJudgeAssignmentProblem, TJudgeProblemLang } from './setting.utils';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(SettingRepository)
    private readonly settingRepository: SettingRepository,
    private readonly logger: CustomLogger,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly accountService: AccountService,
    private readonly langService: LanguageService,
    private readonly assignmentService: AssignmentService,
    private readonly problemService: ProblemService,
  ) {}

  public async syncWithJudge(): Promise<Record<string, any>> {
    // Get setting on JUDGE system
    const judgeSettings = await this.getJudgeData("settings");
    // Transform judgeSetting -> Available setting for current system.
    return await this.update(judgeSettings);
  }

  /**
   * This func will **REMOVE** all of accounts (except root)
   * and import all of accounts from old JUDGE system.
   */
  public async syncAccountsByJudge(): Promise<SuccessAndFailed<Account>> {
    // Get accounts on JUDGE system
    const judgeAccounts = await this.getJudgeData("accounts", false);
    if (!judgeAccounts) {
      return {};
    }
    // Remove all of accounts (Except root)
    await this.accountService.removeAllExceptRoot();
    // Convert JUDGE's account -> current account's models.
    const accounts = judgeAccount2Account(Object.values(judgeAccounts));
    return await this.accountService.importMulti(...accounts);
  }

  /**
   * This func will **REMOVE** all of language
   * and import all of assignments from old JUDGE system.
   */
   public async syncLanguagesByJudge(): Promise<{ success?: Language[] }> {
    // Get languages on JUDGE system
    const judgeLangs = await this.getJudgeData("languages", false);
    if (!judgeLangs) {
      return {};
    }
    // Remove all of languages
    await this.langService.removeAll();
    // Convert JUDGE's langs -> current lang's models.
    const langs = judgeLang2Lang(Object.values(judgeLangs));
    return {
      success: await this.langService.createMulti(...langs),
    };
  }

  /**
   * This func will **REMOVE** all of assignments
   * and import all of assignments from old JUDGE system.
   */
   public async syncAssignmentsByJudge(): Promise<SuccessAndFailed<Assignment> & {
    judgeAssIdMap2AssId?: Record<number, string>,
    judgeAssIdMap2JudgeAssProblems?: Record<number, TJudgeAssignmentProblem[]>,
  }> {
    // Get languages on JUDGE system
    const judgeAssignments = await this.getJudgeData("assignments", false);
    if (!judgeAssignments) {
      return {
        judgeAssIdMap2AssId: {},
        judgeAssIdMap2JudgeAssProblems: {},
      };
    }
    // Remove all of languages
    await this.assignmentService.removeAll();
    // Convert JUDGE's langs -> current lang's models.
    const assignmentItems = judgeAssignment2Assignment(Object.values(judgeAssignments));
    
    return await this.assignmentService.createMulti(assignmentItems);
  }

  /**
   * This func will **REMOVE** all of problems
   * and import all of problems from old JUDGE system.
   */
   public async syncProblemsByJudge(): Promise<SuccessAndFailed<Problem> & {
      judgeProbIdMap2ProbId?: Record<number, string>,
      judgeProbIdMap2Langs?: Record<number, TJudgeProblemLang[]>
      judgeProbIdMap2JudgeAssIds?: Record<number, number[]>
  }> {
    try {
      // Get languages on JUDGE system
      const judgeProblems = await this.getJudgeData("problems", false);
      if (!judgeProblems) {
        return {
          judgeProbIdMap2ProbId: {},
          judgeProbIdMap2Langs: {},
          judgeProbIdMap2JudgeAssIds: {},
        };
      }
      // Remove all of languages
      await this.problemService.removeAll();
      // Convert JUDGE's langs -> current lang's models.
      const problemDataItems = judgeProblem2Problem(Object.values(judgeProblems));
  
      return await this.problemService.createByJudgeProblems(problemDataItems);
    } catch (err) {
      console.error('[syncProblemsByJudge]:', err);
      throw err;
    }
  }

  public async syncProblemLangsByJudge(
    judgeProbIdMap2ProbId: Record<number, string>,
    judgeProbIdMap2JudgeLangs: Record<number, TJudgeProblemLang[]>,
    problemMapById: Record<string, Problem>,
    langMappingByName: Record<string, Language>,
  ): Promise<SuccessAndFailed<ProblemLanguage>> {
    const problemLangsNeedCreatePromise = Object
      .keys(judgeProbIdMap2ProbId)
      .map(async (judgeProbId) => {
        try {
          const probId = judgeProbIdMap2ProbId[judgeProbId];
          const problemNeedAddLangs = problemMapById[probId];
          const langMapping: Record<string, ILangAddProblem> = {};

          // Create array of langs need to add to problems &
          //   langMapping for time_limit & memory_limit
          const langs: Language[] = judgeProbIdMap2JudgeLangs[judgeProbId]
            .map((judgeLang: TJudgeProblemLang) => {
              const judgeLangName = judgeLang.name;
              const lang = langMappingByName[judgeLangName];
              langMapping[lang.id] = {
                id: lang.id,
                time_limit: judgeLang.time_limit ? Number(judgeLang.time_limit) : undefined,
                memory_limit: judgeLang.memory_limit ? Number(judgeLang.memory_limit) : undefined,
              }
              return lang;
            });

          return await this.problemService.addProblemLangs(problemNeedAddLangs, langs, langMapping);
        } catch (err) {
          return err;
        }
      });
    const resAddProblemLang = await Promise.all(problemLangsNeedCreatePromise);
    const resAddProblemLangSuccess = resAddProblemLang.filter(res => !(res instanceof Error));
    const resAddProblemLangFailed = resAddProblemLang.filter(res => res instanceof Error);

    return {
      success: resAddProblemLangSuccess,
      failed: resAddProblemLangFailed,
    }
  }

  public async syncAssProblemsByJudge(
    judgeAssIdMap2AssId: Record<number, string>,
    judgeAssIdMap2JudgeAssProblems: Record<number, TJudgeAssignmentProblem[]>,
    judgeProblemIdMap2ProblemId: Record<number, string>,
    assignmentMapById: Record<string, Assignment>,
    problemMapById: Record<string, Problem>,
  ): Promise<SuccessAndFailed<AssignmentProblem>> {
    const assignmentProbNeedCreatePromise = Object.keys(judgeAssIdMap2AssId)
      .map(async (judgeAssId) => {
        try {
          const assId = judgeAssIdMap2AssId[judgeAssId];
          const assignmentNeedUpdate: Assignment = assignmentMapById[assId];
          const assProblemMapping: Record<string, IAssignmentProblemInput> = {}; 
  
          const problemsNeedAdd: Problem[] = judgeAssIdMap2JudgeAssProblems[judgeAssId]
            .map((judgeProblem: TJudgeAssignmentProblem) => {
              const problemId = judgeProblemIdMap2ProblemId[judgeProblem.id];
              const problem = problemMapById[problemId];
  
              assProblemMapping[problemId] = {
                id: problemId,
                name: judgeProblem.problem_name,
                ordering: Number(judgeProblem.ordering || 0),
                score: Number(judgeProblem.score || 100),
              };
              
              return problem;
            });
  
          return await this.assignmentService.updateProblems(
            assignmentNeedUpdate,
            problemsNeedAdd,
            assProblemMapping,
          );
        } catch (err) {
          return err;
        }
      });
    
    const resUpdateProblem = await Promise.all(assignmentProbNeedCreatePromise);
    return {
      success: resUpdateProblem.filter(r => !(r instanceof Error)),
      failed: resUpdateProblem.filter(r => r instanceof Error),
    };
  }

  public async update(newSetting: ISetting): Promise<Record<string, any>> {
    // Get current settings.
    const currentSettings = await this.settingRepository.find();
    const currentSettingFields = currentSettings.map(settingItem => settingItem.key);
    // Transform input -> Available setting for current system.
    // const settingsAvailable: Record<string, any> = {};
    // Object.keys(newSetting).forEach((key: string) => {
    //   if (SETTING_FIELDS_AVAILABLE.includes(key)) {
    //     settingsAvailable[key] = newSetting[key];
    //   }
    // });

    const settingFieldsNeedCreate = SETTING_FIELDS_AVAILABLE.filter((key: string) => !currentSettingFields.includes(key));
    const newSettings = settingFieldsNeedCreate.map((key: string) => this.settingRepository.create({ key, value: newSetting[key] }));
    
    const settingsUpdate = currentSettings.filter(({key}) => SETTING_FIELDS_AVAILABLE.includes(key)).map(({ key }) => ({ key, value: newSetting[key] }));

    const settingsUpdated = await this.settingRepository.save([...newSettings, ...settingsUpdate]);
    const { map } = array2Map(settingsUpdated, 'key');
    return map;
  }

  public async get(): Promise<Record<string, any>> {
    const data = await this.settingRepository.find();
    const { map } = array2Map(data, 'key');
    return map;
  }

  public async getByFields(...fields: string[]): Promise<{ settings: TSettingFindResult, keysNotFound: string[] }> {
    const settingItems = await this.settingRepository.createQueryBuilder('setting')
      .where('key IN (:...fields)', { fields })
      .getMany();
    const keysFound = settingItems.map(s => s.key);
    const keysNotFound = fields.filter(field => !keysFound.includes(field));
  
    const { map } = array2Map(settingItems, 'key');
    return {
      settings: map,
      keysNotFound,
    };
  }

  private async getJudgeData(
    action: "settings" | "accounts" | "languages" | "assignments" | "problems",
    throwErr: boolean = true
  ) {
    try {
      const judgeURL = this.configService.get('JUDGE_URL');
      if (!judgeURL) {
        this.logger.warn('[!] - No JUDGE\'s url to handle action!');
        if (throwErr) {
          throw new Http506Exception("judge.no-url");
        }
        return false;
      }
      const url = `${this.configService.get('JUDGE_URL')}/third_party/${action}`;
      const res = await this.httpService.axiosRef.get(url);
      const { is_error, msg, ...settingValues }: any = res.data || { is_error: true, msg: 'Unknown error!'};
      if (is_error) {
        if (throwErr) {
          throw new Http502Exception(msg);
        }
        return false;
      }
      return settingValues;
    } catch (err) {
      this.logger.warn(`[!] - Error happen when get ${action} from JUDGE`);
      if (throwErr) {
        throw new Http502Exception("judge.no-connect");
      }
      return false;
    }
  }

  public async initDefaultSetting(): Promise<string> {
    try {
      // Check currently status
      const currentSetting = await this.get();
      if (Object.keys(currentSetting).length > 0) {
        return 'My son is already here!';
      }
      const res = await this.update(DEFAULT_SETTING_VALUES);
      return Object.keys(res).length > 0
        ? 'Do you known my son\' name? He was just born!'
        : 'My son is in HCM Hospital! He has COVID-19 virus!';
    } catch (err) {
      this.logger.error(err);
      return 'Oh no! Where is my son! Do you see him?';
    }
  }

  public transformSetting(settings: Record<string, string>): Record<string, any> {
    return {
      ...settings,
      default_coefficient_rules: settings.default_coefficient_rules ? JSON.parse(settings.default_coefficient_rules) : [],
      enable_registration: `${settings.enable_registration}` === "true",
      file_size_limit: Number(settings.file_size_limit),
      output_size_limit: Number(settings.output_size_limit),
      submit_penalty: Number(settings.submit_penalty),
    }
  }
}
