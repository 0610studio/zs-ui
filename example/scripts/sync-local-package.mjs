import { execFileSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_DIRECTORY = resolve(SCRIPT_DIRECTORY, '..');
const PACKAGE_DIRECTORY = resolve(EXAMPLE_DIRECTORY, '..');
const EXPO_MODULE_BINARY = join(PACKAGE_DIRECTORY, 'node_modules', '.bin', 'expo-module');
const LOCAL_PACKAGE_DIRECTORY = join(
  EXAMPLE_DIRECTORY,
  'node_modules',
  '@0610studio',
  'zs-ui',
);

export function syncLocalPackage() {
  if (!existsSync(EXPO_MODULE_BINARY)) {
    throw new Error('의존성이 없습니다. 저장소 루트에서 pnpm install을 먼저 실행하세요.');
  }
  if (!existsSync(LOCAL_PACKAGE_DIRECTORY)) {
    throw new Error('예제 앱의 로컬 zs-ui 의존성이 없습니다. 저장소 루트에서 pnpm install을 먼저 실행하세요.');
  }

  const linkedTo = realpathSync(LOCAL_PACKAGE_DIRECTORY);
  if (linkedTo !== realpathSync(PACKAGE_DIRECTORY)) {
    throw new Error(
      `zs-ui가 워크스페이스 링크가 아니라 복사본으로 설치되어 있습니다 (${linkedTo}).\n`
      + 'pnpm 외의 패키지 매니저로 설치한 흔적입니다. '
      + 'node_modules를 지우고 저장소 루트에서 pnpm install을 다시 실행하세요.',
    );
  }

  execFileSync(EXPO_MODULE_BINARY, ['typecheck'], {
    cwd: PACKAGE_DIRECTORY,
    stdio: 'inherit',
    env: { ...process.env, EXPO_NONINTERACTIVE: '1' },
  });
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  syncLocalPackage();
}
