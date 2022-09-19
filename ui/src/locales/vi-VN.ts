import account from './vi-VN/account';
import assignment from './vi-VN/assignment';
import auth from './vi-VN/auth';
import component from './vi-VN/component';
import language from './vi-VN/language';
import notification from './vi-VN/notification';
import problem from './vi-VN/problem';
import scoreboard from './vi-VN/scoreboard';
import settings from './vi-VN/settings';
import site from './vi-VN/site';
import submission from './vi-VN/submission';
import system from './vi-VN/system';

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
