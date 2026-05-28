// CPHub-DSL: a tiny safe expression language for leaderboard cells & sort keys.
//
// Grammar (informal):
//   expr        := ternary
//   ternary     := logicOr ('?' ternary ':' ternary)?
//   logicOr     := logicAnd ('||' logicAnd)*
//   logicAnd    := equality ('&&' equality)*
//   equality    := comparison (('=='|'!=') comparison)*
//   comparison  := additive (('<='|'>='|'<'|'>') additive)*
//   additive    := multiplicative (('+'|'-') multiplicative)*
//   multiplicative := unary (('*'|'/'|'%') unary)*
//   unary       := ('!'|'-') unary | call
//   call        := atom ('.' IDENT | '(' args ')')*
//   atom        := NUMBER | STRING | IDENT | '(' expr ')'
//
// Built-in functions: max, min, if, len, upper, lower, concat, round, sum, default, contains.
// Identifier resolution: row[ident] (so `cf_rating`, `name`, etc.). `extras` resolves to row.extras (object).
//
// No `eval`, no access to globals. Errors throw with a friendly message.

// -- lexer --------------------------------------------------------------
function tokenize(src) {
  const tokens = [];
  let i = 0;
  const n = src.length;
  const single = '()+-*/%,.?:';
  while (i < n) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n') { i++; continue; }
    if (c >= '0' && c <= '9') {
      let j = i + 1;
      while (j < n && ((src[j] >= '0' && src[j] <= '9') || src[j] === '.')) j++;
      tokens.push({ t: 'num', v: Number(src.slice(i, j)) });
      i = j; continue;
    }
    if (c === '"' || c === "'") {
      const q = c; let j = i + 1; let out = '';
      while (j < n && src[j] !== q) {
        if (src[j] === '\\' && j + 1 < n) { out += src[j + 1]; j += 2; }
        else { out += src[j]; j++; }
      }
      if (j >= n) throw new Error('Unterminated string');
      tokens.push({ t: 'str', v: out });
      i = j + 1; continue;
    }
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') {
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      tokens.push({ t: 'ident', v: src.slice(i, j) });
      i = j; continue;
    }
    // multi-char operators
    const two = src.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '&&', '||'].includes(two)) { tokens.push({ t: 'op', v: two }); i += 2; continue; }
    if (single.includes(c) || c === '<' || c === '>' || c === '!' || c === '=') {
      tokens.push({ t: 'op', v: c }); i++; continue;
    }
    throw new Error(`Unexpected character '${c}' at position ${i}`);
  }
  return tokens;
}

// -- parser -------------------------------------------------------------
function parse(src) {
  const toks = tokenize(src);
  let p = 0;
  const peek = (o = 0) => toks[p + o];
  const eat = (t, v) => {
    const tk = toks[p];
    if (!tk || tk.t !== t || (v !== undefined && tk.v !== v)) {
      throw new Error(`Expected ${v || t}, got ${tk ? JSON.stringify(tk) : 'end'}`);
    }
    p++; return tk;
  };
  const opIs = (...vs) => peek() && peek().t === 'op' && vs.includes(peek().v);

  function parseExpr() { return parseTernary(); }
  function parseTernary() {
    const cond = parseOr();
    if (opIs('?')) { eat('op', '?'); const a = parseTernary(); eat('op', ':'); const b = parseTernary();
      return { type: 'tern', cond, a, b };
    }
    return cond;
  }
  function parseOr()  { let n = parseAnd(); while (opIs('||')) { eat('op'); n = { type: 'bin', op: '||', l: n, r: parseAnd() }; } return n; }
  function parseAnd() { let n = parseEq();  while (opIs('&&')) { eat('op'); n = { type: 'bin', op: '&&', l: n, r: parseEq() };  } return n; }
  function parseEq()  { let n = parseCmp(); while (opIs('==','!=')) { const o = eat('op').v; n = { type: 'bin', op: o, l: n, r: parseCmp() }; } return n; }
  function parseCmp() { let n = parseAdd(); while (opIs('<','>','<=','>=')) { const o = eat('op').v; n = { type: 'bin', op: o, l: n, r: parseAdd() }; } return n; }
  function parseAdd() { let n = parseMul(); while (opIs('+','-')) { const o = eat('op').v; n = { type: 'bin', op: o, l: n, r: parseMul() }; } return n; }
  function parseMul() { let n = parseUn();  while (opIs('*','/','%')) { const o = eat('op').v; n = { type: 'bin', op: o, l: n, r: parseUn() }; } return n; }
  function parseUn() {
    if (opIs('-','!')) { const o = eat('op').v; return { type: 'unary', op: o, x: parseUn() }; }
    return parseCall();
  }
  function parseCall() {
    let n = parseAtom();
    while (peek()) {
      if (opIs('.')) { eat('op','.'); const id = eat('ident').v; n = { type: 'prop', obj: n, key: id }; }
      else if (opIs('(')) {
        if (n.type !== 'ident') throw new Error('Only functions can be called');
        eat('op','(');
        const args = [];
        if (!opIs(')')) {
          args.push(parseExpr());
          while (opIs(',')) { eat('op',','); args.push(parseExpr()); }
        }
        eat('op',')');
        n = { type: 'call', name: n.name, args };
      } else break;
    }
    return n;
  }
  function parseAtom() {
    const tk = peek();
    if (!tk) throw new Error('Unexpected end of expression');
    if (tk.t === 'num') { p++; return { type: 'num', v: tk.v }; }
    if (tk.t === 'str') { p++; return { type: 'str', v: tk.v }; }
    if (tk.t === 'ident') { p++; return { type: 'ident', name: tk.v }; }
    if (tk.t === 'op' && tk.v === '(') { p++; const e = parseExpr(); eat('op',')'); return e; }
    throw new Error(`Unexpected token ${JSON.stringify(tk)}`);
  }
  const ast = parseExpr();
  if (p !== toks.length) throw new Error(`Unexpected trailing tokens at position ${p}`);
  return ast;
}

