module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  roots: ['<rootDir>/tests', '<rootDir>/app/backend'],
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{ts,tsx,js,jsx}',
    '!app/**/*.test.{ts,tsx}',
    '!app/**/node_modules/**',
    '!app/**/dist/**',
    '!app/**/build/**',
    '!app/**/coverage/**',
    '!app/**/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
