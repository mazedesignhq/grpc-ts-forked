/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/test/tsconfig.json",
      },
    ],
  },
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  collectCoverage: true,
  coverageDirectory: "./coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/generated/"],
  moduleNameMapper: {
    "^@lewnelson/grpc-ts$": "<rootDir>/src/index.ts",
  },
};
