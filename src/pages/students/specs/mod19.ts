import { n, sel, txt, ck, res, T, asNum, asSel, asStr, asBoolList, clamp, num } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Memory & Learning'

const STOP = new Set(
  ('a an the and or but if then than that this these those of in on at to for from by with without as is are was were be been being it its we you they he she i my your our their his her them us do does did done have has had not no so such can could should would may might must will shall about into over under between during before after above below up down out off again further once here there when where why how all any both each few more most other some only own same too very just now also per via etc use used using make makes made get gets got one two three first second next last new old good best better what which who whom whose there here when where why how all any both each few more most other some only own such very quite rather almost always never often sometimes usually already still yet ever').split(' '),
)

const NUM_WORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty']

const LETTER_SOUND: Record<string, string> = {
  a: 'AYE', b: 'BEE', c: 'SEE', d: 'DEE', e: 'EE', f: 'EFF', g: 'GEE', h: 'AITCH', i: 'I',
  j: 'JAY', k: 'KAY', l: 'ELL', m: 'EM', n: 'EN', o: 'OH', p: 'PEE', q: 'CUE', r: 'AR',
  s: 'ESS', t: 'TEE', u: 'YOU', v: 'VEE', w: 'DOUBLE-U', x: 'EX', y: 'WHY', z: 'ZEE',
}

const GREEK: Record<string, string> = {
  alpha: 'ALPHA', beta: 'BETA', gamma: 'GAMMA', delta: 'DELTA', epsilon: 'EPSILON', zeta: 'ZETA',
  eta: 'ETA', theta: 'THETA', iota: 'IOTA', kappa: 'KAPPA', lambda: 'LAMBDA', mu: 'MU', nu: 'NU',
  xi: 'XI', pi: 'PI', rho: 'RHO', sigma: 'SIGMA', tau: 'TAU', phi: 'PHI', chi: 'CHI', psi: 'PSI',
  omega: 'OMEGA', Delta: 'DELTA', Sigma: 'SIGMA', Omega: 'OMEGA', Phi: 'PHI', Theta: 'THETA',
}

const VAR_HINT: Record<string, string> = {
  m: 'mass, or slope', v: 'velocity or volume', a: 'acceleration or area', F: 'force',
  E: 'energy or modulus', I: 'current or moment of inertia', T: 'period or temperature',
  R: 'resistance or radius', r: 'radius or rate', k: 'spring constant or rate',
  l: 'length or inductance', t: 'time', h: 'height or Planck constant',
  P: 'power or pressure', p: 'momentum or pressure', W: 'work or weight',
  Q: 'heat or charge', C: 'heat capacity or capacitance', V: 'volume or voltage',
  n: 'amount or number density', N: 'count or Avogadro number', x: 'position or the unknown',
  c: 'speed of light or concentration', d: 'distance or differential', q: 'charge or flow rate',
  L: 'inductance or length', S: 'entropy or area', f: 'frequency or friction',
  g: 'acceleration due to gravity or conductance', B: 'magnetic field', j: 'current density',
  w: 'angular frequency or work', W0: 'reference work', y: 'the unknown, or ordinate',
}

const MATS = ['Definitions and vocabulary', 'Formulas and calculations', 'Arguments and essays', 'Facts and lists', 'Diagrams and processes', 'Code and syntax']

const STATES = ['Never seen it', 'Recognise it, cannot recall it', 'Can recall it with notes open', 'Can recall it cold, cannot apply it', 'Can apply it, forget the details']

const CHANS = [
  { name: 'Handwritten longhand', mech: 'motor encoding and forced selection, which slows you down enough to filter', best: 'Definitions and vocabulary', best2: 'Facts and lists' },
  { name: 'Typed summaries', mech: 'fast to edit and to search, cheap to produce, easy to skim later', best: 'Arguments and essays', best2: 'Code and syntax' },
  { name: 'Recorded explanation', mech: 'forces you to reconstruct the reasoning out loud in your own words', best: 'Formulas and calculations', best2: 'Arguments and essays' },
  { name: 'Diagrams and sketches', mech: 'a second representation of the same relation, so a cue can be spatial', best: 'Diagrams and processes', best2: 'Formulas and calculations' },
  { name: 'Explaining to another person', mech: 'teaching forces the gaps in your own understanding into the open', best: 'Formulas and calculations', best2: 'Code and syntax' },
  { name: 'Highlighting while reading', mech: 'selection only, no elaboration, so it stores almost nothing on its own', best: 'none', best2: 'none' },
]

function lines(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.replace(/\r$/, '').trim())
    .filter((l) => l.length > 0)
}

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9'\- ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function content(s: string): string[] {
  return words(s).filter((w) => !STOP.has(w) && w.length >= 4)
}

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 3) return 1
  const g = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').match(/[aeiouy]{1,2}/g)
  return Math.max(1, g ? g.length : 1)
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function shuffled<T>(arr: T[], seed: string): T[] {
  let a = hash(seed) || 1
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    const j = Math.floor(((t ^ (t >>> 14)) >>> 0) / 4294967296 * (i + 1))
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return out
}

