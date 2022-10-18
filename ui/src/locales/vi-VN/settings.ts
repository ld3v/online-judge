export default {
  // Main
  'settings.update-info.success': 'Cập nhật cấu hình hệ thống thành công!',
  // Form
  'settings.form.configuration.title': 'Cấu hình ứng dụng',

  'settings.form.configuration.file_size_limit.label': 'Giới hạn kích thước tệp (kB)',
  'settings.form.configuration.file_size_limit.placeholder': '50000',
  'settings.form.configuration.file_size_limit.required': 'Không được để trống',

  'settings.form.configuration.output_size_limit.label': 'Giới hạn kích thước output (kB)',
  'settings.form.configuration.output_size_limit.placeholder': '1024',
  'settings.form.configuration.output_size_limit.required': 'Không được để trống',

  'settings.form.configuration.default_coefficient_rules.label': 'Thiết lập hệ số mặc định',
  'settings.form.configuration.default_coefficient_rules.placeholder': 'default_coefficient_rules',
  'settings.form.configuration.default_coefficient_rules.required': 'Không được để trống',
  'settings.form.configuration.default_coefficient_rules.description': '- Đọc tài liệu <a href="">này</a> để hiểu rõ về cách sử dụng và cách hoạt động.',

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
  'settings.sync-configuration.success': 'Đồng bộ thành công! Vui lòng tải lại trang để cập nhật cấu hình mới nhất!',
  // Sync data
  'settings.sync-all-data': 'Đồng bộ toàn bộ dữ liệu',
  'settings.sync-all-data.description': 'Thao tác này sẽ <b>lấy toàn bộ dữ liệu hiện có trên hệ thống cũ</b> và sử dụng nó để <b>tạo mới trên hệ thống hiện tại</b>. Tất nhiên, để an toàn, các <b>dữ liệu liên quan sẽ bị xoá</b> trước khi đồng bộ!<br />Vì vậy, hãy cẩn thận khi sử dụng tính năng này!',
  'settings.sync-all-data.no-processing': 'Không có tiến trình nào đang thực hiện!',
  'settings.sync-all-data.sync-button-title': 'Đồng bộ ngay bây giờ',
  'settings.sync-all-data.history-title': 'Lịch sử đồng bộ',
  'settings.sync-all-data.process.current.title': 'Đang đồng bộ... - <small>(jobId#{jobId} - queueId#{queueId})</small>.',
  'settings.sync-all-data.process.title': 'Đồng bộ lúc <i>{time}</i> - <small>(jobId#{jobId} - queueId#{queueId})</small>.',
  // Sync data - Items
  'settings.sync-all-data.process._.assignment': 'Cập nhật bài thi.',
  'settings.sync-all-data.process._.problem': 'Cập nhật vấn đề.',
  'settings.sync-all-data.process._.assignment-problems': 'Thêm vấn đề vào bài thi tương ứng.',
  'settings.sync-all-data.process._.account': 'Cập nhật tài khoản.',
  'settings.sync-all-data.process._.problem-languages': 'Thêm ngôn ngữ vào vấn đề tương ứng.',
  'settings.sync-all-data.process._.language': 'Cập nhật ngôn ngữ.',

  // Exceptions
  'exception.settings.sync-configuration.failed': 'Đồng bộ thất bại! Vui lòng thử lại sau!',
  'exception.settings.sync-all-data.process-empty-info': '<Lỗi không mong muốn đã xảy ra trong quá trình hiển thị dữ liệu cho tiến trình này>.',
  'exception.settings.sync-all-data.history.empty': 'Không có lần đồng bộ dữ liệu nào!',
};
