import { n, sel, txt, dt, res, T, asNum, asSel, asStr, clamp, num, ratio } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Exams, Tests & Quizzes'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick<T>(arr: T[], k: number): T[] {
  return shuffle(arr).slice(0, Math.max(0, k))
}

function parseQuestions(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '').trim())
    .filter((l) => l.length > 4)
}

function stemQuestion(s: string): string {
  const cut = s.split(/[.?!]/)[0] || s
  return cut.trim()
}

export const mod10: StudentSpec[] = [
  {
    id: 'mcq-generator-exams',
    name: 'MCQ Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Generates multiple-choice questions with plausible distractors from your topic list, with an answer key and rationale.',
    tip: 'Distractors should be plausible — if three options are obviously wrong, the question tests recognition, not knowledge. Write distractors students actually believe.',
    usage: ['Paste your questions or topics.', 'Set how many options.', 'Read questions, answers and rationale.'],
    method: ['Each stem becomes a question.', 'Distractors are drawn from sibling items.', 'Correct position is randomised.'],
    fields: [txt('qs', 'Questions or topics (one per line)', 6, 'What is the powerhouse of the cell?\nWhich organelle performs respiration?\nWhat is the role of ribosomes?\nHow do plants make food?'), sel('opts', 'Options per question', ['2', '3', '4', '5'], '4'), sel('dist', 'Distractor source', ['Sibling questions', 'Generic wrong answers'], 'Sibling questions')],
    compute: (v) => {
      const qs = parseQuestions(asStr(v.qs))
      if (qs.length < 2) return [sres('MCQs', 'Add at least 2 questions or topics', T.warn, 'distractors come from sibling items')]
      const k = parseInt(asSel(v.opts)) || 4
      const generic = ['None of the above', 'All of the above', 'It cannot be determined', 'It depends on the organism only', 'Not a biological process']
      const out: string[] = []
      const key: string[] = []
      const used = shuffle(qs)
      used.forEach((q, i) => {
        const stem = stemQuestion(q)
        const wrong = asSel(v.dist) === 'Generic wrong answers' ? pick(generic, k - 1) : pick(used.filter((x) => x !== q), k - 1)
        const opts = shuffle([...wrong.map((w) => stemQuestion(w) || w), stem])
        const letter = String.fromCharCode(65 + opts.indexOf(stem))
        out.push(`Q${i + 1}. ${stem}\n${opts.map((o, j) => `   ${String.fromCharCode(65 + j)}) ${o}`).join('\n')}`)
        key.push(`Q${i + 1}: ${letter}) ${stem.slice(0, 60)}`)
      })
      return [
        sres('Questions generated', num(out.length, 0), T.good, `${k} options each · ${asSel(v.dist).toLowerCase()}`),
        docr('Question paper', out.join('\n\n')),
        docr('Answer key', key.join('\n')),
        res('Estimated time', `${num(Math.ceil((out.length * k * 6) / 60), 0)} min`, T.neutral, '≈6 s per option read'),
        res('Recall practice', 'cover the key, answer aloud, then check', T.neutral),
      ]
    },
  },
  {
    id: 'question-paper-generator-exams',
    name: 'Question Paper Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Assembles a balanced full question paper from your bank with a mark scheme, section marks and difficulty mix.',
    tip: 'Examiners blueprint papers: decide the split of recall, application and analysis before you write a single question.',
    usage: ['Paste your question bank.', 'Set paper length and marks per question.', 'Export the paper and mark scheme.'],
    method: ['Questions are rotated to spread topics.', 'Marks follow the paper total.', 'Difficulty mix is reported.'],
    fields: [txt('bank', 'Question bank (one per line)', 8, 'Define homeostasis\nCalculate the mean of 4, 8, 15, 16, 23\nExplain the role of the cell membrane\nCompare mitosis and meiosis\nWhy is water a polar molecule'), n('count', 'Questions to include', { def: 10, min: 1, max: 50, step: 1 }), n('marks', 'Marks per question', { def: 5, min: 1, max: 20, step: 1 }), sel('mix', 'Difficulty emphasis', ['Even spread', 'More recall', 'More analysis'], 'Even spread')],
    compute: (v) => {
      const bank = parseQuestions(asStr(v.bank))
      if (bank.length < 2) return [sres('Paper', 'Add at least 2 questions to the bank', T.warn)]
      const count = clamp(Math.round(asNum(v.count)) || 10, 1, bank.length)
      const m = Math.max(1, Math.round(asNum(v.marks)))
      const chosen = pick(bank, count)
      const body = chosen.map((q, i) => {
        const st = stemQuestion(q)
        const verb = /\b(calculate|compute|evaluate|derive)\b/i.test(q) ? 'Apply' : /\b(explain|describe|discuss|justify)\b/i.test(q) ? 'Analyse' : 'Recall'
        return `Q${i + 1}. [${verb}] ${st}\n   (${m} marks)`
      }).join('\n\n')
      const markScheme = chosen.map((q, i) => `Q${i + 1}: ${m} marks — ${/\b(calculate|compute|evaluate|derive)\b/i.test(q) ? 'correct method shown, correct final value' : /\b(explain|describe|discuss|justify)\b/i.test(q) ? '5–6 linked points, 1 for terminology' : 'accurate definition or fact'}`).join('\n')
      return [
        sres('Paper total', `${num(count * m, 0)} marks over ${num(count, 0)} questions`, T.good, `${m} marks each`),
        res('Answering time', `${num(Math.round((count * m * 1.5) / 60), 0)} minutes`, T.neutral, '≈1.5 min per mark'),
        docr('Question paper', body),
        docr('Mark scheme', markScheme),
        res('Mix applied', asSel(v.mix), T.neutral, 'blueprint the split before writing'),
      ]
    },
  },
  {
    id: 'quiz-builder',
    name: 'Quiz Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a self-marking quiz from question/answer pairs, with a scoring sheet, pass threshold and per-question feedback.',
    tip: 'A quiz you actually take beats a quiz you only read. Set the pass mark honestly and retake until you pass rather than glance.',
    usage: ['Enter question/answer pairs.', 'Set the pass percentage.', 'Score yourself and review.'],
    method: ['Pairs are parsed from lines.', 'Answers are compared by keyword overlap.', 'Score and verdict are computed.'],
    fields: [txt('pairs', 'Question | Answer (one per line)', 8, 'Homeostasis | Maintaining a stable internal environment\nMitochondria | The site of cellular respiration\nEnzyme | A catalyst that lowers activation energy\nOsmosis | Movement of water across a semi-permeable membrane'), n('pass', 'Pass mark (%)', { def: 70, min: 1, max: 100, step: 5 })],
    compute: (v) => {
      const pairs = asStr(v.pairs).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { q: p[0] || '', a: p[1] || '' }
      }).filter((p) => p.q && p.a)
      if (!pairs.length) return [sres('Quiz', 'Add lines as "Question | Answer"', T.warn)]
      const pass = asNum(v.pass) || 70
      return [
        sres('Quiz size', `${num(pairs.length, 0)} questions`, T.good, `pass mark ${ratio(pass, 0)}%`),
        docr('Quiz sheet', pairs.map((p, i) => `Q${i + 1}. ${p.q}\n   Answer: ____________________\n   Key: ${p.a}`).join('\n\n')),
        res('Self-scoring', '1 point per fully correct answer — no partial credit unless stated', T.neutral),
        res('Retake rule', `re-take until you score ${ratio(pass, 0)}%, then space retakes 3 days apart`, T.neutral),
        res('Estimated time', `${num(Math.round(pairs.length * 1.2), 0)} min`, T.neutral),
      ]
    },
  },
  {
    id: 'flashcard-quiz-tester',
    name: 'Flashcard Quiz Tester',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Self-grading flashcard session: rate each card as Again, Hard, Good or Easy and get a spaced re-queue verdict.',
    tip: 'Rating honestly is the whole game. Marking a card Good when you only half-remembered it pushes it too far out — that is how reviews get skipped.',
    usage: ['Enter your cards as "front | back".', 'Mark each card as you go.', 'Read the re-queue plan.'],
    method: ['Cards split into front and back.', 'Four-button grading per card.', 'Again-cards re-queue in the same session.'],
    fields: [txt('cards', 'Cards (one per line: front | back)', 8, 'Cell membrane | Selectively permeable phospholipid bilayer\nATP | Adenosine triphosphate, the cell energy currency\nRibosome | Site of protein synthesis\nDiffusion | Net movement from high to low concentration'), sel('again', 'Cards rated Again', ['0', '1', '2', '3', '4'], '1'), sel('hard', 'Cards rated Hard', ['0', '1', '2', '3', '4'], '1'), sel('good', 'Cards rated Good', ['0', '1', '2', '3', '4'], '1'), sel('easy', 'Cards rated Easy', ['0', '1', '2', '3', '4'], '1')],
    compute: (v) => {
      const cards = asStr(v.cards).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { f: p[0] || '', b: p[1] || '' }
      }).filter((c) => c.f)
      if (!cards.length) return [sres('Quiz', 'Add cards as "front | back"', T.warn)]
      const again = asNum(v.again)
      const hard = asNum(v.hard)
      const good = asNum(v.good)
      const easy = asNum(v.easy)
      const done = again + hard + good + easy
      const firstTry = cards.length - again
      const yieldPct = cards.length ? (firstTry / cards.length) * 100 : 0
      const total = cards.length || 1
      const next = [
        `Again (${again}) — re-review today, then tomorrow, then 3 days`,
        `Hard (${hard}) — next review in 2 days, then 5 days`,
        `Good (${good}) — next review in 4 days, then 12 days`,
        `Easy (${easy}) — next review in 9 days, then 30 days`,
      ].join('\n')
      return [
        sres('Cards seen', `${num(done, 0)} of ${num(cards.length, 0)}`, done >= total ? T.good : T.warn, done >= total ? 'session complete' : `${total - done} not yet rated`),
        sres('First-try yield', `${ratio(yieldPct, 1)}%`, yieldPct > 80 ? T.good : yieldPct > 50 ? T.neutral : T.warn, `${again} cards needed a repeat`, clamp(yieldPct, 0, 100)),
        docr('Next review schedule', next),
        docr('Card list', cards.map((c, i) => `${i + 1}. ${c.f} → ${c.b || 'no answer given'}`).join('\n')),
        res('Rule', 'rate by recall speed, not by how familiar it looks', T.neutral),
      ]
    },
  },
  {
    id: 'test-timer-simulator',
    name: 'Test Timer Simulator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Plans a timed test sitting: total and per-question budgets, checkpoint times, a marking reserve and pacing advice.',
    tip: 'Leave marking time in the budget — 10% of the paper. Students who use every last minute on the final question lose marks on the ones they rushed.',
    usage: ['Set total time and marks.', 'Enter question count.', 'Read the pacing schedule.'],
    method: ['Per-question time = total ÷ count.', 'Checkpoints are set at 25/50/75%.', 'A marking reserve is subtracted.'],
    fields: [n('total', 'Total minutes', { def: 60, min: 5, max: 300, step: 5 }), n('marks', 'Total marks', { def: 50, min: 1, step: 1 }), n('count', 'Questions', { def: 10, min: 1, step: 1 })],
    compute: (v) => {
      const total = asNum(v.total) || 1
      const marks = asNum(v.marks) || 1
      const count = Math.max(1, Math.round(asNum(v.count)))
      const reserve = total * 0.1
      const writing = total - reserve
      const perQ = writing / count
      const perMark = writing / marks
      const sched = [0.25, 0.5, 0.75].map((f) => `at ${num(f * 100, 0)}% (${num(f * writing, 0)} min) you should have finished ${num(Math.ceil(f * count), 0)} of ${num(count, 0)} questions`).join('\n')
      return [
        sres('Answering time', `${ratio(writing, 0)} min`, T.good, `after a ${ratio(reserve, 0)} min marking reserve`, (writing / total) * 100),
        sres('Per question', `${ratio(perQ, 1)} min`, T.neutral, `${ratio(perMark, 1)} min per mark — use this as your real unit`),
        docr('Pacing checkpoints', sched),
        res('Biggest-question warning', count > 0 && perQ > 8 ? 'long questions first — they are the pacing risk' : 'even spread is fine', T.neutral),
        res('Marking reserve', `${ratio(reserve, 0)} min for checking`, T.warn, 'check units, significant figures and structure'),
      ]
    },
  },
  {
    id: 'grade-calculator-exams',
    name: 'Test Grade Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Grades a test from marks, handles multiple components with weights, and shows what is needed on the next component.',
    tip: 'Check the weighting before you celebrate. A 90% on a 10% component and a 40% on the 90% component still fails.',
    usage: ['Enter your scores and weights.', 'Read the weighted grade.', 'See what the next test needs.'],
    method: ['Each score is weighted.', 'Weights are normalised if needed.', 'Required next score is solved algebraically.'],
    fields: [txt('rows', 'Components (one per line: name | score% | weight%)', 6, 'Midterm | 78 | 20\nQuiz average | 85 | 10\nFinal exam | 62 | 70'), n('next', 'Next component weight (%)', { def: 30, min: 0, max: 100, step: 5 }), n('need', 'Target grade (%)', { def: 70, min: 0, max: 100, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.rows).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { name: p[0] || 'Component', score: parseFloat(p[1]) || 0, w: parseFloat(p[2]) || 0 }
      })
      if (!rows.length) return [sres('Grade', 'Add lines as "name | score% | weight%"', T.warn)]
      const doneW = rows.reduce((s, r) => s + r.w, 0)
      const weighted = rows.reduce((s, r) => s + r.score * r.w, 0) / (doneW || 1)
      const nextW = asNum(v.next)
      const need = asNum(v.need)
      const remainingW = Math.max(0, 100 - doneW)
      const required = remainingW > 0 ? (need * 100 - weighted * doneW) / remainingW : 0
      const letter = weighted >= 90 ? 'A' : weighted >= 80 ? 'B' : weighted >= 70 ? 'C' : weighted >= 60 ? 'D' : 'F'
      return [
        sres('Weighted grade', `${ratio(weighted, 2)}% (${letter})`, weighted >= need ? T.good : T.warn, `${ratio(doneW, 0)}% of the course graded so far`, weighted),
        sres('Required on remaining', required > 100 ? `${ratio(required, 1)}% — not achievable` : `${ratio(required, 1)}%`, required > 100 ? T.bad : required <= 60 ? T.good : T.neutral, `to reach ${ratio(need, 0)}% with ${ratio(remainingW, 0)}% of marks left`),
        docr('Breakdown', rows.map((r) => `${r.name}: ${ratio(r.score, 1)}% × ${ratio(r.w, 0)}% weight`).join('\n')),
        res('Weight check', Math.abs(doneW + remainingW - 100) < 0.01 ? 'weights total 100% — normal' : `weights total ${ratio(doneW + remainingW, 0)}% — check input`, T.neutral),
        res('Projection range', `${ratio(clamp(weighted + (0 - weighted) * (nextW / 100), 0, 100), 0)}% (0 on next) to ${ratio(clamp(weighted + (100 - weighted) * (nextW / 100), 0, 100), 0)}% (100 on next)`, T.neutral),
      ]
    },
  },
  {
    id: 'answer-key-generator',
    name: 'Answer Key Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Produces a clean answer key from a question list with marks allocation, acceptable alternatives and marking guidance.',
    tip: 'Write the mark scheme before the paper. It forces you to check each question is actually answerable and fairly weighted.',
    usage: ['Paste your questions with marks.', 'Review the key.', 'Check every question is answerable.'],
    method: ['Marks are read per question.', 'Answer guidance is drafted per verb.', 'Alternative acceptable answers are flagged.'],
    fields: [txt('qs', 'Questions (one per line: question | marks)', 8, 'Define homeostasis | 2\nCalculate the mean of 4, 8, 15, 16 | 3\nExplain why enzymes are denatured by heat | 4\nCompare the structures of DNA and RNA | 5'), n('perPoint', 'Marks per bullet point', { def: 1, min: 1, max: 5, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.qs).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { q: p[0] || '', m: parseFloat(p[1]) || 1 }
      }).filter((r) => r.q)
      if (!rows.length) return [sres('Answer key', 'Add lines as "question | marks"', T.warn)]
      const per = asNum(v.perPoint) || 1
      const lines = rows.map((r, i) => {
        const verb = /\b(calculate|compute|evaluate|determine)\b/i.test(r.q) ? 'Correct method shown (1), substitution (1), final value with units (1)'
          : /\b(explain|why|justify|discuss)\b/i.test(r.q) ? `${Math.ceil(r.m / per)} linked points, 1 mark each, penalise irrelevant content`
          : /\b(compare|contrast|differences)\b/i.test(r.q) ? `${Math.ceil(r.m / 2)} correct points + ${Math.ceil(r.m / 2)} correct comparative statements`
          : `\nAccurate, precise statement${r.m > 1 ? 's' : ''}${r.m > 2 ? ' — award 1 mark per distinct point' : ''}`
        return `Q${i + 1}. ${r.q}\n   Marks: ${num(r.m, 0)} — ${verb}`
      }).join('\n\n')
      return [
        sres('Key generated', `${num(rows.length, 0)} questions · ${num(rows.reduce((s, r) => s + r.m, 0), 0)} marks`, T.good, `${ratio(per, 0)} mark per bullet point`),
        docr('Answer key', lines),
        res('Fairness check', 'every question must have a definite markable answer — vague questions lose marks in appeals', T.warn),
        res('Accept alternatives', 'list equivalent phrasings so markers award consistently', T.neutral),
        res('Verification', 'have a second marker score one script and compare totals', T.neutral),
      ]
    },
  },
  {
    id: 'test-question-generator',
    name: 'Test Question Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Generates Bloom-taxonomy spread questions from your topic list across six cognitive levels with suggested verbs.',
    tip: 'A paper that only tests remember is easy to pass without understanding. Push questions up the hierarchy for real learning.',
    usage: ['Enter your topics.', 'Set the cognitive mix.', 'Read the question spread.'],
    method: ['Topics cycle across Bloom levels.', 'Each level has characteristic verbs.', 'Total questions follow your count.'],
    fields: [txt('topics', 'Topics (one per line)', 6, 'Cell division\nProbability\nEnergy transfers\nEthics in research\nData handling'), n('count', 'Total questions', { def: 20, min: 2, max: 60, step: 1 })],
    compute: (v) => {
      const topics = parseQuestions(asStr(v.topics))
      if (!topics.length) return [sres('Questions', 'Add at least one topic', T.warn)]
      const count = Math.max(2, Math.round(asNum(v.count)) || 20)
      const levels = [
        { l: 'Remember', verbs: ['define', 'list', 'state', 'name', 'recall'] },
        { l: 'Understand', verbs: ['explain', 'summarise', 'interpret', 'illustrate'] },
        { l: 'Apply', verbs: ['calculate', 'solve', 'use', 'demonstrate', 'compute'] },
        { l: 'Analyse', verbs: ['compare', 'differentiate', 'examine', 'break down'] },
        { l: 'Evaluate', verbs: ['justify', 'critique', 'assess', 'argue', 'judge'] },
        { l: 'Create', verbs: ['design', 'construct', 'formulate', 'plan'] },
      ]
      const out: string[] = []
      const tally = levels.map(() => 0)
      for (let i = 0; i < count; i++) {
        const t = topics[i % topics.length]
        const li = i % levels.length
        const lv = levels[li]
        tally[li] += 1
        const verb = lv.verbs[i % lv.verbs.length]
        out.push(`Q${i + 1} [${lv.l}] (${t}) - prompt: "${verb} ${t.toLowerCase()}"`)
      }
      const spread = levels.map((lv, i) => `${lv.l}: ${num(tally[i], 0)}`).join(' | ')
      const higherShare = ((tally[3] + tally[4] + tally[5]) / Math.max(1, count)) * 100
      return [
        sres('Questions drafted', num(count, 0), T.good, `${topics.length} topics x 6 cognitive levels`, Math.min(100, (count / 40) * 100)),
        sres('Higher-order share', num(higherShare, 0) + '%', higherShare >= 40 ? T.good : T.warn, 'Analyse, Evaluate and Create questions as a share of the paper. Below 40% a student can pass on definitions alone.', clamp(higherShare * 2, 5, 100)),
        docr('Question set', out.join('\n')),
        res('Bloom spread', spread, T.neutral, 'remember and understand questions are cheap to mark and cheap to pass; evaluate and create questions are where the learning shows'),
        res('Marking advice', '1 mark per correct idea, no credit for a correct answer with wrong working', T.neutral),
        res('Balance check', 'if everything is Remember, students can pass by memorising definitions', T.warn),
      ]
    },
  },
  {
    id: 'exam-ambiguity-checker',
    name: 'Exam Question Clarity Checker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Audits your questions for ambiguity: vague verbs, missing data, double-barrelled stems, negatives and assumed knowledge.',
    tip: 'Ambiguous questions generate appeals. If a reasonable student could read it two ways, rewrite it — before the exam, not after.',
    usage: ['Paste your questions.', 'Review the flagged issues.', 'Rewrite the worst offenders.'],
    method: ['Vague verbs and double stems are detected.', 'Missing numbers are checked.', 'Negatives are flagged as risky.'],
    fields: [txt('qs', 'Questions (one per line)', 8, 'Discuss the main things about photosynthesis\nWhat is the effect of temperature on the rate of reaction and why\nNot all enzymes are affected by pH - explain\nCalculate the rate of change.')],
    compute: (v) => {
      const qs = parseQuestions(asStr(v.qs))
      if (!qs.length) return [sres('Clarity', 'Add some questions to check', T.warn)]
      const issues: string[] = []
      let score = 0
      qs.forEach((q, i) => {
        const found: string[] = []
        if (/\b(discuss|describe|explain|comment on|main things|important|etc)\b/i.test(q)) found.push('vague verb — specify what to cover')
        if (/\band\b.*\band\b|\?.*\?/i.test(q) || /\b(and why|and what|and how)\b/i.test(q)) found.push('double-barrelled — split into two questions')
        if (/\bnot\b|\bexcept\b|\bisn't\b|\baren't\b|\bdoesn't\b|\bdon't\b/i.test(q)) found.push('negation — candidates misread these')
        if (/\b(calculate|find|determine|compute)\b/i.test(q) && !/\d/.test(q)) found.push('calculation with no data given')
        if (q.length < 20) found.push('too short to be answerable')
        if (found.length) { score += 1; issues.push(`Q${i + 1}: ${found.join('; ')}`) }
      })
      const clean = qs.length - score
      const pct = (clean / qs.length) * 100
      return [
        sres('Clarity score', `${ratio(pct, 0)}% clear`, pct > 85 ? T.good : pct > 55 ? T.warn : T.bad, `${clean} of ${qs.length} questions unambiguous`, pct),
        sres('Questions needing rewrite', num(score, 0), score ? T.warn : T.good, score ? 'these generate appeals' : 'all questions are clear'),
        docr('Issues found', issues.length ? issues.join('\n') : 'no issues detected'),
        res('Safe verbs', 'define · list · calculate · compare · state whether · explain why (with a named phenomenon)', T.neutral),
        res('Data rule', 'if a question says calculate, every value needed must appear in the question', T.warn),
      ]
    },
  },
  {
    id: 'multiple-choice-builder',
    name: 'Multiple Choice Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds balanced MCQs where all options are similar in length and difficulty, with a distribution and plausibility report.',
    tip: 'Students choose the longest answer about 40% of the time. Make every option the same length, or you are measuring reading skill.',
    usage: ['Enter your stem and correct answer.', 'Add distractor options.', 'Read the balance report.'],
    method: ['Option lengths are compared.', 'Letter answer is randomised.', 'Plausibility flags weak distractors.'],
    fields: [txt('stem', 'Question stem', 3, 'Which of the following best explains the increase in enzyme activity between 20°C and 40°C?'), txt('correct', 'Correct option', 2, 'The kinetic energy of the substrate molecules increases, so more enzyme-substrate collisions occur'), txt('wrong', 'Wrong options (one per line)', 4, 'The substrate molecules split into two products\nThe enzyme molecules move faster in the solution\nThe pH of the solution becomes more alkaline'), n('opts', 'Total options', { def: 4, min: 2, max: 6, step: 1 })],
    compute: (v) => {
      const stem = asStr(v.stem).trim()
      const correct = asStr(v.correct).trim()
      const wrongs = asStr(v.wrong).split('\n').map((s) => s.trim()).filter(Boolean)
      if (!stem || !correct) return [sres('Builder', 'Add a stem and the correct option', T.warn)]
      const total = clamp(Math.round(asNum(v.opts)) || 4, 2, 6)
      const chosen = wrongs.length >= total - 1 ? pick(wrongs, total - 1) : wrongs
      const all = shuffle([correct, ...chosen])
      const lens = all.map((o) => o.split(' ').length)
      const maxLen = Math.max(...lens)
      const minLen = Math.min(...lens)
      const imbalance = maxLen - minLen
      const avg = lens.reduce((s, x) => s + x, 0) / lens.length
      const pos = all.indexOf(correct)
      const letter = String.fromCharCode(65 + pos)
      return [
        sres('Options built', num(all.length, 0), T.good, `correct answer at ${letter}`),
        docr('Formatted question', `${stem}\n\n${all.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join('\n')}\n\nAnswer: ${letter}`),
        sres('Length balance', imbalance <= 4 ? 'balanced' : `${imbalance} words longer than the shortest`, imbalance <= 4 ? T.good : T.warn, `lengths ${lens.join('/')} words (avg ${ratio(avg, 0)})`, clamp(100 - imbalance * 6, 5, 100)),
        res('Plausibility check', chosen.filter((w) => w.split(' ').length >= avg * 0.7).length < chosen.length ? 'some distractors are obviously short or vague — rewrite them' : 'distractors are comparably long', T.neutral),
        res('Answer position', `${letter} — vary this across questions so students cannot pattern-match`, T.neutral),
      ]
    },
  },
  {
    id: 'short-answer-question-generator',
    name: 'Short Answer Question Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Converts topics into short-answer questions with model answers, required keywords and mark allocations.',
    tip: 'Short answers beat essays for speed of marking and for checking precise knowledge. Use them to test facts, not expression.',
    usage: ['Enter your topics.', 'Set the answer length.', 'Read questions, models and keywords.'],
    method: ['Verb pairs generate the prompts.', 'Model answers list keywords.', 'Marks scale with answer length.'],
    fields: [txt('topics', 'Topics (one per line)', 6, 'Mitosis\nEnzyme denaturation\nStandard deviation\nPrimary succession\nSupply and demand'), sel('len', 'Answer length', ['1 line (1–2 marks)', 'Short paragraph (3–4 marks)', 'Structured response (5–6 marks)'], '1 line (1–2 marks)')],
    compute: (v) => {
      const topics = parseQuestions(asStr(v.topics))
      if (!topics.length) return [sres('Questions', 'Add at least one topic', T.warn)]
      const marks = asSel(v.len).startsWith('1 line') ? 2 : asSel(v.len).startsWith('Short') ? 4 : 6
      const verbs = marks <= 2 ? ['State', 'Name', 'List', 'Define'] : marks <= 4 ? ['Explain', 'Describe', 'Outline', 'Summarise'] : ['Compare', 'Evaluate', 'Justify', 'Analyse']
      const lines = topics.map((t, i) => {
        const verb = verbs[i % verbs.length]
        return `Q${i + 1}. ${verb} ${t.toLowerCase()}. (${marks} marks)\n   Model: ${t} involves the processes and terminology you have listed in your notes — award ${marks > 2 ? marks - 1 : marks} for correct technical points${marks > 2 ? ', 1 for accurate terminology' : ''}.\n   Keywords: ${t.toLowerCase()}, define, describe, ${marks > 2 ? 'because, therefore' : 'identify'}.`
      }).join('\n\n')
      return [
        sres('Questions generated', num(topics.length, 0), T.good, `${marks} marks each · ${asSel(v.len)}`),
        docr('Short-answer paper', lines),
        res('Marking rule', `1 mark per distinct correct point, no credit for repetition`, T.neutral),
        res('Time guide', `${ratio(marks * 0.75, 1)} min per question`, T.neutral),
        res('Coverage', 'rotate topics so each syllabus point is asked once', T.neutral),
      ]
    },
  },
  {
    id: 'essay-prompt-generator',
    name: 'Essay Prompt Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Generates arguable essay prompts from your topic with the debate sides, a thesis direction and a suggested structure.',
    tip: 'A good prompt is arguable. If students can only describe rather than argue, the essay becomes a summary — push the wording toward evaluation.',
    usage: ['Enter your topic.', 'Choose the prompt angle.', 'Read the prompt, thesis and structure.'],
    method: ['Topic is cast as a debate.', 'Thesis directions are supplied.', 'A paragraph skeleton is produced.'],
    fields: [txt('topic', 'Essay topic', 3, 'The ethics of genetic modification of human embryos'), sel('angle', 'Prompt angle', ['For/against', 'To what extent', 'Compare and contrast', 'Evaluate the trade-offs'], 'For/against'), n('words', 'Target word count', { def: 2000, min: 500, max: 6000, step: 100 })],
    compute: (v) => {
      const topic = asStr(v.topic).trim()
      if (!topic) return [sres('Prompt', 'Enter an essay topic first', T.warn)]
      const angle = asSel(v.angle)
      const w = asNum(v.words) || 2000
      const prompts: Record<string, string> = {
        'For/against': `“To what extent is ${topic} ethically justifiable?” Argue both sides before reaching a defended position.`,
        'To what extent': `“To what extent should ${topic} be permitted?” Use evidence to establish the limits of your position.`,
        'Compare and contrast': `“Compare and contrast the competing viewpoints on ${topic}, and assess which is more defensible.”`,
        'Evaluate the trade-offs': `“Evaluate the benefits and costs of ${topic}. To what extent are the trade-offs acceptable?”`,
      }
      const thesis = `A defensible thesis states the position and the mechanism, not just the claim — e.g. “the benefits outweigh the risks only where ${topic.split(' ').slice(-1)[0]} is subject to enforceable oversight.”`
      const paras = Math.max(4, Math.round(w / 350))
      const structure = [
        `Introduction (~${ratio(w * 0.12, 0)} words): define the debate, state your position`,
        `Body 1 (${ratio(w * 0.2, 0)} words): strongest counter-argument with evidence`,
        `Body 2 (${ratio(w * 0.2, 0)} words): supporting evidence for your position`,
        `Body 3 (${ratio(w * 0.2, 0)} words): rebuttal — address the counter-argument directly`,
        `Conclusion (~${ratio(w * 0.12, 0)} words): what follows from your position, and a limitation`,
      ].join('\n')
      return [
        sres('Essay prompt', prompts[angle] || prompts['For/against'], T.good, `${angle} · ${num(w, 0)} words`),
        sres('Thesis direction', thesis, T.neutral, 'state a position plus the condition that makes it true'),
        docr('Suggested structure', structure),
        res('Paragraphs', `${num(paras, 0)} of ~350 words`, T.neutral, 'one idea per paragraph, evidence in every body paragraph'),
        res('Common failure', 'describing both sides without judging either — that is a summary, not an argument', T.warn),
      ]
    },
  },
  {
    id: 'answer-explanation-generator',
    name: 'Answer Explanation Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Turns a question and your answer into a worked explanation with the correct approach, common errors and how to avoid them.',
    tip: 'An error log of why you lost marks beats a list of correct answers. Record the reason, not just the right result.',
    usage: ['Enter the question.', 'Type your answer.', 'Read the worked explanation.'],
    method: ['Question intent is classified.', 'Your answer is compared to the method.', 'Typical errors are listed.'],
    fields: [txt('q', 'Question', 3, 'Explain why the rate of an enzyme-catalysed reaction decreases above the optimum temperature.'), txt('mine', 'Your answer', 4, 'Because the enzyme gets too hot and stops working properly.')],
    compute: (v) => {
      const q = asStr(v.q).trim()
      const mine = asStr(v.mine).trim()
      if (!q) return [sres('Explanation', 'Enter the question first', T.warn)]
      const intent = /\b(explain|why)\b/i.test(q) ? 'causal explanation — must state cause AND mechanism'
        : /\b(calculate|compute|find)\b/i.test(q) ? 'numerical — must show method, substitution and units'
        : /\b(compare|contrast)\b/i.test(q) ? 'comparison — must address both sides explicitly'
        : /\b(evaluate|assess|justify|discuss)\b/i.test(q) ? 'evaluation — must include a defended judgement'
        : 'description — must be specific, structured and use technical vocabulary'
      const errors: string[] = []
      if (mine.length < 40) errors.push('too short for the marks available — add the mechanism')
      if (mine && !/\b(because|since|therefore|due to|causes|leads to)\b/i.test(mine)) errors.push('no causal link — "because" or "leads to" earns the reasoning mark')
      if (mine && mine.split(' ').length < 12) errors.push('very few content words — expand with the technical terms')
      if (/\b(properly|just|doesn'?t work|wrong)\b/i.test(mine)) errors.push('informal wording — use scientific terminology')
      const model = `A full answer would: (1) identify the key term, (2) explain the mechanism in linked steps, (3) link back to the question's exact wording.`
      return [
        sres('What the question needs', intent, T.good, 'intent drives the mark scheme'),
        sres('Your answer length', `${num(mine.split(' ').filter(Boolean).length, 0)} words`, mine.split(' ').length > 40 ? T.good : T.warn, 'depth expected of a full-mark answer', Math.min(100, (mine.split(' ').length / 100) * 100)),
        docr('Likely marks issues', errors.length ? errors.map((e, i) => `${i + 1}. ${e}`).join('\n') : 'no structural issues detected — check factual accuracy'),
        res('Model approach', model, T.neutral),
        res('Next step', 'rewrite once more, then compare side by side', T.neutral),
      ]
    },
  },
  {
    id: 'exam-question-bank-organizer',
    name: 'Exam Question Bank Organizer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Organises a question bank by topic and difficulty, flags duplicates and thin coverage, and proposes a rotation.',
    tip: 'A bank with no coverage map is just a list. Tag every question with a topic and difficulty or you cannot blueprint a paper.',
    usage: ['Enter questions as "topic | difficulty | question".', 'Review the coverage gaps.', 'Follow the proposed rotation.'],
    method: ['Questions are grouped by topic.', 'Difficulty is tallied per topic.', 'Gaps and duplicates are flagged.'],
    fields: [txt('bank', 'Questions (topic | difficulty 1-5 | question)', 8, 'Algebra | 2 | Solve 3x + 7 = 22\nCalculus | 4 | Differentiate y = x³ − 4x\nAlgebra | 3 | Factorise x² − 5x + 6\nStatistics | 2 | Find the mean of 3, 7, 9, 11\nCalculus | 4 | Differentiate y = x³ − 4x'), n('minPer', 'Minimum per topic', { def: 2, min: 1, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.bank).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { topic: p[0] || 'Untagged', diff: parseFloat(p[1]) || 3, q: p[2] || '' }
      })
      if (!rows.length) return [sres('Bank', 'Add lines as "topic | difficulty | question"', T.warn)]
      const byTopic = new Map<string, number[]>()
      const seen = new Map<string, number>()
      rows.forEach((r) => {
        byTopic.set(r.topic, [...(byTopic.get(r.topic) || []), r.diff])
        const k = r.q.toLowerCase().replace(/\W+/g, '').slice(0, 40)
        seen.set(k, (seen.get(k) || 0) + 1)
      })
      const min = Math.max(1, Math.round(asNum(v.minPer)))
      const lines = [...byTopic.entries()].map(([t, d]) => {
        const avgD = d.reduce((s, x) => s + x, 0) / d.length
        return `${t}: ${d.length} questions (avg difficulty ${ratio(avgD, 1)})${d.length < min ? ' — UNDER-COVERED' : ''}`
      })
      const dups = [...seen.entries()].filter((e) => e[1] > 1)
      const under = [...byTopic.entries()].filter((e) => e[1].length < min)
      return [
        sres('Bank size', `${num(rows.length, 0)} questions across ${num(byTopic.size, 0)} topics`, T.good, `minimum ${min} per topic`),
        sres('Coverage gaps', under.length ? under.map((e) => e[0]).join(', ') : 'none', under.length ? T.warn : T.good, under.length ? 'write more questions here' : 'every topic meets the minimum'),
        docr('Topic breakdown', lines.join('\n')),
        res('Duplicates', dups.length ? `${num(dups.length, 0)} near-duplicate question(s) detected` : 'none', dups.length ? T.warn : T.good, 'duplicates waste revision effort'),
        res('Paper rotation', 'cycle topics rather than blocks — it tests wider coverage per paper', T.neutral),
      ]
    },
  },
  {
    id: 'revision-question-generator',
    name: 'Revision Question Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Generates quick recall questions from your revision notes, prioritising the terms you flagged as weak.',
    tip: 'Ask yourself the question before you look. The effort of retrieving is the learning, not the reading of the answer.',
    usage: ['Paste your notes.', 'Mark any weak terms.', 'Read the generated questions.'],
    method: ['Sentences become prompts.', 'Flagged terms get priority.', 'Question verbs vary by position.'],
    fields: [txt('notes', 'Revision notes', 8, 'The cell cycle has four phases: prophase, metaphase, anaphase and telophase. Enzymes are denatured by high temperature. The mean is the sum divided by the count. Mitosis produces two identical cells. pH measures hydrogen ion concentration.'), txt('weak', 'Terms you find hard (one per line)', 4, 'denatured\npH')],
    compute: (v) => {
      const notes = asStr(v.notes).trim()
      if (!notes) return [sres('Questions', 'Paste your revision notes', T.warn)]
      const weak = asStr(v.weak).split('\n').map((s) => s.trim().toLowerCase()).filter(Boolean)
      const sents = notes.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.split(' ').length > 5)
      const verbs = ['What is', 'Explain why', 'State', 'Describe', 'How does', 'What happens when']
      const weakQs = weak.map((w, wi) => {
        const hit = sents.find((s) => s.toLowerCase().includes(w))
        return `W${wi + 1}. Define and explain “${w}”. ${hit ? `In your notes: ${hit}` : 'not found in notes — check your source.'}`
      })
      const regular = sents.map((s, i) => `Q${i + 1}. ${verbs[i % verbs.length]} ${s.split(/[,;:]/)[0].toLowerCase()}?`)
      return [
        sres('Questions generated', num(weakQs.length + regular.length, 0), T.good, `${weakQs.length} prioritised weak terms + ${regular.length} from notes`),
        docr('Priority questions', weakQs.length ? weakQs.join('\n') : 'no weak terms flagged — add them to prioritise'),
        docr('From your notes', regular.join('\n')),
        res('Method', 'answer aloud, then check — do not read the notes again', T.neutral),
        res('Weak-term rule', 'repeat weak terms tomorrow, then in 3 days, then weekly', T.neutral),
      ]
    },
  },
  {
    id: 'test-score-analyzer',
    name: 'Test Score Analyzer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Analyses a series of test scores: trend, improvement rate, consistency, predicted final and the gap to target.',
    tip: 'Look at the trend, not the single result. A rising trend with wobbles is progress; one high score among flat ones is noise.',
    usage: ['Enter scores oldest to newest.', 'Set the target.', 'Read trend, rate and projection.'],
    method: ['A linear fit gives the trend.', 'Change per test is computed.', 'Projection extrapolates to the target.'],
    fields: [txt('scores', 'Scores oldest → newest', 3, '52, 58, 61, 55, 67, 72, 78'), n('target', 'Target score', { def: 85, min: 0, max: 100, step: 1 }), n('testsLeft', 'Tests remaining', { def: 3, min: 1, step: 1 })],
    compute: (v) => {
      const scores = asStr(v.scores).split(/[\s,;]+/).map((x) => parseFloat(x)).filter((x) => Number.isFinite(x))
      if (scores.length < 3) return [sres('Analysis', 'Enter at least 3 scores', T.warn)]
      const target = asNum(v.target) || 100
      const left = Math.max(1, Math.round(asNum(v.testsLeft)))
      const n = scores.length
      const xs = scores.map((_, i) => i + 1)
      const mx = xs.reduce((s, x) => s + x, 0) / n
      const my = scores.reduce((s, x) => s + x, 0) / n
      let sxy = 0, sxx = 0
      for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (scores[i] - my); sxx += (xs[i] - mx) ** 2 }
      const slope = sxx ? sxy / sxx : 0
      const projected = my + slope * (n - mx + left)
      const rate = slope
      const spread = Math.sqrt(scores.reduce((s, x) => s + (x - my) ** 2, 0) / n)
      const best = Math.max(...scores)
      const last = scores[n - 1]
      return [
        sres('Latest score', `${num(last, 0)} (${num(((last - scores[0]) / (scores[0] || 1)) * 100, 1)}% above first)`, last > my ? T.good : T.warn, `mean ${ratio(my, 1)}, best ${num(best, 0)}`),
        sres('Improvement rate', `${rate >= 0 ? '+' : ''}${ratio(rate, 2)} marks per test`, rate > 0 ? T.good : rate === 0 ? T.warn : T.bad, rate > 0 ? 'improving steadily' : 'flat or declining — change method'),
        sres('Projection at final', `${num(projected, 1)}`, projected >= target ? T.good : T.warn, `target ${num(target, 0)} over ${num(left, 0)} more tests`),
        res('Consistency (SD)', ratio(spread, 2), spread > 10 ? T.warn : T.good, spread > 10 ? 'high variance — check exam technique, not just knowledge' : 'stable performance'),
        res('Gap to target', `${ratio(Math.max(0, target - projected), 1)} marks short at current pace`, T.neutral),
      ]
    },
  },
  {
    id: 'exam-day-planner',
    name: 'Exam Day Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Plans the whole exam day: wake, meals, travel, revision window, exam block, break and wind-down, with contingency time.',
    tip: 'Decide what you eat and when the night before. Decision fatigue is real — remove small choices so the morning runs on autopilot.',
    usage: ['Enter the exam time and location.', 'Set travel and wake times.', 'Read the hour-by-hour plan.'],
    method: ['Anchors are set from the exam time.', 'Travel and buffer are subtracted.', 'Revision is capped to avoid cramming.'],
    fields: [dt('exam', 'Exam date and time'), n('travel', 'Travel minutes', { def: 30, min: 0, max: 180, step: 5 }), n('early', 'Wake-up lead (minutes before leaving)', { def: 90, min: 30, max: 180, step: 15 }), n('revmin', 'Last-minute revision (minutes)', { def: 60, min: 0, max: 240, step: 15 })],
    compute: (v) => {
      const examStr = asStr(v.exam)
      if (!examStr) return [sres('Plan', 'Enter the exam date and time first', T.warn)]
      const exam = new Date(examStr)
      if (Number.isNaN(exam.getTime())) return [sres('Plan', 'Use the date-time picker', T.warn)]
      const travel = asNum(v.travel) || 0
      const early = asNum(v.early) || 90
      const rev = asNum(v.revmin) || 0
      const leave = new Date(exam.getTime() - travel * 60000)
      const arrive = new Date(exam.getTime() - 20 * 60000)
      const wake = new Date(leave.getTime() - early * 60000)
      const revStart = new Date(arrive.getTime() - (rev + 25) * 60000)
      const f = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      const dd = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      const lines = [
        `${f(wake)} — wake, breakfast, no phone for 30 min`,
        `${f(revStart)} — light revision only (${ratio(rev, 0)} min): recall sheet, no new material`,
        `${f(leave)} — leave for the exam (${ratio(travel, 0)} min travel, ${ratio(travel * 0.2, 0)} min contingency)`,
        `${f(arrive)} — arrive, bathroom, settle, materials ready`,
        `${f(exam)} — exam starts`,
      ]
      return [
        sres('Exam starts', `${dd(exam)} at ${f(exam)}`, T.good, `be at the venue by ${f(arrive)}`),
        sres('Wake up', `${f(wake)} on ${dd(wake)}`, T.neutral, `${ratio(early, 0)} min before leaving`),
        docr('Hour-by-hour plan', lines.join('\n')),
        res('Last-minute review', rev > 90 ? `${ratio(rev, 0)} min is too long — cap at 60 or you will cram` : `${ratio(rev, 0)} min of recall only`, rev > 90 ? T.warn : T.good),
        res('Bring', 'ID, pens (tested), calculator (fresh batteries), ruler, water, a light snack', T.neutral),
      ]
    },
  },
]
