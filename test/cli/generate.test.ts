import execa from "execa";
import rimraf from "rimraf";
import * as fs from "fs";
import * as path from "path";

const generatedDirectory = path.join(__dirname, "generated");
const cliPath = path.join("..", "..", "cli", "index.js");

const runCommand = async (
  input: string,
  destination: string,
  recursive = true
) => {
  const commandArgs = [cliPath, "generate", input, destination];
  if (recursive === false) {
    commandArgs.push("--no-recursive");
  }

  await execa("node", commandArgs, {
    cwd: __dirname,
  });
};

const cleanup = async () => {
  await rimraf(generatedDirectory);
};

type FilesystemItem =
  | {
      type: "file";
      name: string;
    }
  | {
      type: "directory";
      name: string;
      children: FilesystemItem[];
    };

type FilesystemTree = FilesystemItem[];

const getFilesystemTree = (directory: string, tree: FilesystemTree = []) => {
  const items = fs.readdirSync(directory);
  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      const children: FilesystemItem[] = [];
      tree.push({
        type: "directory",
        name: item,
        children: getFilesystemTree(itemPath, children),
      });
    } else {
      tree.push({
        type: "file",
        name: item,
      });
    }
  });

  return tree;
};

describe("'grpc-ts generate' cli command", () => {
  let filesystemTree: FilesystemTree;
  describe("when specifying a directory", () => {
    beforeAll(async () => {
      await runCommand("../protos", "./generated", true);
      filesystemTree = getFilesystemTree(generatedDirectory);
    });

    afterAll(async () => {
      await cleanup();
    });

    it("should generate the code for each proto file in the directory and subdirectory", () => {
      expect(filesystemTree).toMatchInlineSnapshot(`
        [
          {
            "children": [
              {
                "children": [
                  {
                    "name": "events_grpc_pb.d.ts",
                    "type": "file",
                  },
                  {
                    "name": "events_grpc_pb.js",
                    "type": "file",
                  },
                  {
                    "name": "events_pb.d.ts",
                    "type": "file",
                  },
                  {
                    "name": "events_pb.js",
                    "type": "file",
                  },
                  {
                    "name": "index.d.ts",
                    "type": "file",
                  },
                  {
                    "name": "index.js",
                    "type": "file",
                  },
                ],
                "name": "events",
                "type": "directory",
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "name": "index.d.ts",
                        "type": "file",
                      },
                      {
                        "name": "index.js",
                        "type": "file",
                      },
                      {
                        "name": "monitoring_grpc_pb.d.ts",
                        "type": "file",
                      },
                      {
                        "name": "monitoring_grpc_pb.js",
                        "type": "file",
                      },
                      {
                        "name": "monitoring_pb.d.ts",
                        "type": "file",
                      },
                      {
                        "name": "monitoring_pb.js",
                        "type": "file",
                      },
                    ],
                    "name": "monitoring",
                    "type": "directory",
                  },
                ],
                "name": "infra",
                "type": "directory",
              },
              {
                "children": [
                  {
                    "name": "index.d.ts",
                    "type": "file",
                  },
                  {
                    "name": "index.js",
                    "type": "file",
                  },
                  {
                    "name": "users_grpc_pb.d.ts",
                    "type": "file",
                  },
                  {
                    "name": "users_grpc_pb.js",
                    "type": "file",
                  },
                  {
                    "name": "users_pb.d.ts",
                    "type": "file",
                  },
                  {
                    "name": "users_pb.js",
                    "type": "file",
                  },
                ],
                "name": "users",
                "type": "directory",
              },
            ],
            "name": "accounts",
            "type": "directory",
          },
          {
            "children": [
              {
                "name": "events_grpc_pb.d.ts",
                "type": "file",
              },
              {
                "name": "events_grpc_pb.js",
                "type": "file",
              },
              {
                "name": "events_pb.d.ts",
                "type": "file",
              },
              {
                "name": "events_pb.js",
                "type": "file",
              },
              {
                "name": "index.d.ts",
                "type": "file",
              },
              {
                "name": "index.js",
                "type": "file",
              },
            ],
            "name": "events",
            "type": "directory",
          },
          {
            "children": [
              {
                "name": "index.d.ts",
                "type": "file",
              },
              {
                "name": "index.js",
                "type": "file",
              },
              {
                "name": "logger_grpc_pb.d.ts",
                "type": "file",
              },
              {
                "name": "logger_grpc_pb.js",
                "type": "file",
              },
              {
                "name": "logger_pb.d.ts",
                "type": "file",
              },
              {
                "name": "logger_pb.js",
                "type": "file",
              },
            ],
            "name": "logger",
            "type": "directory",
          },
          {
            "children": [
              {
                "name": "index.d.ts",
                "type": "file",
              },
              {
                "name": "index.js",
                "type": "file",
              },
              {
                "name": "people_grpc_pb.d.ts",
                "type": "file",
              },
              {
                "name": "people_grpc_pb.js",
                "type": "file",
              },
              {
                "name": "people_pb.d.ts",
                "type": "file",
              },
              {
                "name": "people_pb.js",
                "type": "file",
              },
            ],
            "name": "people",
            "type": "directory",
          },
          {
            "children": [
              {
                "name": "index.d.ts",
                "type": "file",
              },
              {
                "name": "index.js",
                "type": "file",
              },
              {
                "name": "users_grpc_pb.d.ts",
                "type": "file",
              },
              {
                "name": "users_grpc_pb.js",
                "type": "file",
              },
              {
                "name": "users_pb.d.ts",
                "type": "file",
              },
              {
                "name": "users_pb.js",
                "type": "file",
              },
            ],
            "name": "users",
            "type": "directory",
          },
        ]
      `);
    });
  });

  describe("when specifying a directory and setting recursive to false", () => {
    beforeAll(async () => {
      await runCommand("../protos", "./generated", false);
      filesystemTree = getFilesystemTree(generatedDirectory);
    });

    afterAll(async () => {
      await cleanup();
    });

    it("should generate the code for each proto file in the top level directory", () => {
      expect(filesystemTree).toMatchInlineSnapshot(`
        [
          {
            "children": [
              {
                "name": "events_grpc_pb.d.ts",
                "type": "file",
              },
              {
                "name": "events_grpc_pb.js",
                "type": "file",
              },
              {
                "name": "events_pb.d.ts",
                "type": "file",
              },
              {
                "name": "events_pb.js",
                "type": "file",
              },
              {
                "name": "index.d.ts",
                "type": "file",
              },
              {
                "name": "index.js",
                "type": "file",
              },
            ],
            "name": "events",
            "type": "directory",
          },
          {
            "children": [
              {
                "name": "index.d.ts",
                "type": "file",
              },
              {
                "name": "index.js",
                "type": "file",
              },
              {
                "name": "logger_grpc_pb.d.ts",
                "type": "file",
              },
              {
                "name": "logger_grpc_pb.js",
                "type": "file",
              },
              {
                "name": "logger_pb.d.ts",
                "type": "file",
              },
              {
                "name": "logger_pb.js",
                "type": "file",
              },
            ],
            "name": "logger",
            "type": "directory",
          },
          {
            "children": [
              {
                "name": "index.d.ts",
                "type": "file",
              },
              {
                "name": "index.js",
                "type": "file",
              },
              {
                "name": "people_grpc_pb.d.ts",
                "type": "file",
              },
              {
                "name": "people_grpc_pb.js",
                "type": "file",
              },
              {
                "name": "people_pb.d.ts",
                "type": "file",
              },
              {
                "name": "people_pb.js",
                "type": "file",
              },
            ],
            "name": "people",
            "type": "directory",
          },
          {
            "children": [
              {
                "name": "index.d.ts",
                "type": "file",
              },
              {
                "name": "index.js",
                "type": "file",
              },
              {
                "name": "users_grpc_pb.d.ts",
                "type": "file",
              },
              {
                "name": "users_grpc_pb.js",
                "type": "file",
              },
              {
                "name": "users_pb.d.ts",
                "type": "file",
              },
              {
                "name": "users_pb.js",
                "type": "file",
              },
            ],
            "name": "users",
            "type": "directory",
          },
        ]
      `);
    });
  });

  describe("when specifying a single file in ./protos/events.proto", () => {
    beforeAll(async () => {
      await runCommand("../protos/events.proto", "./generated");
      filesystemTree = getFilesystemTree(generatedDirectory);
    });

    afterAll(async () => {
      await cleanup();
    });

    it("should only generate the code for events.proto at the root of ./generated", () => {
      expect(filesystemTree).toMatchInlineSnapshot(`
        [
          {
            "children": [
              {
                "name": "events_grpc_pb.d.ts",
                "type": "file",
              },
              {
                "name": "events_grpc_pb.js",
                "type": "file",
              },
              {
                "name": "events_pb.d.ts",
                "type": "file",
              },
              {
                "name": "events_pb.js",
                "type": "file",
              },
              {
                "name": "index.d.ts",
                "type": "file",
              },
              {
                "name": "index.js",
                "type": "file",
              },
            ],
            "name": "events",
            "type": "directory",
          },
        ]
      `);
    });
  });

  describe("when specifying a single file in ./protos/accounts/infra/monitoring.proto", () => {
    beforeAll(async () => {
      await runCommand(
        "../protos/accounts/infra/monitoring.proto",
        "./generated"
      );
      filesystemTree = getFilesystemTree(generatedDirectory);
    });

    afterAll(async () => {
      await cleanup();
    });

    it("should only generate the code for events.proto at the root of ./generated", () => {
      expect(filesystemTree).toMatchInlineSnapshot(`
        [
          {
            "children": [
              {
                "name": "index.d.ts",
                "type": "file",
              },
              {
                "name": "index.js",
                "type": "file",
              },
              {
                "name": "monitoring_grpc_pb.d.ts",
                "type": "file",
              },
              {
                "name": "monitoring_grpc_pb.js",
                "type": "file",
              },
              {
                "name": "monitoring_pb.d.ts",
                "type": "file",
              },
              {
                "name": "monitoring_pb.js",
                "type": "file",
              },
            ],
            "name": "monitoring",
            "type": "directory",
          },
        ]
      `);
    });
  });

  describe("generating the output in a nested subdirectory", () => {
    beforeAll(async () => {
      await runCommand(
        "../protos/accounts/infra/monitoring.proto",
        "./generated/subdirectory/generated"
      );
      filesystemTree = getFilesystemTree(
        path.join(generatedDirectory, "subdirectory", "generated")
      );
    });

    afterAll(async () => {
      await cleanup();
    });

    it("should output the code to the specified directory correctly", () => {
      expect(filesystemTree).toMatchInlineSnapshot(`
        [
          {
            "children": [
              {
                "name": "index.d.ts",
                "type": "file",
              },
              {
                "name": "index.js",
                "type": "file",
              },
              {
                "name": "monitoring_grpc_pb.d.ts",
                "type": "file",
              },
              {
                "name": "monitoring_grpc_pb.js",
                "type": "file",
              },
              {
                "name": "monitoring_pb.d.ts",
                "type": "file",
              },
              {
                "name": "monitoring_pb.js",
                "type": "file",
              },
            ],
            "name": "monitoring",
            "type": "directory",
          },
        ]
      `);
    });
  });
});
