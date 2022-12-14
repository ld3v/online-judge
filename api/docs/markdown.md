# MARKDOWN VIEW

Tài liệu này được sử dụng để nói vế markdown. Cách nó được cài đặt, sử dụng trong dự án và các ghi chú đi kèm.

Đối với project này, mình sử dụng thư viên **markdown.js** như 1 công cụ cho phép chuyển đổi markdown thành HTML và render nội dung đó lên trang web.
Tuy nhiên, với thư viện này thì tác giả có chú thích rằng:

> **"🚨 Marked does not sanitize the output HTML."**

Điều này được giải thích để hạn chế các lỗi bảo mật liên quan đến XSS Script. Và recommend mình sử dụng 1 công cụ khác ([DOMPurify](https://github.com/cure53/DOMPurify)) để có thể clean HTML.
