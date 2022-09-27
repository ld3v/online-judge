export type TQueueName = "syncAllData" | "codeRun";
export type TQueueState = "DONE" | "ERR" | "WAIT" | "PROCESS" | "CREATED";

export type TQueue = {
  id: string;
  jobId: string;
  name: TQueueName;
  note: string;
  state: TQueueState;
  process: Record<string, TQueueState>;
  createdAt: Date;
}