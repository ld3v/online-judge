# Nhóm chức năng liên quan đến `Auth - Xác thực`
Document này được tạo để mô tả tổng quan về nhóm các tính năng liên quan đến phần **Auth - Xác thực**.
## 1. Phân quyền:
Hiện tại, hệ thống có 2 quyền chính là `admin` (quản lý - Sử dụng cho quản trị viên hệ thống) và `user` (người dùng - Hướng đến đối tượng sử dụng là các thí sinh tham gia).  
|            |Admin|User |
|:----       |:---:|:---:|
|Assignment  |*    |R    |
|Problem     |*    |R    |
|Submission  |*    |`C`R |
|Notification|*    |R    |
|Account     |*    |C`RU`|

> \*: CRUD  
> `C`/`R`/`U`/`D`: Create/Read/Update/Delete **for me only**

## 2. 