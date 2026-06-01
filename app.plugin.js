const { AndroidConfig, createRunOncePlugin, withAndroidManifest } = require('expo/config-plugins');
const pkg = require('./package.json');

const REQUIRED_CONFIG_CHANGES = [
  'keyboard',
  'keyboardHidden',
  'orientation',
  'screenSize',
  'smallestScreenSize',
  'screenLayout',
  'density',
  'fontScale',
  'touchscreen',
  'uiMode',
];

function mergeConfigChanges(configChanges) {
  const currentConfigChanges = typeof configChanges === 'string'
    ? configChanges.split('|').filter(Boolean)
    : [];

  return Array.from(new Set([...currentConfigChanges, ...REQUIRED_CONFIG_CHANGES])).join('|');
}

function withZsUiAndroidManifest(config) {
  return withAndroidManifest(config, (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults);

    mainActivity.$['android:launchMode'] = 'singleTask';
    mainActivity.$['android:configChanges'] = mergeConfigChanges(
      mainActivity.$['android:configChanges']
    );

    return config;
  });
}

module.exports = createRunOncePlugin(withZsUiAndroidManifest, pkg.name, pkg.version);
