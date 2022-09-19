const CREATE_PASSWORD = 'CREATE_PASSWORD';
const RESET_PASSWORD = 'RESET_PASSWORD';
const VERIFY_EMAIL = 'VERIFY_EMAIL';
const REVERIFY_EMAIL = 'REVERIFY_EMAIL';
const NOTIFY_CHANGE_EMAIL = 'NOTIFY_CHANGE_EMAIL';
const NOTIFY_CHANGE_PASSWORD = 'NOTIFY_CHANGE_PASSWORD';
const NOTIFY_LOCK_ACCOUNT = 'NOTIFY_LOCK_ACCOUNT';
export type EMAIL_PURPOSE = 'CREATE_PASSWORD' | 'RESET_PASSWORD' | 'VERIFY_EMAIL' | 'REVERIFY_EMAIL' | 'NOTIFY_CHANGE_EMAIL' | 'NOTIFY_CHANGE_PASSWORD' | 'NOTIFY_LOCK_ACCOUNT';
// const INVITE = 'invite';

const MAP_PURPOSE_INFO = {
  [CREATE_PASSWORD]: {
    title: 'Create new password',
    template: 'create-password',
  },
  [RESET_PASSWORD]: {
    title: 'Renew your password',
    template: 'reset-password',
  },
  [VERIFY_EMAIL]: {
    title: 'Verify your email',
    template: 'email-verify',
  },
  [REVERIFY_EMAIL]: {
    title: 'Re-verify your email',
    template: 'email-reverify',
  },
  [NOTIFY_CHANGE_EMAIL]: {
    title: 'Your email has changed',
    template: 'notify-change-email',
  },
  [NOTIFY_CHANGE_PASSWORD]: {
    title: 'Your password has changed',
    template: 'notify-change-password',
  },
  [NOTIFY_LOCK_ACCOUNT]: {
    title: 'Your account has been disabled',
    template: 'notify-lock-account',
  },
  // [INVITE]: {
  //   title: 'You are invited to join eLib-application',
  //   template: 'invite',
  // },
};

export default {
  MAP_PURPOSE_INFO,
  CREATE_PASSWORD,
  RESET_PASSWORD,
  VERIFY_EMAIL,
  REVERIFY_EMAIL,
  NOTIFY_CHANGE_EMAIL,
  NOTIFY_CHANGE_PASSWORD,
  NOTIFY_LOCK_ACCOUNT,
};
