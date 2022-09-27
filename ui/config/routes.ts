import { AUTH_HANDLER_PATH, FORGOT_PASSWORD_PATH, LOGIN_PATH, MAINTENANCE_PATH, REGISTER_PATH } from '../src/utils/constants';

export default [
  {
    path: LOGIN_PATH,
    layout: false,
    name: 'Login',
    component: './Auth/Login',
  },
  {
    path: REGISTER_PATH,
    layout: false,
    name: 'Register',
    component: './Auth/Register',
  },
  {
    path: FORGOT_PASSWORD_PATH,
    layout: false,
    name: 'Forgot password',
    component: './Auth/ForgotPassword',
  },
  {
    path: AUTH_HANDLER_PATH,
    layout: false,
    name: 'Auth',
    component: './Auth',
  },
  {
    path: MAINTENANCE_PATH,
    layout: false,
    name: 'Maintenance',
    component: './Exceptions/Maintenance',
  },
  // TEST
  {
    path: '_test/upload',
    layout: false,
    name: 'Test feature upload',
    component: './Test/Upload',
  },
  {
    path: '/',
    layout: false,
    component: '../components/LayoutWrapper',
    routes: [
      {
        path: 'dashboard',
        name: 'site.dashboard',
        component: './Dashboard',
      },
      {
        path: 'assignments-manage',
        name: 'site.assignments-manage',
        component: './AssignmentsMgnt',
      },
      // Actions for managing assignment.
      {
        path: 'assignments-manage/create',
        name: 'site.assignments-manage.create',
        component: './AssignmentsMgnt/Create',
      },
      {
        path: 'assignments-manage/:id/update',
        name: 'site.assignments-manage.update',
        component: './AssignmentsMgnt/Update',
      },
      // End - Action - Mange Assignments.
      {
        path: 'problems-manage',
        name: 'site.problems-manage',
        component: './ProblemsMgnt',
      },
      // Actions for managing problem.
      {
        path: 'problems-manage/create',
        name: 'site.problems-manage.create',
        component: './ProblemsMgnt/Create'
      },
      {
        path: 'problems-manage/:id/update',
        name: 'site.problems-manage.update',
        component: './ProblemsMgnt/Update'
      },
      // End - Action - Mange Problems.
      {
        path: 'assignments',
        name: 'site.my-assignments',
        component: './Assignments',
      },
      {
        path: 'problems',
        name: 'site.my-problems',
        component: './Problems',
      },
      {
        path: 'problems/:assignmentId',
        name: 'site.my-problems',
        component: './Problems',
      },
      {
        path: 'submissions',
        name: 'site.submissions',
        component: './Submissions',
      },
      {
        path: 'submissions/:assignmentId',
        name: 'site.submissions',
        component: './Submissions',
      },
      {
        path: 'score-boards',
        name: 'site.scoreboard',
        component: './ScoreBoards',
      },
      {
        path: 'score-boards/:assignmentId',
        name: 'site.scoreboard',
        component: './ScoreBoards',
      },
      {
        path: 'accounts',
        name: 'site.accounts',
        component: './Accounts',
      },
      // Actions for managing accounts.
      {
        path: 'accounts/me',
        name: 'site.accounts.update',
        component: './Accounts/UpdateMe'
      },
      {
        path: 'accounts/:id/update',
        name: 'site.accounts.update',
        component: './Accounts/Update'
      },
      // End - Action - Mange accounts.
      {
        path: 'settings',
        name: 'site.settings',
        component: './Settings',
      },
      {
        path: '*',
        redirect: '/dashboard',
      },
    ],
  },
  {
    path: '*',
    redirect: '/',
  },
];
