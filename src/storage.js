'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createInitialState } = require('./game');

const DATA_DIR = path.join(process.cwd(), 'data');
const SAVE_PATH = path.join(DATA_DIR, 'save.json');

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function isValidSave(value) {
  return Boolean(
    value &&
    value.schemaVersion === 1 &&
    typeof value.playerName === 'string' &&
    Number.isFinite(value.totalXp) &&
    Array.isArray(value.quests) &&
    Array.isArray(value.history),
  );
}

function loadState() {
  ensureDataDir();
  if (!fs.existsSync(SAVE_PATH)) {
    return { state: createInitialState(), warning: null, isNew: true };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(SAVE_PATH, 'utf8'));
    if (!isValidSave(parsed)) throw new Error('Cấu trúc file lưu không hợp lệ.');
    return { state: parsed, warning: null, isNew: false };
  } catch (error) {
    const backupPath = path.join(DATA_DIR, `save-corrupt-${Date.now()}.json`);
    try {
      fs.copyFileSync(SAVE_PATH, backupPath);
    } catch {
      // Keep startup usable even when a backup cannot be created.
    }
    return {
      state: createInitialState(),
      warning: `Không đọc được file lưu (${error.message}). Đã bắt đầu game mới; file cũ được giữ lại nếu có thể.`,
      isNew: true,
    };
  }
}

function saveState(state) {
  ensureDataDir();
  const tempPath = `${SAVE_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, SAVE_PATH);
}

module.exports = { SAVE_PATH, loadState, saveState };
