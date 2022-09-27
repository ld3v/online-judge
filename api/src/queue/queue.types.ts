import { QueueName, QueueState } from "./queue.enum";

export interface IAddQueue {
  id?: string;
  jobId?: number | string;
  name: QueueName;
  note?: string;
  process?: Record<string, QueueState>;
  state?: QueueState;
}
export type TQueueTransformed = {
  id: string;
  jobId: number | string;
  name: string;
  note: string;
  process: Record<string, QueueState>;
  state: string;
  createdAt: Date;
}