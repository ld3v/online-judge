import locale from 'antd/lib/date-picker/locale/en_US';
import account from './en-US/account';
import assignment from './en-US/assignment';
import auth from './en-US/auth';
import component from './en-US/component';
import language from './en-US/language';
import notification from './en-US/notification';
import problem from './en-US/problem';
import scoreboard from './en-US/scoreboard';
import settings from './en-US/settings';
import site from './en-US/site';
import submission from './en-US/submission';
import system from './en-US/system';

export default {
  ...auth,
  ...account,
  ...assignment,
  ...submission,
  ...scoreboard,
  ...problem,
  ...language,
  ...site,
  ...system,
  ...component,
  ...settings,
  ...notification,
};

// DatePicker locale
export const START_TIME_LOCALE = {
  ...locale,
  lang: {
    ...locale.lang,
    placeholder: 'Start time',
  },
};
export const FINISH_TIME_LOCALE = {
  ...locale,
  lang: {
    ...locale.lang,
    placeholder: 'Finish time',
  },
};
