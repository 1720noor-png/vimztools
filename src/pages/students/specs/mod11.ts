import { n, sel, txt, ck, res, T, asNum, asSel, asStr, asBoolList, clamp, num, ratio } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'GPA, CGPA & Academic Performance'

function gradePoints(pct: number, scale: '4.0' | '4.3' | '5.0' | '10.0' | '100'): number {
  if (scale === '100') return pct
  if (scale === '10.0') return pct / 10
  if (scale === '5.0') return pct / 20
  const bands4: [number, number][] = scale === '4.3'
    ? [[90, 4.3], [85, 4.0], [80, 3.7], [75, 3.3], [70, 3.0], [65, 2.7], [60, 2.3], [55, 2.0], [50, 1.7], [45, 1.3], [40, 1.0], [0, 0]]
    : [[90, 4.0], [85, 4.0], [80, 3.7], [75, 3.7], [70, 3.0], [65, 3.0], [60, 2.7], [55, 2.7], [50, 2.0], [45, 2.0], [40, 1.0], [0, 0]]
  for (const [min, pts] of bands4) if (pct >= min) return pts
  return 0
}

function letter(pct: number, scheme: '4.0' | '4.3' | 'percentage' | '10.0' | '10-point'): string {
  if (scheme === 'percentage' || scheme === '10-point') {
    const p = scheme === '10-point' ? pct * 10 : pct
    return p >= 90 ? 'A' : p >= 80 ? 'B' : p >= 70 ? 'C' : p >= 60 ? 'D' : p >= 50 ? 'E' : 'F'
  }
  const pts = gradePoints(pct, scheme)
  if (scheme === '4.3') return pts >= 4.0 ? 'A' : pts >= 3.7 ? 'A−' : pts >= 3.3 ? 'B+' : pts >= 3.0 ? 'B' : pts >= 2.7 ? 'B−' : pts >= 2.3 ? 'C+' : pts >= 2.0 ? 'C' : pts >= 1.7 ? 'C−' : pts >= 1.3 ? 'D+' : pts >= 1.0 ? 'D' : 'F'
  return pts >= 3.7 ? 'A' : pts >= 3.0 ? 'B' : pts >= 2.7 ? 'B−' : pts >= 2.0 ? 'C' : pts >= 1.7 ? 'C−' : pts >= 1.0 ? 'D' : 'F'
}

interface Row {
  name: string
  pct: number
  credits: number
}

function parseRows(raw: string, defaultCredits: number): Row[] {
  return asStr(raw)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const p = l.split(/[|,;\t]/).map((x) => x.trim())
      if (p.length >= 2) {
        const nums = p.slice(1).map((x) => parseFloat(x.replace(/[^\d.]/g, ''))).filter((x) => Number.isFinite(x))
        return { name: p[0], pct: nums[0] || 0, credits: nums[1] ?? defaultCredits }
      }
      const m = l.match(/^(.*?)\s*[:\-–]\s*(\d+(?:\.\d+)?)\s*(?:%|credits?)?\s*(\d+(?:\.\d+)?)?\s*(?:credits?)?$/i)
      if (m) return { name: m[1].trim(), pct: parseFloat(m[2]), credits: m[3] ? parseFloat(m[3]) : defaultCredits }
      return { name: l, pct: 0, credits: defaultCredits }
    })
    .filter((r) => Number.isFinite(r.pct) && r.pct >= 0)
}

