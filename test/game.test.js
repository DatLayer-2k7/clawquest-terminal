'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createInitialState,
  getLevelInfo,
  rewardForDifficulty,
  startQuest,
  completeQuest,
  createQuest,
  getAchievements,
} = require('../src/game');

test('level calculation uses 100 EXP per level', () => {
  assert.deepEqual(getLevelInfo(0), {
    level: 1, xpIntoLevel: 0, xpNeeded: 100, xpRemaining: 100,
    progressPercent: 0, nextLevelAt: 100,
  });
  assert.equal(getLevelInfo(240).level, 3);
  assert.equal(getLevelInfo(240).xpIntoLevel, 40);
});

test('difficulty maps to expected XP rewards', () => {
  assert.equal(rewardForDifficulty('Dễ'), 15);
  assert.equal(rewardForDifficulty('Vừa'), 30);
  assert.equal(rewardForDifficulty('Khó'), 50);
});

test('only available quests can be started', () => {
  const state = createInitialState('Dat', new Date('2026-01-01T00:00:00Z'));
  const started = startQuest(state, 'quest-python');
  assert.equal(started.quests[0].status, 'active');
  assert.equal(startQuest(started, 'quest-python'), started);
});

test('completing an active quest awards XP only once', () => {
  let state = createInitialState('Dat', new Date('2026-01-01T00:00:00Z'));
  state = startQuest(state, 'quest-python');
  const once = completeQuest(state, 'quest-python', new Date('2026-01-02T00:00:00Z'));
  const twice = completeQuest(once, 'quest-python', new Date('2026-01-03T00:00:00Z'));
  assert.equal(once.totalXp, 15);
  assert.equal(once.history.length, 1);
  assert.equal(once.quests[0].status, 'completed');
  assert.equal(twice, once);
});

test('custom quest uses selected difficulty reward and rejects blank titles', () => {
  const quest = createQuest({ title: '  Ôn Git  ', description: '', category: 'Học tập', difficulty: 'Vừa' }, 'custom-1');
  assert.equal(quest.title, 'Ôn Git');
  assert.equal(quest.rewardXp, 30);
  assert.equal(quest.status, 'available');
  assert.throws(() => createQuest({ title: ' ', difficulty: 'Dễ' }), /không được để trống/);
});

test('achievements unlock based on game progress', () => {
  const state = createInitialState();
  assert.equal(getAchievements(state).length, 0);
  const advanced = {
    ...state,
    totalXp: 120,
    quests: state.quests.map((q, i) => i === 0 ? { ...q, status: 'completed' } : q),
  };
  assert.equal(getAchievements(advanced).length, 2);
});
