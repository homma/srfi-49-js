import { Port } from "./port.mjs";
import { srfi_49_read } from "./srfi_49.mjs";

const test1 = () => {
  const code = `define
  fac x
  if
    = x 0
    1
    * x
      fac
        - x 1
`;

  const port = new Port(code);
  const result = srfi_49_read(port);
  console.log(result);
};

const test2 = () => {
  const code = `let
  group
    foo
      + 1 2
    bar
      + 3 4
  + foo bar
`;

  const port = new Port(code);
  const result = srfi_49_read(port);
  console.log(result);
};

const test3 = () => {
  const code = `define (fac x)
  if (= x 0)
    1
    * x
      fac (- x 1)
`;

  const port = new Port(code);
  const result = srfi_49_read(port);
  console.log(result);
};

const test4 = () => {
  const code = `let
  group
    foo (+ 1 2)
    bar (+ 3 4)
  + foo bar
`;

  const port = new Port(code);
  const result = srfi_49_read(port);
  console.log(result);
};

test1();
test2();
test3();
test4();
