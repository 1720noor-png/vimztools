import { n, sel, txt, res, T, asNum, asSel, asStr, clamp, num } from '../../office/archetypes/spec'
import { sres, docr, qrres, barres } from './studentSpec'
import type { StudentSpec } from './studentSpec'

const SUBJECT = 'General & Quick Utilities'

const QR_BYTE_CAP: Record<'L' | 'M' | 'Q' | 'H', number[]> = {
  L: [17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858, 929, 1003, 1091, 1171, 1273, 1367, 1465, 1528, 1628, 1732, 1840, 1952, 2068, 2188, 2303, 2431, 2563, 2699, 2809, 2953],
  M: [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666, 711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331],
  Q: [11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482, 509, 565, 611, 661, 715, 751, 805, 868, 908, 982, 1030, 1112, 1168, 1228, 1283, 1351, 1423, 1499, 1579, 1663],
  H: [7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382, 403, 439, 461, 511, 535, 593, 625, 658, 698, 742, 790, 842, 898, 958, 983, 1051, 1093, 1139, 1219, 1273],
}

const EAN_L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const EAN_R = EAN_L.map((c) => c.replace(/[01]/g, (b) => (b === '0' ? '1' : '0')))
const EAN_G = EAN_R.map((c) => c.split('').reverse().join(''))
const EAN_PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']

function eanModules(digits: number[]): boolean[] {
  const bits: string[] = ['101']
  const first = digits[0]
  const parity = EAN_PARITY[first]
  for (let i = 1; i <= 6; i++) {
    bits.push(parity[i - 1] === 'L' ? EAN_L[digits[i]] : EAN_G[digits[i]])
  }
  bits.push('01010')
  for (let i = 7; i <= 12; i++) bits.push(EAN_R[digits[i]])
  bits.push('101')
  return bits.join('').split('').map((b) => b === '1')
}

const utf8Len = (s: string) => new TextEncoder().encode(s).length

function lines(v: string): string[] {
  return v
    .split(/\n|,|·/)
    .map((s) => s.trim())
    .filter(Boolean)
}

const TEXT = txt('txt', 'Your text', 8, 'Start typing or paste study notes here.')

