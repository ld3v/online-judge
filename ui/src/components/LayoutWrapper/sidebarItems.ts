import { ROLES } from '@/utils/constants';

export default [
  {
    key: 'sidebar-dashboard',
    title: 'site.dashboard',
    href: '/dashboard',
    roleAccessible: [ROLES.admin, ROLES.user],
  },
  {
    key: 'sidebar-assignments-manage',
    title: 'site.assignments-manage',
    href: '/assignments-manage',
    roleAccessible: [ROLES.admin],
  },
  {
    key: 'sidebar-assignments-manage-create',
    title: 'site.assignments-manage.create',
    href: '',
    roleAccessible: [ROLES.admin],
  },
  {
    key: 'sidebar-assignments-manage-update',
    title: 'site.assignments-manage.update',
    href: '',
    roleAccessible: [ROLES.admin],
  },
  {
    key: 'sidebar-problems-manage',
    title: 'site.problems-manage',
    href: '/problems-manage',
    roleAccessible: [ROLES.admin],
  },
  {
    key: 'sidebar-problems-manage-create',
    title: 'site.problems-manage.create',
    href: '',
    roleAccessible: [ROLES.admin],
  },
  {
    key: 'sidebar-problems-manage-update',
    title: 'site.problems-manage.update',
    href: '',
    roleAccessible: [ROLES.admin],
  },
  {
    key: 'sidebar-my-assignments',
    title: 'site.my-assignments',
    href: '/assignments',
    roleAccessible: [ROLES.user],
  },
  {
    key: 'sidebar-my-problems',
    title: 'site.my-problems',
    href: '/problems',
    roleAccessible: [ROLES.user],
  },
  // {
  //   key: 'sidebar-codeEditor',
  //   title: 'site.code_editor',
  //   href: '/code-editor',
  //   roleAccessible: [ROLES.admin, ROLES.user],
  // },
  {
    key: 'sidebar-submissions',
    title: 'site.submissions',
    href: '/submissions',
    roleAccessible: [ROLES.admin, ROLES.user],
  },
  {
    key: 'sidebar-scoreBoards',
    title: 'site.scoreboard',
    href: '/score-boards',
    roleAccessible: [ROLES.admin, ROLES.user],
  },
  {
    key: 'sidebar-accounts',
    title: 'site.accounts',
    href: '/accounts',
    roleAccessible: [ROLES.admin],
  },
  {
    key: 'sidebar-accounts-manage-update',
    title: 'site.accounts.update',
    href: '',
    roleAccessible: [ROLES.admin],
  },
  {
    key: 'sidebar-settings',
    title: 'site.settings',
    href: '/settings',
    roleAccessible: [ROLES.admin],
  },
];
