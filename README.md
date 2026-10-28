# ClawQuest Terminal 🦞

ClawQuest Terminal là game RPG chạy trực tiếp trong PowerShell/Terminal. Bạn nhận nhiệm vụ, viết code, chạy kiểm thử, nhận EXP và lên cấp. Không cần trình duyệt và không cần cài thư viện npm bên ngoài.

## Yêu cầu

- Node.js 20 trở lên.
- Python 3 để chạy nhiệm vụ trong Coding Arena. Trên Windows, có thể dùng lệnh `py -3 --version` để kiểm tra.
- Windows PowerShell hoặc Windows Terminal.

## Chạy trên Windows

Mở PowerShell tại thư mục dự án rồi chạy:

```powershell
node src/index.js
```

Hoặc dùng script npm (không cần `npm install`):

```powershell
npm.cmd run dev
```

Nếu PowerShell chặn `npm.ps1`, hãy dùng `npm.cmd`.

## Menu chính

- `1` — Xem Quest Board.
- `2` — Nhận nhiệm vụ thông thường.
- `3` — Coding Arena: viết Python trong terminal và nộp để chạy test.
- `4` — Hoàn thành nhiệm vụ không cần code.
- `5` — Tạo nhiệm vụ mới.
- `6` — Hồ sơ và thành tựu.
- `7` — Nhật ký hành trình.
- `8` — Đổi tên nhân vật.
- `0` — Lưu và thoát.

## Coding Arena

Nhiệm vụ lập trình đầu tiên là **Thử thách Python: hàm cộng**. Game sẽ tự nhận nhiệm vụ nếu chưa nhận, mở vùng nhập code nhiều dòng và chờ lệnh `:submit` trên một dòng riêng.

Các lệnh trong vùng nhập code:

- `:submit` — lưu bài và chạy bộ kiểm thử.
- `:clear` — xóa phần code đang nhập.
- `:cancel` — hủy lần nhập hiện tại.

Bài làm được lưu ở `solutions/quest-python.py`. Sau khi nộp:

- Nếu có test sai, game cho biết kết quả mong đợi và kết quả thực tế; bài được giữ lại để sửa hoặc chạy lại.
- Nếu cả 4 test đều đạt, game tự đánh dấu nhiệm vụ hoàn thành và cộng EXP một lần.
- Nếu Python chưa được cài hoặc chương trình quá thời gian cho phép, game báo lỗi và không cộng EXP.

**Lưu ý bảo mật:** Coding Arena chạy Python dưới quyền tài khoản Windows hiện tại; timeout chỉ giới hạn thời gian, không phải sandbox bảo mật. Chỉ chạy code do chính bạn viết hoặc đã kiểm tra kỹ. Không nộp code lạ có thể truy cập hoặc thay đổi tệp, mạng hay hệ thống.

## Nhiệm vụ và EXP

Bản khởi đầu có các nhiệm vụ thực hành về Python, terminal, viết nhật ký, kiểm tra lưu tiến trình và lập ý tưởng. Phần thưởng thông thường: Dễ = 15 EXP, Vừa = 30 EXP, Khó = 50 EXP. Mỗi 100 EXP lên một cấp. Coding Arena chỉ trả thưởng sau khi bộ test của nhiệm vụ đạt.

## Dữ liệu lưu ở đâu?

Tiến trình game lưu tại `data/save.json`. Bài Python lưu tại `solutions/quest-python.py`. Hãy sao lưu các file này nếu muốn chuyển dữ liệu sang máy khác. Đừng commit file save cá nhân lên repo công khai.

## Kiểm thử

```powershell
npm.cmd test
```

Các bài test dùng `node:test` có sẵn trong Node.js. Test chạy Python sẽ tự bỏ qua nếu máy kiểm thử không có Python.

## Phạm vi hiện tại

- Đã có: game loop, nhiệm vụ mẫu, nhiệm vụ tự tạo, EXP, cấp độ, thành tựu, nhật ký và lưu cục bộ dạng JSON.
- Đã có bản đầu Coding Arena cho một bài Python với kiểm thử tự động và tự cộng EXP khi đạt.
- Chưa có: kết nối AI thật tới OpenClaw Gateway, sandbox an toàn để chạy code không tin cậy, đồng bộ cloud, chiến đấu hoặc đồ họa game.

ClawQuest là ứng dụng riêng. Tích hợp OpenClaw có thể được xây sau qua một adapter, không sửa lõi OpenClaw.