export const mod01: StudentSpec[] = [
  {
    id: 'word-counter-general',
    name: 'Word Counter',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Counts every word, character, line and sentence in your text and estimates reading pace so you know exactly how long an essay, abstract or slide caption is.',
    tip: 'Most academic assignments have a word window (e.g. 1,800–2,200). Aim for 95% of the upper bound so revisions never push you over.',
    usage: [
      'Paste or type your text into the box.',
      'Choose the reading speed that matches your audience.',
      'Read the counts and the estimated reading time.',
    ],
    method: [
      'Words are split on whitespace and punctuation boundaries.',
      'Sentences are counted by terminal punctuation marks (. ! ?).',
      'Reading time divides words by the chosen words-per-minute.',
    ],
    fields: [TEXT, sel('wpm', 'Reading speed', ['Slow (180 wpm)', 'Average (230 wpm)', 'Fast (275 wpm)'], 'Average (230 wpm)')],
    compute: (v) => {
      const t = asStr(v.txt)
      const words = t.trim() ? t.trim().split(/\s+/).length : 0
      const chars = t.length
      const charsNoSp = t.replace(/\s/g, '').length
      const sentences = (t.match(/[.!?]+/g) || []).length
      const wpm = asSel(v.wpm) === 'Fast (275 wpm)' ? 275 : asSel(v.wpm) === 'Slow (180 wpm)' ? 180 : 230
      const mins = words / wpm
      const secs = Math.round((mins - Math.floor(mins)) * 60)
      return [
        sres('Total words', num(words), words > 0 ? T.good : T.neutral, sentences > 0 ? `${num(sentences)} sentences, ${num(words / Math.max(sentences, 1))} avg words per sentence` : undefined, words ? Math.min(100, words) : 0),
        sres('Characters', num(chars), T.neutral, `${num(charsNoSp)} without spaces (${words ? num((charsNoSp / words)) : 0} chars/word)`),
        res('Reading time', `${Math.floor(mins)} min ${secs} s`, words < 40 ? T.good : T.neutral),
        docr('Text preview', t.slice(0, 200) + (t.length > 200 ? '…' : '')),
      ]
    },
  },
  {
    id: 'character-counter',
    name: 'Character Counter',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Tracks total characters, characters without spaces, and unique words — essential for social bios, SMS limits and database fields with hard caps.',
    tip: 'When a field has a 160-character limit (SMS), leave a 10% safety margin so emojis and editors never silently truncate your message.',
    usage: [
      'Paste the text you need to measure.',
      'Note the with/without-space figures.',
      'Compare against your platform limit.',
    ],
    method: [
      'Characters include every symbol, space and newline.',
      'The no-space count strips all whitespace first.',
      'Unique words are lowercased and de-duplicated.',
    ],
    fields: [TEXT],
    compute: (v) => {
      const t = asStr(v.txt)
      const chars = t.length
      const noSp = t.replace(/\s/g, '').length
      const uniq = new Set(t.toLowerCase().split(/\s+/).filter(Boolean)).size
      const words = t.trim() ? t.trim().split(/\s+/).length : 0
      return [
        sres('Characters', num(chars), chars > 0 ? T.good : T.neutral, chars >= 150 ? 'Over the classic SMS limit — trim before sending' : undefined, chars ? charset(chars) : 0),
        sres('Without spaces', num(noSp), T.neutral),
        sres('Words', num(words), T.neutral),
        sres('Unique words', num(uniq), T.neutral, words ? `${num(Math.round((uniq / words) * 100))}% vocabulary diversity` : undefined),
      ]
      function charset(c: number) {
        return c > 5000 ? 100 : (c / 5000) * 100
      }
    },
  },
  {
    id: 'sentence-counter',
    name: 'Sentence Counter',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Splits your writing into sentences, reports average length and flags run-ons so paragraphs stay readable and scannable.',
    tip: 'Aim for a 15–20 word average. If your average climbs past 25, break longer sentences into two for stronger comprehension.',
    usage: [
      'Paste a paragraph, answer or abstract.',
      'Review the sentence-level breakdown.',
      'Rewrite any flagged run-on sentences.',
    ],
    method: [
      'Terminal punctuation (. ! ?) marks the end of a sentence.',
      'Average length = total words ÷ sentences.',
      'Run-ons are sentences over 40 words.',
    ],
    fields: [TEXT],
    compute: (v) => {
      const t = asStr(v.txt).trim()
      const parts = t.split(/(?<=[.!?])\s+/).filter(Boolean)
      const sentences = parts.length || (t ? 1 : 0)
      const words = t ? t.split(/\s+/).length : 0
      const avg = sentences ? words / sentences : 0
      const parsed = t.match(/[^.!?]+[.!?]*/g) || []
      const long = parsed.filter((s) => s.trim().split(/\s+/).length > 40).length
      return [
        sres('Sentences', num(sentences), T.good),
        sres('Average words / sentence', numD(avg), avg >= 15 && avg <= 22 ? T.good : avg > 25 ? T.bad : T.warn, 'Target range 15–22'),
        sres('Run-on sentences (>40 words)', num(long), long ? T.bad : T.good),
        docr('Sentence list', parts.length ? parts.map((p, i) => `${i + 1}. ${p}`).join('\n') : t),
      ]
      function numD(x: number) {
        return x.toFixed(1)
      }
    },
  },
  {
    id: 'reading-time-calculator',
    name: 'Reading Time Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb:
      'Estimates how long it takes to read any text at your chosen pace, with a separate projection for reading aloud.',
    tip: 'Allocate 1.5× your reading estimate when you need to take notes or highlight — passive reading is almost never as fast as people plan.',
    usage: [
      'Paste your draft or chapter.',
      'Pick a silent reading speed.',
      'Read the projected minutes for both modes.',
    ],
    method: [
      'Silent time = words ÷ silent words-per-minute.',
      'Out-loud time adds a slower read-aloud pace.',
      'Both are rounded to the nearest second.',
    ],
    fields: [TEXT, n('min', 'Reading speed (wpm)', { def: 230, min: 60, max: 600, step: 5 })],
    compute: (v) => {
      const t = asStr(v.txt).trim()
      const words = t ? t.split(/\s+/).length : 0
      const wpm = asNum(v.min) || 230
      const silent = (words / wpm) * 60
      const aloud = (words / (wpm * 0.55)) * 60
      const fmt = (s: number) => `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`
      return [
        sres('Words to read', num(words), words ? T.good : T.neutral),
        res('Silent reading', fmt(silent), T.good, `at ${wpm} wpm`),
        res('Reading aloud', fmt(aloud), T.warn, `at ${Math.round(wpm * 0.55)} wpm`),
        res('Estimated panellist pace', fmt(silent * 1.4), T.neutral, 'including note-taking buffer'),
      ]
    },
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Instant case transforms — uppercase, lowercase, title case, sentence case and alternating case — for titles, headings and citations.',
    tip: 'APA and MLA title case keep the first and last words capitalized, plus every major word. Copy the Title Case output for your reference list.',
    usage: [
      'Paste the words or headings to convert.',
      'Pick the case style you need.',
      'Copy the transformed output.',
    ],
    method: [
      'UPPERCASE / lowercase are direct transforms.',
      'Title case capitalizes words but keeps small focus words lower.',
      'Sentence case capitalizes only the first word.',
    ],
    fields: [TEXT, sel('cs', 'Target case', ['UPPERCASE', 'lowercase', 'Title Case', 'Sentence case', 'aLtErNaTiNg'], 'Title Case')],
    compute: (v) => {
      const t = asStr(v.txt)
      const c = asSel(v.cs)
      const small = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'vs', 'via'])
      let out = t
      if (c === 'UPPERCASE') out = t.toUpperCase()
      else if (c === 'lowercase') out = t.toLowerCase()
      else if (c === 'Title Case') {
        const words = t.split(/(\s+)/)
        out = words
          .map((w, i) => {
            if (!/\w/.test(w)) return w
            const lower = w.toLowerCase()
            const isFirst = /^\s*$/.test(words.slice(0, i).join('')) || words.slice(0, i).join('').trim() === ''
            const isLast = !words.slice(i + 1).some((x) => /\w/.test(x))
            return isFirst || isLast || !small.has(lower) ? w[0].toUpperCase() + w.slice(1).toLowerCase() : lower
          })
          .join('')
      } else if (c === 'Sentence case') {
        out = t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (m) => m.toUpperCase())
      } else {
        out = t
          .split('')
          .map((ch, i) => (i % 2 ? ch.toUpperCase() : ch.toLowerCase()))
          .join('')
      }
      return [docr(`${c} output`, out)]
    },
  },
  {
    id: 'text-cleaner',
    name: 'Text Cleaner',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Strips stray spaces, empty lines and artifacts from copied text — cleaning up web paste jobs before you submit any document.',
    tip: 'Run pasted lecture slides through this before studying: leftover page numbers and line breaks silently hurt flashcard quality.',
    usage: [
      'Paste text copied from any source.',
      'Choose the cleanup options you want.',
      'Copy the normalized version.',
    ],
    method: [
      'Collapses multiple spaces into single spaces.',
      'Removes blank lines and trims each line.',
      'Optionally drop URLs and non-ASCII artifacts.',
    ],
    fields: [TEXT, sel('mode', 'Cleanup level', ['Light (spaces + trim)', 'Medium (+ empty lines)', 'Aggressive (+ URLs)'], 'Medium (+ empty lines)')],
    compute: (v) => {
      const t = asStr(v.txt)
      const mode = asSel(v.mode)
      let out = t.replace(/[ \t]+/g, ' ')
      if (mode !== 'Light (spaces + trim)') out = out.replace(/\n{3,}/g, '\n\n')
      if (mode === 'Aggressive (+ URLs)') out = out.replace(/https?:\/\/\S+/g, '[URL]')
      const trimmed = out.split('\n').map((l) => l.trim()).join('\n').trim()
      return [
        sres('Whitespace removed', num((t.length - trimmed.length)) + ' chars', T.good),
        docr('Cleaned text', trimmed),
      ]
    },
  },
  {
    id: 'text-repeater',
    name: 'Text Repeater',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Repeats any snippet a chosen number of times with an optional separator — built for flashcards drills, keyword batches and practice lines.',
    tip: 'Use it to generate 50 repetitions of a formula line — then paste into flashcards for spaced-retrieval practice.',
    usage: [
      'Paste the line to repeat.',
      'Set the repeat count and separator.',
      'Copy the generated block.',
    ],
    method: [
      'The snippet is duplicated exactly N times.',
      'A separator is inserted between copies.',
      'Count is clamped to a safe maximum.',
    ],
    fields: [TEXT, n('cnt', 'Repeat count', { def: 5, min: 1, max: 100, step: 1 }), sel('sep', 'Separator', ['Line break', 'Comma + space', 'Space', 'None'], 'Line break')],
    compute: (v) => {
      const t = asStr(v.txt)
      const cnt = clamp(asNum(v.cnt), 1, 100)
      const sep = asSel(v.sep) === 'Comma + space' ? ', ' : asSel(v.sep) === 'Space' ? ' ' : asSel(v.sep) === 'None' ? '' : '\n'
      const joined = Array.from({ length: cnt }, () => t).join(sep)
      return [sres('Copies generated', num(cnt), T.good), docr('Repeated output', joined || '(empty input)')]
    },
  },
  {
    id: 'text-sorter',
    name: 'Text Sorter',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Sorts every line in your paste — alphabetical or reverse, by length or by numeric value — perfect for vocab lists and bibliographies.',
    tip: 'Sort your bibliography alphabetically here, then run Bibliography Alphabetizer to drop duplicates before final submission.',
    usage: [
      'Paste one item per line.',
      'Choose the sort key and direction.',
      'Copy the reordered list.',
    ],
    method: [
      'Lines are extracted and filtered to non-empty.',
      'The chosen comparator governs the order.',
      'Original line casing is preserved.',
    ],
    fields: [TEXT, sel('by', 'Sort by', ['Alphabetically (A–Z)', 'Alphabetically (Z–A)', 'By length (short first)', 'By length (long first)', 'Numeric value'], 'Alphabetically (A–Z)')],
    compute: (v) => {
      const arr = lines(asStr(v.txt))
      const by = asSel(v.by)
      const sorted = [...arr].sort((a, b) => {
        if (by === 'Alphabetically (Z–A)') return b.localeCompare(a)
        if (by === 'By length (short first)') return a.length - b.length
        if (by === 'By length (long first)') return b.length - a.length
        if (by === 'Numeric value') {
          const na = parseFloat(a)
          const nb = parseFloat(b)
          if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb
        }
        return a.localeCompare(b)
      })
      return [sres('Lines sorted', num(sorted.length), T.good), docr('Sorted list', sorted.join('\n'))]
    },
  },
  {
    id: 'duplicate-line-remover',
    name: 'Duplicate Line Remover',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Drops repeated lines while keeping first occurrence order — ideal for merging flashcard decks, vocab lists and citation sets.',
    tip: 'Run merged reference lists through this before alphabetizing; duplicate entries are the most common citation penalty.',
    usage: [
      'Paste the combined list.',
      'Choose case sensitivity.',
      'Copy the de-duplicated list.',
    ],
    method: [
      'Each line is added to a seen-set on first encounter.',
      'Later duplicates are skipped entirely.',
      'Optionally, case is normalized for matching.',
    ],
    fields: [TEXT, sel('case', 'Match handling', ['Case-sensitive', 'Case-insensitive'], 'Case-insensitive')],
    compute: (v) => {
      const arr = lines(asStr(v.txt))
      const ci = asSel(v.case) === 'Case-insensitive'
      const seen = new Set<string>()
      const out: string[] = []
      for (const l of arr) {
        const k = ci ? l.toLowerCase() : l
        if (seen.has(k)) continue
        seen.add(k)
        out.push(l)
      }
      const removed = arr.length - out.length
      return [
        sres('Unique lines', num(out.length), T.good, removed ? `${num(removed)} duplicates removed` : 'No duplicates found', out.length && arr.length ? Math.round((out.length / arr.length) * 100) : 0),
        docr('De-duplicated list', out.join('\n')),
      ]
    },
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Renders a real, scannable QR code for any text or URL and reports the exact version, module count and smallest print size that still scans.',
    tip: 'For print, keep the module size at 0.4 mm or larger and choose error-correction H if the code sits near page edges or on textured paper.',
    usage: [
      'Enter the URL, note or ID string.',
      'Pick how sturdy the code must be.',
      'Scan it, then use the sizing guidance before printing.',
    ],
    method: [
      'The payload is encoded in byte mode and the smallest QR version that fits is selected from the ISO/IEC 18004 capacity tables.',
      'Error-correction level trades capacity against the share of damage the code can absorb.',
      'Minimum print size scales with the module count of the chosen version.',
    ],
    fields: [txt('data', 'Payload to encode', 4, 'https://vimz.ai/students'), sel('ec', 'Error correction', ['Low (7%)', 'Medium (15%)', 'Quartile (25%)', 'High (30%)'], 'Quartile (25%)')],
    compute: (v) => {
      const d = asStr(v.data)
      const ecMap: Record<string, 'L' | 'M' | 'Q' | 'H'> = { 'Low (7%)': 'L', 'Medium (15%)': 'M', 'Quartile (25%)': 'Q', 'High (30%)': 'H' }
      const ec = ecMap[asSel(v.ec)] || 'Q'
      const ecLabel = asSel(v.ec)
      if (!d.trim()) return [sres('QR code', 'Enter a payload first', T.warn, 'any text works — a URL, a Wi-Fi note, an ID, a set of coordinates')]
      const bytes = utf8Len(d)
      const cap = QR_BYTE_CAP[ec]
      let version = cap.findIndex((c) => bytes <= c)
      const tooLong = version < 0
      if (tooLong) version = cap.length - 1
      const capacity = cap[version]
      const fits = bytes <= capacity
      const fallbackEc = (Object.keys(QR_BYTE_CAP) as ('L' | 'M' | 'Q' | 'H')[]).find((k) => QR_BYTE_CAP[k][39] >= bytes)
      const modules = 17 + 4 * (version + 1)
      const quiet = modules + 8
      const minMm = Math.ceil(modules * 0.4)
      const safeMm = Math.ceil(modules * 0.6)
      return [
        qrres('QR code', fits ? 'Ready to scan' : 'Payload too long for any QR version', d, ec, fits ? T.good : T.bad, fits ? 'scan the code with any phone camera' : `max ${num(capacity)} bytes at error correction ${ec}`),
        sres('Payload size', `${num(bytes)} of ${num(capacity)} bytes`, fits ? T.good : T.bad, fits ? `${num(capacity - bytes)} bytes of headroom` : 'shorten the payload or lower the error correction', (bytes / capacity) * 100),
        sres('Smallest version in byte mode', `Version ${version + 1}${fits ? '' : ' (does not fit)'}`, fits ? T.neutral : T.bad, `${modules}×${modules} modules plus a 4-module quiet zone on every side`),
        res('Minimum print size', `${minMm} × ${minMm} mm`, fits ? T.good : T.warn, `${num(quiet)} × ${num(quiet)} modules including the quiet zone; ${safeMm} mm is safer for print`),
        res('Error correction', ecLabel, fits ? T.neutral : T.warn, `${ec} recovers ${ec === 'L' ? '7' : ec === 'M' ? '15' : ec === 'Q' ? '25' : '30'}% of the code if part of it is damaged${tooLong && fallbackEc ? ` — switch to ${fallbackEc} to fit ${num(bytes)} bytes` : ''}`),
        docr('Payload preview', d),
      ]
    },
  },
  {
    id: 'barcode-generator-general',
    name: 'Barcode Generator',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Renders a real EAN-13 / ISBN-13 barcode, verifies the check digit and prints the exact 95-module pattern for lab-kit labels and ID badges.',
    tip: 'EAN-13 also works for ISBNs: keep the 13-digit sequence intact and let the calculator verify the final check digit before printing.',
    usage: [
      'Enter a 12- or 13-digit product/ISBN number, or a 10-digit ISBN.',
      'Review the check-digit verification.',
      'Scan the barcode, then use the validated sequence for printing.',
    ],
    method: [
      'EAN-13 check digit alternates weights 1 and 3.',
      'Digits are summed and subtracted from the next multiple of 10.',
      'The 95-module pattern is built from the standard L, G and R digit tables with the first-digit parity pattern.',
    ],
    fields: [txt('num', 'Number sequence', 1, '890123456789')],
    compute: (v) => {
      const rawIn = asStr(v.num).replace(/[\s-]/g, '')
      const isIsbn10 = rawIn.length === 10 && /^(\d{9}[\dXx])$/.test(rawIn)
      let base = rawIn
      let converted = ''
      if (isIsbn10) {
        const core = rawIn.slice(0, 9)
        const sum = core.split('').reduce((a, c, i) => a + Number(c) * (10 - i), 0)
        const cd = (11 - (sum % 11)) % 11
        base = `978${core}`
        converted = `ISBN-10 → ISBN-13 with the 978 prefix; check digit ${cd === 10 ? 'X' : cd}`
      }
      const raw = base.replace(/\D/g, '')
      const valid = raw.length === 12 || raw.length === 13
      let check = -1
      if (valid) {
        const digits = raw.slice(0, 12).split('').map(Number)
        const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0)
        check = (10 - (sum % 10)) % 10
      }
      const full = valid ? (raw.length === 12 ? raw + check : raw) : ''
      const mismatch = valid && raw.length === 13 && Number(raw[12]) !== check
      if (!valid || mismatch) {
        return [
          sres('Barcode', mismatch ? `Check digit is wrong (should be ${check})` : 'Enter 12 or 13 digits', T.bad, mismatch ? `the sequence you typed is ${raw}` : `you typed ${num(raw.length)} digits`),
          res('Corrected sequence', valid ? full : '—', valid ? T.good : T.neutral, 'the version with the right check digit appended'),
          res('First digit', valid ? String(Number(raw[0])) : '—', T.neutral, 'selects the left-hand parity pattern'),
        ]
      }
      const digits = full.split('').map(Number)
      const modules = eanModules(digits)
      const art = (() => {
        const rows: string[] = []
        for (let i = 0; i < modules.length; i += 30) {
          rows.push(modules.slice(i, i + 30).map((b) => (b ? '█' : ' ')).join(''))
        }
        return rows.join('\n')
      })()
      return [
        barres('Barcode', `${full} (EAN-13)`, modules, `${full[0]}  ${full.slice(1, 7)}  ${full.slice(7)}`, T.good, `${modules.length} modules: 101 + left parity block + 01010 centre guard + right block + 101`),
        sres('Check digit', `${check} ✓`, T.good, 'weighted sum with alternating 1s and 3s, next multiple of 10'),
        res('Validated sequence', full, T.good, isIsbn10 ? converted : 'first 12 digits weighted 1,3,1,3… then the check digit'),
        res('First digit', String(digits[0]), T.neutral, `parity pattern ${EAN_PARITY[digits[0]].replace(/L/g, 'L·').replace(/G/g, 'G·')} selects L (odd) or G (even) encoding for the left-hand digits`),
        docr('Module pattern (one character per module)', art),
      ]
    },
  },
  {
    id: 'base64-encoder-decoder-general',
    name: 'Base64 Encoder/Decoder',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Encodes text into base64 or reverses it back to plain text — handy for embedding snippets into query strings and data URLs.',
    tip: 'Base64 inflates data by ~33%. Never pack your full essay into a URL string — use it for short tokens and keys only.',
    usage: [
      'Paste the text or base64 block.',
      'Choose encode or decode.',
      'Copy the converted output.',
    ],
    method: [
      'Encode maps UTF-8 bytes into a 64-character alphabet.',
      'Decode reverses the mapping and reassembles bytes.',
      'Non-text input falls back to a safe error message.',
    ],
    fields: [txt('data', 'Input text / base64', 5, 'Hello, students!'), sel('dir', 'Direction', ['Encode → Base64', 'Decode → Text'], 'Encode → Base64')],
    compute: (v) => {
      const d = asStr(v.data)
      const enc = asSel(v.dir) === 'Encode → Base64'
      let out = ''
      let err = ''
      try {
        out = enc
          ? btoa(unescape(encodeURIComponent(d)))
          : decodeURIComponent(escape(atob(d.replace(/\s/g, ''))))
      } catch {
        err = 'Could not decode — input is not valid base64 text.'
      }
      const ok = !err
      return [
        sres(enc ? 'Encoded base64' : 'Decoded text', out || err, ok ? T.good : T.bad),
        sres(enc ? 'Size change' : 'Result length', enc ? `+${Math.round(((out.length - d.length) / Math.max(d.length, 1)) * 100)}%` : num(out.length) + ' chars', T.neutral),
      ]
    },
  },
  {
    id: 'binary-converter',
    name: 'Binary Converter',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Turns text into an 8-bit binary stream and back again — perfect for understanding how data is stored in memory.',
    tip: 'Each character is 8 bits (1 byte). A 10-char word is 80 bits — roughly your textbook page in reverse engineering terms.',
    usage: [
      'Type or paste the message.',
      'Choose text → binary or binary → text.',
      'Copy the byte stream.',
    ],
    method: [
      'Each Unicode character is converted via its code point.',
      'Code points are padded to full 8-bit bytes.',
      'Decode reverses byte by byte.',
    ],
    fields: [txt('data', 'Text or binary', 4, 'Binary rocks'), sel('dir', 'Direction', ['Text → Binary', 'Binary → Text'], 'Text → Binary')],
    compute: (v) => {
      const d = asStr(v.data)
      const toBin = asSel(v.dir) === 'Text → Binary'
      let out = ''
      try {
        if (toBin) {
          out = Array.from(d)
            .map((ch) => ch.charCodeAt(0).toString(2).padStart(8, '0'))
            .join(' ')
        } else {
          const bytes = d.trim().split(/\s+/).filter(Boolean)
          out = bytes
            .map((b) => String.fromCharCode(parseInt(b, 2)))
            .join('')
        }
      } catch {
        out = '(invalid binary input)'
      }
      const ok = out && !out.startsWith('(invalid')
      return [
        sres('Byte length', toBin ? num(d.length) + ' bytes' : num(out.length) + ' chars', ok ? T.good : T.bad, toBin ? `${num(d.length * 8)} bits total` : undefined),
        docr(toBin ? 'Binary stream' : 'Decoded text', out),
      ]
    },
  },
  {
    id: 'decimal-binary-hex-converter',
    name: 'Decimal/Binary/Hex Converter',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Converts a number between decimal, binary and hexadecimal with a step-by-step remainder walkthrough for the binary form.',
    tip: 'The remainders from repeated division by 2, read bottom-up, ARE the binary answer — check your work by converting back.',
    usage: [
      'Enter a value in any supported base.',
      'Pick the source base.',
      'Read all three equivalent forms.',
    ],
    method: [
      'parseInt reads the source string in its base.',
      'toString(2) and toString(16) render the target bases.',
      'The remainder chain explains the conversion.',
    ],
    fields: [txt('value', 'Value to convert', 1, '255'), sel('base', 'Input base', ['Decimal (10)', 'Binary (2)', 'Hex (16)'], 'Decimal (10)')],
    compute: (v) => {
      const raw = asStr(v.value).trim()
      const base = asSel(v.base) === 'Binary (2)' ? 2 : asSel(v.base) === 'Hex (16)' ? 16 : 10
      const parsed = parseInt(raw, base)
      const ok = Number.isFinite(parsed) && parsed >= 0
      if (!ok) return [res('Result', 'Enter a valid number for the selected base', T.bad)]
      const rems: string[] = []
      let x = parsed
      while (x > 0) {
        rems.push(String(x % 2))
        x = Math.floor(x / 2)
      }
      return [
        sres('Decimal', num(parsed), T.good),
        res('Binary', parsed.toString(2), T.neutral),
        res('Hex', parsed.toString(16).toUpperCase(), T.neutral),
        docr('Binary remainder steps', (rems.length ? rems : ['0']).reverse().join(' → ') + ' (read bottom-up)'),
      ]
    },
  },
  {
    id: 'unit-converter-general',
    name: 'Unit Converter',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'A general-purpose converter covering data size, speed, volume and area — the everyday units that trip up lab reports.',
    tip: 'Write your factor down before converting: value × (to factor ÷ from factor). Keeping the unit in the side of the equation prevents sign errors.',
    usage: [
      'Pick a measurement family.',
      'Enter the value and source unit.',
      'Read the converted result.',
    ],
    method: [
      'Each family stores a factor to a base unit.',
      'The value is converted via ratio of factors.',
      'The result is formatted with sensible precision.',
    ],
    fields: [
      n('val', 'Value', { def: 1, min: 0, step: 0.1 }),
      sel('from', 'From unit', ['KB', 'MB', 'GB', 'TB', 'PB', 'km/h', 'm/s', 'mph', 'knot', 'L', 'mL', 'm³', 'gal', 'fl oz', 'm²', 'cm²', 'km²', 'acre', 'ft²'], 'MB'),
      sel('to', 'To unit', ['KB', 'MB', 'GB', 'TB', 'PB', 'km/h', 'm/s', 'mph', 'knot', 'L', 'mL', 'm³', 'gal', 'fl oz', 'm²', 'cm²', 'km²', 'acre', 'ft²'], 'GB'),
    ],
    compute: (v) => {
      const unit: Record<string, number> = {
        KB: 1000, MB: 1e6, GB: 1e9, TB: 1e12, PB: 1e15,
        'km/h': 0.2777778, 'm/s': 1, mph: 0.44704, knot: 0.5144444,
        L: 1, mL: 0.001, 'm³': 1000, gal: 3.78541, 'fl oz': 0.0295735,
        'm²': 1, 'cm²': 0.0001, 'km²': 1e6, acre: 4046.86, 'ft²': 0.092903,
      }
      const from = asSel(v.from) || 'MB'
      const to = asSel(v.to) || 'GB'
      const f = unit[from] ?? 1
      const t = unit[to] ?? 1
      const raw = (asNum(v.val) * f) / t
      const shown = raw >= 1000 || raw <= 0.001 ? raw.toExponential(3) : raw.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
      return [
        sres(`${from} → ${to}`, `${shown} ${to}`, T.good, `1 ${from} = ${(f / t).toFixed(4)} ${to}`, 0),
        res('Factor used', `${from} × ${f} ÷ ${t}`, T.neutral),
      ]
    },
  },
  {
    id: 'temperature-converter',
    name: 'Temperature Converter',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Converts between Celsius, Fahrenheit and Kelvin with the exact formulas shown — for chemistry experiments and physics reports.',
    tip: 'Celsius and Kelvin differ only by 273.15 — never by a multiplier. If your experiment reads 0 °C, that is 273.15 K.',
    usage: [
      'Enter a temperature value.',
      'Select the source scale.',
      'Read all three scale equivalents.',
    ],
    method: [
      'C = (F − 32) × 5/9 and K = C + 273.15.',
      'All three are derived from a single input.',
      'Values are rounded to 2 decimals.',
    ],
    fields: [n('val', 'Temperature', { def: 25, step: 0.1 }), sel('scale', 'Input scale', ['Celsius', 'Fahrenheit', 'Kelvin'], 'Celsius')],
    compute: (v) => {
      const s = asNum(v.val)
      const k = asSel(v.scale) === 'Fahrenheit' ? (s - 32) * (5 / 9) + 273.15 : asSel(v.scale) === 'Kelvin' ? s : s + 273.15
      const c = k - 273.15
      const f = c * (9 / 5) + 32
      return [
        sres('Celsius', c.toFixed(2) + ' °C', T.good),
        sres('Fahrenheit', f.toFixed(2) + ' °F', T.neutral),
        sres('Kelvin', k.toFixed(2) + ' K', k < 0 ? T.bad : T.neutral, k < 0 ? 'Below absolute zero — impossible' : undefined),
      ]
    },
  },
  {
    id: 'length-converter',
    name: 'Length Converter',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Converts between metric and imperial lengths — millimetres to miles — for engineering drawings and geography problems.',
    tip: 'Remember 1 inch = 25.4 mm exactly. Anchor imperial measurements to that single constant and every conversion stays consistent.',
    usage: [
      'Enter a length value.',
      'Choose the source unit.',
      'Read the metric and imperial equivalents.',
    ],
    method: [
      'Every unit stores a factor in metres.',
      'Conversion divides by source factor, multiplies by target.',
      'Metric and imperial outputs are both shown.',
    ],
    fields: [n('val', 'Length', { def: 1, step: 0.01 }), sel('unit', 'Input unit', ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'], 'm')],
    compute: (v) => {
      const f: Record<string, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 }
      const meters = asNum(v.val) * (f[asSel(v.unit)] ?? 1)
      const r = (x: number) => (Math.abs(x) >= 10000 || (Math.abs(x) > 0 && Math.abs(x) < 0.001) ? x.toExponential(3) : x.toFixed(4).replace(/0+$/, '').replace(/\.$/, ''))
      return [
        sres('Metres', r(meters) + ' m', T.good),
        sres('Centimetres', r(meters * 100) + ' cm', T.neutral),
        sres('Feet', r(meters / 0.3048) + ' ft', T.neutral),
        sres('Inches', r(meters / 0.0254) + ' in', T.neutral),
        res('Kilometres', r(meters / 1000) + ' km', T.neutral),
        res('Miles', r(meters / 1609.344) + ' mi', T.neutral),
      ]
    },
  },
  {
    id: 'weight-converter',
    name: 'Weight Converter',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Converts mass between metric and imperial units — grams to tonnes, ounces to stones — for chemistry and nutrition calculations.',
    tip: 'Mass (kg) is not weight (N). When a problem says “weight” but gives kg, multiply by 9.8 m/s² to solve physics versions.',
    usage: [
      'Enter a mass value.',
      'Choose the input unit.',
      'Read the converted equivalents.',
    ],
    method: [
      'Each unit maps to its kilogram factor.',
      'Conversion is a single factor ratio.',
      'Both small and large units are shown.',
    ],
    fields: [n('val', 'Mass', { def: 1, step: 0.01 }), sel('unit', 'Input unit', ['mg', 'g', 'kg', 't', 'oz', 'lb', 'st'], 'kg')],
    compute: (v) => {
      const f: Record<string, number> = { mg: 1e-6, g: 0.001, kg: 1, t: 1000, oz: 0.02834952, lb: 0.45359237, st: 6.35029318 }
      const kg = asNum(v.val) * (f[asSel(v.unit)] ?? 1)
      const r = (x: number) => (Math.abs(x) >= 10000 || (Math.abs(x) > 0 && Math.abs(x) < 0.001) ? x.toExponential(3) : x.toFixed(4).replace(/0+$/, '').replace(/\.$/, ''))
      return [
        sres('Kilograms', r(kg) + ' kg', T.good),
        sres('Pounds', r(kg / 0.45359237) + ' lb', T.neutral),
        sres('Grams', r(kg * 1000) + ' g', T.neutral),
        sres('Ounces', r(kg / 0.02834952) + ' oz', T.neutral),
        res('Stone', r(kg / 6.35029318) + ' st', T.neutral),
        res('Tonnes', r(kg / 1000) + ' t', T.neutral),
      ]
    },
  },
  {
    id: 'time-converter',
    name: 'Time Converter',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Converts durations between milliseconds, seconds, minutes, hours, days and years — for study logs, lab timers and decay problems.',
    tip: 'For multi-unit answers split the total into hours + minutes + seconds — an examiner-friendly format that shows you understand remainders.',
    usage: [
      'Enter a duration and its unit.',
      'Read the value in every other unit.',
      'See the broken-down clock format too.',
    ],
    method: [
      'All inputs normalize to seconds.',
      'Each unit divides by the seconds factor.',
      'The clock breakdown derives from the seconds total.',
    ],
    fields: [n('val', 'Duration', { def: 90, step: 1 }), sel('unit', 'Input unit', ['ms', 's', 'min', 'h', 'day', 'year'], 'min')],
    compute: (v) => {
      const f: Record<string, number> = { ms: 0.001, s: 1, min: 60, h: 3600, day: 86400, year: 31557600 }
      const secs = asNum(v.val) * (f[asSel(v.unit)] ?? 1)
      const days = Math.floor(secs / 86400)
      const h = Math.floor((secs % 86400) / 3600)
      const m = Math.floor((secs % 3600) / 60)
      const s = Math.round(secs % 60)
      return [
        sres('Seconds', secs.toFixed(1) + ' s', T.good),
        res('Minutes', (secs / 60).toFixed(2) + ' min', T.neutral),
        res('Hours', (secs / 3600).toFixed(3) + ' h', T.neutral),
        res('Days', (secs / 86400).toFixed(4) + ' days', T.neutral),
        res('Broken down', `${days}d ${h}h ${m}m ${s}s`, T.neutral),
      ]
    },
  },
]