import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const EXAMPLE_DIRECTORY = resolve(SCRIPT_DIRECTORY, '..');
const PACKAGE_DIRECTORY = resolve(EXAMPLE_DIRECTORY, '..');
const EXPO_MODULE_BINARY = join(PACKAGE_DIRECTORY, 'node_modules', '.bin', 'expo-module');
const SOURCE_BUILD_DIRECTORY = join(PACKAGE_DIRECTORY, 'build');
const LOCAL_PACKAGE_DIRECTORY = join(
  EXAMPLE_DIRECTORY,
  'node_modules',
  '@0610studio',
  'zs-ui',
);
const LOCAL_PACKAGE_BUILD_DIRECTORY = join(LOCAL_PACKAGE_DIRECTORY, 'build');

export function syncLocalPackage() {
  if (!existsSync(EXPO_MODULE_BINARY)) {
    throw new Error('루트 패키지 의존성이 없습니다. 저장소 루트에서 yarn install을 먼저 실행하세요.');
  }
  if (!existsSync(LOCAL_PACKAGE_DIRECTORY)) {
    throw new Error('예제 앱의 로컬 zs-ui 의존성이 없습니다. example에서 yarn install을 먼저 실행하세요.');
  }

  execFileSync(EXPO_MODULE_BINARY, ['build'], {
    cwd: PACKAGE_DIRECTORY,
    stdio: 'inherit',
  });
  // file:.. 설치가 루트 개발용 node_modules까지 복사할 수 있다.
  // 실제 npm 패키지처럼 peer dependency는 예제 앱의 한 벌만 사용하게 정리한다.
  rmSync(join(LOCAL_PACKAGE_DIRECTORY, 'node_modules'), { recursive: true, force: true });
  rmSync(LOCAL_PACKAGE_BUILD_DIRECTORY, { recursive: true, force: true });
  cpSync(SOURCE_BUILD_DIRECTORY, LOCAL_PACKAGE_BUILD_DIRECTORY, { recursive: true });
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  syncLocalPackage();
}
