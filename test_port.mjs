import { Port } from "./port.mjs";

const test1 = () => {
  const code = "(foo (bar) baz)";

  const p = new Port(code);

  console.log(p.read_lisp());
};

const test2 = () => {
  const code = "(foo (bar) baz";

  const p = new Port(code);

  console.log(p.read_lisp());
};

const test3 = () => {
  const code = "foo (bar) baz";

  const p = new Port(code);

  console.log(p.read_lisp());
};

test3();
