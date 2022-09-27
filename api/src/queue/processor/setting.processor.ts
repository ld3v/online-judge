import { OnQueueActive, Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { Language } from "src/language/entities/language.entity";
import CustomLogger from "src/logger/customLogger";
import { ProblemLanguage } from "src/problem/entities/problem_language.entity";
import { ProblemService } from "src/problem/problem.service";
import { SettingService } from "src/setting/setting.service";
import { array2Map, reserveMapping } from "utils/func";
import { QueueState } from "../queue.enum";
import { QueueService } from "../queue.service";

export const SYNC_PROCESS_KEY = {
  ASSIGNMENT: "assignment",
  PROBLEM: "problem",
  LANGUAGE: "language",
  ACCOUNT: "account",
  ASSIGNMENT_PROBLEMS: "assignment-problems",
  PROBLEM_LANGUAGES: "problem-languages",
};

@Processor('setting')
export class SettingProcessor {
  constructor(
    private readonly logger: CustomLogger,
    private readonly settingService: SettingService,
    // private readonly problemService: ProblemService,
    private readonly queueService: QueueService,
  ) {}

  @Process('syncAllData')
  async handleSyncAllData(job: Job) {
    try {
      this.logger.log(`Processing job#${job.id} - queueEntity#${job.data.queueId}`, undefined, 0, "NEW");
      
      // SYNC ACCOUNTS ===================
      this.logger.log(`Handle update accounts`, undefined, 1, "PROCESSING");
      const { success: accCreated, failed: accCreateFailed } = await this.settingService.syncAccountsByJudge();
      if (accCreated && accCreated.length > 0) {
        // Re-update queue status
        await this.queueService.update(job.data.queueId, [SYNC_PROCESS_KEY.ACCOUNT, QueueState.Done]);
      }
      this.logger.log(
        accCreated && accCreateFailed
          ? `Done (Success: ${accCreated.length}, Failed: ${accCreateFailed.length})`
          : '\x1b[31mFailed!\x1b[0m',
        undefined,
        2,
        "INFO",
      );
      if (accCreateFailed.length > 0) {
        this.logger.log(`\x1b[31mUnexpected error happened (First error):\x1b[0m ${accCreateFailed[0]}`, undefined, 2, "ERR");
      }

      // SYNC LANGUAGES ==================
      this.logger.log(`Handle update languages`, undefined, 1, "PROCESSING");
      const langCreated = await this.settingService.syncLanguagesByJudge();
      if (langCreated && langCreated.length > 0) {
        // Re-update queue status
        await this.queueService.update(job.data.queueId, [SYNC_PROCESS_KEY.LANGUAGE, QueueState.Done]);
      }
      const { map: langMappingByName } = array2Map(langCreated, "name");
      this.logger.log(
        langCreated
          ? `Done (Success: ${langCreated.length}, Failed: --)`
          : '\x1b[31mFailed!\x1b[0m',
        undefined,
        2,
        "INFO",
      );

      // SYNC ASSIGNMENTS ================
      this.logger.log(`Handle update assignments`, undefined, 1, "PROCESSING");
      const {
        success: assCreated,
        failed: assCreateFailed,
        judgeAssIdMap2AssId,
        judgeAssIdMap2JudgeAssProblems,
      } = await this.settingService.syncAssignmentsByJudge();
      if (assCreated && assCreated.length > 0) {
        // Re-update queue status
        await this.queueService.update(job.data.queueId, [SYNC_PROCESS_KEY.ASSIGNMENT, QueueState.Done]);
      }
      this.logger.log(
        assCreateFailed && assCreated
          ? `Done (Success: ${assCreated.length}, Failed: ${assCreateFailed.length})`
          : '\x1b[31mFailed!\x1b[0m',
        undefined,
        2,
        "INFO",
      );
      if (assCreateFailed.length > 0) {
        this.logger.log(`\x1b[31mUnexpected error happened (First error):\x1b[0m ${assCreateFailed[0]}`, undefined, 2, "ERR");
      }
      const { map: assignmentMapById } = array2Map(assCreated, "id");

      // SYNC PROBLEMS ===================
      this.logger.log(`Handle update problems`, undefined, 1, "PROCESSING");
      const {
        success: probCreated,
        failed: probCreateFailed,
        judgeProbIdMap2ProbId,
        judgeProbIdMap2Langs,
      } = await this.settingService.syncProblemsByJudge();
      if (probCreated && probCreated.length > 0) {
        // Re-update queue status
        await this.queueService.update(job.data.queueId, [SYNC_PROCESS_KEY.PROBLEM, QueueState.Done]);
      }
      this.logger.log(
        probCreated && probCreateFailed
          ? `Done (Success: ${probCreated.length}, Failed: ${probCreateFailed.length})`
          : '\x1b[31mFailed!\x1b[0m',
        undefined,
        2,
        "INFO",
      );
      if (probCreateFailed.length > 0) {
        this.logger.log(`\x1b[31mUnexpected error happened (First error):\x1b[0m ${probCreateFailed[0]}`, undefined, 2, "ERR");
      }
      const { map: problemMapById } = array2Map(probCreated, "id");

      // UPDATE PROBLEM-LANGUAGES =====================
      this.logger.log(`Handle update problem-languages`, undefined, 1, "PROCESSING");
      const {
        success: resAddProblemLangSuccess,
        failed: resAddProblemLangFailed,
      } = await this.settingService.syncProblemLangsByJudge(
        judgeProbIdMap2ProbId,
        judgeProbIdMap2Langs,
        problemMapById,
        langMappingByName,
      );
      if (probCreated && probCreated.length > 0) {
        // Re-update queue status
        await this.queueService.update(job.data.queueId, [SYNC_PROCESS_KEY.PROBLEM_LANGUAGES, QueueState.Done]);
      }
      this.logger.log(
        resAddProblemLangSuccess && resAddProblemLangFailed
          ? `Done (Success: ${resAddProblemLangSuccess.length}, Failed: ${resAddProblemLangFailed.length})`
          : '\x1b[31mFailed!\x1b[0m',
        undefined,
        2,
        "INFO",
      );
      if (resAddProblemLangFailed.length > 0) {
        this.logger.log(`\x1b[31mUnexpected error happened (First error):\x1b[0m ${resAddProblemLangFailed[0]}`, undefined, 2, "ERR");
      }

      // UPDATE ASSIGNMENT-PROBLEMS ===================
      this.logger.log(`Handle update assignment-problems`, undefined, 1, "PROCESSING");
      const {
        success: resAssProbCreated,
        failed: resAssProbFailed,
      } = await this.settingService.syncAssProblemsByJudge(
        judgeAssIdMap2AssId,
        judgeAssIdMap2JudgeAssProblems,
        judgeProbIdMap2ProbId,
        assignmentMapById,
        problemMapById,
      );
      if (resAssProbCreated && resAssProbCreated.length > 0) {
        // Re-update queue status
        await this.queueService.update(job.data.queueId, [SYNC_PROCESS_KEY.ASSIGNMENT_PROBLEMS, QueueState.Done]);
      }
      this.logger.log(
        resAssProbCreated && resAssProbFailed
          ? `Done (Success: ${resAssProbCreated.length}, Failed: ${resAssProbFailed.length})`
          : '\x1b[31mFailed!\x1b[0m',
        undefined,
        2,
        "INFO",
      );
      if (resAddProblemLangFailed.length > 0) {
        this.logger.log(`\x1b[31mUnexpected error happened (First error):\x1b[0m ${resAssProbFailed[0]}`, undefined, 2, "ERR");
      }

      // SYNC DONE -> RE-UPDATE QUEUE ENTITY IN DB
      await this.queueService.update(job.data.queueId, undefined, QueueState.Done);
      this.logger.log(`Synced all data!`, undefined, 0, "DONE");
    } catch (err) {
      this.logger.log(`\x1b[31mSync all-data failed!\x1b[0m`, undefined, 0, "ERR");
      await this.queueService.update(job.data.queueId, undefined, QueueState.Error);
    }
  }

  // @OnQueueActive()
  // onActive(job: Job) {
  //   this.logger.log(`Processing job "${job.id}"...`);
  // }
}