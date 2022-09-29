export enum QueueName {
  SettingSyncAllData = 'syncAllData',
  Submission = 'submission',
};

export enum QueueState {
  Done = 'DONE',
  Error = 'ERR',
  Waiting = 'WAIT',
  Processing = 'PROCESS',
  Create = 'CREATED',
}