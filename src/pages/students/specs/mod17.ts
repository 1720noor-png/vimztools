import { n, sel, txt, ck, res, T, asNum, asSel, asStr, asBoolList, clamp, num } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Notes & Organization'

const STOP = new Set(
  ('a an the and or but if then than that this these those of in on at to for from by with without as is are was were be been being it its we you they he she i my your our their his her them us do does did done have has had not no so such can could should would may might must will shall about into over under between during before after above below up down out off again further once here there when where why how all any both each few more most other some only own same too very just don now also per via etc use used using make makes made get gets got one two three first second next last new old good best better there here what which who whom whose whom\'s there\'s').split(' '),
)

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX']
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

function lines(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.replace(/\r$/, '').trim())
    .filter((l) => l.length > 0)
}

function rawLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim().length > 0)
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

function keyphrases(text: string, limit: number): { term: string; count: number }[] {
  const freq = new Map<string, number>()
  content(text).forEach((w) => freq.set(w, (freq.get(w) || 0) + 1))
  return Array.from(freq.entries())
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count || b.term.length - a.term.length)
    .slice(0, limit)
}

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 3) return 1
  const g = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').match(/[aeiouy]{1,2}/g)
  return Math.max(1, g ? g.length : 1)
}

function titleCase(s: string): string {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase())
}

function stripBullet(l: string): string {
  return l.replace(/^\s*[-*•·–—]\s*/, '').replace(/^\s*(\(?\d+[.)]|\(?[a-z][.)])\s+/i, '').trim()
}

function splitFields(line: string): string[] {
  return line.split('|').map((p) => p.trim())
}

const METHODS: {
  name: string
  blurb: string
  layout: string[]
  rules: string[]
  fit: Record<string, number>
  pace: Record<string, number>
  use: Record<string, number>
}[] = [
  {
    name: 'Cornell',
    blurb: 'A cue column beside a note column, with a summary strip along the bottom. Designed for recall, not for transcription.',
    layout: ['CUE (2.5cm) | NOTES (17cm)', 'left column: a question per block, written after the lecture', 'right column: your notes, condensed, during the lecture', 'bottom strip: three lines of summary, written within 24 hours'],
    rules: ['Write the cue question after the lecture, never during — questions need the whole block.', 'One block = one idea, about four lines of notes.', 'Fill the summary strip the same day. An unfilled strip is a note you will never revise from.'],
    fit: { 'Numerical / calculation-based': 6, 'Conceptual / theory': 10, 'Historical / narrative': 6, 'Procedural / step-by-step': 8, Mixed: 9 },
    pace: { 'Slow and detailed': 9, Moderate: 8, 'Fast — hard to keep up': 6, 'Recorded, so I decide what to note': 10 },
    use: { 'Revise from them later': 10, 'Answer exam questions': 8, 'Write an essay or report': 6, 'Share with someone else': 8, 'Build flashcards': 9 },
  },
  {
    name: 'Outline',
    blurb: 'A nested hierarchy of the whole lecture. Best when structure matters more than detail.',
    layout: ['I. Top-level section', '   A. Sub-point', '      1. Detail, formula or example', 'II. Next top-level section'],
    rules: ['Keep to three levels. A fourth level is usually an excuse for not understanding the third.', 'Every heading must be a claim, not a label — "Corruption reduces trust" beats "Corruption".', 'Leave a blank line between sections; it is where you will add links to other lectures later.'],
    fit: { 'Numerical / calculation-based': 8, 'Conceptual / theory': 9, 'Historical / narrative': 10, 'Procedural / step-by-step': 9, Mixed: 8 },
    pace: { 'Slow and detailed': 7, Moderate: 8, 'Fast — hard to keep up': 7, 'Recorded, so I decide what to note': 8 },
    use: { 'Revise from them later': 9, 'Answer exam questions': 9, 'Write an essay or report': 10, 'Share with someone else': 9, 'Build flashcards': 5 },
  },
  {
    name: 'Mind map',
    blurb: 'One central node with branches. Strong for seeing relationships; weak for sequential or precise content.',
    layout: ['[central topic]', '  ├─ branch 1: sub-branch, sub-sub-branch', '  ├─ branch 2: sub-branch', '  └─ branch 3: sub-branch'],
    rules: ['One idea per branch node. If a node needs "and", it is two nodes.', 'Use colour for categories, never for decoration — you will re-read this under exam stress.', 'Mind maps are for making sense, then rewrite them as an outline. Do not revise from the map itself.'],
    fit: { 'Numerical / calculation-based': 5, 'Conceptual / theory': 9, 'Historical / narrative': 7, 'Procedural / step-by-step': 4, Mixed: 8 },
    pace: { 'Slow and detailed': 7, Moderate: 7, 'Fast — hard to keep up': 6, 'Recorded, so I decide what to note': 9 },
    use: { 'Revise from them later': 7, 'Answer exam questions': 6, 'Write an essay or report': 6, 'Share with someone else': 5, 'Build flashcards': 4 },
  },
  {
    name: 'Verbatim',
    blurb: 'Near-transcription. Necessary for verbatim-required material, wasteful for everything else.',
    layout: ['Verbatim text, paragraphed per slide or per spoken topic', 'A single margin column for your own questions and "???" markers'],
    rules: ['Never use this unless the material is legally or academically required to be verbatim.', 'Mark every gap with "???" — you will fill them within 24 hours or never.', 'Compress to an outline as soon as you can; the transcript is a source, not a study tool.'],
    fit: { 'Numerical / calculation-based': 5, 'Conceptual / theory': 5, 'Historical / narrative': 7, 'Procedural / step-by-step': 6, Mixed: 5 },
    pace: { 'Slow and detailed': 8, Moderate: 4, 'Fast — hard to keep up': 2, 'Recorded, so I decide what to note': 6 },
    use: { 'Revise from them later': 3, 'Answer exam questions': 4, 'Write an essay or report': 8, 'Share with someone else': 5, 'Build flashcards': 3 },
  },
  {
    name: 'Keyword / signal',
    blurb: 'A skeleton of headings, arrows and the odd full sentence. Fastest to produce, needs the most discipline later.',
    layout: ['A heading per block', 'Indented trigger words, never full sentences', 'Arrows and ? for relationships you have not resolved yet'],
    rules: ['Capture the skeleton, then expand within 24 hours. Skeletons decay faster than any other format.', 'Write in the actual lecture order — rearranging while listening splits your attention.', 'Every keyword must be enough to rebuild the idea without the lecture. If it is not, it is not a keyword yet.'],
    fit: { 'Numerical / calculation-based': 7, 'Conceptual / theory': 7, 'Historical / narrative': 6, 'Procedural / step-by-step': 7, Mixed: 7 },
    pace: { 'Slow and detailed': 5, Moderate: 7, 'Fast — hard to keep up': 10, 'Recorded, so I decide what to note': 5 },
    use: { 'Revise from them later': 6, 'Answer exam questions': 5, 'Write an essay or report': 4, 'Share with someone else': 4, 'Build flashcards': 8 },
  },
]

