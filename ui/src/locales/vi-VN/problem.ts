export default {
  'problem.no-langs': 'Không có ngôn ngữ nào',
  'problem.no-assignments': 'Không có bài thi nào',
  'problem.add': 'Tạo mới vấn đề',
  'problem.create': 'Tạo mới vấn đề',
  'problem.create.success': 'Tạo vấn đề thành công',
  'problem.update': 'Chỉnh sửa thông tin vấn đề',
  'problem.update.success': 'Cập nhật vấn đề thành công',
  'problem.delete': 'Xoá vấn đề',
  'problem.delete.success': 'Xoá vấn đề thành công',
  'problem.do-problem.title': 'Bài làm',
  'problem.search': 'Tìm bằng tên hoặc chú thích,...',
  'problem.assignment-using.extra': '+ {count} bài thi',
  'problem.lang-using.extra': '+ {count} ngôn ngữ',
  'problem.my.no-assignment-selected': 'Không có bài thi nào được chọn! Chọn 1 bài thi bên dưới để tiếp tục!',
  'problem.my.assignment-not-found': 'Không tìm thấy bài thi! Chọn 1 bài thi bên dưới để tiếp tục!',
  // Table
  'problem.table.view.problem-list': 'Danh sách vấn đề',
  'problem.table.name': 'Tên hiển thị',
  'problem.table.score': 'Điểm',
  // Form
  'problem.form.code.label': 'Code',
  'problem.form.code.placeholder': 'Nhập code của bạn ở đây',
  'problem.form.name.label': 'Tên vấn đề',
  'problem.form.name.placeholder': 'Bài toán đơn giản làm quen',
  'problem.form.content.label': 'Nội dung',
  'problem.form.content.description': 'Bạn có thể sử dụng markdown định dạng văn bản',
  'problem.form.admin-note.label': 'Chú thích cho quản trị viên',
  'problem.form.admin-note.description': 'Chỉ có quản trị viên mới xem được thông tin này',
  'problem.form.admin-note.placeholder': 'Vấn đề này được sử dụng cho...',
  'problem.form.diff-command.label': 'Lệnh <code>diff</code>',
  'problem.form.diff-command.command.placeholder': 'diff',
  'problem.form.diff-command.arguments.placeholder': '-bB',
  'problem.form.languages.label': 'Ngôn ngữ sử dụng',
  'problem.form.languages.description': 'Chọn và thiết lập <b>giới hạn thời gian</b> và <b>giới hạn bộ nhớ</b> cho ngôn ngữ',
  'problem.form.test-folder.label': 'Các trường hợp thử nghiệm & Template',
  'problem.form.test-folder.description': 'Thư mục tải lên cần có các tập tin <code>input_.txt</code> và <code>output_.txt</code>. Ngoài ra, bạn còn có thể thêm 1 tập tin <code>template.cpp</code> để làm template cho bài làm. Xem thêm tại <a href="https://github.com/nqhd3v/online-judge/blob/main/api/docs/solution-checking.md" target="_blank">đây</a>.',
  'problem.form.submit-problem': 'Nộp bài',
  'problem.form.submit-create': 'Tạo',
  'problem.form.submit-update': 'Cập nhật',
  'problem-solving.loading-content': 'Đang tải dữ liệu của vấn đề...',
  'problem-solving.submit': 'Chạy',
  'problem-solving.running': 'Đang kiểm tra kết quả...',
  'problem-solving.empty-data': 'Không thể hiển thị dữ liệu cho vấn đề này vì nó bị trống!',
  'problem-solving.checking-solution': 'Đang kiểm tra bài làm của bạn...',
  // Exceptions
  'exception.problem-solving.code-empty': 'Vui lòng không bỏ trống bài làm của bạn!',
  'exception.problem.form.languages.required': 'Vui lòng chọn ít nhất một ngôn ngữ',
  'exception.problem.form.name.required': 'Vui lòng nhập tên vấn đề',
  'exception.problem.form.diff-command.required': 'Vui lòng nhập lệnh <code>diff</code>',
  'exception.problem.form.content.required': 'Vui lòng nhập nội dung của vấn đề',
  'exception.problem.form.languages.no-selected': 'Vui lòng chọn ít nhất 1 ngôn ngữ',
  'exception.problem.notfound':
    '{ isMany, select, true {Các v} other {V} }ấn đề này không tồn tại trong hệ thống!',
  'exception.problem.solution-checking.includes-other-files': 'Thư mục tải lên chỉ được chứa các tập tin input_.txt, output_.txt hoặc template.cpp',
  'exception.problem.solution-checking.input-diff-output': 'Có {inpCount} tệp dữ liệu đầu vào trong khi có {outCount} tệp kết quả dự kiến',
  'exception.problem.solution-checking.duplicated-filenames': 'Dường như có một số tập tin bị trùng tên với nhau!',
  'exception.problem-solving.no-problem-selected': 'Vui lòng chọn 1 vấn đề càn giải quyết!',
  'exception.problem-solving.assignment-notfound': 'Dường như bài thi bạn đang làm không tồn tại!',
  'exception.problem-solving.problem-notfound': 'Dường như vấn đề bạn cần giải quyết không tồn tại!',
  'exception.problem-solving.problem-not-in-assignment': 'Dường như vấn đề bạn cần giải quyết không thuộc bài thi này!',
  'exception.problem.get-by-id.unknown': 'Một lỗi nào đó đã xảy ra lúc truy vấn thông tin của vấn đề!',
};
