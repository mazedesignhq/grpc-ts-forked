#!/usr/bin/env node
import { program } from "commander";
import { commands } from "./commands/index";

const registerCommands = (): void => {
  commands.forEach((command) => command(program));
};

const main = (): void => {
  registerCommands();
  program.parse();
};

main();
