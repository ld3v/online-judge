import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import CustomLogger from "src/logger/customLogger";
import { QueueState } from "src/queue/queue.enum";
import { QueueService } from "src/queue/queue.service";

@Processor('submission')
export class SubmissionProcessor {
  constructor(
    private readonly logger: CustomLogger,
    private readonly queueService: QueueService,
  ) {}

  @Process('submission')
  async handleSyncAllData(job: Job) {
    try {
      this.logger.log(`Processing submission - job#${job.id} - queueEntity#${job.data.queueId}`, undefined, 0, "NEW");
      
      this.logger.log(`Handle submission`, undefined, 0, "DONE");
      await this.queueService.update(job.data.queueId, undefined, QueueState.Done);
    } catch (err) {
      this.logger.log(`\x1b[31mHandle submission failed!\x1b[0m`, undefined, 0, "ERR");
      // console.error(err);
      await this.queueService.update(job.data.queueId, undefined, QueueState.Error);
    }
  }
}