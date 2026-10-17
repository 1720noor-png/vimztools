export type TokType = 'kw' | 'str' | 'num' | 'cmt' | 'punct' | 'plain'

export interface Tok {
  text: string
  type: TokType
}

const SQL_KEYWORDS = new Set([
  'select',
  'from',
  'where',
  'join',
  'inner',
  'left',
  'right',
  'full',
  'outer',
  'cross',
  'natural',
  'on',
  'as',
  'group',
  'by',
  'order',
  'having',
  'limit',
  'offset',
  'insert',
  'into',
  'values',
  'update',
  'set',
  'delete',
  'create',
  'table',
  'alter',
  'add',
  'drop',
  'index',
  'primary',
  'key',
  'foreign',
  'references',
  'and',
  'or',
  'not',
  'null',
  'is',
  'in',
  'like',
  'between',
  'distinct',
  'count',
  'sum',
  'avg',
  'min',
  'max',
  'union',
  'all',
  'case',
  'when',
  'then',
  'else',
  'end',
  'asc',
  'desc',
  'exists',
  'with',
  'over',
  'partition',
  'first',
  'last',
  'following',
  'preceding',
  'rows',
  'range',
])

const JS_KEYWORDS = new Set([
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'new',
  'import',
  'from',
  'export',
  'default',
  'class',
  'extends',
  'async',
  'await',
  'try',
  'catch',
  'finally',
  'throw',
  'switch',
  'case',
  'break',
  'continue',
  'typeof',
  'instanceof',
  'in',
  'of',
  'null',
  'undefined',
  'true',
  'false',
  'this',
  'static',
  'get',
  'set',
  'yield',
  'void',
  'delete',
  'interface',
  'type',
  'number',
  'string',
  'boolean',
])

const JSON_RE =
  /("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\b(?:true|false|null)\b)|([{}[\]:,])/g

const SQL_RE =
  /(--[^\n]*)|('(?:[^'\n]|'')*')|(`[^`\n]*`)|\b([A-Za-z_]\w*)\b|(-?\d+(?:\.\d+)?)|([(),;.*=<>!+-])/g

const JS_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(\w+)\b|(-?\d+(?:\.\d+)?)|([{}()[\].,;:=<>!?+\-*/%&|^~])/g

function scan(
  code: string,
  re: RegExp,
  classify: (m: RegExpExecArray) => TokType | null,
): Tok[] {
  const toks: Tok[] = []
  let last = 0
  re.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(code)) !== null) {
    if (m.index > last) toks.push({ text: code.slice(last, m.index), type: 'plain' })
    if (m[0].length === 0) {
      re.lastIndex += 1
      continue
    }
    const type = classify(m)
    toks.push({ text: m[0], type: type ?? 'plain' })
    last = m.index + m[0].length
  }
  if (last < code.length) toks.push({ text: code.slice(last), type: 'plain' })
  return toks
}

export function tokenize(code: string, lang: string): Tok[] {
  if (!code) return []

  if (lang === 'json') {
    return scan(code, JSON_RE, (m) =>
      m[1] ? 'str' : m[2] ? 'num' : m[3] ? 'kw' : m[4] ? 'punct' : null,
    )
  }

  if (lang === 'sql') {
    return scan(code, SQL_RE, (m) => {
      if (m[1]) return 'cmt'
      if (m[2] || m[3]) return 'str'
      if (m[4]) return SQL_KEYWORDS.has(m[4].toLowerCase()) ? 'kw' : 'plain'
      if (m[5]) return 'num'
      if (m[6]) return 'punct'
      return null
    })
  }

  if (lang === 'js') {
    return scan(code, JS_RE, (m) => {
      if (m[1]) return 'cmt'
      if (m[2]) return 'str'
      if (m[3]) return JS_KEYWORDS.has(m[3]) ? 'kw' : 'plain'
      if (m[4]) return 'num'
      if (m[5]) return 'punct'
      return null
    })
  }

  return [{ text: code, type: 'plain' }]
}