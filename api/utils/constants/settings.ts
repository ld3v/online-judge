export const SETTING_FIELDS_AVAILABLE = [
  'concurent_queue_process',
  // 'default_language_number', // Language -> Frontend manage
  // 'site_name', // Currently, we not support this field.
  // 'timezone', // Currently, server is in timezone 'Asia/Ho_Chi_Minh` (constant).
  // 'tester_path', // Config value -> ENV for constant variable
  // 'assignments_root', // Config value -> ENV for constant variable
  'file_size_limit',
  'output_size_limit',
  // 'queue_is_working', // Currently, it not support
  'default_late_rule',
  'enable_c_shield',
  'enable_cpp_shield',
  'enable_py2_shield',
  'enable_py3_shield',
  // 'enable_java_policy', // This field & `javaexceptions` field in assignment -> Unknown meaning, use for what?
  // 'enable_log', // Currently, it not support!
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
];

export const SETTING_FIELDS_MAPPING = {
  'concurent_queue_process': 'concurent_queue_process',
  'file_size_limit': 'file_size_limit',
  'output_size_limit': 'output_size_limit',
  'default_late_rule': 'default_late_rule',
  'enable_c_shield': 'enable_c_shield',
  'enable_cpp_shield': 'enable_cpp_shield',
  'enable_py2_shield': 'enable_py2_shield',
  'enable_py3_shield': 'enable_py3_shield',
  'submit_penalty': 'submit_penalty',
  'enable_registration': 'enable_registration',
  'moss_userid': 'moss_userid',
};
