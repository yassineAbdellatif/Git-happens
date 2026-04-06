module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
          allowJs: true,
          lib: ["es2021"],
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
    "app/backend/src/**/*.{ts,js}",
    "app/frontend/src/utils/**/*.{ts,js}",
    "app/frontend/src/constants/**/*.{ts,js}",
    "!app/**/*.test.{ts,tsx}",
    "!app/**/node_modules/**",
    "!app/**/dist/**",
    "!app/**/build/**",
    "!app/**/coverage/**",
    "!app/**/__mocks__/**",
    "!app/backend/src/services/mapService.ts",
    "!app/backend/src/index.ts",
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
