# Submission
## CRUD Actions
### 1. Create
Theo như trạng thái hiện tại, không có API nào để có thể tạo 1 submission, mà thay vào đó, lúc học viên submit code (code hoặc là 1 file) thì hệ thống sẽ tạo thêm 1 job trong queue, lúc nào job được chạy, thì nó sẽ thực hiện tạo ra 1 submission, với trạng thái là `PENDING`.

### 2. Update

#### Update info
- Cần check lại source wecode-judge để xem có trường hợp nào cần update lại thông tin của submission hay không.
#### Update coefficient
Đối với coefficient của submission, hệ số này được tính toán dựa trên `late_rule`, `start_time`, `finish_time` & `extra_time` của assignment.  
> -> Vì nó phụ thuộc vào 4 thông tin này, nên là mỗi khi update assignment, nếu **1 trong 4 trường thông tin** này **thay đổi**, cần phải **tiến hành update lại coefficient cho submission**.

Hệ thống hiện tại đang sử dụng nodeJS, trong khi đó code `late_rule` lại được code dựa trên PHP, -> Cần có 1 API phía wecode-judge cho phép chạy `late_rule` để phía wecode2 get được giá trị của coefficient.  
> -> Cần có 1 API bên `wecode-judge` để cho phép `wecode2` chạy `late_rule` để lấy giá trị `coefficient`.

>  Vì việc giao tiếp chỉ được thực hiện giữa 2 backend (2 server) với nhau, nên không cần phải setup CORS cho backend của JUDGE.

## Need check.
- Cần check lại các giá trị của `status` là gì?
> Theo như hiện tại thì có một số giá trị `PENDING`, `SCORE`, `Uploaded` và kết quả của lệnh `shell_exec` trong `Queueprocess.php`).