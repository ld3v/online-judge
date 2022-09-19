# TỔNG QUAN DỰ ÁN 
## 1. Input
Requirement đầu vào là phát triển một trang web thị lập trình dựa trên trang wecode hiện tại, không cần phải làm những phần liên quan đến code.
## 2. Tóm tắt và phân tích:
- Dựa trên requirement khách hàng đưa, và clarify, những phần cần phải làm trong dự án này bao gồm:
  - Account: Tài khoản - Phần này bao gồm các chức năng CRUD tài khoản. Cho phép quản trị viên quản lý (RUD) các tài khoản hiện có trong hệ thống. Cho phép học viên có thể tạo mới tài khoản trong hệ thống.
  - Assignment: Bài thi - Phần này bao gồm nhóm chức năng cho phép quản trị viên có thể quản lý (tạo mới, chỉnh sửa, và xoá) các bài thi. Ngoài ra, expected output, kết quả cuối cùng, là 1 thứ mà cho phép quản trị viên, có thể xem được tình trạng hiện tại của bài thi đó (có bao nhiêu lượt submit, bao nhiêu người đã hoàn thành bài thi). Đối với người thi, có thể, xem được các bài thi của mình, thời gian kết thúc là lúc nào,
  - Problem: Vấn đề - Phần nào bao gồm nhóm chức năng cho phép quản trị có thể CRUD các vấn đề, với mỗi vấn đề, biết được có bao nhiều lượt submission bài làm. Đối với user, có chức năng cho thấy răng nội dung vấn đề cần giải quyết là gì (input, output), đã hoàn thành hay chưa (phần này liên quan đến code).
  - Notification: Thông báo - Phần này bao gồm nhóm chức CRUD cho phép quản trị viên tạo ra các thông báo, với mục tiêu thông báo đến học viên các thông tin quan trong, ví dụ, thời gian bảo trì hệ thống, thời gian cho đợt thi tiếp theo,...
  - Auth: Xác thực - Phần này là nhóm chức năng `Authenticate` và `Authorize` tài khoản, gồm các chức năng liên quan đến đăng nhập, quên mật khẩu, hoặc phân quyền trong hệ thống.

- Ngoài các phần trên, các phần sẽ được tiến hành improve là những phần liên quan dến các vấn dề submit code, compiler, build, test output.