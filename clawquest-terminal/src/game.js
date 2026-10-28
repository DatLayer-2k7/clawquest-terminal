'use strict';

const DIFFICULTIES = Object.freeze({
  'Dễ': 15,
  'Vừa': 30,
  'Khó': 50,
});

const DEFAULT_QUESTS = [
  {
    id: 'quest-python',
    title: 'Thử thách Python: hàm cộng',
    description: 'Tạo file quest_cong.py, viết hàm tong(a, b) và thử tong(2, 3) cho kết quả 5.',
    category: 'Lập trình',
    difficulty: 'Dễ',
    rewardXp: 15,
    status: 'available',
  },
  {
    id: 'quest-terminal-check',
    title: 'Kiểm tra trạm không gian',
    description: 'Mở terminal và chạy node -v cùng npm.cmd -v để xác nhận công cụ hoạt động.',
    category: 'Khám phá',
    difficulty: 'Dễ',
    rewardXp: 15,
    status: 'available',
  },
  {
    id: 'quest-first-log',
    title: 'Nhật ký Nhà Thám Hiểm',
    description: 'Tạo file journey.md và ghi 3 dòng: mình đang học gì, muốn làm gì với ClawQuest, bước kế tiếp là gì.',
    category: 'Thói quen',
    difficulty: 'Dễ',
    rewardXp: 15,
    status: 'available',
  },
  {
    id: 'quest-save-check',
    title: 'Thử thách lưu tiến trình',
    description: 'Nhận và hoàn thành một nhiệm vụ, thoát game bằng lựa chọn 0, mở lại rồi kiểm tra EXP còn nguyên.',
    category: 'Khám phá',
    difficulty: 'Vừa',
    rewardXp: 30,
    status: 'available',
  },
  {
    id: 'quest-custom',
    title: 'Rèn nghề tạo nhiệm vụ',
    description: 'Dùng mục 4 để tự tạo một nhiệm vụ có ích cho mình, sau đó nhận và hoàn thành nhiệm vụ đó.',
    category: 'ClawQuest',
    difficulty: 'Vừa',
    rewardXp: 30,
    status: 'available',
  },
  {
    id: 'quest-roadmap',
    title: 'Bản đồ hành trình đầu tiên',
    description: 'Viết ra 3 tính năng muốn có trong ClawQuest và chọn 1 tính năng ưu tiên nhất.',
    category: 'Dự án',
    difficulty: 'Dễ',
    rewardXp: 15,
    status: 'available',
  },
];

function createInitialState(playerName = 'Nhà Thám Hiểm', now = new Date()) {
  return {
    schemaVersion: 1,
    playerName: String(playerName).trim() || 'Nhà Thám Hiểm',
    totalXp: 0,
    quests: DEFAULT_QUESTS.map((quest) => ({
      ...quest,
      createdAt: now.toISOString(),
    })),
    history: [],
  };
}

function getLevelInfo(totalXp) {
  const safeXp = Math.max(0, Math.floor(Number(totalXp) || 0));
  const level = Math.floor(safeXp / 100) + 1;
  const xpIntoLevel = safeXp % 100;
  return {
    level,
    xpIntoLevel,
    xpNeeded: 100,
    xpRemaining: 100 - xpIntoLevel,
    progressPercent: xpIntoLevel,
    nextLevelAt: level * 100,
  };
}

function rewardForDifficulty(difficulty) {
  if (!(difficulty in DIFFICULTIES)) {
    throw new Error(`Độ khó không hợp lệ: ${difficulty}`);
  }
  return DIFFICULTIES[difficulty];
}

function startQuest(state, questId) {
  const quest = state.quests.find((item) => item.id === questId);
  if (!quest || quest.status !== 'available') return state;
  return {
    ...state,
    quests: state.quests.map((item) =>
      item.id === questId ? { ...item, status: 'active' } : item,
    ),
  };
}

function completeQuest(state, questId, now = new Date()) {
  const quest = state.quests.find((item) => item.id === questId);
  if (!quest || quest.status !== 'active') return state;
  // Each quest can award XP only once in this MVP.
  if (state.history.some((entry) => entry.questId === questId)) return state;

  const record = {
    id: `completion-${questId}-${now.getTime()}`,
    questId,
    title: quest.title,
    xp: quest.rewardXp,
    completedAt: now.toISOString(),
  };
  return {
    ...state,
    totalXp: state.totalXp + quest.rewardXp,
    quests: state.quests.map((item) =>
      item.id === questId ? { ...item, status: 'completed' } : item,
    ),
    history: [record, ...state.history],
  };
}

function createQuest(input, id = `quest-${Date.now()}`, now = new Date()) {
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Tên nhiệm vụ không được để trống.');
  const difficulty = input.difficulty;
  const rewardXp = rewardForDifficulty(difficulty);
  return {
    id,
    title,
    description: String(input.description || '').trim(),
    category: String(input.category || 'Khác'),
    difficulty,
    rewardXp,
    status: 'available',
    createdAt: now.toISOString(),
    custom: true,
  };
}

function getAchievements(state) {
  const completedCount = state.quests.filter((quest) => quest.status === 'completed').length;
  const achievements = [];
  if (completedCount >= 1) {
    achievements.push({ title: 'Bước chân đầu tiên', description: 'Hoàn thành nhiệm vụ đầu tiên.' });
  }
  if (state.totalXp >= 100) {
    achievements.push({ title: 'Tân binh đầy triển vọng', description: 'Tích lũy ít nhất 100 EXP.' });
  }
  if (completedCount >= 5) {
    achievements.push({ title: 'Cỗ máy hoàn thành', description: 'Hoàn thành 5 nhiệm vụ.' });
  }
  if (state.totalXp >= 500) {
    achievements.push({ title: 'Huyền thoại trạm sao', description: 'Tích lũy ít nhất 500 EXP.' });
  }
  return achievements;
}

module.exports = {
  DIFFICULTIES,
  createInitialState,
  getLevelInfo,
  rewardForDifficulty,
  startQuest,
  completeQuest,
  createQuest,
  getAchievements,
};
