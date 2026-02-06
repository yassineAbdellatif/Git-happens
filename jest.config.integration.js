module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.test.ts'],
  roots: ['<rootDir>/tests/integration', '<rootDir>/app/backend'],
  collectCoverage: true,
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
  testTimeout: 10000,
};
