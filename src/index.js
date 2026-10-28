'use strict';

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const {
  DIFFICULTIES,
  createInitialState,
  getLevelInfo,
  startQuest,
  completeQuest,
  createQuest,
  getAchievements,
} = require('./game');
const { loadState, saveState, SAVE_PATH } = require('./storage');

const rl = readline.createInterface({ input: stdin, output: stdout });
const useColor = Boolean(stdout.isTTY) && !process.env.NO_COLOR;
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  purple: '\x1b[35m', cyan: '\x1b[36m', gold: '\x1b[33m',
  green: '\x1b[32m', red: '\x1b[31m', blue: '\x1b[34m',
};

function paint(text, color) {
  return useColor ? `${C[color] || ''}${text}${C.reset}` : String(text);
}
function line(char = '─', width = 66) { return char.repeat(width); }
function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
async function pause(message = 'Nhấn Enter để quay lại menu...') {
  await rl.question(`\n${paint(message, 'dim')}`);
}
function clear() {
  if (stdout.isTTY) console.clear();
}
function formatDate(value) {
  try { return new Date(value).toLocaleString('vi-VN'); } catch { return String(value); }
}
function statusLabel(status) {
  const map = { available: ['Chưa nhận', 'cyan'], active: ['Đang làm', 'gold'], completed: ['Hoàn thành', 'green'] };
  const [label, color] = map[status] || [status, 'dim'];
  return paint(label, color);
}
function questTag(quest) {
  return `${quest.category} · ${quest.difficulty} · ${quest.rewardXp} EXP`;
}
function drawHeader(state) {
  const info = getLevelInfo(state.totalXp);
  const filled = Math.round(info.progressPercent / 10);
  const bar = `${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`;
  console.log(paint('╔══════════════════════════════════════════════════════════════════╗', 'purple'));
  console.log(paint('║  🦞 CLAWQUEST // TERMINAL EDITION                                ║', 'purple'));
  console.log(paint('║  Biến mục tiêu thành nhiệm vụ. Biến nỗ lực thành hành trình.     ║', 'cyan'));
  console.log(paint('╚══════════════════════════════════════════════════════════════════╝', 'purple'));
  console.log(`  Nhà thám hiểm: ${paint(state.playerName, 'bold')}  ·  Cấp ${paint(info.level, 'gold')}  ·  Tổng EXP: ${paint(state.totalXp, 'cyan')}`);
  console.log(`  Tiến trình: ${paint(bar, 'purple')} ${info.xpIntoLevel}/100 EXP  (còn ${info.xpRemaining} EXP lên cấp)`);
  console.log(line());
}
function displayQuest(quest, index) {
  console.log(`${paint(`${index + 1}.`, 'bold')} ${paint(quest.title, 'bold')}  ${statusLabel(quest.status)}`);
  console.log(`   ${paint(questTag(quest), 'cyan')}`);
  if (quest.description) console.log(`   ${paint(quest.description, 'dim')}`);
  console.log(`   ID: ${quest.id}`);
}
function chooseByNumber(promptText, max) {
  return rl.question(promptText).then((answer) => {
    const n = Number(answer.trim());
    if (!Number.isInteger(n) || n < 1 || n > max) return null;
    return n - 1;
  });
}
async function chooseQuest(state, quests, promptText) {
  if (!quests.length) {
    console.log(paint('Chưa có nhiệm vụ phù hợp. Hãy tạo nhiệm vụ mới hoặc quay lại sau.', 'dim'));
    await pause();
    return null;
  }
  quests.forEach(displayQuest);
  console.log('0. Quay lại');
  const answer = (await rl.question(`\n${promptText}`)).trim();
  if (answer === '0') return null;
  const n = Number(answer);
  if (!Number.isInteger(n) || n < 1 || n > quests.length) {
    console.log(paint('Lựa chọn không hợp lệ.', 'red'));
    await pause();
    return null;
  }
  return quests[n - 1];
}

async function viewQuestBoard(state) {
  clear(); drawHeader(state);
  console.log(paint(' QUEST BOARD // BẢNG NHIỆM VỤ', 'bold'));
  console.log();
  if (!state.quests.length) console.log('Chưa có nhiệm vụ. Hãy tạo nhiệm vụ đầu tiên!');
  state.quests.forEach((quest, index) => { displayQuest(quest, index); console.log(); });
  await pause();
}

