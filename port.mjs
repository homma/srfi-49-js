export { Port };
import { exit } from "node:process";

const debug_on = false;
const debug = (str) => {
  if (debug_on == true) {
    console.log(str);
  }
};

class Port {
  data;
  cur_pos = 0;
  end_pos;

  constructor(str) {
    this.data = str;
    this.end_pos = str.length;
  }
}

const p = Port;

p.prototype.read_char = function () {
  if (this.cur_pos == this.end_pos) {
    return null;
  }

  const ch = this.data[this.cur_pos];
  this.cur_pos++;

  return ch;
};

p.prototype.peek_char = function () {
  if (this.cur_pos == this.end_pos) {
    return null;
  }

  const ch = this.data[this.cur_pos];
  return ch;
};

p.prototype.eat_char = function () {
  if (this.cur_pos != this.end_pos) {
    this.cur_pos++;
  }
};

p.prototype.toString = function () {
  return `
cur_pos: ${this.cur_pos}
end_pos: ${this.end_pos}
data: ${this.data}
read: ${this.data.substring(0, this.cur_pos)}
rest: ${this.data.substring(this.cur_pos, this.end_pos)}
`;
};

p.prototype.dump = function () {
  console.log(this);
};

p.prototype.read_lisp = function () {
  // need improvement

  this.skip_white();

  const ch = this.peek_char();
  if (ch == "(") {
    return this.read_paren();
  } else {
    return this.read_atom();
  }
};

p.prototype.skip_white = function () {
  while (true) {
    let ch = this.peek_char();
    if (ch == " ") {
      this.eat_char();
      continue;
    } else {
      break;
    }
  }
};

p.prototype.read_atom = function () {
  let s = "";

  while (![" ", "\n", null].includes(this.peek_char())) {
    s = s + this.read_char();
  }

  return s;
};

p.prototype.read_paren = function () {
  // initial '('
  let s = this.read_char();

  while (true) {
    let ch = this.peek_char();
    if (ch == null) {
      console.error("unexpected end of data");
      exit(1);
    }

    if (ch == ")") {
      s = s + this.read_char();
      return s;
    } else if (ch == "(") {
      s = s + this.read_paren();
    } else {
      s = s + this.read_char();
    }
  }
};
