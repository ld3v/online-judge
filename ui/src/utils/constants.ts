import { TAccountRole } from '@/types/account';
import { TCoefficientRuleField, TCoefficientRuleType } from '@/types/assignment';

// ROLE
export const ROLES: Record<'admin' | 'user', TAccountRole> = {
  admin: 'admin',
  user: 'user',
};
export const ROLE: TAccountRole[] = ['admin', 'user'];
// PATH
export const AUTH_PATH = '/login';
export const LOGIN_PATH = '/login';
export const REGISTER_PATH = '/register';
export const FORGOT_PASSWORD_PATH = '/forgot-password';
export const AUTH_HANDLER_PATH = '/auth';
export const MAINTENANCE_PATH = '/maintenance';
export const NON_AUTH_PATHS = [
  '/',
  LOGIN_PATH,
  `${LOGIN_PATH}/`,
  REGISTER_PATH,
  `${REGISTER_PATH}/`,
  FORGOT_PASSWORD_PATH,
  `${FORGOT_PASSWORD_PATH}/`,
];
export const NON_AUTH_NOT_REDIRECT_PATHS = [
  AUTH_PATH,
  `${AUTH_PATH}/`,
  AUTH_HANDLER_PATH,
  `${AUTH_HANDLER_PATH}/`,
  MAINTENANCE_PATH,
  `${MAINTENANCE_PATH}/`,
  '_test/upload',
  '_test/upload/',
]

export const EMPTY_VALUE = '--';
export const FORMAT_DATETIME = 'DD/MM/YYYY HH:mm';

// Setting
export const MAX_ASSIGNMENTS_USING_PROBLEM = 1;
export const SETTING_FIELDS_MAPPING = {
  'file_size_limit': 'file_size_limit',
  'output_size_limit': 'output_size_limit',
  'default_late_rule': 'default_late_rule',
  'submit_penalty': 'submit_penalty',
  'enable_registration': 'enable_registration',
  'moss_userid': 'moss_userid',
};
export const COEFFICIENT_RULE_TYPES: TCoefficientRuleType[] = ["VARIANT_OVER_TIME", "CONST"];
export const COEFFICIENT_RULE_FIELD_MAPPING: { [field: string]: TCoefficientRuleField } = {
  delayRange: "DELAY_RANGE",
  baseMins: "BASE_MINS",
  variantOverTime: "VARIANT_OVER_TIME",
  const: "CONST",
};

// REGEX
export const EMAIL_REGEX = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
