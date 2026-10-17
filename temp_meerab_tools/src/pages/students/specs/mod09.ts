import { n, sel, txt, dt, ck, res, T, asNum, asSel, asStr, asBoolList, clamp, num, ratio, days } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec, type StudentResult } from './studentSpec'

const SUBJECT = 'Study Planning & Revision'

function parseDate(s: string): Date {
  return new Date(s || new Date().toISOString().slice(0, 10))
}

function dayDiff(from: string, to: string): number {
  const a = parseDate(from).getTime()
  const b = parseDate(to).getTime()
  return Math.round((b - a) / 86400000)
}

function addDays(iso: string, add: number): string {
  const d = parseDate(iso)
  d.setDate(d.getDate() + add)
  return d.toISOString().slice(0, 10)
}

function fmt(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function spaced(rating: number[], interval: number): number {
  if (!rating.length) return interval
  let step = interval
  for (const r of rating) step = r < 3 ? 1 : Math.min(Math.round(step * 2.2), 365)
  return step
}

export const mod09: StudentSpec[] = [
  {
    id: 'study-plan-generator',
    name: 'Study Plan Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a day-by-day revision timetable from your exam date, available hours and subject list, with buffer days.',
    tip: 'Schedule the hardest subject when your focus peaks, and finish each day with a light review — the last thing you study is what you partly remember tomorrow.',
    usage: ['Enter the exam date and weekly hours.', 'List your subjects.', 'Read the generated schedule.'],
    method: ['Days to exam are counted from the date fields.', 'Available study hours are split per day.', 'Subjects are interleaved so nothing piles up at the end.'],
    fields: [dt('exam', 'Exam date'), dt('start', 'Plan start date'), n('hours', 'Study hours per day', { def: 2.5, min: 0.5, max: 10, step: 0.5 }), txt('subs', 'Subjects (one per line)', 4, 'Biology\nOrganic Chemistry\nStatistics\nAcademic Writing')],
    compute: (v) => {
      const exam = asStr(v.exam)
      const start = asStr(v.start)
      const d = exam ? dayDiff(start || new Date().toISOString().slice(0, 10), exam) : 0
      const list = asStr(v.subs).split('\n').map((s) => s.trim()).filter(Boolean)
      if (d <= 0) return [sres('Study plan', 'Exam date must be in the future', T.warn, 'set the exam date later than the plan start')]
      if (!list.length) return [sres('Study plan', 'Add at least one subject', T.warn)]
      const totalHours = d * asNum(v.hours)
      const perSubject = totalHours / list.length
      let cursor = 0
      const lines: string[] = []
      const base = start || new Date().toISOString().slice(0, 10)
      for (let i = 0; i < d && i < 30; i++) {
        const sub = list[cursor % list.length]
        cursor++
        const isLast = i >= d - 2
        lines.push(`${addDays(base, i)} — ${sub}: ${isLast ? 'final review + past paper' : `${ratio(asNum(v.hours), 1)} h focused session`}`)
      }
      if (d > 30) lines.push(`… +${d - 30} more days in the same rotation`)
      return [
        sres('Plan window', `${num(d, 0)} days to the exam`, d < 7 ? T.warn : T.good, `from ${fmt(parseDate(start || new Date().toISOString().slice(0, 10)))}`),
        sres('Total study time', `${ratio(totalHours, 1)} hours`, T.good, `${ratio(perSubject, 1)} h per subject across ${list.length} subjects`, Math.min(100, Math.round((totalHours / (d * 3)) * 100))),
        docr('Day-by-day schedule', lines.join('\n')),
        res('Buffer advice', d < 7 ? 'Very tight — prioritise the two weakest subjects' : d < 14 ? 'Add one full revision day before each exam' : 'Comfortable — add spaced retrieval practice', T.neutral),
      ]
    },
  },
  {
    id: 'pomodoro-timer-planning',
    name: 'Pomodoro Timer Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Plans a full Pomodoro session: focus blocks, breaks, cycles, total minutes and the exact end time.',
    tip: 'Twenty-five minutes works because the break is protected. Skip the break once and the next block will collapse — guard the cycle, not just the focus time.',
    usage: ['Enter your task and start time.', 'Set focus, break and cycle length.', 'Read the block-by-block timetable.'],
    method: ['Focus and break lengths alternate.', 'Each cycle contains both.', 'Blocks accumulate to a finish time.'],
    fields: [txt('task', 'Task', 1, 'Linear algebra problem set'), dt('start', 'Start time'), n('focus', 'Focus (min)', { def: 25, min: 5, max: 90, step: 5 }), n('brk', 'Break (min)', { def: 5, min: 1, max: 30, step: 1 }), n('cycles', 'Cycles', { def: 4, min: 1, max: 12, step: 1 }), n('longBrk', 'Long break (min)', { def: 15, min: 5, max: 60, step: 5 })],
    compute: (v) => {
      const f = asNum(v.focus) || 25
      const b = asNum(v.brk) || 5
      const c = Math.max(1, Math.round(asNum(v.cycles)) || 4)
      const lb = asNum(v.longBrk) || 15
      const startStr = asStr(v.start)
      const start = startStr ? parseDate(startStr) : new Date()
      const longEvery = 4
      let cursor = new Date(start.getTime())
      const lines: string[] = []
      for (let i = 0; i < c; i++) {
        const s1 = fmt(new Date(cursor.getTime()))
        cursor = new Date(cursor.getTime() + f * 60000)
        lines.push(`Focus ${i + 1}/${c}: ${s1} → ${fmt(cursor)} (${ratio(f, 0)} min)`)
        if (i === c - 1) break
        const useLong = (i + 1) % longEvery === 0
        const len = useLong ? lb : b
        const s2 = fmt(cursor)
        cursor = new Date(cursor.getTime() + len * 60000)
        lines.push(`${useLong ? 'Long break' : 'Break'} (${ratio(len, 0)} min): ${s2} → ${fmt(cursor)}`)
      }
      const longs = Math.floor((c - 1) / longEvery)
      const total = c * f + (c - 1 - longs) * b + longs * lb
      return [
        sres('Session ends', fmt(cursor), T.good, `${c} focus blocks of ${ratio(f, 0)} min`),
        sres('Total focused time', `${ratio(c * f, 0)} minutes`, T.good, `${ratio(c * f / 60, 2)} h deep work`, Math.min(100, Math.round((c * f / total) * 100))),
        sres('Breaks', `${c - 1} total (${c - 1 - longs} short, ${longs} long)`, T.neutral, `a long break replaces the short one after every ${longEvery} blocks, so the rhythm stays 25-5, 25-5, 25-5, 25-15`, 70),
        docr('Block timetable', lines.join('\n')),
        res('Full session length', `${ratio(total, 0)} min including breaks`, T.neutral, `${ratio(total - c * f, 0)} min of that is protected break time`),
        res('Task', asStr(v.task) || 'Untitled session', T.neutral, 'one task per session keeps focus'),
      ]
    },
  },
  {
    id: 'spaced-repetition-planner',
    name: 'Spaced Repetition Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Generates expanding review intervals from your recall ratings, following the SM-2 style spacing principle.',
    tip: 'Recall beats rereading. Rate yourself honestly — an easy card gets a longer gap, and a failed card returns tomorrow.',
    usage: ['Enter recall ratings from hardest to easiest.', 'Set the first interval.', 'Read the scheduled review dates.'],
    method: ['Each rating multiplies the interval.', 'Low ratings reset the gap to one day.', 'Intervals expand to a maximum review horizon.'],
    fields: [txt('ratings', 'Recall ratings 1–5 (hardest first)', 3, '2, 4, 5, 1, 3, 4, 5, 2'), n('first', 'First interval (days)', { def: 1, min: 0.5, max: 30, step: 0.5 }), dt('start', 'Start date')],
    compute: (v) => {
      const ratings = asStr(v.ratings).split(/[\s,;]+/).map((x) => parseInt(x)).filter((x) => x >= 1 && x <= 5)
      if (!ratings.length) return [sres('Spaced plan', 'Enter ratings from 1 to 5', T.warn)]
      const start = asStr(v.start) || new Date().toISOString().slice(0, 10)
      let interval = asNum(v.first) || 1
      const lines: string[] = []
      let cursor = start
      const strengths: number[] = []
      ratings.forEach((r, i) => {
        interval = spaced([r], interval)
        cursor = addDays(cursor, Math.max(1, Math.round(interval)))
        lines.push(`Card ${i + 1} (rated ${r}/5): review on ${fmt(parseDate(cursor))} — gap ${Math.round(interval)}d`)
        strengths.push(r)
      })
      const avg = strengths.reduce((s, x) => s + x, 0) / strengths.length
      const nextDay = cursor
      return [
        sres('Last review', fmt(parseDate(cursor)), T.good, `${ratings.length} cards scheduled`),
        sres('Final interval', `${Math.round(interval)} days`, interval > 20 ? T.good : T.neutral, 'interval at the end of the deck'),
        sres('Mean recall', `${ratio(avg, 2)} / 5`, avg >= 4 ? T.good : avg >= 3 ? T.neutral : T.warn, avg >= 4 ? 'strong base — extend intervals' : avg >= 3 ? 'moderate — keep regular reviews' : 'weak — review these cards daily', (avg / 5) * 100),
        docr('Review schedule', lines.join('\n')),
        res('Mastery horizon', `all cards clear by ${fmt(parseDate(nextDay))}`, T.neutral),
      ]
    },
  },
  {
    id: 'revision-timetable-calculator',
    name: 'Revision Timetable Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Splits your available days evenly across subjects by weighting, producing a dated revision timetable.',
    tip: 'Weight by marks and by weakness. A long paper with small marks still needs a slot — allocate by exam length too.',
    usage: ['Enter the days to the exam.', 'Give each subject a weight.', 'Read the dated timetable.'],
    method: ['Weights are normalised to 100%.', 'Days are distributed by weight.', 'Each subject gets its dated sessions.'],
    fields: [n('days', 'Days until exams', { def: 21, min: 1, step: 1 }), dt('start', 'Start date'), txt('plan', 'Subject:weight per line', 4, 'Maths:5\nPhysics:4\nEnglish:3\nBiology:2')],
    compute: (v) => {
      const days = Math.max(1, Math.round(asNum(v.days)) || 21)
      const rows = asStr(v.plan).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const [name, w] = l.split(/[:=]/)
        return { name: (name || '').trim(), w: parseFloat(w) || 1 }
      })
      if (!rows.length) return [sres('Timetable', 'Add subjects as "Name:weight"', T.warn)]
      const totalW = rows.reduce((s, r) => s + r.w, 0)
      const start = asStr(v.start) || new Date().toISOString().slice(0, 10)
      let cursor = 0
      const lines: string[] = []
      const alloc: string[] = []
      rows.forEach((r) => {
        const share = (r.w / totalW) * days
        const slots = Math.max(1, Math.round(share))
        const dates: string[] = []
        for (let i = 0; i < slots; i++) { dates.push(addDays(start, Math.min(cursor, days - 1))); cursor += Math.max(1, Math.floor(days / slots)) }
        lines.push(`${r.name} — weight ${r.w}/${ratio(totalW, 0)} (${ratio((r.w / totalW) * 100, 1)}%): ${dates.slice(0, 6).map((d) => fmt(parseDate(d))).join(', ')}`)
        alloc.push(`${r.name}: ${slots} session${slots > 1 ? 's' : ''}`)
      })
      return [
        sres('Plan window', `${num(days, 0)} days`, days < 7 ? T.warn : T.good, `from ${fmt(parseDate(start))}`),
        sres('Total sessions', num(rows.reduce((s, r) => s + Math.max(1, Math.round((r.w / totalW) * days)), 0), 0), T.good, 'one session per allocated day'),
        docr('Timetable', lines.join('\n')),
        docr('Allocation', alloc.join('\n')),
        res('Review days', 'keep the final 2 days for light recall only', T.neutral, 'no new material this late'),
      ]
    },
  },
  {
    id: 'study-hours-tracker-planning',
    name: 'Study Hours Tracker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Logs your study sessions and reports totals, averages per subject and a consistency verdict against your target.',
    tip: 'Track hours honestly for two weeks and the pattern becomes obvious. Most people study in bursts, not steadily — knowing that is the first fix.',
    usage: ['Enter hours per subject.', 'Set your weekly target.', 'Read totals and consistency.'],
    method: ['Hours are summed by subject.', 'Weekly total is compared to target.', 'Consistency scores the gap.'],
    fields: [txt('hours', 'Hours per subject (name:hours)', 5, 'Maths:4\nPhysics:3\nEnglish:2\nRevision:1.5'), n('target', 'Weekly target hours', { def: 15, min: 1, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.hours).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const [name, h] = l.split(/[:=]/)
        return { name: (name || '').trim(), h: parseFloat(h) || 0 }
      }).filter((r) => r.name)
      if (!rows.length) return [sres('Tracker', 'Add entries as "Subject:hours"', T.warn)]
      const total = rows.reduce((s, r) => s + r.h, 0)
      const target = asNum(v.target) || 1
      const pct = (total / target) * 100
      const top = [...rows].sort((a, b) => b.h - a.h)[0]
      return [
        sres('Total this week', `${ratio(total, 2)} hours`, total >= target ? T.good : T.warn, `target ${ratio(target, 0)} h`, clamp(pct, 0, 100)),
        sres('Target progress', `${ratio(pct, 1)}%`, pct >= 100 ? T.good : T.neutral, pct >= 100 ? 'target met — protect the streak' : `short by ${ratio(target - total, 1)} h`, clamp(pct, 0, 100)),
        docr('By subject', rows.sort((a, b) => b.h - a.h).map((r) => `${r.name}: ${ratio(r.h, 2)} h (${ratio((r.h / total) * 100, 1)}%)`).join('\n')),
        res('Biggest block', `${top.name} — ${ratio(top.h, 1)} h`, top.h / total > 0.6 ? T.warn : T.neutral, top.h / total > 0.6 ? 'one subject dominates — check balance' : 'reasonably balanced'),
        res('Daily average', `${ratio(total / 7, 2)} h/day over 7 days`, T.neutral),
      ]
    },
  },
  {
    id: 'flashcard-maker-memory',
    name: 'Flashcard Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Turns a study topic into question-and-answer flashcards using cloze deletion, key-term extraction and list splitting.',
    tip: 'Write cards that ask one thing. "Define mitosis" is a good card; "Summarise the cell cycle" is not — split it.',
    usage: ['Paste your notes or key terms.', 'Choose a card style.', 'Read the generated cards.'],
    method: ['Key terms are extracted from the text.', 'Cloze blanks or Q/A pairs are produced.', 'Cards are truncated for review speed.'],
    fields: [txt('notes', 'Notes or key terms', 6, 'Mitosis is the process of cell division that produces two genetically identical daughter cells. Prophase begins spindle formation. Telophase sees nuclear envelopes reform.'), sel('style', 'Card style', ['Cloze (fill in the blank)', 'Question & answer', 'Term ↔ definition'], 'Cloze (fill in the blank)'), n('limit', 'Number of cards', { def: 8, min: 1, max: 30, step: 1 })],
    compute: (v) => {
      const notes = asStr(v.notes).trim()
      if (!notes) return [sres('Flashcards', 'Paste some notes first', T.warn)]
      const style = asSel(v.style)
      const limit = Math.max(1, Math.round(asNum(v.limit)) || 8)
      const sentences = notes.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 15)
      const terms = [...new Set((notes.match(/\b[A-Z][a-z]{3,}\b/g) || []))]
      const cards: string[] = []
      if (style === 'Cloze (fill in the blank)') {
        sentences.slice(0, limit).forEach((s) => {
          const words = s.split(' ')
          const idx = words.findIndex((w) => w.length > 5 && !/^(that|which|their|these|those)$/i.test(w))
          if (idx < 0) return
          cards.push(`${words.slice(0, idx).join(' ')} _____ ${words.slice(idx + 1).join(' ')}`)
        })
      } else if (style === 'Question & answer') {
        sentences.slice(0, limit).forEach((s) => {
          const q = s.split(' is ')[0].split(' are ')[0].split(' that ')[0]
          cards.push(`Q: What is true about "${q.trim()}..."?\nA: ${s.length > 120 ? s.slice(0, 117) + '…' : s}`)
        })
      } else {
        terms.slice(0, limit).forEach((t) => {
          const hit = sentences.find((s) => s.includes(t))
          cards.push(`${t} → ${hit ? (hit.length > 110 ? hit.slice(0, 107) + '…' : hit) : 'define this term from your notes'}`)
        })
      }
      if (!cards.length) cards.push('Add longer sentences with key terms to generate cards.')
      return [
        sres('Cards generated', num(cards.length, 0), cards.length ? T.good : T.warn, `${style} · cap ${limit}`, Math.min(100, Math.round((cards.length / limit) * 100))),
        docr('Flashcards', cards.map((c, i) => `Card ${i + 1}: ${c}`).join('\n\n')),
        res('Key terms detected', terms.length ? terms.slice(0, 12).join(', ') : 'none', T.neutral, 'capitalised terms in your text'),
        res('Study tip', 'Say the answer aloud before you flip — active recall beats recognition.', T.neutral),
      ]
    },
  },
  {
    id: 'active-recall-tester',
    name: 'Active Recall Tester',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Runs a rapid-fire self-test: you type what you remember, then the tool scores your recall against your original notes.',
    tip: 'The gap between “it looks familiar” and “I could write it” is the real learning curve. Test yourself, then fix only the gaps.',
    usage: ['Paste your source notes.', 'Type your recall from memory.', 'Read the coverage score and missed points.'],
    method: ['Notes split into key concepts.', 'Your recall is token-matched to them.', 'Coverage and gaps are reported.'],
    fields: [txt('src', 'Source notes', 6, 'Photosynthesis converts light energy into chemical energy stored in glucose. Chlorophyll absorbs mainly blue and red wavelengths. Light-dependent reactions occur in the thylakoid membrane.'), txt('recall', 'What you remember (typed from memory)', 6, 'Photosynthesis makes glucose from light using chlorophyll in the thylakoid.')],
    compute: (v) => {
      const src = asStr(v.src).trim()
      const recall = asStr(v.recall).trim()
      if (!src) return [sres('Recall test', 'Add your source notes first', T.warn)]
      if (!recall) return [sres('Recall test', 'Type what you remember, then re-check', T.warn, 'blank recall is the baseline — write something first')]
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3)
      const srcWords = norm(src)
      const recSet = new Set(norm(recall))
      const concepts = [...new Set(srcWords.filter((w) => !['that', 'this', 'with', 'from', 'which', 'into', 'were', 'occurs', 'using', 'mainly', 'stored'].includes(w)))]
      const hit = concepts.filter((w) => recSet.has(w))
      const missed = concepts.filter((w) => !recSet.has(w))
      const coverage = concepts.length ? (hit.length / concepts.length) * 100 : 0
      const extra = [...recSet].filter((w) => !srcWords.includes(w))
      const verdict = coverage > 80 ? 'Excellent recall — ready for the exam' : coverage > 60 ? 'Good base — revisit the gaps' : coverage > 35 ? 'Partial recall — reread then retest' : 'Weak recall — study the source again, then retest'
      return [
        sres('Recall coverage', `${ratio(coverage, 1)}%`, coverage > 70 ? T.good : coverage > 40 ? T.warn : T.bad, `${hit.length} of ${concepts.length} key concepts recalled`, clamp(coverage, 0, 100)),
        sres('Verdict', verdict, coverage > 70 ? T.good : T.warn, 'coverage drives the verdict'),
        res('Missed concepts', missed.length ? missed.slice(0, 14).join(', ') : 'none', missed.length ? T.warn : T.good, 'these are your revision priorities'),
        res('Extra (not in notes)', extra.length ? extra.slice(0, 10).join(', ') : 'none', extra.slice(0, 10).length > 3 ? T.warn : T.neutral, 'possible confabulation — verify these'),
        res('Method note', 'overlap of content words; paraphrase correctly counts as recall', T.neutral),
      ]
    },
  },
  {
    id: 'study-strategy-generator',
    name: 'Study Strategy Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Recommends a tailored study strategy from your goal type, available time, energy level and subject difficulty.',
    tip: 'Match method to subject: calculation subjects need interleaved problem practice, definitions need spaced recall, arguments need writing practice.',
    usage: ['Choose your goal and energy level.', 'Enter weekly hours.', 'Read the recommended method mix.'],
    method: ['Goal type maps to dominant techniques.', 'Difficulty adjusts the practice share.', 'Time budget splits the method mix.'],
    fields: [sel('goal', 'Goal type', ['Memorise facts', 'Solve problems', 'Write arguments', 'Understand concepts', 'Exam revision'], 'Memorise facts'), sel('energy', 'Energy level', ['High', 'Medium', 'Low'], 'Medium'), n('hours', 'Hours per week', { def: 8, min: 1, max: 40, step: 1 }), sel('diff', 'Subject difficulty', ['Easy', 'Moderate', 'Hard'], 'Moderate')],
    compute: (v) => {
      const goal = asSel(v.goal)
      const hours = asNum(v.hours) || 1
      const energy = asSel(v.energy)
      const diff = asSel(v.diff)
      const base: Record<string, { m: string; w: number }[]> = {
        'Memorise facts': [{ m: 'Spaced flashcard recall', w: 50 }, { m: 'Active recall testing', w: 30 }, { m: 'Cloze summarising', w: 20 }],
        'Solve problems': [{ m: 'Interleaved problem sets', w: 45 }, { m: 'Worked-example fading', w: 30 }, { m: 'Error log review', w: 25 }],
        'Write arguments': [{ m: 'Timed essay writing', w: 40 }, { m: 'Outline-first drafting', w: 25 }, { m: 'Peer or marker feedback', w: 20 }, { m: 'Model-answer comparison', w: 15 }],
        'Understand concepts': [{ m: 'Self-explanation while reading', w: 40 }, { m: 'Concept mapping', w: 25 }, { m: 'Worked examples', w: 20 }, { m: 'Teach-back to a peer', w: 15 }],
        'Exam revision': [{ m: 'Past papers under timed conditions', w: 40 }, { m: 'Error log drilling', w: 25 }, { m: 'Weak-point flashcard sweep', w: 20 }, { m: 'Formula and fact recall', w: 15 }],
      }
      const mix = base[goal] || base['Memorise facts']
      const lines = mix.map((m) => `${m.m}: ${ratio((m.w / 100) * hours, 1)} h/week (${m.w}%)`)
      const adjust = energy === 'High' ? 'Place the hardest material in your high-energy slots.' : energy === 'Low' ? 'Start with low-effort recall before tackling hard problems.' : 'Alternate hard and light tasks to sustain attention.'
      const diffNote = diff === 'Hard' ? 'Add 30% more problem practice than listed; hard subjects need volume.' : diff === 'Easy' ? 'Shift 20% of the time to harder adjacent topics or self-testing.' : 'Keep the listed mix; adjust only after a diagnostic test.'
      return [
        sres('Primary method', mix[0].m, T.good, `dominant for ${goal.toLowerCase()}`, mix[0].w),
        sres('Weekly time budget', `${ratio(hours, 1)} hours`, T.good, `${lines.length} method blocks`),
        docr('Method mix', lines.join('\n')),
        res('Energy fit', adjust, T.neutral, 'timing matters as much as method'),
        res('Difficulty fit', diffNote, T.neutral),
        res('Session shape', '50 min focus / 10 min break, hardest task first', T.neutral),
      ]
    },
  },
  {
    id: 'exam-countdown-planning',
    name: 'Exam Countdown',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Counts days to each exam, ranks them by urgency, and flags clashes where two exams fall on the same day.',
    tip: 'Rank by urgency, not by anxiety. The exam that is tomorrow deserves tonight’s time, whatever it covers.',
    usage: ['Add each exam date and name.', 'Read the countdown and clash warnings.', 'Prioritise the top three.'],
    method: ['Days to each exam are computed.', 'Exams are sorted by date.', 'Same-day exams are flagged as clashes.'],
    fields: [txt('exams', 'One per line: YYYY-MM-DD Subject', 6, '2026-05-14 Organic Chemistry\n2026-05-16 Statistics\n2026-05-16 Molecular Biology\n2026-05-20 Advanced Calculus'), dt('today', 'Today’s date')],
    compute: (v) => {
      const today = asStr(v.today) || new Date().toISOString().slice(0, 10)
      const rows = asStr(v.exams).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const m = l.match(/^(\d{4}-\d{2}-\d{2})\s*(.*)$/)
        return m ? { date: m[1], name: m[2] || 'Exam', d: dayDiff(today, m[1]) } : null
      }).filter((r): r is { date: string; name: string; d: number } => !!r)
      if (!rows.length) return [sres('Countdown', 'Add exams as "YYYY-MM-DD Subject"', T.warn)]
      rows.sort((a, b) => a.d - b.d)
      const clashMap = new Map<string, string[]>()
      rows.forEach((r) => clashMap.set(r.date, [...(clashMap.get(r.date) || []), r.name]))
      const clashes = [...clashMap.entries()].filter((e) => e[1].length > 1)
      const lines = rows.map((r) => `${r.d >= 0 ? `${r.d} days` : `${Math.abs(r.d)} days PAST`} — ${fmt(parseDate(r.date))} — ${r.name}`)
      const next = rows[0]
      return [
        sres('Next exam', next.d >= 0 ? `${next.name} in ${days(next.d)}` : `${next.name} — date passed`, next.d < 0 ? T.bad : next.d <= 3 ? T.warn : T.good, fmt(parseDate(next.date))),
        sres('Exams tracked', num(rows.length, 0), T.neutral, `${rows.filter((r) => r.d > 0).length} still upcoming`),
        docr('Countdown list', lines.join('\n')),
        res('Clashes', clashes.length ? clashes.map((c) => `${fmt(parseDate(c[0]))}: ${c[1].join(' + ')}`).join('\n') : 'none', clashes.length ? T.bad : T.good, clashes.length ? 'same-day papers need an explicit split plan' : 'no same-day conflicts'),
        res('Priority', `1. ${rows[0]?.name}  2. ${rows[1]?.name || '—'}  3. ${rows[2]?.name || '—'}`, T.neutral, 'by nearest date'),
      ]
    },
  },
  {
    id: 'concept-map-builder',
    name: 'Concept Map Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds an indented concept hierarchy from a topic, main branches and sub-points, then checks structural completeness.',
    tip: 'A concept map is built top-down, not left-to-right. If you cannot name the main branches, you do not yet understand the topic.',
    usage: ['Name the topic and branches.', 'Add sub-points per branch.', 'Read the hierarchy and completeness check.'],
    method: ['Topic forms the root.', 'Each branch becomes a level-2 node.', 'Sub-points attach beneath their branch.'],
    fields: [txt('topic', 'Central topic', 1, 'Photosynthesis'), txt('branches', 'Main branches (one per line)', 4, 'Light-dependent reactions\nCalvin cycle\nInputs and outputs\nLimiting factors'), txt('subs', 'Sub-points per branch (one per line, use | to start a new branch)', 6, 'Chlorophyll absorbs red and blue light|Water splits to release oxygen\nCarbon dioxide is fixed into glucose|Ribulose bisphosphate is regenerated\nChlorophyll, CO2, light, temperature|Photosynthesis rate plateaus at high light')],
    compute: (v) => {
      const topic = asStr(v.topic).trim() || 'Central topic'
      const branches = asStr(v.branches).split('\n').map((s) => s.trim()).filter(Boolean)
      const subGroups = asStr(v.subs).split('\n').map((s) => s.replace(/^\|/, '').trim()).filter(Boolean)
      if (!branches.length) return [sres('Concept map', 'Add at least one main branch', T.warn)]
      const lines = [`${topic}`]
      branches.forEach((b) => {
        lines.push(`├── ${b}`)
        const subs = subGroups.filter((s) => s.length > 0)
        subs.forEach((s) => lines.push(`│   └── ${s}`))
      })
      const orphans = subGroups.filter((s) => !branches.some((b) => s.toLowerCase().includes(b.split(' ')[0].toLowerCase())))
      const depth = branches.length ? 2 : 1
      return [
        sres('Map structure', `${num(branches.length, 0)} branches · ${num(subGroups.length, 0)} sub-points`, branches.length >= 3 ? T.good : T.warn, `root: ${topic}`, Math.min(100, Math.round((branches.length / 5) * 100))),
        sres('Depth reached', `${depth} levels`, depth >= 3 ? T.good : T.neutral, depth >= 3 ? 'relational depth is present' : 'add sub-points to reach linking ideas'),
        docr('Concept map', lines.join('\n')),
        res('Orphan check', orphans.length ? `${orphans.length} sub-point(s) not obviously linked: ${orphans.slice(0, 3).join('; ')}` : 'all sub-points link to a branch', orphans.length ? T.warn : T.good),
        res('Method', 'add cross-links and labelled arrows for full marks', T.neutral),
      ]
    },
  },
  {
    id: 'revision-planner-estimator',
    name: 'Revision Planner Estimator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Estimates the hours needed to cover each topic, based on difficulty, material size and target grade, then compares to your budget.',
    tip: 'Estimate before revising and update weekly — a plan you never revisit is just a wish. Track actual hours against these numbers.',
    usage: ['List topics with difficulty and size.', 'Set your target grade and weekly budget.', 'Read total hours and shortfall.'],
    method: ['Base hours scale with material size.', 'Difficulty multiplies the estimate.', 'Target grade adds stretch hours.'],
    fields: [txt('topics', 'Topics (one per line: name | size 1-5 | difficulty 1-5)', 6, 'Cell structure | 3 | 2\nGenetics | 5 | 4\nEnzymes | 2 | 3\nPhotosynthesis | 4 | 3'), sel('grade', 'Target grade', ['C', 'B', 'A', 'A+'], 'B'), n('budget', 'Weekly hours available', { def: 10, min: 1, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.topics).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { name: p[0] || 'Topic', size: parseFloat(p[1]) || 3, diff: parseFloat(p[2]) || 3 }
      })
      if (!rows.length) return [sres('Estimate', 'Add topics as "name | size | difficulty"', T.warn)]
      const gradeMul: Record<string, number> = { C: 0.8, B: 1, A: 1.25, 'A+': 1.5 }
      const gm = gradeMul[asSel(v.grade)] || 1
      const estimates = rows.map((r) => ({ ...r, hrs: r.size * 1.5 * (0.7 + r.diff * 0.15) * gm }))
      const total = estimates.reduce((s, e) => s + e.hrs, 0)
      const weeks = Math.max(1, Math.ceil(total / asNum(v.budget)))
      const heaviest = [...estimates].sort((a, b) => b.hrs - a.hrs)[0]
      return [
        sres('Total revision hours', `${ratio(total, 1)} h`, T.good, `${num(rows.length, 0)} topics · target ${asSel(v.grade)}`),
        sres('Weeks needed', `${num(weeks, 0)} weeks`, total / asNum(v.budget) > 8 ? T.warn : T.good, `at ${ratio(asNum(v.budget), 0)} h/week`),
        docr('Per-topic estimate', estimates.sort((a, b) => b.hrs - a.hrs).map((e) => `${e.name}: ${ratio(e.hrs, 1)} h (size ${e.size}, difficulty ${e.diff})`).join('\n')),
        res('Heaviest topic', `${heaviest.name} — ${ratio(heaviest.hrs, 1)} h`, heaviest.hrs / total > 0.35 ? T.warn : T.neutral, 'allocate extra sessions here'),
        res('Budget fit', total / asNum(v.budget) > 8 ? 'budget too small — narrow scope or add hours' : 'budget is realistic', total / asNum(v.budget) > 8 ? T.bad : T.good),
      ]
    },
  },
  {
    id: 'exam-error-log',
    name: 'Exam Error Log',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Classifies your past exam errors by cause and topic, then tells you which error type costs you the most marks.',
    tip: 'Errors repeat far more than topics do. Fix “didn’t read the question” before you memorise another formula.',
    usage: ['Add each error with cause and topic.', 'Review the cause breakdown.', 'Drill your top cause first.'],
    method: ['Errors are grouped by cause.', 'Marks lost are totalled per cause.', 'The costliest cause is surfaced.'],
    fields: [txt('errors', 'One per line: marks lost | cause | topic', 6, '4 | misread the question | integration\n3 | misread the question | limits\n5 | forgot the formula | thermodynamics\n2 | forgot the formula | organic\n6 | ran out of time | exam technique\n1 | algebra slip | sequences'), n('outof', 'Total marks available', { def: 100, min: 1, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.errors).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { marks: parseFloat(p[0]) || 0, cause: p[1] || 'unspecified', topic: p[2] || 'general' }
      })
      if (!rows.length) return [sres('Error log', 'Add errors as "marks | cause | topic"', T.warn)]
      const byCause = new Map<string, number>()
      const byTopic = new Map<string, number>()
      rows.forEach((r) => {
        byCause.set(r.cause, (byCause.get(r.cause) || 0) + r.marks)
        byTopic.set(r.topic, (byTopic.get(r.topic) || 0) + r.marks)
      })
      const causeList = [...byCause.entries()].sort((a, b) => b[1] - a[1])
      const topicList = [...byTopic.entries()].sort((a, b) => b[1] - a[1])
      const lost = rows.reduce((s, r) => s + r.marks, 0)
      const out = asNum(v.outof) || 1
      const top = causeList[0]
      return [
        sres('Marks recoverable', `${ratio(lost, 1)} of ${num(out, 0)}`, lost / out > 0.2 ? T.warn : T.good, `${ratio((lost / out) * 100, 1)}% of the paper`, clamp(100 - (lost / out) * 100, 0, 100)),
        sres('Top cause', `${top[0]} — ${ratio(top[1], 1)} marks`, T.warn, 'fix this first: ' + (top[0].includes('read') ? 'slow down on question wording' : top[0].includes('formula') ? 'build a formula recall sheet' : top[0].includes('time') ? 'practise timed sections' : 'work through each instance slowly')),
        docr('By cause', causeList.map((c) => `${c[0]}: ${ratio(c[1], 1)} marks`).join('\n')),
        docr('By topic', topicList.map((c) => `${c[0]}: ${ratio(c[1], 1)} marks`).join('\n')),
        res('Error count', `${num(rows.length, 0)} logged`, T.neutral, 'track every loss, however small'),
      ]
    },
  },
  {
    id: 'weekly-planner',
    name: 'Weekly Study Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a seven-day study grid from your weekly hours, subject priorities and hard-task-first scheduling.',
    tip: 'Hardest task first, while you are sharp. Saving the difficult work for the evening guarantees it does not happen.',
    usage: ['Set total weekly hours.', 'List subjects with priority.', 'Read the day-by-day grid.'],
    method: ['Hours are distributed across seven days.', 'Priority decides which subject gets the best slots.', 'Sunday is kept lighter for review.'],
    fields: [n('hours', 'Weekly hours', { def: 14, min: 1, max: 60, step: 1 }), txt('subs', 'Subjects with priority 1-3', 5, 'Calculus | 3\nMechanics | 2\nLinear Algebra | 3\nEssay Drafting | 1')],
    compute: (v) => {
      const total = asNum(v.hours) || 1
      const subs = asStr(v.subs).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { name: p[0] || 'Study', pri: parseFloat(p[1]) || 2 }
      })
      if (!subs.length) return [sres('Weekly plan', 'Add subjects as "Name | priority"', T.warn)]
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const perDay = total / 6
      const lines: string[] = []
      const sorted = [...subs].sort((a, b) => b.pri - a.pri)
      let idx = 0
      days.forEach((d, i) => {
        if (i === 6) { lines.push(`${d}: review sweep — ${ratio(Math.max(0, total - perDay * 6), 1)} h`); return }
        const block = sorted[idx % sorted.length]
        const second = sorted[(idx + 1) % sorted.length]
        idx += 2
        lines.push(`${d}: ${block.name} ${ratio(perDay * 0.65, 1)} h (priority ${block.pri}) + ${second.name} ${ratio(perDay * 0.35, 1)} h`)
      })
      const priTotal = subs.reduce((s, x) => s + x.pri, 0) || 1
      return [
        sres('Weekly hours placed', `${ratio(total, 1)} h`, T.good, `${ratio(perDay, 1)} h/day over 6 days`, Math.min(100, Math.round((total / 20) * 100))),
        sres('Hardest slot', `${sorted[0].name} on ${days[0]}`, T.good, 'priority 3 work goes into your freshest slot'),
        docr('Day-by-day plan', lines.join('\n')),
        docr('Priority split', sorted.map((s) => `${s.name}: ${ratio((s.pri / priTotal) * total, 1)} h suggested`).join('\n')),
        res('Sunday', 'light review only — protect the weekly reset', T.neutral),
      ]
    },
  },
  {
    id: 'learning-style-analyzer',
    name: 'Learning Style Analyzer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Analyses a short self-report across visual, auditory, kinesthetic and reading channels and recommends a balanced method mix.',
    tip: 'Nobody is purely one style. Use multiple channels for the same idea — the mix beats the label, and evidence for strict learning styles is weak.',
    usage: ['Rate how you prefer to take in information.', 'Read your channel profile.', 'Apply the recommended mix.'],
    method: ['Each channel score is tallied.', 'Percentages give the profile.', 'The mix is balanced to cover gaps.'],
    fields: [ck('v', 'I learn best by…', ['Diagrams and colour-coded notes', 'Explaining out loud or discussing', 'Handling models and experiments', 'Careful written reading']), ck('t', 'I struggle when…', ['Text-only material', 'Silent individual work', 'Abstract theory', 'Fast-paced material']), n('subject', 'Subject difficulty', { def: 3, min: 1, max: 5, step: 1 })],
    compute: (v) => {
      const vYes = asBoolList(v.v)
      const tYes = asBoolList(v.t)
      const names = ['Visual', 'Auditory', 'Kinesthetic', 'Reading']
      const scores = vYes.map((x, i) => (x ? 2 : 0) + (tYes[i] ? 0 : 1))
      const total = scores.reduce((s, x) => s + x, 0) || 1
      const pcts = scores.map((s) => (s / total) * 100)
      const ranked = names.map((nm, i) => ({ nm, p: pcts[i], raw: scores[i] })).sort((a, b) => b.raw - a.raw)
      const mix = [
        `Strength: ${ranked[0].nm} — lean into it for new material`,
        `Support with ${ranked[ranked.length - 1].nm} for weaker recall`,
        'Combine two channels per topic (e.g. diagram + explanation)',
        'Switch channels every 25 minutes to hold attention',
      ]
      return [
        sres('Dominant channel', `${ranked[0].nm} (${ratio(ranked[0].p, 0)}%)`, T.good, `profile: ${names.map((nm, i) => `${nm} ${ratio(pcts[i], 0)}%`).join(' · ')}`, ranked[0].p),
        sres('Weakest channel', `${ranked[ranked.length - 1].nm}`, T.neutral, 'needs deliberate support, not avoidance'),
        docr('Method mix', mix.map((m, i) => `${i + 1}. ${m}`).join('\n')),
        res('Evidence note', 'Mixed methods outperform single-style matching — use the profile as a hint, not a rule.', T.neutral),
        res('Difficulty fit', asNum(v.subject) >= 4 ? 'hard subject: add worked examples and peer explanation' : 'standard difficulty: current mix is sufficient', T.neutral),
      ]
    },
  },
  {
    id: 'note-taking-formatter',
    name: 'Note-Taking Formatter',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Reformats raw lecture notes into Cornell-style sections: cues, main notes and a summary, plus key-term extraction.',
    tip: 'Cornell works because the summary column forces you to decide what matters while the lecture is still fresh.',
    usage: ['Paste your raw notes.', 'Review the structured layout.', 'Fill the cue column from memory.'],
    method: ['Text is split into sentences and chunks.', 'Key terms are flagged as cues.', 'A summary is auto-composed.'],
    fields: [txt('raw', 'Raw notes', 8, 'Photosynthesis needs light. It happens in the chloroplast. Light dependent reactions occur in the thylakoid membrane. The Calvin cycle happens in the stroma. Water is split to give oxygen. Carbon dioxide is fixed into glucose. Rate is limited by light intensity.')], 
    compute: (v) => {
      const raw = asStr(v.raw).trim()
      if (!raw) return [sres('Formatter', 'Paste your raw notes first', T.warn)]
      const sents = raw.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 3)
      const chunks = sents.map((s) => {
        const w = s.split(' ')
        return w.length > 16 ? [w.slice(0, Math.ceil(w.length / 2)).join(' '), w.slice(Math.ceil(w.length / 2)).join(' ')] : [s]
      }).flat()
      const terms = [...new Set(sents.map((s) => s.split(' ')[0]).filter((t) => t.length > 3))]
      const cues = terms.slice(0, 8)
      const summary = sents.slice(0, 2).join('. ').slice(0, 160)
      const lines = [
        '┌─ CUE COLUMN (left) ────────────┬─ NOTES (right) ─────────────────────┐',
      ]
      chunks.forEach((c, i) => lines.push(`│ ${(cues[i] || '').padEnd(30)} │ ${c}`))
      lines.push('└───────────────────────────────────────────────────────────────────┘')
      return [
        sres('Note blocks', num(chunks.length, 0), T.good, `from ${num(sents.length, 0)} statements`, Math.min(100, chunks.length * 10)),
        sres('Cue questions', cues.length ? cues.join(' · ') : 'none', T.neutral, 'cover the notes and answer from memory'),
        docr('Cornell layout', lines.join('\n')),
        res('Summary box', summary || 'write a 2-sentence summary in your own words', T.neutral, 'bottom-right of the page'),
        res('Method', 'recall from the cue column, then check the notes — do not just re-read', T.neutral),
      ]
    },
  },
  {
    id: 'revision-schedule-optimizer',
    name: 'Revision Schedule Optimizer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Balances multiple subject demands across the days you have, respecting per-subject effort, deadlines and fatigue limits.',
    tip: 'Interleave subjects on the same day — switching between topics strengthens discrimination between them and reduces exam-style confusion.',
    usage: ['Enter each subject, effort and deadline.', 'Set daily hour limits.', 'Read the optimized allocation.'],
    method: ['Effort is converted to required sessions.', 'Sessions are packed before deadlines.', 'Daily cap is never exceeded.'],
    fields: [txt('subs', 'One per line: name | effort hours | deadline YYYY-MM-DD', 6, 'Calculus | 8 | 2026-05-14\nMechanics | 6 | 2026-05-16\nStatistics | 5 | 2026-05-14\nEssay | 4 | 2026-05-20'), n('cap', 'Max hours per day', { def: 3, min: 0.5, max: 10, step: 0.5 })],
    compute: (v) => {
      const cap = asNum(v.cap) || 3
      const today = new Date().toISOString().slice(0, 10)
      const rows = asStr(v.subs).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { name: p[0] || 'Subject', hrs: parseFloat(p[1]) || 1, due: p[2] || '' }
      })
      if (!rows.length) return [sres('Optimizer', 'Add subjects as "name | hours | deadline"', T.warn)]
      const total = rows.reduce((s, r) => s + r.hrs, 0)
      const minDays = Math.ceil(total / cap)
      const queue = [...rows].sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')).map((r) => ({ ...r, remaining: r.hrs }))
      const lines: string[] = []
      let day = 0
      while (queue.some((s) => s.remaining > 0) && day < 40) {
        const date = addDays(today, day)
        let used = 0
        const items: string[] = []
        queue.forEach((s) => {
          if (s.remaining <= 0 || used + 1 > cap) return
          const daysLeft = s.due ? dayDiff(date, s.due) : 99
          const priority = daysLeft < 0 ? 'OVERDUE' : daysLeft < 4 ? 'urgent' : 'normal'
          items.push(`${s.name} ${ratio(s.remaining, 1)}h (${priority}${s.due ? `, ${daysLeft}d left` : ''})`)
          used += 1
          s.remaining = Math.max(0, s.remaining - 1)
        })
        lines.push(`${fmt(parseDate(date))} [${num(used, 0)}h cap ${num(cap, 1)}h]: ${items.length ? items.join(' + ') : 'rest / catch-up'}`)
        day++
      }
      const late = rows.filter((s) => s.due && dayDiff(today, s.due) < 0)
      return [
        sres('Minimum days needed', `${num(minDays, 0)} days`, minDays > 14 ? T.warn : T.good, `${ratio(total, 1)} h total at ${ratio(cap, 1)} h/day`),
        sres('Total effort', `${ratio(total, 1)} hours`, T.good, `${rows.length} subjects`, Math.min(100, Math.round((total / (minDays * cap)) * 100))),
        docr('Optimized schedule', lines.slice(0, 14).join('\n')),
        res('Overdue subjects', late.length ? late.map((s) => s.name).join(', ') : 'none', late.length ? T.bad : T.good, late.length ? 'reschedule these immediately' : 'all deadlines in the future'),
        res('Interleaving', 'two or more subjects per day where possible — mixing beats blocking', T.neutral),
      ]
    },
  },
  {
    id: 'memory-technique-selector',
    name: 'Memory Technique Selector',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Chooses the right memorisation technique for your material type, retention window and available time.',
    tip: 'Match the technique to the material: lists need the counting method, sequences need ordering, definitions need spaced recall.',
    usage: ['Describe the material and time you have.', 'Read the recommended technique.', 'Apply the step sequence.'],
    method: ['Material type maps to candidate techniques.', 'Time budget filters the options.', 'The best match is returned with steps.'],
    fields: [sel('type', 'Material type', ['List of items', 'Ordered sequence', 'Definitions', 'Formulas', 'Dates/timelines', 'Poetry or quotes'], 'Definitions'), n('time', 'Hours available', { def: 2, min: 0.2, max: 40, step: 0.2 }), sel('window', 'Retention needed', ['Same day', 'One week', 'One term', 'Years'], 'One term')],
    compute: (v) => {
      const type = asSel(v.type)
      const time = asNum(v.time)
      const window = asSel(v.window)
      const table: Record<string, { name: string; steps: string[]; fit: string }> = {
        'List of items': { name: 'Counting method (major system)', steps: ['Assign each number 0–9 a consonant sound', 'Build words from the sounds', 'Convert each item to a number', 'Recall the digits, then decode the words'], fit: 'fast, reliable for unordered lists' },
        'Ordered sequence': { name: 'Chain method + first-letter cues', steps: ['Link item 1 to item 2 with a vivid image', 'Continue the chain', 'Convert the chain to first letters', 'Add to make a real word if possible'], fit: 'preserves order, best for processes' },
        Definitions: { name: 'Spaced repetition with cloze cards', steps: ['Write each term on one card', 'Convert the definition to a cloze', 'Review at 1, 3, 7, 16, 35 days', 'Add one sentence of application per card'], fit: 'long-term retention, self-testing' },
        Formulas: { name: 'Dimensional analysis recall', steps: ['Write the formula from units alone', 'Check each term’s units', 'Derive it once from first principles', 'Recall the derivation, not just the letters'], fit: 'prevents letter-order mistakes' },
        'Dates/timelines': { name: 'Timeline + peg method', steps: ['Build a timeline of pegs (years, events)', 'Anchor each date to a peg', 'Use position to encode importance', 'Add a causal chain between events'], fit: 'chronology and causation together' },
        'Poetry or quotes': { name: 'First-letter + metre method', steps: ['Take the first letter of each line', 'Scan for a hidden word', 'Chunk into natural breath groups', 'Recite aloud to the rhythm'], fit: 'verbatim accuracy required' },
      }
      const pick = table[type] || table.Definitions
      const per = Math.max(1, Math.round(time * 60 / Math.max(3, pick.steps.length + 2)))
      const out: StudentResult[] = [
        sres('Best technique', pick.name, T.good, `matched to ${type.toLowerCase()}`),
        sres('Session length', `${ratio(time, 1)} hours`, T.neutral, `≈ ${per} min per stage`, Math.min(100, Math.round((time / 8) * 100))),
        docr('Apply these steps', pick.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')),
        res('Why it fits', pick.fit, T.neutral),
        res('Retention horizon', window === 'Years' ? 'target one year — use spaced repetition with growing gaps' : window === 'One term' ? 'target one term — spaced repetition over weeks' : window === 'One week' ? 'target one week — spaced repetition over days' : 'same day — use encoding speed, retention is not the goal', T.neutral),
      ]
      return out
    },
  },
  {
    id: 'goal-progress-tracker',
    name: 'Study Goal Progress Tracker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Tracks progress toward a study target over a date range, with pace, projection and a realistic finish date.',
    tip: 'Projection is the useful number. If the finish date keeps slipping, cut the goal or increase the pace — do not just hope.',
    usage: ['Set the target and deadline.', 'Enter completed units and the start date.', 'Read pace, projection and verdict.'],
    method: ['Pace = completed ÷ elapsed days.', 'Projected finish uses the current pace.', 'Gap to target is quantified.'],
    fields: [n('target', 'Target units (e.g. questions)', { def: 200, min: 1, step: 10 }), n('done', 'Units completed', { def: 46, min: 0, step: 1 }), dt('start', 'Start date'), dt('deadline', 'Deadline'), n('unit', 'Units per day planned', { def: 10, min: 0.1, step: 1 })],
    compute: (v) => {
      const target = asNum(v.target) || 1
      const done = asNum(v.done)
      const start = asStr(v.start) || new Date().toISOString().slice(0, 10)
      const deadline = asStr(v.deadline)
      const today = new Date().toISOString().slice(0, 10)
      const elapsed = Math.max(1, dayDiff(start, today > start ? today : start))
      const daysLeft = deadline ? dayDiff(today, deadline) : 0
      const pace = done / elapsed
      const projected = Math.ceil(target / (pace || 1))
      const remaining = Math.max(0, target - done)
      const needed = daysLeft > 0 ? remaining / daysLeft : Infinity
      const planned = asNum(v.unit) || 1
      const verdict = needed <= planned ? 'on track' : needed <= planned * 1.3 ? 'slightly behind — add a short session' : 'behind — reduce scope or raise daily units'
      return [
        sres('Progress', `${num(done, 0)} of ${num(target, 0)} (${ratio((done / target) * 100, 1)}%)`, (done / target) >= 1 ? T.good : T.warn, `${num(remaining, 0)} units remaining`, clamp((done / target) * 100, 0, 100)),
        sres('Current pace', `${ratio(pace, 2)} units/day`, pace >= planned ? T.good : T.warn, `planned ${ratio(planned, 2)}/day`),
        sres('Needed pace', Number.isFinite(needed) ? `${ratio(needed, 2)} units/day` : 'no deadline set', needed <= planned ? T.good : T.warn, verdict),
        res('Projected finish', `${fmt(parseDate(addDays(today, Math.max(0, projected - done))))} (${num(projected, 0)} days total)`, daysLeft > 0 && projected > elapsed + daysLeft ? T.bad : T.neutral, 'at the current pace'),
        res('Days left', daysLeft > 0 ? num(daysLeft, 0) : deadline ? 'deadline passed' : 'no deadline', T.neutral),
      ]
    },
  },
  {
    id: 'distraction-blocker-planner',
    name: 'Distraction Blocker Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Designs a focused session by ranking your distractions, proposing blockers for each and scheduling the hardest work first.',
    tip: 'Remove one notification source and most of the rest solves itself. Environment design beats willpower every time.',
    usage: ['List your distractions and the planned hours.', 'Read the blocker for each.', 'Keep the hardest work in the first slot.'],
    method: ['Distractions are scored by pull.', 'A specific blocker is proposed per item.', 'Time is blocked into deep and shallow work.'],
    fields: [txt('items', 'Distractions (one per line: distraction | minutes lost per day)', 6, 'Phone notifications | 45\nSocial media | 60\nGroup chat | 25\nProcrastination spiral | 40\nNoisy room | 20'), n('hours', 'Focused hours available', { def: 2, min: 0.5, step: 0.5 })],
    compute: (v) => {
      const rows = asStr(v.items).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { name: p[0] || 'Distraction', mins: parseFloat(p[1]) || 0 }
      })
      if (!rows.length) return [sres('Planner', 'List distractions as "item | minutes lost"', T.warn)]
      const total = rows.reduce((s, r) => s + r.mins, 0)
      const blockers: Record<string, string> = {
        Phone: 'DND on, phone in another room (not face-down — out of reach)',
        'Social media': 'Log out; install a blocker app for study hours',
        'Group chat': 'Mute, post “focusing until 3”, reply once at the end',
        Procrastination: 'Start with a 5-minute timer — momentum beats planning',
        'Noisy room': 'Noise-cancelling headphones with a fixed study track',
      }
      const lines = [...rows].sort((a, b) => b.mins - a.mins).map((r) => {
        const key = Object.keys(blockers).find((k) => r.name.toLowerCase().includes(k.toLowerCase()))
        return `${r.name} (${num(r.mins, 0)} min/day): ${key ? blockers[key] : 'remove the trigger — close, mute, or move it out of sight'}`
      })
      const recovered = total / 60
      const hours = asNum(v.hours)
      return [
        sres('Time lost daily', `${ratio(recovered, 2)} hours`, T.warn, `${num(total, 0)} minutes across ${rows.length} triggers`, Math.min(100, Math.round((recovered / 8) * 100))),
        sres('Time recoverable', `${ratio(recovered, 2)} h/day`, T.good, 'recovering half is realistic', clamp(recovered * 5, 2, 100)),
        docr('Blocker plan', lines.join('\n')),
        res('Deep work block', `${ratio(hours * 0.7, 1)} h on the hardest task, phone out of reach`, T.neutral, '70/30 split of hard and maintenance work'),
        res('Commitment device', 'tell one person your start and end time — social cost keeps you in', T.neutral),
      ]
    },
  },
]
