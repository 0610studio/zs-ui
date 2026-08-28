import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncLocalPackage } from '../../example/scripts/sync-local-package.mjs';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const DOCS_DIRECTORY = resolve(SCRIPT_DIRECTORY, '..');
const EXAMPLE_DIRECTORY = resolve(DOCS_DIRECTORY, '..', 'example');
const EXPO_BINARY = join(EXAMPLE_DIRECTORY, 'node_modules', '.bin', 'expo');
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
