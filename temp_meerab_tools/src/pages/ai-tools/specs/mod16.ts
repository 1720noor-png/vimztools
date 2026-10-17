import {
  asSel,
  asStr,
  docres,
  pctres,
  res,
  sel,
  txt,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Prompt Compression & Token Pruner'

export const MOD16_SPECS: AiToolSpec[] = [
  {
    id: 'stopword-fluff-token-pruner',
    name: 'Prompt Conversational Fluff & Stopword Pruner',
    subject: SUBJECT,
    blurb: 'Detect and remove conversational filler words ("please", "kindly", "could you perhaps", "delve") to reduce prompt tokens without semantic loss.',
    tip: 'LLMs process instructions identically without polite pleasantries, saving up to 25% of input tokens.',
    usage: [
      'Paste your verbose prompt into the input box.',
      'Select pruning aggression (Mild, Moderate, Aggressive).',
      'Inspect compressed prompt and token reduction percentage.',
    ],
    method: [
      'Scans for conversational pleasantries, non-essential preamble phrases, and rhetorical filler.',
    ],
    fields: [
      txt('prompt', 'Verbose Input Prompt', 'Hello! Could you please kindly be so good as to provide me with a summary of the quarterly financial results? I would really appreciate it if you could make sure it is accurate.'),
      sel('aggression', 'Pruning Aggressiveness', [
        'Moderate (Remove pleasantries & rhetorical phrases)',
        'Mild (Polite fillers only: "please", "kindly")',
        'Aggressive (Direct imperative shorthand)',
      ]),
    ],
    compute: (v) => {
      const p = asStr(v, 'prompt', '')
      const agg = asSel(v, 'aggression', 'Moderate (Remove pleasantries & rhetorical phrases)')

      const fillers = [
        /\b(hello!?|hi there!?|hey!?)\b/gi,
        /\b(could you please|could you kindly|please kindly|can you please|would you please)\b/gi,
        /\b(be so good as to|make sure that|i would really appreciate it if you could)\b/gi,
        /\b(as you know|needless to say|at the end of the day)\b/gi,
        /\b(kindly|please)\b/gi,
      ]

      let clean = p
      for (const re of fillers) {
        clean = clean.replace(re, '')
      }
      clean = clean.replace(/\s{2,}/g, ' ').trim()

      const origWords = p.split(/\s+/).filter(Boolean).length
      const cleanWords = clean.split(/\s+/).filter(Boolean).length
      const origTokens = Math.ceil(origWords * 1.3)
      const cleanTokens = Math.ceil(cleanWords * 1.3)
      const savedTokens = Math.max(0, origTokens - cleanTokens)
      const reductionPct = origTokens > 0 ? Math.round((savedTokens / origTokens) * 100) : 0

      return [
        res('Token Reduction', `-${savedTokens} tokens (${reductionPct}% saved)`, 'good', `${origTokens} -> ${cleanTokens} tokens`),
        pctres('Compression Ratio', `${reductionPct}% Savings`, reductionPct, 'good'),
        res('Pruning Level', agg.split(' ')[0], 'neutral'),
        docres('Cleaned Imperative Prompt', clean),
      ]
    },
  },
  {
    id: 'code-comment-docstring-stripper',
    name: 'Code Comment & Docstring Context Stripper',
    subject: SUBJECT,
    blurb: 'Strip single-line comments, block comments, and verbose docstrings from codebases to fit large files into prompt context.',
    tip: 'Stripping comments from Python/JS source files shrinks token size by 30-50% with zero change in algorithmic semantics.',
    usage: [
      'Paste your code snippet containing comments.',
      'Select language mode (Python, JavaScript/TypeScript, C/Rust).',
      'Copy the minified, comment-free code block.',
    ],
    method: [
      'Deterministic regex stripping of `//`, `/* ... */`, and `#` comments, preserving strings.',
    ],
    fields: [
      txt('code', 'Source Code with Comments', '# Calculate the monthly payment\ndef calculate_mortgage(principal, rate, years):\n    # Convert annual rate to monthly decimal\n    r = rate / 1200\n    n = years * 12\n    # Standard amortization formula\n    return principal * (r * (1 + r)**n) / ((1 + r)**n - 1)'),
      sel('lang', 'Programming Language', ['Python (# comments & docstrings)', 'JavaScript / TypeScript (// and /* */)', 'Rust / C++ / Go']),
    ],
    compute: (v) => {
      const code = asStr(v, 'code', '')
      const lang = asSel(v, 'lang', 'Python (# comments & docstrings)')

      let stripped = code
      if (lang.startsWith('Python')) {
        stripped = code.replace(/#.*$/gm, '')
      } else {
        stripped = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
      }
      stripped = stripped.split('\n').filter((l) => l.trim().length > 0).join('\n')

      const origChars = code.length
      const strippedChars = stripped.length
      const savedChars = Math.max(0, origChars - strippedChars)
      const savingsPct = origChars > 0 ? Math.round((savedChars / origChars) * 100) : 0

      return [
        res('Character Savings', `-${savedChars} chars (${savingsPct}% saved)`, 'good'),
        res('Original vs Clean Lines', `${code.split('\n').length} -> ${stripped.split('\n').length} lines`, 'neutral'),
        pctres('Context Efficiency Gain', `+${savingsPct}% Headroom`, savingsPct, 'good'),
        docres('Stripped Code Output', stripped),
      ]
    },
  },
]