const CAPS: StudentSpec[] = [
  {
    id: 'spaced-repetition-planner-memory',
    name: 'Spaced Repetition Planner',
    archetype: 'timeline',
    subject: SUBJECT,
    blurb: 'Dates every review of every item using the forgetting curve, then checks whether your daily minutes can actually carry the plan.',
    tip: 'Spacing only works if the gaps expand. The same gap every day is not spaced practice, it is just repetition with extra steps.',
    usage: ['List the items, one per line.', 'Set how many new items you can take on and how long a review lasts.', 'Read the dated schedule and the load report.'],
    method: ['Each item starts from a stability set by its difficulty.', 'Every gap is the stability multiplied by your retention target on the forgetting curve.', 'Reviews are dated, totalled and compared against your session length.'],
    fields: [
      txt('items', 'Items (one per line)', 12, 'Cranial nerve functions\nKrebs cycle intermediates\nRivers of China\nCauses of the 2008 crisis\nThree properties of an ideal gas\nStages of the cell cycle'),
      n('daily', 'New items per day', { def: 3, min: 1, max: 30, step: 1 }),
      n('mins', 'Minutes per review session', { def: 20, min: 5, max: 180, step: 5 }),
      sel('target', 'Retention target', ['90%', '95%', '97%', '99%'], '95%'),
      sel('difficulty', 'How well do you know these?', ['Mostly known', 'Mixed', 'Mostly new'], 'Mixed'),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.items))
      if (raw.length < 1) return [sres('Planner', 'Add at least one item first', T.warn, 'one item per line', 5)]
      const want = clamp(parseFloat(asSel(v.target)) || 95, 80, 99)
      const mult = Math.log(want / 100) / Math.log(0.9)
      const diffSel = asSel(v.difficulty)
      const base = diffSel === 'Mostly known' ? 4 : diffSel === 'Mostly new' ? 1.2 : 2.2
      const growth = diffSel === 'Mostly known' ? 2.8 : diffSel === 'Mostly new' ? 1.9 : 2.3
      const perDay = clamp(Math.round(asNum(v.daily)) || 3, 1, 30)
      const session = clamp(Math.round(asNum(v.mins)) || 20, 5, 180)
      const perReviewMin = 0.6
      const perNewMin = 1.5
      const steps = 6
      const horizon = 60
      const inter: number[] = []
      for (let k = 0; k < steps; k++) inter.push(Math.max(1, Math.round(base * mult * Math.pow(growth, k))))
      const load = new Map<number, number>()
      const news = new Map<number, number>()
      const rows: string[] = []
      const realMarks: number[][] = []
      raw.forEach((item, idx) => {
        const day0 = Math.floor(idx / perDay) + 1
        news.set(day0, (news.get(day0) || 0) + 1)
        let day = day0
        const marks: number[] = []
        for (let k = 0; k < steps; k++) {
          day += inter[k]
          if (day <= horizon) {
            load.set(day, (load.get(day) || 0) + 1)
            marks.push(inter[k])
          }
        }
        realMarks.push(marks)
        const shown = marks.length ? marks.map((m) => '+' + m).join('  ') : 'all reviews fall beyond day ' + horizon + ' - re-plan from the first three'
        rows.push('day ' + String(day0).padStart(2, '0') + '  ' + item.slice(0, 44).padEnd(44) + '  ' + shown)
      })
      const fullSpan = inter.reduce((s, x) => s + x, 0)
      const thirdReview = inter[0] + inter[1] + inter[2]
      const lastDay = load.size ? Math.max.apply(null, Array.from(load.keys())) : 0
      const dayRows: string[] = []
      let peakMin = 0
      let peakDay = 0
      let totalMin = 0
      const upto = Math.min(lastDay, 120)
      for (let d = 1; d <= upto; d++) {
        const rv = load.get(d) || 0
        const nw = news.get(d) || 0
        if (rv === 0 && nw === 0) continue
        const mins = rv * perReviewMin + nw * perNewMin
        totalMin += mins
        if (mins > peakMin) {
          peakMin = mins
          peakDay = d
        }
        dayRows.push('day ' + String(d).padStart(3, '0') + '   new ' + String(nw).padStart(2) + '   reviews ' + String(rv).padStart(3) + '   ~' + num(mins, 0) + ' min')
      }
      const avgMin = dayRows.length ? totalMin / dayRows.length : 0
      const newDays = Math.ceil(raw.length / perDay)
      const over = peakMin > session
      const safeDaily = over ? Math.max(1, Math.floor((perDay * session) / Math.max(1, peakMin))) : perDay
      return [
        sres('Retention target', want + '%', T.neutral, 'every gap is multiplied by ' + num(mult, 2) + 'x, so a higher target means shorter gaps', clamp(100 - (want - 90) * 7, 5, 100)),
        sres('Realistic plan', '3 reviews by day ' + num(thirdReview, 0), thirdReview <= 45 ? T.good : T.warn, 'the first three reviews do most of the work and land by day ' + num(thirdReview, 0) + '. Intervals beyond that (' + num(fullSpan, 0) + ' days for all six) are aspirational - re-plan once you have passed three reviews.', clamp(100 - Math.max(0, thirdReview - 45) * 2, 5, 100)),
        sres('Items covered', num(raw.length, 0) + ' items', T.good, num(newDays, 0) + ' days of new material at ' + perDay + ' per day', clamp((1 / newDays) * 100, 5, 100)),
        sres('Load inside ' + horizon + ' days', num(lastDay, 0) ? 'last review on day ' + num(lastDay, 0) : 'no reviews yet', T.neutral, 'reviews scheduled only inside the ' + horizon + '-day horizon, so the daily load below is what you would actually face'),
        sres('Peak day', num(peakMin, 0) + ' min on day ' + num(peakDay, 0), over ? T.warn : T.good, over ? num(peakMin - session, 0) + ' min over your ' + num(session, 0) + ' min session. Cut new items to ' + num(safeDaily, 0) + ' per day and it fits.' : 'fits inside your ' + num(session, 0) + ' min session', clamp(100 - Math.max(0, (peakMin / Math.max(1, session) - 1) * 100), 5, 100)),
        sres('Average day', num(avgMin, 0) + ' min', avgMin > session ? T.warn : T.good, 'across ' + num(dayRows.length, 0) + ' working days, counting new items at ' + num(perNewMin, 1) + ' min and each review at ' + num(perReviewMin, 1) + ' min', clamp(Math.min(100, (session / Math.max(0.1, avgMin)) * 100), 5, 100)),
        docr('Review schedule', rows.join('\n')),
        docr('Daily load', dayRows.length ? dayRows.join('\n') : 'nothing to review'),
        res('Expand the gaps', 'if you keep the same gap every time, the effort curve never flattens and you are still cramming, just slowly. Gaps should roughly double at each successful review.', T.good),
        res('The first three reviews do the work', 'most of the forgetting happens early. Reviewing on day 1, 3 and 7 does more for final retention than the same total time spread evenly across ten reviews.', T.warn),
        res('Interleave, do not block', 'review a mix of subjects in the same sitting. Blocking all the biology and then all the history feels efficient and is measurably worse for the exam.', T.neutral),
      ]
    },
  },
  {
    id: 'memory-quiz-generator-memory',
    name: 'Memory Quiz Generator',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb: 'Turns question and answer pairs into a real quiz with distractors drawn from your own material, plus an answer key and a self-marking protocol.',
    tip: 'Distractors taken from your own notes make the quiz much harder than invented wrong answers, and much more useful, because you have to know which of your own ideas is the right one.',
    usage: ['Enter facts as question | answer, one per line.', 'Pick the format and how many questions you want.', 'Answer before you look, then score it honestly.'],
    method: ['Lines are split into question and answer pairs.', 'Distractors are sampled from your other answers.', 'A deterministic shuffle keeps the quiz stable for the same input.'],
    fields: [
      txt('facts', 'Facts as question | answer', 14, 'Which nerve supplies the muscles of facial expression? | The facial nerve, CN VII\nWhat is the resting membrane potential of a neurone? | About -70 mV\nName the four classical macronutrients of plant nutrition | Nitrogen, phosphorus, potassium, calcium\nWhich treaty ended the Thirty Years War? | The Peace of Westphalia, 1648'),
      sel('format', 'Question format', ['Multiple choice', 'True or false', 'Fill the gap', 'Short answer'], 'Multiple choice'),
      n('count', 'Questions to produce', { def: 8, min: 2, max: 30, step: 1 }),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.facts))
      const facts: { q: string; a: string }[] = []
      const loose: string[] = []
      raw.forEach((l) => {
        const m = l.split(/\s*\|\s*/)
        if (m.length >= 2 && m[0].trim().length > 0) facts.push({ q: m[0].trim(), a: m.slice(1).join(' | ').trim() })
        else loose.push(l.replace(/^\s*[-*]\s*/, '').trim())
      })
      if (facts.length < 2) {
        return [sres('Quiz', 'Add at least two "question | answer" lines', T.warn, 'separate the question from the answer with a vertical bar', 10)]
      }
      const format = asSel(v.format)
      const want = clamp(Math.round(asNum(v.count)) || 8, 2, 30)
      const pool = shuffled(facts, 'quiz-' + facts.length + '-' + want)
      const used = pool.slice(0, want)
      const body: string[] = []
      const key: string[] = []
      let thinDistractors = 0
      used.forEach((f, i) => {
        const others = facts.filter((o) => o.a.toLowerCase() !== f.a.toLowerCase())
        const distractors = shuffled(others, 'dis-' + i + f.q).slice(0, 3).map((o) => o.a)
        if (others.length < 3) thinDistractors++
        const opts = shuffled([f.a].concat(distractors), 'opt-' + i + f.q)
        if (format === 'Multiple choice') {
          body.push(String(i + 1) + '. ' + f.q)
          opts.forEach((o, j) => body.push('    ' + 'ABCD'[j] + '. ' + o))
          key.push(String(i + 1) + '. ' + 'ABCD'[opts.indexOf(f.a)])
        } else if (format === 'True or false') {
          const shown = distractors[0] || f.a
          const isTrue = shown.toLowerCase() === f.a.toLowerCase()
          body.push(String(i + 1) + '. ' + f.q.replace(/\s*$/, '') + '  ' + shown + '   (true / false)')
          key.push(String(i + 1) + '. ' + (isTrue ? 'True' : 'False, the correct answer is ' + f.a))
        } else if (format === 'Fill the gap') {
          const parts = f.a.split(/\s+/)
          const cut = parts.length > 5 ? 1 : 0
          const blanked = parts.map((w, j) => (j === cut ? '________' : w)).join(' ')
          body.push(String(i + 1) + '. ' + f.q.replace(/\?*\s*$/, '') + ' ' + blanked)
          key.push(String(i + 1) + '. ' + f.a)
        } else {
          body.push(String(i + 1) + '. ' + f.q)
          key.push(String(i + 1) + '. ' + f.a)
        }
      })
      const longest = used.reduce((a, b) => (b.a.length > a.a.length ? b : a), used[0])
      const avgAns = used.reduce((s, f) => s + f.a.split(/\s+/).length, 0) / used.length
      return [
        sres('Questions built', num(used.length, 0), T.good, format.toLowerCase() + ' from ' + num(facts.length, 0) + ' facts', clamp((used.length / Math.max(1, want)) * 100, 5, 100)),
        sres('Answer length', num(avgAns, 1) + ' words', avgAns > 14 ? T.warn : T.good, avgAns > 14 ? 'long answers turn recall into reading comprehension - split them into separate facts' : 'short enough to recall without reading the sentence', clamp(100 - Math.max(0, avgAns - 8) * 6, 5, 100)),
        sres('Distractors', thinDistractors ? 'thin on ' + num(thinDistractors, 0) + ' question(s)' : 'drawn from your own material', thinDistractors ? T.warn : T.good, thinDistractors ? 'fewer than four facts, so some questions are answerable by elimination - add more facts to the list' : 'every wrong option is something you wrote down, so the quiz tests discrimination as well as recall', thinDistractors ? 60 : 95),
        sres('Longest answer', longest.a.slice(0, 40), T.neutral, 'if you cannot reproduce this exactly, the fact is not yet yours'),
        docr('Quiz', body.join('\n')),
        docr('Answer key', key.join('\n')),
        res('Answer before looking', 'mark each question as correct, partial or blank before you check the key. The score is not the point, the hesitation is.', T.good),
        res('Write the miss, do not re-read', 'for every wrong answer, write the correct one from memory in one line and say why the wrong option looked plausible. That explanation is the actual learning.', T.warn),
      ]
    },
  },
  {
    id: 'active-recall-generator-memory',
    name: 'Active Recall Question Generator',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb: 'Converts your notes into questions that name the specific content, so you answer from memory instead of recognising the highlight.',
    tip: 'A question that could apply to any chapter is not a question. It has to mention the specific term, number or mechanism you want back.',
    usage: ['Paste the notes you want to be able to reproduce.', 'Choose the question style you are being tested on.', 'Answer each one closed-book before opening the notes.'],
    method: ['Sentences are split and their anchor terms extracted.', 'Each question embeds an anchor so it cannot be answered generically.', 'Prompts are ordered by how specific their anchor is.'],
    fields: [
      txt('notes', 'Notes to be questioned', 16, 'The resting membrane potential sits near -70 mV because the potassium leak channels dominate at rest. Sodium channels open only when depolarisation reaches threshold. The refractory period limits the firing rate of a neurone. Myelin increases membrane resistance and decreases capacitance, so the impulse travels faster by saltatory conduction.'),
      sel('style', 'Question style', ['Why', 'What', 'How', 'Compare', 'Explain', 'List', 'Mixed'], 'Mixed'),
      n('items', 'Questions to produce', { def: 8, min: 1, max: 25, step: 1 }),
    ],
    compute: (v) => {
      const notes = asStr(v.notes).trim()
      if (notes.length < 20) return [sres('Questions', 'Paste at least a couple of sentences of notes first', T.warn, 'the generator needs real content to anchor questions to', 5)]
      const styleSel = asSel(v.style)
      const want = clamp(Math.round(asNum(v.items)) || 8, 1, 25)
      const sents = notes
        .split(/(?<=[.!?])\s+|\n+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 15)
      const anchors: { term: string; sent: string; weight: number }[] = []
      sents.forEach((s) => {
        const props = s.match(/\b[A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})*\b/g) || []
        const nums = s.match(/\b-?\d+(?:\.\d+)?\s*(?:mV|mV|%|kDa|nm|mm|ms|s|kg|Hz|W|V)\b/gi) || []
        const terms = content(s).sort((a, b) => b.length - a.length)
        const top = terms[0] || ''
        const weight = clamp((props.length > 0 ? 3 : 0) + (nums.length > 0 ? 3 : 0) + Math.min(3, terms.length / 2), 1, 10)
        const label = props[0] || nums[0] || top
        if (label) anchors.push({ term: label, sent: s, weight })
      })
      const ranked = anchors.slice().sort((a, b) => b.weight - a.weight)
      const styles = styleSel === 'Mixed' ? ['Why', 'What', 'How', 'Compare', 'Explain', 'List'] : [styleSel]
      const qs: string[] = []
      const bare: string[] = []
      for (let i = 0; i < want; i++) {
        const a = ranked[i % ranked.length]
        const style = styles[i % styles.length]
        const stem = a.term
        if (style === 'Why') qs.push('Why is ' + stem + ' the way it is? State the mechanism, then the consequence. (answer before you check)')
        else if (style === 'What') qs.push('What exactly does the notes say about ' + stem + '? Give the precise statement, not the topic.')
        else if (style === 'How') qs.push('How does ' + stem + ' produce its effect, step by step? Name the steps in order.')
        else if (style === 'Compare') qs.push('Compare ' + stem + ' with the thing the notes place it against. Where are they alike, and where do they differ?')
        else if (style === 'Explain') qs.push('Explain ' + stem + ' to a smart first-year who has not met it. No jargon you have not defined.')
        else qs.push('List everything the notes assert about ' + stem + ', including any numbers and exceptions.')
        if (a.weight <= 3) bare.push(stem)
      }
      const lowWeight = bare.length
      const protocol = ['1. Closed book, blank paper, 20 minutes. Answer every prompt in writing.', '2. Tick each prompt you answered correctly AND could have produced the detail the notes hold.', '3. Reopen the notes only for the ticks you failed. Do not reread the whole section.', '4. Add the failures to a new prompt list and run it again tomorrow, not tonight.'].join('\n')
      return [
        sres('Questions generated', num(qs.length, 0), T.good, 'from ' + num(sents.length, 0) + ' sentences in your notes', clamp((qs.length / Math.max(1, want)) * 100, 5, 100)),
        sres('Anchored questions', num(qs.length - lowWeight, 0) + ' of ' + num(qs.length, 0), lowWeight > qs.length / 2 ? T.warn : T.good, 'questions that name a proper noun, a number with a unit, or a specific term cannot be answered generically', clamp(Math.round(((qs.length - lowWeight) / Math.max(1, qs.length)) * 100), 5, 100)),
        sres('Anchor quality', lowWeight ? 'thin in places' : 'strong', lowWeight ? T.warn : T.good, lowWeight ? num(lowWeight, 0) + ' prompt(s) rest on a vague anchor - add the specific numbers and names to your notes and the questions sharpen' : 'your notes contain named entities, quantities with units and technical terms, so the prompts are addressable', lowWeight ? 60 : 95),
        docr('Questions', qs.join('\n\n')),
        docr('Closed-book protocol', protocol),
        res('Recognition is not recall', 'reading your notes and feeling you know it is recognition, and it is worthless as evidence. The only honest test is producing the answer with the notes shut.', T.good),
        res('Answers must match the notes level', 'if the notes contain a value, a unit or a named exception, the answer must contain it. A vague correct-sounding answer scores as a miss.', T.warn),
        res('Return to it tomorrow', 'the questions you cannot answer today are the schedule for tomorrow. Write them down as questions now so tomorrow you are not re-reading the whole chapter.', T.neutral),
      ]
    },
  },
  {
    id: 'mnemonic-generator-memory',
    name: 'Mnemonic Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb: 'Builds a real mnemonic from your items using acrostics, number anchoring, letter sounds, story chains or a chant, and tells you how to verify it.',
    tip: 'A mnemonic that feels clever is not a mnemonic. It only works if you can recall it cold and then unpack it into the items without the original list in front of you.',
    usage: ['List the items, one per line.', 'Pick the technique that fits your list.', 'Build it, then test it cold a day later.'],
    method: ['First letters or positions are extracted from every item.', 'The chosen technique turns them into a linked structure.', 'Verification steps and the failure cases are reported.'],
    fields: [
      txt('items', 'Items (one per line)', 14, 'Atlas\nBone\nCyst\nDune\nEagle\nFibre'),
      sel('technique', 'Technique', ['Acrostic', 'Letter sounds', 'Number anchoring', 'Story chain', 'First, last, middle', 'Chant'], 'Acrostic'),
      txt('extra', 'Anything the mnemonic should contain or avoid', 3, ''),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.items)).map((l) => l.replace(/^\s*[-*\d.)\]]+\s*/, '').trim()).filter(Boolean)
      if (raw.length < 3) return [sres('Mnemonic', 'Add at least three items first', T.warn, 'mnemonics work by stringing items together, and a string of two is not a string', 10)]
      const tech = asSel(v.technique)
      const extra = asStr(v.extra).trim()
      const initial = (s: string) => (s.match(/[A-Za-z0-9]/) || ['?'])[0].toUpperCase()
      const out: string[] = []
      let note = ''
      if (tech === 'Acrostic') {
        out.push('Read the initials as one word, then walk the list in that order.')
        out.push('')
        raw.forEach((item, i) => {
          out.push(String(i + 1) + '. ' + initial(item) + ' -> ' + item)
        })
        out.push('')
        out.push('Mnemonic: ' + raw.map(initial).join(' ') + '  (' + raw.map(initial).join('') + ')')
        note = 'An acrostic only stores order and initial. The items themselves still need to be attached, so pair each letter with its item and say both out loud.'
      } else if (tech === 'Letter sounds') {
        out.push('Say the letter name, then the item, in one breath. The sound carries further than the letter shape.')
        out.push('')
        raw.forEach((item, i) => {
          const L = initial(item)
          out.push(String(i + 1) + '. "' + L + '" as ' + (LETTER_SOUND[L.toLowerCase()] || L) + ' -> ' + item)
        })
        out.push('')
        out.push('Chain: ' + raw.map((s) => (LETTER_SOUND[initial(s).toLowerCase()] || initial(s))).join(' - '))
        note = 'Sound mnemonics survive silent revision, which shape mnemonics do not. Read it aloud at least once or it has no effect.'
      } else if (tech === 'Number anchoring') {
        out.push('Anchor each item to a number word and its shape. Numbers are the most reliably retrievable sequence you have.')
        out.push('')
        raw.slice(0, 24).forEach((item, i) => {
          const numWord = NUM_WORD[i] || String(i + 1)
          out.push(String(i + 1) + '. ' + numWord.toUpperCase() + ' - imagine ' + item + ' in a scene built around ' + numWord)
        })
        if (raw.length > 24) out.push('... ' + num(raw.length - 24, 0) + ' item(s) beyond the twenty-four numbers - split the list')
        note = 'Number anchoring gives you a skeleton, not the content. The scene is where the item lives, so make the scenes physically impossible rather than merely vivid.'
      } else if (tech === 'Story chain') {
        out.push('One continuous sentence, one clause per item, with the first word of each clause carrying the letter.')
        out.push('')
        raw.forEach((item, i) => {
          out.push('   ' + (i === 0 ? 'First,' : 'then') + ' the ' + item + ' ' + (i === 0 ? 'appears.' : (i === raw.length - 1 ? 'finally appears.' : 'appears, and next')))
        })
        out.push('')
        out.push('Initial chain: ' + raw.map(initial).join(''))
        note = 'A story works only if the sequence is forced. If the story makes sense with the items reordered, you have not encoded order, and order is usually what you are being tested on.'
      } else if (tech === 'First, last, middle') {
        out.push('For every item, name its first letter, its last letter and its middle letter, then say the item between them.')
        out.push('')
        raw.forEach((item, i) => {
          const clean = item.replace(/[^A-Za-z0-9]/g, '')
          const mid = clean.length > 2 ? clean[Math.floor(clean.length / 2)].toUpperCase() : '?'
          out.push(String(i + 1) + '. ' + (clean[0] || '?').toUpperCase() + '-' + mid + '-' + (clean[clean.length - 1] || '?').toUpperCase() + ' = ' + item)
        })
        note = 'This is the strongest option for ordered lists, because it forces three independent retrieval routes per item instead of one.'
      } else {
        const beats = raw.map((s) => syllables(s))
        const total = beats.reduce((a, b) => a + b, 0)
        out.push('Say the list in rhythm. Stress the capitalised syllable of every item.')
        out.push('')
        raw.forEach((item, i) => {
          out.push(String(i + 1) + '. ' + item + '  (' + num(beats[i], 0) + ' syllable' + (beats[i] === 1 ? '' : 's') + ')')
        })
        out.push('')
        out.push('Total ' + num(total, 0) + ' syllables, ' + num(total / Math.max(1, raw.length), 1) + ' per item - keep that beat steady and the list becomes a recitation.')
        note = 'Rhythm is a retrieval cue, not a content cue. It works for lists you will recite whole and fails the moment you need one item on its own.'
      }
      if (extra) out.push('', 'Constraint you set: ' + extra)
      const lengths = raw.map((s) => syllables(s))
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
      const variability = Math.sqrt(lengths.reduce((s, l) => s + (l - avg) * (l - avg), 0) / lengths.length)
      return [
        sres('Technique', tech, T.neutral, num(raw.length, 0) + ' items, average ' + num(avg, 1) + ' syllables', clamp(100 - variability * 12, 5, 100)),
        sres('Rhythm fit', variability < 1 ? 'even' : 'uneven', variability < 1 ? T.good : T.warn, variability < 1 ? 'items have similar lengths, so a chant or a story reads smoothly' : 'item lengths vary by ' + num(variability, 1) + ' syllables, so prefer an acrostic or number anchoring over a chant', clamp(100 - variability * 15, 5, 100)),
        sres('Verify cold, in 24 hours', tech === 'Story chain' || tech === 'Chant' ? 'essential' : 'still do it', T.warn, 'write the mnemonic from memory tomorrow, then unpack it into the items. If you can do both, the mnemonic exists. If you can only do the first, you have memorised a sentence, not your list.', 40),
        docr('Mnemonic', out.join('\n')),
        res('What the mnemonic is for', note, T.neutral),
        res('The two-step test', 'step one: recite the mnemonic cold. step two: expand it into the items with the list hidden. Only the second step is evidence of learning.', T.good),
        res('Where mnemonics fail', 'they fail when the exam demands meaning rather than the list, and they fail silently because reciting them feels fluent. The moment you feel fluent, test the expansion, not the recitation.', T.warn),
      ]
    },
  },
  {
    id: 'study-technique-selector-memory',
    name: 'Study Technique Selector',
    archetype: 'tier',
    subject: SUBJECT,
    blurb: 'Scores the techniques with real evidence behind them against what you are learning and how well you already know it, then structures your remaining sessions.',
    tip: 'Retrieval practice is the one intervention that helps across every material, every level and every age group. If you only change one thing, change highlighting into closed-book questioning.',
    usage: ['Tick what you are learning and how well you know it.', 'Set the session length and time left before the test.', 'Read the ranked techniques and the session shape.'],
    method: ['Eight evidence-backed techniques are scored against the material and the state.', 'Your session length decides which ones survive.', 'A day-by-day plan is produced from the days remaining.'],
    fields: [
      ck('material', 'What are you learning', MATS),
      ck('state', 'How well do you know it', STATES),
      sel('session', 'One session is', ['10 minutes', '25 minutes', '45 minutes', '90 minutes'], '25 minutes'),
      n('days', 'Days until the assessment', { def: 14, min: 1, max: 120, step: 1 }),
    ],
    compute: (v) => {
      const mv = asBoolList(v.material)
      const sv = asBoolList(v.state)
      const myMats = MATS.filter((_, i) => mv[i])
      const myStates = STATES.filter((_, i) => sv[i])
      if (myMats.length === 0) return [sres('Selector', 'Tick at least one kind of material', T.warn, 'technique choice depends on what you are learning', 5)]
      if (myStates.length === 0) return [sres('Selector', 'Tick how well you know it', T.warn, 'the same material needs different techniques at different stages of knowing', 5)]
      const stateIdx = myStates.map((s) => STATES.indexOf(s)).sort((a, b) => a - b)[0]
      const stage = STATES[stateIdx] || myStates[0]
      const sessSel = asSel(v.session)
      const sessMin = sessSel === '10 minutes' ? 10 : sessSel === '45 minutes' ? 45 : sessSel === '90 minutes' ? 90 : 25
      const days = clamp(Math.round(asNum(v.days)) || 14, 1, 120)
      interface Tech {
        name: string
        why: string
        when: (m: string) => number
        needsState: boolean
        min: number
      }
      const techs: Tech[] = [
        { name: 'Active recall', why: 'every material, every level, largest effect of anything in this list', when: () => 3, needsState: false, min: 10 },
        { name: 'Spaced practice', why: 'retains far more than the same time massed, especially after a day has passed', when: () => 3, needsState: false, min: 10 },
        { name: 'Elaborative interrogation', why: 'asking why and how produces durable learning that is not tied to the wording', when: (m) => (m === 'Arguments and essays' ? 3 : 2), needsState: false, min: 15 },
        { name: 'Interleaving', why: 'mixing related problem types forces discrimination, which is what exam questions do', when: (m) => (m === 'Formulas and calculations' || m === 'Code and syntax' ? 3 : 1), needsState: true, min: 20 },
        { name: 'Dual coding', why: 'a diagram or worked structure stores the same meaning in a second, faster channel', when: (m) => (m === 'Diagrams and processes' || m === 'Facts and lists' ? 3 : 2), needsState: false, min: 15 },
        { name: 'Worked examples', why: 'studying a solved problem before attempting your own beats unaided problem solving early on', when: (m) => (m === 'Formulas and calculations' || m === 'Code and syntax' ? 3 : 1), needsState: true, min: 20 },
        { name: 'Self-explanation', why: 'narrating each step while you solve exposes the gap you were about to skip over', when: (m) => (m === 'Formulas and calculations' ? 3 : 2), needsState: true, min: 15 },
        { name: 'Generation effect', why: 'producing the answer before seeing it beats reading it, even when the produced answer is wrong', when: () => 2, needsState: false, min: 10 },
      ]
      const scored = techs
        .map((t) => {
          let s = t.when(myMats[0])
          for (const m of myMats.slice(1)) s = Math.max(s, t.when(m))
          if (t.needsState) s += stateIdx >= 1 ? 1 : -1
          if (sessMin < t.min) s -= 2
          return { ...t, score: s }
        })
        .sort((a, b) => b.score - a.score)
      const top = scored.slice(0, 3)
      const opener = Math.round(sessMin * 0.15)
      const middle = Math.round(sessMin * 0.6)
      const closer = Math.max(1, sessMin - opener - middle)
      const shape = [
        'OPENER  ' + num(opener, 0) + ' min - closed-book recall. Write everything you remember about ' + myMats[0] + ' before opening anything.',
        'WORK    ' + num(middle, 0) + ' min - ' + top[0].name.toLowerCase() + '. ' + top[0].why + '.',
        'CLOSER  ' + num(closer, 0) + ' min - blank page. Produce the whole thing again from memory, then mark the gaps in a different colour.',
      ].join('\n')
      const dayRows: string[] = []
      for (let d = 1; d <= Math.min(days, 21); d++) {
        const phase = d <= Math.max(1, Math.round(days * 0.5)) ? 'encode' : d <= Math.max(2, Math.round(days * 0.85)) ? 'consolidate' : 'perform'
        const focus = phase === 'encode' ? 'new material, worked examples, then a blank-page test' : phase === 'consolidate' ? 'mixed retrieval across everything from the first half' : 'exam conditions: timed, no notes, interleaved'
        dayRows.push('day ' + String(d).padStart(2, '0') + '  ' + phase.padEnd(11) + '  ' + focus)
      }
      const blocked = scored.filter((t) => sessMin < t.min && t.score > 0).length
      return [
        sres('Starting point', stage, stateIdx <= 1 ? T.bad : stateIdx === 2 ? T.warn : T.good, stageIdxHint(stage), clamp(100 - stateIdx * 22, 5, 100)),
        sres('Material in play', myMats.join(', '), T.neutral, 'techniques are scored against this, not against a generic revision list'),
        sres('Top technique', top[0].name, T.good, top[0].why + '.', 95),
        sres('Runner-up', top[1] ? top[1].name : 'none', T.good, top[1] ? top[1].why : ''),
        sres('Third', top[2] ? top[2].name : 'none', T.neutral, top[2] ? top[2].why : ''),
        sres('Blocked by session length', blocked ? num(blocked, 0) + ' technique(s) need a longer session' : 'none', blocked ? T.warn : T.good, blocked ? 'a ' + sessSel.toLowerCase() + ' session cannot hold worked examples or interleaving properly. Shorten them: one problem fully narrated beats three glanced at.' : 'your session is long enough for the techniques that matter most here'),
        docr('Session shape', shape),
        docr('Plan to the assessment', dayRows.join('\n') + (days > 21 ? '\n... and ' + num(days - 21, 0) + ' further days on the same rotation' : '')),
        res('Not learning styles', 'matching your teaching format to your preferred format does not reliably improve learning. What is reliable is retrieval, spacing, interleaving and elaboration. Preference is not a mechanism.', T.warn),
        res('What is reliably ineffective', 'rereading, highlighting, and copying notes into your own handwriting. They feel productive and produce almost no measurable gain in delayed testing.', T.bad),
        res('Minimum viable session', 'if you only get ' + num(sessMin, 0) + ' minutes, do ' + num(Math.max(4, Math.round(sessMin * 0.6)), 0) + ' minutes of closed-book recall and ' + num(Math.max(1, sessMin - Math.max(4, Math.round(sessMin * 0.6))), 0) + ' minutes correcting against notes. That split beats any passive method at any length.', T.good),
      ]
    },
  },
  {
    id: 'learning-preference-assessment-memory',
    name: 'Encoding Channel Assessment',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb: 'Works out which way you actually encode material, and sets up a short experiment to test it rather than assuming it.',
    tip: 'Everyone studies the way that feels best, which is not the way that works best. This tool gives you two weeks of evidence instead of a preference.',
    usage: ['Tick the habits you really use, not the ones you admire.', 'Say how often notes like that actually work.', 'Run the experiment for the days you have and keep the cold-test score.'],
    method: ['Each channel is scored on how often you use it against how well it works for you.', 'A primary and a secondary channel are nominated.', 'A two-arm experiment with a decision rule is produced.'],
    fields: [
      ck('habits', 'Habits you actually use', CHANS.map((c) => c.name)),
      n('works', 'How often notes like that actually get you a correct answer (%)', { def: 50, min: 0, max: 100, step: 5 }),
      sel('material', 'What you are studying', MATS),
      n('trial', 'Days you can run the experiment', { def: 7, min: 2, max: 28, step: 1 }),
    ],
    compute: (v) => {
      const chans = CHANS
      const picked = asBoolList(v.habits).map((b, i) => (b ? chans[i] : null)).filter((c): c is (typeof chans)[number] => c !== null)
      if (picked.length < 2) return [sres('Assessment', 'Tick at least two habits', T.warn, 'a single habit tells you nothing about the alternatives', 10)]
      const works = clamp(asNum(v.works), 0, 100)
      const material = asSel(v.material)
      const trial = clamp(Math.round(asNum(v.trial)) || 7, 2, 28)
      const scored = picked
        .map((c) => {
          let s = works / 20
          if (c.best === material) s += 2.5
          if (c.best2 === material) s += 1.2
          if (c.name === 'Highlighting while reading') s -= 1.5
          return { c, s }
        })
        .sort((a, b) => b.s - a.s)
      const primary = scored[0]
      const secondary = scored[1]
      const weakest = scored[scored.length - 1]
      const arms = Math.max(2, Math.min(2, trial - 1))
      const odd = Math.ceil(trial / 2)
      const even = Math.floor(trial / 2)
      const design: string[] = []
      design.push('A/B design, alternating days, ' + num(trial, 0) + ' days, ' + num(arms, 0) + ' arms')
      design.push('')
      design.push('ARM A (' + num(odd, 0) + ' days) - ' + primary.c.name + ': ' + primary.c.mech + '.')
      design.push('ARM B (' + num(even, 0) + ' days) - ' + secondary.c.name + ': ' + secondary.c.mech + '.')
      design.push('')
      design.push('Both arms get the same material and the same 10-item cold test at the end of every second day.')
      design.push('Same time of day, same place, notes closed for the test. The only thing that changes is the channel.')
      design.push('')
      design.push('DECISION RULE: keep the channel with the higher average cold-test score. Adopt it if the gap is 15 points or more across at least ' + num(Math.max(2, Math.floor(trial / 3)), 0) + ' paired days. If the gap is smaller, use both, because the difference is noise.')
      const testSheet: string[] = []
      testSheet.push('10-item cold test, ' + num(Math.round(trial / 2), 0) + ' repeats')
      testSheet.push('1. No notes, no phone, 8 minutes, write what you remember.')
      testSheet.push('2. Mark each item 1 correct, 0.5 partial, 0 blank. Do not re-read to fix mistakes first.')
      testSheet.push('3. Score as percentage of possible marks.')
      testSheet.push('4. Tabulate: day, arm, score. Compare arm averages, not your best day.')
      return [
        sres('Primary channel', primary.c.name, T.good, 'because ' + primary.c.mech + (primary.c.best === material ? ', and it matches the material you are studying' : ''), clamp(primary.s * 15, 5, 100)),
        sres('Support channel', secondary.c.name, T.good, 'keep this for the parts of the material that ' + secondary.c.mech, clamp(secondary.s * 12, 5, 100)),
        sres('Channel to drop', weakest.c.name, weakest.c.name === 'Highlighting while reading' ? T.bad : T.warn, weakest.c.name === 'Highlighting while reading' ? 'selection without elaboration stores a feeling of familiarity, which is the single most common cause of the "I know this" exam surprise' : 'it is not wrong, it is just doing less for you than the two above', clamp(100 - weakest.s * 12, 5, 100)),
        sres('Current notes yield', num(works, 0) + '%', works < 50 ? T.bad : works < 75 ? T.warn : T.good, works < 50 ? 'your notes are not retrieving much, which usually means they record rather than process' : works < 75 ? 'partial. The gap is retrieval, not note quality.' : 'your notes work. Protect this.', clamp(works, 5, 100)),
        docr('Experiment design', design.join('\n')),
        docr('Test sheet', testSheet.join('\n')),
        res('Preference is not evidence', 'the evidence does not support the idea that you learn better in your preferred format. It supports the narrower claim that the format must match the task: a process needs a diagram, an argument needs prose, a calculation needs steps. Choose by task, not by taste.', T.warn),
        res('The channel that changes everything', 'explaining to another person has the widest reach across subjects, because it forces generation, elaboration and error detection in one act. If you adopt only one thing from this, adopt that.', T.good),
        res('Stop when the difference appears', 'two weeks is enough. Beyond that you are running an experiment you do not have time for, and the marginal gain is smaller than the revision you were supposed to be doing.', T.neutral),
      ]
    },
  },
  {
    id: 'revision-interval-calculator-memory',
    name: 'Revision Interval Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Turns your last recall score into the next interval, simulates the reviews that fit before the assessment, and predicts the retention you will walk in with.',
    tip: 'A failed review is not a setback, it is the measurement. Cards you never fail are cards you have never been tested on.',
    usage: ['Enter the score from your last closed-book attempt.', 'Set how many reviews in a row you have passed and the days remaining.', 'Read the next interval and the projected exam-date retention.'],
    method: ['Your score sets a growth factor on the interval.', 'Difficulty scales the factor, and the streak scales the stability.', 'The schedule is simulated forward to the assessment date.'],
    fields: [
      n('score', 'Recall score on the last attempt (%)', { def: 70, min: 0, max: 100, step: 5 }),
      n('streak', 'Reviews passed in a row', { def: 2, min: 0, max: 20, step: 1 }),
      n('days', 'Days until the assessment', { def: 30, min: 1, max: 365, step: 1 }),
      sel('subject', 'What you are learning', ['Formulaic', 'Moderate', 'Heavy (derivation or proof)', 'Narrative'], 'Moderate'),
    ],
    compute: (v) => {
      const score = clamp(asNum(v.score), 0, 100)
      const streak = clamp(Math.round(asNum(v.streak)), 0, 20)
      const days = clamp(Math.round(asNum(v.days)), 1, 365)
      const diffSel = asSel(v.subject)
      const dFactor = diffSel === 'Formulaic' ? 1.35 : diffSel === 'Narrative' ? 1.1 : diffSel === 'Heavy (derivation or proof)' ? 0.7 : 1
      const quality = Math.max(0.35, score / 100)
      const growth = 1.25 + 1.0 * quality
      const failed = score < 50
      const interval = failed ? 1 : Math.max(1, Math.round((1 + streak * 1.2) * growth * dFactor * (score < 75 ? 0.65 : 1)))
      let day = 0
      let stability = interval
      const timeline: string[] = ['day   0  last attempt scored ' + num(score, 0) + '%']
      let reviews = 0
      let lastReview = 0
      while (day + stability <= days && reviews < 60) {
        day += stability
        lastReview = day
        reviews++
        timeline.push('day ' + String(day).padStart(3, '0') + '  review ' + num(reviews, 0) + '  gap ' + num(stability, 0) + ' days')
        stability = Math.max(1, Math.round(stability * growth))
      }
      const elapsed = Math.max(0, days - lastReview)
      const retention = Math.pow(0.9, elapsed / Math.max(1, stability))
      const safeRatio = Math.log(0.9) / Math.log(0.85)
      const maxGap = Math.max(1, Math.round(stability * safeRatio))
      const requiredStability = Math.max(1, Math.round(elapsed * safeRatio))
      const pctDays = Math.min(100, (reviews / Math.max(1, days)) * 100)
      return [
        sres('Next interval', failed ? '1 day (reset)' : num(interval, 0) + ' days', failed ? T.bad : score < 75 ? T.warn : T.good, failed ? 'below 50% the memory is not there yet, so the interval collapses to a day. Revisit tomorrow, not next week.' : 'growth ' + num(growth, 2) + 'x per success, difficulty ' + num(dFactor, 2) + 'x, streak ' + num(streak, 0), failed ? 25 : clamp(100 - (100 - score) * 0.6, 5, 100)),
        sres('Reviews before the assessment', num(reviews, 0), reviews < 3 ? T.bad : reviews < 6 ? T.warn : T.good, reviews < 3 ? 'only ' + num(reviews, 0) + ' review(s) fit in ' + num(days, 0) + ' days. Cut the material instead of stretching the gaps.' : 'spaced across ' + num(days, 0) + ' days, last one on day ' + num(lastReview, 0), clamp(pctDays, 5, 100)),
        sres('Retention at exam date', num(retention * 100, 0) + '%', retention >= 0.85 ? T.good : retention >= 0.7 ? T.warn : T.bad, 'the last review falls ' + num(elapsed, 0) + ' day(s) before the assessment and stability is ' + num(stability, 0) + ' days, so recall lands near ' + num(retention * 100, 0) + '%. This assumes every review succeeds.', clamp(retention * 100, 5, 100)),
        sres('Longest safe gap', num(maxGap, 0) + ' days', interval > maxGap ? T.warn : T.good, interval > maxGap ? 'your next gap of ' + num(interval, 0) + ' days exceeds it, which puts exam-date retention below 85%. Shorten it.' : 'a gap of this length still leaves the material at 85% recall, so you can go to it', clamp(100 - Math.max(0, (interval / Math.max(1, maxGap) - 1) * 100), 5, 100)),
        sres('Stability needed at exam date', num(requiredStability, 0) + ' days', requiredStability > stability ? T.warn : T.good, 'you will be ' + num(elapsed, 0) + ' day(s) past your last review, which needs a stability of about ' + num(requiredStability, 0) + ' days to sit at 85%. You are at ' + num(stability, 0) + '.', clamp(100 - Math.max(0, (requiredStability / Math.max(1, stability) - 1) * 100), 5, 100)),
        docr('Simulated schedule', timeline.join('\n')),
        res('Failed reviews are the measurement', 'if everything passes every time, the interval is too long. Raise it until you start failing, then let the failure reset it. That oscillation is the system working.', T.warn),
        res('Late is not lost', 'a long gap is recoverable. Cramming the night before restores short-term performance and destroys long-term retention, and the exam measures long-term retention.', T.bad),
        res('Difficulty is a real multiplier', 'a derivation is not memorised at the same rate as a definition. Using formulaic intervals on proof-based material is why the same schedule fails in maths and works in anatomy.', T.neutral),
      ]
    },
  },
  {
    id: 'memorization-planner-memory',
    name: 'Memorisation Planner',
    archetype: 'timeline',
    subject: SUBJECT,
    blurb: 'Chunks what you must memorise, works out how many passes each kind of material needs, and tells you honestly if the time you have cannot get you there.',
    tip: 'Memorising more than you can hold is not ambitious, it is a plan that fails on the day. Cut the list deliberately rather than discovering the cut in the exam.',
    usage: ['Say what you are memorising and how many items it is.', 'Set your deadline and your daily minutes.', 'Read the day-by-day plan and the feasibility verdict.'],
    method: ['Chunk size and repetitions come from the type of material.', 'Encoding and review minutes are costed per item.', 'The plan is laid out day by day against your available minutes.'],
    fields: [
      txt('item', 'What must you memorise', 4, 'The twelve cranial nerves, the stages of mitosis, the first thirty elements in order'),
      n('count', 'How many items', { def: 20, min: 1, max: 500, step: 1 }),
      n('deadline', 'Days to the deadline', { def: 21, min: 1, max: 180, step: 1 }),
      n('daily', 'Minutes available per day', { def: 30, min: 5, max: 300, step: 5 }),
      sel('type', 'Type of material', ['Facts and figures', 'Formulas', 'Poems or passages', 'Vocabulary', 'Steps or procedures'], 'Facts and figures'),
    ],
    compute: (v) => {
      const what = asStr(v.item).trim() || 'the material'
      const count = clamp(Math.round(asNum(v.count)) || 20, 1, 500)
      const deadline = clamp(Math.round(asNum(v.days)) || 21, 1, 180)
      const daily = clamp(Math.round(asNum(v.daily)) || 30, 5, 300)
      const typeSel = asSel(v.type)
      const chunk = typeSel === 'Formulas' ? 3 : typeSel === 'Steps or procedures' ? 5 : typeSel === 'Poems or passages' ? 4 : typeSel === 'Vocabulary' ? 8 : 7
      const reps = typeSel === 'Formulas' ? 4 : typeSel === 'Poems or passages' ? 5 : typeSel === 'Vocabulary' ? 4 : 3
      const perRep = typeSel === 'Formulas' ? 0.7 : typeSel === 'Poems or passages' ? 0.6 : typeSel === 'Vocabulary' ? 0.15 : typeSel === 'Steps or procedures' ? 0.4 : 0.2
      const encode = 0.5
      const perItem = encode + reps * perRep
      const required = count * perItem
      const capacity = daily * deadline
      const affordable = Math.max(1, Math.floor((capacity - 0.5) / Math.max(0.01, perItem)))
      const feasible = required <= capacity
      const chunks = Math.ceil(count / chunk)
      const newPerDay = Math.max(1, Math.ceil(chunks / Math.max(1, deadline - 2)))
      const plan: string[] = []
      let seen = 0
      for (let d = 1; d <= Math.min(deadline, 40); d++) {
        const rest = deadline - d
        if (d === 1) plan.push('day 01  learn the first ' + Math.min(count, newPerDay * chunk) + ' item(s), then close the book and recall them')
        else if (rest === 1) plan.push('day ' + String(d).padStart(2, '0') + '  final pass: the whole list, timed, then a blank-page test')
        else if (rest === 0) plan.push('day ' + String(d).padStart(2, '0') + '  assessment day. Recall only, no relearning')
        else if (d % 6 === 5) plan.push('day ' + String(d).padStart(2, '0') + '  consolidation day: re-test everything so far, no new items')
        else {
          const start = seen
          const take = Math.min(newPerDay * chunk, count - seen)
          seen += take
          const reviewing = seen > take ? Math.min(seen - take, chunk * 2) : 0
          plan.push('day ' + String(d).padStart(2, '0') + '  new ' + String(start + 1) + '-' + String(start + take) + '  ·  review ' + num(reviewing, 0) + ' older item(s)  ·  ~' + num(take * perItem + reviewing * perRep, 0) + ' min')
        }
        if (seen >= count && rest > 1 && d < deadline) {
          for (let k = d + 1; k <= Math.min(deadline, 40); k++) {
            const r2 = deadline - k
            plan.push('day ' + String(k).padStart(2, '0') + '  ' + (r2 === 0 ? 'assessment day' : r2 === 1 ? 'final blank-page test' : 'mixed recall, no new items'))
          }
          break
        }
      }
      return [
        sres('Material', num(count, 0) + ' items', T.neutral, what, clamp(100 - Math.max(0, count - 60) * 0.5, 5, 100)),
        sres('Feasibility', feasible ? 'fits' : 'does not fit', feasible ? T.good : T.bad, feasible ? 'needs about ' + num(required, 0) + ' min and you have ' + num(capacity, 0) + ' min' : 'needs ' + num(required, 0) + ' min, you have ' + num(capacity, 0) + ' min. Memorise the ' + num(affordable, 0) + ' items that matter most and accept that the rest stays unknown.', feasible ? 95 : 25),
        sres('Passes required', num(reps, 0), typeSel === 'Poems or passages' ? T.warn : T.good, typeSel === 'Facts and figures' ? 'three passes: learn, recall next day, recall in the week' : typeSel === 'Formulas' ? 'four passes, because a formula you can recognise is not a formula you can produce' : typeSel === 'Vocabulary' ? 'four passes including one in context' : 'four or five passes, since verbatim material needs overnight settling', clamp(100 - (reps - 3) * 8, 5, 100)),
        sres('Chunk size', num(chunk, 0) + ' items', chunk <= 5 ? T.neutral : T.good, chunk <= 5 ? 'small chunks because the material is expensive per item' : 'seven at a time is the most you can hold in one sitting reliably', clamp(100 - (chunk - 3) * 4, 5, 100)),
        sres('Daily load', num(Math.min(daily, perItem * newPerDay * chunk), 0) + ' of ' + num(daily, 0) + ' min', perItem * newPerDay * chunk > daily ? T.warn : T.good, perItem * newPerDay * chunk > daily ? 'your plan wants more than you have - the new-item rate will slip, and slipping new items is how deadlines are missed' : 'leaves headroom for the review passes', clamp(100 - Math.max(0, (perItem * newPerDay * chunk / daily - 1) * 100), 5, 100)),
        docr('Plan', plan.join('\n') + (deadline > 40 ? '\n... and ' + num(deadline - 40, 0) + ' further days of mixed recall' : '')),
        res('Chunk, do not batch', 'learning ' + num(chunk, 0) + ' items and testing them immediately is far more efficient than learning ' + num(count, 0) + ' and testing at the end, where the failures are indistinguishable from each other.', T.good),
        res('Test the next day, not the next hour', 'a recall four hours later measures almost nothing. The first useful test is after an overnight gap, and it is much cheaper to fix than the third.', T.warn),
        res('Knowing what to cut', feasible ? 'you have ' + num(capacity - required, 0) + ' spare minutes in the window. Spend them on more passes, not more items, because a third pass beats a first pass of new material.' : 'if it does not fit, the decision is yours to make deliberately. A list of ' + num(affordable, 0) + ' items at 85% beats ' + num(count, 0) + ' items at 40%.', T.neutral),
      ]
    },
  },
  {
    id: 'vocabulary-flashcards-memory',
    name: 'Vocabulary Flashcard Builder',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb: 'Builds two-way cards from a word list, flags the entries that will not work as cards, and splits the deck into reviewable sessions.',
    tip: 'A card that asks you to recognise a definition is a reading test. A card that asks you to produce the word is a memory test. Make both directions.',
    usage: ['Enter words with their meanings as word | meaning.', 'Choose the card direction and the batch size.', 'Paste the card block into your app, or read it as a table.'],
    method: ['Entries are parsed, de-duplicated and checked for missing meanings.', 'Each entry becomes a card in the direction you chose.', 'Difficulty is estimated from length and syllable count.'],
    fields: [
      txt('words', 'Words as word | meaning', 14, 'ubiquitous | present everywhere\nephemeral | lasting a very short time\ncogent | clear, logical and convincing\nineffable | too great to be described\npragmatic | dealing with things practically'),
      sel('side', 'Card direction', ['Word to meaning', 'Meaning to word', 'Both directions'], 'Both directions'),
      n('batch', 'Cards per session', { def: 15, min: 5, max: 60, step: 5 }),
      sel('focus', 'What are you learning these for', ['Academic reading', 'Exam answers', 'Writing precision', 'Conversation'], 'Academic reading'),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.words))
      const entries: { word: string; def: string }[] = []
      const bare: string[] = []
      raw.forEach((l) => {
        const parts = l.split(/\s*\|\s*/)
        if (parts.length >= 2 && parts[0].trim()) entries.push({ word: parts[0].trim().toLowerCase(), def: parts.slice(1).join(' | ').trim() })
        else bare.push(l.replace(/^\s*[-*]\s*/, '').trim())
      })
      const seen = new Set<string>()
      const dupes: string[] = []
      const unique = entries.filter((e) => {
        if (seen.has(e.word)) {
          dupes.push(e.word)
          return false
        }
        seen.add(e.word)
        return true
      })
      if (unique.length < 2) return [sres('Cards', 'Add at least two "word | meaning" lines', T.warn, 'separate the word from the meaning with a vertical bar', 10)]
      const sideSel = asSel(v.side)
      const batch = clamp(Math.round(asNum(v.batch)) || 15, 5, 60)
      const focus = asSel(v.focus)
      const cards: { front: string; back: string; tag: string }[] = []
      const hard: string[] = []
      unique.forEach((e) => {
        const syl = syllables(e.word)
        const tier = syl >= 4 || e.word.length >= 12 ? 'hard' : syl >= 2 || e.word.length >= 8 ? 'medium' : 'easy'
        if (tier === 'hard') hard.push(e.word)
        const tag = tier
        if (sideSel !== 'Meaning to word') cards.push({ front: e.word, back: e.def, tag })
        if (sideSel !== 'Word to meaning') cards.push({ front: e.def, back: e.word, tag })
      })
      const order = sideSel === 'Both directions' ? 'word-recognise first, then produce from the definition' : sideSel === 'Word to meaning' ? 'recognition only, so pair it with writing the word from its definition' : 'production only, which is the harder and more useful direction'
      const sessions: string[] = []
      for (let i = 0; i < cards.length; i += batch) {
        const slice = cards.slice(i, i + batch)
        sessions.push('session ' + num(sessions.length + 1, 0) + '  (' + num(slice.length, 0) + ' cards)  hard ' + num(slice.filter((c) => c.tag === 'hard').length, 0) + ' · medium ' + num(slice.filter((c) => c.tag === 'medium').length, 0) + ' · easy ' + num(slice.filter((c) => c.tag === 'easy').length, 0))
      }
      const tsv = cards.map((c) => c.front.replace(/\t/g, ' ') + '\t' + c.back.replace(/\t/g, ' ')).join('\n')
      const table = unique.map((e) => {
        const syl = syllables(e.word)
        return (e.word + '  [' + num(syl, 0) + ' syl]').padEnd(28) + e.def
      }).join('\n')
      const avgSyll = unique.reduce((s, e) => s + syllables(e.word), 0) / unique.length
      return [
        sres('Cards created', num(cards.length, 0), T.good, 'from ' + num(unique.length, 0) + ' entries, ' + order, clamp((cards.length / Math.max(1, unique.length * 2)) * 100, 5, 100)),
        sres('Sessions', num(sessions.length, 0), sessions.length > 6 ? T.warn : T.good, num(batch, 0) + ' cards per session. ' + (sessions.length > 6 ? 'That is a lot of sessions - a deck this size needs three days, not one sitting.' : 'A deck this size is reviewable inside a week.'), clamp(100 - Math.max(0, sessions.length - 4) * 8, 5, 100)),
        sres('Hard items', num(hard.length, 0) + ' of ' + num(unique.length, 0), hard.length > unique.length / 3 ? T.warn : T.good, hard.length ? 'three or more syllables or over eleven letters: ' + hard.slice(0, 4).join(', ') + (hard.length > 4 ? ', ...' : '') : 'no unusually long words in this list', clamp(100 - (hard.length / Math.max(1, unique.length)) * 100, 5, 100)),
        sres('Average length', num(avgSyll, 1) + ' syllables', avgSyll > 3 ? T.warn : T.good, 'long words need chunking into roots before they will stick: ' + unique.slice(0, 3).map((e) => e.word).join(', '), clamp(100 - Math.max(0, avgSyll - 2) * 20, 5, 100)),
        dupes.length ? sres('Duplicates removed', num(dupes.length, 0), T.warn, dupes.join(', ') + ' appeared more than once and were kept once', 70) : sres('Duplicates', 'none', T.good, 'every entry appears once', 100),
        bare.length ? sres('Lines without a meaning', num(bare.length, 0), T.bad, 'these became nothing: ' + bare.slice(0, 3).join('; '), 30) : sres('Lines without a meaning', 'none', T.good, 'every line had both parts', 100),
        docr('Card block (tab separated, front then back)', tsv),
        docr('Sessions', sessions.join('\n')),
        docr('Study table', table),
        res('Write the word, not just the meaning', 'recognising the definition is not the same as producing the word, and exams ask for the word. One direction in your deck should always be definition to word.', T.good),
        res('Add a sentence, not a dictionary', focus === 'Academic reading' ? 'one card per word with your own sentence using it, rather than the dictionary definition, beats a definition card for reading comprehension.' : focus === 'Exam answers' ? 'put the word in a phrase you might actually write. Vocabulary is retrievable in the context you will need it in.' : focus === 'Writing precision' ? 'one card per misused pair, for example loose versus lax. Precision is a contrast, not a definition.' : 'add a spoken variant card. If you will say the word, practise the sound, not only the spelling.', T.neutral),
        res('Cards that fail', 'any card with a long, hedged definition is unreadable in three seconds. Shorten it to the part that carries the meaning, and let the dictionary handle the rest.', T.warn),
      ]
    },
  },
  {
    id: 'formula-flashcards-memory',
    name: 'Formula Flashcard Builder',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb: 'Turns a formula list into three kinds of card, names every variable, and checks the expressions for unbalanced brackets before you memorise them.',
    tip: 'Most students memorise formulas they could derive. Learn the one formula per topic that everything else follows from, and derive the rest.',
    usage: ['Enter formulas as name | expression | meaning.', 'Choose the card style.', 'Read the cards, the variable glossary and the error check.'],
    method: ['Each row is parsed into name, expression and use.', 'Variables are extracted and annotated with their usual meaning.', 'Bracket balance and variable coverage are checked.'],
    fields: [
      txt('formulas', 'Formulas as name | expression | meaning', 14, 'Ohm law | V = I*R | voltage across a resistor\nKinetic energy | E_k = 0.5*m*v^2 | energy of a moving body\nIdeal gas law | PV = nRT | relation between pressure, volume, moles and temperature\nCompound interest | A = P(1 + r/n)^(nt) | growth of a principal over time'),
      sel('card', 'Card style', ['Recognition', 'Production', 'Both', 'Three-way card'], 'Three-way card'),
      sel('proof', 'Derivation content', ['None', 'Include derivation steps', 'Include a worked example'], 'Include derivation steps'),
      n('exam', 'Days until the exam', { def: 21, min: 1, max: 180, step: 1 }),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.formulas))
      const rows: { name: string; expr: string; use: string }[] = []
      const loose: string[] = []
      raw.forEach((l) => {
        const p = l.split(/\s*\|\s*/)
        if (p.length >= 2 && p[0].trim()) rows.push({ name: p[0].trim(), expr: p[1].trim(), use: p.slice(2).join(' | ').trim() })
        else loose.push(l.replace(/^\s*[-*]\s*/, '').trim())
      })
      if (rows.length < 2) return [sres('Cards', 'Add at least two "name | expression | meaning" lines', T.warn, 'separate the three parts with vertical bars', 10)]
      const cardSel = asSel(v.card)
      const proofSel = asSel(v.proof)
      const exam = clamp(Math.round(asNum(v.exam)) || 21, 1, 180)
      const glossary = new Map<string, string>()
      const errors: string[] = []
      const FUNCS = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'log', 'ln', 'exp', 'sqrt', 'abs', 'min', 'max', 'lim']
      rows.forEach((r) => {
        const open = (r.expr.match(/[([{]/g) || []).length
        const close = (r.expr.match(/[)\]}]/g) || []).length
        if (open !== close) errors.push(r.name + ': ' + open + ' opening and ' + close + ' closing brackets, so the expression is malformed')
        const greeks = Object.keys(GREEK).filter((g) => new RegExp('\\b' + g + '\\b').test(r.expr))
        const symbols = r.expr
          .split(/[^A-Za-z0-9_]+/)
          .filter((t) => t.length > 0 && /^[A-Za-z][A-Za-z0-9_]*$/.test(t))
          .filter((t) => FUNCS.indexOf(t.toLowerCase()) === -1)
        symbols.forEach((sym) => {
          if (GREEK[sym] && /^[a-z]{4,}$/.test(sym)) return
          if (!glossary.has(sym)) {
            const base = sym.split('_')[0]
            const product = /^[A-Z]{2,}$/.test(sym)
            const meaning = product
              ? 'looks like a product of symbols - write it as ' + sym.split('').join('*') + ' so each one gets named'
              : GREEK[sym]
                ? 'greek letter, ' + GREEK[sym].toLowerCase()
                : VAR_HINT[sym] || VAR_HINT[base] || VAR_HINT[base.toLowerCase()] || (greeks.indexOf(sym) >= 0 ? 'a named quantity in this expression' : 'name this symbol in words, you will forget it otherwise')
            glossary.set(sym, meaning)
          }
        })
        if (symbols.length === 0) errors.push(r.name + ': no variables found, so it reads as a constant. Check the expression was entered correctly.')
      })
      const cards: string[] = []
      rows.forEach((r) => {
        if (cardSel !== 'Production') cards.push('RECOGNISE   Which law gives: ' + r.expr + ' ?   ->  ' + r.name)
        if (cardSel !== 'Recognition') cards.push('PRODUCE    Write the expression for ' + r.name + '.   ->  ' + r.expr)
        if (cardSel === 'Three-way card') cards.push('APPLY      ' + (r.use || 'Give a situation where ' + r.name + ' is the right relation') + '.   ->  ' + r.name + ': ' + r.expr)
        if (proofSel === 'Include derivation steps') cards.push('DERIVE     Starting from what is given, get to ' + r.expr + ' in as few lines as you can. Check each line dimensionally.')
        if (proofSel === 'Include a worked example') cards.push('EXAMPLE   Substitute your own numbers into ' + r.name + ', then check the units on both sides before you trust the answer.')
      })
      const variableCount = glossary.size
      const errRate = errors.length / Math.max(1, rows.length)
      return [
        sres('Formulas parsed', num(rows.length, 0), T.good, 'from ' + num(raw.length, 0) + ' lines', clamp((rows.length / Math.max(1, raw.length)) * 100, 5, 100)),
        sres('Variables named', num(variableCount, 0), variableCount === 0 ? T.warn : T.good, variableCount ? 'each symbol in the glossary is annotated, which is what stops a formula becoming an arbitrary string' : 'no single-letter variables found, so the glossary is empty - check the notation is plain text', clamp(100 - Math.max(0, (variableCount / Math.max(1, rows.length * 2) - 0.5) * 60), 5, 100)),
        sres('Expression check', errors.length ? num(errors.length, 0) + ' problem(s)' : 'all clean', errors.length ? T.bad : T.good, errors.length ? 'fix these before you memorise them: ' + errors.slice(0, 2).join(' | ') : 'brackets balance and every formula has variables, so the list is in a consistent notation', errors.length ? clamp(100 - errRate * 100, 5, 100) : 100),
        sres('Card set', num(cards.length, 0), T.good, cardSel.toLowerCase() + ', ' + proofSel.toLowerCase() + ', spread over ' + Math.ceil(cards.length / 12) + ' session(s) of 12', clamp(100 - Math.max(0, (Math.ceil(cards.length / 12) - 6) * 6), 5, 100)),
        sres('Exam in ' + num(exam, 0) + ' days', num(Math.max(1, Math.floor(exam / Math.max(1, Math.ceil(cards.length / 12)))), 0) + ' sessions fit', exam < Math.ceil(cards.length / 12) ? T.bad : T.warn, exam < Math.ceil(cards.length / 12) ? 'you cannot cover this deck with review passes before the exam. Cut to the ' + num(Math.max(1, Math.round(rows.length * (exam / Math.max(1, Math.ceil(cards.length / 12))))), 0) + ' formulas that appear most often.' : 'one session per ' + num(Math.max(1, Math.floor(exam / Math.max(1, Math.ceil(cards.length / 12)))), 0) + ' days, with the first two passes a day apart', clamp(Math.min(100, (exam / Math.max(1, Math.ceil(cards.length / 12))) * 25), 5, 100)),
        docr('Variable glossary', Array.from(glossary.entries()).map(([k, val]) => k.padEnd(6) + val).join('\n') || 'no variables detected'),
        docr('Cards', cards.join('\n')),
        docr('Practice order', ['1. PRODUCTION cards only, for three sessions. Production is the weak direction.', '2. Add EXAMPLES, because a formula you cannot substitute is a formula you do not understand.', '3. Derive one formula per topic from the definition. If the derivation works, the card is redundant.', '4. Two weeks out, mixed cards timed at ninety seconds each.'].join('\n')),
        loose.length ? sres('Lines skipped', num(loose.length, 0), T.warn, loose.slice(0, 3).join('; '), 60) : sres('Lines skipped', 'none', T.good, 'every line had a name and an expression', 100),
        res('Dimensions first', 'check the units on both sides of every formula before you calculate. A formula that balances dimensionally is far more likely to be typed correctly under exam pressure.', T.good),
        res('Memorise the few, derive the rest', 'if you can derive a formula in two lines from a definition, do not memorise it. Memorise only the formulas that are effectively definitions in disguise, and expect them to be a small fraction of the list.', T.warn),
        res('The production direction is the test', 'recognition cards let you feel fluent while knowing nothing. Only the production card, written from a blank page, tells you whether you can actually use it.', T.neutral),
      ]
    },
  },
]

function stageIdxHint(stage: string): string {
  if (stage === 'Never seen it') return 'nothing is encoded yet, so every session must include real study time, not just review'
  if (stage === 'Recognise it, cannot recall it') return 'this is the most common and the most fixable: the knowledge is there, retrieval is not. Skip rereading entirely'
  if (stage === 'Can recall it with notes open') return 'close the notes. Notes-open recall is not recall, it is skimming with extra steps'
  if (stage === 'Can recall it cold, cannot apply it') return 'shift all remaining time from recall to application: problems, past papers, worked examples'
  return 'the risk is detail loss under time pressure, so rehearse the exceptions and the edge cases specifically'
}

export const mod19: StudentSpec[] = CAPS
