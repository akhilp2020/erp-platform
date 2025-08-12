/** @type {import('jest').Config} */
module.exports = {
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.[jt]s"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  transform: {}, // no TS transform needed here
};
