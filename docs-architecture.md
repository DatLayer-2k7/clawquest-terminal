# Kiến trúc ClawQuest Terminal

- `src/index.js`: luồng menu terminal và nhập/xuất. Menu 3 mở Coding Arena, xử lý code nhiều dòng và nộp bài.
- `src/game.js`: luật game thuần JavaScript — nhiệm vụ, EXP, cấp độ và thành tựu. Đây là nơi quyết định phần thưởng; code Python không thể tự đặt điểm.
- `src/storage.js`: đọc/ghi tiến trình JSON trong `data/save.json`.
- `src/coding-arena.js`: định nghĩa bài thử thách, lưu bài làm vào `solutions/quest-python.py`, gọi Python, giới hạn thời gian chạy và đọc kết quả của bộ test.
- `test/game.test.js`: kiểm thử luật game bằng `node:test`.
- `test/coding-arena.test.js`: kiểm thử lưu code và kết quả test của Coding Arena; phần gọi Python tự bỏ qua nếu không có Python trong môi trường test.

## Luồng Coding Arena

1. Người chơi mở menu 3. Nếu nhiệm vụ Python chưa được nhận, game tự chuyển nhiệm vụ sang trạng thái đang làm.
2. Người chơi nhập code nhiều dòng và gõ `:submit`.
3. ClawQuest lưu code vào file và gọi Python để kiểm tra hàm `tong(a, b)` với bốn trường hợp.
4. Nếu thất bại, hiển thị test sai và giữ nguyên file để sửa/nộp lại.
5. Nếu đạt toàn bộ test, game gọi Game Core để hoàn thành nhiệm vụ, lưu lịch sử và cộng EXP một lần.

## Giới hạn bảo mật

Python được chạy với quyền của tài khoản người dùng hiện tại. Timeout không cô lập quyền truy cập tệp, mạng hoặc tiến trình con, vì vậy Coding Arena hiện chỉ phù hợp với code tự viết hoặc đã kiểm tra; đây chưa phải sandbox để chạy bài nộp từ người lạ. Trước khi mở tính năng nộp code từ bên ngoài, cần triển khai môi trường cô lập riêng.

Thiết kế tách giao diện terminal, luật game, lưu trữ và bộ chạy bài tập nhằm dễ kiểm thử và có thể bổ sung adapter OpenClaw về sau.
