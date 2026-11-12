const path = require('path');

const expoModuleScriptsDir = path.dirname(require.resolve('expo-module-scripts/package.json'));
const createJestPreset = require(path.join(expoModuleScriptsDir, 'createJestPreset.cjs'));

const IGNORE_PATTERNS = [
  '/node_modules/',
  '/example/',
  '/build/',
  '/android/',
  '/ios/',
  '/assets/',
  '/src/context/',
  '/types\\.ts$',
];

const preset = createJestPreset(require('jest-expo/node/jest-preset'));

const TRANSFORM_PACKAGES = '@material/material-color-utilities|';

module.exports = {
  ...preset,
  transformIgnorePatterns: preset.transformIgnorePatterns.map((pattern) =>
    pattern.replace(/\/node_modules\/\(\?!\((\?:)?/, (prefix) => prefix + TRANSFORM_PACKAGES),
  ),
  roots: ['<rootDir>/src'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'require'],
  },
  testPathIgnorePatterns: IGNORE_PATTERNS,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/index.ts',
    'src/layout/**/*.{ts,tsx}',
    'src/model/**/*.{ts,tsx}',
    'src/theme/**/*.{ts,tsx}',
    'src/ui/**/*.{ts,tsx}',
    'src/overlay/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coveragePathIgnorePatterns: IGNORE_PATTERNS,
  coverageReporters: ['text', 'lcov'],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: { branches: 70, functions: 85, lines: 90, statements: 90 },
    './src/model/': { branches: 80, functions: 90, lines: 95, statements: 95 },
    './src/theme/': { branches: 90, functions: 90, lines: 100, statements: 100 },
    './src/ui/': { branches: 0, functions: 0, lines: 0, statements: 0 },
    './src/overlay/': { branches: 10, functions: 10, lines: 20, statements: 20 },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/jest.setup.ts'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/__tests__/__mocks__/react-native.ts',
    '^expo-router$': '<rootDir>/src/__tests__/__mocks__/expo-router.ts',
    '^expo-router/native-tabs$': '<rootDir>/src/__tests__/__mocks__/expo-router-native-tabs.tsx',
    '^expo-router/react-navigation$': '<rootDir>/src/__tests__/__mocks__/expo-router-react-navigation.ts',
    '^expo$': '<rootDir>/src/__tests__/__mocks__/expo.ts',
    '^expo-hinge$': '<rootDir>/src/__tests__/__mocks__/expo-hinge.ts',
    'react-native-gesture-handler': '<rootDir>/src/__tests__/__mocks__/react-native-gesture-handler.ts',
    'react-native-reanimated': '<rootDir>/src/__tests__/__mocks__/react-native-reanimated.js',
    'react-native-worklets': '<rootDir>/src/__tests__/__mocks__/react-native-worklets.ts',
    '^react-native-skia$': '<rootDir>/src/__tests__/__mocks__/react-native-skia.tsx',
    '^@expo/ui$': '<rootDir>/src/__tests__/__mocks__/expo-ui.tsx',
    '^@expo/ui/swift-ui$': '<rootDir>/src/__tests__/__mocks__/expo-ui-swift-ui.ts',
    '^@expo/ui/swift-ui/modifiers$': '<rootDir>/src/__tests__/__mocks__/expo-ui-swift-ui-modifiers.ts',
    '^@expo/ui/jetpack-compose$': '<rootDir>/src/__tests__/__mocks__/expo-ui-jetpack-compose.tsx',
    '^@expo/ui/jetpack-compose/modifiers$': '<rootDir>/src/__tests__/__mocks__/expo-ui-jetpack-compose-modifiers.ts',
    '^@expo/ui/community/bottom-sheet$': '<rootDir>/src/__tests__/__mocks__/expo-ui-community-bottom-sheet.ts',
    '^@expo/ui/community/menu$': '<rootDir>/src/__tests__/__mocks__/expo-ui-community-menu.ts',
    '^expo-navigation-bar$': '<rootDir>/src/__tests__/__mocks__/expo-navigation-bar.ts',
    '^expo-status-bar$': '<rootDir>/src/__tests__/__mocks__/expo-status-bar.ts',
    '^react-native-screens$': '<rootDir>/src/__tests__/__mocks__/react-native-screens.ts',
    '^expo-blur$': '<rootDir>/src/__tests__/__mocks__/expo-blur.tsx',
    '^@react-native-async-storage/async-storage$': '@react-native-async-storage/async-storage/jest/async-storage-mock',
  }
};
