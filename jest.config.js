const createJestPreset = require('expo-module-scripts/createJestPreset');

const IGNORE_PATTERNS = [
  '/node_modules/',
  '/example/',
  '/build/',
  '/android/',
  '/ios/',
  '/assets/',
  '/src/context/',
  '/types\\.ts$',
  '/src/ZsUiModule',
  '/src/ZsUiView',
];

module.exports = {
  ...createJestPreset(require('jest-expo/node/jest-preset')),
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: IGNORE_PATTERNS,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/index.ts',
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
    'react-native-gesture-handler': '<rootDir>/src/__tests__/__mocks__/react-native-gesture-handler.ts',
    '^@testing-library/react-hooks$': '@testing-library/react-hooks/native',
    'react-native-reanimated': '<rootDir>/src/__tests__/__mocks__/react-native-reanimated.js'
  }
};
