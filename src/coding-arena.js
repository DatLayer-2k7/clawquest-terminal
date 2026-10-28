'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const QUEST_ID = 'quest-python';
const CHALLENGE = Object.freeze({
  id: QUEST_ID,
  title: 'Thử thách Python: hàm cộng',
  prompt: 'Viết hàm tong(a, b) trả về tổng của hai số a và b.',
  examples: [
    { call: 'tong(2, 3)', expected: '5' },
    { call: 'tong(-1, 1)', expected: '0' },
    { call: 'tong(0, 0)', expected: '0' },
    { call: 'tong(10, -3)', expected: '7' },
  ],
});

const PYTHON_RUNNER = [
  'import contextlib',
  'import importlib.util',
  'import io',
  'import json',
  'import sys',
  'import traceback',
  '',
  'solution_path = sys.argv[1]',
  'captured = io.StringIO()',
  'results = []',
  'try:',
  '    with contextlib.redirect_stdout(captured), contextlib.redirect_stderr(captured):',
  '        spec = importlib.util.spec_from_file_location("student_solution", solution_path)',
  '        if spec is None or spec.loader is None:',
  '            raise RuntimeError("Khong the doc file bai lam.")',
  '        module = importlib.util.module_from_spec(spec)',
  '        spec.loader.exec_module(module)',
  '        function = getattr(module, "tong", None)',
  '        if not callable(function):',
  '            raise ValueError("Chua tim thay ham tong(a, b). Kiem tra ten ham va thut le.")',
  '',
  '        cases = [',
  '            ("tong(2, 3)", (2, 3), 5),',
  '            ("tong(-1, 1)", (-1, 1), 0),',
  '            ("tong(0, 0)", (0, 0), 0),',
  '            ("tong(10, -3)", (10, -3), 7),',
  '        ]',
  '        for label, args, expected in cases:',
  '            try:',
  '                actual = function(*args)',
  '                passed = actual == expected',
  '                results.append({"name": label, "passed": passed, "expected": repr(expected), "actual": repr(actual)})',
  '            except Exception as exc:',
  '                results.append({"name": label, "passed": False, "expected": repr(expected), "actual": "Loi: " + str(exc)})',
  '',
  '    print(json.dumps({"status": "passed" if results and all(item["passed"] for item in results) else "failed", "results": results}, ensure_ascii=False))',
  'except BaseException as exc:',
  '    print(json.dumps({"status": "error", "message": type(exc).__name__ + ": " + str(exc), "traceback": traceback.format_exc(limit=3)}, ensure_ascii=False))',
].join('\n');

function getSolutionPath(baseDir = process.cwd()) {
  return path.join(baseDir, 'solutions', 'quest-python.py');
}

function savePythonCode(code, baseDir = process.cwd()) {
  const directory = path.join(baseDir, 'solutions');
  fs.mkdirSync(directory, { recursive: true });
  const filePath = getSolutionPath(baseDir);
  fs.writeFileSync(filePath, String(code).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd() + '\n', 'utf8');
  return filePath;
}

function runPythonChallenge(solutionPath, options = {}) {
  if (!fs.existsSync(solutionPath)) {
    return { status: 'missing', message: 'Chua co file bai lam de chay.' };
  }

  const timeout = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 5000;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clawquest-python-'));
  const runnerPath = path.join(tempDir, 'runner.py');
  fs.writeFileSync(runnerPath, PYTHON_RUNNER, 'utf8');

  const candidates = process.platform === 'win32'
    ? [{ command: 'py', prefix: ['-3'] }, { command: 'python', prefix: [] }]
    : [{ command: 'python3', prefix: [] }, { command: 'python', prefix: [] }];

  try {
    for (const candidate of candidates) {
      const result = spawnSync(candidate.command, [...candidate.prefix, runnerPath, solutionPath], {
        encoding: 'utf8',
        timeout,
        maxBuffer: 1024 * 1024,
        windowsHide: true,
      });

      if (result.error && result.error.code === 'ENOENT') continue;
      if (result.error && result.error.code === 'ETIMEDOUT') {
        return { status: 'timeout', message: 'Chuong trinh chay qua ' + Math.round(timeout / 1000) + ' giay. Kiem tra vong lap hoac doan code bi treo roi thu lai.' };
      }
      if (result.error) {
        return { status: 'error', message: 'Khong chay duoc Python: ' + result.error.message };
      }

      const outputLines = String(result.stdout || '').trim().split(/\r?\n/).filter(Boolean);
      const jsonLine = outputLines[outputLines.length - 1];
      if (jsonLine) {
        try {
          return JSON.parse(jsonLine);
        } catch {
          // Continue to a readable diagnostic below.
        }
      }

      const detail = String(result.stderr || result.stdout || '').trim();
      return { status: 'error', message: detail || 'Python ket thuc voi ma ' + result.status + '.' };
    }

    return {
      status: 'unavailable',
      message: 'Khong tim thay Python. Cai Python 3 va kiem tra bang lenh py -3 --version.',
    };
  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* best-effort cleanup */ }
  }
}

module.exports = {
  QUEST_ID,
  CHALLENGE,
  getSolutionPath,
  savePythonCode,
  runPythonChallenge,
};
