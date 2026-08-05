// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// npm v7+ will install ../node_modules/react and ../node_modules/react-native because of peerDependencies.
// To prevent the incompatible react-native between ./node_modules/react-native and ../node_modules/react-native,
// excludes the one from the parent folder when bundling.
// 경로 끝을 앵커링해 react / react-native 폴더만 정확히 차단합니다.
// (앵커가 없으면 react-reconciler, react-dom 등 접두어가 같은 루트 패키지까지 차단됨)
const blockRootPackage = (name) =>
  new RegExp(`^${path.resolve(__dirname, '..', 'node_modules', name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/.*)?$`);

config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  blockRootPackage('react'),
  blockRootPackage('react-native'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, './node_modules'),
  path.resolve(__dirname, '../node_modules'),
];

config.resolver.extraNodeModules = {
  'zs-ui': '..',
};

config.watchFolders = [path.resolve(__dirname, '..')];

config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
});

module.exports = config;
