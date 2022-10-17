### Là gì?
Việc cho phép user tự custom 1 đoạn script, và cho phép thực hiện trên server sẽ dẫn đến khá nhiều lỗ hổng bảo mật, vì vậy, để an toàn, thay vì chạy script, mình sẽ tiến hành định nghĩa ra các rule, thứ được sử dụng để xác định hệ số của bài thi.

### Làm như nào?
Tương tự như script, user có thể custom nhiều điều kiện để có thể tuy biến hệ số theo ý muốn, nên ở đây mình cũng cho phép user tuỳ biến số rule theo ý muốn của user, tuy nhiên, các rule để có chung 1 model, để định dạng và lưu trữ.

![](https://i.imgur.com/LV5HoLl.png)

1 rule bao gồm 4 hệ số chính:
- Phạm vi trễ (delay range) -> [`delay0`, `delay1`]
- Thời gian nền (base mins) -> `baseMins`
- Loại hệ số (Coefficient type)
- Giá trị tương ứng với loại hệ số (value)
    - Giá trị không đổi -> `const`
    - Giá trị biến thiên thời gian -> [`vot0`, `vot1`]


Để hiểu rõ hơn về cách hoạt động như thế nào, có thể xem hình minh hoạ bên dưới:
![](https://i.imgur.com/yyDN7xe.png)

Tương tự như script, đầu tiên, hệ thống sẽ chạy qua lần lượt các rule đã được thiết lập, kiểm tra `delayMins` nằm trong khoảng giá trị nào [`delay0`+`baseMins`, `delay1`+`baseMins`] (Khu vực màu đỏ).

Trong trường hợp tìm thấy khoảng giá trị chứa `delayMins`, hệ số sẽ được gán bằng:
- Giá trị của `const`, nếu `const` tồn tại (khác `undefined`).
- Giá trị của công thức **VOT#0**, nếu giá trị của `vot0` và `vot1` tồn tại.

> Trong cơ sở dữ liệu không lưu loại hệ số (coefficient-type), lý do là nó có thể xác định bởi giá trị của `const` và `[vot0, vot1]`.
> Tại 1 thời điểm, chỉ 1 trong 2 giá trị này tồn tại, giá trị còn lại sẽ bị reset về `undefined`.


```javascript=
// Công thức VOT#0: Tính hệ số trong khoảng biến thiên.
const delayDiffValue = delay1 - delay0;
const votDiffValue = vot1 - vot0;
coefficient = vot1 - (votDiffValue * ( delayMins - delay0 - baseMins ) / delayDiffValue)
//                                   |=================================================|
//                                   |Tuỳ thuộc vào delayMins, giá trị thay đổi từ 0->1|

```
### Ví dụ minh hoạ

![](https://i.imgur.com/QLLG5UR.png)

Ví dụ, mình có 3 rule như trên. Ở đây, mình giải thích lần lượt các rule như sau:
1. Trong vòng 1 giờ sau thời gian nộp bài (Từ thời gian kết thúc bài thi + 60 phút), hệ số sử được sử dụng là 100.
2. Trong vòng 1h (60 phút) đến 1 ngày tính từ thời gian kết thúc (60p * 24h = 1440p), hệ số lúc này biến thiên từ 50-100, tuỳ vào thời gian nộp bài.
3. Trong vòng 1 ngày từ thời gian kết thúc (base-min=1 ngày) đến 1h sau đó, hệ số biến thiên từ 20-50 tuỳ vào thời gian nộp bài.

Nếu thời gian nộp bài của thí sinh nằm ngoài những khoảng thời gian trên (sau khi thời gian kết thúc bài thi), hệ số mặc định được sử dụng là 0.

### Các tính năng hỗ trợ đi kèm
Trong thời gian tới mình sẽ tiến hành thêm vào 2 tính năng cho phép người dùng xem trước những cái rule mà mình đã thiết lập làm việc như thế nào, đồng thời có các warning phù hợp.

<TBU>