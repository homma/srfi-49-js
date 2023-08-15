import { exit } from "node:process";
import { Port } from "./port.mjs";
export { srfi_49_read };

const stop = ".";

/**
 * read quote
 *
 * @param {string} level - indentation string, unused
 * @param {Port} port - readable stream
 * @param {string} qt - quote keyword, "quasiquote" or "quote" or "unquote"
 * @return {string[]} - data with quote
 */
const readquote = (level, port, qt) => {
  port.eat_char();
  const ch = port.peek_char();

  if ([" ", "\n", "\t"].include(ch)) {
    return [qt];
  } else {
    return [qt, port.read_lisp()];
  }
};

/**
 * read one item from stream
 *
 * @param {string} level - indentation string, unused
 * @param {Port} port - readable stream
 * @return {string[] | string} - an item
 */
const readitem = (level, port) => {
  const ch = port.peek_char();
  if (ch == "`") {
    return readquote(level, port, "quasiquote");
  } else if (ch == "'") {
    return readquote(level, port, "quote");
  } else if (ch == ",") {
    return readquote(level, port, "unquote");
  } else {
    return port.read_lisp();
  }
};

/**
 * check if indentation is added
 *
 * @param {string} indentation1 - indentation string
 * @param {string} indentation2 - indentation string
 * @return {boolean} - if indented or not
 */
const indentation_gt = (indentation1, indentation2) => {
  const len1 = indentation1.length;
  const len2 = indentation2.length;

  return len1 > len2 && indentation2 == indentation1.substring(0, len2);
};

/**
 * get indentation string
 *
 * @param {Port} port - readable stream
 * @return {string} - indentation string
 */
const indentationlevel = (port) => {
  const indentationlevel = () => {
    const ch = port.peek_char();
    if ([" ", "\t"].includes(ch)) {
      return port.read_char() + indentationlevel();
    } else {
      return "";
    }
  };

  return indentationlevel();
};

/**
 * mutate syntax tree
 *
 * @param {Object} line - (partial) syntax tree
 * @return {Object} - muteted syntax tree
 */
const clean = (line) => {
  if (!Array.isArray(line)) {
    return line;
  } else if (line == null) {
    return line;
  } else if (line[0] == "group") {
    return line.slice(1);
  } else if (line[0] == null) {
    return line.shift();
  } else if (Array.isArray(line[0])) {
    if (["quote", "quasiquote", "unquote"].includes(line[0][0])) {
      if (Array.isArray(line.slice(1)) && line.slice(1).length == 1) {
        return line[0][0].concat(line.slice(1));
      } else {
        return [line[0][0], line.slice(1)];
      }
    } else {
      return clean(line[0]).concat(line.shift(1));
    }
  } else {
    return line;
  }
};

/**
 * code block
 */
class Block {
  level;
  block;

  /**
   * @param {string} level - indentation string, unused
   * @param {Object} block - code block
   */
  constructor(level, block) {
    this.level = level;
    this.block = block;
  }
}

const b = Block;

b.prototype.toString = function () {
  return `level: '${this.level}', block: ${this.block}`;
};

/**
 * reads all subblocks of a block
 *
 * @param {string} level - indentation string
 * @param {Port} port - readable stream
 * @return {Block} - code block
 */
const readblocks = (level, port) => {
  const read = readblock_clean(level, port);
  const next_level = read.level;
  const block = read.block;

  if (next_level == level) {
    const reads = readblocks(level, port);
    const next_next_level = reads.level;
    const next_blocks = reads.block;

    if (block == stop) {
      if (Array.isArray(next_blocks)) {
        return new Block(next_next_level, next_blocks[0]);
      } else {
        return new Block(next_next_level, next_blocks);
      }
    } else {
      return new Block(next_next_level, [block].concat(next_blocks));
    }
  } else {
    return new Block(next_level, [block]);
  }
};

/**
 * read one block of input
 *
 * @param {string} level - indentation string
 * @param {Port} port - readable stream
 * @return {Block} - code block
 */
const readblock = (level, port) => {
  const ch = port.peek_char();

  if (ch == null) {
    return new Block(-1, ch);
  } else if (ch == "\n") {
    // processing new line

    port.eat_char();

    // processing indentation
    const next_level = indentationlevel(port);
    if (indentation_gt(next_level, level)) {
      // new line is indented
      return readblocks(next_level, port);
    } else {
      // new line is not indented
      return new Block(next_level, []);
    }
  } else if ([" ", "\t"].includes(ch)) {
    // skip white space and tab
    port.eat_char();
    return readblock(level, port);
  } else {
    const first = readitem(level, port);
    const rest = readblock(level, port);
    const rest_level = rest.level;
    const block = rest.block;

    if (first == stop) {
      console.error("seems unreachable.");
      exit(1);
      if (Array.isArray(block)) {
        return new Block(rest_level, block[0]);
      } else {
        return rest;
      }
    } else {
      return new Block(rest_level, [first].concat(block));
    }
  }
};

/**
 * read a block and hendles group, (quote), (unquote) and (quasiquote).
 *
 * @param {string} level - indentation string
 * @param {Port} port - readable stream
 * @return {Block} - code block
 */
const readblock_clean = (level, port) => {
  const read = readblock(level, port);
  const next_level = read.level;
  const block = read.block;

  if (!Array.isArray(block) || block.length > 1) {
    return new Block(next_level, clean(block));
  } else {
    if (block.length == 1) {
      return new Block(next_level, block[0]);
    } else {
      return new Block(next_level, stop);
    }
  }
};

/**
 * transform syntax tree to Lisp s-exp
 *
 * @param {Object} code - syntax tree in JavaScript Array or a String
 * @return {string} - Lisp s-exp code
 */
const transform = (code) => {
  if (!Array.isArray(code)) {
    return code;
  } else {
    let r = "";
    r += "(";
    for (let s of code) {
      r += ` ${transform(s)} `;
    }
    r += ")";

    return r;
  }
};

/**
 * read i-exp code then return s-exp code
 *
 * @param {Port} port - readable stream
 * @return {string} - Lisp s-exp code
 */
const srfi_49_read = (port) => {
  const initial_level = "";

  const read = readblock_clean(initial_level, port);
  const level = read.level;
  const block = read.block;

  let ret;

  if (block == stop) {
    ret = [];
  } else {
    ret = block;
  }

  return transform(ret);
};
