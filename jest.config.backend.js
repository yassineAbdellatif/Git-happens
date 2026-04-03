module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
          allowJs: true,
        },
      },
    ],
  },
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  testPathIgnorePatterns: ["<rootDir>/tests/integration/"],
  roots: ["<rootDir>/tests", "<rootDir>/app/backend"],
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{ts,tsx,js,jsx}",
    "!app/**/*.test.{ts,tsx}",
    "!app/**/node_modules/**",
    "!app/**/dist/**",
    "!app/**/build/**",
    "!app/**/coverage/**",
    "!app/**/__mocks__/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  moduleNameMapper: {
    "^react-native$": "<rootDir>/tests/__mocks__/react-native.js",
  },
};
