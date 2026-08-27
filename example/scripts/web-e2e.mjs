import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { syncLocalPackage } from './sync-local-package.mjs';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_DIRECTORY = resolve(SCRIPT_DIRECTORY, '..');
const ARTIFACT_DIRECTORY = resolve(
  process.env.E2E_OUTPUT_DIR ?? join(tmpdir(), 'zs-ui-web-e2e'),
);
const BUILD_DIRECTORY = join(ARTIFACT_DIRECTORY, 'web-build');
const SCREENSHOT_DIRECTORY = join(ARTIFACT_DIRECTORY, 'screenshots');
const PORT = Number(process.env.E2E_PORT ?? 4178);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SESSION = `zs-ui-web-e2e-${process.pid}`;
const CONTENT_MAX_WIDTH = 1120;
const EXPO_BINARY = join(EXAMPLE_DIRECTORY, 'node_modules', '.bin', 'expo');
const AGENT_BROWSER_BINARY = join(EXAMPLE_DIRECTORY, 'node_modules', '.bin', 'agent-browser');
const STATIC_SERVER_SCRIPT = join(SCRIPT_DIRECTORY, 'static-server.mjs');

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runCommand(binary, args, options = {}) {
  return execFileSync(binary, args, {
    cwd: EXAMPLE_DIRECTORY,
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    env: {
      ...process.env,
      CI: '1',
    },
  });
}

function runBrowser(args, capture = false) {
  return runCommand(
    AGENT_BROWSER_BINARY,
    ['--session', SESSION, '--screenshot-dir', SCREENSHOT_DIRECTORY, ...args],
    { capture },
  );
}

function parseJsonOutput(output) {
  const lines = output.trim().split('\n').filter(Boolean);
  const jsonLine = lines.findLast(line => line.startsWith('{'));
  assertCondition(jsonLine !== undefined, `JSON 응답을 찾지 못했습니다: ${output}`);
  return JSON.parse(jsonLine);
}

function evaluate(expression) {
  const response = parseJsonOutput(runBrowser(['eval', expression, '--json'], true));
  assertCondition(response.success === true, response.error?.message ?? '브라우저 평가에 실패했습니다.');
  return response.data.result;
}

async function waitForStaticServer(serverProcess) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`정적 서버가 종료되었습니다. 종료 코드: ${serverProcess.exitCode}`);
    }
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return;
    } catch {
      // 서버가 포트를 열 때까지 짧게 재시도한다.
    }
    await delay(100);
  }
  throw new Error('정적 서버가 제한 시간 안에 준비되지 않았습니다.');
}

function verifyAccessibility() {
  const output = runBrowser([
    'a11y',
    '--selector',
    '[data-testid="web-example-content"]',
    '--tags',
    'wcag2a,wcag2aa',
    '--json',
  ], true);
  const response = parseJsonOutput(output);
  const violations = response.data?.violations ?? [];
  writeFileSync(
    join(ARTIFACT_DIRECTORY, 'accessibility-report.json'),
    `${JSON.stringify(response.data, null, 2)}\n`,
  );

  return {
    total: violations.length,
    blocking: violations.filter(
      violation => violation.impact === 'critical' || violation.impact === 'serious',
    ).length,
  };
}

function verifyBrowserErrors() {
  const response = parseJsonOutput(runBrowser(['errors', '--json'], true));
  const errors = response.data?.errors ?? [];
  assertCondition(errors.length === 0, `브라우저 오류가 ${errors.length}건 발견되었습니다.`);
}

