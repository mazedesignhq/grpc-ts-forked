/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  collectCoverage: true,
  coverageDirectory: "./coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/generated/"],
};
