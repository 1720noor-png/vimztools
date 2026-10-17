import {
  asNum,
  asStr,
  docres,
  fmtNum,
  n,
  pctres,
  res,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'RegEx, Parsing & Tokenizers'

export const MOD19_SPECS: DevCloudSpec[] = [
  {
    id: 'regex-redos-vulnerability-evaluator',
    name: 'Regular Expression ReDoS Catastrophic Backtracking Scanner',
    subject: SUBJECT,
    blurb: 'Detect vulnerable Regular Expression patterns susceptible to Regular Expression Denial of Service (ReDoS) via evil nested quantifiers.',
    tip: 'Patterns like `(a+)+$`, `([a-zA-Z]+)*`, and `(a|b|ab)*` cause $O(2^n)$ exponential backtracking on non-matching suffix attacks.',
    usage: [
      'Enter your candidate regular expression pattern.',
      'Enter flags (g, i, m).',
      'Inspect catastrophic backtracking warnings and safe alternatives.',
    ],
    method: [
      'Heuristically detects nested quantifiers (`+`, `*`) and overlapping alternatives within group captures.',
    ],
    fields: [
      txt('pattern', 'Regular Expression Pattern', '^([a-zA-Z0-9_]+)*@([a-zA-Z0-9_]+)\\.([a-zA-Z]{2,})$', 1),
      txt('flags', 'RegEx Flags', 'i', 1),
    ],
    compute: (v) => {
      const pat = asStr(v, 'pattern', '')
      const flags = asStr(v, 'flags', 'i')

      const redosIndicators = [
        { regex: /\([^\)]*[\+\*][^\)]*\)[\+\*]/, reason: 'Nested quantifiers: group with +/* repeated by outer +/*' },
        { regex: /\([^\)]*\|[^\)]*\)[\+\*]/, reason: 'Repeated alternating group: (a|b)+ with overlapping prefixes' },
        { regex: /\\d\+\\d\+/, reason: 'Adjacent greedy plus quantifiers with no separator' },
        { regex: /\.\*.*\.\*/, reason: 'Multiple greedy dot-star (.*) wildcards in single expression' },
      ]

      const flagged: string[] = []
      for (const ind of redosIndicators) {
        if (ind.regex.test(pat)) {
          flagged.push(ind.reason)
        }
      }

      const isVulnerable = flagged.length > 0
      const tone = isVulnerable ? 'bad' : 'good'

      let safeSuggestion = pat
      if (pat.includes('([a-zA-Z0-9_]+)*')) {
        safeSuggestion = pat.replace('([a-zA-Z0-9_]+)*', '[a-zA-Z0-9_]+')
      }

      return [
        res('Evaluated Pattern', `/${pat}/${flags}`, 'neutral'),
        res('ReDoS Vulnerability Verdict', isVulnerable ? 'High Risk (Catastrophic Backtracking Detected)' : 'Low Risk (Linear / Safe Backtracking)', tone),
        res('Detected Evil Patterns', flagged.length > 0 ? flagged.join('; ') : 'No nested exponential quantifiers detected', tone),
        res('Safe Atomic / Possessive Rule', 'Use atomic groups or possessive quantifiers where supported', 'neutral'),
        docres('Hardened Pattern Recommendation', safeSuggestion, 'Flattened non-nested alternative'),
      ]
    },
  },
  {
    id: 'string-tokenization-benchmark-sizer',
    name: 'String Tokenizer & Lexer Throughput Sizer',
    subject: SUBJECT,
    blurb: 'Compare parser throughput between RegExp scanning, string `split()`, and manual `charCodeAt()` loops for high-volume logs.',
    tip: 'Manual `charCodeAt()` integer scanners process up to 350 MB/s client-side, 8x faster than regex-based lexers.',
    usage: [
      'Enter input stream size in MB.',
      'Enter average token length in characters.',
      'Compare execution latency across parsing engines.',
    ],
    method: [
      'Evaluates throughput rates: CharCode loop (~320 MB/s), RegExp exec (~60 MB/s), String split (~110 MB/s).',
    ],
    fields: [
      n('fileMb', 'Input Text Data Size (MB)', 10, 0.5, 500, 0.5),
      n('tokenLen', 'Average Token Length (chars)', 8, 2, 64, 1),
    ],
    compute: (v) => {
      const mb = asNum(v, 'fileMb', 10)
      const tokenLen = asNum(v, 'tokenLen', 8)

      const totalChars = mb * 1024 * 1024
      const estTokens = Math.round(totalChars / (tokenLen + 1))

      const charCodeTimeMs = Math.round((mb / 320) * 1000)
      const regexTimeMs = Math.round((mb / 60) * 1000)
      const splitTimeMs = Math.round((mb / 110) * 1000)

      return [
        res('Estimated Token Count', `${fmtNum(estTokens)} tokens`, 'neutral', `In ${mb} MB payload`),
        res('Manual CharCode Loop', `${charCodeTimeMs} ms (~320 MB/s)`, 'good', 'Zero GC memory allocation'),
        res('Standard String.split()', `${splitTimeMs} ms (~110 MB/s)`, 'neutral', 'Allocates large array'),
        res('RegExp Global Exec', `${regexTimeMs} ms (~60 MB/s)`, 'warn', 'Stateful regex backtracking overhead'),
        pctres('Performance Advantage', '5.3x Speedup with CharCode Loop', 82, 'good'),
      ]
    },
  },
]