async function acceptQuest(state) {
  clear(); drawHeader(state);
  console.log(paint(' NHẬN NHIỆM VỤ', 'bold'));
  const quest = await chooseQuest(state, state.quests.filter((q) => q.status === 'available'), 'Chọn số nhiệm vụ muốn nhận: ');
  if (!quest) return state;
  const updated = startQuest(state, quest.id);
  console.log(paint(`\nĐã nhận nhiệm vụ: ${quest.title}. Xong rồi thì quay lại menu để báo hoàn thành!`, 'green'));
  saveState(updated);
  await pause();
  return updated;
}

async function finishQuest(state) {
  clear(); drawHeader(state);
  console.log(paint(' HOÀN THÀNH NHIỆM VỤ', 'bold'));
  const quest = await chooseQuest(state, state.quests.filter((q) => q.status === 'active'), 'Chọn số nhiệm vụ đã hoàn thành: ');
  if (!quest) return state;
  const previousLevel = getLevelInfo(state.totalXp).level;
  const updated = completeQuest(state, quest.id);
  if (updated === state) {
    console.log(paint('Không thể hoàn thành nhiệm vụ này hoặc phần thưởng đã được nhận rồi.', 'red'));
  } else {
    console.log(paint(`\n✦ QUEST CLEAR: ${quest.title}`, 'green'));
    console.log(paint(`+${quest.rewardXp} EXP`, 'gold'));
    const nextLevel = getLevelInfo(updated.totalXp).level;
    if (nextLevel > previousLevel) console.log(paint(`\n★ LÊN CẤP! Cấp ${previousLevel} → cấp ${nextLevel}!`, 'purple'));
    const newAchievements = getAchievements(updated).filter((a) => !getAchievements(state).some((old) => old.title === a.title));
    newAchievements.forEach((achievement) => console.log(paint(`🏆 Mở khóa: ${achievement.title}`, 'gold')));
    saveState(updated);
  }
  await pause();
  return updated;
}

async function createNewQuest(state) {
  clear(); drawHeader(state);
  console.log(paint(' TẠO NHIỆM VỤ MỚI', 'bold'));
  const title = (await rl.question('Tên nhiệm vụ: ')).trim();
  if (!title) {
    console.log(paint('Tên nhiệm vụ không được để trống.', 'red'));
    await pause();
    return state;
  }
  const description = (await rl.question('Mô tả (có thể bỏ trống): ')).trim();
  console.log('\nDanh mục: 1. Học tập  2. Lập trình  3. Thói quen  4. Dự án  5. Khác');
  const categories = ['Học tập', 'Lập trình', 'Thói quen', 'Dự án', 'Khác'];
  const categoryAnswer = (await rl.question('Chọn danh mục [1-5, mặc định 5]: ')).trim();
  const categoryIndex = Number(categoryAnswer);
  const category = categories[Number.isInteger(categoryIndex) && categoryIndex >= 1 && categoryIndex <= categories.length ? categoryIndex - 1 : 4];
  console.log('\nĐộ khó: 1. Dễ (+15 EXP)  2. Vừa (+30 EXP)  3. Khó (+50 EXP)');
  const difficultyAnswer = (await rl.question('Chọn độ khó [1-3]: ')).trim();
  const difficultyMap = { '1': 'Dễ', '2': 'Vừa', '3': 'Khó' };
  const difficulty = difficultyMap[difficultyAnswer];
  if (!difficulty) {
    console.log(paint('Độ khó không hợp lệ, chưa tạo nhiệm vụ.', 'red'));
    await pause();
    return state;
  }
  const quest = createQuest({ title, description, category, difficulty });
  const updated = { ...state, quests: [...state.quests, quest] };
  saveState(updated);
  console.log(paint(`\nĐã tạo nhiệm vụ “${quest.title}” với phần thưởng ${quest.rewardXp} EXP.`, 'green'));
  await pause();
  return updated;
}

