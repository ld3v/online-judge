export interface ISetting {
  concurent_queue_process: number;
  file_size_limit: number;
  output_size_limit: number;
  default_late_rule: string;
  enable_registration: boolean;
  // enable_c_shield: boolean;
  // enable_cpp_shield: boolean;
  // enable_py2_shield: boolean;
  // enable_py3_shield: boolean;
  submit_penalty: number;
  // moss_userid: number;
}

export type TSettingFindResult = Record<string, string>;