/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/lib/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', {}] }
};
