'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  QUEST_ID,
  CHALLENGE,
  getSolutionPath,
  savePythonCode,
  runPythonChallenge,
} = require('../src/coding-arena');

function pythonAvailable() {
  const candidates = process.platform === 'win32'
    ? [['py', ['-3', '--version']], ['python', ['--version']]]
    : [['python3', ['--version']], ['python', ['--version']]];
  return candidates.some(([command, args]) => {
    const result = spawnSync(command, args, { encoding: 'utf8', windowsHide: true, timeout: 1500 });
    return !result.error && result.status === 0;
  });
}

test('Coding Arena points to the starter Python quest', () => {
  assert.equal(QUEST_ID, 'quest-python');
  assert.equal(CHALLENGE.examples.length, 4);
  assert.match(CHALLENGE.prompt, /tong\(a, b\)/);
});

test('solution path is stored beneath the project solutions directory', () => {
  assert.equal(getSolutionPath('/tmp/clawquest'), path.join('/tmp/clawquest', 'solutions', 'quest-python.py'));
});

test('saving code creates a UTF-8 Python file and normalizes line endings', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'clawquest-arena-test-'));
  try {
    const filePath = savePythonCode('def tong(a, b):\r\n    return a + b\r\n', root);
    assert.equal(filePath, path.join(root, 'solutions', 'quest-python.py'));
    assert.equal(fs.readFileSync(filePath, 'utf8'), 'def tong(a, b):\n    return a + b\n');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('Python runner detects correct and incorrect solutions when Python is installed', { skip: !pythonAvailable() }, () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'clawquest-arena-test-'));
  try {
    const correct = savePythonCode('def tong(a, b):\n    return a + b\n', root);
    const passing = runPythonChallenge(correct);
    assert.equal(passing.status, 'passed');
    assert.equal(passing.results.length, 4);
    assert.ok(passing.results.every((item) => item.passed));

    savePythonCode('def tong(a, b):\n    return a - b\n', root);
    const failing = runPythonChallenge(correct);
    assert.equal(failing.status, 'failed');
    assert.ok(failing.results.some((item) => !item.passed));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