// -- builtins -----------------------------------------------------------
const builtins = {
  max:     (...a) => Math.max(...a.map(Number)),
  min:     (...a) => Math.min(...a.map(Number)),
  if:      (c, a, b) => (c ? a : b),
  len:     (s) => (s == null ? 0 : String(s).length),
  upper:   (s) => String(s ?? '').toUpperCase(),
  lower:   (s) => String(s ?? '').toLowerCase(),
  concat:  (...a) => a.map((x) => (x == null ? '' : String(x))).join(''),
  round:   (n, d = 0) => { const f = 10 ** d; return Math.round(Number(n) * f) / f; },
  sum:     (...a) => a.reduce((s, x) => s + Number(x || 0), 0),
  default: (x, fallback) => (x === undefined || x === null || x === '' || Number.isNaN(x) ? fallback : x),
  contains:(s, sub) => String(s ?? '').includes(String(sub ?? '')),
};

// -- interpreter --------------------------------------------------------
function evalAst(ast, row) {
  switch (ast.type) {
    case 'num': case 'str': return ast.v;
    case 'ident':
      if (ast.name in row) return row[ast.name];
      if (ast.name === 'extras') return row.extras || {};
      return undefined;
    case 'prop': {
      const obj = evalAst(ast.obj, row);
      if (obj == null) return undefined;
      return obj[ast.key];
    }
    case 'unary': {
      const x = evalAst(ast.x, row);
      return ast.op === '-' ? -Number(x) : !x;
    }
    case 'bin': {
      const l = evalAst(ast.l, row); const r = evalAst(ast.r, row);
      switch (ast.op) {
        case '+':  return (typeof l === 'string' || typeof r === 'string') ? String(l ?? '') + String(r ?? '') : Number(l) + Number(r);
        case '-':  return Number(l) - Number(r);
        case '*':  return Number(l) * Number(r);
        case '/':  return Number(l) / Number(r);
        case '%':  return Number(l) % Number(r);
        case '==': return l == r; // eslint-disable-line eqeqeq
        case '!=': return l != r; // eslint-disable-line eqeqeq
        case '<':  return l < r;
        case '>':  return l > r;
        case '<=': return l <= r;
        case '>=': return l >= r;
        case '&&': return l && r;
        case '||': return l || r;
        default: throw new Error(`Unknown operator ${ast.op}`);
      }
    }
    case 'tern': return evalAst(ast.cond, row) ? evalAst(ast.a, row) : evalAst(ast.b, row);
    case 'call': {
      const fn = builtins[ast.name];
      if (!fn) throw new Error(`Unknown function '${ast.name}'`);
      return fn(...ast.args.map((a) => evalAst(a, row)));
    }
    default: throw new Error(`Bad AST node ${ast.type}`);
  }
}

// -- public api ---------------------------------------------------------
export function compileExpr(src) {
  const ast = parse(src);
  return (row) => evalAst(ast, row);
}

export function safeEval(src, row) {
  try { return { ok: true, value: compileExpr(src)(row) }; }
  catch (e) { return { ok: false, error: e.message }; }
}

export const DSL_BUILTINS = Object.keys(builtins);
