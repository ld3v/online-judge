export default {
  // Actions
  'account.update': 'Cập nhật tài khoản',
  'account.update.success': 'Cập nhật tài khoản thành công!',
  'account.state': '{isLock, select, true {Khoá} other {Mở khoá}} tài khoản',
  'account.state.success': '{isLock, select, true {Khoá} other {Mở khoá}} tài khoản thành công!',
  'account.reset-password': 'Đặt lại mật khẩu',
  'account.reset-password.success': 'Đặt lại mật khẩu thành công!',
  'account.search': 'Tìm bằng tên, email, hoặc tên đăng nhập',
  // Table
  'account.table.display-name': 'Tên hiển thị',
  'account.table.username': 'Tên đăng nhập',
  'account.table.role': 'Role',
  'account.table.created-at': 'Tạo lúc',
  // Roles
  'account.roles.admin': 'Quản trị viên',
  'account.roles.user': 'Học viên',
  'account.roles.unknown': '--',
  // Warning
  'account.alert.update-root.title': 'Bạn đang cập nhật tài khoản "root"',
  'account.alert.update-root.description': '<ul>{isMe, select, true {} other {<li>Bạn không thể đặt lại mật khẩu cho tài khoản này!</li>}}<li>Bạn không thể sửa role hoặc khoá tài khoản này!</li></ul>',
  'account.alert.update-me.title': 'Cẩn thận!',
  'account.alert.update-me.description': 'Bạn đang <b>chỉnh sửa thông tin của chính mình</b>!',
  // Disable-account
  'account.disable.title': 'Vô hiệu hoá tài khoản',
  'account.disable.submit-title': 'Khoá tài khoản này',
  'account.disable.description.lock-me': 'Bạn đang vô hiệu hoá tài khoản của mình! Bạn sẽ bị đăng xuất nếu tiếp tục!',
  'account.disable.description.no-email': 'Tài khoản này sẽ không nhận được thông báo vì chưa cập nhật email',
  'account.disable.reason.placeholder': 'Lý do vô hiệu hoá tài khoản',
  // Enable-account
  'account.enable.title': 'Kích hoạt tài khoản',
  'account.enable.reason.description': 'Tài khoản này đã bị vô hiệu hoá vào lúc <b>{time}</b> kèm lý do <b>"{reason}"</b>',
  'account.enable.submit-title': 'Mở khoá tài khoản này',
  // Form
  'account.update.submit': 'Cập nhật',
  'account.form.display-name.label': 'Tên hiển thị',
  'account.form.display-name.placeholder': 'Nguyễn Văn A',
  'account.form.email.label': 'Địa chỉ email',
  'account.form.email.placeholder': 'user01@uit.edu.vn',
  'account.form.role.label': 'Role',
  'account.form.username.label': 'Tên đăng nhập',
  'account.form.username.placeholder': 'admin',
  // Exceptions
  'exception.account.disable.reason.required': 'Vui lòng nhập lý do',
  'exception.account.form.username.required': 'Vui lòng nhập tên đăng nhập',
  'exception.account.form.display-name.required': 'Vui lòng nhập tên hiển thị',
  'exception.account.form.email.required': 'Vui lòng nhập địa chỉ email',
  'exception.account.form.username.label.required': 'Vui lòng nhập tên đăng nhập',
  'exception.account.no-edit': 'Bạn không đủ quyền để cập nhật thông tin tài khoản này!',
  'exception.account.no-access':
    'Bạn không thể truy cập vì tài khoản của bạn đã bị khoá!',
  'exception.account.no-update': 'Bạn không thể cập nhật thông tin cho tài khoản này!',
  'exception.account.exist':
    '{isMany, select, true {Các t} other {T}}ài khoản này đã tồn tại trong hệ thống!',
  'exception.account.exist.username': 'Tên tài khoản {username} đã tồn tại trong hệ thống!',
  'exception.account.notfound':
    '{isMany, select, true {Các t} other {T}}ài khoản này không tồn tại trong hệ thống!',
  'exception.account.notfound.username':
    "Không tìm thấy tài khoản nào cho tên tài khoản '{username}'",
};
