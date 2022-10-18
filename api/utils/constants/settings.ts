import { TSettingField } from "src/setting/setting.types";

export const SETTING_FIELDS_AVAILABLE = [
  // 'concurent_queue_process',
  // 'default_language_number', // Language -> Frontend manage
  // 'site_name', // Currently, we not support this field.
  // 'timezone', // Currently, server is in timezone 'Asia/Ho_Chi_Minh` (constant).
  // 'tester_path', // Config value -> ENV for constant variable
  // 'assignments_root', // Config value -> ENV for constant variable
  'file_size_limit',
  'output_size_limit',
  // 'queue_is_working', // Currently, it not support
  'default_late_rule',
  // 'enable_c_shield',
  // 'enable_cpp_shield',
  // 'enable_py2_shield',
  // 'enable_py3_shield',
  // 'enable_java_policy', // This field & `javaexceptions` field in assignment -> Unknown meaning, use for what?
  'enable_log',
  'submit_penalty',
  'enable_registration',
  // 'registration_code', // Unknown meaning, use for what?
  // Mail config -> constant
  // 'mail_from',
  // 'mail_from_name',
  // Mail template -> Code
  // 'reset_password_mail',
  // 'add_user_mail',
  'moss_userid',
  // Pagination config -> Frontend manage
  // 'results_per_page_all',
  // 'results_per_page_final',
  // Not use in currently.
  // 'week_start',
  // New field for this version
  'default_coefficient_rules',
];

export const SETTING_FIELDS_MAPPING: Record<string, TSettingField> = {
  'file_size_limit': 'file_size_limit',
  'output_size_limit': 'output_size_limit',
  'default_late_rule': 'default_late_rule',
  'submit_penalty': 'submit_penalty',
  'enable_registration': 'enable_registration',
  'moss_userid': 'moss_userid',
  'enable_log': 'enable_log',
};

export const DEFAULT_SETTING_VALUES: Record<TSettingField, any> = {
  file_size_limit: 500,
  output_size_limit: 1024,
  default_late_rule:
    `/* 
    * Put coefficient (from 100) in variable $coefficient.
    * You can use variables $extra_time and $delay.
    * $extra_time is the total extra time given to users
    * (in seconds) and $delay is number of seconds passed
    * from finish time (can be negative).
    *  In this example, $extra_time is 172800 (2 days):
    */
   if ($delay<=0)
     // no delay
     $coefficient = 100;
   
   elseif ($delay<=3600)
     // delay less than 1 hour
     $coefficient = ceil(100-((30*$delay)/3600));
   
   elseif ($delay<=86400)
     // delay more than 1 hour and less than 1 day
     $coefficient = 70;
   
   elseif (($delay-86400)<=3600)
     // delay less than 1 hour in second day
     $coefficient = ceil(70-((20*($delay-86400))/3600));
   
   elseif (($delay-86400)<=86400)
     // delay more than 1 hour in second day
     $coefficient = 50;
   
   elseif ($delay > $extra_time)
     // too late
     $coefficient = 0;`,
  default_coefficient_rules: '',
  enable_registration: false,
  moss_userid: 0,
  submit_penalty: 300,
  enable_log: true,
}
