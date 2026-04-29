import type { Config } from 'jest';

const config: Config = {
  // Use ts-jest so Jest understands TypeScript
  preset: 'ts-jest',

  // We are running in Node.js, not a browser
  testEnvironment: 'node',

  // Where to find test files
  roots: ['<rootDir>/src'],

  // File patterns Jest will treat as tests
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/*.test.ts',
    '**/*.spec.ts',
  ],

  // Show code coverage report after tests run
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',       // ignore type declaration files
    '!src/index.ts',        // ignore the entry point (hard to unit test)
  ],

  // Map @ imports to src/ (matches tsconfig paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Show individual test results in terminal
  verbose: true,
};

export default config;