import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CustomLogger from 'src/logger/customLogger';
import { Queue } from './entities/queue.entity';
import { QueueName, QueueState } from './queue.enum';
import { QueueRepository } from './queue.repository';
import { IAddQueue, TQueueTransformed } from './queue.types';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueRepository)
    private queueRepository: QueueRepository,
    private readonly logger: CustomLogger,
  ) {}

  public async add({ id, jobId, name, note, state, process }: IAddQueue) {
    const newQueue = new Queue();
    newQueue.id = id;
    newQueue.job_id = jobId ? `${jobId}` : undefined;
    newQueue.name = name;
    newQueue.note = note;
    newQueue.state = state;
    newQueue.process = process ? JSON.stringify(process) : undefined;
    return await this.queueRepository.save(newQueue);
  }

  public async updateJobId(queueId: string, jobId: number | string ) {
    if (!queueId) {
      this.logger.errorCustom(new Error(`Cannot update process because queueId is empty`));
      return null;
    }
    const queueProcess = await this.queueRepository.findOne(queueId);
    if (!queueProcess) {
      this.logger.errorCustom(new Error(`Cannot update process because queueId is not exist ("#${queueId}")`));
      return null;
    }
    queueProcess.job_id = jobId ? `${jobId}` : undefined;
    return await this.queueRepository.save(queueProcess);
  }

  public async update(queueId: string, processState?: [string, string], state?: string, ) {
    if (!queueId) {
      this.logger.errorCustom(new Error(`Cannot update process because queueId is empty`));
      return null;
    }
    const queueProcess = await this.queueRepository.findOne(queueId);
    if (!queueProcess) {
      this.logger.errorCustom(new Error(`Cannot update process because queueId is not exist ("#${queueId}")`));
      return null;
    }
    if (Array.isArray(processState) && processState.length === 2) {
      const currentProcess = queueProcess.process ? JSON.parse(queueProcess.process) : {};
      currentProcess[processState[0]] = processState[1];
      queueProcess.process = currentProcess;
    }
    if (state) {
      queueProcess.state = state;
    }
    return await this.queueRepository.save(queueProcess);
  }


  /**
   * Functions below use for get QUEUE's data
   */
  

  public async getCurrentProcess (queueName: QueueName): Promise<Queue> {
    const currentQueueProcess = await this.queueRepository.createQueryBuilder("q")
      .where("q.name = :queueName", { queueName })
      .where('q.state NOT IN (:...doneStates)', { doneStates: [QueueState.Done, QueueState.Error] })
      .orderBy("q.created_at", "DESC")
      .getOne();
    return currentQueueProcess;
  }

  public async getHistoryProcesses (queueName: QueueName): Promise<Queue[]> {
    const currentQueueProcess = await this.queueRepository.createQueryBuilder("q")
      .where("q.name = :queueName", { queueName })
      .where('q.state IN (:...doneStates)', { doneStates: [QueueState.Done, QueueState.Error] })
      .orderBy("q.created_at", "DESC")
      .getMany();
    return currentQueueProcess;
  }

  public transformData(...queues: Queue[]): TQueueTransformed[] {
    return queues.map(({ id, job_id, name, note, state, process, created_at }) => {
      return {
        id,
        jobId: job_id,
        name,
        note,
        state,
        process: process ? JSON.parse(process) : {},
        createdAt: created_at,
      };
    })
  }
}
