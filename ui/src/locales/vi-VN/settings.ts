//'concurent_queue_process': 'concurent_queue_process',
// 'file_size_limit': 'file_size_limit',
// 'output_size_limit': 'output_size_limit',
// 'default_late_rule': 'default_late_rule',
// 'enable_c_shield': 'enable_c_shield',
// 'enable_cpp_shield': 'enable_cpp_shield',
// 'enable_py2_shield': 'enable_py2_shield',
// 'enable_py3_shield': 'enable_py3_shield',
// 'submit_penalty': 'submit_penalty',
// 'enable_registration': 'enable_registration',
// 'moss_userid': 'moss_userid',
export default {
  // Main
  'settings.update-info.success': 'Cập nhật cấu hình hệ thống thành công!',
  // Form
  'settings.form.configuration.title': 'Cấu hình ứng dụng',

  'settings.form.configuration.concurent_queue_process.label': 'Số tiến trình hàng đợi',
  'settings.form.configuration.concurent_queue_process.placeholder': '2',
  'settings.form.configuration.concurent_queue_process.required': 'Không được để trống',

  'settings.form.configuration.file_size_limit.label': 'Giới hạn kích thước tệp (kB)',
  'settings.form.configuration.file_size_limit.placeholder': '50000',
  'settings.form.configuration.file_size_limit.required': 'Không được để trống',

  'settings.form.configuration.output_size_limit.label': 'Giới hạn kích thước output (kB)',
  'settings.form.configuration.output_size_limit.placeholder': '1024',
  'settings.form.configuration.output_size_limit.required': 'Không được để trống',

  'settings.form.configuration.default_late_rule.label': 'Coefficient-rule mặc định',
  'settings.form.configuration.default_late_rule.placeholder': 'default_late_rule',
  'settings.form.configuration.default_late_rule.required': 'Không được để trống',

  'settings.form.configuration.submit_penalty.label': 'Submit penaly',
  'settings.form.configuration.submit_penalty.placeholder': '300',
  'settings.form.configuration.submit_penalty.required': 'Không được để trống',

  'settings.form.configuration.enable_registration.label': 'Cho phép đăng ký?',
  'settings.form.configuration.enable_registration.description': 'Cho phép bất kỳ ai tạo mới 1 tài khoản',

  'settings.form.configuration.moss_userid.label': 'Moss userID',
  'settings.form.configuration.moss_userid.placeholder': 'moss_userid',
  'settings.form.configuration.moss_userid.required': 'Không được để trống',
  // Sync configuration
  'settings.sync-configuration': 'Đồng bộ cấu hình hệ thống',
  'settings.sync-configuration.description': 'Đồng bộ với hệ thống cũ {judgeURL, select, false {} other {trên URL: "{judgeURL}"}}.<br>Bạn có thể thay đổi đường dẫn trong ENV của backend.',
  'settings.sync-configuration.submit-title': 'Đồng bộ',
  'settings.sync-configuration.success': 'Đồng bộ thành công',
  // Sync data
  'settings.sync-data': 'Đồng bộ dữ liệu',
};
