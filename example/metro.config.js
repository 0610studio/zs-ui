const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = false;

const LIBRARY_NAME = '@0610studio/zs-ui';
const LIBRARY_SOURCE_DIR = path.resolve(workspaceRoot, 'src');

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
  if (moduleName === LIBRARY_NAME) {
    return { type: 'sourceFile', filePath: resolveLibraryEntry(platform) };
  }
  return context.resolveRequest(context, moduleName, platform);
};

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
