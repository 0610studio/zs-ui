import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncLocalPackage } from '../../example/scripts/sync-local-package.mjs';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const DOCS_DIRECTORY = resolve(SCRIPT_DIRECTORY, '..');
const WORKSPACE_ROOT = resolve(DOCS_DIRECTORY, '..');
const EXAMPLE_DIRECTORY = join(WORKSPACE_ROOT, 'example');

// pnpm hoisting 때문에 expo 바이너리는 보통 루트에만 있다 — 예제 앱 쪽도 함께 확인한다
const EXPO_BINARY = [
  join(EXAMPLE_DIRECTORY, 'node_modules', '.bin', 'expo'),
  join(WORKSPACE_ROOT, 'node_modules', '.bin', 'expo'),
].find(existsSync);

if (!EXPO_BINARY) {
  throw new Error('expo 실행 파일을 찾지 못했습니다. 저장소 루트에서 pnpm install을 먼저 실행하세요.');
}
const TARGET_DIRECTORY = join(DOCS_DIRECTORY, 'static', 'playground');
const DOCS_BASE_URL = process.env.ZS_UI_DOCS_BASE_URL ?? '/zs-ui/playground';
const TEMPORARY_DIRECTORY = mkdtempSync(join(tmpdir(), 'zs-ui-docs-playground-'));

function normalizeStaticRoutes() {
  const routeFiles = readdirSync(TEMPORARY_DIRECTORY, { withFileTypes: true }).filter(
    entry => entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html',
  );

  routeFiles.forEach(routeFile => {
    const routeName = routeFile.name.slice(0, -'.html'.length);
    const routeDirectory = join(TEMPORARY_DIRECTORY, routeName);
    mkdirSync(routeDirectory, { recursive: true });
    renameSync(
      join(TEMPORARY_DIRECTORY, routeFile.name),
      join(routeDirectory, 'index.html'),
    );
  });
}

try {
  console.log(`로컬 예제 빌드: ${DOCS_BASE_URL}`);
  syncLocalPackage();
  execFileSync(
    EXPO_BINARY,
    ['export', '--platform', 'web', '--output-dir', TEMPORARY_DIRECTORY],
    {
      cwd: EXAMPLE_DIRECTORY,
      env: {
        ...process.env,
        CI: '1',
        ZS_UI_DOCS_BASE_URL: DOCS_BASE_URL,
      },
      stdio: 'inherit',
    },
  );

  normalizeStaticRoutes();

  rmSync(TARGET_DIRECTORY, { recursive: true, force: true });
  cpSync(TEMPORARY_DIRECTORY, TARGET_DIRECTORY, { recursive: true });
  console.log(`로컬 예제 준비 완료: ${TARGET_DIRECTORY}`);
} finally {
  rmSync(TEMPORARY_DIRECTORY, { recursive: true, force: true });
}