export const mod11: StudentSpec[] = [
  {
    id: 'gpa-calculator-gpa',
    name: 'GPA Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes your credit-weighted GPA from subject percentages, with letter grades, standing and a per-subject table.',
    tip: 'GPA is credit-weighted — a 3-credit course counts three times a 1-credit course. Check your institution’s scale before comparing to others.',
    usage: ['Enter each subject with its percentage and credits.', 'Choose your GPA scale.', 'Read GPA, standing and the grade table.'],
    method: ['Percentages map to grade points on your scale.', 'Grade points are multiplied by credits.', 'Totals are divided by total credits.'],
    fields: [txt('rows', 'Subjects (one per line: name | % | credits)', 6, 'Calculus | 88 | 4\nPhysics | 76 | 4\nEnglish Literature | 91 | 3\nStatistics | 68 | 3'), sel('scale', 'GPA scale', ['4.0', '4.3', '10.0', '100 (percentage)'], '4.0')],
    compute: (v) => {
      const rows = parseRows(asStr(v.rows), 3)
      if (!rows.length) return [sres('GPA', 'Add subjects as "name | % | credits"', T.warn)]
      const scale = asSel(v.scale) as '4.0' | '4.3' | '10.0' | '100'
      const pts = rows.map((r) => ({ ...r, g: gradePoints(r.pct, scale) }))
      const credits = pts.reduce((s, r) => s + r.credits, 0) || 1
      const gpa = pts.reduce((s, r) => s + r.g * r.credits, 0) / credits
      const simple = pts.reduce((s, r) => s + r.pct, 0) / pts.length
      const maxG = scale === '4.0' ? 4 : scale === '4.3' ? 4.3 : scale === '10.0' ? 10 : 100
      const standing = letter(simple, scale === '100' ? 'percentage' : scale)
      return [
        sres('GPA', ratio(gpa, scale === '100' ? 2 : 3), gpa / maxG >= 0.75 ? T.good : gpa / maxG >= 0.6 ? T.neutral : T.warn, `out of ${num(maxG, 1)} · ${ratio(credits, 1)} credits`, (gpa / maxG) * 100),
        sres('Academic standing', standing, gpa / maxG >= 0.75 ? T.good : T.neutral, `simple average ${ratio(simple, 1)}%`),
        docr('Per-subject detail', pts.map((r) => `${r.name}: ${ratio(r.pct, 1)}% → ${ratio(r.g, 1)} pts × ${ratio(r.credits, 1)} cr = ${ratio(r.g * r.credits, 2)}`).join('\n')),
        res('Credits counted', ratio(credits, 1), T.neutral, 'sum of all subject credits'),
        res('Credit vs simple average', `${ratio(gpa, 3)} vs ${ratio(simple, 1)}% — ${gpa * (maxG / 100) > simple ? 'high-credit subjects pulled it up' : 'high-credit subjects pulled it down'}`, T.neutral),
      ]
    },
  },
  {
    id: 'cgpa-calculator-gpa',
    name: 'CGPA Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Cumulative GPA across all semesters or years, showing how each semester contributed and the trend.',
    tip: 'Your CGPA is a running average that early bad semesters can never fully erase — every semester counts, so protect the average early.',
    usage: ['Enter each subject with credits.', 'Or enter semester GPAs with credit counts.', 'Read the cumulative GPA and trend.'],
    method: ['Grade points are weighted by credits.', 'Semester totals are aggregated.', 'Cumulative = total points ÷ total credits.'],
    fields: [txt('rows', 'Subjects (one per line: name | % | credits)', 7, 'Semester 1: Calculus | 88 | 4\nSemester 1: Physics | 76 | 4\nSemester 2: Chemistry | 82 | 3\nSemember 2: Maths II | 91 | 4'), sel('scale', 'CGPA scale', ['4.0', '4.3', '5.0', '10.0'], '4.0')],
    compute: (v) => {
      const rows = parseRows(asStr(v.rows), 3)
      if (!rows.length) return [sres('CGPA', 'Add subjects as "name | % | credits"', T.warn)]
      const scale = asSel(v.scale) as '4.0' | '4.3' | '5.0' | '10.0'
      const bySem = new Map<string, { pts: number; cr: number }>()
      const detail: string[] = []
      rows.forEach((r) => {
        const g = gradePoints(r.pct, scale)
        const sem = (r.name.match(/^(sem(?:ester)?\s*\d+|\d{4})/i)?.[0] || 'All').replace(/\s+/g, ' ').toLowerCase()
        const cur = bySem.get(sem) || { pts: 0, cr: 0 }
        bySem.set(sem, { pts: cur.pts + g * r.credits, cr: cur.cr + r.credits })
        detail.push(`${r.name}: ${ratio(r.pct, 1)}% → ${ratio(g, 1)} × ${ratio(r.credits, 1)} = ${ratio(g * r.credits, 2)}`)
      })
      const totalPts = [...bySem.values()].reduce((s, x) => s + x.pts, 0)
      const totalCr = [...bySem.values()].reduce((s, x) => s + x.cr, 0) || 1
      const cgpa = totalPts / totalCr
      const sems = [...bySem.entries()].map(([k, v]) => ({ sem: k, gpa: v.pts / (v.cr || 1), cr: v.cr }))
      const trend = sems.length > 1 ? (sems[sems.length - 1].gpa - sems[0].gpa) : 0
      const maxG = scale === '4.0' ? 4 : scale === '4.3' ? 4.3 : scale === '5.0' ? 5 : 10
      return [
        sres('CGPA', ratio(cgpa, 3), cgpa / maxG >= 0.75 ? T.good : cgpa / maxG >= 0.6 ? T.neutral : T.warn, `out of ${num(maxG, 1)} · ${ratio(totalCr, 1)} credits`, (cgpa / maxG) * 100),
        sres('Semester trend', trend > 0.01 ? `improving (+${ratio(trend, 3)})` : trend < -0.01 ? `declining (${ratio(trend, 3)})` : 'steady', trend >= 0 ? T.good : T.warn, `${sems.length} semester group(s) detected`),
        docr('Per-semester GPA', sems.map((s) => `${s.sem}: ${ratio(s.gpa, 3)} over ${ratio(s.cr, 1)} credits`).join('\n')),
        docr('Per-subject points', detail.join('\n')),
        res('Best / worst semester', `${ratio(Math.max(...sems.map((s) => s.gpa)), 3)} / ${ratio(Math.min(...sems.map((s) => s.gpa)), 3)}`, T.neutral, 'spread shows consistency'),
      ]
    },
  },
  {
    id: 'weighted-grade-calculator',
    name: 'Weighted Grade Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Calculates your current weighted course grade and the score needed on the remaining assessment to hit your target.',
    tip: 'Do this calculation before the exam, not the night before. Knowing the exact break-even score changes how you study — and whether to negotiate.',
    usage: ['Enter completed assessments and weights.', 'Enter the final assessment weight.', 'See the required score.'],
    method: ['Weighted points are summed.', 'Remaining weight is identified.', 'The required score is solved algebraically.'],
    fields: [txt('done', 'Completed (one per line: assessment | score% | weight%)', 6, 'Midterm | 78 | 25\nLab report | 88 | 15\nPresentation | 72 | 10'), n('finalW', 'Final assessment weight (%)', { def: 50, min: 1, max: 100, step: 5 }), n('target', 'Target course grade (%)', { def: 70, min: 0, max: 100, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.done).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,;]/).map((x) => x.trim())
        return { name: p[0] || 'Assessment', score: parseFloat(p[1]) || 0, w: parseFloat(p[2]) || 0 }
      })
      if (!rows.length) return [sres('Weighted grade', 'Add completed assessments', T.warn)]
      const totalW = rows.reduce((s, r) => s + r.w, 0)
      const finalW = clamp(asNum(v.finalW), 0, 100 - totalW)
      const target = clamp(asNum(v.target), 0, 100)
      const current = totalW ? rows.reduce((s, r) => s + r.score * r.w, 0) / totalW : 0
      const projectedNow = rows.reduce((s, r) => s + r.score * r.w, 0) / (totalW || 1)
      const required = finalW > 0 ? (target * 100 - rows.reduce((s, r) => s + r.score * r.w, 0)) / finalW : 0
      const best = rows.reduce((s, r) => s + r.score * r.w, 0) + 100 * finalW
      const worst = rows.reduce((s, r) => s + r.score * r.w, 0)
      return [
        sres('Current weighted grade', `${ratio(current, 2)}%`, current >= target ? T.good : T.warn, `${ratio(totalW, 0)}% of course graded`, current),
        sres('Needed on the final', required > 100 ? 'unachievable' : required < 0 ? 'already secured' : `${ratio(required, 1)}%`, required > 100 ? T.bad : required <= 0 ? T.good : required <= 65 ? T.good : T.warn, `for a ${ratio(target, 0)}% target with ${ratio(finalW, 0)}% of marks left`, clamp(100 - Math.max(0, required), 0, 100)),
        sres('Grade range now', `${ratio(worst / (totalW + finalW || 1), 1)}% – ${ratio(best / (totalW + finalW || 1), 1)}%`, T.neutral, 'worst case to best case'),
        docr('Breakdown', rows.map((r) => `${r.name}: ${ratio(r.score, 1)}% × ${ratio(r.w, 0)}% = ${ratio(r.score * r.w, 2)} points`).join('\n')),
        res('Projected if you score 0', `${ratio(projectedNow, 1)}% floor`, T.neutral, 'you cannot drop below this'),
        res('Strategy', required > 100 ? 'ask about extra credit or a resit policy now' : required <= 65 ? 'very achievable — prepare normally' : 'tight — start reviewing the final’s topics now', T.neutral),
      ]
    },
  },
  {
    id: 'grade-projection-calculator',
    name: 'Grade Projection Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Projects your final grade under three scenarios — fail, average and strong — using what you have already earned.',
    tip: 'Knowing the floor is valuable. If 70% is your guaranteed outcome, you only need to beat it by a little — that changes where you spend your remaining hours.',
    usage: ['Enter completed grades and weights.', 'Read the three scenarios.', 'Decide where remaining effort pays.'],
    method: ['Weighted points are accumulated.', 'Scenarios assume 0%, 70% and 95% on the remainder.', 'Each scenario is a final course grade.'],
    fields: [txt('rows', 'Completed (one per line: name | % | weight%)', 6, 'Quiz 1 | 72 | 10\nQuiz 2 | 85 | 10\nEssay | 65 | 20'), n('remain', 'Remaining weight (%)', { def: 60, min: 0, max: 100, step: 5 })],
    compute: (v) => {
      const rows = asStr(v.rows).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,;]/).map((x) => x.trim())
        return { name: p[0] || 'Item', score: parseFloat(p[1]) || 0, w: parseFloat(p[2]) || 0 }
      })
      if (!rows.length) return [sres('Projection', 'Add completed assessments', T.warn)]
      const remain = clamp(asNum(v.remain), 0, 100)
      const totalW = rows.reduce((s, r) => s + r.w, 0) + remain || 1
      const acc = rows.reduce((s, r) => s + r.score * r.w, 0)
      const scen = [
        { label: 'Fail everything remaining', s: 0, tone: T.bad },
        { label: 'Pass-level (50%)', s: 50, tone: T.warn },
        { label: 'Solid (75%)', s: 75, tone: T.neutral },
        { label: 'Excellent (95%)', s: 95, tone: T.good },
      ]
      const out = scen.map((sc) => ({ ...sc, g: (acc + sc.s * remain) / totalW }))
      return [
        sres('Floor (score 0 on remainder)', `${ratio(out[0].g, 1)}%`, out[0].g >= 50 ? T.good : T.bad, 'worst realistic case', clamp(out[0].g, 0, 100)),
        sres('Pass-level outcome', `${ratio(out[1].g, 1)}%`, out[1].g >= 50 ? T.good : T.warn, '50% on everything remaining', clamp(out[1].g, 0, 100)),
        sres('Strong outcome (75%)', `${ratio(out[2].g, 1)}%`, out[2].g >= 70 ? T.good : T.neutral, '75% on everything remaining', clamp(out[2].g, 0, 100)),
        docr('All scenarios', out.map((o) => `${o.label}: ${ratio(o.g, 1)}%`).join('\n')),
        res('Where effort pays', out[2].g - out[1].g > 12 ? 'big swing available — the remaining 60% really matters' : 'limited upside — protect the completed 40% instead', T.neutral),
      ]
    },
  },
  {
    id: 'class-rank-calculator',
    name: 'Class Rank Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Estimates your class rank percentile from your grade and the class distribution, with the rank you need for a target.',
    tip: 'Rank is relative, not absolute. A 78 can be top of the class in a weak cohort and bottom third in a strong one — compare within your own cohort.',
    usage: ['Enter your grade and class size.', 'Set the class mean and spread.', 'Read percentile and rank.'],
    method: ['z-score is computed from class stats.', 'Percentile from the normal CDF.', 'Rank = size × (1 − percentile).'],
    fields: [n('score', 'Your grade (%)', { def: 78, step: 0.5 }), n('size', 'Class size', { def: 120, min: 1, step: 1 }), n('mean', 'Class mean (%)', { def: 71, step: 0.5 }), n('sd', 'Class SD', { def: 8, min: 0.01, step: 0.1 }), n('target', 'Rank you want (1 = top)', { def: 10, min: 1, step: 1 })],
    compute: (v) => {
      const score = asNum(v.score)
      const size = Math.max(1, Math.round(asNum(v.size)))
      const mean = asNum(v.mean)
      const sd = asNum(v.sd) || 1e-9
      const z = (score - mean) / sd
      const cdf = normalCdf(z)
      const rank = Math.max(1, Math.round(size * (1 - cdf)))
      const target = Math.max(1, Math.round(asNum(v.target)))
      const neededZ = invNormal(1 - (target - 0.5) / size)
      const needed = mean + neededZ * sd
      return [
        sres('Your rank', `${num(rank, 0)} of ${num(size, 0)}`, rank <= size * 0.25 ? T.good : rank <= size * 0.5 ? T.neutral : T.warn, `top ${ratio((rank / size) * 100, 1)}%`, clamp(100 - (rank / size) * 100, 0, 100)),
        sres('Percentile', ratio(cdf * 100, 1) + '%', cdf > 0.5 ? T.good : T.neutral, `z = ${ratio(z, 3)}`),
        sres(`Score for rank ${num(target, 0)}`, ratio(needed, 1) + '%', score >= needed ? T.good : T.warn, score >= needed ? 'you are already there' : `you need ${ratio(needed - score, 1)} more marks`, score >= needed ? 100 : clamp(((score - 0) / (needed || 1)) * 100, 2, 99)),
        res('Comparison', `mean ${ratio(mean, 1)}%, SD ${ratio(sd, 1)} — z of ${ratio(z, 2)}`, T.neutral),
        res('Caveat', 'rank depends on the cohort, not just your performance', T.warn),
      ]
    },
  },
  {
    id: 'credit-hour-calculator',
    name: 'Credit Hour Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Totals credit hours earned and in progress, checks degree and scholarship requirements, and flags shortfalls.',
    tip: 'Credit requirements are about completion, not difficulty. Track your hours each semester so the total is never a surprise at graduation.',
    usage: ['Add completed courses with credits.', 'Add in-progress courses.', 'Read totals and requirement gaps.'],
    method: ['Completed and in-progress credits are totalled separately.', 'Each requirement is compared.', 'Shortfalls are quantified.'],
    fields: [txt('done', 'Completed courses (one per line: course | credits)', 6, 'Intro Biology | 4\nCalculus I | 4\nPhysics I | 4\nEnglish Comp | 3'), txt('prog', 'In-progress courses (one per line: course | credits)', 4, 'Organic Chemistry | 4\nStatistics | 3'), n('need', 'Credits required', { def: 120, min: 1, step: 1 }), n('scholar', 'Scholarship minimum credits', { def: 15, min: 0, step: 1 })],
    compute: (v) => {
      const parse = (raw: string) => asStr(raw).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,]|\s\s+/).map((x) => x.trim())
        const cr = parseFloat(p[p.length - 1]) || 3
        return { name: p[0] || 'Course', cr: Number.isFinite(cr) ? cr : 3 }
      })
      const done = parse(asStr(v.done))
      const prog = parse(asStr(v.prog))
      if (!done.length) return [sres('Credit hours', 'Add completed courses as "course | credits"', T.warn)]
      const earned = done.reduce((s, c) => s + c.cr, 0)
      const inProg = prog.reduce((s, c) => s + c.cr, 0)
      const need = asNum(v.need) || 1
      const scholar = asNum(v.scholar)
      const pace = (earned / Math.max(1, done.length)) * (prog.length ? 2 : 1)
      return [
        sres('Credits earned', ratio(earned, 0), earned >= need ? T.good : T.neutral, `${num(done.length, 0)} courses completed`, clamp((earned / need) * 100, 0, 100)),
        sres('In progress', ratio(inProg, 0), T.neutral, `${num(prog.length, 0)} courses, expected to complete`),
        sres('Degree progress', `${ratio((earned / need) * 100, 1)}%`, earned >= need ? T.good : earned / need > 0.5 ? T.neutral : T.warn, `${ratio(need - earned, 0)} credits still required`, clamp((earned / need) * 100, 0, 100)),
        docr('Completed courses', done.map((c) => `${c.name}: ${ratio(c.cr, 0)} credits`).join('\n')),
        res('Scholarship load', inProg + (scholar ? 0 : 0) >= 0 && inProg >= scholar ? `${ratio(inProg, 0)} credits meets the ${ratio(scholar, 0)}-credit minimum` : `taking ${ratio(inProg, 0)} credits — ${scholar - inProg > 0 ? `${ratio(scholar - inProg, 0)} short of the scholarship minimum` : 'below the scholarship minimum'}`, inProg >= scholar && scholar > 0 ? T.good : T.warn),
        res('Average load', `${ratio(pace, 1)} credits per course`, T.neutral, 'typical full-time load is 15–18 per semester'),
      ]
    },
  },
  {
    id: 'cgpa-trend-analyzer',
    name: 'CGPA Trend Analyzer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Analyses semester GPAs over time: trend line, consistency, best subject weighting and what would lift the average.',
    tip: 'The pull of your average is strongest early. Two strong first semesters give you room to absorb one bad one — plan accordingly.',
    usage: ['Enter each semester GPA and credits.', 'Read trend, consistency and lift estimate.', 'Target the highest-leverage semester.'],
    method: ['Semester GPAs are credit-weighted.', 'Linear trend is fitted.', 'A what-if grade is simulated.'],
    fields: [txt('sems', 'Semesters (one per line: semester | GPA | credits)', 6, 'Sem 1 | 3.42 | 18\nSem 2 | 3.71 | 17\nSem 3 | 3.28 | 18\nSem 4 | 3.65 | 16'), n('whatif', 'What-if GPA for one heavy semester', { def: 3.9, min: 0, max: 4.3, step: 0.05 })],
    compute: (v) => {
      const rows = asStr(v.sems).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,]|\s\s+/).map((x) => x.trim())
        return { name: p[0] || 'Sem', gpa: parseFloat(p[1]) || 0, cr: parseFloat(p[2]) || 1 }
      }).filter((r) => r.gpa > 0)
      if (rows.length < 2) return [sres('Trend', 'Enter at least 2 semesters as "sem | GPA | credits"', T.warn)]
      const n = rows.length
      const xs = rows.map((_, i) => i + 1)
      const mx = xs.reduce((s, x) => s + x, 0) / n
      const my = rows.reduce((s, r) => s + r.gpa * r.cr, 0) / rows.reduce((s, r) => s + r.cr, 0)
      let sxy = 0, sxx = 0
      for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (rows[i].gpa - my); sxx += (xs[i] - mx) ** 2 }
      const slope = sxx ? sxy / sxx : 0
      const cgpa = my
      const spread = Math.sqrt(rows.reduce((s, r) => s + (r.gpa - my) ** 2, 0) / n)
      const totalCr = rows.reduce((s, r) => s + r.cr, 0)
      const whatif = asNum(v.whatif)
      const newCgpa = (rows.reduce((s, r) => s + r.gpa * r.cr, 0) + whatif * 18) / (totalCr + 18)
      const best = rows.reduce((a, b) => (b.gpa > a.gpa ? b : a))
      const worst = rows.reduce((a, b) => (b.gpa < a.gpa ? b : a))
      return [
        sres('Cumulative GPA', ratio(cgpa, 3), cgpa >= 3.5 ? T.good : cgpa >= 3 ? T.neutral : T.warn, `${num(n, 0)} semesters · ${ratio(totalCr, 0)} credits`, (cgpa / 4) * 100),
        sres('Trend', `${slope >= 0 ? '+' : ''}${ratio(slope, 3)} per semester`, slope > 0.02 ? T.good : slope < -0.02 ? T.warn : T.neutral, slope > 0.02 ? 'improving' : slope < -0.02 ? 'declining — investigate the cause' : 'stable'),
        sres('Consistency', ratio(spread, 3), spread < 0.25 ? T.good : spread < 0.5 ? T.neutral : T.warn, spread < 0.25 ? 'very consistent' : spread < 0.5 ? 'moderate variation' : 'large swings between semesters'),
        docr('Semester detail', rows.map((r) => `${r.name}: GPA ${ratio(r.gpa, 2)} × ${ratio(r.cr, 0)} cr`).join('\n')),
        res('Best / worst', `${best.name} (${ratio(best.gpa, 2)}) / ${worst.name} (${ratio(worst.gpa, 2)})`, T.neutral, 'worst semester costs most to your average'),
        res('What-if', `an 18-credit semester at ${ratio(whatif, 2)} lifts the CGPA to ${ratio(newCgpa, 3)} (+${ratio(newCgpa - cgpa, 3)})`, T.neutral),
      ]
    },
  },
  {
    id: 'gpa-requirement-checker',
    name: 'GPA Requirement Checker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Checks your current GPA against every common requirement — major entry, honours, grad school, scholarships and athletics.',
    tip: 'Requirements often differ — residency GPA, major GPA and cumulative GPA are three different numbers. Find out which one they actually mean.',
    usage: ['Enter your current GPAs and credits.', 'Read every requirement verdict.', 'Focus on the nearest failing one.'],
    method: ['Each requirement is compared.', 'Headroom or shortfall is computed.', 'Nearest deadline is flagged.'],
    fields: [n('cum', 'Cumulative GPA', { def: 3.42, min: 0, max: 4.3, step: 0.01 }), n('major', 'Major GPA', { def: 3.6, min: 0, max: 4.3, step: 0.01 }), n('last', 'Last two semesters GPA', { def: 3.75, min: 0, max: 4.3, step: 0.01 }), n('cred', 'Credits completed', { def: 68, min: 0, step: 1 })],
    compute: (v) => {
      const cum = asNum(v.cum)
      const major = asNum(v.major)
      const last = asNum(v.last)
      const cred = asNum(v.cred)
      const reqs: { name: string; need: number; have: number; note: string }[] = [
        { name: 'Declare major', need: 2.5, have: cum, note: 'usually 45+ credits' },
        { name: 'Honours admission', need: 3.5, have: cum, note: 'typically 90 credits' },
        { name: 'Graduate school (minimum)', need: 3.0, have: cum, note: 'many schools want 3.4+' },
        { name: 'Graduate school (competitive)', need: 3.5, have: cum, note: 'plus strong test scores' },
        { name: 'Scholarship renewal', need: 3.0, have: last, note: 'often uses last-term GPA' },
        { name: 'Athletic eligibility', need: 3.0, have: cum, note: 'plus 24 credits per year' },
        { name: 'Master’s admission', need: 3.4, have: major, note: 'often major GPA' },
      ]
      const lines = reqs.map((r) => `${r.have >= r.need ? 'PASS' : 'FAIL'} — ${r.name}: need ${ratio(r.need, 2)}, have ${ratio(r.have, 2)} (${r.have >= r.need ? `+${ratio(r.have - r.need, 2)}` : `${ratio(r.need - r.have, 2)} short`}) — ${r.note}`)
      const failing = reqs.filter((r) => r.have < r.need)
      const nearest = failing.sort((a, b) => (a.need - a.have) - (b.need - b.have))[0]
      const passCount = reqs.length - failing.length
      return [
        sres(`Requirements met: ${passCount}/${reqs.length}`, failing.length ? `${failing.length} to go` : 'all met', failing.length ? T.warn : T.good, failing.length ? 'clear the nearest first' : 'fully eligible', (passCount / reqs.length) * 100),
        sres('Nearest requirement', nearest ? `${nearest.name} — need ${ratio(nearest.need - nearest.have, 2)} more GPA` : 'none', nearest ? T.warn : T.good, nearest ? nearest.note : 'no gaps'),
        docr('Full check', lines.join('\n')),
        res('Credit context', `${num(cred, 0)} credits completed${cred < 90 ? ' — under 90 credits, honours may not be open yet' : ' — enough credits for honours consideration'}`, cred >= 90 ? T.good : T.warn),
        res('Which GPA?', 'ask the department whether they mean cumulative, major or resident GPA', T.neutral),
      ]
    },
  },
  {
    id: 'transcript-gpa-planner',
    name: 'Transcript GPA Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Works out what GPA you need in your remaining courses to reach a target, and whether it is realistically achievable.',
    tip: 'If the required GPA is above what you have ever achieved, that is a signal — renegotiate the target, not the maths.',
    usage: ['Enter your current GPA and credits.', 'List remaining courses and credits.', 'Read the required GPA and feasibility.'],
    method: ['Current quality points are derived.', 'Remaining credit total is computed.', 'Required GPA is solved exactly.'],
    fields: [n('cur', 'Current GPA', { def: 3.2, min: 0, max: 4.3, step: 0.01 }), n('curcr', 'Current credits', { def: 60, min: 0, step: 1 }), txt('rest', 'Remaining courses (one per line: course | credits)', 5, 'Research Methods | 4\nDissertation | 6\nElective | 3'), n('target', 'Target final GPA', { def: 3.5, min: 0, max: 4.3, step: 0.01 })],
    compute: (v) => {
      const cur = asNum(v.cur)
      const curcr = asNum(v.curcr)
      const rest = asStr(v.rest).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,]|\s\s+/).map((x) => x.trim())
        return { name: p[0] || 'Course', cr: parseFloat(p[p.length - 1]) || 3 }
      })
      if (!rest.length) return [sres('Plan', 'Add remaining courses as "course | credits"', T.warn)]
      const restCr = rest.reduce((s, c) => s + c.cr, 0)
      const target = asNum(v.target)
      const needed = (target * (curcr + restCr) - cur * curcr) / (restCr || 1)
      const feasible = needed <= 4.0 && needed >= 0
      const realistic = needed <= 3.7
      return [
        sres('Required GPA on remaining', feasible ? ratio(needed, 3) : needed > 4 ? `> 4.0 — unreachable` : 'already exceeded', feasible ? (realistic ? T.good : T.warn) : T.bad, `over ${ratio(restCr, 0)} remaining credits`, clamp(100 - needed * 20, 2, 100)),
        sres('Feasibility', feasible ? (realistic ? 'realistic — you have done this before' : 'stretch — needs consistently strong results') : 'not achievable by this route', realistic ? T.good : T.bad, realistic ? 'a 3.7 average is attainable with focused work' : 'reconsider the target or add credit'),
        sres('Current GPA', ratio(cur, 3), T.good, `over ${num(curcr, 0)} credits`),
        docr('Remaining courses', rest.map((c) => `${c.name}: ${ratio(c.cr, 0)} credits`).join('\n')),
        res('Points needed', `${ratio(target * (curcr + restCr) - cur * curcr, 2)} quality points`, T.neutral, 'target total minus current total'),
        res('Final credits', `${num(curcr + restCr, 0)} credits after completion`, T.neutral),
      ]
    },
  },
  {
    id: 'subject-performance-analyzer',
    name: 'Subject Performance Analyzer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Ranks your subjects by grade, flags your strongest and weakest, and shows where effort would move the average most.',
    tip: 'Small gains in high-credit weak subjects move your average most. Do not spend all your time on the subject you already ace.',
    usage: ['Enter each subject grade and credits.', 'Read the ranking and leverage.', 'Target the highest-leverage subject.'],
    method: ['Grades are ranked by weighted impact.', 'Leverage = credits × headroom to 100.', 'Best and worst are highlighted.'],
    fields: [txt('rows', 'Subjects (one per line: name | % | credits)', 6, 'Calculus | 62 | 4\nPhysics | 71 | 4\nChemistry | 88 | 3\nStatistics | 55 | 3\nHistory | 79 | 3')],
    compute: (v) => {
      const rows = asStr(v.rows).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,]|\s\s+/).map((x) => x.trim())
        const nums = p.slice(1).map((x) => parseFloat(x.replace(/[^\d.]/g, ''))).filter((x) => Number.isFinite(x))
        return { name: p[0] || 'Subject', pct: nums[0] || 0, cr: nums[1] ?? 3 }
      }).filter((r) => r.pct > 0)
      if (rows.length < 2) return [sres('Analysis', 'Add at least 2 subjects as "name | % | credits"', T.warn)]
      const avg = rows.reduce((s, r) => s + r.pct, 0) / rows.length
      const ranked = [...rows].sort((a, b) => b.pct - a.pct)
      const lev = [...rows].map((r) => ({ ...r, gain: (100 - r.pct) * r.cr })).sort((a, b) => b.gain - a.gain)
      const totalCr = rows.reduce((s, r) => s + r.cr, 0) || 1
      const best = ranked[0]
      const worst = ranked[ranked.length - 1]
      const creditWeighted = rows.reduce((s, r) => s + r.pct * r.cr, 0) / totalCr
      return [
        sres('Simple average', ratio(avg, 1), avg >= 70 ? T.good : avg >= 60 ? T.warn : T.bad, `${num(rows.length, 0)} subjects, ${ratio(totalCr, 0)} credits`),
        sres('Credit-weighted', ratio(creditWeighted, 1), creditWeighted >= avg ? T.good : T.neutral, creditWeighted > avg ? 'your high-credit subjects are stronger' : 'your high-credit subjects are weaker'),
        sres('Best / worst', `${best.name} ${ratio(best.pct, 0)}% / ${worst.name} ${ratio(worst.pct, 0)}%`, T.neutral, `spread of ${ratio(best.pct - worst.pct, 0)} points`),
        docr('Ranking', ranked.map((r, i) => `${i + 1}. ${r.name}: ${ratio(r.pct, 1)}% (${ratio(r.cr, 1)} cr)`).join('\n')),
        sres('Highest leverage', `${lev[0].name} — ${ratio(lev[0].gain, 0)} marks of headroom`, T.warn, 'biggest total gain available here', Math.min(100, (rows.length / (lev[0].gain / 50 || 1)) * 10)),
        res('Strategy', 'improve the weakest high-credit subject by 10 points — that beats perfecting an easy one', T.neutral),
      ]
    },
  },
  {
    id: 'grade-improvement-planner',
    name: 'Grade Improvement Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Turns a target grade into a concrete action plan: what to change, which subjects to prioritise, and the weekly check-in.',
    tip: 'Aim at the next letter grade, not the perfect one. A B+ target is reachable and useful; a 100% target is neither.',
    usage: ['Enter current grades and your target.', 'Read the gap and priority order.', 'Follow the weekly check-in.'],
    method: ['Gaps to target are computed per subject.', 'Effort is prioritised by gap × credits.', 'A weekly review is scheduled.'],
    fields: [txt('rows', 'Subjects (one per line: name | % | credits)', 6, 'Calculus | 68 | 4\nOrganic Chemistry | 74 | 4\nStatistics | 61 | 3\nAcademic Writing | 82 | 3'), n('target', 'Overall target (%)', { def: 80, min: 0, max: 100, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.rows).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,]|\s\s+/).map((x) => x.trim())
        const nums = p.slice(1).map((x) => parseFloat(x.replace(/[^\d.]/g, ''))).filter((x) => Number.isFinite(x))
        return { name: p[0] || 'Subject', pct: nums[0] || 0, cr: nums[1] ?? 3 }
      }).filter((r) => r.pct > 0)
      if (!rows.length) return [sres('Plan', 'Add subjects as "name | % | credits"', T.warn)]
      const target = asNum(v.target) || 100
      const avg = rows.reduce((s, r) => s + r.pct, 0) / rows.length
      const ranked = rows.map((r) => ({ ...r, gap: Math.max(0, target - r.pct), eff: Math.max(0, target - r.pct) * r.cr })).sort((a, b) => b.eff - a.eff)
      const needOverall = Math.max(0, target - avg)
      const plan = ranked.map((r, i) => `${i + 1}. ${r.name}: +${ratio(r.gap, 0)} points needed (${ratio(r.cr, 1)} cr) — ${r.gap > 20 ? 'major rebuild, start with fundamentals' : r.gap > 10 ? 'targeted practice on weak topics' : r.gap > 0 ? 'polish — exam technique and precision' : 'maintain only'}`).join('\n')
      return [
        sres('Current average', ratio(avg, 1), avg >= target ? T.good : T.warn, `target ${ratio(target, 0)}% — need +${ratio(needOverall, 1)} overall`, avg),
        sres('Biggest gap', `${ranked[0].name} (+${ratio(ranked[0].gap, 0)} points)`, ranked[0].gap > 15 ? T.bad : T.warn, 'highest weighted effort required'),
        docr('Prioritised plan', plan),
        res('Subject count', `${num(ranked.filter((r) => r.gap > 0).length, 0)} of ${num(rows.length, 0)} need work`, T.neutral, 'do not spread effort across all of them equally'),
        res('Weekly check-in', 'every Sunday: log grades, recalculate the average, adjust next week’s plan', T.neutral),
      ]
    },
  },
  {
    id: 'grading-scale-converter',
    name: 'Grading Scale Converter',
    archetype: 'conv',
    subject: SUBJECT,
    blurb: 'Converts a grade between percentage, 4.0, 4.3, 5.0, 10-point scales and letter grades in every direction.',
    tip: 'Institutional scales differ. A 3.7 means different things on different transcripts — always convert to the scale your target institution uses.',
    usage: ['Enter the grade and its scale.', 'Read every equivalent.', 'Note the letter-grade band.'],
    method: ['The input maps to grade points.', 'Grade points map to all scales.', 'The letter band follows the scale’s rules.'],
    fields: [n('val', 'Grade value', { def: 87, step: 0.1 }), sel('from', 'Your scale', ['Percentage', '4.0 scale', '4.3 scale', '5.0 scale', '10-point'], 'Percentage')],
    compute: (v) => {
      const val = asNum(v.val)
      const from = asSel(v.from)
      let pct: number
      if (from === 'Percentage') pct = val
      else if (from === '4.0 scale') pct = val >= 3.95 ? 95 : val >= 3.7 ? 87 : val >= 3.3 ? 82 : val >= 3 ? 75 : val >= 2.7 ? 68 : val >= 2.3 ? 63 : val >= 2 ? 57 : val >= 1.7 ? 52 : val >= 1 ? 45 : 0
      else if (from === '4.3 scale') pct = val >= 4.25 ? 95 : val >= 4.05 ? 92 : val >= 3.95 ? 90 : val >= 3.85 ? 87 : val >= 3.7 ? 84 : val >= 3.6 ? 82 : val >= 3.4 ? 79 : val >= 3.3 ? 77 : val >= 3.1 ? 74 : val >= 3.05 ? 72 : val >= 2.9 ? 70 : val >= 2.7 ? 67 : val >= 2.6 ? 64 : val >= 2.4 ? 62 : val >= 2.3 ? 60 : val >= 2.1 ? 57 : val >= 2.05 ? 55 : val >= 1.9 ? 52 : val >= 1.8 ? 50 : val >= 1.6 ? 47 : val >= 1.4 ? 45 : val >= 1.2 ? 42 : val >= 1.05 ? 40 : 0
      else if (from === '5.0 scale') pct = val * 20
      else pct = val * 10
      pct = clamp(pct, 0, 100)
      const g40 = gradePoints(pct, '4.0')
      const g43 = gradePoints(pct, '4.3')
      return [
        sres('Percentage', ratio(pct, 1) + '%', pct >= 70 ? T.good : pct >= 60 ? T.neutral : T.warn, `input: ${ratio(val, 2)} on ${from.toLowerCase()}`, pct),
        sres('4.0 scale', ratio(g40, 2), g40 >= 3 ? T.good : T.warn, 'out of 4.00'),
        sres('4.3 scale', ratio(g43, 2), g43 >= 3.5 ? T.good : T.warn, 'out of 4.30'),
        sres('Letter grades', `${letter(pct, 'percentage')} (percentage) · ${letter(pct, '4.0')} (4.0) · ${letter(pct, '4.3')} (4.3)`, T.neutral, 'letter depends on the scheme, not just the number'),
        res('5.0 / 10-point', `${ratio(pct / 20, 2)} · ${ratio(pct / 10, 2)}`, T.neutral),
        res('Next band up', `${ratio(nextBand(pct, '4.3'), 0)}% for the next 4.3 grade point`, T.neutral),
      ]
    },
  },
  {
    id: 'gpa-calculator-with-credits',
    name: 'Credit-Weighted Grade Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Calculates a strictly credit-weighted average, normalises mismatched credit loads and shows each subject’s contribution share.',
    tip: 'Normalise before you compare. Averaging raw percentages across a 6-credit and a 1-credit module overstates the small module.',
    usage: ['Enter subjects with marks and credits.', 'Read the weighted average.', 'Check each contribution share.'],
    method: ['Each mark is multiplied by its credits.', 'Contributions are totalled and divided by credits.', 'Shares are expressed as percentages.'],
    fields: [txt('rows', 'Subjects (one per line: name | mark% | credits)', 6, 'Dissertation | 72 | 6\nTheory Exam | 65 | 2\nLab Work | 88 | 1\nSeminar | 91 | 1'), sel('normalize', 'Basis', ['Credit-weighted', 'Simple average', 'Normalised per credit (÷credits²)'], 'Credit-weighted')],
    compute: (v) => {
      const rows = asStr(v.rows).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,]|\s\s+/).map((x) => x.trim())
        const nums = p.slice(1).map((x) => parseFloat(x.replace(/[^\d.]/g, ''))).filter((x) => Number.isFinite(x))
        return { name: p[0] || 'Subject', pct: nums[0] || 0, cr: nums[1] ?? 1 }
      }).filter((r) => r.pct > 0)
      if (!rows.length) return [sres('Average', 'Add subjects as "name | mark% | credits"', T.warn)]
      const basis = asSel(v.normalize)
      const totalCr = rows.reduce((s, r) => s + r.cr, 0) || 1
      const simple = rows.reduce((s, r) => s + r.pct, 0) / rows.length
      const weighted = rows.reduce((s, r) => s + r.pct * r.cr, 0) / totalCr
      const norm = rows.reduce((s, r) => s + r.pct / r.cr, 0) / rows.length
      const result = basis === 'Simple average' ? simple : basis.startsWith('Normalised') ? norm : weighted
      const lines = rows.map((r) => `${r.name}: ${ratio(r.pct, 1)}% × ${ratio(r.cr, 1)} cr = ${ratio(r.pct * r.cr, 1)} pts (${ratio((r.pct * r.cr) / (rows.reduce((s, x) => s + x.pct * x.cr, 0) || 1) * 100, 1)}% of total)`).join('\n')
      return [
        sres('Result', ratio(result, 3) + '%', result >= 70 ? T.good : result >= 60 ? T.warn : T.bad, basis, result),
        sres('Simple average', ratio(simple, 3), T.neutral, 'ignores credit load'),
        sres('Credit-weighted', ratio(weighted, 3), T.neutral, `over ${ratio(totalCr, 1)} credits`),
        docr('Contributions', lines),
        res('Spread', `${ratio(weighted - simple, 3)} between weighted and simple`, Math.abs(weighted - simple) > 3 ? T.warn : T.neutral, 'large gaps mean credit load skews the result'),
      ]
    },
  },
  {
    id: 'academic-standing-calculator',
    name: 'Academic Standing Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Determines your academic standing — probation, good standing, dean’s list or honours — across common institutional rules.',
    tip: 'Probation is recoverable but time-limited. Read the rule now, not after — some institutions let you appeal with evidence of improvement.',
    usage: ['Enter your GPA and credits.', 'Read the standing verdict.', 'Check the appeal or recovery route.'],
    method: ['GPA is matched against standing bands.', 'Credits are checked for eligibility.', 'Recovery requirements are stated.'],
    fields: [n('gpa', 'Your GPA', { def: 2.85, min: 0, max: 4.3, step: 0.01 }), n('cred', 'Credits completed', { def: 45, min: 0, step: 1 }), n('credYear', 'Credits this year', { def: 30, min: 0, step: 1 })],
    compute: (v) => {
      const gpa = asNum(v.gpa)
      const cred = asNum(v.cred)
      const cy = asNum(v.credYear)
      const deans = gpa >= 3.7 && cred >= 12
      const honours = gpa >= 3.8 && cred >= 60
      let standing = ''
      let tone: 'good' | 'warn' | 'bad' | 'neutral' = 'neutral'
      if (gpa < 2.0) { standing = 'Academic probation — dismissal risk'; tone = 'bad' }
      else if (gpa < 2.7) { standing = 'Academic probation'; tone = 'warn' }
      else if (gpa < 3.0) { standing = 'Good standing (barely) — improve this term'; tone = 'warn' }
      else if (gpa < 3.5) { standing = 'Good standing'; tone = 'good' }
      else { standing = 'Dean’s list eligible'; tone = 'good' }
      const needProbation = Math.max(0, 2.7 - gpa)
      const needDeans = Math.max(0, 3.7 - gpa)
      return [
        sres('Academic standing', standing, tone, `GPA ${ratio(gpa, 2)} over ${num(cred, 0)} credits`),
        sres('Dean’s list', deans ? 'eligible' : `need ${ratio(needDeans, 2)} more GPA`, deans ? T.good : T.warn, `requires 3.7 GPA and 12+ credits in the term`, deans ? 100 : clamp(gpa / 3.7 * 100, 0, 100)),
        sres('Honours eligibility', honours ? 'eligible' : `need ${ratio(Math.max(0, 3.8 - gpa), 2)} more GPA and ${num(Math.max(0, 60 - cred), 0)} credits`, honours ? T.good : T.warn, 'usually 3.8 GPA and 60 credits'),
        res('Full-time load', cy >= 12 ? `${ratio(cy, 0)} credits — full time` : `${ratio(cy, 0)} credits — part time`, cy >= 12 ? T.good : T.warn, '12 credits is the usual threshold'),
        res('Recovery route', needProbation > 0 ? `earn a ${ratio(needProbation, 2)} GPA lift to clear probation — usually 2 consecutive terms above 2.7` : 'no recovery needed', needProbation > 0 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'gpa-boost-strategies',
    name: 'GPA Boost Strategy Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Diagnoses why your GPA is where it is and generates specific, prioritised actions with expected grade impact.',
    tip: 'Most GPAs are won by fixing one recurring habit — usually participation or deadlines, not raw ability. Find that habit first.',
    usage: ['Enter your GPA and the weak areas.', 'Mark the issues that apply.', 'Read the prioritised actions.'],
    method: ['Each flagged issue is weighted.', 'Actions are sorted by leverage.', 'Expected impact is estimated.'],
    fields: [n('gpa', 'Current GPA', { def: 2.9, min: 0, max: 4.3, step: 0.01 }), ck('issues', 'What is holding you back?', ['Missed or late work', 'Weak exam technique', 'Not attending classes', 'Cannot focus while studying', 'Too many easy courses weighed badly', 'Discipline problems', 'Not asking for help', 'Poor time management']), n('credits', 'Credits per term', { def: 15, min: 1, step: 1 })],
    compute: (v) => {
      const issues = asBoolList(v.issues)
      const labels = ['Missed or late work', 'Weak exam technique', 'Not attending classes', 'Cannot focus while studying', 'Too many easy courses weighed badly', 'Discipline problems', 'Not asking for help', 'Poor time management']
      const impact: Record<string, { pts: number; action: string }> = {
        'Missed or late work': { pts: 0.35, action: 'set every deadline in one calendar with two reminders; zero late work is worth a full letter grade' },
        'Weak exam technique': { pts: 0.4, action: 'do one timed paper per week and keep an error log — technique fixes are the fastest grade gain' },
        'Not attending classes': { pts: 0.3, action: 'attend every session; slides and announcements alone explain most exam questions' },
        'Cannot focus while studying': { pts: 0.25, action: '25/5 Pomodoro blocks, phone in another room, one task per block' },
        'Too many easy courses weighed badly': { pts: 0.15, action: 'check the credit weighting — your strong subjects may be under-weighted' },
        'Discipline problems': { pts: 0.35, action: 'build a daily schedule and treat it like a timetable with a commitment device' },
        'Not asking for help': { pts: 0.3, action: 'office hours weekly — free marks hide there, and it shows engagement' },
        'Poor time management': { pts: 0.3, action: 'plan backwards from deadlines, not forwards from free time' },
      }
      const chosen = issues.map((x, i) => (x ? { label: labels[i], ...impact[labels[i]] } : null)).filter((x): x is { label: string; pts: number; action: string } => !!x)
      if (!chosen.length) return [sres('Actions', 'Select at least one issue', T.warn)]
      const sorted = chosen.sort((a, b) => b.pts - a.pts)
      const total = sorted.reduce((s, x) => s + x.pts, 0)
      const gpa = asNum(v.gpa)
      const newGpa = Math.min(4.0, gpa + total * 0.5)
      const lines = sorted.map((x, i) => `${i + 1}. ${x.label} (leverage ${num(x.pts * 100, 0)}): ${x.action}`).join('\n')
      return [
        sres('Top priority', sorted[0].label, T.warn, `fix this first: ${sorted[0].action.slice(0, 60)}…`),
        sres('Projected GPA gain', `+${ratio(newGpa - gpa, 2)} → ${ratio(newGpa, 2)}`, newGpa > gpa + 0.3 ? T.good : T.neutral, `from fixing ${num(chosen.length, 0)} issue(s) fully`, clamp((newGpa / 4) * 100, 0, 100)),
        docr('Prioritised actions', lines),
        res('Load check', `${ratio(asNum(v.credits), 0)} credits per term — aim for 12–18 with your effort concentrated`, T.neutral),
        res('Timeline', 'expect a measurable lift in 1–2 terms; the first is usually the hardest', T.neutral),
      ]
    },
  },
  {
    id: 'deans-list-calculator',
    name: "Dean's List Calculator",
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Checks eligibility for the Dean’s List or honour roll across GPA, credit load and term rules, with the shortfall.',
    tip: 'Credit minimums catch people out — a perfect 4.0 in 9 credits does not qualify. Check the rule before the term starts.',
    usage: ['Enter your term GPA and credits.', 'Set the institution rule.', 'Read eligibility and the shortfall.'],
    method: ['GPA threshold is tested.', 'Credit minimum is tested.', 'Both shortfalls are quantified.'],
    fields: [n('gpa', 'Term GPA', { def: 3.72, min: 0, max: 4.3, step: 0.01 }), n('credits', 'Term credits attempted', { def: 15, min: 0, step: 1 }), n('req', 'Required GPA', { def: 3.7, min: 0, max: 4.3, step: 0.05 }), n('minCr', 'Minimum credits', { def: 12, min: 0, step: 1 }), n('cum', 'Cumulative GPA (if required)', { def: 3.68, min: 0, max: 4.3, step: 0.01 })],
    compute: (v) => {
      const gpa = asNum(v.gpa)
      const cr = asNum(v.credits)
      const req = asNum(v.req)
      const minCr = asNum(v.minCr)
      const cum = asNum(v.cum)
      const gpaOk = gpa >= req
      const crOk = cr >= minCr
      const cumOk = cum >= req
      const eligible = gpaOk && crOk && cumOk
      const fails: string[] = []
      if (!gpaOk) fails.push(`term GPA ${ratio(req - gpa, 2)} short`)
      if (!crOk) fails.push(`${ratio(minCr - cr, 0)} credits short`)
      if (!cumOk) fails.push(`cumulative ${ratio(req - cum, 2)} short`)
      const highest = Math.max(gpa, cum)
      return [
        sres('Dean’s List status', eligible ? 'Eligible ✓' : 'Not eligible', eligible ? T.good : T.bad, fails.length ? fails.join('; ') : 'all criteria met', eligible ? 100 : clamp((highest / req) * 100, 2, 99)),
        sres('Term GPA', ratio(gpa, 3), gpaOk ? T.good : T.warn, `requires ${ratio(req, 2)}`),
        sres('Credit load', `${ratio(cr, 0)} credits`, crOk ? T.good : T.warn, `minimum ${ratio(minCr, 0)}`),
        res('Cumulative', ratio(cum, 3), cumOk ? T.good : T.warn, 'many institutions require this too'),
        res('If only one thing fails', !gpaOk ? 'you need the GPA — focus on the highest-credit course' : !crOk ? 'take a slightly heavier load next term' : 'the cumulative is the blocker — plan a recovery term', T.neutral),
        res('Note', 'rules vary — honours roll, president’s list and Dean’s List often use different thresholds', T.neutral),
      ]
    },
  },
  {
    id: 'grade-curve-calculator',
    name: 'Grade Curve Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Applies common curve methods — add points, scale to a mean, square-root or z-score curve — and shows your new grade.',
    tip: 'Curves reward relative performance. Study for the curve-free material anyway — you never know which method is applied.',
    usage: ['Enter your raw score and class data.', 'Choose the curve method.', 'Read your curved grade and the ranking.'],
    method: ['Each curve is a different transform.', 'Your score is transformed.', 'The class mean is recomputed.'],
    fields: [n('score', 'Your raw score (%)', { def: 68, step: 0.5 }), n('mean', 'Class mean (%)', { def: 63, step: 0.5 }), n('sd', 'Class SD', { def: 11, min: 0.01, step: 0.5 }), n('highest', 'Highest raw score', { def: 94, step: 0.5 }), sel('method', 'Curve method', ['Add N points', 'Scale to target mean', 'Square root curve', 'Z-score to grade', 'None (no curve)'], 'Add N points'), n('param', 'Method parameter', { def: 5, step: 0.5 })],
    compute: (v) => {
      const score = asNum(v.score)
      const mean = asNum(v.mean)
      const sd = asNum(v.sd) || 1e-9
      const highest = asNum(v.highest) || 100
      const method = asSel(v.method)
      const p = asNum(v.param)
      let newScore = score
      let newMean = mean
      let desc = ''
      if (method === 'Add N points') { newScore = score + p; newMean = mean + p; desc = `+${ratio(p, 1)} points to everyone` }
      else if (method === 'Scale to target mean') { const target = p || 75; const f = target / (mean || 1); newScore = score * f; newMean = target; desc = `everything scaled ×${ratio(f, 3)} to reach a ${ratio(target, 0)} mean` }
      else if (method === 'Square root curve') { const f = Math.sqrt(100 / (highest || 1)); newScore = score * f; newMean = mean * f; desc = `×${ratio(f, 3)} (the classic √curve)` }
      else if (method === 'Z-score to grade') { const z = (score - mean) / sd; newScore = 50 + z * 12; newMean = 50; desc = `z = ${ratio(z, 2)} mapped to 50 + 12z` }
      else { desc = 'no curve applied' }
      newScore = clamp(newScore, 0, 100)
      const letterNow = letter(newScore, 'percentage')
      const z = (score - mean) / sd
      return [
        sres('Your curved grade', ratio(newScore, 1) + '%', newScore >= 70 ? T.good : newScore >= 60 ? T.warn : T.bad, `${letterNow} — was ${ratio(score, 1)}%`, newScore),
        sres('Class mean after', ratio(newMean, 1), T.neutral, desc),
        res('Gain', `${newScore >= score ? '+' : ''}${ratio(newScore - score, 1)} points`, T.neutral, method),
        res('Your z-score', ratio(z, 2), z > 0 ? T.good : T.warn, `${z >= 1 ? 'top' : z > 0 ? 'above' : z > -1 ? 'middle' : 'bottom'} of the distribution`),
        res('Letter bands', `A ≥90 · B ≥80 · C ≥70 · D ≥60 · E ≥50`, T.neutral, 'check whether your institution curves into bands'),
      ]
    },
  },
]

function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2)
  const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return z > 0 ? 1 - p : p
}

function invNormal(p: number): number {
  let lo = -6
  let hi = 6
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    if (normalCdf(mid) < p) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

function nextBand(pct: number, scale: '4.3'): number {
  const marks: Record<string, number> = {
    '4.3': 40, '4.0': 40, '3.7': 45, '3.3': 50, '3.0': 55, '2.7': 60, '2.3': 65, '2.0': 70, '1.7': 75, '1.3': 80, '1.0': 85, '0': 100,
  }
  const keys = Object.keys(marks).map(Number).sort((a, b) => a - b)
  for (const k of keys) {
    const threshold = gradePoints(k, scale)
    const minPct = threshold >= 4.3 ? 90 : threshold >= 4 ? 85 : threshold >= 3.7 ? 80 : threshold >= 3.3 ? 75 : threshold >= 3 ? 70 : threshold >= 2.7 ? 65 : threshold >= 2.3 ? 60 : threshold >= 2 ? 55 : threshold >= 1.7 ? 50 : threshold >= 1.3 ? 45 : threshold >= 1 ? 40 : 0
    if (pct < minPct && minPct > 0) return minPct
  }
  void scale
  return 100
}
