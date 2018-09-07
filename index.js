const _ = require('lodash')

const defaultFunctions = {
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

function throwError (message, at, expr, refs) {
  const start = 'in expression "'
  const pointer = '^'
  const err = new Error(`${message}\n${start}${expr}"\n${pointer.padStart(start.length + pointer.length + at)}`)
  err.context = refs
  throw err
}

function runExpression (expression, refs, funcs = defaultFunctions) {
  if (!expression) {
    throwError('invalid expression', 0, String(expression), refs)
  }
  const expr = `identity(${expression.replace(/\\/g, '\\\\')})`
  const st = []
  let id = ''
  let isStr = null
  for (let i = 0; i < expr.length; ++i) {
    const c = expr[i]
    if (!isStr && c === '(') {
      const obj = st[st.length - 1]
      obj.id = id
      id = ''
    } else if (!isStr && c === '[') {
      const add = { start: i, args: [] }
      const obj = st[st.length - 1]
      if (!obj.args) {
        obj.args = [add]
      } else {
        obj.args.push(add)
      }
      st.push(add)
    } else if (!isStr && (c === ',' || c === ')' || c === ']')) {
      if (id !== '') {
        const popped = st.pop()
        try {
          const value = JSON.parse(id)
          popped.value = value
        } catch (err) {
          if (id === 'undefined') {
            popped.value = undefined
          } else {
            if (!_.has(refs, id)) {
              popped.value = undefined
            } else {
              popped.value = _.get(refs, id)
            }
          }
        }
        id = ''
      }
      if (c === ')') {
        const popped = st.pop()
        const func = _.get(funcs, popped.id)
        try {
          popped.value = func(...popped.args.map(x => x.value))
        } catch (err) {
          throwError(err, popped.start, expr, refs)
        }
        if (st.length === 0) {
          return popped.value
        }
      } else if (c === ']') {
        const popped = st.pop()
        popped.value = popped.args.map(x => x.value)
        if (st.length === 0) {
          return popped.value
        }
      }
    } else if (!/\s/.test(c) || isStr) {
      if (id === '') {
        const add = { start: i }
        if (st.length > 0) {
          const obj = st[st.length - 1]
          if (!obj.args) {
            obj.args = [add]
          } else {
            obj.args.push(add)
          }
        }
        st.push(add)
      }
      if (isStr) {
        if (c === isStr) {
          isStr = null
        }
      } else {
        if (c === '"' || c === "'") {
          isStr = c
        }
      }
      id += c
    }
  }
  throw new Error(`invalid expression "${expression}"`)
}

function runProgram (routine, refs, funcs, result, path = []) {
  if (Array.isArray(routine)) {
    return routine.reduce((o, v, k) => {
      return runProgram(v, { ...refs, ...o }, funcs, o, path.concat(k))
    }, result ? _.set(result, path, []) : [])
  } else if (typeof routine === 'object' && routine !== null) {
    return Object.entries(routine).reduce((o, [k, v]) => {
      return runProgram(v, { ...refs, ...o }, funcs, o, path.concat(k))
    }, result ? _.set(result, path, {}) : {})
  } else if (typeof routine === 'string') {
    return _.set(result, path, runExpression(routine, refs, funcs))
  } else { // not a routine, just a value
    return _.set(result, path, routine)
  }
}

module.exports = {
  defaultFunctions,
  runExpression,
  runProgram
}