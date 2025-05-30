module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/__tests__/**/*.test.[jt]s'],
  moduleFileExtensions: ['js', 'ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};