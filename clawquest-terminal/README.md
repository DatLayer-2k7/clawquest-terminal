# ClawQuest Terminal 🦞

ClawQuest Terminal là bản game RPG chạy trực tiếp trong PowerShell/Terminal, không cần trình duyệt và không cần thư viện npm bên ngoài. Người chơi nhận nhiệm vụ, hoàn thành mục tiêu, kiếm EXP, lên cấp và mở khóa thành tựu.

## Yêu cầu

- Node.js 20 trở lên (máy dùng Node.js 25 cũng được).
- Windows PowerShell hoặc Windows Terminal.

## Chạy trên Windows

1. Giải nén thư mục `clawquest-terminal` vào vị trí dễ tìm, ví dụ `D:\Projects\clawquest-terminal`.
2. Mở PowerShell hoặc Windows Terminal tại thư mục này.
3. Chạy:

```powershell
npm run dev
```

Không cần `npm install` vì phiên bản này chỉ dùng module có sẵn của Node.js. Nếu muốn chạy trực tiếp:

```powershell
node src/index.js
```

Nếu `npm` bị PowerShell chặn do Execution Policy, dùng `npm.cmd run dev`.

## Cách chơi

- `1` — Xem Quest Board.
- `2` — Nhận nhiệm vụ; nhiệm vụ chuyển sang trạng thái đang làm.
- `3` — Hoàn thành nhiệm vụ đang làm để nhận EXP.
- `4` — Tạo nhiệm vụ của riêng bạn.
- `5` — Xem cấp độ và thành tựu.
- `6` — Xem nhật ký hành trình.
- `7` — Đổi tên nhân vật.
- `0` — Lưu và thoát.

Bản khởi đầu có sẵn 6 nhiệm vụ thực hành: kiểm tra terminal, viết hàm Python, ghi nhật ký, kiểm tra lưu tiến trình, tự tạo nhiệm vụ và lập bản đồ ý tưởng. Phần thưởng theo độ khó: Dễ = 15 EXP, Vừa = 30 EXP, Khó = 50 EXP. Cứ đủ 100 EXP thì lên một cấp. Game Core ngăn cộng EXP lần hai cho cùng một nhiệm vụ đã hoàn thành.

## Dữ liệu lưu ở đâu?

Tiến trình tự lưu vào `data/save.json` trong thư mục dự án. Đóng và chạy lại game sẽ giữ nguyên nhân vật, nhiệm vụ, EXP và lịch sử. Hãy sao lưu file này nếu muốn giữ tiến trình khi di chuyển dự án.

## Kiểm thử

```powershell
npm test
```

## Phạm vi hiện tại

- Đã có: game loop trong terminal, nhiệm vụ mẫu, nhiệm vụ tự tạo, EXP, cấp độ, thành tựu, nhật ký và lưu cục bộ dạng JSON.
- Chưa có: kết nối AI thật tới OpenClaw Gateway, đồng bộ cloud, hệ thống chiến đấu hoặc đồ họa game.

Bản terminal này là ứng dụng riêng, không thay đổi hoặc sửa lõi của repo OpenClaw. Tích hợp AI có thể được xây ở giai đoạn sau qua một adapter riêng.


## Bộ nhiệm vụ thử nghiệm

Các nhiệm vụ mẫu được nạp khi tạo file lưu lần đầu. Nếu đã chạy game trước và muốn nạp lại bộ nhiệm vụ mới, hãy thoát game rồi đổi tên `data/save.json` thành `data/save-backup.json` (hoặc xóa file đó nếu không cần giữ tiến trình). Khi chạy lại, game sẽ tạo hành trình mới với bộ nhiệm vụ mẫu.