async function showProfile(state) {
  clear(); drawHeader(state);
  const info = getLevelInfo(state.totalXp);
  const completed = state.quests.filter((q) => q.status === 'completed').length;
  const active = state.quests.filter((q) => q.status === 'active').length;
  const available = state.quests.filter((q) => q.status === 'available').length;
  console.log(paint(' HỒ SƠ NHÀ THÁM HIỂM', 'bold'));
  console.log(`Tên: ${state.playerName}`);
  console.log(`Cấp độ: ${info.level}`);
  console.log(`Tổng EXP: ${state.totalXp}`);
  console.log(`Nhiệm vụ: ${completed} hoàn thành · ${active} đang làm · ${available} chưa nhận`);
  console.log(`Số lượt hoàn thành: ${state.history.length}`);
  console.log('\n' + paint(' THÀNH TỰU ĐÃ MỞ KHÓA', 'bold'));
  const achievements = getAchievements(state);
  if (!achievements.length) console.log(paint('Chưa có thành tựu. Hãy hoàn thành nhiệm vụ đầu tiên!', 'dim'));
  achievements.forEach((achievement) => {
    console.log(`${paint('🏆', 'gold')} ${paint(achievement.title, 'bold')} — ${achievement.description}`);
  });
  await pause();
}

async function showHistory(state) {
  clear(); drawHeader(state);
  console.log(paint(' NHẬT KÝ HÀNH TRÌNH', 'bold'));
  if (!state.history.length) console.log(paint('Chưa có nhiệm vụ nào được hoàn thành.', 'dim'));
  state.history.slice(0, 12).forEach((entry, index) => {
    console.log(`${index + 1}. ${paint(entry.title, 'bold')}  ${paint(`+${entry.xp} EXP`, 'gold')}`);
    console.log(`   ${paint(formatDate(entry.completedAt), 'dim')}`);
  });
  await pause();
}

async function renamePlayer(state) {
  clear(); drawHeader(state);
  const name = (await rl.question('Nhập tên nhân vật mới (Enter để giữ nguyên): ')).trim();
  if (!name) return state;
  const updated = { ...state, playerName: name.slice(0, 40) };
  saveState(updated);
  return updated;
}

async function main() {
  const loaded = loadState();
  let state = loaded.state;
  if (loaded.warning) console.log(paint(`Cảnh báo: ${loaded.warning}`, 'red'));
  if (loaded.isNew) {
    console.log(paint('Lần đầu tới trạm sao! Hãy đặt tên cho nhân vật của ông.', 'cyan'));
    const name = (await rl.question('Tên nhân vật [Nhà Thám Hiểm]: ')).trim();
    if (name) state.playerName = name.slice(0, 40);
    saveState(state);
  }

  while (true) {
    clear(); drawHeader(state);
    console.log(paint(' MENU CHÍNH', 'bold'));
    console.log(' 1. Xem Quest Board');
    console.log(' 2. Nhận nhiệm vụ');
    console.log(' 3. Hoàn thành nhiệm vụ');
    console.log(' 4. Tạo nhiệm vụ mới');
    console.log(' 5. Hồ sơ & thành tựu');
    console.log(' 6. Nhật ký hành trình');
    console.log(' 7. Đổi tên nhân vật');
    console.log(' 0. Lưu và thoát');
    console.log(line());
    const choice = (await rl.question('Chọn hành động: ')).trim();
    switch (choice) {
      case '1': await viewQuestBoard(state); break;
      case '2': state = await acceptQuest(state); break;
      case '3': state = await finishQuest(state); break;
      case '4': state = await createNewQuest(state); break;
      case '5': await showProfile(state); break;
      case '6': await showHistory(state); break;
      case '7': state = await renamePlayer(state); saveState(state); break;
      case '0':
        saveState(state);
        console.log(paint(`\nĐã lưu hành trình tại: ${SAVE_PATH}`, 'green'));
        console.log(paint('Clawbi sẽ chờ chuyến phiêu lưu tiếp theo. Tạm biệt! 🦞', 'purple'));
        await wait(200);
        rl.close();
        return;
      default:
        console.log(paint('Lựa chọn không hợp lệ. Hãy nhập số trong menu.', 'red'));
        await pause();
    }
  }
}

main().catch((error) => {
  console.error(paint(`\nLỗi không mong muốn: ${error.stack || error.message}`, 'red'));
  rl.close();
  process.exitCode = 1;
});
