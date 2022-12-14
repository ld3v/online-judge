import { ROLES } from '@/utils/constants';

// Workaround, should be update to regex soon!
export const MAP_ROLE2ROUTE = {
  [ROLES.admin]: [
    'site.dashboard',
    'site.assignments-manage',
    'site.assignments-manage.create',
    'site.assignments-manage.update',
    'site.problems-manage',
    'site.problems-manage.create',
    'site.problems-manage.update',
    'site.submissions',
    'site.scoreboard',
    'site.accounts',
    'site.accounts.update',
    'site.settings',
  ],
  [ROLES.user]: [
    'site.dashboard',
    'site.my-assignments',
    'site.my-problems',
    'site.submissions',
    'site.scoreboard',
  ]
}
export default {
  'site.dashboard': {
    key: 'sidebar-dashboard',
    title: 'site.dashboard',
    href: '/dashboard',
  },
  'site.assignments-manage': {
    key: 'sidebar-assignments-manage',
    title: 'site.assignments-manage',
    href: '/assignments-manage',
  },
  'site.assignments-manage.create': {
    key: 'sidebar-assignments-manage-create',
    title: 'site.assignments-manage.create',
    href: '',
  },
  'site.assignments-manage.update': {
    key: 'sidebar-assignments-manage-update',
    title: 'site.assignments-manage.update',
    href: '',
  },
  'site.problems-manage': {
    key: 'sidebar-problems-manage',
    title: 'site.problems-manage',
    href: '/problems-manage',
  },
  'site.problems-manage.create': {
    key: 'sidebar-problems-manage-create',
    title: 'site.problems-manage.create',
    href: '',
  },
  'site.problems-manage.update': {
    key: 'sidebar-problems-manage-update',
    title: 'site.problems-manage.update',
    href: '',
  },
  'site.my-assignments': {
    key: 'sidebar-my-assignments',
    title: 'site.my-assignments',
    href: '/assignments',
  },
  'site.my-problems': {
    key: 'sidebar-my-problems',
    title: 'site.my-problems',
    href: '/problems',
  },
  'site.submissions': {
    key: 'sidebar-submissions',
    title: 'site.submissions',
    href: '/submissions',
  },
  'site.scoreboard': {
    key: 'sidebar-scoreBoards',
    title: 'site.scoreboard',
    href: '/score-boards',
  },
  'site.accounts': {
    key: 'sidebar-accounts',
    title: 'site.accounts',
    href: '/accounts',
  },
  'site.accounts.update': {
    key: 'sidebar-accounts-manage-update',
    title: 'site.accounts.update',
    href: '',
  },
  'site.settings': {
    key: 'sidebar-settings',
    title: 'site.settings',
    href: '/settings',
  },
};
