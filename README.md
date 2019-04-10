# jsonscript
Run sandboxed code specified as javascript objects.

## 🔮 Usage

Exports three properties;

### runExpression (expression, references, functions)

```js
runExpression('add(a, 2)', { a: 3 }) // 5

runExpression(
  'foo(add(a, 2))',
  { a: 3 },
  {
    ...defaultFunctions,
    foo: x => x * 2
  }
) // 10
```

### runProgram (program, references, functions)

```js
runProgram({
  foo: 'number(at(a, 1))',
  bar: {
    wut: ['cond(gt(foo, 1), 'YUP', 'NAH')']
  }
}, { a: '712' }) // { foo: 1, bar: { wut: ['NAH'] } }
```

### defaultFunctions

```js
{
  add: (...args) => args.reduce((a, b) => a + b, 0),
  and: (...args) => args.reduce((a, b) => a && b, true),
  at: (x, i) => x[i],
  boolean: (x) => Boolean(x),
  ceil: (num) => Math.ceil(num),
  concat: (...args) => args.reduce((a, b) => a.concat(b), []),
  cond: (c, t, f) => c ? t : f,
  date: (x) => new Date(x),
  div: (a, b) => a / b,
  eq: (a, b) => a === b,
  floor: (num) => Math.floor(num),
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  identity: (x) => x,
  isArray: (x) => _.isArray(x),
  isFinite: (num) => Number.isFinite(num),
  isNumber: (x) => _.isNumber(x),
  isString: (x) => _.isString(x),
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  match: (str, regex) => str.match(regex),
  mul: (...args) => args.reduce((a, b) => a * b, 1),
  neq: (a, b) => a !== b,
  number: (x) => Number(x),
  or: (...args) => args.reduce((a, b) => a || b, false),
  regex: (pattern, flags) => new RegExp(pattern, flags),
  replace: (str, find, replace) => str.replace(find, replace),
  slice: (iterable, start, end) => iterable.slice(start, end),
  sub: (a, b) => a - b,
  trim: (str) => str.trim(),
  toISOString: (date) => date.toISOString(),
  toLowerCase: (str) => str.toLowerCase(),
  toUpperCase: (str) => str.toUpperCase(),
  valueOf: (date) => date.valueOf()
}
```
