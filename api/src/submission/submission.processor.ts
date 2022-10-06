import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import * as childProcess from "child_process";
import { addDir, addFile } from "common/file.helper";
import CustomLogger from "src/logger/customLogger";
import { QueueState } from "src/queue/queue.enum";
import { QueueService } from "src/queue/queue.service";
import { SettingService } from "src/setting/setting.service";
import { promisify } from "util";
import { SETTING_FIELDS_MAPPING } from "utils/constants/settings";
const exec = promisify(childProcess.exec);

export const SUBMISSION_PROCESS_KEY = { GET_CONFIGURATION: 'get-configuration', }

@Processor('submission')
export class SubmissionProcessor {
  constructor(
    private readonly logger: CustomLogger,
    private readonly queueService: QueueService,
    private readonly settingService: SettingService,
  ) {}
  
  @Process('submission')
  async handleSubmission(job: Job) {
    const {
      username,
      filename,
      fileExtension,
      problemId,
      submissionId,
      timeLimit,
      timeLimitInt,
      memoryLimit,
      diffCmd,
      diffArg,
      problemScore,
    } = job.data;
    
    try {
      this.logger.log(`Processing submission - job#${job.id}`, undefined, 0, "NEW");
      
      // Calculate
      const {
        settings: settingMapping,
        keysNotFound: settingFieldKeysNotFound,
      } = await this.settingService.getByFields(
        SETTING_FIELDS_MAPPING.output_size_limit,
        SETTING_FIELDS_MAPPING.enable_log,
      );
      
      if (
        settingFieldKeysNotFound.includes(SETTING_FIELDS_MAPPING.output_size_limit) ||
        settingFieldKeysNotFound.includes(SETTING_FIELDS_MAPPING.enable_log)
      ) {
        await this.queueService.update(
          `${job.id}`,
          [
            SUBMISSION_PROCESS_KEY.GET_CONFIGURATION,
            QueueState.Error,
          ],
        );
        return;
      }
      
      const settingOutputSizeLimit = settingMapping[SETTING_FIELDS_MAPPING.output_size_limit];
      const outputSizeLimit = Number(settingOutputSizeLimit) * 1024;
      const testerPath = './common/run-code';
      // When run with upload dir, script will run at './common/run-code/jail-{random-str}' -> Need add prefix '../../../' for dir path.
      const problemSolutionsDir = `../../../upload/solutions-result/${problemId}`;
      const userSolutionsDir = `../../../upload/solutions/${username}`;
      // Diff with upload path, when run logs, script will run at './common/run-code' -> Just need add prefix '../../' for this path.
      const logFilePath = `../../logs/solution_${submissionId}.log`;
      const logEnabled = settingFieldKeysNotFound[SETTING_FIELDS_MAPPING.enable_log] ? "1" : "0";
      
      await addFile('./logs', `solution_${submissionId}.log`, `${Date.now()}`);
      await addDir(problemSolutionsDir);
      await addDir(userSolutionsDir);
      
      /**
       * ### SHELL COMMAND DESCRIPTION:                                                                                                               
       * cd {testerPath}
       *                                                                                                                                               
       * -----                                                                                                                                        
       * $1: `problemSolutionsDir` - Problem's dir, which store admin's solution files (uploaded by admin).                                           
       * $2: `userSolutionsDir` - Problem's dir, which store user's solution files (uploaded by user).                                                
       *      -> need to test with admin's solutions.                                                                                                 
       * $3: `logFilePath` - All of progress will log to this file.                                                                                   
       * $4: `filename` - File need to check (uploaded by user).                                                                                      
       * $5: `fileExt` - File's extension -> Compile, run when process job.                                                                           
       * $6: `timeLimit` - Limit of time to execute user's solution.                                                                                  
       * $7: `timeLimitInt` - Same `timeLimit`, but type of it is `integer`.                                                                          
       * $8: `memoryLimit` - Limit of memory to store user's solution.                                                                                
       * $9: `outputSizeLimit` - Setting valuable (in settings). (TBU...)                                                                             
       * $10: `diffCmd` - Difference command, which command run in linux.                                                                             
       * $11: `diffCmd` - Difference arguments, arguments for diff-command.                                                                           
       * $12: `logEnabled` - Set in settings. allow write log to file, while compile, run & test user's solution.
       */
      const shellCmd = `cd ${testerPath};\n./tester.sh ${problemSolutionsDir} ${userSolutionsDir} ${logFilePath} ${filename} ${fileExtension} ${timeLimit} ${timeLimitInt} ${memoryLimit} ${outputSizeLimit} ${diffCmd} '${diffArg}' ${logEnabled}`;
      this.logger.log(`Exec command: ${shellCmd}`, undefined, 1, "INFO");
      const shellOutput = await exec(shellCmd);
      this.logger.log(`Result of exec command`, undefined, 1, "PROCESSING");
      this.logger.log(`OUT: ${shellOutput.stdout}`, undefined, 2, "INFO")
      this.logger.log(`ERR: ${shellOutput.stderr}`, undefined, 2, "INFO")
      await this.queueService.update(`${job.id}`, undefined, QueueState.Done);
    } catch (err) {
      this.logger.log(`\x1b[31mHandle submission failed!\x1b[0m`, undefined, 0, "ERR");
      console.error(err);
      await this.queueService.update(`${job.id}`, undefined, QueueState.Error);
    }
  }
}
