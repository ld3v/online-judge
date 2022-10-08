export interface ISetting {
  file_size_limit: number;
  output_size_limit: number;
  default_late_rule: string;
  enable_registration: boolean;
  submit_penalty: number;
  // moss_userid: number;
}

export type TSettingField = 'file_size_limit' | 'output_size_limit' | 'default_late_rule' | 'submit_penalty' | 'moss_userid' | 'enable_registration' | 'enable_log';

export type TSettingFindResult = Record<string, string>;