async function main() {
  rmSync(BUILD_DIRECTORY, { recursive: true, force: true });
  mkdirSync(SCREENSHOT_DIRECTORY, { recursive: true });

  console.log('1/5 웹 프로덕션 빌드 생성');
  syncLocalPackage();
  runCommand(EXPO_BINARY, ['export', '--platform', 'web', '--output-dir', BUILD_DIRECTORY]);

  console.log('2/5 빌드 결과 로컬 서버 실행');
  const serverProcess = spawn(process.execPath, [STATIC_SERVER_SCRIPT, BUILD_DIRECTORY, String(PORT)], {
    cwd: EXAMPLE_DIRECTORY,
    stdio: 'inherit',
  });
  await waitForStaticServer(serverProcess);

  try {
    runBrowser(['set', 'media', 'light']);
    runBrowser(['set', 'viewport', '390', '844']);
    runBrowser(['open', BASE_URL]);
    runBrowser(['wait', '--text', 'ZS-UI']);

    console.log('3/5 모바일 E2E 상호작용 검증');
    assertCondition(
      evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'),
      '홈 화면에 가로 넘침이 있습니다.',
    );
    runBrowser(['find', 'testid', 'web-example-card', 'click']);
    runBrowser(['wait', '--url', '**/WebExample']);
    runBrowser(['wait', '--text', '배포 전에 웹 동작을 직접 확인하세요']);

    assertCondition(
      evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'),
      '모바일 웹 예제에 가로 넘침이 있습니다.',
    );
    assertCondition(
      evaluate(`(() => {
        const first = document.querySelector('[data-testid="web-example-column-primary"]')?.getBoundingClientRect();
        const second = document.querySelector('[data-testid="web-example-column-secondary"]')?.getBoundingClientRect();
        return Boolean(first && second && second.top >= first.bottom);
      })()`),
      '모바일에서 예제 열이 세로로 배치되지 않았습니다.',
    );
    runBrowser([
      'screenshot',
      join(SCREENSHOT_DIRECTORY, 'web-example-mobile-top-light.png'),
    ]);

    runBrowser(['find', 'testid', 'zs-tab-item-1', 'click']);
    runBrowser(['wait', '--text', '선택된 탭: interaction']);
    runBrowser(['find', 'testid', 'zs-segmented-segment-1', 'click']);
    runBrowser(['find', 'testid', 'web-chip', 'click']);
    runBrowser(['find', 'testid', 'web-switch', 'click']);
    runBrowser(['wait', '--text', '세그먼트 2 · 칩 선택 · 스위치 꺼짐']);

    runBrowser(['find', 'testid', 'zs-dropdown-surface', 'click']);
    runBrowser(['wait', '--text', '기준 화면 선택']);
    runBrowser(['find', 'testid', 'web-viewport-option-1', 'click']);
    runBrowser(['wait', '--text', '선택 화면: 태블릿 · 768px']);
    runBrowser(['wait', '--fn', "!document.body.textContent.includes('기준 화면 선택')"]);

    runBrowser([
      'screenshot',
      join(SCREENSHOT_DIRECTORY, 'web-example-mobile-interaction-light.png'),
    ]);

    console.log('4/5 데스크톱 반응형·테마 검증');
    runBrowser(['set', 'viewport', '1440', '1000']);
    runBrowser(['reload']);
    runBrowser(['wait', '--text', '배포 전에 웹 동작을 직접 확인하세요']);

    assertCondition(
      evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'),
      '데스크톱 웹 예제에 가로 넘침이 있습니다.',
    );
    assertCondition(
      evaluate(`(() => {
        const content = document.querySelector('[data-testid="web-example-content"]')?.getBoundingClientRect();
        const first = document.querySelector('[data-testid="web-example-column-primary"]')?.getBoundingClientRect();
        const second = document.querySelector('[data-testid="web-example-column-secondary"]')?.getBoundingClientRect();
        return Boolean(content && first && second && content.width <= ${CONTENT_MAX_WIDTH} && Math.abs(first.top - second.top) <= 1 && second.left > first.left);
      })()`),
      '데스크톱에서 최대 폭 또는 2열 레이아웃이 맞지 않습니다.',
    );
    runBrowser([
      'screenshot',
      '--full',
      join(SCREENSHOT_DIRECTORY, 'web-example-desktop-light.png'),
    ]);

    runBrowser(['find', 'testid', 'theme-toggle', 'click']);
    runBrowser([
      'wait',
      '--fn',
      "document.querySelector('[data-testid=\"theme-toggle\"]')?.getAttribute('aria-label') === '라이트 모드로 전환'",
    ]);
    runBrowser(['screenshot', '--full', join(SCREENSHOT_DIRECTORY, 'web-example-desktop-dark.png')]);

    const accessibility = verifyAccessibility();
    verifyBrowserErrors();

    console.log('5/5 검증 완료');
    console.log(`- WCAG A/AA 위반 규칙: ${accessibility.total}건 (중대 ${accessibility.blocking}건)`);
    console.log(`- 결과 위치: ${ARTIFACT_DIRECTORY}`);
  } finally {
    try {
      runBrowser(['close']);
    } catch {
      // 브라우저가 먼저 종료된 경우 테스트 결과를 가리지 않는다.
    }
    serverProcess.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
