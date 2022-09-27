export enum QueueName {
  SettingSyncAllData = 'syncAllData',
  CodeRun = 'codeRun',
};

export enum QueueState {
  Done = 'DONE',
  Error = 'ERR',
  Waiting = 'WAIT',
  Processing = 'PROCESS',
  Create = 'CREATED',
}