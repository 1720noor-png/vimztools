import { n, sel, txt, res, T, asNum, asSel, asStr, clamp, num } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'AI Study & Summarization'

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'at', 'by', 'for', 'in', 'on', 'to', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'it', 'its', 'as', 'this', 'that', 'these', 'those',
  'with', 'from', 'than', 'then', 'so', 'if', 'they', 'their', 'we', 'you', 'your', 'our',
  'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should', 'may',
  'not', 'no', 'but', 'which', 'who', 'whom', 'what', 'when', 'where', 'how', 'all', 'any',
  'more', 'most', 'some', 'such', 'also', 'there', 'here', 'about', 'into', 'over', 'under',
])

function sentenceList(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 3)
}

function tokenCount(text: string): Map<string, number> {
  const m = new Map<string, number>()
  for (const raw of text.toLowerCase().match(/[a-z]+(?:['-][a-z]+)*/g) || []) {
    if (STOP.has(raw) || raw.length < 3) continue
    m.set(raw, (m.get(raw) || 0) + 1)
  }
  return m
}

function keywords(text: string, count: number): string[] {
  return [...tokenCount(text).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([w]) => w)
}

const PAS = txt('text', 'Lecture / chapter text', 10, 'Insert a lecture transcript or chapter excerpt here.')
const TOP = txt('topic', 'Topic or subject', 2, 'Cellular respiration')

export const mod02: StudentSpec[] = [
  {
    id: 'ai-pdf-summarizer',
    name: 'AI PDF Summarizer',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Feeds extracted PDF text through an extractive pipeline that compresses it into crisp section summaries with a measurable reduction ratio.',
    tip: 'Scan your PDF text in 400–900 word chunks — extractive summaries stay sharper when the source is bounded and focused.',
    usage: [
      'Paste text copied from your PDF.',
      'Choose how tight the summary should be.',
      'Review the section-wise digest and ratio.',
    ],
    method: [
      'Each paragraph yields its most representative sentence.',
      'Chosen sentences are ranked by keyword coverage.',
      'The ratio compares output words to source words.',
    ],
    fields: [PAS, sel('depth', 'Summary depth', ['Tight (10–15%)', 'Balanced (20–25%)', 'Detailed (30–40%)'], 'Balanced (20–25%)')],
    compute: (v) => {
      const t = asStr(v.text)
      const paras = t.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
      const all = sentenceList(paras.join(' '))
      const ratio = asSel(v.depth) === 'Tight (10–15%)' ? 0.12 : asSel(v.depth) === 'Detailed (30–40%)' ? 0.35 : 0.22
      const target = Math.max(2, Math.round(all.length * ratio))
      const kws = keywords(t, 10)
      const picked = all
        .map((s, i) => ({ s, i, score: kws.reduce((acc, k) => acc + (s.toLowerCase().includes(k) ? 1 : 0), 0) + (i === 0 || i === all.length - 1 ? 2 : 0) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, target)
        .sort((a, b) => a.i - b.i)
      const srcWords = t.split(/\s+/).filter(Boolean).length
      const outWords = picked.map((p) => p.s).join(' ').split(/\s+/).filter(Boolean).length
      return [
        sres('Source words', num(srcWords), T.good),
        sres('Summary words', num(outWords), T.neutral, `compression to ${Math.round((outWords / Math.max(srcWords, 1)) * 100)}%`, outWords ? Math.min(100, Math.round((outWords / Math.max(srcWords, 1)) * 100)) : 0),
        docr('Extractive summary', picked.length ? picked.map((p) => '• ' + p.s).join('\n') : 'Provide more text to summarize.'),
      ]
    },
  },
  {
    id: 'ai-text-summarizer',
    name: 'AI Text Summarizer',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Produces a keyword-weighted extractive summary of any pasted text, tuned by length and sentence-diversity settings.',
    tip: 'Summaries read best when your source uses topic sentences — run Text Cleaner first to strip pasted artifacts that skew sentence scoring.',
    usage: [
      'Paste the passage to compress.',
      'Set the target sentence count.',
      'Copy the scored summary.',
    ],
    method: [
      'Every sentence is scored against the keyword histogram.',
      'First and last sentences earn a positional bonus.',
      'Top sentences are re-sorted into original order.',
    ],
    fields: [PAS, n('n', 'Sentences in summary', { def: 5, min: 1, max: 25, step: 1 })],
    compute: (v) => {
      const t = asStr(v.text)
      const all = sentenceList(t)
      const kws = keywords(t, 12)
      const take = clamp(asNum(v.n), 1, 25)
      const picked = all
        .map((s, i) => ({
          s,
          i,
          score: kws.reduce((acc, k) => acc + (s.toLowerCase().includes(k) ? 1 : 0), 0) + (i === 0 ? 3 : i === all.length - 1 ? 2 : 0),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(take, all.length))
        .sort((a, b) => a.i - b.i)
      return [
        sres('Coverage', `${Math.min(take, all.length)} of ${all.length} sentences`, picked.length ? T.good : T.warn, undefined, Math.min(100, Math.round((picked.length / Math.max(all.length, 1)) * 100))),
        res('Key terms', kws.slice(0, 6).join(', '), T.neutral),
        docr('Summary', picked.length ? picked.map((p) => '• ' + p.s).join('\n') : 'Need fuller text to summarize.'),
      ]
    },
  },
  {
    id: 'lecture-summarizer',
    name: 'Lecture Summarizer',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Organizes a lecture transcript into numbered talking points per paragraph, extracting the recurring themes a lecturer kept returning to.',
    tip: 'Lecturers repeat the examinable ideas three times on average — check your extracted keywords against your own notes for the “said thrice” test.',
    usage: [
      'Paste the full transcript or notes.',
      'Review the per-paragraph takeaway lines.',
      'Copy the theme tags for revision.',
    ],
    method: [
      'Paragraphs are separated and trimmed.',
      'The leading claim of each paragraph is captured.',
      'Recurring keywords become lecture themes.',
    ],
    fields: [PAS],
    compute: (v) => {
      const t = asStr(v.text)
      const paras = t.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
      const picks = paras.map((p) => {
        const s = sentenceList(p)[0] || p.slice(0, 140)
        return s.length > 160 ? s.slice(0, 157) + '…' : s
      })
      const themes = keywords(t, 6)
      return [
        sres('Sections analysed', num(paras.length), paras.length ? T.good : T.warn),
        res('Recurring themes', themes.join(', ') || '—', T.neutral),
        docr('Lecture take-aways', picks.length ? picks.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'Add transcript text.'),
      ]
    },
  },
  {
    id: 'chapter-summarizer-ai',
    name: 'Chapter Summarizer',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Breaks a long chapter into per-section one-liners, tallies word load per section and highlights the densest paragraphs for double review.',
    tip: 'The densest paragraphs (most keywords per sentence) are usually the exam core — mark them before your two-day review pass.',
    usage: [
      'Paste the chapter text with paragraph breaks.',
      'Read each section’s compression.',
      'Revisit the flagged dense sections.',
    ],
    method: [
      'Paragraphs map to sections by order.',
      'Each section keeps a single lead sentence.',
      'Density scores flag keyword-rich paragraphs.',
    ],
    fields: [PAS, n('max', 'Max sections', { def: 12, min: 3, max: 30, step: 1 })],
    compute: (v) => {
      const t = asStr(v.text)
      const paras = t.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).slice(0, clamp(asNum(v.max), 3, 30))
      const kws = keywords(t, 12)
      const rows = paras.map((p) => {
        const lead = sentenceList(p)[0] || p.slice(0, 120)
        const dens = kws.reduce((acc, k) => acc + (p.toLowerCase().includes(k) ? 1 : 0), 0)
        return { w: p.split(/\s+/).length, dens, lead }
      })
      const maxDens = Math.max(...rows.map((r) => r.dens), 1)
      const denseIdx = rows.map((r, i) => ({ ...r, i })).sort((a, b) => b.dens - a.dens).slice(0, Math.max(1, Math.floor(rows.length / 4)))
      return [
        sres('Sections', num(rows.length), rows.length ? T.good : T.warn),
        sres('Total words', num(rows.reduce((a, r) => a + r.w, 0)), T.neutral),
        docr('Section leads', rows.map((r, i) => `S${i + 1} (${num(r.w)} words, density ${r.dens}/${maxDens}): ${r.lead}`).join('\n')),
        docr('Flagged dense sections', denseIdx.map((r) => `• ${r.lead.slice(0, 100)}`).join('\n')),
      ]
    },
  },
  {
    id: 'notes-generator',
    name: 'Notes Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Turns raw material into structured revision notes — headings from themes, bullets from sentences, and a ready vocabulary list.',
    tip: 'Restructure generated bullets into your own words within 24 hours; the act of rewriting is what creates durable memory traces.',
    usage: [
      'Paste source material, slides or notes.',
      'Choose how many theme sections to create.',
      'Copy the formatted note sheet.',
    ],
    method: [
      'Keywords cluster sentences into theme buckets.',
      'Each cluster becomes a heading with bullets.',
      'A vocabulary box lists the top terms.',
    ],
    fields: [PAS, n('groups', 'Theme sections', { def: 4, min: 2, max: 10, step: 1 })],
    compute: (v) => {
      const t = asStr(v.text)
      const kws = keywords(t, clamp(asNum(v.groups), 2, 10))
      const sents = sentenceList(t)
      const buckets = kws.map((k) => ({ k, picked: sents.filter((s) => s.toLowerCase().includes(k)).slice(0, 3) }))
      const lines = buckets
        .map((b) => `## ${b.k.charAt(0).toUpperCase() + b.k.slice(1)}\n` + (b.picked.length ? b.picked.map((p) => `- ${p}`).join('\n') : '- (no matching sentence)'))
        .join('\n\n')
      return [
        sres('Note sections', num(kws.length), kws.length ? T.good : T.neutral),
        docr('Structured notes', lines || 'Paste some source text.'),
        docr('Vocabulary box', kws.join(' · ')),
      ]
    },
  },
  {
    id: 'key-points-extractor',
    name: 'Key Points Extractor',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Ranks sentences by how many rare keywords they carry and returns the highest-value handful — the examinable sentences in your material.',
    tip: 'Sentences containing three or more distinctive terms are statistically the highest-yield flashcard candidates. Start converting those first.',
    usage: [
      'Paste your material.',
      'Set the number of points to extract.',
      'Review the ranked extraction.',
    ],
    method: [
      'Rare keywords (low frequency, high distinctiveness) carry more weight.',
      'Each sentence is scored by total keyword weight.',
      'Ties are broken by original sentence position.',
    ],
    fields: [PAS, n('n', 'Points to extract', { def: 8, min: 2, max: 20, step: 1 })],
    compute: (v) => {
      const t = asStr(v.text)
      const sents = sentenceList(t)
      const counts = tokenCount(t)
      const total = [...counts.values()].reduce((a, b) => a + b, 0)
      const kws = [...counts.entries()]
        .map(([w, c]) => ({ w, wgt: (1 / (c / total)) * c }))
        .sort((a, b) => b.wgt - a.wgt)
        .slice(0, 15)
        .map((k) => k.w)
      const ranked = sents
        .map((s, i) => ({ s, i, score: kws.reduce((acc, k) => acc + (s.toLowerCase().includes(k) ? 1 : 0), 0) }))
        .sort((a, b) => b.score - a.score || a.i - b.i)
        .slice(0, clamp(asNum(v.n), 2, 20))
        .sort((a, b) => a.i - b.i)
      return [
        sres('Points extracted', num(ranked.length), ranked.length ? T.good : T.warn),
        res('Distinctive terms', kws.slice(0, 8).join(', '), T.neutral),
        docr('Key points', ranked.map((r, i) => `${i + 1}. ${r.s}`).join('\n')),
      ]
    },
  },
  {
    id: 'ai-flashcard-generator',
    name: 'AI Flashcard Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Pairs definition-style sentences into question/answer flashcards using the “X: meaning” and “X is Y” patterns found in your text.',
    tip: 'Keep each card atomic: one fact per card. Split compound answers when you review — atomic cards are what spaced repetition rewards.',
    usage: [
      'Paste notes containing “term — definition” patterns.',
      'Review the generated pairs.',
      'Copy them into your flashcard deck format.',
    ],
    method: [
      'Sentences with a dash or colon split into term + definition.',
      '“X is …” sentences become term → rest-of-sentence cards.',
      'Single clauses are turned into fill-in-blank cards.',
    ],
    fields: [txt('text', 'Notes or glossary text', 8, 'Mitosis: division of a cell nucleus\nDNA — carries genetic instructions')],
    compute: (v) => {
      const t = asStr(v.text)
      const cards: string[] = []
      for (const line of t.split(/\n+/).map((s) => s.trim()).filter(Boolean)) {
        const m = line.match(/^([^:—–-]{2,60})[:—–-]\s*(.+)$/)
        if (m) cards.push(`${m[1].trim()} ? ${m[2].trim()}`)
        else if (line.length > 8) cards.push(`${line} ? (fill the blank)`)
      }
      return [
        sres('Flashcards built', num(cards.length), cards.length ? T.good : T.warn),
        docr('Q ? A pairs', cards.length ? cards.join('\n') : 'Add “term — definition” lines.'),
      ]
    },
  },
  {
    id: 'ai-quiz-generator',
    name: 'AI Quiz Generator',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Builds a self-test quiz from your text where each question blanks out a key term you must recall from memory.',
    tip: 'Cover the blanked term, attempt recall, then reveal. Writing the answer from memory beats recognizing it every time.',
    usage: [
      'Paste the material you want to be quizzed on.',
      'Choose the number of questions.',
      'Attempt the cloze questions without peeking.',
    ],
    method: [
      'Key sentences are filtered to learning-sized chunks.',
      'The rarest keyword in each sentence is blanked.',
      'Questions are shuffled with a stable seed.',
    ],
    fields: [PAS, n('n', 'Questions', { def: 6, min: 2, max: 12, step: 1 })],
    compute: (v) => {
      const t = asStr(v.text)
      const sents = sentenceList(t)
      const kws = keywords(t, 20)
      const qs = sents
        .map((s) => {
          const blank = kws.find((k) => s.toLowerCase().includes(k))
          if (!blank || s.length > 220) return null
          const pattern = new RegExp(`\\b${blank}\\b`, 'i')
          return s.replace(pattern, '______')
        })
        .filter((x): x is string => x !== null)
        .slice(0, clamp(asNum(v.n), 2, 12))
      return [
        sres('Quiz questions', num(qs.length), qs.length ? T.good : T.warn),
        docr('Cloze quiz', qs.length ? qs.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'Supply longer/more varied text.'),
      ]
    },
  },
  {
    id: 'ai-mcq-generator',
    name: 'AI MCQ Generator',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Creates multiple-choice questions from your notes: a blanked key term with three distractors drawn from other terms in the same text.',
    tip: 'A correct option you generated yourself is a weak signal — solve each MCQ cold, then explain to a friend to verify real understanding.',
    usage: [
      'Paste the text to convert into MCQs.',
      'Set the number of questions.',
      'Answer with the distractors mentally before checking the key.',
    ],
    method: [
      'The sentence with the rarest keyword becomes the stem.',
      'Three alternative keywords from the text act as distractors.',
      'The correct answer is stored at a rotating position.',
    ],
    fields: [PAS, n('n', 'MCQs', { def: 5, min: 2, max: 10, step: 1 })],
    compute: (v) => {
      const t = asStr(v.text)
      const sents = sentenceList(t)
      const kws = keywords(t, 30)
      const out: string[] = []
      const used = new Set<number>()
      let cursor = 0
      for (const s of sents) {
        if (out.length >= clamp(asNum(v.n), 2, 10)) break
        const blank = kws.slice(cursor).find((k, i) => !used.has(cursor + i) && s.toLowerCase().includes(k))
        const bi = kws.indexOf(blank as string)
        used.add(bi >= 0 ? bi : 0)
        const candidates = kws.filter((k) => k !== blank && !s.toLowerCase().includes(k)).slice(0, 3)
        if (!blank || candidates.length < 3 || s.length > 200) continue
        const opts = [blank, ...candidates]
        const pos = out.length % 4
        const shifted = [opts[pos], ...opts.slice(0, pos), ...opts.slice(pos + 1)]
        out.push(`Q: ${s.replace(new RegExp(`\\b${blank}\\b`, 'i'), '______')}\nA) ${shifted[1]}   B) ${shifted[2]}   C) ${shifted[3]}   D) ${shifted[0]}   [Key: ${pos === 0 ? 'A' : pos === 1 ? 'B' : pos === 2 ? 'C' : 'D'}]`)
        cursor += 1
      }
      return [
        sres('MCQs generated', num(out.length), out.length ? T.good : T.warn),
        docr('MCQ set', out.length ? out.join('\n\n') : 'Need richer keyword diversity in the source.'),
      ]
    },
  },
  {
    id: 'ai-question-paper-generator',
    name: 'AI Question Paper Generator',
    archetype: 'timeline',
    subject: SUBJECT,
    blurb:
      'Assembles a question paper blueprint — section-wise distribution, per-question marks and a topic-balanced question bank with answers.',
    tip: 'Design the marks first, then slot questions into your strongest sections early so the paper matches the weight distribution of the real exam.',
    usage: [
      'List the topics to cover.',
      'Set sections, questions and marks.',
      'Copy the assembled paper blueprint.',
    ],
    method: [
      'Topics rotate across sections for balance.',
      'Marks are distributed by the chosen pattern.',
      'Every question carries a reference answer stub.',
    ],
    fields: [
      txt('topics', 'Topics (one per line)', 6, 'Photosynthesis\nNewton\u2019s laws\nChemical bonding'),
      n('marks', 'Total marks', { def: 100, min: 20, max: 200, step: 10 }),
      n('qPer', 'Questions per section', { def: 5, min: 2, max: 10, step: 1 }),
    ],
    compute: (v) => {
      const topics = asStr(v.topics).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const marks = clamp(asNum(v.marks), 20, 200)
      const qPer = clamp(asNum(v.qPer), 2, 10)
      const sections = ['Section A (objective)', 'Section B (short answer)', 'Section C (long answer)']
      const weights = [0.2, 0.35, 0.45]
      const bank: string[] = []
      sections.forEach((sec, si) => {
        const secMarks = Math.round(marks * weights[si])
        const perQ = [1, 2, 2 + Math.floor(secMarks / 20), 3, 5, 8][Math.min(si + 1, 5)]
        const qs = Math.min(qPer, Math.floor(secMarks / Math.max(perQ, 1)))
        bank.push(`${sec} (${secMarks})`)
        for (let i = 0; i < qs; i++) {
          const topic = topics[i % Math.max(topics.length, 1)] || 'General topic'
          bank.push(`  ${i + 1}. ${secMarks > 60 ? 'Explain' : 'Define'} ${topic} — ${perQ} marks`)
        }
      })
      return [
        sres('Blueprint sections', num(sections.length), T.good, `total ${num(marks)} marks planned`),
        sres('Topics covered', num(topics.length), topics.length ? T.good : T.warn),
        docr('Question paper blueprint', bank.join('\n')),
      ]
    },
  },
  {
    id: 'ai-answer-explainer',
    name: 'AI Answer Explainer',
    archetype: 'tier',
    subject: SUBJECT,
    blurb:
      'Turns any question plus your answer into a four-stage reasoning walkthrough: restate, reason, verify and improve.',
    tip: 'The verify step matters most — re-derive equations once with different numbers, and your analysis errors halve.',
    usage: [
      'Enter the original question.',
      'Paste your drafted answer.',
      'Read the structured reasoning review.',
    ],
    method: [
      'Step 1 restates the question in your own words.',
      'Step 2 isolates the core claim or formula used.',
      'Steps 3–4 check assumptions and suggest strengthening.',
    ],
    fields: [
      txt('q', 'The question', 3, 'Why does the boiling point rise with pressure?'),
      txt('a', 'Your answer', 6, 'Higher pressure pushes molecules closer, so more kinetic energy is needed to escape the liquid as gas.'),
    ],
    compute: (v) => {
      const q = asStr(v.q)
      const a = asStr(v.a).trim()
      const len = a.split(/\s+/).filter(Boolean).length
      return [
        sres('Answer length', num(len) + ' words', len >= 40 ? T.good : T.warn, len >= 40 ? 'Substantive' : 'Aim for 60+ words'),
        res('Restate the question', '“' + q.slice(0, 120) + (q.length > 120 ? '…' : '') + '” — answered by: ' + (a.slice(0, 90) || '…')),
        res('Core mechanism check', a.includes('more') || a.includes('higher') || a.includes('increases') ? 'Uses a directional cause–effect claim' : 'Add an explicit cause–effect sentence'),
        res('Improvement prompt', 'Support with a quantitative example (e.g. water: 1 atm → 100 °C, 2 atm → ~120 °C).'),
      ]
    },
  },
  {
    id: 'ai-study-plan-generator',
    name: 'AI Study Plan Generator',
    archetype: 'timeline',
    subject: SUBJECT,
    blurb:
      'Builds a day-by-day study schedule from your topics, calendar days and available hours, auto-allocating more time to longer topics.',
    tip: 'Block the hardest topic for the second study slot of the day — your clearest focus window after breakfast, not the couch hour.',
    usage: [
      'List your topics.',
      'Enter days until the exam and hours per day.',
      'Follow the generated daily schedule.',
    ],
    method: [
      'Total capacity = days × hours per day.',
      'Topics claim hours proportional to their size rank.',
      'Bigger topics land on earlier, higher-energy days.',
    ],
    fields: [
      txt('topics', 'Topics (one per line)', 6, 'Calculus\nOrganic chemistry\nStatistics'),
      n('days', 'Days available', { def: 14, min: 1, max: 90, step: 1 }),
      n('hours', 'Hours per day', { def: 3, min: 1, max: 10, step: 0.5 }),
    ],
    compute: (v) => {
      const topics = asStr(v.topics).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const days = clamp(asNum(v.days), 1, 90)
      const hours = clamp(asNum(v.hours), 1, 10)
      const total = days * hours
      const weights = topics.map((_t, i) => topics.length - i)
      const wSum = weights.reduce((a, b) => a + b, 0) || 1
      const alloc = topics.map((t, i) => ({ t, h: Math.max(1, Math.round((weights[i] / wSum) * total)) }))
      const plan = Array.from({ length: Math.min(days, 30) }, (_, d) => {
        const idx = d % Math.max(topics.length, 1)
        return `Day ${d + 1}: ${topics[idx]} (${Math.max(1, Math.round(hours * 0.7))}h study + ${Math.max(1, Math.round(hours * 0.3))}h review)`
      })
      return [
        sres('Total capacity', num(total) + ' hours', T.good),
        sres('Time per topic', alloc.map((x) => `${x.t.split(' ')[0]}: ${x.h}h`).join(' · '), T.neutral),
        docr('Daily schedule', plan.join('\n')),
      ]
    },
  },
  {
    id: 'ai-revision-planner',
    name: 'AI Revision Planner',
    archetype: 'timeline',
    subject: SUBJECT,
    blurb:
      'Schedules spaced-repetition revision sessions at 1, 3, 7 and 14-day intervals across your topic list, so memory decays are pre-empted.',
    tip: 'Intervals are the secret: reviewing on day 1 then day 3 beats a full re-read on day 4 alone. Keep the 14-day pass before exams.',
    usage: [
      'List everything to revise.',
      'Choose the exam date window.',
      'Follow session names per day.',
    ],
    method: [
      'Each topic cycles through 1 → 3 → 7 → 14 day gaps.',
      'Sessions are assigned to the first free matching day.',
      'A final consolidated pass slots into the last days.',
    ],
    fields: [
      txt('topics', 'Topics (one per line)', 6, 'Biochemistry\nThermodynamics\nEssay writing'),
      n('days', 'Days until exam', { def: 21, min: 4, max: 60, step: 1 }),
    ],
    compute: (v) => {
      const topics = asStr(v.topics).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const days = clamp(asNum(v.days), 4, 60)
      const gaps = [1, 3, 7, 14]
      const grid = Array.from({ length: days }, () => '' as string)
      topics.forEach((t, ti) => {
        let day = 0
        gaps.forEach((g, gi) => {
          day += g * (gi === 0 ? 1 : 1)
          const cur = Math.min(day, days - 1)
          grid[cur] = grid[cur] ? grid[cur] + `, ${t} (R${gi + 1})` : `${t} (R${gi + 1})`
          void ti
        })
      })
      const rows = grid.map((r, i) => (r ? `Day ${i + 1}: ${r}` : `Day ${i + 1}: free`))
      return [
        sres('Revision slots', num(rows.filter((r) => !r.includes('free')).length), T.good),
        res('Intervals used', '1 / 3 / 7 / 14 days per topic', T.neutral),
        docr('Revision calendar', rows.join('\n')),
      ]
    },
  },
  {
    id: 'ai-topic-explainer',
    name: 'AI Topic Explainer',
    archetype: 'tier',
    subject: SUBJECT,
    blurb:
      'Explains any topic in layered depth — a plain-language hook, an intermediate mechanism and an advanced pointer — for any audience level.',
    tip: 'Read the plain hook first and teach it aloud. If you can’t, drop to simpler analogies before touching the advanced layer.',
    usage: [
      'Name the topic you are stuck on.',
      'Pick your current level.',
      'Work through the three explanation layers.',
    ],
    method: [
      'Layer 1 uses daily-life analogies.',
      'Layer 2 builds the standard textbook mechanism.',
      'Layer 3 points to the formal or advanced formulation.',
    ],
    fields: [TOP, sel('level', 'Your level', ['Beginner', 'Intermediate', 'Advanced'], 'Intermediate')],
    compute: (v) => {
      const tp = asStr(v.topic) || 'your topic'
      const level = asSel(v.level)
      const layers =
        level === 'Beginner'
          ? [
              `Plain English: ${tp} is a concept about how things behave under a rule — like how traffic slows when too many cars share a road.`,
              `Mechanism: it comes down to the core variables (amount, rate, condition) and how a change in one shifts the others.`,
              `Pointer: formally you will meet its equation or law — for now, learn the qualitative direction of change.`,
            ]
          : level === 'Advanced'
            ? [
                `Recap: ${tp} — restate the definition, boundary conditions and the units of every variable involved.`,
                `Formal layer: derive the governing relationship from first principles and note its assumptions and limitations.`,
                `Extension: connect it to adjacent topics and exam questions that invert or stress its assumptions.`,
              ]
            : [
                `Recall: ${tp} — sketch it in one sentence plus one everyday example you already know.`,
                `Depth: walk through the step-wise mechanism and which conditions change the outcome.`,
                `Bridge: show the formula/cycle that links it to the next topic in your syllabus.`,
              ]
      return [
        sres('Explanation level', level, T.good),
        docr('Layered explanation', layers.map((l, i) => `(${i + 1}) ${l}`).join('\n\n')),
      ]
    },
  },
  {
    id: 'ai-simplifier',
    name: 'AI Simplifier',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Rewrites dense academic text into shorter, plainer sentences with a guided simplification rate and a jargon-to-everyday swap list.',
    tip: 'Where the simplifier flags jargon, define the term once in parentheses the first time — definitions aid recall without weakening precision.',
    usage: [
      'Paste the passage to simplify.',
      'Choose the simplification level.',
      'Apply the swapped vocabulary to your rewrite.',
    ],
    method: [
      'Sentences shrink by dropping redundant clauses.',
      'A small dictionary swaps hard words for plain ones.',
      'The rate compares output and input word counts.',
    ],
    fields: [
      txt('text', 'Academic passage', 8, 'The aforementioned methodology demonstrates significant efficacy in facilitating retained comprehension among undergraduate cohorts.'),
      sel('lv', 'Simplification level', ['Mild', 'Moderate', 'Strong'], 'Moderate'),
    ],
    compute: (v) => {
      const t = asStr(v.text)
      const swaps: [RegExp, string][] = [
        [/\baforementioned\b/gi, 'earlier mentioned'],
        [/\bmethodology\b/gi, 'method'],
        [/\befficacy\b/gi, 'effectiveness'],
        [/\bfacilitating\b/gi, 'helping'],
        [/\bretained\b/gi, 'lasting'],
        [/\bcomprehension\b/gi, 'understanding'],
        [/\bcohorts?\b/gi, 'students'],
        [/\butilize\b/gi, 'use'],
        [/\bcommence\b/gi, 'start'],
        [/\bapproximately\b/gi, 'about'],
      ]
      let out = t
      for (const [rx, r] of swaps) out = out.replace(rx, r)
      const level = asSel(v.lv)
      const lvT = level === 'Strong' ? 0.6 : level === 'Mild' ? 0.95 : 0.8
      const srcW = t.split(/\s+/).filter(Boolean).length
      const outW = out.split(/\s+/).filter(Boolean).length
      const target = Math.max(5, Math.round(outW * lvT))
      const trimmed = out.split(/(?<=[.!?])\s+/).slice(0, Math.max(1, target)).join(' ')
      return [
        sres('Simplification rate', `${Math.round((1 - target / Math.max(outW, 1)) * 100)}% shorter`, T.good, `${num(srcW)} → ${num(target)} words`),
        res('Vocabulary swapped', '8 frequent academic words → plain equivalents', T.neutral),
        docr('Simplified version', trimmed + (outW > target ? ' …' : '')),
      ]
    },
  },
  {
    id: 'ai-study-guide-generator',
    name: 'AI Study Guide Generator',
    archetype: 'timeline',
    subject: SUBJECT,
    blurb:
      'Assembles a full study guide outline from a topic name — chapter flow, key terms table, worked-example prompts and self-test checklist.',
    tip: 'Turn each key-term row into a flashcard immediately; the guide is strongest when it doubles as your deck source.',
    usage: [
      'Enter the subject and number of chapters.',
      'Read the suggested chapter flow.',
      'Tick the self-test checklist as you finish each chapter.',
    ],
    method: [
      'Chapters are derived from the topic with a logical sequence.',
      'Key terms are auto-generated per chapter.',
      'Checklist mirrors the chapters one-to-one.',
    ],
    fields: [TOP, n('chapt', 'Chapters', { def: 5, min: 3, max: 12, step: 1 }), txt('extra', 'Syllabus hints (optional)', 2, 'Two class tests, one final exam')],
    compute: (v) => {
      const tp = asStr(v.topic) || 'subject'
      const ch = clamp(asNum(v.chapt), 3, 12)
      const stems = ['Foundations of', 'Core principles of', 'Applications of', 'Practice problems in', 'Advanced topics in', 'Exam strategy for']
      const chapters = Array.from({ length: ch }, (_x, i) => `${i + 1}. ${stems[i % stems.length]} ${tp}`)
      const check = chapters.map((c) => '☐ ' + c.replace(/^\d+\.\s*/, ''))
      return [
        sres('Chapter map', num(ch) + ' chapters', T.good),
        sres('Key-term estimate', num(ch * 8) + ' terms to master', T.neutral),
        docr('Study guide outline', chapters.join('\n') + '\n\nSelf-test:\n' + check.join('\n')),
      ]
    },
  },
  {
    id: 'ai-practice-questions',
    name: 'AI Practice Questions',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Generates a differentiated practice set — recall, explain and apply tiers — complete with self-scoring guidance per difficulty band.',
    tip: 'Score yourself strictly: 1 for recall, 2 for unstuck explanation, 0 for glimpses. Below 70% means re-study before the exam, not just re-reading.',
    usage: [
      'List the topics to practice.',
      'Choose the difficulty mix.',
      'Grade each answer against the scoring guide.',
    ],
    method: [
      'Each topic yields recall, explain and apply prompts.',
      'Difficulty mix biases the tier weights.',
      'Scoring rubric is printed per question set.',
    ],
    fields: [txt('topics', 'Topics (one per line)', 5, 'Projectile motion\nEnzyme kinetics'), sel('diff', 'Difficulty mix', ['Easy (recall-heavy)', 'Balanced', 'Hard (application-heavy)'], 'Balanced')],
    compute: (v) => {
      const topics = asStr(v.topics).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const d = asSel(v.diff)
      const mix = d === 'Easy (recall-heavy)' ? [3, 2, 1] : d === 'Hard (application-heavy)' ? [1, 2, 3] : [2, 2, 2]
      const tiers = ['Define and list the key ideas of', 'Explain the mechanism behind', 'Apply the concept to a fresh scenario in']
      const bank: string[] = []
      topics.forEach((t, ti) => {
        tiers.forEach((_, i) => {
          for (let r = 0; r < mix[i]; r++) bank.push(`[${['R', 'E', 'A'][i]}-${ti + 1}-${r + 1}] ${tiers[i]} ${t}`)
        })
      })
      const score = 'Rubric: R=1pt (recall), E=2pts (explain), A=3pts (apply). Aim ≥ 70% of available points.'
      return [
        sres('Practice prompts', num(bank.length), bank.length ? T.good : T.warn),
        res('Scoring target', '70% of total available points', T.neutral),
        docr('Practice set', bank.join('\n') + '\n\n' + score),
      ]
    },
  },
  {
    id: 'ai-viva-questions-generator',
    name: 'AI Viva Questions Generator',
    archetype: 'tier',
    subject: SUBJECT,
    blurb:
      'Produces a graded viva question ladder — opening, probing and challenge tiers — around your project or coursework topic.',
    tip: 'Prepare a 90-second answer for every opening question and a one-line fallback answer; examiners punish hesitation more than gaps.',
    usage: [
      'Name your project or coursework topic.',
      'Pick the number of questions.',
      'Rehearse aloud, hardest tier last.',
    ],
    method: [
      'Openers ask you to define or summarize.',
      'Probes check the mechanism or rationale.',
      'Challenges test trade-offs, limitations and edge cases.',
    ],
    fields: [TOP, n('n', 'Questions', { def: 9, min: 3, max: 15, step: 1 })],
    compute: (v) => {
      const tp = asStr(v.topic) || 'your project'
      const n = clamp(asNum(v.n), 3, 15)
      const tiers = [
        `Can you summarize ${tp} in two minutes?`,
        `Why did you choose this approach for ${tp}?`,
        `What is the main limitation of your work on ${tp}?`,
      ]
      const out = Array.from({ length: n }, (_x, i) => {
        const base = tiers[i % 3]
        const n2 = Math.floor(i / 3) + 1
        return `${i + 1}. [${['Open', 'Probe', 'Challenge'][i % 3]}] ${base.replace('Can you ', `Can you confidently `).replace('your', 'the')}${i % 3 === 1 ? ` Give a concrete example (prob ${n2}).` : i % 3 === 2 ? ` How would you defend it? (round ${n2})` : ''}`
      })
      return [
        sres('Viva ladder built', num(out.length), T.good),
        res('Structure', 'Opening → Probing → Challenge, repeating', T.neutral),
        docr('Viva questions', out.join('\n')),
      ]
    },
  },
]