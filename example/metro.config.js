// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// npm v7+ will install ../node_modules/react and ../node_modules/react-native because of peerDependencies.
// To prevent the incompatible react-native between ./node_modules/react-native and ../node_modules/react-native,
// excludes the one from the parent folder when bundling.
// 경로 끝을 앵커링해 react / react-native 폴더만 정확히 차단합니다.
// (앵커가 없으면 react-reconciler, react-dom 등 접두어가 같은 루트 패키지까지 차단됨)
const rootNodeModules = path.resolve(__dirname, '..', 'node_modules');
const exampleNodeModules = path.resolve(__dirname, 'node_modules');
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const realPathIfExists = (value) => {
  try {
    return fs.realpathSync(value);
  } catch {
    return value;
  }
};
const blockRootPackage = (name) => {
  const packagePaths = [
    path.resolve(rootNodeModules, name),
    realPathIfExists(path.resolve(rootNodeModules, name)),
  ];

  return new RegExp(
    `^(?:${packagePaths.map(escapeRegExp).join('|')})(/.*)?$`,
  );
};

config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  blockRootPackage('react'),
  blockRootPackage('react-native'),
  blockRootPackage('react-native-safe-area-context'),
  blockRootPackage('react-native-reanimated'),
  blockRootPackage('react-native-worklets'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, './node_modules'),
  path.resolve(__dirname, '../node_modules'),
];

config.resolver.extraNodeModules = {
  'zs-ui': '..',
  react: path.resolve(exampleNodeModules, 'react'),
  'react-native': path.resolve(exampleNodeModules, 'react-native'),
  'react-native-reanimated': path.resolve(exampleNodeModules, 'react-native-reanimated'),
  'react-native-worklets': path.resolve(exampleNodeModules, 'react-native-worklets'),
};

config.watchFolders = [path.resolve(__dirname, '..')];

config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
});

module.exports = config;
