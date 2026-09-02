const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

// 루트를 watch 대상에 넣고 모듈 탐색 경로를 고정해야 심링크 너머의 소스가 반영되고
// react 가 한 벌만 로드된다.
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = true;

// zs-ui 의 main 은 build/index.js 라 그대로 두면 src 수정마다 tsc 빌드가 필요하다.
// 엔트리를 src 로 갈아끼워 저장 즉시 Fast Refresh 로 반영되게 한다.
const LIBRARY_NAME = '@0610studio/zs-ui';
const LIBRARY_SOURCE_DIR = path.resolve(workspaceRoot, 'src');

/** Metro 는 resolveRequest 에 넘긴 절대 경로를 상대 경로로 취급하므로 후보를 직접 훑는다. */
function resolveLibraryEntry(platform) {
  const suffixes = platform === 'web'
    ? [`.${platform}`, '']
    : [`.${platform}`, '.native', ''];

  for (const suffix of suffixes) {
    for (const ext of ['ts', 'tsx']) {
      const candidate = path.join(LIBRARY_SOURCE_DIR, `index${suffix}.${ext}`);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  throw new Error(`${LIBRARY_NAME} 의 소스 엔트리를 찾지 못했습니다: ${LIBRARY_SOURCE_DIR}/index.ts`);
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // 서브패스(`.../package.json` 등)는 src 에 대응 파일이 없어 건드리지 않는다
  if (moduleName === LIBRARY_NAME) {
    return { type: 'sourceFile', filePath: resolveLibraryEntry(platform) };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// docs 는 react 18 을 쓰는 별개 워크스페이스라 번들러가 볼 필요가 없다
const existingBlockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existingBlockList)
    ? existingBlockList
    : [existingBlockList].filter(Boolean)),
  /[/\\]docs[/\\]node_modules[/\\].*/,
  /[/\\]docs[/\\]build[/\\].*/,
];

config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
});

module.exports = config;