export const mod17: StudentSpec[] = [
  {
    id: 'note-taking-strategy-notes',
    name: 'Note-Taking Strategy Matcher',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb: 'Scores five note-taking methods against your subject, lecture pace and end use, and gives you the winning structure.',
    tip: 'The right method is the one you can keep up with. A perfect system you abandon in week two is worth less than a messy one you maintain all term.',
    usage: ['Choose your subject type and lecture pace.', 'Say what you will actually do with the notes.', 'Read the recommended structure and its rules.'],
    method: ['Five methods are scored on three weighted criteria.', 'Your detail preference adjusts the ranking.', 'A structure template and discipline rules are returned.'],
    fields: [
      sel('subject', 'Subject type', ['Numerical / calculation-based', 'Conceptual / theory', 'Historical / narrative', 'Procedural / step-by-step', 'Mixed'], 'Conceptual / theory'),
      sel('pace', 'Lecture pace', ['Slow and detailed', 'Moderate', 'Fast — hard to keep up', 'Recorded, so I decide what to note'], 'Moderate'),
      sel('use', 'What you will do with the notes', ['Revise from them later', 'Answer exam questions', 'Write an essay or report', 'Share with someone else', 'Build flashcards'], 'Revise from them later'),
      n('detail', 'How much do you want to write? (1 = keywords only, 5 = near-verbatim)', { def: 3, min: 1, max: 5, step: 1 }),
    ],
    compute: (v) => {
      const subject = asSel(v.subject)
      const pace = asSel(v.pace)
      const use = asSel(v.use)
      const detail = clamp(Math.round(asNum(v.detail)) || 3, 1, 5)
      const scored = METHODS.map((m) => {
        const fit = m.fit[subject] ?? 5
        const p = m.pace[pace] ?? 5
        const u = m.use[use] ?? 5
        let base = fit * 0.4 + p * 0.3 + u * 0.3
        if (m.name === 'Verbatim' && detail <= 2) base -= 4
        if (m.name === 'Keyword / signal' && detail >= 4) base -= 3
        if (m.name === 'Cornell' && detail >= 4) base += 1.5
        if (m.name === 'Mind map' && use === 'Answer exam questions') base -= 1.5
        return { m, score: clamp(Math.round(base * 10) / 10, 0, 10) }
      }).sort((a, b) => b.score - a.score)
      const best = scored[0]
      const runnerUp = scored[1]
      const gap = best.score - runnerUp.score
      const confidence = gap >= 2 ? 'clear winner' : gap >= 1 ? 'strong fit' : 'close call — either works, pick the one you will actually maintain'
      return [
        sres('Best method', best.m.name, best.score >= 7.5 ? T.good : T.warn, `${num(best.score, 1)}/10 for ${subject.toLowerCase()} at ${pace.toLowerCase()} pace`, clamp(best.score * 10, 5, 100)),
        sres('Runner-up', runnerUp.m.name, T.neutral, `${num(runnerUp.score, 1)}/10 — ${confidence}`),
        sres('Your detail level', `${detail}/5`, detail <= 2 ? T.warn : detail >= 5 ? T.warn : T.good, detail <= 2 ? 'keywords only — you must expand within 24 hours or lose it' : detail >= 5 ? 'near-verbatim — slow to produce, and slow to revise from' : 'a workable middle: capture structure, not transcription'),
        docr('Your structure', [`METHOD: ${best.m.name}`, '', ...best.m.layout.map((l) => `  ${l}`), '', `WHAT IT IS: ${best.m.blurb}`, '', 'RULES:', ...best.m.rules.map((r, i) => `  ${i + 1}. ${r}`)].join('\n')),
        docr('Full ranking', scored.map((s, i) => `${i + 1}. ${s.m.name} — ${num(s.score, 1)}/10\n   ${s.m.blurb}`).join('\n\n')),
        res('The 24-hour rule', 'whatever method you use, expand and summarise your notes within 24 hours. Notes are perishable — after a week you cannot decode your own abbreviations.', T.good),
        res('Why this beat the others', `${best.m.name} won because your end use is "${use.toLowerCase()}" and your pace is "${pace.toLowerCase()}". Change either one and the ranking changes.`, T.neutral),
        res('Do not mix two systems', 'the most common failure is a half-Cornell, half-mind-map page. Pick one format for the whole course, and only switch if the course genuinely changes shape.', T.warn),
      ]
    },
  },
  {
    id: 'cornell-notes-generator-notes',
    name: 'Cornell Notes Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb: 'Converts a flat list of notes into a filled Cornell page: cue questions, a note column and a summary strip.',
    tip: 'The cue column is the whole point. Notes you can read are notes you have not processed — notes you can question are notes you can revise from.',
    usage: ['Paste your notes, one point per line.', 'Choose the cue style.', 'Read the finished page and fill the gaps it reports.'],
    method: ['Your lines are grouped into four-line blocks.', 'A cue is generated from each block.', 'A summary strip is built from the top terms.'],
    fields: [
      txt('notes', 'Your notes (one point per line)', 16, 'Photosynthesis converts light energy into chemical energy stored in glucose\nChlorophyll absorbs red and blue wavelengths most strongly\nIt reflects green light, which is why leaves look green\nThe light-dependent reactions happen in the thylakoid membrane\nWater is split to replace the electrons chlorophyll loses\nATP and NADPH are produced in this stage\nThe Calvin cycle happens in the stroma\nCarbon dioxide is fixed into a five-carbon sugar using the ATP\nThe sugar is then used to build glucose and other carbohydrates\nThe cycle turns over for every three CO2 fixed using nine ATP'),
      sel('cue', 'Cue style', ['Question cues', 'Keyword cues', 'Blank cues for self-testing'], 'Question cues'),
      n('per', 'Lines per block', { def: 4, min: 2, max: 8, step: 1 }),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.notes))
      if (raw.length < 3) return [sres('Cornell page', 'Add at least three note lines first', T.warn)]
      const cue = asSel(v.cue)
      const per = clamp(Math.round(asNum(v.per)) || 4, 2, 8)
      const clean = raw.map(stripBullet).filter((l) => l.length > 2)
      const blocks: string[][] = []
      for (let i = 0; i < clean.length; i += per) blocks.push(clean.slice(i, i + per))
      const cueFor = (block: string[]): string => {
        const head = block[0] || ''
        const terms = content(head).slice(0, 4)
        if (!terms.length) return 'Key point?'
        if (cue === 'Keyword cues') return terms.join(' · ')
        if (/\b(because|since|why|so that|therefore)\b/i.test(head)) return `Why ${terms.slice(0, 3).join(' ')}?`
        if (/\b(is|are|refers to|means|defined as|called)\b/i.test(head)) return `What is ${terms.slice(0, 3).join(' ')}?`
        if (/\b(steps?|first|next|then|finally)\b/i.test(head)) return `How does ${terms[0]} work?`
        return `What about ${terms.slice(0, 3).join(' ')}?`
      }
      const rows = blocks.map((b, i) => `${String(i + 1).padStart(2, ' ')}. CUE: ${cueFor(b)}\n    NOTES:\n${b.map((x) => `      · ${x}`).join('\n')}`)
      const top = keyphrases(clean.join(' '), 4)
      const summary = top.length
        ? top.map((t) => titleCase(t.term)).join(' · ')
        : clean.slice(0, 3).map((l) => l.slice(0, 60)).join(' · ')
      const lastCue = cueFor(blocks[blocks.length - 1] || [])
      const shortBlocks = blocks.filter((b) => b.length < per).length
      return [
        sres('Blocks generated', num(blocks.length, 0), T.good, `${clean.length} lines grouped ${per} per block · ${cue.toLowerCase()}`),
        sres('Page fill', `${num((clean.length / (blocks.length * per)) * 100, 0)}%`, shortBlocks > 1 ? T.warn : T.good, shortBlocks > 1 ? `${num(shortBlocks, 0)} block(s) are under-filled — merge them or add detail` : 'every block is full', clamp((clean.length / (blocks.length * per)) * 100, 5, 100)),
        sres('Summary strip', top.length ? `${top.length} key terms` : 'none detected', top.length >= 3 ? T.good : T.warn, summary.slice(0, 80), clamp((top.length / 4) * 100, 5, 100)),
        docr('Cornell page', rows.join('\n\n') + `\n\nSUMMARY: ${summary}`),
        docr('Self-test column', blocks.map((b, i) => `Q${i + 1}: ${cueFor(b)}\nA: ______________________________`).join('\n\n')),
        res('Write the cues after the lecture', 'during the lecture you can only write the right-hand column. The cue column needs the finished block, so it is an after-the-fact task — budget 15 minutes.', T.warn),
        res('Cover the notes, read the cues', 'that is the whole method. If you can answer every cue from memory, your notes are doing their job. If not, the cue was written badly — rewrite it.', T.good),
        res('Last block deserves attention', `your final block is "${lastCue.slice(0, 60)}". The end of a lecture is where the summary-level claims live, and it is the part everyone stops writing because the bell is about to go.`, T.neutral),
      ]
    },
  },
  {
    id: 'outline-notes-generator-notes',
    name: 'Outline Notes Builder',
    archetype: 'index',
    subject: SUBJECT,
    blurb: 'Builds a properly nested Roman-numeral outline from your notes, and tells you which levels are missing.',
    tip: 'If you cannot write a three-level outline from memory, you do not understand the lecture. The outline is the diagnostic, not the deliverable.',
    usage: ['Paste your points, indenting children with spaces or tabs.', 'Set the depth you aim for.', 'Read the nested outline and the missing-structure report.'],
    method: ['Indentation is parsed into a level tree.', 'Each level is numbered in its own scheme.', 'Structural gaps are detected and reported.'],
    fields: [
      txt('points', 'Your points (indent children with two spaces per level)', 16, 'Economic development\n  Institutions matter more than natural resources\n    Northfield Acem land-abundance study\n    Correlation is not causation here\n  Resource curse hypothesis\nTechnology\n  Diffusion is S-shaped\n    Rogers adoption of innovations model\n    Early adopters set the ceiling for growth'),
      n('depth', 'Target depth', { def: 3, min: 2, max: 5, step: 1 }),
    ],
    compute: (v) => {
      const raw = rawLines(asStr(v.points))
      if (raw.length < 2) return [sres('Outline', 'Add at least two points first', T.warn)]
      const target = clamp(Math.round(asNum(v.depth)) || 3, 2, 5)
      const parsed = raw.map((l) => {
        const lead = l.match(/^[\t ]*/)
        const spaces = lead ? (lead[0].includes('\t') ? 2 : lead[0].length) : 0
        const bullets = /^\s*[-*•]\s+/.test(l)
        const indent = (bullets ? 2 : spaces) + (bullets ? l.match(/^[\t ]*/)![0].length : 0)
        return { text: stripBullet(l), level: Math.min(5, Math.floor(indent / 2)) }
      })
      const counters = [0, 0, 0, 0, 0, 0]
      const out: string[] = []
      parsed.forEach((p) => {
        const lv = p.level
        counters[lv] += 1
        for (let i = lv + 1; i < counters.length; i++) counters[i] = 0
        const marker = lv === 0 ? ROMAN[counters[0] - 1] || `(${counters[0]})` : lv === 1 ? `${LETTERS[counters[1] - 1]}.` : lv === 2 ? `${counters[2]}.` : `(${counters[3]}.${counters[2]})`
        out.push(`${'   '.repeat(lv)}${marker} ${p.text}`)
      })
      const maxLv = Math.max(...parsed.map((p) => p.level))
      const topSections = counters[0]
      let seenTop = false
      const orphans: string[] = []
      parsed.forEach((p) => {
        if (p.level === 0) { seenTop = true; return }
        if (!seenTop) orphans.push(p.text)
      })
      const jumps: string[] = []
      parsed.forEach((p, i) => {
        if (i === 0) return
        const prev = parsed[i - 1].level
        if (p.level - prev >= 2) jumps.push(`"${p.text}" drops from level ${prev + 1} to level ${p.level + 1}`)
      })
      const unbalanced = jumps.length
      const gaps: string[] = []
      if (topSections < 2) gaps.push('only one top-level section — an outline with one branch is a list, not an outline')
      if (maxLv === 0) gaps.push('nothing is nested — every point is at the same level, so nothing is subordinate to anything')
      if (maxLv < target - 1) gaps.push(`reached level ${maxLv + 1} of your target ${target} — the detail you expected to record is missing`)
      if (topSections >= 3 && topSections <= 6) gaps.push('section count is healthy; check that each section is genuinely the same level of abstraction')
      return [
        sres('Outline built', `${num(out.length, 0)} entries`, gaps.length === 0 ? T.good : T.warn, `${num(topSections, 0)} sections · depth ${num(maxLv + 1, 0)} of ${num(target, 0)}`, clamp((maxLv / Math.max(1, target - 1)) * 100, 5, 100)),
        sres('Structure', gaps.length ? 'needs work' : 'sound', gaps.length ? T.warn : T.good, gaps.length ? gaps[0] : 'sections are balanced and nested properly', clamp(100 - gaps.length * 20, 5, 100)),
        sres('Uneven indentation', num(unbalanced, 0), unbalanced > 0 ? T.warn : T.good, unbalanced > 0 ? jumps[0] : 'indentation is consistent — no entry skips a level', clamp(100 - unbalanced * 15, 5, 100)),
        docr('Nested outline', out.join('\n')),
        res('Headings must be claims', 'if a heading needs "and" or "etc" to make sense, it is two headings. If it is a bare noun like "Technology", rewrite it as what you want remembered about technology.', T.warn),
        res('Level discipline', `you went ${num(maxLv + 1, 0)} levels deep. Beyond level 3 an outline stops helping — at that point you want Cornell, because a fourth level of nesting is a note you cannot read in revision.`, T.neutral),
        res('The test', `read only the Roman-numeral headings. If that alone tells the story, your outline works. If it tells you nothing, your structure is in the wrong place.${orphans.length ? ` ${num(orphans.length, 0)} entr(y/ies) currently sit before any top-level section — give them a parent or move them up: ${orphans.slice(0, 3).join('; ')}.` : ''}`, T.good),
      ]
    },
  },
  {
    id: 'meeting-notes-generator-notes',
    name: 'Meeting Notes Builder',
    archetype: 'log',
    subject: SUBJECT,
    blurb: 'Turns decisions and actions into proper minutes, with owners, deadlines and a clear record of what was not decided.',
    usage: ['Name the meeting and its attendees.', 'List decisions, one per line.', 'Add actions as owner | task | due.'],
    method: ['Actions are parsed into owner, task and deadline.', 'Unowned and undated actions are flagged.', 'A minutes document and follow-up plan are produced.'],
    tip: 'The most valuable line in any minutes is the one recording what was decided not to do. Without it, the same debate runs again next month.',
    fields: [
      txt('subject', 'Meeting / project', 2, 'Onboarding redesign — week 2 review'),
      txt('people', 'Attendees (comma or newline separated)', 4, 'Priya Raman, Tom Becker, Aisha Khan, Dr. Mensah, me'),
      txt('decisions', 'Decisions made (one per line)', 8, 'Move setup to day 0 rather than day 3\nDrop the email drip from 5 messages to 2\nDo not build the checklist feature this term'),
      txt('actions', 'Actions as owner | task | due', 8, 'Priya | prototype the day-0 checklist in Figma | 12 March\nTom | pull week-one funnel numbers by segment | 9 March\nAisha | write the two email templates | 14 March'),
      sel('chair', 'Next review', ['Next week', 'In two weeks', 'Monthly', 'At project end'], 'Next week'),
    ],
    compute: (v) => {
      const subject = asStr(v.subject).trim() || 'Untitled meeting'
      const people = asStr(v.people).split(/[,\n]/).map((p) => p.trim()).filter(Boolean)
      const decisions = lines(asStr(v.decisions)).map(stripBullet)
      const actionLines = lines(asStr(v.actions))
      const actions = actionLines.map((l) => {
        const parts = splitFields(l.replace(/^\s*[-*•]\s*/, ''))
        return { owner: parts[0] || 'UNASSIGNED', task: parts[1] || l, due: parts[2] || 'NO DATE' }
      })
      if (!decisions.length && !actions.length) return [sres('Minutes', 'Add at least one decision or action', T.warn)]
      const unowned = actions.filter((a) => a.owner === 'UNASSIGNED')
      const undated = actions.filter((a) => a.due === 'NO DATE')
      const peopleSet = new Set(people.map((p) => p.toLowerCase()))
      const unknown = actions.filter((a) => a.owner !== 'UNASSIGNED' && !peopleSet.has(a.owner.toLowerCase()))
      const byOwner = new Map<string, number>()
      actions.forEach((a) => byOwner.set(a.owner, (byOwner.get(a.owner) || 0) + 1))
      const load = Array.from(byOwner.entries()).sort((a, b) => b[1] - a[1])
      const nextDays: Record<string, number> = { 'Next week': 7, 'In two weeks': 14, Monthly: 30, 'At project end': 0 }
      const next = nextDays[asSel(v.chair)] ?? 7
      return [
        sres('Minutes ready', `${num(decisions.length + actions.length, 0)} items`, unowned.length || undated.length ? T.warn : T.good, `${num(decisions.length, 0)} decisions · ${num(actions.length, 0)} actions`, clamp(((decisions.length + actions.length) / 10) * 100, 5, 100)),
        sres('Action coverage', `${num(actions.length - unowned.length - undated.filter((a) => !unowned.includes(a)).length, 0)}/${num(actions.length, 0)} complete`, unowned.length || undated.length ? T.bad : T.good, unowned.length ? `${num(unowned.length, 0)} with no owner` : undated.length ? `${num(undated.length, 0)} with no deadline` : 'every action has an owner and a date', clamp(((actions.length - unowned.length - undated.length) / Math.max(1, actions.length)) * 100, 5, 100)),
        sres('Workload spread', num(load.length, 0), T.neutral, load.length ? load.map(([o, c]) => `${o}: ${c}`).join(' · ') : 'no actions assigned', clamp(100 - (Math.max(0, ...load.map((l) => l[1])) - 1) * 20, 5, 100)),
        docr('Minutes', [`${subject.toUpperCase()} — MINUTES`, `Attendees: ${people.join(', ') || 'not recorded'}`, '', 'DECISIONS', ...(decisions.length ? decisions.map((d, i) => `${i + 1}. ${d}`) : ['  (none recorded)']), '', 'ACTIONS', ...(actions.length ? actions.map((a, i) => `${i + 1}. ${a.owner} — ${a.task} — due ${a.due}`) : ['  (none recorded)']), '', 'NOT DECIDED', ...(asStr(v.decisions).split(/do not|won't|not building|deferred/i).length > 1 ? ['  (see decisions marked as deferred)'] : ['  (nothing explicitly deferred — record this, it prevents re-litigation)'])].join('\n')),
        docr('Owner load', load.length ? load.map(([o, c]) => `${o}: ${c} action(s)`).concat(unknown.length ? [`assigned but not on the attendee list: ${unknown.map((u) => u.owner).join(', ')} — confirm they accepted these`] : []).join('\n') : 'no actions assigned'),
        res('No owner, no action', 'an action without a name is a wish. If nobody accepted it in the meeting, it is not agreed — move it to "proposals" until someone says yes.', T.bad),
        res('No date, no commitment', 'a deadline of "soon" is not a deadline. If the date is genuinely unknown, write the date by which the owner will know, not the date of the work.', T.warn),
        res('Distribute within 24 hours', `memory of a meeting decays fast. Send these minutes within 24 hours, and put the next review ${num(next, 0)} days out before anyone leaves the room.`, T.good),
      ]
    },
  },
  {
    id: 'lecture-notes-organizer-notes',
    name: 'Lecture Notes Organizer',
    archetype: 'index',
    subject: SUBJECT,
    blurb: 'Classifies every line of your lecture notes into definitions, examples, formulas, dates and claims, then reports what is missing.',
    tip: 'If your notes have no examples in them, you did not understand the concept — you recognised it. Examples are where understanding shows up.',
    usage: ['Paste your lecture notes.', 'Choose how they should be grouped.', 'Read the classified notes and the missing-element report.'],
    method: ['Each line is matched against six content patterns.', 'Matched lines are filed into named sections.', 'Absent categories are reported as gaps.'],
    fields: [
      txt('notes', 'Your lecture notes (one point per line)', 18, 'Rene Descartes was born in 1596 in La Haye aux Roses\nDescartes is credited with the phrase cogito ergo sum\nCogito ergo sum means I think therefore I am\nThe phrase appears in Discourse on Method, 1637\nFor example, the method begins with systematic doubt\nDescartes doubted everything that could be doubted\nBut he could not doubt that doubting was happening\nThe Meditations, 1641, expands on this in seven steps\nA key example is the evil genius hypothesis'),
      sel('sort', 'Group by', ['Content type', 'Order as given', 'Everyday language vs technical language'], 'Content type'),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.notes)).map(stripBullet).filter((l) => l.length > 2)
      if (raw.length < 3) return [sres('Organizer', 'Add at least three note lines first', T.warn)]
      const sortBy = asSel(v.sort)
      const PATTERNS: { key: string; label: string; re: RegExp }[] = [
        { key: 'definition', label: 'Definitions', re: /\b(is|are|refers to|means|defined as|is called|denotes)\b/i },
        { key: 'example', label: 'Examples', re: /\b(for example|e\.g\.|such as|for instance|consider|imagine|take the case)\b|^\s*[-*•]?\s*example/i },
        { key: 'formula', label: 'Formulas and figures', re: /[=<>≤≥]|\d+\s*[\^*x×÷/]\s*\d+|\b\d+(\.\d+)?\s*(%|kg|km|cm|metres|meters|years|days)\b/i },
        { key: 'date', label: 'Dates and chronology', re: /\b(1[0-9]{3}|20[0-2][0-9])\b|\b(first|second|third|then|finally|later|earlier)\b/i },
        { key: 'claim', label: 'Claims and arguments', re: /\b(because|therefore|thus|hence|proves|shows|means that|so that|conclude)\b/i },
        { key: 'question', label: 'Open questions', re: /\?$|\b(unsure|confused|not clear|check this|why\?)\b/i },
      ]
      const buckets: Record<string, string[]> = {}
      PATTERNS.forEach((p) => { buckets[p.key] = [] })
      const plain: string[] = []
      const bucketsUnmatched: string[] = []
      raw.forEach((l) => {
        if (sortBy === 'Order as given') { plain.push(l); return }
        if (sortBy === 'Everyday language vs technical language') {
          const tech = content(l).filter((w) => w.length >= 8).length
          ;(tech >= 1 ? bucketsUnmatched : plain).push(l)
          return
        }
        const hits = PATTERNS.filter((p) => p.re.test(l)).map((p) => p.key)
        if (!hits.length) { plain.push(l); return }
        hits.slice(0, 1).forEach((k) => buckets[k].push(l))
      })
      const found = PATTERNS.filter((p) => buckets[p.key].length)
      const missing = PATTERNS.filter((p) => !buckets[p.key].length)
      const techCount = bucketsUnmatched.length
      const unfiled = plain.length
      const density = (buckets.definition.length + buckets.example.length) / Math.max(1, raw.length)
      const gaps: string[] = []
      if (!buckets.definition.length) gaps.push('no definitions detected — a concept you cannot state in one sentence is a concept you have not learned')
      if (!buckets.example.length) gaps.push('no examples detected — recognition is not understanding; find one worked example per concept')
      if (!buckets.question.length) gaps.push('no open questions marked — you have silently accepted an ambiguity you should have flagged in the lecture')
      return [
        sres('Lines classified', `${num(found.reduce((s, p) => s + buckets[p.key].length, 0), 0)}/${num(raw.length, 0)}`, unfiled > raw.length * 0.4 ? T.warn : T.good, unfiled > raw.length * 0.4 ? `${num(unfiled, 0)} lines matched no pattern — they may be commentary, or you may have missed the point` : 'almost everything was classified', clamp(((raw.length - unfiled) / raw.length) * 100, 5, 100)),
        sres('Categories present', `${num(found.length, 0)}/${num(PATTERNS.length, 0)}`, missing.length > 2 ? T.warn : T.good, missing.length ? `absent: ${missing.map((m) => m.label.toLowerCase()).join(', ')}` : 'every content type is represented', clamp((found.length / PATTERNS.length) * 100, 5, 100)),
        sres('Understanding density', `${num(density * 100, 0)}%`, density > 0.25 ? T.good : density > 0.1 ? T.warn : T.bad, 'definitions and examples as a share of all notes', clamp(density * 200, 5, 100)),
        sres('Technical lines', num(techCount, 0), techCount > raw.length * 0.3 ? T.warn : T.good, techCount > raw.length * 0.3 ? 'heavily technical — you will not revise from this without rewriting it in plain language' : 'a readable mix of technical and plain lines', clamp(100 - (techCount / Math.max(1, raw.length)) * 100, 5, 100)),
        docr('Organized notes', found.length
          ? found.map((p) => `${p.label.toUpperCase()} (${buckets[p.key].length})\n${buckets[p.key].map((l) => `  · ${l}`).join('\n')}`).join('\n\n') + (unfiled ? `\n\nUNCLASSIFIED (${unfiled})\n${plain.map((l) => `  · ${l}`).join('\n')}` : '') + (techCount ? `\n\nTECHNICAL VOCABULARY (${techCount})\n${bucketsUnmatched.map((l) => `  · ${l}`).join('\n')}` : '')
          : `AS GIVEN\n${plain.map((l) => `  ${num(plain.indexOf(l) + 1, 0)}. ${l}`).join('\n')}`),
        gaps.length ? docr('Missing from your notes', gaps.map((g, i) => `${i + 1}. ${g}`).join('\n')) : docr('Missing from your notes', 'nothing structurally missing — these notes cover definition, example and open question'),
        res('Organise after, not during', 'during the lecture, write linearly and fast. Rearranging while someone is still talking splits your attention between the structure and the content.', T.neutral),
        res('Unclassified lines are not wasted', 'they are usually your own commentary — the part where you connected this to something else. Keep them in their own section, because that is where your real understanding lives.', T.neutral),
        res('Rewrite in plain language', 'take every definition and rewrite it without the term you are defining. If you cannot, you have copied a definition rather than learned one.', T.warn),
      ]
    },
  },
  {
    id: 'study-notes-formatter-notes',
    name: 'Study Notes Formatter',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb: 'Cleans, chunks and spaces your notes for revision, and reports reading level, coverage and the lines that need rewriting.',
    tip: 'The same notes, reformatted for twenty-minute revision sessions, save you hours per week. The content does not change — the accessibility does.',
    usage: ['Paste your notes.', 'Set your block size and revision style.', 'Read the formatted page and the revision time estimate.'],
    method: ['Lines are cleaned and de-duplicated.', 'Content is chunked and spaced by revision style.', 'Reading level and coverage are measured.'],
    fields: [
      txt('notes', 'Your notes (one point per line)', 18, 'The cell cycle has stages\nGap 1: G1 phase is the gap between the end of mitosis and the start of S phase\nG1 is when the cell grows and makes proteins\nThe restriction point in G1 decides whether the cell divides at all\nS phase: DNA is replicated, so each chromosome becomes two sister chromatids\nS phase takes about 6 to 8 hours in a human cell\nG2 is the second gap after S phase, with a checkpoint for DNA damage\nM phase: mitosis divides the nucleus and cytokinesis divides the cell\nThe cell cycle in a human cell takes about 24 hours\nCells that leave the cycle enter a state called G0'),
      n('block', 'Max lines per block', { def: 5, min: 2, max: 12, step: 1 }),
      sel('style', 'Revision style', ['Tight — exam cramming', 'Balanced — weekly revision', 'Spacious — long-term mastery'], 'Balanced — weekly revision'),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.notes)).map(stripBullet).filter((l) => l.length > 1)
      if (raw.length < 3) return [sres('Formatter', 'Add at least three note lines first', T.warn)]
      const blockSize = clamp(Math.round(asNum(v.block)) || 5, 2, 12)
      const style = asSel(v.style)
      const seen = new Set<string>()
      const clean: string[] = []
      const dupes: string[] = []
      raw.forEach((l) => {
        const k = l.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
        if (seen.has(k)) dupes.push(l)
        else { seen.add(k); clean.push(l) }
      })
      const long = clean.filter((l) => l.length > 110)
      const vague = clean.filter((l) => content(l).length < 2)
      const blocks: string[][] = []
      for (let i = 0; i < clean.length; i += blockSize) blocks.push(clean.slice(i, i + blockSize))
      const all = words(clean.join(' '))
      const syl = all.reduce((s, w) => s + syllables(w), 0)
      const wps = all.length / Math.max(1, clean.length)
      const spw = syl / Math.max(1, all.length)
      const grade = 0.39 * wps + 11.8 * spw - 15.59
      const key = keyphrases(clean.join(' '), 6)
      const covered = key.filter((k) => clean.some((l) => l.toLowerCase().includes(k.term))).length
      const readMin = all.length / 220
      const styleFactor = style.startsWith('Tight') ? 0.6 : style.startsWith('Spacious') ? 1.6 : 1
      const totalMin = (readMin + clean.length * 0.08) * styleFactor
      return [
        sres('Formatted', `${num(clean.length, 0)} lines`, dupes.length ? T.warn : T.good, `${num(blocks.length, 0)} blocks of up to ${blockSize} · ${style.toLowerCase()}`, clamp(100 - dupes.length * 8, 5, 100)),
        sres('Revision time', `${num(totalMin, 0)} min`, totalMin > 45 ? T.warn : T.good, `reading alone is ${num(readMin, 0)} min; recall and highlighting makes it ${styleFactor.toFixed(1)}x`, clamp(100 - (totalMin / 60) * 100, 5, 100)),
        sres('Reading level', `grade ${num(Math.max(1, grade), 1)}`, grade > 16 ? T.warn : T.good, `${num(wps, 1)} words per line — for revision, under 20 is faster`, clamp(100 - Math.max(0, grade - 8) * 4, 5, 100)),
        sres('Keyword coverage', `${num(covered, 0)}/${num(key.length, 0)}`, covered === key.length ? T.good : T.warn, covered === key.length ? 'every key term appears in a heading-sized line' : 'some key terms are buried mid-line — promote them to their own line'),
        docr('Formatted notes', blocks.map((b, i) => {
          const terms = keyphrases(b.join(' '), 2).map((t) => t.term)
          return [`BLOCK ${i + 1}${terms.length ? ` — ${terms.join(', ')}` : ''}`, ...b.map((l) => `  ${l}`), style.startsWith('Spacious') ? '' : null].filter((x) => x !== null).join('\n')
        }).join(style.startsWith('Spacious') ? '\n\n\n' : '\n\n')),
        dupes.length ? docr('Removed duplicates', [...new Set(dupes)].map((d) => `  · ${d}`).join('\n')) : res('No duplicates', 'nothing was repeated verbatim — your notes are dense rather than repetitive.', T.good),
        res('The vague-line problem', vague.length ? `${num(vague.length, 0)} line(s) contain almost no content words — they read well but tell you nothing in revision. Rewrite each as a claim with a number or a name in it.` : 'every line has enough substance to be useful in revision.', vague.length ? T.warn : T.good),
        res('Long lines are hard to test', long.length ? `${num(long.length, 0)} line(s) run past 110 characters. Break each at the natural seam — a line you can cover with your thumb is a line you can quiz yourself on.` : 'line lengths are revision-friendly.', long.length ? T.warn : T.good),
        res('Space is a retrieval cue', 'blank space between blocks is not wasted paper — it is where you write the questions you will ask yourself later. Notes packed solid give your eye no place to pause, so nothing sticks.', T.good),
      ]
    },
  },
  {
    id: 'notes-to-flashcards-notes',
    name: 'Notes to Flashcards',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb: 'Detects definitions, question-answer pairs and cloze deletions in your notes and turns them into ready-to-review cards.',
    tip: 'A flashcard that asks you to read a paragraph is a bookmark, not a card. If the front needs more than one line, the card is too big — split it.',
    usage: ['Paste your notes.', 'Choose how cards should be generated.', 'Read the cards and the quality warnings.'],
    method: ['Three card patterns are detected in priority order.', 'Answers longer than the limit are flagged.', 'Cards are ranked so the hardest come first.'],
    fields: [
      txt('notes', 'Your notes (one point per line)', 18, 'Cognitive load is the amount of working memory in use\nCognitive load theory divides load into intrinsic, extraneous and germane\nIntrinsic load depends on the material and the learner\'s expertise\nExtraneous load comes from poor instructional design\nGermane load is the effort that builds a schema\nSplit attention occurs when a learner must mentally integrate two sources\nThe split-attention effect was demonstrated by Mayer and Moreno in 1999\nDual-channel processing means information arrives through visual and auditory channels\nWorking memory holds about four chunks, not seven\nChunking works because a chunk is a unit of meaning, not a unit of size'),
      sel('type', 'Card style', ['Auto-detect', 'Definitions only', 'Cloze deletion only', 'Keyword → detail'], 'Auto-detect'),
      n('max', 'Maximum cards', { def: 18, min: 4, max: 60, step: 1 }),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.notes)).map(stripBullet).filter((l) => l.length > 3)
      if (raw.length < 3) return [sres('Flashcards', 'Add at least three note lines first', T.warn)]
      const type = asSel(v.type)
      const max = clamp(Math.round(asNum(v.max)) || 18, 4, 60)
      type Word = { term: string; def: string }
      const defs: Word[] = []
      const qa: { front: string; back: string }[] = []
      const cloze: { front: string; back: string }[] = []
      const key: { front: string; back: string }[] = []
      raw.forEach((l) => {
        const m = l.match(/^([^:]{3,50}?)\s*[:\-—]\s*(.{10,})$/)
        if (m) qa.push({ front: m[1].trim(), back: m[2].trim() })
        const d = l.match(/^(.{3,60}?)\s+(?:is|are)\s+(?:defined as|usually|simply)?\s*(.{12,})$/i)
        if (d) defs.push({ term: d[1].trim(), def: d[2].trim() })
        const terms = keyphrases(l, 1)
        if (terms.length) {
          const t = terms[0].term
          cloze.push({ front: l.replace(new RegExp(`\\b${t}\\b`, 'i'), '_____'), back: t })
          key.push({ front: `What is the role of "${t}" here?`, back: l })
        }
      })
      let cards: { front: string; back: string; kind: string }[] = []
      if (type === 'Auto-detect') {
        cards = [
          ...defs.map((x) => ({ front: `What is ${x.term}?`, back: x.def, kind: 'definition' })),
          ...qa.map((x) => ({ front: x.front, back: x.back, kind: 'q&a' })),
          ...key.slice(0, Math.ceil(max * 0.3)).map((x) => ({ front: x.front, back: x.back, kind: 'keyword' })),
          ...cloze.slice(0, Math.ceil(max * 0.3)).map((x) => ({ front: x.front, back: x.back, kind: 'cloze' })),
        ]
      } else if (type === 'Definitions only') {
        cards = defs.map((x) => ({ front: `What is ${x.term}?`, back: x.def, kind: 'definition' }))
      } else if (type === 'Cloze deletion only') {
        cards = cloze.map((x) => ({ front: x.front, back: x.back, kind: 'cloze' }))
      } else {
        cards = key.map((x) => ({ front: x.front, back: x.back, kind: 'keyword' }))
      }
      const uniq: { front: string; back: string; kind: string }[] = []
      const seen = new Set<string>()
      cards.forEach((c) => {
        const k = c.front.toLowerCase()
        if (seen.has(k)) return
        seen.add(k)
        uniq.push(c)
      })
      uniq.sort((a, b) => words(b.back).length - words(a.back).length)
      const final = uniq.slice(0, max)
      if (!final.length) return [sres('Flashcards', 'No cards could be generated from these notes', T.warn, 'try a different card style, or add lines that define or explain something', 10)]
      const byKind: Record<string, number> = {}
      final.forEach((c) => { byKind[c.kind] = (byKind[c.kind] || 0) + 1 })
      const tooLong = final.filter((c) => words(c.back).length > 40)
      const tooWide = final.filter((c) => words(c.front).length > 18)
      const swapRisk = final.filter((c) => c.kind === 'cloze' && words(c.front).length < 6)
      return [
        sres('Cards generated', num(final.length, 0), final.length >= 8 ? T.good : T.warn, `${Object.keys(byKind).map((k) => `${byKind[k]} ${k}`).join(' · ')}`, clamp((final.length / 25) * 100, 5, 100)),
        sres('Answer length', `${num(Math.max(...final.map((c) => words(c.back).length)), 0)} words max`, tooLong.length ? T.warn : T.good, tooLong.length ? `${num(tooLong.length, 0)} card(s) need splitting — a card you cannot answer in one breath is a card you will abandon` : 'every answer is a single breath', clamp(100 - tooLong.length * 10, 5, 100)),
        sres('Prompt length', `${num(Math.max(...final.map((c) => words(c.front).length)), 0)} words max`, tooWide.length ? T.warn : T.good, tooWide.length ? `${num(tooWide.length, 0)} prompt(s) are multi-line` : 'every prompt is one line', clamp(100 - tooWide.length * 10, 5, 100)),
        docr('Cards (hardest first)', final.map((c, i) => `CARD ${i + 1} [${c.kind}]\n  Q: ${c.front}\n  A: ${c.back}`).join('\n\n')),
        docr('Cloze deletions', cloze.map((c) => `  ${c.front}   →   ${c.back}`).join('\n') || 'no cloze candidates detected — none of your lines contained a key term worth masking'),
        res('One fact per card', 'if a card has two answers, it is two cards. Splitting cards roughly doubles your card count and roughly halves how long each takes — that is the whole trade.', T.warn),
        swapRisk.length
          ? res('Cloze cards that are too thin', `${num(swapRisk.length, 0)} card(s) are a short line with a single blank, which gives the answer away from context. Combine each with its neighbours into one longer sentence, or use a keyword card instead.`, T.warn)
          : res('Cloze quality', 'your cloze deletions are long enough that context does not give the answer away.', T.good),
        res('Cards are not notes', 'do not copy cards from notes you have not understood. A card built from a half-understood idea trains you to recall the wording, not the idea.', T.neutral),
      ]
    },
  },
  {
    id: 'notes-to-quiz-notes',
    name: 'Notes to Quiz',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a mixed-format quiz from your notes with plausible distractors and a full answer key.',
    tip: 'Distractors drawn from your own notes are the most useful part of a generated quiz, because they are the exact confusions you actually hold.',
    usage: ['Paste your notes.', 'Set question count, difficulty and format.', 'Take the quiz, then check the key.'],
    method: ['Key terms and definitions are extracted.', 'Distractors are drawn from your other terms.', 'Questions are distributed across your chosen formats.'],
    fields: [
      txt('notes', 'Your notes (one point per line)', 18, 'Bayes theorem updates a prior belief using new evidence\nIt is written P(A|B) = P(B|A) P(A) / P(B)\nA prior is the probability before any evidence is seen\nA likelihood is how probable the evidence is given the hypothesis\nSensitivity is the true positive rate\nSpecificity is the true negative rate\nA false positive is a positive result when the condition is absent\nA false negative is a negative result when the condition is present\nBase rate neglect is ignoring the prior when interpreting a test result\nPositive predictive value falls as prevalence falls'),
      n('count', 'Number of questions', { def: 12, min: 4, max: 40, step: 1 }),
      sel('difficulty', 'Difficulty', ['Easy — straight recall', 'Medium — understanding', 'Hard — application and analysis'], 'Medium — understanding'),
      ck('types', 'Question formats', ['Multiple choice', 'True or false', 'Short answer']),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.notes)).map(stripBullet).filter((l) => l.length > 8)
      if (raw.length < 4) return [sres('Quiz', 'Add at least four note lines first', T.warn)]
      const want = clamp(Math.round(asNum(v.count)) || 12, 4, 40)
      const difficulty = asSel(v.difficulty)
      const types = asBoolList(v.types).map(Boolean)
      const active: string[] = []
      if (types[0]) active.push('Multiple choice')
      if (types[1]) active.push('True or false')
      if (types[2]) active.push('Short answer')
      if (!active.length) active.push('Multiple choice')
      const defs = raw.map((l) => {
        const m = l.match(/^(.{3,70}?)\s+(?:is|are)\s+(.{12,})$/i)
        return m ? { term: m[1].trim(), def: m[2].trim(), line: l } : null
      }).filter((x): x is { term: string; def: string; line: string } => x !== null)
      const pool = defs.length >= 4 ? defs : raw.map((l, i) => ({ term: keyphrases(l, 1)[0]?.term || `point ${i + 1}`, def: l, line: l }))
      const qs: { q: string; opts: string[]; ans: number; type: string; explain: string }[] = []
      const per = Math.ceil(want / active.length)
      active.forEach((type) => {
        if (type === 'Multiple choice') {
          pool.slice(0, per).forEach((p, i) => {
            const others = pool.filter((q) => q.term !== p.term)
            const shuffled = others.slice(i % Math.max(1, others.length), i % Math.max(1, others.length) + 3).map((q) => q.term)
            while (shuffled.length < 3 && others.length) shuffled.push(others[shuffled.length % others.length].term)
            const opts = [p.term, ...new Set(shuffled)].slice(0, 4)
            const ans = opts.indexOf(p.term)
            qs.push({
              q: difficulty.startsWith('Easy') ? `Which of these is defined as: "${p.def.slice(0, 90)}"?` : difficulty.startsWith('Hard') ? `A colleague says "${p.def.slice(0, 80)}". Which term are they describing?` : `What is ${p.term}?`,
              opts,
              ans: ans < 0 ? 0 : ans,
              type,
              explain: `${p.term} — ${p.def.slice(0, 120)}`,
            })
          })
        } else if (type === 'True or false') {
          raw.slice(0, per).forEach((l, i) => {
            const flip = i % 2 === 1
            const termsIn = keyphrases(l, 1)
            const wrong = keyphrases(raw[(i + 2) % raw.length], 1)[0]?.term
            const statement = flip && wrong ? l.replace(new RegExp(`\\b${termsIn[0]?.term || 'x'}\\b`, 'i'), wrong) : l
            qs.push({ q: `True or false: "${statement.slice(0, 150)}"`, opts: ['True', 'False'], ans: flip ? 1 : 0, type, explain: flip ? `False — the correct term is "${termsIn[0]?.term}", not "${wrong}".` : `True — as your notes state: "${l.slice(0, 120)}"` })
          })
        } else {
          pool.slice(0, per).forEach((p) => {
            qs.push({ q: `In your own words, what does "${p.term}" mean?`, opts: [], ans: 0, type, explain: `Expected: ${p.def.slice(0, 160)}` })
          })
        }
      })
      const final = qs.slice(0, want)
      if (!final.length) return [sres('Quiz', 'Not enough source material for a quiz', T.warn)]
      const byType: Record<string, number> = {}
      final.forEach((q) => { byType[q.type] = (byType[q.type] || 0) + 1 })
      const mcq = final.filter((q) => q.type === 'Multiple choice')
      const weakDistractors = mcq.filter((q) => new Set(q.opts).size < 4)
      return [
        sres('Quiz built', `${num(final.length, 0)} questions`, final.length >= want ? T.good : T.warn, Object.keys(byType).map((k) => `${byType[k]} ${k.toLowerCase()}`).join(' · '), clamp((final.length / want) * 100, 5, 100)),
        sres('Difficulty', difficulty.replace(/ —.*/, ''), T.neutral, difficulty.startsWith('Easy') ? 'prompts quote your notes almost verbatim' : difficulty.startsWith('Hard') ? 'prompts require you to recognise a definition from its use' : 'prompts ask you to produce the term from the definition'),
        sres('Source coverage', `${num(pool.length, 0)} facts`, pool.length < want / 2 ? T.warn : T.good, pool.length < want / 2 ? 'fewer distinct facts than questions — expect repetition' : 'enough distinct facts to avoid repeats', clamp((pool.length / Math.max(1, want / 2)) * 100, 5, 100)),
        docr('Quiz', final.map((q, i) => {
          if (q.type === 'Short answer') return `Q${i + 1}. ${q.q}\n   (write your answer, then check the key)`
          return `Q${i + 1}. ${q.q}\n${q.opts.map((o, j) => `   ${String.fromCharCode(65 + j)}) ${o}`).join('\n')}`
        }).join('\n\n')),
        docr('Answer key', final.map((q, i) => `Q${i + 1}. ${q.type === 'Short answer' ? 'see explanation' : String.fromCharCode(65 + q.ans) + ')'} — ${q.explain}`).join('\n\n')),
        weakDistractors.length ? res('Distractor quality', `${num(weakDistractors.length, 0)} multiple-choice question(s) have fewer than four distinct options, which makes them guessable. Add more distinct facts to your notes.`, T.warn) : res('Distractor quality', 'all multiple-choice questions have four distinct options. The wrong answers come from your own notes, so they target your real confusions rather than random wrongness.', T.good),
        res('Do it closed-book first', 'attempt the whole quiz without looking, mark it honestly, then only review what you got wrong. Reviewing what you already knew is the most comfortable and least useful revision there is.', T.good),
        res('Rewrite the explanations', 'the answer key explanations are drawn from your notes verbatim. Rewrite each in your own words as you check — that rewrite is where the learning actually happens.', T.neutral),
      ]
    },
  },
  {
    id: 'study-notes-summarizer-notes',
    name: 'Study Notes Summarizer',
    archetype: 'tier',
    subject: SUBJECT,
    blurb: 'Compresses your notes to a one-line summary, ranked bullets, key terms and self-test questions, with a measured compression ratio.',
    tip: 'A summary you can write from memory is worth ten you can read. Use this to check what you would keep if you lost the original.',
    usage: ['Paste your notes.', 'Set how many bullets and key terms you want.', 'Read the summary, the keywords and the self-test questions.'],
    method: ['Key terms are scored by frequency and length.', 'Lines are ranked by information density.', 'Compression ratio and coverage are measured.'],
    fields: [
      txt('notes', 'Your notes', 20, 'Photosynthesis converts light energy into chemical energy stored in glucose\nChlorophyll absorbs red and blue wavelengths most strongly and reflects green\nThe light-dependent reactions happen in the thylakoid membrane of the chloroplast\nWater is split to replace the electrons that chlorophyll loses\nATP and NADPH are produced during the light-dependent stage\nThe Calvin cycle happens in the stroma of the chloroplast\nCarbon dioxide is fixed into a five-carbon sugar using the ATP and NADPH made earlier\nThe resulting sugar is used to build glucose and other carbohydrates\nPhotorespiration wastes carbon when the stomata close on hot days\nC4 plants avoid this by concentrating CO2 around RuBisCO'),
      n('bullets', 'Bullets in the summary', { def: 5, min: 2, max: 12, step: 1 }),
      n('keywords', 'Key terms to list', { def: 8, min: 3, max: 20, step: 1 }),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.notes)).map(stripBullet).filter((l) => l.length > 8)
      if (raw.length < 3) return [sres('Summary', 'Add at least three note lines first', T.warn)]
      const wantB = clamp(Math.round(asNum(v.bullets)) || 5, 2, 12)
      const wantK = clamp(Math.round(asNum(v.keywords)) || 8, 3, 20)
      const key = keyphrases(raw.join(' '), wantK)
      const ranked = raw
        .map((l) => {
          const c = content(l)
          const digits = /\d/.test(l) ? 1 : 0
          return { text: l, score: c.length + digits * 2 + (l.length > 100 ? 1 : 0), density: c.length / Math.max(1, words(l).length) }
        })
        .sort((a, b) => b.score - a.score)
      const bullets = ranked.slice(0, wantB)
      const oneLiner = key.slice(0, 3).map((t) => t.term).join(' · ') || ranked[0].text.slice(0, 80)
      const origWords = words(raw.join(' ')).length
      const sumWords = words(bullets.map((b) => b.text).join(' ')).length
      const compression = origWords / Math.max(1, sumWords)
      const covered = key.filter((k) => bullets.some((b) => b.text.toLowerCase().includes(k.term))).length
      const questions = key.slice(0, Math.min(6, key.length)).map((k) => `What is the role of "${k.term}" — and where does it appear in your notes?`)
      const dropped = raw.length - bullets.length
      return [
        sres('Compression', `${num(compression, 1)}x`, compression > 2 ? T.good : T.warn, `${num(origWords, 0)} words → ${num(sumWords, 0)} words in ${num(bullets.length, 0)} bullets`, clamp(Math.min(100, (compression / 4) * 100), 5, 100)),
        sres('Key term coverage', `${num(covered, 0)}/${num(key.length, 0)}`, covered >= key.length * 0.6 ? T.good : T.warn, covered >= key.length * 0.6 ? 'the summary preserves most of your important terms' : 'important terms are missing from the summary — they may be the ones to revise hardest', clamp((covered / Math.max(1, key.length)) * 100, 5, 100)),
        sres('Lines dropped', num(dropped, 0), dropped > raw.length * 0.5 ? T.warn : T.good, `${num(dropped, 0)} of ${num(raw.length, 0)} lines are not in the summary — check that nothing important was lost`, clamp(100 - (dropped / Math.max(1, raw.length)) * 100, 5, 100)),
        docr('One-line summary', oneLiner),
        docr('Summary bullets', bullets.map((b, i) => `${i + 1}. ${b.text}`).join('\n')),
        docr('Key terms', key.length ? key.map((k) => `${k.term} (×${k.count})`).join(' · ') : 'no key terms detected — the text may be too generic to summarise'),
        docr('Self-test questions', questions.length ? questions.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'add more detail to generate self-test questions'),
        res('Test before you trust it', 'close the notes, write your own one-line summary, then compare. If yours is materially different, the difference is exactly what you have not understood.', T.good),
        res('A summary is not a set of notes', 'five bullets will always be shorter than twenty notes, and something is always lost. The point is that the lost thing is usually the detail you can reconstruct — and the thing you cannot reconstruct is the thing the self-test questions above will find.', T.neutral),
        res('Frequency is not importance', 'key terms are ranked by how often they appear. Your most important idea may appear once. Skim the dropped lines manually and promote anything that matters.', T.warn),
      ]
    },
  },
  {
    id: 'checklist-maker-notes',
    name: 'Checklist Maker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb: 'Generates a phase-appropriate checklist for any academic task, with a definition of done and an honest time estimate.',
    tip: 'A checklist you finish is worth more than a perfect one you abandon. Write three items, not thirty.',
    usage: ['Name the task and pick the phase.', 'Choose the optional extras.', 'Read the checklist and the definition of done.'],
    method: ['Phase templates supply the core items.', 'Extras add conditional items.', 'Items are timed and a completion bar is produced.'],
    fields: [
      txt('task', 'The task', 2, 'Literature review for the dissertation'),
      sel('phase', 'Phase', ['Planning', 'Research', 'Drafting', 'Editing', 'Final checks', 'Submission'], 'Editing'),
      ck('extras', 'Extras to include', ['Citation check', 'Plagiarism / similarity check', 'Supervisor review', 'Accessibility pass', 'Word count against limit', 'Reference list build']),
    ],
    compute: (v) => {
      const task = asStr(v.task).trim() || 'this task'
      const phase = asSel(v.phase)
      const extras = asBoolList(v.extras).map(Boolean)
      const EXTRA_LABELS = ['Citation check', 'Plagiarism / similarity check', 'Supervisor review', 'Accessibility pass', 'Word count against limit', 'Reference list build']
      const PHASES: Record<string, string[]> = {
        Planning: ['Write the task in one sentence: what is done when this is finished', 'List the deliverable and any format or marking criteria that constrain it', 'Identify the deadline, and the deadline before it that you actually work to', 'Break the task into chunks of no more than 90 minutes', 'Decide what "good enough" looks like, in writing, before you start', 'Name the one resource or person you will ask for help if you get stuck'],
        Research: ['Define 5–8 search terms, including synonyms and one phrase search', 'Set up a reference manager and capture sources as you find them, not later', 'Read abstracts first; only read in full what survives that test', 'Record for each source: claim, evidence, and how you will use it', 'Stop searching when three new sources stop adding anything new', 'Write a one-page synthesis of what you found before you start drafting'],
        Drafting: ['Write the structure as headings first, with one sentence under each', 'Draft the hardest section first, while you still have energy', 'Cite as you write, never afterwards', 'Leave a placeholder for every gap rather than writing around it', 'Do not edit while drafting — fix structure, then language, then punctuation', 'Get to the end of a rough draft even if it is bad; a bad draft can be fixed, an unfinished one cannot'],
        Editing: ['Read the draft once without editing, marking only where it loses you', 'Cut 10% — every draft is at least a tenth too long', 'Check every claim has evidence and every citation is in the text', 'Check structure: does each section earn its place and follow the last', 'Check terminology is consistent and defined at first use', 'Read it aloud — your ear finds what your eye skips'],
        'Final checks': ['Word count against the limit, allowing for references or not as required', 'Every in-text citation appears in the reference list, and vice versa', 'Figures, tables and equations are numbered, captioned and referenced in the text', 'Spell check and grammar pass, including your own name and institution spelled correctly', 'File name, format and size match the submission requirements', 'Open the file on a second device to confirm it is not corrupted'],
        Submission: ['Confirm the deadline, the time zone and the submission channel', 'Submit early — at least 24 hours before the deadline', 'Save the receipt or confirmation email to a place you will remember', 'Keep the exact submitted file — resubmitting a different version is a common disaster', 'Note what happens after submission, and when you will hear back', 'Send yourself an email saying it is done, so you stop re-checking'],
      }
      const core = PHASES[phase] || PHASES.Planning
      const EXTRAS: Record<string, string> = {
        'Citation check': 'Re-read every source and confirm the citation says what the sentence claims — the most common academic error is citing accurately for a claim you did not make.',
        'Plagiarism / similarity check': 'Run a similarity check. Any hit over about 10% needs a look; block quotes still need citation and your own commentary.',
        'Supervisor review': 'Send a specific question, not "any feedback?". Supervisors answer pointed questions and ignore open ones.',
        'Accessibility pass': 'Check heading levels, alt text on images, table headers and colour contrast. A PDF that is unreadable to a screen reader is unreadable to your marker if they use one.',
        'Word count against limit': 'Check the count excluding references if that is the rule, and check it now rather than at 2am the night before.',
        'Reference list build': 'Rebuild the reference list from your reference manager so formatting is uniform, then check the required style by hand for two entries — generators get journal requirements wrong.',
      }
      const extraItems = EXTRA_LABELS.filter((_, i) => extras[i]).map((l) => EXTRAS[l])
      const items = [...core, ...extraItems]
      const mins = items.length * 12 + core.length * 6
      const late = phase === 'Final checks' || phase === 'Submission'
      return [
        sres('Checklist', `${num(items.length, 0)} items`, T.good, `${phase.toLowerCase()} phase for "${task.slice(0, 50)}"`, clamp((items.length / 14) * 100, 5, 100)),
        sres('Estimated time', `${num(mins / 60, 1)} hours`, mins > 240 ? T.warn : T.good, mins > 240 ? 'more than a working day — this is at least two sessions, not one' : 'fits in a single focused session or two', clamp(100 - (mins / 360) * 100, 5, 100)),
        sres('Phase', phase, late ? T.warn : T.neutral, late ? 'you are close to submission — final checks are the phase people skip, and they are the only ones that catch fatal errors' : 'earlier in the process, which is the cheaper place to be'),
        docr('Checklist', items.map((it, i) => `☐ ${i + 1}. ${it}`).join('\n')),
        docr('Definition of done', [`${task} is done when:`, ...core.map((c) => `  · ${c}`)].join('\n')),
        res('Three items beat thirty', 'if this list feels long, you will not finish it. Pick the three items whose absence would be fatal, do those, and add the rest only if time remains.', T.warn),
        res('Definition of done first', 'agreeing what "finished" means before you start is the cheapest way to avoid the infinite polishing loop that consumes most of a deadline.', T.good),
        res('Print or bookmark it', 'a checklist that lives in your head is not a checklist. Put it where you will see it every time you sit down to work.', T.neutral),
      ]
    },
  },
  {
    id: 'to-do-list-notes',
    name: 'Study To-Do Planner',
    archetype: 'timeline',
    subject: SUBJECT,
    blurb: 'Parses your task list, estimates effort, classifies urgency and schedules the work across the days you have.',
    tip: 'The tasks you keep re-reading without starting are the ones you have not decided how to begin. Give each one a physical first action.',
    usage: ['List your tasks, one per line, marking urgent with !.', 'Set days available and daily minutes.', 'Read the daily plan and the overload report.'],
    method: ['Task markers are parsed and effort estimated by length.', 'Tasks are sorted and distributed across days.', 'Capacity is compared against demand.'],
    fields: [
      txt('tasks', 'Tasks (one per line; ! = urgent, ? = not sure how to start)', 14, 'Read chapter 4 and summarise it\n! Draft the methodology section\nRewrite the introduction\nEmail the supervisor about the extension\n? Solve the differential equations set 3\nFormat all references in Harvard style\nProofread the whole document'),
      n('days', 'Days available', { def: 5, min: 1, max: 60, step: 1 }),
      n('mins', 'Minutes available per day', { def: 90, min: 15, max: 600, step: 15 }),
      sel('strategy', 'Scheduling strategy', ['Spread evenly', 'Front-load the hard work', 'Back-load easy work at the end', 'Only things with deadlines'], 'Spread evenly'),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.tasks)).map(stripBullet).filter(Boolean)
      if (raw.length < 1) return [sres('Planner', 'Add at least one task first', T.warn)]
      const days = clamp(Math.round(asNum(v.days)) || 5, 1, 60)
      const perDay = clamp(Math.round(asNum(v.mins)) || 90, 15, 600)
      const strategy = asSel(v.strategy)
      const tasks = raw.map((l, i) => {
        const urgent = l.startsWith('!') || l.startsWith('?') === false && /\b(urgent|asap|today|tonight|deadline)\b/i.test(l)
        const unsure = l.startsWith('?')
        const text = l.replace(/^[!?]\s*/, '').trim() || `Task ${i + 1}`
        const w = words(text).length
        const mins = w <= 4 ? 15 : w <= 9 ? 30 : w <= 18 ? 60 : 120
        return { text, urgent, unsure, mins, effort: (w <= 4 ? 1 : w <= 9 ? 2 : w <= 18 ? 3 : 4) }
      })
      const totalNeeded = tasks.reduce((s, t) => s + t.mins, 0)
      const capacity = perDay * days
      const over = totalNeeded > capacity
      const ordered = strategy === 'Front-load the hard work'
        ? tasks.slice().sort((a, b) => b.effort - a.effort || Number(b.urgent) - Number(a.urgent))
        : strategy === 'Back-load easy work at the end'
          ? tasks.slice().sort((a, b) => a.effort - b.effort || Number(b.urgent) - Number(a.urgent))
          : tasks.slice().sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.effort - a.effort)
      const plan: string[] = []
      let cursor = 0
      let dayLoad = 0
      let day = 1
      while (cursor < ordered.length && day <= days) {
        const line: string[] = []
        let used = 0
        while (cursor < ordered.length && dayLoad + ordered[cursor].mins <= perDay) {
          const t = ordered[cursor]
          line.push(`  ☐ [${num(t.mins, 0)}m] ${t.text}${t.unsure ? '  ← start here: it is blocking you' : ''}`)
          cursor++
          dayLoad += t.mins
        }
        if (!line.length) {
          const t = ordered[cursor]
          line.push(`  ☐ [${num(t.mins, 0)}m, overruns your daily limit] ${t.text}`)
          cursor++
          used = perDay + t.mins
        } else used = dayLoad
        plan.push(`DAY ${day} (${num(used, 0)} of ${num(perDay, 0)} min used)${used > perDay ? ' — over capacity' : ''}\n${line.join('\n')}`)
        dayLoad = 0
        day++
      }
      const unscheduled = cursor < ordered.length ? ordered.slice(cursor) : []
      const unsureList = tasks.filter((t) => t.unsure)
      const donePct = ((ordered.length - unscheduled.length) / tasks.length) * 100
      return [
        sres('Total work', `${num(totalNeeded, 0)} min`, over ? T.bad : T.good, `${num(tasks.length, 0)} tasks · capacity ${num(capacity, 0)} min over ${num(days, 0)} days`, clamp((capacity / Math.max(1, totalNeeded)) * 100, 5, 100)),
        sres('Fits the time you have', over ? `${num(totalNeeded - capacity, 0)} min short` : `${num(capacity - totalNeeded, 0)} min slack`, over ? T.bad : T.good, over ? 'you are over capacity. Cut, delegate, or extend the deadline deliberately' : 'everything fits with room to absorb one surprise'),
        sres('Scheduled', `${num(ordered.length - unscheduled.length, 0)}/${num(tasks.length, 0)}`, unscheduled.length ? T.bad : T.good, unscheduled.length ? `${num(unscheduled.length, 0)} task(s) do not fit in ${num(days, 0)} days at ${num(perDay, 0)} min/day` : 'everything fits', donePct),
        docr('Daily plan', plan.join('\n\n')),
        unscheduled.length ? docr('Does not fit', unscheduled.map((t) => `  · ${t.text} — ${num(t.mins, 0)} min`).join('\n')) : res('Nothing dropped', 'every task is scheduled inside the time you have.', T.good),
        unsureList.length ? res('Tasks that are blocking you', `${unsureList.length} task(s) you flagged as unclear: ${unsureList.map((t) => `"${t.text}"`).join('; ')}. Each needs a first physical action, not a plan — open the file, do the first five minutes, and the block dissolves.`, T.warn) : res('No blockers', 'you did not flag any task as unclear, which usually means you are comfortable with all of them.', T.neutral),
        res('Urgent is not important', 'the ! marker tells you what feels pressing, not what matters. Rank by what a marker would reward, then let urgency reorder the schedule within that.', T.neutral),
        res('Protect the first hour', 'the first hour of a day decides the next three. Do the hardest task first, before you are tired enough to switch to something easier that still counts as progress.', T.good),
      ]
    },
  },
  {
    id: 'assignment-tracker-notes',
    name: 'Assignment Tracker',
    archetype: 'tracker',
    subject: SUBJECT,
    blurb: 'Tracks assignments, projects weighted marks and deadlines, and projects your final grade from current progress.',
    tip: 'A weighted grade is a live number, not a final one. The moment you can see it, every unfinished item has a visible cost.',
    usage: ['List assignments as name | days left | weight | status.', 'Set the course total.', 'Read the timeline, the projection and the load report.'],
    method: ['Each line is parsed into a tracked assignment.', 'Weighted score is projected from status.', 'Weekly load and urgency are reported.'],
    fields: [
      txt('items', 'Assignments: name | days left | weight % | status (not-started / in-progress / done)', 14, 'Literature review | 12 | 20 | in-progress\nData collection | 26 | 25 | not-started\nAnalysis and results | 40 | 30 | not-started\nIndividual reflection | 5 | 10 | done\nGroup presentation | 18 | 15 | in-progress'),
      n('total', 'Course total marks', { def: 100, min: 10, max: 1000, step: 10 }),
    ],
    compute: (v) => {
      const raw = lines(asStr(v.items))
      if (raw.length < 1) return [sres('Tracker', 'Add at least one assignment first', T.warn)]
      const total = Math.max(1, asNum(v.total) || 100)
      const items = raw.map((l, i) => {
        const p = splitFields(l.replace(/^\s*[-*•]\s*/, ''))
        const days = Number(p[1]) || 0
        const weight = Number(p[2]) || 0
        const statusRaw = (p[3] || 'not-started').toLowerCase()
        const status = statusRaw.startsWith('done') || statusRaw.startsWith('submit') ? 'done' : statusRaw.startsWith('in') || statusRaw.startsWith('prog') || statusRaw.startsWith('wip') ? 'in-progress' : 'not-started'
        return { name: p[0] || `Assignment ${i + 1}`, days, weight, status }
      })
      const weightSum = items.reduce((s, it) => s + it.weight, 0)
      const earned = items.reduce((s, it) => s + (it.status === 'done' ? it.weight : it.status === 'in-progress' ? it.weight * 0.5 : 0), 0)
      const closedWeight = items.filter((it) => it.status === 'done').reduce((s, it) => s + it.weight, 0)
      const projected = total * ((earned + (weightSum - earned) * 0.75) / Math.max(1, weightSum))
      const current = total * (earned / Math.max(1, weightSum))
      const nextDue = items.filter((it) => it.status !== 'done').sort((a, b) => a.days - b.days)[0]
      const urgent = items.filter((it) => it.status !== 'done' && it.days <= 7)
      const stalled = items.filter((it) => it.status === 'in-progress' && it.days > 14)
      const next7 = items.filter((it) => it.status !== 'done' && it.days <= 7).reduce((s, it) => s + it.weight, 0)
      const underweight = weightSum < total * 0.95
      return [
        sres('Current projection', `${num(current, 1)} / ${num(total, 0)}`, current >= total * 0.7 ? T.good : current >= total * 0.5 ? T.warn : T.bad, `in-progress work counted at half credit · ${num(items.filter((it) => it.status === 'done').length)} of ${num(items.length, 0)} complete`, clamp((earned / Math.max(1, weightSum)) * 100, 5, 100)),
        sres('Weight accounted for', `${num(weightSum, 0)}%`, Math.abs(weightSum - 100) <= 2 ? T.good : T.warn, Math.abs(weightSum - 100) <= 2 ? 'weights sum to 100% — the projection is reliable' : underweight ? `${num(100 - weightSum, 0)}% of the course is unaccounted for, so this projection is optimistic` : `weights sum to ${num(weightSum, 0)}% — check for a typo`, clamp(100 - Math.abs(100 - weightSum), 5, 100)),
        sres('Next deadline', nextDue ? `${nextDue.name} in ${num(nextDue.days, 0)}d` : 'nothing outstanding', urgent.length ? T.bad : T.warn, nextDue ? `${num(nextDue.weight, 0)}% of the grade · currently ${nextDue.status}` : 'all items are marked done', nextDue ? clamp(100 - nextDue.days * 3, 5, 100) : 100),
        sres('Next 7 days', `${num(next7, 0)}% of grade`, next7 > 30 ? T.bad : next7 > 15 ? T.warn : T.good, `${num(urgent.length, 0)} item(s) due within a week`, clamp(100 - next7, 5, 100)),
        docr('Timeline', items.slice().sort((a, b) => a.days - b.days).map((it) => {
          const bar = it.days > 30 ? '░'.repeat(20) : it.days > 14 ? '▒'.repeat(Math.ceil((it.days / 31) * 20)) : '█'.repeat(Math.max(1, Math.ceil((it.days / 31) * 20)))
          return `d-${String(it.days).padStart(2, '0')} |${bar}| ${num(it.weight, 0)}%  ${it.name}  [${it.status}]`
        }).join('\n')),
        docr('Detail', items.map((it) => `${it.name}\n   due in ${num(it.days, 0)} days · ${num(it.weight, 0)}% of grade · ${it.status}\n   credit if submitted now: ${num(total * (it.weight / Math.max(1, weightSum)) * (it.status === 'done' ? 1 : it.status === 'in-progress' ? 0.5 : 0), 1)} / ${num(total * (it.weight / Math.max(1, weightSum)), 1)} marks`).join('\n\n')),
        stalled.length ? res('Stalled work', `${stalled.length} item(s) have more than two weeks left but are still in progress: ${stalled.map((s) => s.name).join(', ')}. Either schedule the next session now with a date on it, or move them to not-started and be honest about it.`, T.warn) : res('Nothing stalled', 'every in-progress item has meaningful time left, which is the healthy state.', T.good),
        res('Half credit is a guess, not a measurement', 'the projection counts in-progress work at 50%. That number is a placeholder — replace it with your honest estimate, because a projection built on a guess gives false comfort.', T.neutral),
        res('Locked-in grade', `you have already banked ${num(closedWeight, 0)}% of the course. That is the floor you cannot lose. Everything else is still negotiable, which is worth remembering in the week everything is due.`, T.good),
        res('Predictable outcome', `${num(projected, 1)} is what you finish at if every remaining item is completed and scores 75% of its weight. The useful question is not "what is my grade" but "which single unfinished item, if completed, moves it most" — then do that one.`, T.neutral),
      ]
    },
  },
  {
    id: 'project-task-planner-notes',
    name: 'Project Task Planner',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb: 'Builds a week-by-week work breakdown for a project, with a critical path, per-person load and schedule risk.',
    tip: 'Projects fail on the integration week, not the research week. Build the thing that has to work end to end as early as you can.',
    usage: ['Name the project, deadline and team size.', 'Pick the current phase.', 'Read the schedule, the critical path and the risk report.'],
    method: ['A standard WBS is scaled to your week count.', 'Tasks are chained to show dependencies.', 'Per-person load and buffer are calculated.'],
    fields: [
      txt('project', 'Project', 2, 'Mobile app to help first-years find their lab placements'),
      n('weeks', 'Weeks available', { def: 12, min: 3, max: 60, step: 1 }),
      n('team', 'Team size', { def: 3, min: 1, max: 30, step: 1 }),
      sel('phase', 'Current phase', ['Exploration', 'Research', 'Design', 'Build', 'Test', 'Write-up', 'Presentation'], 'Build'),
      ck('milestones', 'Fixed milestones', ['Midpoint review', 'Prototype demo', 'Ethics or approval', 'Final submission', 'Client handover']),
    ],
    compute: (v) => {
      const project = asStr(v.project).trim() || 'this project'
      const weeks = clamp(Math.round(asNum(v.weeks)) || 12, 3, 60)
      const team = clamp(Math.round(asNum(v.team)) || 1, 1, 30)
      const phase = asSel(v.phase)
      const ms = asBoolList(v.milestones).map(Boolean)
      const MS_LABELS = ['Midpoint review', 'Prototype demo', 'Ethics or approval', 'Final submission', 'Client handover']
      const PHASES: { name: string; share: number; tasks: string[]; depends: string }[] = [
        { name: 'Exploration', share: 0.08, tasks: ['Define the problem in one sentence', 'Interview 5 potential users', 'List the three assumptions that would kill the idea'], depends: '' },
        { name: 'Research', share: 0.15, tasks: ['Literature and prior-art review', 'Technical feasibility spike', 'Requirement list with priorities'], depends: 'Exploration' },
        { name: 'Design', share: 0.17, tasks: ['User flows and wireframes', 'Data model and API contract', 'Design review and sign-off'], depends: 'Research' },
        { name: 'Build', share: 0.25, tasks: ['Core path works end to end, badly', 'Second feature', 'Third feature', 'Error handling and empty states'], depends: 'Design' },
        { name: 'Test', share: 0.15, tasks: ['Test with real users, not the team', 'Fix what testing found', 'Regression pass on the core path'], depends: 'Build' },
        { name: 'Write-up', share: 0.12, tasks: ['Report or thesis sections', 'Figures, tables and references', 'Proofread and format'], depends: 'Build' },
        { name: 'Presentation', share: 0.08, tasks: ['Slide outline with assertion titles', 'Three full run-throughs', 'Prepare for the eight hardest questions'], depends: 'Test' },
      ]
      const shares = PHASES.map((p) => p.share)
      const total = shares.reduce((s, x) => s + x, 0)
      const plan: string[] = []
      let week = 1
      const rows: { phase: string; week: number; length: number; tasks: string[]; depends: string }[] = []
      PHASES.forEach((p) => {
        const length = Math.max(1, Math.round((p.share / total) * weeks))
        rows.push({ phase: p.name, week, length, tasks: p.tasks, depends: p.depends })
        week += length
      })
      const over = week - 1
      rows.forEach((r) => {
        const end = r.week + r.length - 1
        const msHere: string[] = []
        if (ms[0] && end >= Math.round(weeks * 0.4) && end <= Math.round(weeks * 0.4) + 1) msHere.push('Midpoint review')
        if (ms[1] && end >= Math.round(weeks * 0.55) && end <= Math.round(weeks * 0.55) + 1) msHere.push('Prototype demo')
        if (ms[2] && end >= Math.round(weeks * 0.2) && end <= Math.round(weeks * 0.2) + 1) msHere.push('Ethics or approval')
        if (ms[3] && end === over) msHere.push('Final submission')
        if (ms[4] && end === over) msHere.push('Client handover')
        plan.push(`WEEKS ${r.week}–${end} — ${r.phase.toUpperCase()}${msHere.length ? `  ⚑ ${msHere.join(', ')}` : ''}  (${project})\n${r.tasks.map((t) => `  · ${t}`).join('\n')}${r.depends ? `\n  depends on: ${r.depends}` : ''}`)
      })
      const critical = rows.filter((r) => r.depends === '' || r.depends === 'Build' || r.depends === 'Test')
      const critWeeks = critical.reduce((s, r) => s + r.length, 0)
      const bufferWeeks = weeks - over
      const perPerson = Math.round((weeks * 5) / team)
      const currentRow = rows.find((r) => r.phase === phase)
      const behind = currentRow ? over - currentRow.week - currentRow.length : 0
      return [
        sres('Schedule', `${num(over, 0)} weeks planned`, bufferWeeks >= 1 ? T.good : T.warn, `${num(weeks, 0)} available · ${num(bufferWeeks, 0)} week(s) buffer`, clamp(Math.max(0, bufferWeeks) * 50, 5, 100)),
        sres('Critical path', `${num(critWeeks, 0)} weeks`, critWeeks > weeks * 0.8 ? T.bad : T.good, 'exploration → research → design → build → test → presentation. These cannot be compressed; everything else can.', clamp(100 - Math.max(0, (critWeeks - weeks * 0.7) * 10), 5, 100)),
        sres('Load per person', `${num(perPerson, 0)} working days`, team > weeks ? T.warn : T.good, `${num(team, 0)} people over ${num(weeks, 0)} weeks — each person owns a whole deliverable, not a fraction of one`, clamp(Math.min(100, (weeks / Math.max(1, team)) * 25), 5, 100)),
        sres('Where you are', currentRow ? `week ${num(currentRow.week, 0)}–${num(currentRow.week + currentRow.length - 1, 0)}` : 'not scheduled', behind > 1 ? T.bad : behind > 0 ? T.warn : T.neutral, currentRow ? `you are in ${currentRow.phase.toLowerCase()}; ${behind > 0 ? `${num(behind, 0)} weeks behind where this plan says you should be` : 'on schedule'}` : 'phase not found in the plan'),
        docr('Schedule', plan.join('\n\n')),
        docr('Gantt', rows.map((r) => {
          const bar = ' '.repeat((r.week - 1) * 2) + '█'.repeat(Math.max(1, r.length * 2))
          return `${bar}  ${r.phase}`
        }).join('\n') + `\n(weeks 1–${num(over, 0)} of ${num(weeks, 0)} available)`),
        docr('Milestones', MS_LABELS.filter((_, i) => ms[i]).length ? MS_LABELS.filter((_, i) => ms[i]).map((l, i) => `${i + 1}. ${l}`).join('\n') : 'no fixed milestones selected — schedule a midpoint review anyway, it is the cheapest way to discover you are behind'),
        res('Build the ugly version first', 'the core path must work end to end before any feature is polished. A working ugly app beats a beautiful half-app, and integration is always the surprise.', T.warn),
        res('Buffer is not slack', `you have ${num(bufferWeeks, 0)} week(s) of buffer. If that is zero, every slip is a failure — the buffer is where the unexpected happens, and something always happens.`, bufferWeeks >= 1 ? T.good : T.bad),
        res('Own deliverables, not tasks', `with ${num(team, 0)} people, give each one a whole deliverable they can present alone. Shared ownership of a task is shared ownership of nothing.`, T.neutral),
        res('Write-ups run in parallel, not after', 'reporting is a separate workstream from building. Starting it in the last two weeks is the single most common cause of a missed deadline in student projects.', T.good),
      ]
    },
  },
]
