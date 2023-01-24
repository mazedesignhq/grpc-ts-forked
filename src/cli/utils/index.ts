import * as fs from "fs";
import { join } from "path";
import { promisify } from "util";

export const readFile = promisify(fs.readFile);
export const readdir = promisify(fs.readdir);
export const stat = promisify(fs.stat);
export const writeFile = promisify(fs.writeFile);

const isRootDirectory = async (directory: string): Promise<boolean> => {
  const contents = await readdir(directory);
  if (!contents.includes("package.json")) return false;
  try {
    const packageJson = await readFile(join(directory, "package.json"), "utf8");
    const packageJsonContents = JSON.parse(packageJson);
    return packageJsonContents.name === "@lewnelson/grpc-ts";
  } catch (error) {
    return false;
  }
};

let rootDirectory: string;
export const getRootDirectory = async (): Promise<string> => {
  if (rootDirectory) return rootDirectory;
  let directory = __dirname;
  let previousDirectory = "";
  while (directory && directory !== previousDirectory) {
    if (await isRootDirectory(directory)) {
      rootDirectory = directory;
      return rootDirectory;
    }

    previousDirectory = directory;
    directory = join(directory, "..");
  }

  throw new Error("Could not find package root directory");
};
