import { n, sel, txt, ck, res, T, asNum, asSel, asStr, asBoolList, clamp, num, ratio } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Coding & Developer Tools'

function linesOf(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim().length > 0)
}

function tokensOf(code: string): string[] {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/(['"])(?:\\.|(?!\1)[^\\])*\1/g, '""')
    .split(/[^A-Za-z0-9_$]+/)
    .filter(Boolean)
}

function cyclic(v: number, m: number): number {
  return ((v % m) + m) % m
}

const C_KEYWORDS = ['auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long', 'register', 'restrict', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while']
const PY_KEYWORDS = ['and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']
const JS_KEYWORDS = ['async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'of', 'return', 'static', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'yield']
const JAVA_KEYWORDS = ['abstract', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'try', 'void', 'while']

const LANG_META: Record<string, { ext: string; kw: string[]; col: number }> = {
  'C': { ext: '.c / .h', kw: C_KEYWORDS, col: 80 },
  'C++': { ext: '.cpp / .hpp', kw: [...C_KEYWORDS, 'class', 'namespace', 'template', 'public', 'private', 'virtual', 'override', 'using'], col: 100 },
  'Python': { ext: '.py', kw: PY_KEYWORDS, col: 88 },
  'JavaScript': { ext: '.js / .mjs', kw: JS_KEYWORDS, col: 100 },
  'TypeScript': { ext: '.ts', kw: [...JS_KEYWORDS, 'interface', 'type', 'enum', 'implements', 'readonly', 'private', 'public'], col: 100 },
  'Java': { ext: '.java', kw: JAVA_KEYWORDS, col: 100 },
}

function analyse(code: string, lang: string) {
  const meta = LANG_META[lang] || LANG_META.Python
  const raw = linesOf(code)
  const commentLines = raw.filter((l) => /^\s*(\/\/|#|\/\*|\*)/.test(l)).length
  const blank = raw.filter((l) => !l.trim()).length
  const long = raw.filter((l) => l.length > meta.col)
  const tabs = raw.filter((l) => l.includes('\t')).length
  const trailing = raw.filter((l) => /\s+$/.test(l)).length
  const todo = raw.filter((l) => /TODO|FIXME|HACK|XXX/.test(l))
  const toks = tokensOf(code)
  const kw = new Set(meta.kw)
  const kwCount = toks.filter((t) => kw.has(t)).length
  const idents = toks.filter((t) => /^[A-Za-z_$]/.test(t) && !kw.has(t))
  const uniqueIdents = new Set(idents)
  const fns = code.match(/(function\s+\w+|(?:def|fn|func)\s+\w+|\w+\s*\([^)]*\)\s*\{)/g) || []
  const maxLen = raw.reduce((m, l) => Math.max(m, l.length), 0)
  const indentOk = !tabs
  return { raw, commentLines, blank, long, tabs, trailing, todo, toks, kwCount, uniqueIdents, fns, maxLen, indentOk, codeLines: raw.length, col: meta.col, ext: meta.ext }
}

export const mod14: StudentSpec[] = [
  {
    id: 'code-complexity-analyzer-coding',
    name: 'Code Complexity Analyzer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Estimates cyclomatic and cognitive complexity of pasted code from branch, loop and nesting structure.',
    tip: 'Cyclomatic complexity above 10 in one function means nobody can test it. Split it before you add the next feature.',
    usage: ['Paste your function or class.', 'Choose the language.', 'Read the complexity and the hot spots.'],
    method: ['Branches and loops are counted by pattern.', 'Nesting depth adds to cognitive load.', 'The worst functions are ranked.'],
    fields: [
      sel('lang', 'Language', ['C', 'C++', 'Python', 'JavaScript', 'TypeScript', 'Java'], 'Python'),
      txt('code', 'Paste your code', 12, 'def process(rows):\n    total = 0\n    for r in rows:\n        if r.active:\n            if r.score > 100:\n                total += 1\n            elif r.score > 50:\n                total += 2\n        else:\n            total -= 1\n    return total'),
    ],
    compute: (v) => {
      const code = asStr(v.code)
      if (code.length < 20) return [sres('Complexity', 'Paste some code first', T.warn)]
      const a = analyse(code, asSel(v.lang))
      const branches = (code.match(/\b(if|elif|else\s+if|for|while|case|catch|except|&&|\|\||\?)\b|\?\./g) || []).length
      const cyclo = branches + 1
      const indentDepth = a.raw.reduce((m, l) => Math.max(m, (l.match(/^(\s+)/)?.[1] || '').replace(/\t/g, '  ').length / 2), 0)
      const cognitive = Math.round(cyclo + indentDepth * 1.5)
      const risk = cyclo > 20 ? T.bad : cyclo > 10 ? T.warn : T.good
      return [
        sres('Cyclomatic complexity', num(cyclo, 0), risk, `${num(branches, 0)} decision points + 1`, clamp(100 - cyclo * 3.5, 4, 100)),
        sres('Cognitive load estimate', num(cognitive, 0), cognitive > 25 ? T.warn : T.good, `max nesting depth ${num(indentDepth, 0)}`, clamp(100 - cognitive * 2.5, 4, 100)),
        sres('Code size', `${num(a.codeLines, 0)} lines`, a.codeLines > 80 ? T.warn : T.good, `${num(a.toks.length, 0)} tokens, ${num(a.uniqueIdents.size, 0)} distinct identifiers`),
        res('Verdict', cyclo > 20 ? 'far too complex — extract functions until each is under 10' : cyclo > 10 ? 'above the testing threshold — simplify the nesting' : 'reasonable complexity — leave it alone', risk),
        res('Hot spot', a.fns.length ? `longest function-ish block: ${num(a.maxLen, 0)} character line` : 'no function definitions detected — is this a complete file?', a.maxLen > a.col ? T.warn : T.neutral),
        res('How it is measured', '1 + count of if/for/while/case/catch/&&/||/? — McCabe, the industry default', T.neutral),
      ]
    },
  },
  {
    id: 'regex-tester-coding',
    name: 'Regex Tester & Explainer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Tests a regular expression against sample text and explains each token group by group.',
    tip: 'Anchor your patterns with ^ and $. An unanchored match will silently accept "not a valid email" the first time you test it.',
    usage: ['Enter a pattern.', 'Paste sample text.', 'Read the match breakdown.'],
    method: ['The pattern is compiled and matched.', 'Captured groups are listed.', 'Each token is translated to plain English.'],
    fields: [
      txt('pattern', 'Regular expression', 2, '^(\\w+)@([\\w-]+)\\.([a-z]{2,})$'),
      txt('text', 'Sample text (one candidate per line)', 6, 'ada.lovelace@analytical.edu\ngrace+tag@navy.mil\nbad@@nope\nalan.turing@bletchley.uk'),
    ],
    compute: (v) => {
      const p = asStr(v.pattern)
      const text = asStr(v.text)
      if (!p) return [sres('Regex', 'Enter a pattern', T.warn)]
      let re: RegExp
      try {
        re = new RegExp(p, 'g')
      } catch (e) {
        return [sres('Regex error', e instanceof Error ? e.message.slice(0, 120) : 'invalid pattern', T.bad, 'check unbalanced brackets or a bad quantifier')]
      }
      const candidates = linesOf(text)
      const rows = candidates.map((c) => {
        re.lastIndex = 0
        const m = re.exec(c)
        return { c, m, full: m ? m[0] : '', groups: m ? m.slice(1) : [] }
      })
      const hit = rows.filter((r) => r.m)
      const sample = hit[0]
      const explain: string[] = []
      if (p.startsWith('^')) explain.push('^ — match must start at the beginning of the line')
      if (p.endsWith('$')) explain.push('$ — match must end at the end of the line')
      const anchors = (p.match(/[()[\]{}+*?|^$\\]/g) || []).filter((c) => '()[]{}+*?'.includes(c)).length
      if (anchors > 12) explain.push(`${num(anchors, 0)} metacharacters — this pattern is hard to review; break it into named parts`)
      if (/(\w+)@/.test(p)) explain.push('@ — literal at sign, needed for email patterns')
      if (p.includes('[\\w-]')) explain.push('[\\w-] — one word character or hyphen (character class)')
      if (/\{\d+/.test(p)) explain.push('{n,m} — repeat between n and m times (bounded quantifier)')
      if (/[+*]/.test(p)) explain.push('+ or * — unbounded repetition; anchor and bound it to avoid catastrophic backtracking')
      if (/\(\?:/.test(p)) explain.push('(?:...) — non-capturing group, groups without capturing')
      if (/\(\?<[^=]/.test(p)) explain.push('(?<name>...) — named capture group, readable in code')
      if (!explain.length) explain.push('no special constructs detected — this is a plain literal match')
      return [
        sres('Matches', `${num(hit.length, 0)}/${num(candidates.length, 0)}`, hit.length === candidates.length ? T.good : hit.length ? T.warn : T.bad, hit.length === candidates.length ? 'every line matches' : `${num(candidates.length - hit.length, 0)} line(s) do not match`, (hit.length / Math.max(1, candidates.length)) * 100),
        sres('Pattern', p, T.neutral, `length ${num(p.length, 0)}`),
        sample ? docr('First match', [`Line: ${sample.c}`, `Matched: ${sample.full}`, sample.groups.length ? `Groups:\n${sample.groups.map((g, i) => `  $${i + 1}: ${g === '' ? '(empty)' : g}`).join('\n')}` : 'No capture groups defined — wrap parts in ( ) to extract them.'].join('\n')) : docr('First match', 'no line matched — check for anchors, missing wildcards or case sensitivity'),
        docr('Pattern explained', explain.map((e) => `• ${e}`).join('\n')),
        res('Rejection test', hit.length && hit.length < candidates.length ? `did not match: ${rows.filter((r) => !r.m).map((r) => r.c).join(', ')}` : 'all lines accepted — add known-bad inputs to test the edges', hit.length === candidates.length ? T.warn : T.neutral),
        res('Performance warning', /\([^)]*[+*][^)]*\)[+*]/.test(p) ? 'nested quantifiers detected — this can backtrack exponentially on long non-matching input' : 'no nested quantifier risk detected', /\([^)]*[+*][^)]*\)[+*]/.test(p) ? T.bad : T.good),
      ]
    },
  },
  {
    id: 'json-formatter-coding',
    name: 'JSON Formatter & Validator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Validates, minifies and pretty-prints JSON, then reports exactly where the syntax breaks.',
    tip: 'Most "invalid JSON" bugs are a trailing comma or single quotes. Both look fine in JavaScript objects and both are illegal in JSON.',
    usage: ['Paste your JSON.', 'Read the validation result.', 'Copy the formatted output.'],
    method: ['JSON.parse validates structure.', 'The error position maps to your input.', 'Formatted and minified variants are produced.'],
    fields: [txt('json', 'JSON input', 10, '{"student":{"name":"Ada Lovelace","grades":[92,88,95],"active":true},"course":"CS201"}'), sel('indent', 'Indent', ['2 spaces', '4 spaces', 'Tab'], '2 spaces')],
    compute: (v) => {
      const raw = asStr(v.json)
      if (!raw.trim()) return [sres('JSON', 'Paste some JSON first', T.warn)]
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'parse error'
        const posMatch = msg.match(/position (\d+)/)
        const pos = posMatch ? parseInt(posMatch[1], 10) : -1
        const snippet = pos >= 0 ? raw.slice(Math.max(0, pos - 30), pos + 30) : raw.slice(0, 60)
        return [
          sres('Valid JSON', 'No', T.bad, msg.slice(0, 90)),
          sres('Input size', `${num(raw.length, 0)} characters`, T.neutral, `${num(raw.split('\n').length, 0)} lines`),
          docr('Near the error', pos >= 0 ? `position ${pos}:\n…${snippet}…` : snippet),
          res('Common causes', 'trailing comma before } or ] · single quotes instead of double · unquoted keys · comments inside JSON', T.warn),
        ]
      }
      const pretty = JSON.stringify(parsed, null, asSel(v.indent) === 'Tab' ? '\t' : asSel(v.indent) === '4 spaces' ? 4 : 2)
      const min = JSON.stringify(parsed)
      const depth = (() => {
        let d = 0
        for (const c of raw) {
          if (c === '{' || c === '[') d++
          if (c === '}' || c === ']') d--
        }
        return d
      })()
      const keyCount = (raw.match(/"[^"]+"\s*:/g) || []).length
      const arrCount = (raw.match(/\[/g) || []).length
      return [
        sres('Valid JSON', 'Yes', T.good, `parsed in ${num(raw.length, 0)} characters`, 100),
        sres('Structure', `${num(keyCount, 0)} keys, ${num(arrCount, 0)} arrays`, T.neutral, `max nesting depth ${num(depth, 0)}`),
        sres('Size saved by minifying', `${num(Math.max(0, raw.length - min.length), 0)} characters`, raw.length > min.length * 1.3 ? T.neutral : T.warn, `${ratio((min.length / Math.max(1, raw.length)) * 100, 0)}% of the original`, (min.length / Math.max(1, raw.length)) * 100),
        docr('Formatted', pretty),
        docr('Minified', min),
        res('Top-level type', Array.isArray(parsed) ? 'array — access items by index' : typeof parsed === 'object' && parsed ? 'object — access by key' : typeof parsed, T.neutral),
      ]
    },
  },
  {
    id: 'base64-encoder-decoder-coding',
    name: 'Base64 Encoder & Decoder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Encodes text to Base64 and decodes Base64 back, with URL-safe output and padding checks.',
    tip: 'Base64 is not encryption. Anyone can decode it in one line — never put a password or an API secret through it.',
    usage: ['Type your text or paste Base64.', 'Choose the variant.', 'Read the encoded or decoded output.'],
    method: ['Text is encoded to 6-bit groups.', 'URL-safe output swaps + and / and drops padding.', 'Invalid input is reported.'],
    fields: [txt('input', 'Text or Base64', 6, 'Hello, vimz!'), sel('mode', 'Mode', ['Encode to Base64', 'Decode from Base64'], 'Encode to Base64'), sel('variant', 'Variant', ['Standard (+ / with = padding)', 'URL-safe (- _ no padding)'], 'Standard (+ / with = padding)')],
    compute: (v) => {
      const input = asStr(v.input)
      if (!input) return [sres('Base64', 'Enter some text first', T.warn)]
      const urlSafe = asSel(v.variant).startsWith('URL')
      try {
        if (asSel(v.mode).startsWith('Encode')) {
          const b64 = btoa(unescape(encodeURIComponent(input)))
          const out = urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64
          return [
            sres('Encoded', out, T.good, `${num(input.length, 0)} characters → ${num(out.length, 0)} Base64 characters`, (out.length / Math.max(1, input.length)) * 33),
            sres('Expansion', `${ratio((out.length / Math.max(1, input.length)) * 100, 0)}%`, T.neutral, 'Base64 always adds a third — it works in 6-bit chunks'),
            docr('Output', out),
            res('Not encryption', 'Base64 is an encoding, not security. Anyone can reverse it instantly.', T.warn),
            res('Uses', 'data URLs, email attachments, JWT payloads, embedding binary in text protocols', T.neutral),
          ]
        }
        const cleaned = urlSafe ? input.replace(/-/g, '+').replace(/_/g, '/') : input
        const pad = cleaned.length % 4 ? '='.repeat(4 - (cleaned.length % 4)) : ''
        const decoded = decodeURIComponent(escape(atob(cleaned + pad)))
        return [
          sres('Decoded', decoded, T.good, `${num(input.length, 0)} Base64 → ${num(decoded.length, 0)} characters`),
          docr('Output', decoded),
          res('Padding', pad ? `added ${num(pad.length, 0)} "=" character(s) to reach a multiple of 4` : 'padding was already correct', T.neutral),
          res('Round trip', 're-encode this output and you should get the exact input back — if not, characters were lost', T.neutral),
        ]
      } catch {
        return [sres('Decode failed', 'not valid Base64', T.bad, 'only A–Z, a–z, 0–9, +, / and = are allowed')]
      }
    },
  },
  {
    id: 'sql-query-builder-coding',
    name: 'SQL Query Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a SELECT query from your table, joins, filters, grouping and ordering, with an index warning.',
    tip: 'SELECT * in production is a future migration. List the columns — it is faster today and it is honest about what the code needs.',
    usage: ['Describe your table and joins.', 'Add filters and ordering.', 'Read the generated SQL.'],
    method: ['Fields compose a normalised SELECT list.', 'Joins are assembled in order.', 'A missing-where warning is emitted.'],
    fields: [
      sel('stmt', 'Statement type', ['SELECT', 'SELECT with JOIN', 'SELECT with GROUP BY', 'SELECT with subquery'], 'SELECT'),
      txt('table', 'Main table (and alias)', 2, 'students s'),
      txt('cols', 'Columns (one per line: expression | alias)', 4, 's.name | student_name\ns.email | email\nCOUNT(s.id) | total_students'),
      txt('joins', 'Joins (one per line: type | table | condition)', 3, 'INNER JOIN | enrollments e ON e.student_id = s.id\nLEFT JOIN | grades g ON g.enrollment_id = e.id'),
      txt('where', 'WHERE conditions (one per line)', 3, 's.status = \'active\'\ng.grade >= 50'),
      txt('group', 'GROUP BY columns (comma separated)', 1, 's.name'),
      sel('order', 'ORDER BY', ['None', 'ASC', 'DESC'], 'ASC'),
    ],
    compute: (v) => {
      const table = asStr(v.table).trim() || 'my_table t'
      const cols = linesOf(asStr(v.cols))
      if (!cols.length) return [sres('Query', 'Add at least one column', T.warn)]
      const selList = cols.map((c) => {
        const [expr, alias] = c.split('|').map((x) => x.trim())
        return alias && alias !== expr ? `${expr} AS ${alias}` : expr
      })
      const joins = linesOf(asStr(v.joins)).map((j) => {
        const p = j.split('|').map((x) => x.trim())
        return `${p[0] || 'INNER JOIN'} ${p[1] || 'other o'}${p[2] ? ` ON ${p[2]}` : ''}`
      })
      const where = linesOf(asStr(v.where))
      const group = asStr(v.group).trim()
      const order = asSel(v.order)
      const useJoin = asSel(v.stmt).includes('JOIN')
      const useGroup = asSel(v.stmt).includes('GROUP BY')
      const q = [
        `SELECT`,
        `  ${selList.join(',\n  ')}`,
        `FROM ${table}`,
        ...(useJoin && joins.length ? joins.map((x) => `  ${x}`) : []),
        ...(where.length ? [`WHERE ${where.map((w, i) => (i ? `  AND ${w}` : `  ${w}`)).join('\n')}`] : []),
        ...(useGroup && group ? [`GROUP BY ${group}`] : []),
        ...(order !== 'None' ? [`ORDER BY ${selList[0].split(' AS ')[0].split('(')[0].trim()} ${order}`] : []),
        ';',
      ].join('\n')
      const star = selList.some((c) => c === '*' || c.endsWith('.*'))
      const hasLimit = false
      const issues: string[] = []
      if (star) issues.push('SELECT * returns columns you do not use — list them explicitly')
      if (!where.length) issues.push('no WHERE clause — this reads the whole table')
      if (!hasLimit && selList.length) issues.push('add a LIMIT for interactive queries, or the result set can be enormous')
      if (useGroup && !group) issues.push('aggregate functions are selected but no GROUP BY is given — this will collapse to one arbitrary row')
      if (useJoin && !joins.length) issues.push('JOIN selected but no join conditions were entered')
      return [
        sres('Statement type', asSel(v.stmt), T.neutral, `${num(selList.length, 0)} columns, ${num(joins.length, 0)} joins`),
        docr('Generated SQL', q),
        res('Query review', issues.length ? `${num(issues.length, 0)} issue(s): ${issues.join(' · ')}` : 'no obvious problems', issues.length ? T.warn : T.good),
        res('Order of clauses', 'SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT. SQL will not reorder for you.', T.neutral),
        res('Parameterise', 'never concatenate user input into the WHERE clause — use placeholders ($1, ?) to avoid SQL injection', T.warn),
        res('Explain it', 'run EXPLAIN before shipping: full table scans on large tables are the usual cause of slow pages', T.neutral),
      ]
    },
  },
  {
    id: 'api-request-builder-coding',
    name: 'API Request Designer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Designs an HTTP request with method, headers, auth and body, and generates the matching cURL command.',
    tip: 'Never log a bearer token or an API key while debugging. Redact them in your request log and in screenshots you paste into a chat.',
    usage: ['Choose method, URL and auth.', 'Add headers and a body.', 'Read the cURL command.'],
    method: ['The request line and headers are assembled.', 'The body is formatted per content type.', 'cURL and fetch variants are produced.'],
    fields: [sel('method', 'HTTP method', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 'GET'), txt('url', 'URL', 1, 'https://api.example.com/v1/students'), sel('auth', 'Authentication', ['None', 'Bearer token', 'API key header', 'Basic auth'], 'Bearer token'), txt('token', 'Token / key / user:pass', 1, 'sk_live_xxx'), txt('headers', 'Extra headers (one per line: name | value)', 3, 'Content-Type | application/json\nAccept | application/json'), txt('body', 'Request body (JSON or form)', 5, '{\n  "name": "Ada Lovelace",\n  "year": 2\n}')],
    compute: (v) => {
      const url = asStr(v.url).trim() || 'https://api.example.com/endpoint'
      const method = asSel(v.method)
      const body = asStr(v.body)
      const headers = linesOf(asStr(v.headers)).map((h) => {
        const [k, val] = h.split('|').map((x) => x.trim())
        return { k: k || 'Header', val: val || '' }
      })
      const token = asStr(v.token)
      const auth = asSel(v.auth)
      const authLine = auth === 'Bearer token' && token ? `-H "Authorization: Bearer ${token}"`
        : auth === 'API key header' && token ? `-H "X-API-Key: ${token}"`
        : auth === 'Basic auth' && token ? `-u "${token}"`
        : ''
      const headerFlags = headers.map((h) => `-H "${h.k}: ${h.val}"`).join(' ')
      const curl = ['curl -X ' + method, `  "${url}"`, authLine, headerFlags, body && method !== 'GET' ? `--data '${body.replace(/\n\s*/g, '')}'` : '', "  -H 'Content-Type: application/json'"].filter(Boolean).join(' \\\n')
      const fetchCode = `fetch('${url}', {\n  method: '${method}',\n  headers: { ${[...headers.map((h) => `'${h.k}': '${h.val}'`), auth === 'Bearer token' ? `'Authorization': 'Bearer ${token}'` : ''].filter(Boolean).join(', ')} },\n${body && method !== 'GET' ? `  body: JSON.stringify(${body.replace(/\n\s*/g, ' ')})` : ''}\n})`
      const risks: string[] = []
      if (method === 'GET' && body) risks.push('GET requests should not carry a body — most servers ignore it')
      if (method !== 'GET' && !body) risks.push(`${method} with no body is fine only if the endpoint takes no parameters`)
      if (!/^https:\/\//.test(url)) risks.push('not HTTPS — credentials will be sent in the clear')
      if (!headers.some((h) => h.k.toLowerCase() === 'accept')) risks.push('no Accept header — some APIs return XML or an error page by default')
      if (method === 'POST' && !/^https/.test(url)) risks.push('POST over plain HTTP can expose your token to any network in the path')
      return [
        sres('Request', `${method} ${url.replace(/^https?:\/\/[^/]+/, '')}`, T.good, `auth: ${auth.toLowerCase()}`),
        sres('Estimated payload', `${num(body.length + headers.reduce((s, h) => s + h.k.length + h.val.length, 0), 0)} bytes`, T.neutral, `${num(headers.length, 0)} custom headers`),
        docr('cURL', curl),
        docr('JavaScript fetch', fetchCode),
        res('Review', risks.length ? risks.join(' · ') : 'request looks well-formed', risks.length ? T.warn : T.good),
        res('Debugging', 'log the status code and the response body, never the token — redact before screenshots', T.warn),
        res('Status codes', `201 created · 204 no content · 400 bad request · 401 unauthorised (token) · 403 authorised but blocked · 404 wrong path · 429 rate limited`, T.neutral),
      ]
    },
  },
  {
    id: 'git-command-guide-coding',
    name: 'Git Command Guide',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds the exact git commands for your situation — undo a commit, recover a deleted branch, sync a fork.',
    tip: '`git commit --amend` rewrites history. Never run it on a branch other people have already pulled.',
    usage: ['Choose what you need to do.', 'Set the branch names.', 'Read the commands and the warning.'],
    method: ['Each scenario maps to a command sequence.', 'Destructive steps are flagged.', 'A recovery command is always included.'],
    fields: [sel('task', 'What do you need to do?', ['Undo the last commit but keep changes', 'Undo the last commit and discard changes', 'Change the last commit message', 'Create a branch from an earlier commit', 'Delete a branch', 'Switch branches with uncommitted changes', 'Sync a fork with the upstream repository', 'Recover a deleted branch or commit', 'Resolve a merge conflict', 'Undo a pushed commit'], 'Undo the last commit but keep changes'), txt('branch', 'Branch name', 1, 'feature/login'), txt('commit', 'Commit hash or ref (optional)', 1, '')],
    compute: (v) => {
      const t = asSel(v.task)
      const b = asStr(v.branch).trim() || 'my-branch'
      const c = asStr(v.commit).trim()
      const ref = c || 'HEAD~1'
      const bank: Record<string, { cmds: string[]; warn?: string; note: string }> = {
        'Undo the last commit but keep changes': {
          cmds: [`git reset --soft HEAD~1`, 'git status'],
          note: 'changes stay staged, ready to recommit',
        },
        'Undo the last commit and discard changes': {
          cmds: [`git reset --hard ${ref}`, 'git reflog'],
          warn: 'DESTRUCTIVE — uncommitted and committed work in that commit is gone. Check `git reflog` first; the commit is still recoverable there.',
          note: 'reflog output lists HEAD@{1} — you can `git reset --hard HEAD@{1}` to bring it back',
        },
        'Change the last commit message': {
          cmds: ['git commit --amend -m "corrected message"'],
          warn: 'rewrites the commit — never amend a commit that has been pushed to a shared branch',
          note: 'use --amend --no-edit to keep the same message and only add files',
        },
        'Create a branch from an earlier commit': {
          cmds: [`git switch -c ${b} ${ref}`, `git log --oneline -5`],
          note: 'you can go back to the original branch at any time with git switch -',
        },
        'Delete a branch': {
          cmds: [`git branch -d ${b}`, `git branch -D ${b}  # only if -d refuses`],
          note: '-d refuses to delete unmerged work; -D forces it and can lose commits',
        },
        'Switch branches with uncommitted changes': {
          cmds: ['git stash push -u -m "wip"', `git switch ${b}`, 'git stash pop'],
          warn: '-u includes untracked files; without it, new files are left behind and can conflict',
          note: 'git stash list shows everything saved, git stash drop removes it',
        },
        'Sync a fork with the upstream repository': {
          cmds: ['git remote -v', 'git remote add upstream https://github.com/OWNER/REPO.git', 'git fetch upstream', `git switch main`, 'git merge upstream/main', 'git push origin main'],
          note: 'if git remote add says "remote exists", use git remote set-url upstream <url> instead',
        },
        'Recover a deleted branch or commit': {
          cmds: ['git reflog', `git switch -c recovered ${c || 'HEAD@{5}'}`],
          note: 'reflog records every position HEAD has held for 90 days — this is why you never actually lose work',
        },
        'Resolve a merge conflict': {
          cmds: ['git status', 'git diff', '# edit files, remove <<<<<<< ======= >>>>>>> markers', 'git add <resolved-file>', 'git commit'],
          note: 'git mergetool and VS Code "Accept Current/Incoming" do the mechanical work',
        },
        'Undo a pushed commit': {
          cmds: [`git revert ${ref}`, 'git push'],
          warn: 'use revert, never reset, on shared branches — reset rewrites history for everyone',
          note: 'revert creates a new commit that undoes the old one, so the history stays intact',
        },
      }
      const e = bank[t] || bank['Undo the last commit but keep changes']
      return [
        sres('Task', t, T.neutral, `branch: ${b}${c ? ` · ref: ${c}` : ''}`),
        docr('Commands', e.cmds.join('\n')),
        res('What this does', e.note, T.neutral),
        e.warn ? res('⚠ Warning', e.warn, T.bad) : res('Safe', 'no history rewriting on a shared branch', T.good),
        res('Before anything destructive', 'git status, then git stash or git commit --amend -m "safety net" — a clean working tree is always recoverable', T.warn),
        res('If you break it', 'git reflog shows every previous HEAD position; git reset --hard HEAD@{n} gets you back', T.neutral),
      ]
    },
  },
  {
    id: 'binary-converter-coding',
    name: 'Binary / Hex Converter',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Converts between binary, decimal, hexadecimal and octal with unsigned and two\'s-complement handling.',
    tip: 'Signed vs unsigned is the whole game in low-level work. -1 as 8-bit unsigned is 255, and the hardware will not tell you which you meant.',
    usage: ['Enter a value and its base.', 'Choose the output bases.', 'Read the conversions and the bit layout.'],
    method: ['Input is parsed in the stated base.', 'Signed interpretation uses two\'s complement.', 'All four bases are emitted.'],
    fields: [txt('value', 'Value', 1, '255'), sel('from', 'Input base', ['Binary', 'Decimal', 'Hexadecimal', 'Octal'], 'Decimal'), sel('bits', 'Bit width', ['8 bit', '16 bit', '32 bit', '64 bit'], '8 bit'), n('signed', 'Signed (two\'s complement)?', { def: 1, min: 0, max: 1, step: 1 })],
    compute: (v) => {
      const raw = asStr(v.value).trim()
      if (!raw) return [sres('Converter', 'Enter a value', T.warn)]
      const bits = { '8 bit': 8, '16 bit': 16, '32 bit': 32, '64 bit': 64 }[asSel(v.bits)] || 8
      const signed = asNum(v.signed) === 1
      const prefixMap: Record<string, (s: string) => string> = {
        Binary: (s) => s.replace(/[^01]/g, ''),
        Decimal: (s) => s.replace(/[^0-9-]/g, ''),
        Hexadecimal: (s) => s.replace(/[^0-9a-fA-F-]/g, ''),
        Octal: (s) => s.replace(/[^0-7-]/g, ''),
      }
      const cleaned = prefixMap[asSel(v.from)] ? prefixMap[asSel(v.from)](raw) : raw
      const radix = { Binary: 2, Decimal: 10, Hexadecimal: 16, Octal: 8 }[asSel(v.from)] || 10
      const radixPrefix: Record<number, string> = { 2: '0b', 8: '0o', 10: '', 16: '0x' }
      const neg = /^-/.test(cleaned)
      const digits = cleaned.replace(/^-/, '')
      let n = 0n
      if (digits) {
        try {
          n = BigInt((neg ? '-' : '') + radixPrefix[radix] + digits)
        } catch {
          n = 0n
        }
      }
      const show = (x: bigint) => (x > 9007199254740991n || x < -9007199254740991n ? x.toString() : num(Number(x), 0))
      const maxU = (1n << BigInt(bits)) - 1n
      const minS = -(1n << BigInt(bits - 1))
      const inRange = n >= (signed ? minS : 0n) && n <= (signed ? maxU >> 1n : maxU)
      const masked = n < 0n ? n + (1n << BigInt(bits)) : n
      const bitStr = masked.toString(2).padStart(bits, '0')
      const hex = masked.toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0')
      const oct = masked.toString(8).padStart(Math.ceil(bits / 3), '0')
      const signedVal = masked >= (1n << BigInt(bits - 1)) ? masked - (1n << BigInt(bits)) : masked
      return [
        sres('Parsed value', show(n), inRange ? T.good : T.bad, `${asSel(v.from)} → ${bits}-bit ${signed ? 'signed' : 'unsigned'}`, signed ? clamp((Number(n) / 127) * 100, 2, 100) : clamp((Number(n) / 255) * 100, 2, 100)),
        sres('Binary', bitStr, T.neutral, `${num(bitStr.length, 0)} bits`),
        sres('Hexadecimal', '0x' + hex, T.neutral, `${num(hex.length, 0)} hex digits`),
        sres('Octal', '0o' + oct, T.neutral, `${num(oct.length, 0)} octal digits`),
        sres('Signed reading', show(signedVal), T.neutral, `the same bits read as ${signed ? 'a signed' : 'an unsigned'} ${bits}-bit integer`),
        res('Range check', inRange ? `fits in ${bits} bits (${signed ? `${minS} to ${maxU >> 1n}` : `0 to ${maxU}`})` : `does NOT fit — overflow wraps to ${show(masked & maxU)}`, inRange ? T.good : T.bad),
        docr('Bit layout', `0b${bitStr}\n0x${hex}\n0o${oct}`),
        res('Gotcha', `the same bits can mean ${show(masked)} unsigned or ${show(signedVal)} signed — always be explicit about which your field is`, T.warn),
      ]
    },
  },
  {
    id: 'unit-test-coverage-planner-coding',
    name: 'Unit Test Coverage Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Turns a function signature and its branches into a concrete test plan: cases, edge values and mocks.',
    tip: 'Test the boundaries, not the middle. Everyone tests 5; nobody tests 0, 1, and the value just past the limit.',
    usage: ['Describe the function and its branches.', 'Set the edge values you care about.', 'Read the test matrix.'],
    method: ['Each branch becomes a test case.', 'Boundary values are generated per parameter.', 'Mocks are suggested for external calls.'],
    fields: [txt('fn', 'Function signature', 2, 'calculateDiscount(price: number, qty: number, coupon?: string): number'), txt('branches', 'Branches / conditions (one per line)', 5, 'qty === 0 → throws\nqty > 10 → bulk price\ncoupon === "SAVE10" → 10% off\nprice < 0 → throws'), n('cases', 'Test cases to generate', { def: 8, min: 3, max: 20, step: 1 })],
    compute: (v) => {
      const sig = asStr(v.fn).trim()
      const branches = linesOf(asStr(v.branches))
      if (!sig) return [sres('Test plan', 'Describe the function first', T.warn)]
      const params = (sig.match(/\(([^)]*)\)/)?.[1] || '')
        .split(',')
        .map((p) => p.trim().split(/[:?=]/)[0].replace(/\?$/, ''))
        .filter(Boolean)
      const count = clamp(Math.round(asNum(v.cases)) || 8, 3, 20)
      const edges: Record<string, string[]> = {
        number: ['0', '-1', '1', 'MAX', 'MAX + 1', 'NaN', '0.5', '1e9'],
        string: ['""', 'null', 'undefined', 'whitespace only', 'typical value', 'very long string (>255 chars)', 'unicode / emoji', 'SQL-like quote\' test'],
        boolean: ['true', 'false', 'null'],
      }
      const typeOfParam = (p: string) => {
        if (/name|email|text|label|description|coupon|code|id/i.test(p)) return 'string'
        if (/is|has|flag|enabled|active/i.test(p)) return 'boolean'
        return 'number'
      }
      const rows: string[] = []
      const happy = `happy path — ${params.join(', ')} with typical values → expected normal result`
      rows.push(happy)
      branches.forEach((b, i) => {
        const [cond, outcome] = b.split('→').map((x) => x.trim())
        rows.push(`branch ${i + 1} — ${cond}${outcome ? ` → expects ${outcome}` : ''}`)
      })
      let idx = 0
      params.forEach((p) => {
        ;(edges[typeOfParam(p)] || edges.number).slice(0, 4).forEach((e) => {
          if (idx++ >= count) return
          rows.push(`${p} = ${e} — covers boundary for this parameter`)
        })
      })
      while (rows.length < count) rows.push(`case ${rows.length + 1} — repeat with a combination of boundaries across parameters (two boundary conditions at once)`)
      const finalRows = rows.slice(0, count)
      const hasThrows = branches.some((b) => /throw|error|fail/i.test(b))
      return [
        sres('Test cases', num(finalRows.length, 0), T.good, `${num(branches.length, 0)} branches, ${num(params.length, 0)} parameters`),
        docr('Test matrix', finalRows.map((r, i) => `${i + 1}. ${r}`).join('\n')),
        res('Coverage gaps to check', `${hasThrows ? 'error paths present — ' : ''}concurrent calls, large inputs, and one realistic end-to-end value`, hasThrows ? T.neutral : T.warn),
        res('Mocks needed', /\b(fetch|axios|request|db|query|api|http)\b/i.test(sig) ? 'this function calls out — stub the network or database so the test is fast and deterministic' : 'no external calls visible — pure function, no mocks required', /\b(fetch|axios|request|db|query|api|http)\b/i.test(sig) ? T.warn : T.good),
        res('Assertion style', 'assert on the return value AND the side effect — a test that only checks "no throw" catches almost nothing', T.neutral),
        res('Rule', 'one behaviour per test: if the name needs "and", split it into two tests', T.neutral),
      ]
    },
  },
  {
    id: 'algorithm-complexity-explainer-coding',
    name: 'Algorithm Complexity Explainer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Compares algorithms and data structures by Big-O, with operation counts for your actual input size.',
    tip: 'Big-O is about growth, not speed. Two O(n) algorithms can differ by 100× at n = 1,000 — but only the one that stays flat past n = 10 million will save you.',
    usage: ['Choose the algorithms.', 'Set the input size.', 'Read the growth comparison.'],
    method: ['Each algorithm has a measured cost function.', 'Costs are evaluated at your n.', 'Growth ratios show where the crossover is.'],
    fields: [sel('algos', 'Algorithms', ['Bubble sort vs Insertion sort vs Merge sort', 'Linear vs Binary search', 'Array vs Set vs Map lookup', 'BFS vs DFS', 'Array shift() vs concat', 'Object vs Map properties', 'Merge sort vs Quick sort'], 'Linear vs Binary search'), n('size', 'Input size n', { def: 1000, min: 4, max: 100000000, step: 1 }), n('extra', 'Extra memory allowed (units)', { def: 0, min: 0, step: 1 })],
    compute: (v) => {
      const key = asSel(v.algos)
      const n = Math.max(2, Math.round(asNum(v.size)))
      const rows = ((): { name: string; o: string; cost: number; note: string }[] => {
        switch (key) {
          case 'Bubble sort vs Insertion sort vs Merge sort':
            return [
              { name: 'Bubble sort', o: 'O(n²)', cost: n * n, note: 'swaps on every comparison — worst possible for memory access' },
              { name: 'Insertion sort', o: 'O(n²)', cost: (n * n) / 4, note: 'fast on nearly-sorted data; beats merge sort under ~32 elements' },
              { name: 'Merge sort', o: 'O(n log n)', cost: n * Math.log2(n), note: 'always n log n, needs O(n) extra space, stable' },
            ]
          case 'Linear vs Binary search':
            return [
              { name: 'Linear search', o: 'O(n)', cost: n / 2, note: 'no preparation, works on unsorted lists and linked structures' },
              { name: 'Binary search', o: 'O(log n)', cost: Math.log2(n), note: 'requires sorted data — sorting first costs O(n log n)' },
            ]
          case 'Array vs Set vs Map lookup':
            return [
              { name: 'Array includes()', o: 'O(n)', cost: n / 2, note: 'fine for tens of items, quadratic in a loop' },
              { name: 'Set.has()', o: 'O(1)', cost: 1, note: 'hash lookup, O(n) to build, memory cost per element' },
              { name: 'Map.get()', o: 'O(1)', cost: 1, note: 'key-value, insertion order preserved, better than objects for dynamic keys' },
            ]
          case 'BFS vs DFS':
            return [
              { name: 'BFS (queue)', o: 'O(V + E)', cost: n * 2, note: 'finds the shortest path in an unweighted graph; needs a queue' },
              { name: 'DFS (stack)', o: 'O(V + E)', cost: n * 2, note: 'same time, uses less memory, finds any path, risk of deep recursion' },
            ]
          case 'Array shift() vs concat':
            return [
              { name: 'arr.shift() in a loop', o: 'O(n²)', cost: (n * n) / 2, note: 'every shift reindexes the whole array' },
              { name: 'index pointer', o: 'O(n)', cost: n, note: 'read with arr[i++] and slice at the end' },
              { name: 'arr.concat()', o: 'O(n)', cost: n * 2, note: 'creates a new array — never call it inside a loop' },
            ]
          case 'Object vs Map properties':
            return [
              { name: 'Plain object keys', o: 'O(1)', cost: 1, note: 'string keys only, prototype chain surprises, fast for fixed shapes' },
              { name: 'Map get/set', o: 'O(1)', cost: 1, note: 'any key type, explicit size, insertion ordered' },
            ]
          default:
            return [
              { name: 'Quick sort (avg)', o: 'O(n log n)', cost: n * Math.log2(n), note: 'in place, cache friendly, worst case O(n²) on sorted input' },
              { name: 'Quick sort (worst)', o: 'O(n²)', cost: n * n, note: 'happens when the pivot is always the extreme — randomise it' },
              { name: 'Merge sort', o: 'O(n log n)', cost: n * Math.log2(n), note: 'guaranteed, needs extra memory, stable' },
            ]
        }
      })()
      const best = rows.reduce((m, r) => (r.cost < m.cost ? r : m), rows[0])
      const worst = rows.reduce((m, r) => (r.cost > m.cost ? r : m), rows[0])
      const ratioWorst = worst.cost / Math.max(1, best.cost)
      return [
        sres('Best at n = ' + num(n, 0), `${best.name} (${best.o})`, T.good, `${num(Math.round(best.cost), 0)} operations`, clamp(100 - (Math.log10(Math.max(1, best.cost)) / 12) * 100, 5, 100)),
        sres('Worst at n = ' + num(n, 0), `${worst.name} (${worst.o})`, ratioWorst > 1000 ? T.bad : ratioWorst > 50 ? T.warn : T.neutral, `${ratioWorst > 1e6 ? ratioWorst.toExponential(1) : num(ratioWorst, 0)}× more operations`),
        docr('Comparison', rows.map((r) => `${r.name} — ${r.o}\n  at n=${num(n, 0)}: ~${num(Math.round(r.cost), 0)} operations\n  ${r.note}`).join('\n\n')),
        docr('Growth table', rows.map((r) => {
          const ns = [10, 100, 1000, 10000, 100000]
          return `${r.name.padEnd(22)} ${r.o.padEnd(11)} ` + ns.map((x) => `${r.o.includes('log') ? x * Math.log2(x) : r.o.includes('²') ? x * x : x * 2}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')).join('  ')
        }).join('\n')),
        res('Practical threshold', 'below n = 100 the constant factor decides; above n = 10,000 the growth rate decides. Optimise the right one.', T.neutral),
        res('Common mistake', 'Big-O hides constants — a hash lookup is "O(1)" but is slower than a linear scan over 5 items', T.warn),
      ]
    },
  },
  {
    id: 'stack-trace-analyzer-coding',
    name: 'Stack Trace Analyzer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Reads a Java or Python stack trace and explains each frame, the real cause and where to start fixing.',
    tip: 'Start at the bottom-most frame you recognise. The top frames tell you what broke; the bottom one tells you what you called.',
    usage: ['Paste the full stack trace.', 'Choose the language.', 'Read the frame analysis.'],
    method: ['Frames are parsed from the trace.', 'Library frames are separated from yours.', 'The likely root cause is ranked.'],
    fields: [sel('lang', 'Language', ['Java', 'Python', 'JavaScript / Node'], 'Java'), txt('trace', 'Stack trace', 12, 'java.lang.NullPointerException: Cannot invoke "String.length()" because "user.getName()" is null\n\tat com.example.report.ReportBuilder.buildTitle(ReportBuilder.java:47)\n\tat com.example.report.ReportService.generate(ReportService.java:112)\n\tat com.example.api.ReportController.get(ReportController.java:38)')],
    compute: (v) => {
      const trace = asStr(v.trace).trim()
      if (!trace) return [sres('Stack trace', 'Paste a stack trace first', T.warn)]
      const lang = asSel(v.lang)
      const rawLines = linesOf(trace)
      const frames = lang === 'Python'
        ? rawLines.filter((l) => /^\s*File "/.test(l)).map((l) => {
            const m = l.match(/File "([^"]+)", line (\d+), in (.+)/)
            return { file: m?.[1] || l, line: m?.[2] || '', fn: m?.[3] || '' }
          })
        : rawLines.filter((l) => /^\s*at\s/.test(l)).map((l) => {
            const m = l.match(/at\s+([\w$.<>]+)\(([^:)]+):?(\d*)\)/)
            return { file: m?.[2] || '', line: m?.[3] || '', fn: m?.[1] || '' }
          })
      const exception = rawLines[0] || ''
      const excName = (exception.match(/^([\w.]*(?:Exception|Error|Throwable)[\w]*)/) || [])[1] || exception.split(':')[0].trim()
      const libs = frames.filter((f) => /^(java\.|javax\.|jdk\.|sun\.|com\.sun|org\.junit|org\.springframework|org\.apache|java_|\/usr\/lib|node_modules|org\.jena|scala\.)/.test(f.fn))
      const yours = frames.filter((f) => !libs.includes(f))
      const firstYourFrame = yours[0]
      const notNull = /NullPointer|is null|AttributeError|NoneType/.test(exception)
      const indexOut = /IndexOutOfBounds|ArrayIndexOutOfBounds|IndexError/.test(exception)
      const noSuch = /NoSuchMethod|NoClassDefFound|ClassNotFound|ModuleNotFound|NameError|AttributeError/.test(exception)
      const rootCause: string[] = []
      if (notNull) rootCause.push('a null or None value was dereferenced — check the line above and trace back who was supposed to set it')
      if (indexOut) rootCause.push('an index was past the end of a collection — off-by-one or an empty list')
      if (noSuch) rootCause.push('a class, method or module was not found — check imports, dependencies and case sensitivity')
      if (!rootCause.length) rootCause.push('read the exception message: it names the operation that failed')
      return [
        sres('Exception', excName || 'unrecognised', T.bad, exception.split(':').slice(1).join(':').trim().slice(0, 90)),
        sres('Frames', frames.length ? `${num(frames.length, 0)} (${num(yours.length, 0)} yours, ${num(libs.length, 0)} library)` : 'none matched', frames.length ? T.neutral : T.bad, frames.length ? 'top frame is where it threw, bottom frame is what you called' : 'nothing in this trace looks like ' + lang + '. JavaScript frames start with "at ", Python frames contain File "..." — change the language selector to match what you pasted.', frames.length ? 70 : 10),
        docr('Frame breakdown', frames.length ? frames.slice(0, 8).map((f, i) => `${i + 1}. ${f.fn}${f.line ? ` — ${f.file}:${f.line}` : ''}\n   ${libs.includes(f) ? 'library code — usually not where you fix it' : 'your code — this is actionable'}`).join('\n') : 'No frames matched the ' + lang + ' format, so there is nothing to break down. Switch the language selector to match the trace you pasted and it will parse.'),
        firstYourFrame ? res('Start here', `${firstYourFrame.fn} at ${firstYourFrame.file}${firstYourFrame.line ? ':' + firstYourFrame.line : ''}`, T.warn, 'open that line and inspect the values on it') : res('Start here', 'no frames from your own code — the failure is in setup or a dependency', T.warn),
        docr('Likely cause', rootCause.map((r) => `• ${r}`).join('\n')),
        res('Reading order', '1) exception type and message  2) first frame in your code  3) the frame just above it, which called it with bad data', T.neutral),
        res('Common fix', /NullPointer|is null|NoneType/.test(exception) ? 'add a null check at the frame above, and ask why the value was never set rather than only guarding against it' : 'read the message literally — most exceptions state exactly what was expected and what was found', T.neutral),
      ]
    },
  },
  {
    id: 'readme-writer-coding',
    name: 'README Writer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Generates a project README with install steps, usage, configuration and a project structure map.',
    tip: 'Write the quickstart first and test it in a clean environment. If setup takes more than five commands, nobody will run it.',
    usage: ['Describe the project and install steps.', 'Add the usage example.', 'Read the generated README.'],
    method: ['Sections are assembled from your inputs.', 'Placeholders are marked clearly.', 'A completeness check is returned.'],
    fields: [txt('name', 'Project name'), txt('desc', 'One-paragraph description of what it does', 4, 'A CLI that batches and normalises messy CSV exports into a single clean schema for analytics.'), txt('install', 'Installation commands', 4, 'npm install\ngit clone https://github.com/user/csv-tool'), txt('usage', 'Usage example', 4, 'csv-tool --input raw.csv --schema schema.json --out clean.csv'), txt('env', 'Environment variables (one per line: NAME | description | default)', 3, 'API_KEY | Service key | none\nLOG_LEVEL | Verbosity | info'), txt('structure', 'Folder structure (one per line)', 5, 'src/  — source\ntests/ — unit tests\ndocs/ — documentation')],
    compute: (v) => {
      const name = asStr(v.name).trim() || 'my-project'
      const desc = asStr(v.desc).trim()
      if (!desc) return [sres('README', 'Describe what the project does first', T.warn)]
      const install = linesOf(asStr(v.install))
      const usage = asStr(v.usage).trim()
      const env = linesOf(asStr(v.env)).map((e) => {
        const p = e.split('|').map((x) => x.trim())
        return { name: p[0] || 'VAR', desc: p[1] || '', def: p[2] || '' }
      })
      const structure = linesOf(asStr(v.structure))
      const missing: string[] = []
      if (!usage) missing.push('no usage example — this is the first thing a visitor looks for')
      if (!install.length) missing.push('no install instructions')
      if (!env.length) missing.push('configuration is undocumented')
      if (!/licen/i.test(desc)) missing.push('no licence mentioned')
      if (!/\b(test|jest|pytest|vitest|junit)\b/i.test(usage + ' ' + structure.join(' '))) missing.push('no test command shown')
      const readme = [
        `# ${name}`,
        '',
        desc,
        '',
        '## Features',
        '- Core functionality as described above',
        '- [add each real feature as a single line]',
        '',
        '## Requirements',
        '- [language and version, e.g. Node 18+]',
        '',
        '## Installation',
        '```bash',
        ...(install.length ? install : ['# add install commands']),
        '```',
        '',
        '## Usage',
        '```bash',
        ...(usage ? usage.split('\n') : ['# add a usage example']),
        '```',
        '',
        ...(env.length ? ['## Configuration', '', '| Variable | Description | Default |', '| --- | --- | --- |', ...env.map((e) => `| \`${e.name}\` | ${e.desc} | ${e.def || '—'} |`), ''] : []),
        ...(structure.length ? ['## Project structure', '```', ...structure, '```', ''] : []),
        '## Testing',
        '```bash',
        '# add your test command',
        '```',
        '',
        '## Contributing',
        '1. Fork the repository',
        '2. Create a feature branch',
        '3. Open a pull request with tests',
        '',
        '## License',
        '[add licence, e.g. MIT]',
      ].join('\n')
      const completeness = clamp(100 - missing.length * 18, 10, 100)
      return [
        sres('README completeness', `${num(Math.round(completeness), 0)}%`, completeness > 80 ? T.good : completeness > 55 ? T.warn : T.bad, `${num(missing.length, 0)} missing section(s)`, completeness),
        sres('README length', `${num(readme.split('\n').length, 0)} lines`, T.neutral, `${num(readme.split(/\s+/).length, 0)} words`),
        docr('README.md', readme),
        res('Missing', missing.length ? missing.join(' · ') : 'nothing critical is missing', missing.length ? T.warn : T.good),
        res('Order matters', 'description → install → usage → configuration. A visitor should be running it within 60 seconds of landing.', T.neutral),
        res('Before publishing', 'test the install steps in a fresh environment with no global packages — if it only works on your machine, the docs are wrong', T.warn),
      ]
    },
  },
  {
    id: 'code-style-checker-coding',
    name: 'Code Style Checker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Checks pasted code for the style rules reviewers actually reject: naming, line length, magic numbers and dead code.',
    tip: 'Match the existing file, not your personal preference. A codebase that changes style halfway through is harder to read than one style applied badly.',
    usage: ['Paste your code.', 'Choose the language and line limit.', 'Read the flagged lines.'],
    method: ['Naming, spacing and length rules are applied.', 'Magic numbers and dead code are detected.', 'Findings are listed by line.'],
    fields: [sel('lang', 'Language', ['C', 'C++', 'Python', 'JavaScript', 'TypeScript', 'Java'], 'Python'), txt('code', 'Code to check', 12, 'def Calc_Total( items,tax ):\n    T=0\n    for i in items:\n        T=T+i.price*99\n    if T>1000: T=T*0.9\n    return T\n\ndef unused_helper(x):\n    y = x * 2\n    return y'), n('col', 'Maximum line length', { def: 100, min: 60, max: 160, step: 5 })],
    compute: (v) => {
      const code = asStr(v.code)
      if (code.length < 10) return [sres('Style check', 'Paste some code first', T.warn)]
      const lang = asSel(v.lang)
      const col = asNum(v.col) || 100
      const raw = linesOf(code)
      const findings: string[] = []
      const naming = lang === 'Python'
        ? { fn: /^def\s+([a-z_][a-z0-9_]*)/, ok: 'snake_case' }
        : { fn: /(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/, ok: 'camelCase or PascalCase' }
      raw.forEach((l, i) => {
        if (l.length > col) findings.push(`line ${i + 1}: ${num(l.length, 0)} characters, over the ${num(col, 0)}-character limit`)
        if (/\t/.test(l)) findings.push(`line ${i + 1}: tab character — use spaces`)
        if (/\s+$/.test(l)) findings.push(`line ${i + 1}: trailing whitespace`)
        if (/\b\d{3,}\b/.test(l) && !/[#"]/.test(l.slice(Math.max(0, l.search(/\b\d{3,}\b/) - 2), l.search(/\b\d{3,}\b/) + 8))) findings.push(`line ${i + 1}: magic number — give it a named constant`)
        if (/[A-Z_]{3,}\s*=/.test(l) && lang !== 'Python') findings.push(`line ${i + 1}: SCREAMING_CASE local — use a const name for constants only`)
        if (/(if|while)\s*\(.+==\s*(true|false)\)/i.test(l)) findings.push(`line ${i + 1}: comparing a boolean to true/false is redundant`)
      })
      const fnNames = [...code.matchAll(new RegExp(naming.fn.source, 'g'))].map((m) => m[1])
      fnNames.forEach((f) => {
        if (lang === 'Python' && /[A-Z]/.test(f)) findings.push(`function ${f} should be snake_case in Python`)
        if (lang !== 'Python' && /_/.test(f) && /^[a-z]+_[a-z]/.test(f)) findings.push(`function ${f} uses snake_case — ${naming.ok} is the convention for ${lang}`)
      })
      const unusedFns = (code.match(/def\s+(\w+)\s*\(/g) || []).map((x) => (x.match(/def\s+(\w+)/) || [])[1]).filter((f) => f && (code.split(new RegExp(`\\b${f}\\s*\\(`)).length - 1) < 2)
      unusedFns.forEach((f) => findings.push(`function ${f} is defined but never called — dead code`))
      if (/console\.log/.test(code) && lang !== 'JavaScript') findings.push('console.log left in the source — remove before committing')
      const byLine = raw.length ? findings.length / raw.length : 0
      const score = clamp(100 - findings.length * 6 - byLine * 40, 5, 100)
      return [
        sres('Style score', `${num(Math.round(score), 0)}/100`, score > 85 ? T.good : score > 60 ? T.warn : T.bad, `${num(findings.length, 0)} finding(s) in ${num(raw.length, 0)} lines`, score),
        sres('Line length limit', `${num(col, 0)} characters`, T.neutral, `${num(raw.filter((l) => l.length > col).length, 0)} line(s) over`),
        docr('Findings', findings.length ? findings.join('\n') : 'no style issues found'),
        res('Naming convention', `${lang}: ${naming.ok}`, T.neutral, `${num(fnNames.length, 0)} function/identifier names checked`),
        res('Dead code', unusedFns.length ? `${unusedFns.length} unused function(s): ${unusedFns.join(', ')}` : 'no unused functions found', unusedFns.length ? T.warn : T.good),
        res('Enforce it', 'add a linter and formatter to the repo and run them in CI — style arguments disappear when the tool decides', T.neutral),
      ]
    },
  },
  {
    id: 'dependency-risk-checker-coding',
    name: 'Dependency Risk Checker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Reviews your dependency list for version pinning, maintenance signals and the cost of a major upgrade.',
    tip: 'Every dependency is code you did not write and must still maintain. A library that saves you two days and costs a weekend per year is a bad trade.',
    usage: ['Paste your dependency list.', 'Set your release cycle.', 'Read the risk ranking.'],
    method: ['Packages are parsed with their version constraints.', 'Pinning and range types are classified.', 'Upgrade risk is scored per package.'],
    fields: [txt('deps', 'Dependencies (one per line: package | version spec)', 8, 'react | ^18.2.0\nlodash | ^4.17.21\nmoment | 2.29.4\nleft-pad | ^1.3.0'), sel('cycle', 'Your release cycle', ['Weekly', 'Monthly', 'Quarterly', 'Yearly or less'], 'Monthly')],
    compute: (v) => {
      const rows = linesOf(asStr(v.deps)).map((l) => {
        const p = l.split(/[|@\s]/).map((x) => x.trim()).filter(Boolean)
        return { name: p[0] || '', spec: p[1] || '*' }
      }).filter((r) => r.name)
      if (!rows.length) return [sres('Dependencies', 'Paste a dependency list', T.warn)]
      const cycleWeeks: Record<string, number> = { Weekly: 1, Monthly: 4, Quarterly: 12, 'Yearly or less': 52 }
      const cycle = asSel(v.cycle)
      const cw = cycleWeeks[cycle] || 4
      const scored = rows.map((r) => {
        const exact = /^\d+\.\d+\.\d+$/.test(r.spec)
        const caret = /^\^/.test(r.spec)
        const tilde = /^~/.test(r.spec)
        const wild = r.spec === '*' || r.spec === 'latest'
        let risk = 0
        const notes: string[] = []
        if (wild) { risk += 3; notes.push('unpinned — a breaking release can land in your build unannounced') }
        else if (caret) { risk += 1; notes.push('^ allows minor and patch updates — usually the right trade-off') }
        else if (tilde) { risk += 1; notes.push('~ allows patch updates only — conservative and safe') }
        else if (exact) { risk -= 1; notes.push('exactly pinned — fully reproducible, but you own every security patch') }
        if (/moment|jquery|left-pad|request|underscore|core-js/.test(r.name)) { risk += 3; notes.push('superseded package — a maintained alternative exists (date-fns, fetch, native padStart)') }
        if (/^[a-z]/.test(r.name) && r.name.length < 8 && !r.name.includes('-')) { risk += 1; notes.push('single-word name — verify this is the real publisher, typosquatting is common') }
        return { ...r, risk, notes }
      }).sort((a, b) => b.risk - a.risk)
      const total = rows.length
      const risky = scored.filter((r) => r.risk >= 2)
      const unpinned = scored.filter((r) => r.spec === '*' || r.spec === 'latest')
      const superseded = scored.filter((r) => /moment|jquery|left-pad|request|underscore/.test(r.name))
      const points = risky.length * (cw <= 4 ? 0.5 : 0.2)
      return [
        sres('Dependencies reviewed', num(total, 0), T.good, `${num(risky.length, 0)} need attention`, clamp(100 - (risky.length / total) * 100, 5, 100)),
        sres('Unpinned', num(unpinned.length, 0), unpinned.length ? T.bad : T.good, unpinned.length ? 'these can change under you' : 'all version specs are constrained'),
        sres('Upgrade cost', `${num(Math.round(points), 0)} person-days per ${cycle.toLowerCase()} release`, points > 3 ? T.warn : T.good, 'rough estimate: half a day per risky package, scaled by your release cycle'),
        docr('Ranked by risk', scored.map((r, i) => `${i + 1}. ${r.name} ${r.spec} — risk ${r.risk > 0 ? '+' : ''}${r.risk}${r.notes.length ? `\n   ${r.notes.join('\n   ')}` : ''}`).join('\n')),
        res('Superseded packages', superseded.length ? `${superseded.map((r) => r.name).join(', ')} — replace before adding anything else` : 'no obviously superseded packages', superseded.length ? T.bad : T.good),
        res('Dependency budget', `${num(total, 0)} direct dependencies is ${total > 25 ? 'high — expect conflicts and audit time' : total > 12 ? 'moderate — keep a list and review it quarterly' : 'lean — you can justify each one'}`, total > 25 ? T.warn : T.neutral),
        res('Before you add one', 'is it already in your tree? can you write it in ten lines? is it maintained this quarter? if any answer is no, skip it', T.neutral),
      ]
    },
  },
  {
    id: 'code-review-checklist-coding',
    name: 'Code Review Checklist',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Turns a diff description into a structured review: correctness, tests, security, performance and readability.',
    tip: 'Review for correctness first, style last. A perfect-formatted function with an off-by-one error is still broken.',
    usage: ['Describe or paste the change.', 'Choose the change type.', 'Read the review checklist with priorities.'],
    method: ['The change type selects the relevant sections.', 'The change is scanned for common defects.', 'Reviewers get a prioritised checklist.'],
    fields: [sel('ctype', 'Change type', ['Bug fix', 'New feature', 'Refactor', 'Performance', 'UI change', 'Configuration / infrastructure'], 'New feature'), txt('diff', 'Describe or paste the change', 10, 'Changed the report endpoint to return paginated results instead of the full table. Added a query parameter and a default page size of 50.'), n('lines', 'Lines changed (approx)', { def: 200, min: 1, step: 10 })],
    compute: (v) => {
      const diff = asStr(v.diff).trim()
      if (!diff) return [sres('Review', 'Describe the change first', T.warn)]
      const type = asSel(v.ctype)
      const lines = Math.max(1, asNum(v.lines))
      const lower = diff.toLowerCase()
      const checks: { area: string; items: string[] }[] = [
        { area: 'Correctness', items: ['Does it do what the ticket says, and only that?', 'Are the edge cases handled: empty, null, zero, one, maximum?', 'Is any off-by-one possible in a loop boundary or index?', 'Does it fail loudly, or silently swallow an error?'] },
        { area: 'Tests', items: ['Is there a test that fails before the fix and passes after it?', 'Are the boundary values covered, not just the happy path?', 'Does the new code need a mock, and is the mock honest?'] },
        { area: 'Impact', items: ['Who else calls this — is the signature still compatible?', 'Is anything else now dead code?', 'Does this need a migration, a flag, or a deprecation path?'] },
        { area: 'Security', items: ['Is any user input reaching a query, a shell, a path or a template?', 'Are secrets, tokens or personal data in the logs?', 'Are permissions checked on the new path, not just the old one?'] },
        { area: 'Performance', items: ['Is there an N+1 query or a loop inside a loop?', 'Does the new code run per row where it could run once?', 'Does the added work scale with data size?'] },
        { area: 'Readability', items: ['Would a new team member understand the intent in 30 seconds?', 'Is the naming consistent with the surrounding code?', 'Are the comments explaining why, not what?'] },
      ]
      if (type === 'Performance') checks[4].items.unshift('Is the bottleneck actually measured, or assumed?', 'Is the speed-up worth the added complexity?')
      if (type === 'Configuration / infrastructure') checks.splice(4, 0, { area: 'Rollback', items: ['Can this be reverted without downtime?', 'Is the change idempotent if applied twice?', 'Would a rollback leave data in a valid state?'] })
      if (type === 'UI change') checks.splice(4, 0, { area: 'User impact', items: ['What does the user see while this loads?', 'Is it usable on a phone and with a keyboard only?', 'What happens on an error or empty state?'] })
      const flags: string[] = []
      if (/query|sql|database|table|select/i.test(lower) && !/index/i.test(lower)) flags.push('database change with no mention of an index — check the query plan')
      if (/delete|remove|drop|truncate/i.test(lower) && !/backup|soft|recover|undo/i.test(lower)) flags.push('destructive change with no recovery path mentioned')
      if (/auth|permission|role|admin/i.test(lower) && !/test/i.test(lower)) flags.push('permission change with no test mentioned')
      if (/api|endpoint|route/i.test(lower) && !/version|backward|deprecat/i.test(lower)) flags.push('API change with no versioning plan — existing clients will break')
      if (lines > 400) flags.push(`${num(lines, 0)} lines is too large to review properly — split the change`)
      const allItems = checks.reduce((s, c) => s + c.items.length, 0)
      return [
        sres('Review scope', `${num(checks.length, 0)} areas, ${num(allItems, 0)} checks`, T.neutral, `${type} · ~${num(lines, 0)} lines changed`),
        docr('Review checklist', checks.map((c) => `${c.area.toUpperCase()}\n${c.items.map((i) => `  □ ${i}`).join('\n')}`).join('\n\n')),
        res('Priority order', 'Correctness → Tests → Security → Impact → Performance → Readability. Stop at the first category that matters for this change type.', T.neutral),
        docr('Change-specific flags', flags.length ? flags.map((f) => `⚠ ${f}`).join('\n') : 'no automatic flags — the checklist still applies'),
        res('Change size', lines > 400 ? 'split this: reviewers approve what they can hold in their head' : lines > 150 ? 'borderline — a 200-line review is already slow' : 'reviewable size', lines > 400 ? T.bad : lines > 150 ? T.warn : T.good),
        res('Comment etiquette', 'prefix every comment with "nit:", "optional:" or "must:" — the author needs to know what blocks approval', T.neutral),
        res('Approval bar', 'one approving review, no unresolved "must" comments, CI green, and you have run it locally', T.neutral),
      ]
    },
  },
  {
    id: 'data-structure-picker-coding',
    name: 'Data Structure Picker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Answers "which data structure should I use?" from your operation mix, with a complexity comparison.',
    tip: 'Pick the structure for the operations you do most, not the ones that sound impressive. Sorted insertion at O(n) is fine if you insert once and read a million times.',
    usage: ['Describe what you need to store and do.', 'Set the size.', 'Read the recommended structures.'],
    method: ['Required operations are detected from your description.', 'Structures are scored on each operation.', 'The best fit is recommended with a trade-off.'],
    fields: [txt('need', 'What do you need to do?', 4, 'I have ~1,000,000 records, I add and remove constantly, I need "get the 5 most recent", and I sometimes need to find by id. I do not need ordering or ranges.'), n('size', 'Approximate number of items', { def: 100000, min: 10, step: 10 }), ck('ops', 'Operations you need', ['Insert', 'Delete', 'Lookup by key', 'Ordered iteration', 'Range query', 'Min / max access', 'Duplicate values', 'Priority ordering', 'Thread safety'])],
    compute: (v) => {
      const need = asStr(v.need).toLowerCase()
      if (!need.trim()) return [sres('Picker', 'Describe what you need to do', T.warn)]
      const ops = asBoolList(v.ops).map(Boolean)
      const OP_NAMES = ['Insert', 'Delete', 'Lookup by key', 'Ordered iteration', 'Range query', 'Min / max access', 'Duplicate values', 'Priority ordering', 'Thread safety']
      const explicit = OP_NAMES.filter((_, i) => ops[i])
      const detected: string[] = []
      if (/\badd|insert|append|push\b/.test(need)) detected.push('Insert')
      if (/\bremove|delete|drop\b/.test(need)) detected.push('Delete')
      if (/\bby id|by key|lookup|find\b/.test(need)) detected.push('Lookup by key')
      if (/\border|sort|sorted|alphabetical|sequential\b/.test(need)) detected.push('Ordered iteration')
      if (/\brange|between|slice|window\b/.test(need)) detected.push('Range query')
      if (/\bmost recent|latest|newest|smallest|largest|top \d|min|max\b/.test(need)) detected.push('Min / max access')
      if (/\bduplicate|multi|many|same\b/.test(need)) detected.push('Duplicate values')
      if (/\bpriority|queue|heap|next\b/.test(need)) detected.push('Priority ordering')
      if (/\bthread|concurrent|parallel|shared\b/.test(need)) detected.push('Thread safety')
      const required = [...new Set([...explicit, ...detected])]
      const n = Math.max(1, asNum(v.size))
      const CANDIDATES = [
        { name: 'Array / List', ins: 'O(n)', del: 'O(n)', look: 'O(n)', order: 'O(n log n) once', range: 'O(k)', mm: 'O(n)', dup: 'yes', pri: 'no', thread: 'no', use: 'small, fixed, or scanned sequentially' },
        { name: 'Hash map / Set', ins: 'O(1)', del: 'O(1)', look: 'O(1)', order: 'no', range: 'no', mm: 'O(n)', dup: 'set only', pri: 'no', thread: 'no', use: 'lookup dominates — the default answer' },
        { name: 'Balanced tree (TreeMap)', ins: 'O(log n)', del: 'O(log n)', look: 'O(log n)', order: 'always', range: 'O(log n + k)', mm: 'O(log n)', dup: 'no', pri: 'no', thread: 'no', use: 'ordered keys, ranges, or prefix queries' },
        { name: 'Heap (priority queue)', ins: 'O(log n)', del: 'O(log n)', look: 'O(1)', order: 'partial', range: 'no', mm: 'O(1)', dup: 'yes', pri: 'yes', thread: 'no', use: 'repeatedly taking the top item' },
        { name: 'Doubly linked list / deque', ins: 'O(1)', del: 'O(1)', look: 'O(n)', order: 'insertion', range: 'O(k)', mm: 'O(1)', dup: 'yes', pri: 'no', thread: 'no', use: 'sliding windows, LRU, undo stacks' },
        { name: 'B-tree / database index', ins: 'O(log n)', del: 'O(log n)', look: 'O(log n)', order: 'always', range: 'O(log n + k)', mm: 'O(log n)', dup: 'no', pri: 'no', thread: 'yes', use: 'more than ~100k items, or persistence needed' },
        { name: 'Skip list', ins: 'O(log n)', del: 'O(log n)', look: 'O(log n)', order: 'probabilistic', range: 'O(log n + k)', mm: 'O(1)', dup: 'no', pri: 'no', thread: 'no', use: 'concurrent ordered access' },
      ]
      const score = (c: (typeof CANDIDATES)[number]) => {
        let s = 0
        if (required.includes('Lookup by key') && c.look === 'O(1)') s += 3
        if (required.includes('Lookup by key') && c.look.startsWith('O(log n)')) s += 2
        if (required.includes('Ordered iteration') && c.order.includes('always')) s += 3
        if (required.includes('Ordered iteration') && c.order === 'insertion') s += 1
        if (required.includes('Ordered iteration') && c.order === 'no') s -= 3
        if (required.includes('Range query') && c.range.startsWith('O(log n)')) s += 3
        if (required.includes('Range query') && c.range === 'no') s -= 2
        if (required.includes('Min / max access') && c.mm === 'O(1)') s += 3
        if (required.includes('Priority ordering') && c.pri === 'yes') s += 4
        if (required.includes('Thread safety') && c.thread === 'yes') s += 3
        if (required.includes('Duplicate values') && c.dup === 'no') s -= 2
        if (required.includes('Insert') && c.ins === 'O(1)') s += 2
        if (required.includes('Delete') && c.del === 'O(1)') s += 2
        if (n > 100000 && c.name.startsWith('B-tree')) s += 2
        if (n < 1000 && c.name === 'Array / List') s += 1
        return s
      }
      const ranked = CANDIDATES.map((c) => ({ c, s: score(c) })).sort((a, b) => b.s - a.s)
      const best = ranked[0]
      const runnerUp = ranked[1]
      return [
        sres('Recommended', best.c.name, T.good, best.c.use, clamp(50 + best.s * 10, 5, 100)),
        sres('Operations detected', num(required.length, 0), T.neutral, required.length ? required.join(', ') : 'none specified — the default answer is a hash map', (required.length / 9) * 100),
        sres('Runner-up', runnerUp.c.name, T.neutral, `trade-off: ${runnerUp.c.use}`, clamp(50 + runnerUp.s * 10, 5, 100)),
        docr('Complexity comparison', ['Operation        Array   Hash   Tree   Heap   Deque  B-tree', ...ranked.slice(0, 6).map((r) => `${r.c.name.split(' ')[0].padEnd(14)} ${r.c.ins.padEnd(7)}${r.c.look.padEnd(7)}${r.c.order.slice(0, 6).padEnd(7)}${r.c.mm.padEnd(7)}${r.c.pri.padEnd(7)}${r.c.thread}`)].join('\n')),
        res('Your requirement', required.length ? `you need: ${required.join(', ')}` : 'no operations specified', required.length ? T.neutral : T.warn),
        res('Default answer', 'if in doubt, use a hash map and sort at read time. Optimise the structure only after profiling shows the structure is the bottleneck.', T.neutral),
        res('Size threshold', n > 100000 ? `${num(n, 0)} items — memory layout and cache behaviour start to matter; consider an index over an in-memory structure` : `${num(n, 0)} items — in-memory structures are fine`, n > 100000 ? T.warn : T.neutral),
      ]
    },
  },
  {
    id: 'pseudocode-writer-coding',
    name: 'Pseudocode Writer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Converts a plain-English task into structured pseudocode with the algorithm named and its complexity stated.',
    tip: 'If you cannot write the pseudocode, you do not understand the problem yet — and the code will show it within a day.',
    usage: ['Describe the task in plain English.', 'Choose the algorithm family.', 'Read the pseudocode and the trace.'],
    method: ['Your description is mapped to an algorithm family.', 'Pseudocode is generated from the algorithm template.', 'A hand-trace validates the logic.'],
    fields: [txt('task', 'Describe the task in plain English', 4, 'Given a list of student records, find the top 3 students by average score, but never include anyone who missed more than 2 exams.'), sel('algo', 'Algorithm family', ['Let me choose', 'Sorting', 'Searching', 'Graph traversal', 'Dynamic programming', 'Greedy', 'Recursion', 'Hashing'], 'Let me choose'), txt('input', 'Input data (one value per line, where useful)', 5, 'A 90 3\nB 75 5\nC 88 1\nD 95 2')],
    compute: (v) => {
      const task = asStr(v.task).trim()
      if (!task) return [sres('Pseudocode', 'Describe the task first', T.warn)]
      const lower = task.toLowerCase()
      const input = linesOf(asStr(v.input)).map((l) => l.trim().split(/\s+/))
      const chosen = asSel(v.algo)
      const detect = (): string => {
        if (/sort|order|rank|top \d|largest|smallest|ascending|descending/.test(lower)) return 'Sorting'
        if (/find|search|locate|contains|exist/.test(lower)) return 'Searching'
        if (/graph|tree|node|path|route|connected|neighbour|neighbor|shortest/.test(lower)) return 'Graph traversal'
        if (/ways|combinations|subset|coin|overlap|best cost|longest|shortest sequence|memo/.test(lower)) return 'Dynamic programming'
        if (/maximum|greedy|choose the|largest possible|most value/.test(lower)) return 'Greedy'
        if (/recurse|call itself|divide|tree structure|factorial|fibonacci|permutation/.test(lower)) return 'Recursion'
        if (/group|count|frequency|unique|dedupe|lookup|map|index/.test(lower)) return 'Hashing'
        return 'Sorting'
      }
      const algo = chosen === 'Let me choose' ? detect() : chosen
      const TEMPLATES: Record<string, { name: string; code: string; complexity: string; note: string; trace: (d: string[][]) => string }> = {
        Sorting: {
          name: 'Sort then filter',
          code: 'INPUT records\neligible ← empty list\nFOR EACH record IN records:\n    IF record.missed <= 2 THEN\n        ADD record TO eligible\nSORT eligible BY average DESCENDING\nOUTPUT first 3 of eligible',
          complexity: 'O(n log n) for the sort, O(n) for the filter — total O(n log n)',
          note: 'filtering before sorting is faster than sorting everything then dropping rows',
          trace: (d) => d.map((r) => `${r[0]}: ${r.slice(1).join(', ')} → ${r.length > 1 && /^\d+$/.test(r[1]) ? `avg ${(r.slice(1).map(Number).reduce((a: number, b: number) => a + b, 0) / r.length).toFixed(1)}` : 'no score'}`).join('\n'),
        },
        Searching: {
          name: 'Linear search (or binary if sorted)',
          code: 'IF records IS sorted THEN\n    low ← 0, high ← length - 1\n    WHILE low <= high:\n        mid ← (low + high) / 2\n        IF records[mid].id = target RETURN records[mid]\n        IF records[mid].id < target THEN low ← mid + 1 ELSE high ← mid - 1\n    RETURN not found\nELSE\n    FOR EACH record IN records:\n        IF record.id = target RETURN record\n    RETURN not found',
          complexity: 'O(log n) sorted, O(n) unsorted',
          note: 'sorting to enable binary search only pays off if you will search many times',
          trace: () => 'no trace data supplied',
        },
        'Graph traversal': {
          name: 'BFS for shortest path',
          code: 'queue ← [start], visited ← {start}, cameFrom ← empty map\nWHILE queue NOT empty:\n    node ← REMOVE FRONT of queue\n    FOR EACH neighbour IN node.neighbours:\n        IF neighbour NOT IN visited:\n            ADD neighbour TO visited\n            STORE cameFrom[neighbour] = node\n            ADD neighbour TO END of queue\nIF target NOT IN visited RETURN unreachable\npath ← rebuild backwards through cameFrom from target to start',
          complexity: 'O(V + E) time, O(V) space',
          note: 'BFS finds the fewest-edges path; DFS finds any path, which is rarely what you want',
          trace: () => 'no trace data supplied',
        },
        'Dynamic programming': {
          name: 'Memoised recursion',
          code: 'memo ← empty map\nFUNCTION solve(state):\n    IF state IN memo RETURN memo[state]\n    best ← 0\n    FOR EACH choice IN options(state):\n        candidate ← value(choice) + solve(state after choice)\n        IF candidate > best THEN best ← candidate\n    memo[state] ← best\n    RETURN best',
          complexity: 'O(states × choices) instead of O(choices^depth) — exponential to linear',
          note: 'the subproblem must be identical for the memo to be valid; if it is not, this is not DP',
          trace: () => 'no trace data supplied',
        },
        Greedy: {
          name: 'Greedy selection',
          code: 'remaining ← set of candidates\nresult ← empty\nWHILE remaining NOT empty:\n    best ← element of remaining maximising score(choice)\n    IF best does not fit constraints THEN REMOVE best FROM remaining ELSE ADD best TO result\nRETURN result',
          complexity: 'usually O(n log n) with sorting; prove the greedy choice is always safe',
          note: 'greedy is correct only when the local optimum is also global — verify with a counterexample before relying on it',
          trace: () => 'no trace data supplied',
        },
        Recursion: {
          name: 'Recursive decomposition',
          code: 'FUNCTION process(input):\n    IF input IS trivial THEN RETURN base case\n    result ← combine(\n        process(input without first element),\n        process(input without last element)\n    )\n    RETURN result',
          complexity: 'exponential unless overlapping subproblems are memoised',
          note: 'every recursive call needs a base case and a measure that strictly decreases toward it',
          trace: () => 'no trace data supplied',
        },
        Hashing: {
          name: 'Count and group by key',
          code: 'counts ← empty hash map\nFOR EACH item IN input:\n    key ← extract key from item\n    IF key IN counts THEN counts[key] ← counts[key] + 1 ELSE counts[key] ← 1\nFOR EACH (key, count) IN counts:\n    IF count meets threshold THEN EMIT key, count',
          complexity: 'O(n) average, O(n²) worst case with a poor hash function',
          note: 'one pass instead of a nested comparison loop — this is the standard grouping pattern',
          trace: (d) => {
            const m = new Map<string, number>()
            d.forEach((r) => m.set(r[0], (m.get(r[0]) || 0) + 1))
            return [...m.entries()].map(([k, c]) => `${k}: ${c}`).join('\n')
          },
        },
      }
      const t = TEMPLATES[algo] || TEMPLATES.Sorting
      const steps = linesOf(t.code)
      return [
        sres('Algorithm', t.name, T.good, `${algo} — detected${chosen === 'Let me choose' ? ' from your description' : ' by you'}`),
        sres('Complexity', t.complexity, T.neutral, `${num(steps.length, 0)} pseudocode lines`),
        docr('Pseudocode', t.code),
        docr('Trace on your data', t.trace(input) || 'no input data supplied'),
        res('Why this algorithm', t.note, T.neutral),
        res('Next step', 'name the variables, write the input and output types, then translate line by line — pseudocode is a plan, not a deliverable', T.neutral),
        res('Validate', 'trace it by hand on three cases: empty input, one element, and the worst case. If your trace surprises you, the pseudocode is wrong', T.warn),
      ]
    },
  },
  {
    id: 'dockerfile-checker-coding',
    name: 'Dockerfile & Compose Checker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Reviews a Dockerfile or compose file for layer bloat, missing caching, security and image size problems.',
    tip: 'Copy the dependency manifest and install before copying the source. That one reorder turns a two-minute rebuild into a two-second one.',
    usage: ['Paste your Dockerfile or compose file.', 'Choose the base image.', 'Read the findings and the improved file.'],
    method: ['Instructions are parsed in order.', 'Caching and layer rules are evaluated.', 'An optimised version is produced.'],
    fields: [sel('kind', 'File type', ['Dockerfile', 'docker-compose.yml'], 'Dockerfile'), sel('base', 'Base image', ['node:22-alpine', 'node:22-slim', 'python:3.12-slim', 'python:3.12', 'ubuntu:24.04'], 'node:22-alpine'), txt('file', 'Paste your file', 12, 'FROM node:22\nWORKDIR /app\nCOPY . .\nRUN npm install\nCOPY . .\nCMD ["npm", "start"]')],
    compute: (v) => {
      const file = asStr(v.file)
      if (!file.trim()) return [sres('Docker review', 'Paste your Dockerfile or compose file', T.warn)]
      const isCompose = asSel(v.kind).startsWith('docker-compose')
      const lines = linesOf(file)
      const findings: string[] = []
      const sizeHints: Record<string, number> = { 'node:22-alpine': 155, 'node:22-slim': 220, 'python:3.12-slim': 130, 'python:3.12': 1000, 'ubuntu:24.04': 78 }
      let estimated = sizeHints[asSel(v.base)] || 200
      if (isCompose) {
        const hasVersion = /version\s*:/.test(file)
        if (hasVersion) findings.push('the top-level "version" key is obsolete in Compose v2 — it is ignored and warns')
        if (!/healthcheck:/i.test(file)) findings.push('no healthcheck — an orchestrator cannot tell a running container from a hung one')
        if (!/restart:/i.test(file)) findings.push('no restart policy — containers stay down after a crash or reboot')
        if (!/(mem_limit|deploy:|resources:)/i.test(file)) findings.push('no memory or CPU limits — one container can starve the host')
        if (/latest/i.test(file)) findings.push('image tag "latest" — builds stop being reproducible; pin a version or digest')
        const svcCount = (file.match(/^\s{2}\w[\w-]*:/gm) || []).length
        return [
          sres('Compose services', num(svcCount, 0), T.good, 'services detected'),
          docr('Findings', findings.length ? findings.map((f) => `• ${f}`).join('\n') : 'no structural problems found'),
          res('Checklist', ['named volumes for anything that must survive a container rebuild', 'secrets in environment files, not committed compose files', 'no database port published to the host unless you need it locally', 'a depends_on with a healthcheck condition, not just a start order'].join('\n'), T.neutral),
          res('Development vs production', 'docker compose up with bind mounts for development; build a real image for production — never ship bind mounts', T.neutral),
          res('Networking', 'services reach each other by service name, not localhost, inside a compose network', T.neutral),
        ]
      }
      const copies = lines.filter((l) => /^\s*COPY\s+\./i.test(l)).length
      if (copies > 1) findings.push(`${num(copies, 0)} COPY . . instructions — the second one invalidates the layer cache for every source change`)
      if (/^\s*COPY\s+\.\s+\./mi.test(lines.join('\n')) && !/package-lock|requirements\.txt|poetry\.lock/.test(file)) findings.push('copying everything before installing dependencies destroys the build cache — copy the manifest first')
      if (/\bapt-get\b|\bapk\b|\byum\b/.test(file) && !/--no-install-recommends|rm -rf \/var\/lib\/apt/.test(file)) findings.push('package manager ran without cleanup — the package lists stay in the image (tens of MB)')
      if (!/USER\s+/i.test(file)) findings.push('no USER instruction — the container runs as root by default')
      if (/^CMD\s+\[?\s*npm\s+start/i.test(file) || /npm\s+(start|dev)\s*$/m.test(file)) findings.push('using a shell CMD — it becomes PID 1 and swallows signals, so `docker stop` takes 10 seconds')
      if (!/^(HEALTHCHECK|COPY\s+--from)/mi.test(file) && /multi-stage|builder/i.test(file)) findings.push('multi-stage build detected but nothing is copied out of the builder stage')
      if (/latest/i.test(file)) findings.push('base image is unpinned ("latest") — builds are not reproducible')
      estimated += copies * 40
      if (/--no-install-recommends/.test(file) || /apk add --no-cache/.test(file)) estimated *= 0.9
      const improved = [
        '# deps first — this layer is cached until the manifest changes',
        ...(asSel(v.base).startsWith('node') ? ['COPY package*.json ./', 'RUN npm ci --omit=dev'] : asSel(v.base).startsWith('python') ? ['COPY requirements.txt .', 'RUN pip install --no-cache-dir -r requirements.txt'] : ['RUN apt-get update && apt-get install -y --no-install-recommends <packages> && rm -rf /var/lib/apt/lists/*']),
        '',
        '# source second',
        'COPY . .',
        '',
        'USER app',
        'EXPOSE 3000',
        'CMD ["node", "dist/main.js"]',
      ].join('\n')
      return [
        sres('Estimated image size', `${num(Math.round(estimated), 0)} MB`, estimated > 800 ? T.bad : estimated > 400 ? T.warn : T.good, `${num(lines.length, 0)} instructions in a ${asSel(v.base)} base`, clamp(100 - (estimated / 1200) * 100, 5, 100)),
        sres('Findings', num(findings.length, 0), findings.length > 3 ? T.bad : findings.length ? T.warn : T.good, findings.length ? 'issues to fix' : 'no issues found', clamp(100 - findings.length * 15, 5, 100)),
        docr('Findings detail', findings.length ? findings.map((f, i) => `${i + 1}. ${f}`).join('\n') : 'nothing flagged — the ordering, user and exec-form rules are all satisfied'),
        docr('Optimised Dockerfile', improved),
        res('Biggest win', 'copy the dependency manifest before the source; it is a two-line change that saves a full reinstall on every code edit', T.good),
        res('Multi-stage', 'build in one stage, copy only the artefact into a clean runtime stage — build tools are usually 80% of the image', T.neutral),
        res('Not in the image', '.dockerignore should exclude node_modules, .git, dist and any .env — they silently bloat the build context', T.warn),
      ]
    },
  },
  {
    id: 'code-diff-explainer-coding',
    name: 'Code Diff Explainer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Reads a unified diff and explains what changed, the risk level and what to test.',
    tip: 'Read the hunk headers before the code. `@@ -40,7 +52,19 @@` tells you the change grew a function by twelve lines before you read a single line of it.',
    usage: ['Paste a unified diff.', 'Read the change summary.', 'Check the risk flags and test list.'],
    method: ['Diff hunks and file headers are parsed.', 'Added and removed lines are counted per file.', 'Change type and risk are inferred.'],
    fields: [txt('diff', 'Unified diff', 14, '--- a/src/report.ts\n+++ b/src/report.ts\n@@ -40,7 +40,12 @@ export function buildReport() {\n-  const rows = db.query(sql)\n+  const rows = db.query(sql, { timeout: 5000 })\n+  if (!rows.length) throw new Error("no rows")\n+  rows.forEach((r) => { r.total = r.qty * r.price })\n   return rows\n }'), sel('risk', 'How critical is this code?', ['Prototype / coursework', 'Internal tool', 'Customer-facing production', 'Payments, auth or medical'], 'Internal tool')],
    compute: (v) => {
      const diff = asStr(v.diff)
      if (!diff.trim()) return [sres('Diff', 'Paste a unified diff first', T.warn)]
      const raw = linesOf(diff)
      const files: string[] = []
      let current = ''
      let added = 0
      let removed = 0
      const fileStats: Record<string, { add: number; del: number }> = {}
      const addedLines: string[] = []
      const removedLines: string[] = []
      raw.forEach((l) => {
        if (/^\+\+\+ b\//.test(l)) { current = l.replace(/^\+\+\+ b\//, '').trim(); if (!files.includes(current)) { files.push(current); fileStats[current] = { add: 0, del: 0 } } }
        else if (/^--- a\//.test(l)) { if (!current) current = l.replace(/^--- a\//, '').trim() }
        else if (/^\+\+\+|\*\*\* /.test(l)) { }
        else if (l.startsWith('+')) { added++; if (current) fileStats[current].add++; if (addedLines.length < 6) addedLines.push(l.slice(1)) }
        else if (l.startsWith('-')) { removed++; if (current) fileStats[current].del++; if (removedLines.length < 6) removedLines.push(l.slice(1)) }
      })
      const hunks = (diff.match(/^@@.*@@/gm) || [])
      const testsChanged = files.some((f) => /test|spec|__tests__/i.test(f))
      const migrations = files.some((f) => /migration|schema|\.sql$/i.test(f))
      const configs = files.filter((f) => /\.(json|ya?ml|toml|env|ini|config\.)/i.test(f))
      const riskLevel = asSel(v.risk)
      const riskFlags: string[] = []
      const addedText = addedLines.join(' ').toLowerCase()
      if (/throw new|raise |panic\(/.test(addedText)) riskFlags.push('new exception paths added — every one needs a test and a decision about the user-facing message')
      if (/await|\.then\(|async /.test(addedText) && !/catch/.test(addedText)) riskFlags.push('async code added with no visible error handling')
      if (/select |insert |update |delete /.test(addedText)) riskFlags.push('SQL touched — check for injection and for a query plan')
      if (/password|secret|token|apikey|api_key/.test(addedText)) riskFlags.push('credential names appear in the added code — confirm none are hardcoded or logged')
      if (/timeout|cache|retry/.test(addedText)) riskFlags.push('timeouts and retries change failure behaviour — retries can double-write')
      if (!testsChanged && added > 10) riskFlags.push(`${num(added, 0)} lines added with no test file in the diff`)
      if (migrations) riskFlags.push('schema change — needs a reversible migration and a rollback plan')
      if (added > removed * 3 && added > 40) riskFlags.push('net addition is large — check for dead code that should have been deleted instead')
      if (configs.length) riskFlags.push(`configuration changed (${configs.join(', ')}) — this is where environment-specific breakage hides`)
      const total = added + removed
      const summary = files.map((f) => `${f}  +${num(fileStats[f]?.add || 0, 0)} / -${num(fileStats[f]?.del || 0, 0)}`).join('\n')
      return [
        sres('Files changed', num(files.length, 0), files.length > 10 ? T.warn : T.good, `${num(hunks.length, 0)} hunks, +${num(added, 0)} / -${num(removed, 0)}`),
        sres('Tests in this diff', testsChanged ? 'Yes' : 'No', testsChanged ? T.good : added > 10 ? T.bad : T.neutral, testsChanged ? 'behaviour is covered' : 'no test file changed', testsChanged ? 100 : 20),
        sres('Change size', num(total, 0), total > 400 ? T.bad : total > 150 ? T.warn : T.good, `${riskLevel.toLowerCase()} code`, clamp(100 - (total / 600) * 100, 5, 100)),
        docr('File summary', summary),
        docr('Added (first lines)', addedLines.length ? addedLines.map((l) => `+ ${l}`).join('\n') : 'nothing added'),
        docr('Removed (first lines)', removedLines.length ? removedLines.map((l) => `- ${l}`).join('\n') : 'nothing removed'),
        res('Risk flags', riskFlags.length ? riskFlags.map((f) => `⚠ ${f}`).join('\n') : 'no automatic risk flags — review the added lines for logic errors', riskFlags.length ? T.warn : T.good),
        res('What to test', addedLines.length ? `the new branches: ${addedLines.slice(0, 3).map((l) => `“${l.trim().slice(0, 60)}”`).join(', ')} — with the inputs that would make each branch fail` : 'no new logic to test', T.neutral),
        res('Hunk headers', hunks.length ? hunks.slice(0, 5).join('\n') : 'no hunk headers found — is this a real unified diff?', T.neutral),
      ]
    },
  },
  {
    id: 'pair-programming-planner-coding',
    name: 'Pair Programming Session Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Plans a pairing session: driver/navigator rotation, goals, breakpoints and a debrief structure.',
    tip: 'Swap driver every 30 minutes. The driver types and thinks shallowly; the navigator thinks deeply. Rotate or the navigator becomes a spectator.',
    usage: ['Set the session goal and length.', 'Choose the pairing style.', 'Read the rotation plan.'],
    method: ['The session is split into rotation blocks.', 'Goals and checkpoints are placed.', 'A debrief structure is produced.'],
    fields: [sel('goal', 'Session goal', ['Fix a specific bug', 'Implement a feature', 'Learn an unfamiliar codebase', 'Pair-programming practice', 'Refactor with safety'], 'Fix a specific bug'), n('mins', 'Session length (minutes)', { def: 90, min: 20, max: 300, step: 10 }), n('rotation', 'Driver rotation (minutes)', { def: 30, min: 10, max: 60, step: 5 }), sel('tools', 'Setup', ['Shared screen + voice', 'Live Share / collaborative editor', 'In person at one keyboard', 'Mob programming (whole team)'], 'Shared screen + voice')],
    compute: (v) => {
      const mins = Math.max(20, asNum(v.mins) || 90)
      const rot = clamp(asNum(v.rotation) || 30, 10, 60)
      const blocks = Math.ceil(mins / rot)
      const isMob = asSel(v.tools).startsWith('Mob')
      const lines: string[] = []
      for (let i = 0; i < blocks; i++) {
        const start = i * rot + 1
        const end = Math.min(mins, (i + 1) * rot)
        const role = isMob ? (cyclic(i, 2) === 0 ? 'typist' : 'pair with the next person') : cyclic(i, 2) === 0 ? 'Driver A' : 'Driver B'
        lines.push(`${String(start).padStart(3, ' ')}–${String(end).padStart(3, ' ')} min  ${role.padEnd(28)} ${i === 0 ? '· agree the goal and the plan first' : ''}`)
      }
      const goalText: Record<string, string> = {
        'Fix a specific bug': 'reproduce it first, in writing, before touching any code — an unreproduced bug is a guess',
        'Implement a feature': 'sketch the interface and the data shape on paper before the first line of code',
        'Learn an unfamiliar codebase': 'each person explains one module in their own words; the goal is a map, not a fix',
        'Pair-programming practice': 'the navigator narrates the reasoning out loud; the driver must not type what the navigator did not say',
        'Refactor with safety': 'no behaviour change during the session — tests green before, tests green after',
      }
      return [
        sres('Session plan', `${num(blocks, 0)} rotation blocks`, T.good, `${num(mins, 0)} minutes, swapping every ${num(rot, 0)}`),
        sres('Style', asSel(v.tools), T.neutral, isMob ? 'mob mode: everyone types in turns, the whole group thinks' : 'classic pair: one types, one thinks'),
        docr('Rotation', lines.join('\n')),
        docr('Session agenda', `0–5 min   · restate the goal and what "done" looks like\n5–10 min  · ${goalText[asSel(v.goal)]}\n${num(Math.max(1, Math.round(mins * 0.1)), 0)}–${num(mins - 10, 0)} min · work in rotations\nlast 10 min · tests run, commit made, notes written`),
        res('Navigator rule', 'the navigator reads code, thinks ahead and asks questions — they do not point at the keyboard', T.neutral),
        res('Communication', 'think out loud on both sides. Silent pairing is two people watching one person type.', T.warn),
        res('When to stop', `stop at ${num(mins, 0)} minutes even if unfinished — fatigue causes more bugs than it solves, and the session is easier to resume with a written note`, T.neutral),
        res('Output', 'a commit and two lines of notes at the end: what changed, what is still open', T.good),
      ]
    },
  },
]
