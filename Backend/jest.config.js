module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  testTimeout: 30000,
  verbose: true,
  moduleFileExtensions: ['ts', 'js', 'json'],
};
