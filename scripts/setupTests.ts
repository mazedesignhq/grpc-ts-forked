import execa from "execa";
import * as fs from "fs";
import * as path from "path";

const RECOMPILE = process.env.RECOMPILE === "true";

const cliPath = path.join(__dirname, "..", "cli", "index.js");
const cliPathExists = fs.existsSync(cliPath);
if (!cliPathExists || RECOMPILE) {
  console.log("Building cli ...");
  execa.sync("npm", ["run", "clean:cli"]);
  execa.sync("npm", ["run", "build:cli"]);
  console.log("Done building cli.");
} else {
  console.log("Cli ready.");
}

const generatedProtoPath = path.join(
  __dirname,
  "..",
  "test",
  "generated",
  "users"
);

const expectedFiles = [
  "users_grpc_pb.js",
  "users_grpc_pb.d.ts",
  "users_pb.js",
  "users_pb.d.ts",
];

let generateProtoFiles = RECOMPILE;
if (!generateProtoFiles) {
  for (const file of expectedFiles) {
    const filePath = path.join(generatedProtoPath, file);
    if (!fs.existsSync(filePath)) {
      generateProtoFiles = true;
      break;
    }
  }
}

if (generateProtoFiles) {
  console.log("Generating proto files for tests ...");
  execa.sync("npm", ["run", "generate:test"]);
  console.log("Done generating proto files for tests.");
} else {
  console.log("Proto files for tests already exist.");
}
