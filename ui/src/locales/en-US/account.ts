export default {
  // Actions
  'account.update': 'Update account',
  'account.update.success': 'Update account successfully!',
  'account.state': '{isLock, select, true {Lock} other {Unlock}} account',
  'account.state.success': '{isLock, select, true {Lock} other {Unlock}} account successfully!',
  'account.reset-password': 'Reset password',
  'account.reset-password.success': 'Reset password successfully!',
  'account.search': 'Search with name, email, or username',
  // Table
  'account.table.display-name': 'Display name',
  'account.table.username': 'Username',
  'account.table.role': 'Role',
  'account.table.created-at': 'Created at',
  // Roles
  'account.roles.admin': 'Admin',
  'account.roles.user': 'User',
  'account.roles.unknown': '--',
  // Warning
  'account.alert.update-root.title': 'You are updating "root" account',
  'account.alert.update-root.description': '<ul>{isMe, select, true {} other {<li>You can not reset password for this account!</li>}}<li>You can not change role or lock this account!</li></ul>',
  'account.alert.update-me.title': 'Be careful!',
  'account.alert.update-me.description': 'You are <b>updating your account</b>!',
  // Disable-account
  'account.disable.title': 'Disable account',
  'account.disable.submit-title': 'Lock this account',
  'account.disable.description.lock-me': 'You are disabling your account! You will be log-out if continue!',
  'account.disable.description.no-email': 'This account will not receive notifications because the email has not been updated!',
  'account.disable.reason.placeholder': 'Reason to disable this account',
  // Enable-account
  'account.enable.title': 'Enable account',
  'account.enable.reason.description': 'This account locked at <b>{time}</b> with reason <b>"{reason}"</b>',
  'account.enable.submit-title': 'Unlock this account',
  // Form
  'account.form.display-name.label': 'Display name',
  'account.form.display-name.placeholder': 'Nguyen Van A',
  'exception.account.form.display-name.required': 'Please enter display-name',
  'account.form.email.label': 'Email address',
  'account.form.email.placeholder': 'user01@uit.edu.vn',
  'exception.account.form.email.required': 'Please enter an email address',
  'account.form.role.label': 'Role',
  'account.form.username.label': 'Username',
  // Exceptions
  'exception.account.disable.reason.required': 'Please enter your reason',
  'exception.account.no-edit': 'You have not enough permission to edit this account!',
  'exception.account.no-access':
    'You can not access because this account was locked!',
  'exception.account.no-update': 'You can not update information for this account!',
  'exception.account.exist':
    '{isMany, select, true {These accounts are} other {This account is}} existed in the system!',
  'exception.account.exist.username': "This username '{username}' is existed in the system",
  'exception.account.notfound':
    '{isMany, select, true {These accounts are} other {This account is}} not existed in the system!',
  'exception.account.notfound.username': "No accounts was found for '{username}'",
};
