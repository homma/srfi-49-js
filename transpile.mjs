import { srfi_49_read } from "./srfi_49.mjs";
import { Port } from "./port.mjs";
import { argv, exit } from "node:process";
import { readFileSync } from "node:fs";

const main = () => {
  if (argv.length < 3) {
    console.error("Usage: node ./transpile.mjs <FILE>");
    exit(1);
  }

  const code = readFileSync(argv[2], "utf-8");
  const port = new Port(code);
  const result = srfi_49_read(port);
  console.log(result);
};

main();
