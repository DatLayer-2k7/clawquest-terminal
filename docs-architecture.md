# Kiến trúc ClawQuest Terminal

- `src/index.js`: luồng menu terminal và tương tác nhập/xuất.
- `src/game.js`: luật game thuần JavaScript — nhiệm vụ, EXP, level và thành tựu.
- `src/storage.js`: đọc/ghi tiến trình JSON trong `data/save.json`.
- `test/game.test.js`: kiểm thử luật game bằng `node:test` tích hợp sẵn trong Node.js.

Phân tách giao diện, luật game và lưu trữ để sau này có thể bổ sung adapter kết nối OpenClaw mà không cho AI tự tính EXP hoặc thay đổi trạng thái game vượt qua luật đã kiểm tra.
