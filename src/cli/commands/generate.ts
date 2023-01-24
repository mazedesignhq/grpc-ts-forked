import { Command } from "commander";
import mkdirp from "mkdirp";
import execa from "execa";
import { basename, extname, join, resolve } from "path";
import { stat, readdir, getRootDirectory } from "../utils";

type GenerateOptions = {
  input: string;
  destination: string;
  recursive: boolean;
};

type InputFile = {
  path: string;
  relativePath: string;
  filename: string;
};

const getInputFilesFromDirectory = async (
  directory: string,
  recursive: boolean,
  relativePath = ""
): Promise<InputFile[]> => {
  const contents = await readdir(directory);
  return contents.reduce(async (inputFiles, item) => {
    const itemPath = join(directory, item);
    const itemStat = await stat(itemPath);
    if (itemStat.isFile() && extname(item) === ".proto") {
      return [
        ...(await inputFiles),
        {
          path: itemPath,
          relativePath,
          filename: item,
        },
      ];
    } else if (itemStat.isDirectory() && recursive) {
      return [
        ...(await inputFiles),
        ...(await getInputFilesFromDirectory(
          itemPath,
          recursive,
          join(relativePath, item)
        )),
      ];
    } else {
      return await inputFiles;
    }
  }, [] as unknown as Promise<InputFile[]>);
};

const getInputFiles = async ({
  input,
  recursive,
}: Pick<GenerateOptions, "input" | "recursive">): Promise<InputFile[]> => {
  const inputStat = await stat(input);
  if (inputStat.isDirectory()) {
    return getInputFilesFromDirectory(input, recursive);
  } else {
    if (extname(input) !== ".proto") {
      throw new Error("Input file must be a .proto file");
    }

    return [
      {
        path: input,
        relativePath: "",
        filename: basename(input),
      },
    ];
  }
};

const generateForFile = async ({
  inputFile,
  destination,
  rootDirectory,
}: {
  inputFile: InputFile;
  destination: string;
  rootDirectory: string;
}): Promise<void> => {
  const currentDirectory = process.cwd();
  const outDirectory = resolve(
    currentDirectory,
    destination,
    inputFile.relativePath,
    basename(inputFile.filename, ".proto")
  );

  const plugin = join(rootDirectory, "node_modules", ".bin", "protoc-gen-ts");
  const executable = join(
    rootDirectory,
    "node_modules",
    ".bin",
    "grpc_tools_node_protoc"
  );

  await mkdirp(outDirectory);
  try {
    console.log(`Generating code for ${inputFile.path}`);
    const protocProcess = execa(
      executable,
      [
        `--plugin=protoc-gen-ts=${plugin}`,
        `--js_out=import_style=commonjs,binary:./`,
        `--ts_out=service=grpc-node,mode=grpc-js:./`,
        `--grpc_out=grpc_js:./`,
        `--proto_path=${resolve(inputFile.path, "..")}`,
        inputFile.filename,
      ],
      {
        cwd: outDirectory,
      }
    );

    protocProcess.stdout?.pipe(process.stdout);
    protocProcess.stderr?.pipe(process.stderr);
    await protocProcess;
    console.log(`Successfully generated code for ${inputFile.path}`);
  } catch (error) {
    console.error(`Error generating for file ${inputFile.path}`);
  }
};

const onGenerate = async ({
  input,
  destination,
  recursive,
}: GenerateOptions): Promise<void> => {
  const inputFiles = await getInputFiles({ input, recursive });
  const rootDirectory = await getRootDirectory();
  await Promise.all(
    inputFiles.map((inputFile) => {
      return generateForFile({ inputFile, destination, rootDirectory });
    })
  );
};

export const register = (program: Command): void => {
  program
    .command("generate <input> [destination]")
    .option(
      "-R --no-recursive",
      "Disable recursively searching for .proto files in input directory"
    )
    .action(
      (
        input: string,
        destination: string,
        { recursive }: { recursive: boolean }
      ) => {
        onGenerate({ input, destination, recursive });
      }
    );
};
