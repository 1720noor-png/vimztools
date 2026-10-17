import { n, sel, txt, dt, res, T, asNum, asSel, asStr, clamp, num, ratio } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Attendance & Academic Calendar'

function d(s: string): Date {
  return new Date(s || new Date().toISOString().slice(0, 10))
}

function daysBetween(a: string, b: string): number {
  return Math.round((d(b).getTime() - d(a).getTime()) / 86400000)
}

function addDays(iso: string, add: number): string {
  const x = d(iso)
  x.setDate(x.getDate() + add)
  return x.toISOString().slice(0, 10)
}

function fmt(iso: string): string {
  return d(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtMin(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const mod12: StudentSpec[] = [
  {
    id: 'attendance-calculator-attendance',
    name: 'Attendance Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes your attendance percentage, classes you can miss before breaching a threshold, and what you must attend to recover.',
    tip: 'Know the exact number of classes you can miss. The 75% rule is usually calculated per subject, not across the whole term.',
    usage: ['Enter classes held and attended.', 'Set the required percentage.', 'Read your margin and recovery needs.'],
    method: ['Percentage = attended ÷ held.', 'Missable classes = attended − (held × threshold).', 'Recovery shortfall solves for future attendance.'],
    fields: [n('held', 'Classes held', { def: 40, min: 1, step: 1 }), n('att', 'Classes attended', { def: 33, min: 0, step: 1 }), n('req', 'Required attendance (%)', { def: 75, min: 0, max: 100, step: 1 })],
    compute: (v) => {
      const held = Math.max(1, Math.round(asNum(v.held)))
      const att = clamp(Math.round(asNum(v.att)), 0, held)
      const req = clamp(asNum(v.req) || 0, 0, 100) / 100
      const pct = (att / held) * 100
      const missable = Math.max(0, Math.floor(att - held * req))
      const shortfall = Math.max(0, Math.ceil(held * req) - att)
      const futureNeeded = shortfall > 0 ? 100 : 100
      return [
        sres('Attendance', ratio(pct, 2) + '%', pct >= req * 100 ? T.good : T.warn, `${num(att, 0)} of ${num(held, 0)} classes`, pct),
        sres(`Classes you can still miss`, num(missable, 0), missable > 0 ? T.good : T.warn, `to stay at or above ${ratio(req * 100, 0)}%`, missable > 0 ? Math.min(100, (missable / 10) * 100) : 5),
        sres('Classes you missed', num(held - att, 0), held - att > held * (1 - req) ? T.bad : T.neutral, `${ratio(((held - att) / held) * 100, 1)}% of all classes`, clamp(((held - att) / held) * 100, 0, 100)),
        res('Recovery if below', shortfall > 0 ? `attend the next ${num(shortfall, 0)} classes with no misses` : 'not required — you are above the threshold', shortfall > 0 ? T.warn : T.good),
        res('Next milestone', `you will hit exactly ${ratio(req * 100, 0)}% after ${num(Math.ceil(held * req), 0)} attended classes`, T.neutral, futureNeeded === 100 ? 'keep attending every class' : ''),
      ]
    },
  },
  {
    id: 'class-attendance-tracker',
    name: 'Class Attendance Tracker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Tracks attendance per subject, flags subjects below the requirement, and shows the risk of losing eligibility.',
    tip: 'One subject below 75% can block a whole year. Check per-subject percentages weekly, not once at term end.',
    usage: ['Enter each subject’s held and attended counts.', 'Set the requirement.', 'Read the at-risk subjects.'],
    method: ['Percentage is computed per subject.', 'Subjects below the threshold are flagged.', 'Missable classes are computed for each.'],
    fields: [txt('rows', 'Subjects (one per line: name | held | attended)', 6, 'Biology | 24 | 19\nChemistry | 24 | 17\nMathematics | 26 | 24\nEnglish | 20 | 15'), n('req', 'Required (%)', { def: 75, min: 0, max: 100, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.rows).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,\t]/).map((x) => x.trim())
        const nums = p.slice(1).map((x) => parseInt(x)).filter((x) => Number.isFinite(x))
        return { name: p[0] || 'Subject', held: nums[0] || 0, att: nums[1] ?? 0 }
      }).filter((r) => r.held > 0)
      if (!rows.length) return [sres('Tracker', 'Add lines as "name | held | attended"', T.warn)]
      const req = asNum(v.req) || 75
      const lines = rows.map((r) => {
        const pct = (r.att / r.held) * 100
        const missable = Math.max(0, Math.floor(r.att - (r.held * req) / 100))
        const need = Math.max(0, Math.ceil((r.held * req) / 100) - r.att)
        return `${pct >= req ? 'OK  ' : 'LOW '} ${r.name}: ${ratio(pct, 1)}% (${num(r.att, 0)}/${num(r.held, 0)}) — missable ${num(missable, 0)}${need > 0 ? `, need ${num(need, 0)} to recover` : ''}`
      })
      const atRisk = rows.filter((r) => (r.att / r.held) * 100 < req)
      const overall = rows.reduce((s, r) => s + r.att, 0) / (rows.reduce((s, r) => s + r.held, 0) || 1)
      return [
        sres('At-risk subjects', atRisk.length ? atRisk.map((r) => r.name).join(', ') : 'none', atRisk.length ? T.bad : T.good, atRisk.length ? 'below the requirement' : 'all subjects compliant', atRisk.length ? 100 - (atRisk.length / rows.length) * 100 : 100),
        sres('Overall attendance', ratio(overall * 100, 1) + '%', overall * 100 >= req ? T.good : T.warn, `${num(rows.reduce((s, r) => s + r.att, 0), 0)} of ${num(rows.reduce((s, r) => s + r.held, 0), 0)} classes`, overall * 100),
        docr('Per-subject status', lines.join('\n')),
        res('Required to pass', `${ratio(req, 0)}% per subject — some institutions use 80%`, T.neutral),
        res('Action', atRisk.length ? `attend every class in ${atRisk[0].name} until recovered` : 'maintain current rate', T.neutral),
      ]
    },
  },
  {
    id: 'absence-impact-calculator',
    name: 'Absence Impact Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Works out exactly how many absences it takes to breach your attendance requirement and what it costs in content missed.',
    tip: 'Absences for valid reasons are often excised from the record. Get them documented at the time — retroactive evidence is rarely accepted.',
    usage: ['Enter held, attended and excuses.', 'Set the requirement.', 'Read the breach point and content impact.'],
    method: ['Excused sessions are removed from the denominator.', 'The break-even absence count is solved.', 'Weeks of content missed is estimated.'],
    fields: [n('held', 'Sessions held', { def: 30, min: 1, step: 1 }), n('att', 'Sessions attended', { def: 24, min: 0, step: 1 }), n('exc', 'Excused absences (removed from record)', { def: 2, min: 0, step: 1 }), n('req', 'Required (%)', { def: 75, min: 0, max: 100, step: 1 }), n('weeks', 'Total teaching weeks', { def: 12, min: 1, step: 1 })],
    compute: (v) => {
      const held = Math.max(1, Math.round(asNum(v.held)))
      const att = clamp(Math.round(asNum(v.att)), 0, held)
      const exc = Math.max(0, Math.round(asNum(v.exc)))
      const req = clamp(asNum(v.req) || 75, 0, 100) / 100
      const counted = Math.max(1, held - exc)
      const pct = (att / held) * 100
      const maxAbsences = Math.max(0, Math.floor(counted - counted * req))
      const absencesTaken = counted - att
      const margin = maxAbsences - absencesTaken
      const weeks = Math.max(1, Math.round(asNum(v.weeks)))
      const perSession = weeks / held
      return [
        sres('Effective attendance', ratio(pct, 2) + '%', pct >= req * 100 ? T.good : T.warn, `${num(att, 0)} attended of ${num(counted, 0)} counted (${num(exc, 0)} excused removed)`, pct),
        sres('Absences remaining', num(margin, 0), margin > 0 ? T.good : T.bad, margin > 0 ? `you can miss ${num(margin, 0)} more without breaching ${ratio(req * 100, 0)}%` : 'you are already at the limit', margin > 0 ? Math.min(100, margin * 20) : 5),
        sres('Content missed', `${ratio(absencesTaken * perSession, 2)} teaching weeks`, absencesTaken > 5 ? T.warn : T.neutral, `${num(absencesTaken, 0)} absences × ${ratio(perSession, 2)} weeks each`, clamp(100 - absencesTaken * 6, 2, 100)),
        res('Max allowed absences', num(maxAbsences, 0), T.neutral, `for the whole term at ${ratio(req * 100, 0)}%`),
        res('If excusing absences', 'document each one now — approved leave is usually removed from the denominator', T.neutral),
      ]
    },
  },
  {
    id: 'attendance-recovery-planner',
    name: 'Attendance Recovery Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a recovery plan when attendance has dropped below the requirement: sessions to attend and the target date.',
    tip: 'Recovery is a streak problem. Attend every single remaining session for two weeks and the number fixes itself — do not calculate daily.',
    usage: ['Enter current attendance figures.', 'Set the requirement and deadline.', 'Read the recovery schedule.'],
    method: ['The gap to the threshold is computed.', 'Future sessions are assumed in full.', 'The recovery streak length is derived.'],
    fields: [n('held', 'Sessions held so far', { def: 20, min: 1, step: 1 }), n('att', 'Sessions attended', { def: 14, min: 0, step: 1 }), n('perweek', 'Sessions per week', { def: 2, min: 1, step: 1 }), n('left', 'Sessions remaining', { def: 12, min: 0, step: 1 }), n('req', 'Required (%)', { def: 75, min: 0, max: 100, step: 1 })],
    compute: (v) => {
      const held = Math.max(1, Math.round(asNum(v.held)))
      const att = clamp(Math.round(asNum(v.att)), 0, held)
      const per = Math.max(1, Math.round(asNum(v.perweek)))
      const left = Math.max(0, Math.round(asNum(v.left)))
      const req = clamp(asNum(v.req) || 75, 0, 100) / 100
      const finalHeld = held + left
      const needed = Math.max(0, Math.ceil(finalHeld * req) - att)
      const achievable = needed <= left
      const weeksToRecover = needed > 0 ? Math.ceil(needed / per) : 0
      const pctNow = (att / held) * 100
      const pctPerfect = (finalHeld ? (att + left) / finalHeld : 0) * 100
      const pctNoShow = finalHeld ? (att / finalHeld) * 100 : 0
      return [
        sres('Current position', ratio(pctNow, 1) + '%', pctNow >= req * 100 ? T.good : T.warn, `need ${ratio(req * 100, 0)}% by the end`),
        sres('Sessions you must attend', achievable ? `${num(needed, 0)} of the remaining ${num(left, 0)}` : `need ${num(needed, 0)} — more than ${num(left, 0)} remain`, achievable ? (needed <= left * 0.5 ? T.good : T.warn) : T.bad, achievable ? 'full attendance is not required' : 'cannot reach the target this term', Math.min(100, (needed / Math.max(1, left)) * 100)),
        sres('Recovery window', needed > 0 ? `${num(weeksToRecover, 0)} weeks of full attendance` : 'already recovered', T.neutral, `${num(per, 0)} sessions per week`),
        res('If you attend everything', ratio(pctPerfect, 1) + '%', pctPerfect >= req * 100 ? T.good : T.warn, 'best realistic outcome'),
        res('If you attend nothing more', ratio(pctNoShow, 1) + '%', pctNoShow < req * 100 ? T.bad : T.good, 'do not let this be your plan'),
        res('Mitigation', 'if illness caused the gap, submit medical evidence now — a formal appeal beats a silent recovery', T.neutral),
      ]
    },
  },
  {
    id: 'academic-calendar-planner',
    name: 'Academic Calendar Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Generates a dated academic calendar from term start, weeks and key events, with week-by-week milestones.',
    tip: 'Print the term calendar and mark the assessment dates in a different colour. Contiguous deadlines cluster — that is when you plan buffer.',
    usage: ['Set term start and length.', 'Add your assessment dates.', 'Read the week-by-week calendar.'],
    method: ['Weeks are generated from the term dates.', 'Events are placed by date.', 'Weeks containing events are highlighted.'],
    fields: [dt('start', 'Term start'), n('weeks', 'Teaching weeks', { def: 14, min: 1, max: 30, step: 1 }), txt('events', 'Key events (one per line: YYYY-MM-DD event)', 5, '2026-03-02 Assignment 1 due\n2026-04-10 Midterm exam\n2026-05-01 Project presentation\n2026-05-20 Final exam'), sel('breaks', 'Include reading weeks', ['Yes', 'No'], 'Yes')],
    compute: (v) => {
      const start = asStr(v.start)
      if (!start) return [sres('Calendar', 'Set the term start date', T.warn)]
      const weeks = Math.max(1, Math.round(asNum(v.weeks)))
      const events = asStr(v.events).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const m = l.match(/^(\d{4}-\d{2}-\d{2})\s*(.*)$/)
        return m ? { date: m[1], name: m[2] || 'Event' } : null
      }).filter((e): e is { date: string; name: string } => !!e)
      const lines: string[] = []
      for (let w = 0; w < weeks; w++) {
        const ws = addDays(start, w * 7)
        const we = addDays(ws, 6)
        const inWeek = events.filter((e) => daysBetween(ws, e.date) >= 0 && daysBetween(ws, e.date) <= 6)
        const isReading = asSel(v.breaks) === 'Yes' && w === weeks - 1
        lines.push(`Week ${w + 1} (${fmt(ws)} – ${fmt(we)})${isReading ? ' [reading week]' : ''}${inWeek.length ? `\n   ▸ ${inWeek.map((e) => `${e.name} (${fmt(e.date)})`).join('\n   ▸ ')}` : ''}`)
      }
      const weeksWithEvents = new Set(events.map((e) => Math.floor(daysBetween(start, e.date) / 7))).size
      return [
        sres('Term span', `${fmt(start)} → ${fmt(addDays(start, weeks * 7 - 1))}`, T.good, `${num(weeks, 0)} teaching weeks`),
        sres('Key events', num(events.length, 0), T.neutral, `${num(weeksWithEvents, 0)} weeks contain an assessment`),
        docr('Week-by-week calendar', lines.join('\n')),
        res('Buffer advice', `${num(weeks - weeksWithEvents, 0)} clear weeks — use them before the assessment-heavy ones`, T.neutral),
        res('Rule', 'start each assessment three weeks before the deadline — the last three weeks are always taken', T.neutral),
      ]
    },
  },
  {
    id: 'exam-schedule-planner',
    name: 'Exam Schedule Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Plans revision across your exam timetable, weighting each subject by marks and days between papers.',
    tip: 'Do not revise a subject in one block. Short repeated sessions between other exams use the gap time that would otherwise be lost.',
    usage: ['Enter each exam date, subject and marks.', 'Set daily revision hours.', 'Read the day-by-day plan.'],
    method: ['Days between exams are computed.', 'Revision time is allocated by marks.', 'The final 2 days per subject are reserved.'],
    fields: [txt('exams', 'Exams (one per line: YYYY-MM-DD | Subject | marks)', 7, '2026-05-14 | Organic Chemistry | 60\n2026-05-16 | Statistics | 40\n2026-05-16 | Molecular Biology | 50\n2026-05-20 | Advanced Calculus | 70'), n('hours', 'Revision hours per day', { def: 3, min: 1, max: 10, step: 0.5 })],
    compute: (v) => {
      const rows = asStr(v.exams).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|]|\t/).map((x) => x.trim())
        const m = (p[0] || '').match(/^\d{4}-\d{2}-\d{2}$/)
        return { date: m ? m[0] : '', name: p[1] || 'Exam', marks: parseFloat(p[2]) || 0 }
      }).filter((r) => r.date)
      if (rows.length < 2) return [sres('Plan', 'Add exams as "YYYY-MM-DD | Subject | marks"', T.warn)]
      rows.sort((a, b) => a.date.localeCompare(b.date))
      const today = new Date().toISOString().slice(0, 10)
      const totalMarks = rows.reduce((s, r) => s + r.marks, 0) || 1
      const hours = asNum(v.hours) || 3
      const lines: string[] = []
      for (let i = 0; i < rows.length; i++) {
        const e = rows[i]
        const prev = i === 0 ? today : rows[i - 1].date
        const gap = Math.max(1, daysBetween(prev, e.date))
        const daysForSubject = Math.max(1, gap - 1)
        const share = (e.marks / totalMarks) * gap * hours
        const perDay = share / daysForSubject
        lines.push(`${fmt(e.date)} — ${e.name} (${num(e.marks, 0)} marks)\n   ${num(daysForSubject, 0)} revision days × ${ratio(perDay, 1)} h/day = ${ratio(share, 1)} h total`)
      }
      const clashDays = new Set(rows.map((r) => r.date))
      const first = rows[0]
      const daysToFirst = daysBetween(today, first.date)
      return [
        sres('First exam', `${first.name} — ${daysToFirst > 0 ? `${num(daysToFirst, 0)} days away` : daysToFirst === 0 ? 'TODAY' : 'passed'}`, daysToFirst < 3 ? T.bad : daysToFirst < 10 ? T.warn : T.good, fmt(first.date)),
        sres('Total revision hours', ratio(daysToFirst > 0 ? daysToFirst * hours : 0, 0) + ' h available', T.neutral, `${num(hours, 1)} h/day until the first paper`),
        docr('Per-exam allocation', lines.join('\n')),
        res('Same-day papers', clashDays.size < rows.length ? `${num(rows.length - clashDays.size, 0)} exams share a date — plan them as one block` : 'none', T.neutral),
        res('Split rule', 'never give a high-mark paper less time than a low-mark one — weight by marks, not by how much you dislike the subject', T.neutral),
      ]
    },
  },
  {
    id: 'class-schedule-builder',
    name: 'Class Schedule Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Detects timetable clashes, computes free study blocks and locates gaps from your weekly class schedule.',
    tip: 'Protect your two longest gaps as study blocks before you fill them with optional classes. The timetable is easier to change than your results are.',
    usage: ['Enter classes as "Day | Start | End | Course".', 'Set your day start and end.', 'Read clashes and free blocks.'],
    method: ['Each class is placed on a day grid.', 'Overlaps are detected.', 'Free gaps longer than 90 minutes are listed.'],
    fields: [txt('classes', 'Classes (one per line: Day | Start | End | Course)', 7, 'Monday | 09:00 | 10:00 | Algebra\nMonday | 11:00 | 12:30 | Physics\nTuesday | 09:00 | 10:30 | Chemistry\nTuesday | 14:00 | 15:00 | History\nWednesday | 10:00 | 12:00 | Biology Lab'), sel('days', 'Days in timetable', ['Mon–Fri', 'Mon–Sat', 'Mon–Sun'], 'Mon–Fri')],
    compute: (v) => {
      const rows = asStr(v.classes).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,\t]/).map((x) => x.trim())
        const toMin = (t: string) => {
          const m = t.match(/(\d{1,2}):?(\d{2})?/)
          return m ? parseInt(m[1]) * 60 + (parseInt(m[2] || '0')) : 0
        }
        return { day: p[0] || '', s: toMin(p[1] || ''), e: toMin(p[2] || ''), name: p[3] || 'Class' }
      }).filter((r) => r.day && r.s > 0)
      if (!rows.length) return [sres('Schedule', 'Add lines as "Day | Start | End | Course"', T.warn)]
      const dayNames = asSel(v.days) === 'Mon–Sun' ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : asSel(v.days) === 'Mon–Sat' ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const clashes: string[] = []
      const free: string[] = []
      const dayMin = 8 * 60
      const dayMax = 18 * 60
      dayNames.forEach((day) => {
        const todays = rows.filter((r) => r.day.toLowerCase().startsWith(day.slice(0, 3).toLowerCase())).sort((a, b) => a.s - b.s)
        for (let i = 0; i < todays.length - 1; i++) {
          if (todays[i].e > todays[i + 1].s) clashes.push(`${day}: ${todays[i].name} (${fmtMin(todays[i].s)}–${fmtMin(todays[i].e)}) overlaps ${todays[i + 1].name} (${fmtMin(todays[i + 1].s)})`)
        }
        let cursor = dayMin
        todays.forEach((c) => {
          if (c.s - cursor >= 90) free.push(`${day} ${fmtMin(cursor)}–${fmtMin(c.s)} — ${c.s - cursor} min free`)
          cursor = Math.max(cursor, c.e)
        })
        if (dayMax - cursor >= 90) free.push(`${day} ${fmtMin(cursor)}–${fmtMin(dayMax)} — ${dayMax - cursor} min free`)
      })
      const totalClass = rows.reduce((s, r) => s + Math.max(0, r.e - r.s), 0)
      return [
        sres('Timetable clashes', clashes.length ? num(clashes.length, 0) : 'none', clashes.length ? T.bad : T.good, clashes.length ? 'resolve these with the department' : 'no overlaps found', clashes.length ? 5 : 100),
        sres('Free study blocks ≥ 90 min', num(free.length, 0), free.length ? T.good : T.warn, `${num(free.reduce((s, f) => s + parseInt(f.match(/— (\d+) min/)?.[1] || '0', 10), 0), 0)} total minutes`, clamp(free.length * 12, 2, 100)),
        docr('Free blocks', free.length ? free.join('\n') : 'no gaps of 90 minutes or more — this timetable is very full'),
        docr('Clashes', clashes.length ? clashes.join('\n') : 'none'),
        res('Class time', `${num(Math.round(totalClass / 60), 0)} contact hours across ${num(dayNames.length, 0)} days`, T.neutral),
      ]
    },
  },
  {
    id: 'semester-planner',
    name: 'Semester Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Plans a whole semester: course load, weekly hours, assessment weeks, deadlines and a study budget per course.',
    tip: 'Put your hardest course in the semester with the lightest assessment load, not the one with the most free weeks. Free weeks get consumed.',
    usage: ['List courses with credits and assessment load.', 'Set term weeks.', 'Read the load and week-by-week view.'],
    method: ['Weekly contact hours per course are estimated.', 'Assessment weeks are placed by weight.', 'Budget is split by course difficulty.'],
    fields: [txt('courses', 'Courses (one per line: name | credits | assessment weight 1-5)', 6, 'Calculus II | 4 | 5\nPhysics II | 4 | 3\nAcademic Writing | 3 | 4\nElective | 3 | 1'), n('weeks', 'Term weeks', { def: 15, min: 1, max: 30, step: 1 }), n('study', 'Independent study hours per week', { def: 12, min: 0, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.courses).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,\t]/).map((x) => x.trim())
        return { name: p[0] || 'Course', cr: parseFloat(p[1]) || 3, load: parseFloat(p[2]) || 2 }
      })
      if (!rows.length) return [sres('Planner', 'Add courses as "name | credits | assessment weight"', T.warn)]
      const weeks = Math.max(1, Math.round(asNum(v.weeks)))
      const totalCr = rows.reduce((s, r) => s + r.cr, 0)
      const study = asNum(v.study)
      const contactPerWeek = totalCr * 1.5
      const totalLoad = rows.reduce((s, r) => s + r.load, 0) || 1
      const budget = rows.map((r) => ({ ...r, hrs: (r.load / totalLoad) * study }))
      const lines = budget.sort((a, b) => b.hrs - a.hrs).map((r) => `${r.name}: ${ratio(r.cr, 0)} cr, assessment weight ${num(r.load, 0)} → ${ratio(r.hrs, 1)} h/week independent study`)
      const peak = weeks - 1
      return [
        sres('Total load', `${ratio(totalCr, 0)} credits · ${ratio(contactPerWeek + study, 1)} h/week`, totalCr > 18 ? T.warn : T.good, totalCr > 18 ? 'heavy load — protect sleep' : 'manageable load'),
        sres('Study budget', `${ratio(study, 0)} h/week split ${num(rows.length, 0)} ways`, T.neutral, `≈${ratio(study / Math.max(1, totalCr), 1)} h per credit`),
        docr('Course allocation', lines.join('\n')),
        res('Assessment weeks', `${num(Math.max(1, Math.round(weeks * 0.25)), 0)}–${num(peak, 0)} are assessment-heavy — start projects in week ${num(Math.max(1, peak - 6), 0)}`, T.neutral),
        res('Buffer', 'keep one evening free every week — assessment weeks will spill into it', T.neutral),
      ]
    },
  },
  {
    id: 'holiday-study-planner',
    name: 'Holiday Study Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Turns a holiday window into a structured catch-up plan with subject allocation, rest days and checkpoints.',
    tip: 'Plan one rest day per week in advance. A six-day week fails by day four — the rest day is part of the plan, not a reward for it.',
    usage: ['Set your holiday dates and subjects.', 'Enter hours per day.', 'Read the weekly plan.'],
    method: ['Available days are counted.', 'Subjects are allocated by weakness.', 'One rest day per week is reserved.'],
    fields: [dt('start', 'Holiday start'), dt('end', 'Holiday end'), txt('subs', 'Subjects and priority (name | 1-3)', 5, 'Chemistry | 3\nMathematics | 3\nHistory | 1\nFrench | 2'), n('hours', 'Study hours per day', { def: 4, min: 1, max: 10, step: 0.5 })],
    compute: (v) => {
      const start = asStr(v.start)
      const end = asStr(v.end)
      if (!start || !end) return [sres('Plan', 'Set your start and end dates', T.warn)]
      const total = daysBetween(start, end)
      if (total <= 0) return [sres('Plan', 'End date must be after the start date', T.warn)]
      const subs = asStr(v.subs).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,\t]/).map((x) => x.trim())
        return { name: p[0] || 'Subject', pri: parseFloat(p[1]) || 2 }
      })
      if (!subs.length) return [sres('Plan', 'Add subjects as "name | priority"', T.warn)]
      const hours = asNum(v.hours) || 4
      const weeks = Math.ceil(total / 7)
      const restDays = weeks
      const studyDays = Math.max(1, total - restDays)
      const totalHours = studyDays * hours
      const priTotal = subs.reduce((s, x) => s + x.pri, 0) || 1
      const alloc = subs.map((s) => ({ ...s, hrs: (s.pri / priTotal) * totalHours }))
      const lines = alloc.sort((a, b) => b.hrs - a.hrs).map((s) => `${s.name} (priority ${num(s.pri, 0)}): ${ratio(s.hrs, 1)} h total ≈ ${ratio(s.hrs / hours, 1)} study days`)
      return [
        sres('Holiday window', `${num(total, 0)} days (${num(weeks, 0)} weeks)`, T.good, `${num(restDays, 0)} rest days reserved`),
        sres('Total study time', `${ratio(totalHours, 0)} hours`, T.good, `${num(studyDays, 0)} study days × ${ratio(hours, 1)} h`, clamp((totalHours / 100) * 100, 2, 100)),
        docr('Subject allocation', lines.join('\n')),
        res('Rest days', `${num(restDays, 0)} — one per week, scheduled in advance`, T.neutral, 'non-negotiable if you want week 3 to work'),
        res('Checkpoint', `review at the midpoint (${fmt(addDays(start, Math.floor(total / 2)))}) and drop the lowest-yield subject if behind`, T.neutral),
      ]
    },
  },
  {
    id: 'lecture-attendance-analyzer',
    name: 'Lecture Attendance Analyzer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Analyses which lecture types you miss and correlates that with performance, recommending a targeted policy.',
    tip: 'Missing problem lectures hurts more than missing theory ones. Analyse by type, not just by total percentage.',
    usage: ['Enter missed lectures by type.', 'Add your grade in each.', 'Read the correlation and policy.'],
    method: ['Attendance is computed per type.', 'Grades are averaged per type.', 'Misses are ranked by cost.'],
    fields: [txt('rows', 'Lecture types (one per line: type | held | attended | average grade)', 6, 'Problem-solving | 20 | 14 | 62\nTheory | 18 | 17 | 78\nLab | 10 | 9 | 84\nTutorial | 12 | 11 | 71'), n('req', 'Required attendance (%)', { def: 75, min: 0, max: 100, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.rows).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,\t]/).map((x) => x.trim())
        return { type: p[0] || 'Type', held: parseInt(p[1]) || 0, att: parseInt(p[2]) ?? 0, grade: parseFloat(p[3]) || 0 }
      }).filter((r) => r.held > 0)
      if (!rows.length) return [sres('Analysis', 'Add lines as "type | held | attended | grade"', T.warn)]
      const req = asNum(v.req) || 75
      const low = rows.filter((r) => (r.att / r.held) * 100 < req)
      const lines = rows.map((r) => {
        const pct = (r.att / r.held) * 100
        return `${pct < req ? 'LOW' : 'OK '} ${r.type}: ${ratio(pct, 1)}% attendance, ${ratio(r.grade, 0)}% average grade`
      })
      const attendedAvg = rows.reduce((s, r) => s + r.grade * r.att, 0) / (rows.reduce((s, r) => s + r.att, 0) || 1)
      const missedAvg = rows.reduce((s, r) => s + r.grade * (r.held - r.att), 0) / (rows.reduce((s, r) => s + r.held - r.att, 0) || 1)
      return [
        sres('Attendance-risk types', low.length ? low.map((r) => r.type).join(', ') : 'none', low.length ? T.bad : T.good, low.length ? 'below the requirement' : 'all types compliant', low.length ? 100 - (low.length / rows.length) * 100 : 100),
        sres('Grade of attended', ratio(attendedAvg, 1) + '%', T.neutral, 'classes you actually went to'),
        sres('Grade of missed', missedAvg > 0 ? ratio(missedAvg, 1) + '%' : 'n/a', missedAvg > attendedAvg ? T.warn : T.neutral, missedAvg > attendedAvg ? 'you do worse when you attend — the material is not the issue' : 'the material matters'),
        docr('By lecture type', lines.join('\n')),
        res('Verdict', missedAvg > attendedAvg + 5 ? 'your misses are not hurting you academically — but check eligibility rules anyway' : 'attendance correlates with performance — protect it', missedAvg > attendedAvg + 5 ? T.warn : T.good),
        res('Policy', `attend all ${low[0]?.type || 'problem-solving'} sessions to recover fastest`, T.neutral),
      ]
    },
  },
  {
    id: 'academic-year-planner',
    name: 'Academic Year Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Maps your whole academic year: semesters, breaks, applications, exams and internships on one dated timeline.',
    tip: 'Applications and internships have deadlines months before you need them. Put those dates in January, not in the month the deadline falls.',
    usage: ['Set your year start and terms.', 'Add applications and events.', 'Read the semester-by-semester map.'],
    method: ['Terms and breaks are placed by date.', 'Events are sorted into terms.', 'Application lead times are flagged.'],
    fields: [dt('start', 'Academic year start'), n('terms', 'Number of terms', { def: 2, min: 1, max: 4, step: 1 }), n('termWeeks', 'Weeks per term', { def: 15, min: 1, max: 30, step: 1 }), txt('events', 'Events (one per line: YYYY-MM-DD event)', 5, '2026-06-01 Summer internship starts\n2026-09-10 Graduate application opens\n2026-11-15 GRE registration\n2027-01-20 Final exams')],
    compute: (v) => {
      const start = asStr(v.start)
      if (!start) return [sres('Planner', 'Set the academic year start', T.warn)]
      const terms = Math.max(1, Math.round(asNum(v.terms)))
      const tw = Math.max(1, Math.round(asNum(v.termWeeks)))
      const events = asStr(v.events).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const m = l.match(/^(\d{4}-\d{2}-\d{2})\s*(.*)$/)
        return m ? { date: m[1], name: m[2] || 'Event' } : null
      }).filter((e): e is { date: string; name: string } => !!e)
      const termRanges: { i: number; s: string; e: string }[] = []
      for (let t = 0; t < terms; t++) termRanges.push({ i: t + 1, s: addDays(start, t * (tw * 7 + 21)), e: addDays(start, t * (tw * 7 + 21) + tw * 7 - 1) })
      const yearEnd = addDays(start, terms * (tw * 7 + 21) - 22)
      const lines = termRanges.map((t) => {
        const inTerm = events.filter((e) => daysBetween(t.s, e.date) >= 0 && daysBetween(t.s, e.date) <= daysBetween(t.s, t.e))
        return `Term ${t.i}: ${fmt(t.s)} → ${fmt(t.e)}\n${inTerm.length ? inTerm.map((e) => `   ▸ ${fmt(e.date)} — ${e.name}`).join('\n') : '   (no tracked events)'}`
      })
      const outside = events.filter((e) => !termRanges.some((t) => daysBetween(t.s, e.date) >= 0 && daysBetween(t.s, e.date) <= daysBetween(t.s, t.e)))
      return [
        sres('Academic year', `${fmt(start)} → ${fmt(yearEnd)}`, T.good, `${num(terms, 0)} terms of ${num(tw, 0)} weeks`),
        sres('Events tracked', num(events.length, 0), T.neutral, `${num(outside.length, 0)} fall in breaks`),
        docr('Term map', lines.join('\n')),
        res('Application lead time', 'grad applications typically open 9–12 months ahead — add those dates now', T.warn),
        res('Break use', 'breaks are for internships, rest and light revision — not for the term’s backlog', T.neutral),
      ]
    },
  },
  {
    id: 'tardiness-calculator',
    name: 'Tardiness Impact Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Works out how much of each class late arrivals consume and what that does to your attendance record and learning.',
    tip: 'Being ten minutes late twice a week costs you a third of a term. Shift your schedule rather than your sleep.',
    usage: ['Enter your average lateness and class times.', 'Set your commute.', 'Read the loss and the fix.'],
    method: ['Late minutes per class are estimated.', 'Lost hours per term are totalled.', 'The required buffer is proposed.'],
    fields: [n('late', 'Average minutes late per class', { def: 8, min: 0, step: 1 }), n('classes', 'Classes per week', { def: 5, min: 1, step: 1 }), n('weeks', 'Teaching weeks', { def: 14, min: 1, step: 1 }), n('commute', 'Your current commute (min)', { def: 25, min: 0, step: 5 }), n('campus', 'Campus travel needed (min)', { def: 10, min: 0, step: 5 })],
    compute: (v) => {
      const late = asNum(v.late)
      const classes = Math.max(1, Math.round(asNum(v.classes)))
      const weeks = Math.max(1, Math.round(asNum(v.weeks)))
      const commute = asNum(v.commute)
      const campus = asNum(v.campus)
      const totalLost = (late * classes * weeks) / 60
      const sessions = classes * weeks
      const perWeek = (late * classes) / 60
      const needed = late + campus + 5
      return [
        sres('Time lost to lateness', `${ratio(totalLost, 1)} hours`, totalLost > 20 ? T.warn : T.neutral, `${ratio(perWeek, 2)} h/week × ${num(weeks, 0)} weeks`, clamp(100 - perWeek * 20, 2, 100)),
        sres('Sessions affected', `${num(sessions, 0)} classes`, late > 10 ? T.bad : T.neutral, late > 10 ? 'you are late to more than 1 in 5 classes' : 'occasional — fixable'),
        sres('Required buffer', `${num(needed, 0)} minutes`, T.good, `current commute ${ratio(commute, 0)} min + campus ${ratio(campus, 0)} min + ${ratio(late, 0)} min late`),
        res('Attendance impact', `each late arrival may be recorded as an absence — ${num(Math.round(perWeek), 0)} absences per term`, T.warn),
        res('Fix', `leave ${num(Math.ceil(needed), 0)} minutes earlier than the minimum possible`, T.neutral, 'set an alarm, then add a second one'),
      ]
    },
  },
]
