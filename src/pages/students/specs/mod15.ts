import { n, sel, txt, ck, dt, res, T, asNum, asSel, asStr, asBoolList, clamp, num, ratio } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Thesis & Final Year Project'

const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'for', 'with', 'on', 'at', 'as', 'is', 'are', 'was', 'were', 'be', 'by', 'from', 'that', 'this', 'it', 'its', 'their', 'there', 'we', 'our', 'they', 'not', 'but', 'which', 'have', 'has', 'had', 'can', 'will', 'would', 'could', 'should', 'these', 'those', 'such', 'than', 'then', 'also', 'more', 'most', 'other', 'some', 'any', 'all', 'into', 'about', 'been', 'were', 'than', 'when', 'where', 'how', 'why'])

function linesOf(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim().length > 0)
}

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').match(/[aeiouy]{1,2}/g)
  return Math.max(1, groups ? groups.length : 1)
}

function flesch(text: string): { score: number; grade: string } {
  const s = sentences(text)
  const w = text.split(/\s+/).filter(Boolean)
  if (s.length < 1 || w.length < 10) return { score: 0, grade: 'not enough text' }
  const syl = w.reduce((s2, x) => s2 + countSyllables(x), 0)
  const score = 206.835 - 1.015 * (w.length / s.length) - 84.6 * (syl / w.length)
  const r = Math.round(score)
  const grade = r >= 90 ? 'very easy (grade 5)' : r >= 80 ? 'easy (grade 6)' : r >= 70 ? 'fairly easy (grade 8)' : r >= 60 ? 'plain English (grade 10)' : r >= 50 ? 'fairly difficult (grade 12)' : r >= 30 ? 'difficult (undergrad)' : 'very difficult (postgrad)'
  return { score: r, grade }
}

export const mod15: StudentSpec[] = [
  {
    id: 'thesis-topic-narrower-fyp',
    name: 'Thesis Topic Narrower',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Shrinks a broad thesis idea into a specific, researchable question with defined scope boundaries.',
    tip: 'A thesis topic is finished when you can say what would count as an answer. If everything counts as an answer, you have a topic, not a question.',
    usage: ['Describe your broad idea.', 'Set your discipline and constraints.', 'Read the scoped questions.'],
    method: ['Your idea is decomposed into dimensions.', 'Feasibility is scored per dimension.', 'A narrowed question set is produced.'],
    fields: [sel('disc', 'Discipline', ['Engineering', 'Computer science', 'Business & management', 'Social sciences', 'Health sciences', 'Humanities', 'Education', 'Environmental science'], 'Computer science'), txt('idea', 'Your broad idea', 4, 'machine learning for education'), ck('scope', 'Practical constraints', ['Single institution or site', 'One country or region', 'One discipline or department', 'Limited to 6 months of data', 'Limited budget', 'Ethics approval is difficult', 'No lab or hardware available']), n('months', 'Time available (months)', { def: 6, min: 2, max: 36, step: 1 })],
    compute: (v) => {
      const idea = asStr(v.idea).trim()
      if (!idea) return [sres('Topic', 'Describe your broad idea first', T.warn)]
      const cons = asBoolList(v.scope).map(Boolean)
      const NAMES = ['Single site', 'One region', 'One discipline', '6-month data window', 'Tight budget', 'Ethics is hard', 'No hardware']
      const active = NAMES.filter((_, i) => cons[i])
      const months = Math.max(2, asNum(v.months))
      const disc = asSel(v.disc)
      const dimBank: Record<string, { dims: string[]; units: string; measures: string[] }> = {
        'Computer science': { dims: ['task type', 'user population', 'data modality', 'deployment setting', 'model family'], units: 'participants / requests', measures: ['accuracy', 'latency', 'adoption rate', 'error rate'] },
        Engineering: { dims: ['load regime', 'material', 'operating temperature', 'geometry', 'manufacturing process'], units: 'specimens', measures: ['stress at failure', 'fatigue life', 'tolerance', 'energy loss'] },
        'Business & management': { dims: ['industry sector', 'firm size', 'firm age', 'ownership', 'region'], units: 'organisations', measures: ['revenue growth', 'employee turnover', 'market share', 'productivity'] },
        'Social sciences': { dims: ['age group', 'socioeconomic status', 'urban / rural', 'household type', 'cohort year'], units: 'respondents', measures: ['response rate', 'attitudinal score', 'participation rate'] },
        'Health sciences': { dims: ['condition', 'severity stage', 'age band', 'treatment setting', 'comorbidity'], units: 'patients / records', measures: ['readmission rate', 'mortality', 'length of stay', 'symom score'] },
        Humanities: { dims: ['period', 'genre', 'region', 'authorial context', 'translation tradition'], units: 'texts', measures: ['thematic density', 'interpretive ambiguity', 'citation reach'] },
        Education: { dims: ['institution type', 'subject', 'year group', 'class size', 'curriculum framework'], units: 'students / classes', measures: ['attainment gain', 'engagement', 'attendance', 'retention'] },
        'Environmental science': { dims: ['ecosystem type', 'season', 'land use', 'pollutant', 'spatial scale'], units: 'sampling sites', measures: ['concentration', 'species richness', 'load per hectare', 'recovery rate'] },
      }
      const bank = dimBank[disc] || dimBank['Computer science']
      const core = words(idea).slice(0, 4).join(' ')
      const questions = bank.dims.slice(0, 4).map((d, i) => {
        const measure = bank.measures[i % bank.measures.length]
        return `In ${core}, restricted to [${active[0] || 'a defined setting'}], does ${d} significantly predict ${measure}?`
      })
      const scopeNotes = [
        `Unit of analysis: ${bank.units}`,
        `In scope: ${active.length ? active.join(', ').toLowerCase() : 'define this explicitly or a reviewer will challenge it'}`,
        `Out of scope: everything else — write this down, it becomes your limitations section`,
        `Sample size needed: for a ${disc.toLowerCase()} study aiming to detect a moderate effect, budget ${num(Math.max(30, Math.round(months * 12)), 0)} usable observations per condition`,
      ]
      const feasibility = clamp(100 - active.length * 9 - (months < 4 ? 18 : months < 6 ? 8 : 0), 15, 100)
      return [
        sres('Narrowed question', questions[0], feasibility > 60 ? T.good : T.warn, `from the broad idea "${idea}"`, feasibility),
        sres('Feasibility', `${num(Math.round(feasibility), 0)}%`, feasibility > 70 ? T.good : feasibility > 50 ? T.warn : T.bad, active.length ? `${num(active.length, 0)} constraint(s) applied` : 'no constraints applied — check this is realistic', feasibility),
        docr('Candidate research questions', questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')),
        docr('Scope statement', scopeNotes.map((n2) => `• ${n2}`).join('\n')),
        res('Pick one', 'a thesis needs exactly one primary question — the others become future work or a second chapter that dilutes the argument', T.warn),
        res('Test it', 'ask your supervisor: "if the answer is no, was it still worth knowing?" A question whose null result is publishable is a good question.', T.neutral),
        res('Time check', months < 4 ? `${num(months, 0)} months is very tight for primary data — consider secondary data or a methodology chapter instead` : `${num(months, 0)} months is workable if recruitment starts in month one`, months < 4 ? T.bad : T.neutral),
      ]
    },
  },
  {
    id: 'research-methodology-picker-fyp',
    name: 'Research Methodology Picker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Chooses and justifies a research methodology from your question, data access and constraints.',
    tip: 'The methodology follows the question. Choosing "a survey" first and then inventing a question it can answer is how projects end up proving nothing.',
    usage: ['Describe your research question.', 'Set what you can access.', 'Read the recommended method.'],
    method: ['The question type is identified.', 'Data access and constraints filter methods.', 'A justification paragraph is produced.'],
    fields: [txt('q', 'Your research question', 3, 'Does peer review reduce code defects in student projects?'), sel('access', 'Data you can access', ['Primary data I collect myself', 'Existing institutional records', 'Public dataset', 'Published literature only', 'I can run experiments'], 'Existing institutional records'), sel('phase', 'Stage of the project', ['Proposal / literature review', 'Data collection', 'Analysis', 'Writing up'], 'Proposal / literature review'), n('weeks', 'Weeks until submission', { def: 12, min: 1, max: 52, step: 1 })],
    compute: (v) => {
      const q = asStr(v.q).trim()
      if (!q) return [sres('Methodology', 'Enter your research question first', T.warn)]
      const ql = q.toLowerCase()
      const access = asSel(v.access)
      const weeks = Math.max(1, asNum(v.weeks))
      const causal = /does|cause|effect|impact|influence|lead to|result in|reduce|increase/.test(ql)
      const normative = /should|ought|policy|best practice|evaluate/.test(ql)
      const METHODS = [
        { name: 'Randomised controlled experiment', q: 'causal', access: ['I can run experiments'], effort: 70, weeks: 20, pros: 'strongest causal evidence available', cons: 'needs recruitment, ethics approval and a clean intervention', text: 'Randomly assign participants to the intervention and control groups, measure the outcome identically in both, and test for a statistically significant difference.' },
        { name: 'Quasi-experimental / difference-in-differences', q: 'causal', access: ['Existing institutional records', 'Public dataset'], effort: 55, weeks: 14, pros: 'causal-ish inference from data that already exists', cons: 'depends on the parallel-trends assumption holding', text: 'Compare the change in an exposed group against the change in a matched unexposed group, before and after the intervention point.' },
        { name: 'Structured survey with validated scale', q: 'descriptive', access: ['Primary data I collect myself', 'Public dataset'], effort: 40, weeks: 10, pros: 'scales quickly and compares across groups', cons: 'self-report bias; cannot establish cause', text: 'Administer a validated instrument to a defined sample, report means with confidence intervals, and test for group differences.' },
        { name: 'Systematic literature review with meta-analysis', q: 'descriptive', access: ['Published literature only'], effort: 50, weeks: 16, pros: 'no ethics approval, no recruitment, no data collection risk', cons: 'only as good as the published literature; publication bias is real', text: 'Register a protocol, search four databases, screen against explicit inclusion criteria, and pool effect sizes with a random-effects model.' },
        { name: 'Case study (single or multiple)', q: 'descriptive', access: ['Existing institutional records', 'Primary data I collect myself'], effort: 35, weeks: 8, pros: 'deep understanding of context; no generalisation required', cons: 'hard to claim anything beyond the case', text: 'Select cases by theoretical sampling, collect data from multiple sources, and triangulate interviews with documents and observation.' },
        { name: 'Ethnography / observation', q: 'descriptive', access: ['Primary data I collect myself'], effort: 65, weeks: 20, pros: 'explains behaviour that surveys cannot reach', cons: 'months of access required; reflexivity is your problem', text: 'Gain sustained access to the setting, observe and participate, then write thick description and interpret it through a theoretical lens.' },
        { name: 'Thematic / content analysis', q: 'descriptive', access: ['Primary data I collect myself', 'Published literature only', 'Public dataset'], effort: 30, weeks: 8, pros: 'works on any qualitative data including existing text', cons: 'fully dependent on coding quality and intercoder agreement', text: 'Code the data iteratively, group codes into themes, check reliability with a second coder, and quote verbatim evidence for each theme.' },
        { name: 'Policy / document analysis', q: 'normative', access: ['Existing institutional records', 'Published literature only', 'Public dataset'], effort: 25, weeks: 6, pros: 'fast, no fieldwork, no recruitment', cons: 'says what is written, not what happens', text: 'Define a comparison framework, code every document against it, and report the gaps between stated policy and practice where evidence exists.' },
        { name: 'Design science / artefact build', q: 'causal', access: ['I can run experiments'], effort: 60, weeks: 22, pros: 'produces something usable as well as something publishable', cons: 'evaluation design is the hard part', text: 'Build the artefact against design requirements, then evaluate it against the same requirements with a user study or benchmark.' },
      ]
      const want = causal ? 'causal' : normative ? 'normative' : 'descriptive'
      const scored = METHODS.map((m) => {
        let s = 0
        if (m.q === want) s += 4
        if (m.access.includes(access)) s += 4
        const needWeeks = m.weeks
        if (needWeeks <= weeks) s += 3
        else s -= (needWeeks - weeks) * 0.6
        if (m.effort < 50) s += 1
        return { m, s }
      }).sort((a, b) => b.s - a.s)
      const best = scored[0]
      const alt = scored[1]
      const tight = best.m.weeks > weeks
      const justification = `Because the question is ${want === 'causal' ? 'causal' : want === 'normative' ? 'evaluative' : 'descriptive'} and ${access.toLowerCase()} is what is available, ${best.m.name.toLowerCase()} is the appropriate design. It ${best.m.pros}, and the main cost is that it ${best.m.cons}. ${tight ? `However, the typical duration for this design is around ${num(best.m.weeks, 0)} weeks and you have ${num(weeks, 0)} — either narrow the question or the scope of data collection.` : `A typical timeline is around ${num(best.m.weeks, 0)} weeks, which fits your ${num(weeks, 0)}-week window.`}`
      return [
        sres('Recommended method', best.m.name, tight ? T.warn : T.good, `for a ${want} question with ${access.toLowerCase()}`, clamp(50 + best.s * 8, 5, 100)),
        sres('Typical duration', `${num(best.m.weeks, 0)} weeks`, tight ? T.bad : T.good, `you have ${num(weeks, 0)} weeks`, clamp(100 - (best.m.weeks / Math.max(1, weeks)) * 60, 5, 100)),
        docr('Method detail', `${best.m.name.toUpperCase()}\n\n${best.m.text}\n\nAdvantage: ${best.m.pros}.\nLimitation: ${best.m.cons}.`),
        docr('Justification paragraph', justification),
        res('Alternative', `${alt.m.name} — ${alt.m.pros}`, T.neutral, 'a valid second choice if the first proves impractical'),
        res('Ethics', causal || best.m.name.includes('experiment') || best.m.name.includes('Ethno') ? 'human participants means ethics approval before any data collection — start this in week one, it takes months' : 'check whether your institution requires a notification form even for secondary data', causal ? T.warn : T.neutral),
        res('Sampling', 'state your sampling frame, your inclusion criteria and your expected response rate before you collect anything — sampling decisions made after data collection look like cherry-picking', T.neutral),
      ]
    },
  },
  {
    id: 'literature-review-builder-fyp',
    name: 'Literature Review Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Organises your source notes into themes, identifies the research gap and drafts the review structure.',
    tip: 'A review organised paper-by-paper tells the reader nothing. Organise by theme and the argument emerges; organise by author and you are writing an annotated bibliography.',
    usage: ['Paste your source notes.', 'Set the number of themes.', 'Read the thematic structure.'],
    method: ['Sources are clustered by shared keywords.', 'Clusters are ordered by coverage.', 'A gap statement is generated.'],
    fields: [txt('sources', 'Source notes (one per line: author year | key claim | method | finding)', 10, 'Smith 2021 | Peer review improves defect detection | Controlled experiment | 31% fewer defects\nJones 2019 | Developers skip review under deadline pressure | Survey, n=340 | Review skipped in 62% of cases\nChen 2022 | Automated review tools catch style issues only | Static analysis benchmark | 4% semantic defects caught\nPatel 2020 | Pair review doubles review time | Time study | 2.1x duration'), n('themes', 'Number of themes', { def: 4, min: 2, max: 8, step: 1 })],
    compute: (v) => {
      const rows = linesOf(asStr(v.sources)).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { cite: p[0] || 'Source', claim: p[1] || '', method: p[2] || '', finding: p[3] || '' }
      })
      if (rows.length < 2) return [sres('Review', 'Add at least two source notes', T.warn)]
      const themeCount = clamp(Math.round(asNum(v.themes)) || 4, 2, 8)
      const themes = ['The established consensus', 'Where the evidence is mixed', 'Methodological limitations in the field', 'Recent developments and their limits', 'Measurement and validity problems', 'Under-researched populations', 'Implementation context', 'Cost and feasibility constraints']
      const used = themes.slice(0, themeCount)
      const buckets: Record<string, string[]> = {}
      rows.forEach((r) => {
        const text = `${r.claim} ${r.finding}`.toLowerCase()
        let bestTheme = used[0]
        let bestScore = 0
        used.forEach((t) => {
          const tw = words(t)
          const score = tw.filter((w) => text.includes(w)).length
          if (score > bestScore) { bestScore = score; bestTheme = t }
        })
        ;(buckets[bestTheme] = buckets[bestTheme] || []).push(`${r.cite} — ${r.finding || r.claim} (${r.method || 'method not noted'})`)
      })
      const structure = used.map((t, i) => {
        const items = buckets[t] || []
        return `${i + 1}. ${t}\n   Sources: ${items.length ? items.join('\n   ') : 'none yet — this theme is unsupported'}${items.length < 2 ? '\n   ⚠ single source: a theme with one citation is an anecdote, not a finding' : ''}`
      })
      const thin = used.filter((t) => (buckets[t] || []).length < 2)
      const methods = new Set(rows.map((r) => (r.method || 'unknown').toLowerCase()).filter((m) => m !== 'unknown'))
      const yearSpread = rows.map((r) => parseInt(r.cite.replace(/[^\d]/g, '').slice(0, 4), 10)).filter((y) => y > 1900 && y < 2100)
      const oldest = yearSpread.length ? Math.min(...yearSpread) : 0
      const recent = rows.filter((r) => parseInt(r.cite.replace(/[^\d]/g, '').slice(0, 4), 10) >= new Date().getFullYear() - 5).length
      const gaps: string[] = []
      if (thin.length) gaps.push(`${thin.length} theme(s) rest on a single source: ${thin.join(', ')}`)
      if (methods.size <= 2 && rows.length > 3) gaps.push(`only ${num(methods.size, 0)} distinct method(s) in ${num(rows.length, 0)} sources — the field may be methodologically thin, or you may be reading one kind of paper`)
      if (recent === 0) gaps.push('no source from the last five years — your review is out of date')
      if (oldest && new Date().getFullYear() - oldest > 15) gaps.push(`oldest source is from ${oldest} — check whether the context still holds`)
      if (rows.length < 8) gaps.push(`only ${num(rows.length, 0)} sources — most reviews need 20+ to be credible`)
      if (methods.size >= 4) gaps.push('methods vary across sources — this is your comparative advantage; organise the review by method, not by topic')
      return [
        sres('Sources organised', num(rows.length, 0), rows.length >= 15 ? T.good : rows.length >= 8 ? T.warn : T.bad, `into ${num(themeCount, 0)} themes`, clamp((rows.length / 25) * 100, 5, 100)),
        sres('Method variety', num(methods.size, 0), methods.size >= 3 ? T.good : T.warn, [...methods].join(', '), clamp((methods.size / 6) * 100, 5, 100)),
        docr('Thematic structure', structure.join('\n\n')),
        docr('Thin themes', thin.length ? thin.map((t) => `${t}: only ${num((buckets[t] || []).length, 0)} source(s) — find another paper or drop the theme`).join('\n') : 'every theme has at least two sources'),
        res('Coverage gaps', gaps.length ? gaps.map((g) => `• ${g}`).join('\n') : 'no obvious coverage gaps', gaps.length ? T.warn : T.good),
        res('The gap statement', `"However, while ${used[0].toLowerCase()} is well established, evidence on ${(thin[0] || used[used.length - 1]).toLowerCase()} remains limited${rows.length < 15 ? ' and is based on a small number of studies' : ''}. This study addresses this by …"`, T.good),
        res('Ordering rule', 'order themes by argument, not by date or by author — a reader should be able to follow your reasoning paragraph by paragraph', T.neutral),
      ]
    },
  },
  {
    id: 'thesis-outline-builder-fyp',
    name: 'Thesis Outline Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a chapter-by-chapter thesis or dissertation outline with word budgets and per-chapter purpose.',
    tip: 'Write chapter three before chapter one. If you cannot describe your method and analysis, your introduction is premature.',
    usage: ['Enter your title and word limit.', 'Set your chapter structure.', 'Read the outline with word budgets.'],
    method: ['Standard chapter templates are applied.', 'Word budgets are split by chapter.', 'Per-chapter purpose statements are generated.'],
    fields: [txt('title', 'Thesis title'), n('words', 'Word limit', { def: 12000, min: 3000, max: 100000, step: 500 }), sel('type', 'Thesis type', ['Research thesis (5 chapters)', 'Research thesis (extended, 7 chapters)', 'Dissertation with empirical chapters', 'Systematic review thesis', 'Professional / applied project report'], 'Research thesis (5 chapters)')],
    compute: (v) => {
      const title = asStr(v.title).trim()
      if (!title) return [sres('Outline', 'Enter your thesis title first', T.warn)]
      const total = Math.max(3000, asNum(v.words))
      const type = asSel(v.type)
      const CH: Record<string, { name: string; share: number; purpose: string; contents: string[] }[]> = {
        'Research thesis (5 chapters)': [
          { name: '1. Introduction', share: 0.12, purpose: 'establish the problem, the gap and your contribution', contents: ['Context and background (what is known)', 'Problem statement (what is broken)', 'Research gap (what is missing)', 'Aim and objectives (what you will do)', 'Research questions (one primary)', 'Scope and limitations', 'Chapter roadmap'] },
          { name: '2. Literature Review', share: 0.2, purpose: 'show what has been done and where it stops', contents: ['Thematic organisation, not author-by-author', 'Critical comparison across studies', 'Theoretical framework used', 'Synthesis leading to your gap'] },
          { name: '3. Methodology', share: 0.18, purpose: 'allow replication — everything here must be reproducible', contents: ['Research design and its justification', 'Population and sampling', 'Inclusion and exclusion criteria', 'Data collection instruments', 'Pilot study and refinement', 'Analysis plan and software', 'Ethics approval reference', 'Reliability and validity measures'] },
          { name: '4. Results / Findings', share: 0.28, purpose: 'present the evidence before you interpret it', contents: ['Participant or sample flow', 'Descriptive statistics and tables', 'Results per research question', 'Figures with captions that state the finding', 'Deviations from the plan, stated openly'] },
          { name: '5. Discussion and Conclusion', share: 0.22, purpose: 'interpret, compare, and state what it means', contents: ['Answer each research question directly', 'Relate findings to the literature', 'What this contradicts or extends', 'Practical and theoretical implications', 'Limitations (not apologies)', 'Future research directions'] },
        ],
        'Research thesis (extended, 7 chapters)': [
          { name: '1. Introduction', share: 0.09, purpose: 'establish the problem, the gap and your contribution', contents: ['Context', 'Problem statement', 'Gap', 'Aim, objectives, questions', 'Scope', 'Roadmap'] },
          { name: '2. Literature Review', share: 0.15, purpose: 'the theoretical and empirical groundwork', contents: ['Thematic review', 'Theoretical framework', 'Conceptual model'] },
          { name: '3. Methodology', share: 0.15, purpose: 'reproducibility', contents: ['Design', 'Sampling', 'Instruments', 'Pilot', 'Analysis plan', 'Ethics'] },
          { name: '4. Results Part 1', share: 0.14, purpose: 'evidence for question one', contents: ['Flow and descriptives', 'RQ1 results', 'Figures and tables'] },
          { name: '5. Results Part 2', share: 0.14, purpose: 'evidence for question two and three', contents: ['RQ2 results', 'RQ3 results', 'Sensitivity analysis'] },
          { name: '6. Discussion', share: 0.2, purpose: 'interpretation against the literature', contents: ['Answer each question', 'Compare with prior studies', 'Implications', 'Limitations'] },
          { name: '7. Conclusion', share: 0.13, purpose: 'the closing argument', contents: ['Summary of findings', 'Contribution stated in one paragraph', 'Recommendations', 'Future work'] },
        ],
        'Dissertation with empirical chapters': [
          { name: '1. Introduction', share: 0.1, purpose: 'problem, gap, contribution', contents: ['Context', 'Problem', 'Gap', 'Questions', 'Contribution statement'] },
          { name: '2. Literature Review', share: 0.16, purpose: 'theoretical grounding', contents: ['Themes', 'Framework', 'Hypotheses derived from the framework'] },
          { name: '3. Methodology', share: 0.16, purpose: 'reproducible design', contents: ['Design and justification', 'Sampling and power', 'Instruments and piloting', 'Analysis plan', 'Ethics'] },
          { name: '4. Study 1', share: 0.16, purpose: 'first empirical chapter', contents: ['Design specifics', 'Results', 'Chapter-level discussion'] },
          { name: '5. Study 2', share: 0.16, purpose: 'second empirical chapter', contents: ['Design specifics', 'Results', 'Chapter-level discussion'] },
          { name: '6. Synthesis and Discussion', share: 0.16, purpose: 'integration across studies', contents: ['Convergence and divergence', 'Integrated discussion', 'Contribution', 'Limitations'] },
          { name: '7. Conclusion', share: 0.1, purpose: 'the closing argument', contents: ['Summary', 'Contribution', 'Recommendations', 'Future work'] },
        ],
        'Systematic review thesis': [
          { name: '1. Introduction', share: 0.1, purpose: 'problem, rationale, objectives', contents: ['Context', 'Why a review is needed', 'Review question in PICO form', 'Objectives'] },
          { name: '2. Literature Review', share: 0.14, purpose: 'what is already reviewed and what is missing', contents: ['Existing reviews', 'Why another review is justified', 'Conceptual framework'] },
          { name: '3. Methodology', share: 0.16, purpose: 'a protocol a reviewer could follow', contents: ['Registration (PROSPERO)', 'Databases and search strings', 'Inclusion and exclusion criteria', 'Screening procedure and kappa', 'Risk-of-bias tool', 'PRISMA flow'] },
          { name: '4. Results', share: 0.24, purpose: 'the evidence base', contents: ['PRISMA flow diagram', 'Study characteristics table', 'Risk-of-bias summary', 'Effect sizes per study', 'Publication bias assessment'] },
          { name: '5. Discussion', share: 0.24, purpose: 'synthesis and meaning', contents: ['Pooled estimate', 'Heterogeneity', 'Comparison with prior reviews', 'Implications', 'Limitations'] },
          { name: '6. Conclusion', share: 0.12, purpose: 'the answer to the review question', contents: ['Summary of findings', 'Confidence in the evidence', 'Recommendations for practice', 'Research agenda'] },
        ],
        'Professional / applied project report': [
          { name: '1. Introduction and Context', share: 0.12, purpose: 'the organisational problem', contents: ['Organisation and context', 'Problem statement', 'Project objectives', 'Benefits and stakeholders'] },
          { name: '2. Literature and Practice Review', share: 0.14, purpose: 'what others have done', contents: ['Best practice from theory', 'Comparable projects', 'Gap in the organisation'] },
          { name: '3. Method and Requirements', share: 0.15, purpose: 'how the artefact will be built and judged', contents: ['Development methodology', 'Requirements (functional and non-functional)', 'Evaluation criteria', 'Project plan and risks'] },
          { name: '4. Implementation', share: 0.24, purpose: 'what you actually built', contents: ['System design and architecture', 'Key implementation decisions', 'Screens, APIs or processes', 'Testing evidence'] },
          { name: '5. Evaluation', share: 0.2, purpose: 'did it meet the criteria?', contents: ['Results against each requirement', 'User testing outcomes', 'Comparison with the literature', 'Limitations'] },
          { name: '6. Conclusion and Recommendations', share: 0.15, purpose: 'what happens next', contents: ['Summary of contribution', 'Business or academic value', 'Recommendations', 'Future work'] },
        ],
      }
      const chapters = CH[type] || CH['Research thesis (5 chapters)']
      const outline = chapters.map((c) => {
        const budget = Math.round((total * c.share) / 100) * 100
        return `${c.name}\n  Budget: ${num(budget, 0)} words (${ratio(c.share * 100, 0)}% of ${num(total, 0)})\n  Purpose: ${c.purpose}\n${c.contents.map((x) => `    - ${x}`).join('\n')}`
      })
      const perWeek = Math.round(total / Math.max(4, chapters.length * 2))
      return [
        sres('Chapters', num(chapters.length, 0), T.good, `${type} · ${num(total, 0)} words`),
        sres('Largest chapter', chapters.reduce((m, c) => (c.share > m.share ? c : m), chapters[0]).name.split('.')[0].trim(), T.neutral, `${ratio(chapters.reduce((m, c) => (c.share > m.share ? c : m), chapters[0]).share * 100, 0)}% of the word count`),
        docr('Outline', outline.join('\n\n')),
        docr('Word budget', chapters.map((c) => `${c.name.split('.')[0].padEnd(3)} ${num(Math.round((total * c.share) / 100) * 100, 0).padStart(7, ' ')} words  ${'█'.repeat(Math.round(c.share * 40))}`).join('\n')),
        res('Draft order', 'write Methodology → Results → Discussion → Literature → Introduction last. The introduction is a summary of an argument you have not made yet if you write it first.', T.warn),
        res('Pace', `about ${num(perWeek, 0)} words per week across the drafting period. If that is more than you have ever written in a week, cut scope now, not in week nine.`, total > 20000 ? T.warn : T.neutral),
        res('Supervisor check', 'get sign-off on the chapter list before you write anything — a restructure after 10,000 words is the most common disaster in a thesis', T.warn),
      ]
    },
  },
  {
    id: 'proposal-writer-fyp',
    name: 'Research Proposal Writer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Drafts a research proposal: problem, gap, aims, methods, timeline, feasibility and risk register.',
    tip: 'Most rejected proposals fail in the feasibility section, not the idea section. A brilliant idea you cannot complete in the time is worth nothing.',
    usage: ['Describe your idea and method.', 'Set the deadline and resources.', 'Read the proposal draft and risk register.'],
    method: ['Proposal sections are templated from your inputs.', 'Timeline is back-calculated from the deadline.', 'Risks are scored by likelihood and impact.'],
    fields: [txt('idea', 'Your project idea', 3, 'Evaluating whether automated code review tools reduce defects in student capstone projects'), sel('method', 'Methodology', ['Primary data collection', 'Secondary data analysis', 'Systematic review', 'Design and build', 'Mixed methods'], 'Secondary data analysis'), dt('due', 'Submission deadline'), n('weeks', 'Weeks until deadline', { def: 24, min: 2, max: 104, step: 1 }), n('team', 'People on the team', { def: 1, min: 1, step: 1 }), n('budget', 'Budget available', { def: 0, min: 0, step: 100 })],
    compute: (v) => {
      const idea = asStr(v.idea).trim()
      if (!idea) return [sres('Proposal', 'Describe your project idea first', T.warn)]
      const weeks = Math.max(2, asNum(v.weeks))
      const method = asSel(v.method)
      const due = asStr(v.due)
      const team = Math.max(1, asNum(v.team))
      const budget = Math.max(0, asNum(v.budget))
      const phases = [
        { name: 'Literature and scoping', share: 0.2, deliverable: 'Literature review draft and confirmed research question' },
        { name: 'Ethics and access', share: 0.12, deliverable: 'Ethics approval granted, data access agreed in writing' },
        { name: 'Design and instrument', share: 0.13, deliverable: 'Analysis plan, instruments, pilot complete' },
        { name: 'Data collection', share: 0.25, deliverable: 'Complete dataset with quality log' },
        { name: 'Analysis and writing', share: 0.2, deliverable: 'Results chapters drafted' },
        { name: 'Review and submission', share: 0.1, deliverable: 'Final draft, supervisor sign-off, submitted' },
      ]
      const timeline = phases.map((p) => {
        const w = Math.max(1, Math.round(weeks * p.share))
        return `Weeks ${Math.max(1, Math.round(weeks * phases.slice(0, phases.indexOf(p)).reduce((s, x) => s + x.share, 0) * weeks) + 1)}–${Math.max(1, Math.round(weeks * phases.slice(0, phases.indexOf(p) + 1).reduce((s, x) => s + x.share, 0) * weeks))}: ${p.name} (${num(w, 0)} wks) → ${p.deliverable}`
      })
      const riskBank = [
        { r: 'Ethics approval takes longer than planned', l: 3, i: 5, m: 'Submit the application in week one; prepare a secondary data analysis to fall back on' },
        { r: 'Recruitment yields fewer participants than needed', l: 4, i: 4, m: 'Recruit 50% more than your required sample; have a second site lined up' },
        { r: 'Data quality issues discovered during analysis', l: 3, i: 4, m: 'Pilot first; keep a data quality log from day one; pre-register cleaning decisions' },
        { r: 'Supervisor availability is limited', l: 3, i: 3, m: 'Agree fixed fortnightly checkpoints; send a written update before each one' },
        { r: 'Scope creep adds features you do not have time to test', l: 4, i: 3, m: 'Write the exclusion list now; anything not on the plan needs a trade-off, not an addition' },
        { r: 'Software or equipment unavailability', l: 2, i: 4, m: 'Confirm access before writing the proposal; keep a cloud fallback' },
        { r: 'Team member unavailable or drops out', l: 3, i: 4, m: 'Document every decision so the work is transferable; avoid single-owner tasks' },
        { r: 'Analysis takes longer than expected', l: 3, i: 4, m: 'Run a small analysis early on a subset to surface problems while there is still time' },
      ]
      const methodRisk = method === 'Primary data collection' ? 2 : method === 'Mixed methods' ? 2 : method === 'Design and build' ? 1 : 0
      const teamRisk = team === 1 ? 2 : team >= 3 ? 1 : 0
      const budgetRisk = budget === 0 && (method === 'Primary data collection' || method === 'Design and build') ? 2 : 0
      const scored = riskBank.map((r) => ({ ...r, score: (r.l + methodRisk + teamRisk + budgetRisk) * r.i })).sort((a, b) => b.score - a.score)
      const topRisk = scored[0]
      const proposal = [
        `PROJECT PROPOSAL`,
        ``,
        `TITLE: ${idea.charAt(0).toUpperCase() + idea.slice(1)}`,
        `METHODOLOGY: ${method}`,
        `TEAM: ${num(team, 0)} ${team === 1 ? 'member' : 'members'}`,
        `DURATION: ${num(weeks, 0)} weeks${due ? ` (deadline ${due})` : ''}`,
        ``,
        `1. PROBLEM STATEMENT`,
        `    ${idea.charAt(0).toUpperCase() + idea.slice(1)}. The practical consequence of not addressing this is that decisions in this area are made without evidence.`,
        ``,
        `2. RESEARCH GAP`,
        `    Existing work addresses parts of this problem but does not combine [method] with [population/context]. This project addresses that specific gap and is the first to [measurable outcome].`,
        ``,
        `3. AIM AND OBJECTIVES`,
        `    Aim: to determine whether and to what extent ${idea.replace(/^(evaluating|evaluating whether|investigating|assessing)\s+/i, '')}.`,
        `    O1 — establish the current baseline using ${method.toLowerCase()}.`,
        `    O2 — apply the method and collect the primary evidence.`,
        `    O3 — compare the outcome against the baseline and the literature.`,
        `    O4 — state practical recommendations with the limits of the evidence made explicit.`,
        ``,
        `4. METHODOLOGY`,
        `    Design: ${method}. ${method === 'Primary data collection' ? 'Participants will be recruited through [site], consented in writing, and assessed with a validated instrument.' : method === 'Systematic review' ? 'A protocol will be registered before searching; databases, search strings and inclusion criteria will be published.' : method === 'Design and build' ? 'The artefact will be developed iteratively and evaluated against pre-stated requirements.' : 'Existing records will be analysed with a pre-specified statistical plan.'}`,
        `    Timeline: ${num(weeks, 0)} weeks, phased as below.`,
        `    Ethics: ${method === 'Primary data collection' ? 'full ethical review required' : 'notification only, to be confirmed with the institutional ethics office'}.`,
        ``,
        `5. TIMELINE AND DELIVERABLES`,
        ...timeline.map((t) => `    ${t}`),
        ``,
        `6. FEASIBILITY`,
        `    Resources: ${budget > 0 ? `£${num(budget, 0)} available for ${method === 'Design and build' ? 'hosting, tools and testing' : 'participant compensation and travel'}.` : 'no dedicated budget requested; project runs on existing infrastructure.'}`,
        `    Skills: ${method === 'Secondary data analysis' ? 'data cleaning, statistical analysis, academic writing' : method === 'Design and build' ? 'software development, testing, technical documentation' : 'research design, participant recruitment, analysis'}.`,
        `    Supervision: ${num(weeks, 0)} weeks with fortnightly checkpoints.`,
        ``,
        `7. RISK REGISTER`,
        ...scored.slice(0, 5).map((r, i) => `    ${i + 1}. ${r.r}\n       Likelihood ${num(r.l + methodRisk + teamRisk + budgetRisk, 0)}/5 × Impact ${num(r.i, 0)}/5 = ${num(r.score, 0)}\n       Mitigation: ${r.m}`),
        ``,
        `8. EXPECTED CONTRIBUTION`,
        `    A documented answer to the research question, a method others can replicate, and — if the findings hold — a practical change to how this is done.`,
      ].join('\n')
      return [
        sres('Proposal generated', `${num(proposal.split('\n').length, 0)} lines`, T.good, `${num(weeks, 0)} weeks, ${num(team, 0)} team member(s)`, clamp(100 - (methodRisk + teamRisk + budgetRisk) * 12, 20, 100)),
        sres('Top risk', topRisk.r, topRisk.score >= 28 ? T.bad : T.warn, `score ${num(topRisk.score, 0)} (likelihood × impact)`, clamp(100 - topRisk.score * 3, 5, 100)),
        sres('Feasibility pressure', `${num(methodRisk + teamRisk + budgetRisk, 0)} risk factor(s) added`, methodRisk + teamRisk + budgetRisk >= 4 ? T.bad : methodRisk + teamRisk + budgetRisk >= 2 ? T.warn : T.good, [methodRisk ? 'primary data collection' : '', teamRisk ? 'single researcher' : '', budgetRisk ? 'zero budget' : ''].filter(Boolean).join(', ') || 'no elevated risk factors', clamp(100 - (methodRisk + teamRisk + budgetRisk) * 18, 10, 100)),
        docr('Proposal', proposal),
        docr('Risk register', scored.map((r, i) => `${i + 1}. ${r.r} — L${num(r.l + methodRisk + teamRisk + budgetRisk, 0)} × I${num(r.i, 0)} = ${num(r.score, 0)}\n   Mitigation: ${r.m}`).join('\n\n')),
        res('Sequencing', 'ethics and data access sit at 12% of the timeline but are on the critical path — they gate everything after them and they depend on other people', T.warn),
        res('Write this down now', 'fix the exclusion list before you start. A project that grows a second objective halfway through will finish neither.', T.warn),
      ]
    },
  },
  {
    id: 'thesis-defense-prep-fyp',
    name: 'Thesis Defence Prep',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a viva/defence preparation pack: likely examiner questions, your answers, and weak points to fix first.',
    tip: 'You will be asked about the one thing your methodology cannot answer. Find that yourself in advance — an examiner who catches you unaware looks worse than one who finds it already documented.',
    usage: ['Paste your abstract and conclusions.', 'Set the defence length.', 'Read the question bank and your weak points.'],
    method: ['Methodological claims are extracted.', 'Examiner-style questions are generated per section.', 'Your answers are checked against the abstract.'],
    fields: [sel('stage', 'When is the defence?', ['Two weeks away', 'One month away', 'Three months away', 'Over a term away'], 'One month away'), txt('abstract', 'Paste your abstract and key conclusions', 8, 'This study examined whether automated code review tools reduce defect density in student capstone projects, using a retrospective analysis of 214 project submissions over three cohorts. Defect density fell 18% in projects using static analysis, with no significant effect for style-only linters. The findings suggest tools catch a narrow class of defects and must be paired with peer review.'), sel('level', 'Study level', ['Undergraduate', 'Masters', 'Doctoral'], 'Masters')],
    compute: (v) => {
      const abs = asStr(v.abstract)
      if (abs.trim().length < 40) return [sres('Defence prep', 'Paste your abstract and conclusions first', T.warn)]
      const stage = asSel(v.stage)
      const level = asSel(v.level)
      const weeks = stage.includes('Two weeks') ? 2 : stage.includes('One month') ? 4 : stage.includes('Three months') ? 12 : 16
      const sents = sentences(abs)
      const claims = sents.filter((s) => /\b(found|showed|found that|results suggest|significant|increase|decrease|reduce|improv|effect|association|relationship)\b/i.test(s))
      const methods = sents.filter((s) => /\b(using|via|analy[sz]ed|measured|collected|retrospective|experiment|survey|sample)\b/i.test(s))
      const numbers = abs.match(/\d[\d,.]*\s*(%|percent|students|projects|participants|weeks|months|n\s*=)/gi) || []
      const Q = [
        { q: 'What is your single main contribution, in one sentence?', a: claims[0] || 'State it as: "I showed that X, which was not previously known, by means of Y."', weak: !claims.length },
        { q: 'Why did you choose this methodology?', a: 'Reference your research question, then acknowledge the closest alternative and why it was rejected. Examiners are testing your reasoning, not your method.', weak: !methods.length },
        { q: 'What are the limitations of your study?', a: 'Give three: sample, measure, and generalisability. For each, state the direction of the bias it introduces. "Limited sample size" alone is not an answer.', weak: false },
        { q: 'What would happen if your main effect is not causal?', a: 'Concede immediately, then reframe: "The design supports association, and I have stated the confounders I could control for. The causal claim is limited to X."', weak: false },
        { q: 'How would you improve this work with more time?', a: 'Name one methodological upgrade and one sample upgrade, with the time each would need.', weak: false },
        { q: 'What is new here that was not already known?', a: 'Quote the gap statement from your literature review. This is the question that most defences fail.', weak: false },
        { q: 'Explain [the most complex method in your project] as if to a first-year student.', a: 'No jargon, one analogy, one sentence of why it matters. Examiners test communication, not recall.', weak: false },
        { q: 'What are the ethical considerations you addressed?', a: 'Consent, data protection, right to withdraw, and how findings are reported. Have the approval reference number ready.', weak: !/ethic|consent|approval|gdpr|anonym/i.test(abs) },
        { q: 'What would a critic say about this thesis?', a: 'Name the strongest objection yourself, concede what is true, and explain what you did about it. Never defend an indefensible design.', weak: false },
        { q: 'Where would you place your contribution against the existing literature?', a: 'Use a diagram or a one-paragraph positioning statement relative to the three closest studies.', weak: false },
      ]
      const weak = Q.filter((x) => x.weak)
      const plan = [
        `WEEK ${num(Math.max(1, weeks - 2), 0)}: re-read your own thesis cover to cover — examiners will notice if you cannot recall chapter 3`,
        `WEEK ${num(Math.max(1, weeks - 1), 0)}: write the three answers you are least confident about, in full, on paper`,
        `WEEK ${num(weeks, 0)}: two mock defences with a colleague, one in person, timed`,
        `WEEK ${num(weeks, 0)}: prepare a one-page summary sheet of your own numbers — every figure you will be asked about`,
        `FINAL 48 HOURS: sleep, and rehearse the opening answer to "summarise your thesis" out loud until it is automatic`,
      ]
      return [
        sres('Defence in', `${num(weeks, 0)} weeks`, weeks < 3 ? T.bad : weeks < 6 ? T.warn : T.good, `${level} · ${num(plan.length, 0)} preparation steps`, clamp(100 - (weeks / 20) * 100, 5, 100)),
        sres('Likely examiner questions', num(Q.length, 0), T.good, `${num(claims.length, 0)} claim(s) and ${num(methods.length, 0)} method statement(s) found in your abstract`, (claims.length / 3) * 100),
        sres('Weak points', num(weak.length, 0), weak.length > 2 ? T.bad : weak.length ? T.warn : T.good, weak.length ? 'fix these before the defence, not during it' : 'your abstract covers the key claims', clamp(100 - weak.length * 20, 10, 100)),
        docr('Question bank', Q.map((x, i) => `Q${i + 1}. ${x.q}\n   A: ${x.a}`).join('\n\n')),
        docr('Preparation plan', plan.map((p) => `• ${p}`).join('\n')),
        docr('Numbers you must know', numbers.length ? numbers.map((n2) => `• ${n2}`).join('\n') : 'extract every number from your results and put them on one page — you will be asked for at least three'),
        res('Opening answer', 'prepare a 60-second summary of the whole thesis. If the examiner interrupts you to say "just the main point", that is a bad sign.', T.warn),
        res('Body language', 'answer the question that was asked. Look at the examiner, not at your slides, and pause before answering — it reads as thoughtfulness.', T.neutral),
        res('When you do not know', 'say "I do not know, and here is how I would find out." Bluffing is the only answer that is always wrong.', T.good),
      ]
    },
  },
  {
    id: 'plagiarism-report-reader-fyp',
    name: 'Plagiarism Report Reader',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Interprets a similarity report: which matches are legitimate citations and which are unattributed copying.',
    tip: 'A 15% similarity score is not a verdict. A single unattributed paragraph matters; fifteen properly cited overlaps do not.',
    usage: ['Paste the similarity report summary.', 'Set the similarity percentage.', 'Read the interpretation and next steps.'],
    method: ['Overlap is classified by match type.', 'Citation adequacy is assessed.', 'A severity verdict and action list are produced.'],
    fields: [n('score', 'Overall similarity score (%)', { def: 12, min: 0, max: 100, step: 1 }), txt('report', 'Report notes (one per line: source | match type | your section)', 8, 'Turnitin Guide | generic template phrase | methodology\nSmith 2019 journal | direct quote | literature review\nWiley Press | published textbook | direct quote\nAnonymous forum post | exact match | discussion section'), n('words', 'Your submission length (words)', { def: 6000, min: 500, step: 500 })],
    compute: (v) => {
      const score = clamp(asNum(v.score), 0, 100)
      const rows = linesOf(asStr(v.report)).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { src: p[0] || 'Source', type: p[1] || 'exact match', sec: p[2] || '' }
      })
      const wordsTotal = Math.max(1, asNum(v.words))
      const direct = rows.filter((r) => /exact|direct|identical|verbatim/i.test(r.type))
      const generic = rows.filter((r) => /generic|template|common|formula/i.test(r.type))
      const publications = rows.filter((r) => /journal|press|book|published|thesis|article/i.test(r.src))
      const forums = rows.filter((r) => /forum|blog|wiki|student|essay mill|coursehero|studocu/i.test(r.src))
      const unattributed = rows.filter((r) => /method|discussion|conclusion/i.test(r.sec) && /exact|direct/i.test(r.type))
      const approxWords = Math.round((score / 100) * wordsTotal)
      const severity = score > 30 ? T.bad : score > 15 ? T.warn : T.good
      const interpretation: string[] = []
      interpretation.push(`${num(score, 0)}% of a ${num(wordsTotal, 0)}-word submission is roughly ${num(approxWords, 0)} words of matched text.`)
      if (generic.length) interpretation.push(`${num(generic.length, 0)} match(es) are generic template or stock phrasing — these are almost never a problem and account for a disproportionate share of most similarity scores.`)
      if (direct.length) interpretation.push(`${num(direct.length, 0)} match(es) are exact or direct quotes. Legitimate if quoted, attributed and referenced; a violation if not.`)
      if (publications.length) interpretation.push(`${num(publications.length, 0)} match(es) come from published academic work — these are the ones you are expected to be engaging with directly, and they still need quotation marks and a citation.`)
      if (forums.length) interpretation.push(`${num(forums.length, 0)} match(es) come from non-academic or user-generated sites. These carry the highest risk and are almost never legitimately attributable.`)
      if (unattributed.length) interpretation.push(`${num(unattributed.length, 0)} exact match(es) fall in your own argument sections (method, discussion, conclusions) — this is the category examiners look at first.`)
      const actions: string[] = []
      if (generic.length) actions.push('Confirm the generic matches are stock phrasing, then quote or paraphrase them in your own words anyway — it removes the flag entirely')
      if (direct.length && !unattributed.length) actions.push('Check every direct quote has quotation marks, a page number and an in-text citation')
      if (unattributed.length) actions.push(`Rewrite the ${unattributed.length} flagged passage(s) in your own words, or quote and cite them. Do not edit to game the algorithm — the examiner reads the flagged text`)
      if (forums.length) actions.push('Replace user-generated sources with the peer-reviewed work that made the same claim, and cite that instead')
      if (score > 25) actions.push('Meet your supervisor or academic integrity officer before resubmitting — at this level the report usually goes to a panel')
      const next = score > 30 ? 'Treat this as a serious case: contact your academic integrity office today, bring your drafts and source notes, and be proactive. Declining to engage is what turns a mistake into a misconduct finding.'
        : score > 15 ? 'Work through the action list, then rerun the check. Most of the score will disappear once quotes and references are added.'
        : 'This is a normal score. Verify the flagged passages are cited, and move on.'
      return [
        sres('Similarity score', `${num(score, 0)}%`, severity, `${num(approxWords, 0)} of ${num(wordsTotal, 0)} words matched`, clamp(100 - score, 5, 100)),
        sres('Exact / direct matches', num(direct.length, 0), direct.length > 3 ? T.warn : direct.length ? T.neutral : T.good, `${num(generic.length, 0)} generic, ${num(publications.length, 0)} from publications, ${num(forums.length, 0)} from forums`),
        sres('Risk', unattributed.length ? `${num(unattributed.length, 0)} unattributed match(es) in your own argument` : forums.length ? `${num(forums.length, 0)} match(es) from user-generated sites` : 'no high-risk matches flagged', unattributed.length > 1 || forums.length > 0 ? T.bad : score > 20 ? T.warn : T.good, 'examiners read the flagged text itself, not just the number', clamp(100 - score * 1.5 - unattributed.length * 15, 5, 100)),
        docr('Interpretation', interpretation.map((i) => `• ${i}`).join('\n')),
        docr('Actions', actions.length ? actions.map((a, i) => `${i + 1}. ${a}`).join('\n') : 'no action required — the flagged text is standard academic phrasing'),
        res('What to do next', next, severity),
        res('What similarity does NOT mean', 'a score is not a decision. Blocked quotations, reference lists, standard formulae and stock phrasing all count towards it.', T.neutral),
        res('Prevention', 'keep a source log with every reference and page number as you write, and quote on first use. Managing citations at the end is what produces these reports.', T.good),
      ]
    },
  },
  {
    id: 'supervisor-meeting-prep-fyp',
    name: 'Supervisor Meeting Prep',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Prepares a supervision meeting: agenda, progress report, specific questions and decisions to leave with.',
    tip: 'Never arrive with "any update?". Arrive with three decisions you need made. That single change turns a 20-minute pleasantry into a productive hour.',
    usage: ['Describe your progress and blockers.', 'Set the meeting length.', 'Read the agenda and the questions to ask.'],
    method: ['Progress and blockers are separated.', 'Questions are made specific and decision-oriented.', 'Minutes are drafted for you to send.'],
    fields: [txt('progress', 'What have you done since the last meeting?', 5, 'Read and annotated 12 papers for the literature review. Drafted the methodology chapter, 2,400 of 3,000 words. Analysis plan written but not run.'), txt('blockers', 'What is blocking you? (one per line)', 4, 'Cannot access the student project repository\nUnsure whether to use regression or a non-parametric test\nEthics form needs my supervisor to sign it'), n('mins', 'Meeting length (minutes)', { def: 30, min: 10, max: 120, step: 5 }), sel('freq', 'Meeting frequency', ['Weekly', 'Fortnightly', 'Monthly', 'Rarely'], 'Fortnightly')],
    compute: (v) => {
      const prog = asStr(v.progress).trim()
      if (!prog) return [sres('Meeting prep', 'Describe your progress first', T.warn)]
      const blockers = linesOf(asStr(v.blockers))
      const mins = Math.max(10, asNum(v.mins))
      const freq = asSel(v.freq)
      const done = prog.split(/[.;\n]/).map((s) => s.trim()).filter((s) => s.length > 10)
      const isMethodological = blockers.some((b) => /test|method|analy[sz]|statistic|design|model/i.test(b))
      const agenda = [
        { mins: 3, item: 'Progress since last meeting', note: done.length ? done.map((d) => `• ${d}`).join('\n') : 'add detail here' },
        { mins: isMethodological ? 12 : 6, item: 'Decisions needed on your blockers', note: blockers.length ? blockers.map((b, i) => `${i + 1}. ${b}\n   Decision needed: ${/test|method|analy[sz]|statistic/i.test(b) ? 'which approach, and why' : /access|permission|admin/i.test(b) ? 'who you need to contact and what they must do' : 'what you need from your supervisor specifically'}`).join('\n') : 'no blockers listed — use this time to ask about scope or quality' },
        { mins: mins > 30 ? 8 : 5, item: 'Scope and direction check', note: 'Am I still answering my research question, or have I drifted? What is the one thing I should cut if I am running late?' },
        { mins: Math.max(3, mins - (3 + (isMethodological ? 12 : 6) + (mins > 30 ? 8 : 5))), item: 'Actions and deadlines', note: 'leave the meeting with: named actions, owners and dates' },
      ]
      const questions = [
        blockers.length ? `For blocker 1 (${blockers[0].slice(0, 60)}): what is the fastest unblocking step, and who else do I need?` : 'If I am blocked on something I have not mentioned, what should I watch for?',
        'Of everything I have written, which part is weakest?',
        isMethodological ? 'Given my data shape, which analysis would you defend to an examiner — and what would you tell me not to do?' : 'What would you expect to see in the literature that I might have missed?',
        'Am I on track for the deadline, or should I reduce scope now?',
        'Is there anything in my approach you would challenge if you were an examiner?',
        'Who else should I be talking to — other students, staff, external people?',
      ]
      const minutes = [
        `SUPERVISION MEETING — ${new Date().toLocaleDateString('en-GB')}`,
        ``,
        `Present: student, ${'supervisor'}`,
        `Apologies: —`,
        `Next meeting: ${freq === 'Weekly' ? 'next week' : freq === 'Fortnightly' ? 'in two weeks' : freq === 'Monthly' ? 'in one month' : 'date to be agreed'}`,
        ``,
        `1. PROGRESS`,
        ...done.map((d) => `   ${d}`),
        ``,
        `2. DISCUSSIONS AND DECISIONS`,
        ...(blockers.length ? blockers.map((b, i) => `   ${i + 1}. Raised: ${b}\n      Decision: [record the decision here]\n      Action: [who] by [date]`) : ['   No blockers raised.']),
        ``,
        `3. ACTIONS`,
        ...done.slice(0, 2).map(() => `   • [carry forward previous action] — owner, date`),
        `   • Send the annotated bibliography — student, within 7 days`,
        ``,
        `4. NEXT MEETING`,
        `   Date: ${freq === 'Weekly' ? 'same time next week' : freq === 'Fortnightly' ? 'same time in two weeks' : freq === 'Monthly' ? 'same time next month' : 'to be confirmed'}`,
        `   Preparation: bring the draft section and any new supervisor comments`,
      ]
      return [
        sres('Agenda built', `${num(agenda.length, 0)} items`, T.good, `${num(mins, 0)} minutes · ${freq.toLowerCase()} supervision`, clamp((mins / 60) * 100, 10, 100)),
        sres('Decisions needed', num(blockers.length, 0), blockers.length > 2 ? T.warn : blockers.length ? T.neutral : T.good, blockers.length ? 'arrive with each one framed as a question' : 'no blockers — use the time for direction', blockers.length ? clamp(100 - blockers.length * 15, 10, 100) : 60),
        sres('Progress items', num(done.length, 0), T.neutral, 'reported in the first 3 minutes'),
        docr('Agenda', agenda.map((a) => `${a.mins} min — ${a.item}\n${a.note.split('\n').map((n2) => '  ' + n2).join('\n')}`).join('\n\n')),
        docr('Questions to ask', questions.map((q, i) => `${i + 1}. ${q}`).join('\n')),
        docr('Minutes template', minutes.join('\n')),
        res('Email before the meeting', 'send the agenda 24 hours ahead with the specific decisions you need. Supervisors arrive with a full schedule and default to "send me the draft".', T.good),
        res('After the meeting', 'send the minutes within 24 hours while they are accurate. It takes ten minutes and it stops the same three points resurfacing next term.', T.neutral),
      ]
    },
  },
  {
    id: 'abstract-compressor-fyp',
    name: 'Abstract Compressor',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Compresses a draft abstract to a word limit, keeping problem, method, results and conclusion intact.',
    tip: 'Cut background before you cut results. Nobody reading your abstract needs the history of the field — they need your numbers.',
    usage: ['Paste your draft abstract.', 'Set the word limit and structured/unstructured style.', 'Read the compressed version.'],
    method: ['Sentences are classified by abstract function.', 'Background and hedging are cut first.', 'The required four elements are checked.'],
    fields: [sel('limit', 'Word limit', ['100 words', '150 words', '200 words', '250 words', '300 words'], '250 words'), sel('style', 'Style', ['Unstructured (single paragraph)', 'Structured (Background / Method / Results / Conclusion)'], 'Unstructured (single paragraph)'), txt('draft', 'Draft abstract', 8, 'Universities have long recognised the importance of feedback in the development of student work. This study, carried out over two semesters with 214 undergraduate capstone projects, investigated whether automated code review tooling reduces defect density. Data were collected retrospectively from repository histories and analysed using negative binomial regression. Projects using static analysis showed an 18% reduction in defect density, while style-only linters showed no significant effect. The findings suggest that automated tooling addresses a narrow class of defects and should be paired with peer review.')],
    compute: (v) => {
      const draft = asStr(v.draft).trim()
      if (draft.length < 40) return [sres('Abstract', 'Paste your draft abstract first', T.warn)]
      const limits: Record<string, number> = { '100 words': 100, '150 words': 150, '200 words': 200, '250 words': 250, '300 words': 300 }
      const limit = limits[asSel(v.limit)] || 250
      const structured = asSel(v.style).startsWith('Structured')
      const sents = sentences(draft)
      const cls = (s: string): 'background' | 'method' | 'result' | 'conclusion' | 'other' => {
        if (/\b(we (used|analy[sz]ed|collected|conducted)|method|data were|using|sample|regression|survey|experiment|participants)\b/i.test(s)) return 'method'
        if (/\b(found|showed|significant|result|increase|decrease|reduce[ds]?|%|effect|correlat)\b/i.test(s)) return 'result'
        if (/\b(therefore|conclude|suggest|implication|recommend|should|future)\b/i.test(s)) return 'conclusion'
        if (/\b(important|recognise|recognize|well known|has been|is a|are a|increasingly|widely|however|although)\b/i.test(s)) return 'background'
        return 'other'
      }
      const labelled = sents.map((s) => ({ s, k: cls(s) }))
      const order: ('background' | 'method' | 'result' | 'conclusion')[] = ['background', 'method', 'result', 'conclusion']
      const score = (x: { s: string; k: string }) => (order.indexOf(x.k as never) + 1) * 10 - (x.s.length > 220 ? 8 : 0) + (/\d/.test(x.s) ? 12 : 0)
      let kept = labelled.slice().sort((a, b) => score(b) - score(a))
      const currentWords = draft.split(/\s+/).length
      while (kept.length > 1 && kept.reduce((s, x) => s + x.s.split(/\s+/).length, 0) > limit) kept = kept.slice(0, -1)
      kept = kept.sort((a, b) => order.indexOf(a.k as never) - order.indexOf(b.k as never))
      const present = new Set(kept.map((x) => x.k))
      const missing = order.filter((k) => !present.has(k))
      const text = kept.map((x) => x.s).join(' ').replace(/\s+/g, ' ').trim()
      const finalWords = text.split(/\s+/).length
      let out = text
      if (structured) {
        out = order.map((k) => {
          const items = kept.filter((x) => x.k === k)
          if (!items.length) return ''
          const title = k.charAt(0).toUpperCase() + k.slice(1)
          return `${title}: ${items.map((x) => x.s).join(' ')}`
        }).filter(Boolean).join('\n\n')
      }
      const hedge = (text.match(/\b(may|might|perhaps|possibly|suggest[s]? that|appears|seems|arguably|somewhat|relatively)\b/gi) || []).length
      const read = flesch(text)
      return [
        sres('Compressed to', `${num(finalWords, 0)} words`, finalWords <= limit ? T.good : T.warn, `from ${num(currentWords, 0)} — cut ${num(Math.max(0, currentWords - finalWords), 0)} words`, (finalWords / limit) * 100),
        sres('Elements retained', `${num(4 - missing.length, 0)}/4`, missing.length ? T.warn : T.good, missing.length ? `missing: ${missing.join(', ')}` : 'problem, method, result, conclusion all present', ((4 - missing.length) / 4) * 100),
        sres('Readability', read.score ? `${num(read.score, 0)} Flesch` : 'n/a', read.score > 50 ? T.good : T.warn, read.grade, read.score ? clamp(read.score, 5, 100) : 50),
        sres('Hedging language', num(hedge, 0), hedge > 3 ? T.warn : T.good, hedge ? 'hedge words weaken the claim without adding information' : 'direct claims', clamp(100 - hedge * 12, 10, 100)),
        docr(structured ? 'Structured abstract' : 'Compressed abstract', out),
        docr('What was cut', labelled.filter((x) => !kept.includes(x)).map((x) => `[${x.k}] ${x.s}`).join('\n\n') || 'nothing was cut — the draft was already within the limit'),
        res('Cutting order', 'background → restated aims → hedge words → qualifiers → method detail. Never cut the numbers or the conclusion — they are the abstract.', T.neutral),
        res('Numbers are the abstract', 'a reader who reads only your result sentence should still learn something. If no figure appears in your abstract, it is probably missing.', T.warn),
        res('Check the limit', 'many journals count the title and exclude it here — check the author guidelines before you finalise, and count the abstract only.', T.neutral),
      ]
    },
  },
  {
    id: 'word-count-estimator-fyp',
    name: 'Thesis Word Count Estimator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Estimates how long your thesis will be, chapter by chapter, from what you have written and what remains.',
    tip: 'Most people underestimate by 40% because they count only the prose, not the tables, references and appendices that supervisors count too.',
    usage: ['Enter your current word counts per chapter.', 'Set the total limit.', 'Read the projection and the gap.'],
    method: ['Current counts are compared with target shares.', 'Remaining chapters are estimated from your writing rate.', 'A completion projection is returned.'],
    fields: [txt('counts', 'Current word counts (one per line: chapter | current | target)', 8, 'Introduction | 1800 | 3000\nLiterature review | 4200 | 4000\nMethodology | 3100 | 2800\nResults | 5200 | 4000\nDiscussion | 900 | 3000\nReferences | 1100 | 1500'), n('limit', 'Overall word limit', { def: 18000, min: 2000, step: 500 }), n('weeks', 'Weeks remaining', { def: 8, min: 1, step: 1 })],
    compute: (v) => {
      const rows = linesOf(asStr(v.counts)).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { name: p[0] || 'Chapter', cur: parseInt(p[1] || '0', 10) || 0, tgt: parseInt(p[2] || '0', 10) || 0 }
      })
      if (!rows.length) return [sres('Word count', 'Enter your per-chapter counts', T.warn)]
      const limit = Math.max(2000, asNum(v.limit))
      const weeks = Math.max(1, asNum(v.weeks))
      const curTotal = rows.reduce((s, r) => s + r.cur, 0)
      const tgtTotal = rows.reduce((s, r) => s + r.tgt, 0)
      const remaining = Math.max(0, limit - curTotal)
      const perWeek = remaining / weeks
      const over = rows.filter((r) => r.cur > r.tgt * 1.1)
      const under = rows.filter((r) => r.cur < r.tgt * 0.6)
      const detail = rows.map((r) => {
        const pct = r.tgt ? Math.round((r.cur / r.tgt) * 100) : 0
        const state = pct > 110 ? 'OVER' : pct < 60 ? 'behind' : 'on track'
        return `${r.name.padEnd(24)} ${num(r.cur, 0).padStart(6, ' ')} / ${num(r.tgt, 0).padStart(6, ' ')}  ${String(pct).padStart(3, ' ')}%  ${state.padEnd(8)} ${'█'.repeat(Math.min(30, Math.round(pct / 3.3)))}`
      })
      const advice: string[] = []
      if (over.length) advice.push(`Cut ${over.map((r) => r.name).join(', ')} — these are over their target. Cutting analysis you already have is faster than writing new text.`)
      if (under.length) advice.push(`${under.map((r) => r.name).join(', ')} ${under.length > 1 ? 'are' : 'is'} significantly behind. This is the risk: a short methodology and a long results section is a common way to fail.`)
      if (remaining === 0) advice.push('You are at or over the limit already. Check whether your institution excludes references and appendices before you cut anything.')
      if (perWeek > 1500) advice.push(`${num(Math.round(perWeek), 0)} words per week for the remaining ${num(weeks, 0)} weeks is above what most people sustain. Reduce scope or extend the deadline now.`)
      if (tgtTotal > limit) advice.push(`Your chapter targets total ${num(tgtTotal, 0)} words, which is ${num(tgtTotal - limit, 0)} over the limit. Rebalance before you write.`)
      return [
        sres('Current total', `${num(curTotal, 0)} words`, curTotal > limit * 0.95 ? T.warn : T.good, `${ratio((curTotal / limit) * 100, 0)}% of the ${num(limit, 0)}-word limit`, clamp((curTotal / limit) * 100, 0, 100)),
        sres('Remaining', `${num(remaining, 0)} words`, remaining === 0 ? T.warn : T.neutral, `${num(Math.round(perWeek), 0)} words per week for ${num(weeks, 0)} weeks`, clamp(100 - (remaining / limit) * 100, 5, 100)),
        sres('Over target', num(over.length, 0), over.length ? T.warn : T.good, over.length ? over.map((r) => r.name).join(', ') : 'no chapter exceeds its target', over.length ? clamp(100 - over.length * 25, 10, 100) : 100),
        docr('Chapter breakdown', detail.join('\n')),
        docr('Actions', advice.length ? advice.map((a, i) => `${i + 1}. ${a}`).join('\n') : 'on track — keep to your weekly target'),
        res('What supervisors count', 'body text, quotations, tables and figure captions. Usually excluded: title page, contents, references, appendices, and the abstract if the guideline says so. Check yours in writing.', T.neutral),
        res('Cutting strategy', 'cut repetition before cutting substance. Most theses have the same point made in the introduction, the literature review, the discussion and the conclusion — remove three of the four.', T.warn),
      ]
    },
  },
  {
    id: 'fyp-presentation-builder-fyp',
    name: 'FYP Presentation Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Turns your thesis abstract into a timed project presentation with a slide-by-slide script and Q&A prep.',
    tip: 'Your defence is 20 minutes. Spend 2 on context, 10 on what you did, 5 on what you found, 3 on what it means. Most students spend 15 on the literature review.',
    usage: ['Paste your abstract.', 'Set the talk length.', 'Read the slide plan and timing.'],
    method: ['The talk is divided into timed segments.', 'Slide titles are drafted as claims.', 'Q&A is anticipated.'],
    fields: [sel('len', 'Presentation length', ['10 minutes', '15 minutes', '20 minutes', '30 minutes'], '15 minutes'), sel('aud', 'Audience', ['Examining panel', 'Classmates and tutors', 'Industry partners', 'Public / school audience'], 'Examining panel'), txt('abstract', 'Paste your abstract and conclusions', 8, 'This study examined whether automated code review tools reduce defect density in student capstone projects. A retrospective analysis of 214 submissions across three cohorts found an 18% reduction with static analysis tooling and no significant effect from style-only linters. Automated tooling addresses a narrow class of defects and must be paired with peer review.')],
    compute: (v) => {
      const abs = asStr(v.abstract).trim()
      if (abs.length < 40) return [sres('Presentation', 'Paste your abstract first', T.warn)]
      const lens: Record<string, number> = { '10 minutes': 10, '15 minutes': 15, '20 minutes': 20, '30 minutes': 30 }
      const mins = lens[asSel(v.len)] || 15
      const aud = asSel(v.aud)
      const sents = sentences(abs)
      const method = sents.find((s) => /\b(using|via|analy[sz]ed|collected|retrospective|experiment|survey|sample|cohort)\b/i.test(s))
      const results = sents.filter((s) => /\b(found|showed|significant|%|reduce[ds]?|increase[ds]?|effect)\b/i.test(s))
      const conclusion = sents.filter((s) => /\b(suggest|conclude|implication|recommend|should|therefore|means)\b/i.test(s)).slice(-1)[0]
      const numbers = abs.match(/\d[\d,.]*\s*(?:%|projects|students|participants|cohorts|weeks|months)/gi) || []
      const pct = (m: number) => Math.round((m / mins) * 100)
      const plan = [
        { slide: '1. Title', secs: Math.round(mins * 0.04), say: 'Your name, title, supervisor, degree. Then one sentence: what you did and what you found.' },
        { slide: '2. The problem', secs: Math.round(mins * 0.12), say: 'Why this matters to someone in this room. One concrete example, not a literature review.' },
        { slide: '3. The gap', secs: Math.round(mins * 0.08), say: 'What was known, what was missing. This slide is why your project existed.' },
        { slide: '4. Your question', secs: Math.round(mins * 0.06), say: 'One question, read it out exactly as written.' },
        { slide: '5. Method', secs: Math.round(mins * 0.22), say: `A simple diagram of your design. "${method || 'Design, sample, analysis'}" — keep it to 90 seconds, examiners will ask for detail afterwards.` },
        { slide: '6. Results (main finding)', secs: Math.round(mins * 0.2), say: results[0] ? `Lead with the strongest result: ${results[0]}` : 'Your single most important finding, with the number.' },
        { slide: '7. Results (supporting)', secs: Math.round(mins * 0.1), say: 'One or two supporting results only. Everything else goes in the appendix.' },
        { slide: '8. What it means', secs: Math.round(mins * 0.1), say: conclusion ? conclusion : 'The practical implication for someone doing this work.' },
        { slide: '9. Limitations', secs: Math.round(mins * 0.04), say: 'Two, stated confidently. Owning your limitations buys credibility.' },
        { slide: '10. Contribution & next steps', secs: Math.round(mins * 0.04), say: 'One sentence on what changes now, and one on what you would do next.' },
      ]
      const script = plan.map((p) => `SLIDE ${p.slide}  [${Math.floor(p.secs / 60)}:${String(p.secs % 60).padStart(2, '0')}]\nSAY: ${p.say}`)
      const qa = [
        'Why did you choose this method rather than the obvious alternative?',
        'What is the biggest limitation of your study?',
        'What would you do differently if you started again?',
        'Your result shows correlation — how do you know it is not just confounding?',
        'What are the practical implications for [their sector]?',
        'What would you do next, with more time?',
        'How generalisable is this beyond your sample?',
        'What did you personally learn from doing this project?',
      ]
      const rules = aud === 'Examining panel'
        ? ['Expect to be interrupted with a question at any point — answer it, then resume. Do not apologise for being interrupted.', 'Do not read slides. If they can read it faster than you can say it, it should not be a slide.', 'Bring a one-page summary of every number in your results.']
        : aud === 'Classmates and tutors'
        ? ['Bring them in early — start with a question about their experience.', 'Use one analogy from everyday life; avoid jargon entirely.', 'Leave 3 minutes for questions and take two.']
        : aud === 'Industry partners'
        ? ['Lead with the business consequence, not the method.', 'One number they can use in a decision.', 'Say clearly what you would need to make this operational.']
        : ['Define every technical term the first time you use it.', 'No equation without a plain-language sentence before it.', 'Show one real example from the data.']
      return [
        sres('Talk length', `${num(mins, 0)} minutes`, T.good, `${num(plan.length, 0)} slides · ~${ratio(mins / plan.length, 1)} min per slide`, clamp(100 - (plan.length / (mins * 0.9)) * 100, 10, 100)),
        sres('Time on method + results', `${pct(Math.round(mins * 0.42))}%`, T.good, `context and background get ${pct(Math.round(mins * 0.24))}%`, clamp((Math.round(mins * 0.42) / 0.6) * 100, 10, 100)),
        sres('Numbers available', num(numbers.length, 0), numbers.length >= 3 ? T.good : T.warn, numbers.length ? numbers.join(' · ') : 'extract the key figures from your abstract — a talk without numbers is an opinion', clamp((numbers.length / 5) * 100, 5, 100)),
        docr('Slide plan and script', script.join('\n\n')),
        docr('Anticipated questions', qa.map((q, i) => `Q${i + 1}. ${q}`).join('\n')),
        docr('Rules for this audience', rules.map((r) => `• ${r}`).join('\n')),
        res('Rehearse out loud', `at least four times with a timer. Reading it silently runs 30% long, and you will discover the awkward sentence at minute 14 in the exam room.`, T.warn),
        res('Handout', 'one page: the question, the method in three lines, the main result as a number, the limitation, and your contact. Examiners keep these.', T.neutral),
      ]
    },
  },
  {
    id: 'citation-style-converter-fyp',
    name: 'Citation Style Converter',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Converts citation markers between APA, Harvard, MLA, Chicago and IEEE for the same source.',
    tip: 'Pick one style at the start and do not switch. Mixing APA and Harvard in one reference list is the most common avoidable mark loss in undergraduate work.',
    usage: ['Paste your reference list.', 'Choose the required style.', 'Read the converted list.'],
    method: ['Each reference is parsed into authors, year, title and source.', 'The target style template is applied.', 'In-text citation forms are produced.'],
    fields: [sel('from', 'Current style', ['APA 7', 'Harvard', 'MLA 9', 'Chicago author-date', 'IEEE'], 'APA 7'), sel('to', 'Required style', ['APA 7', 'Harvard', 'MLA 9', 'Chicago author-date', 'IEEE'], 'Harvard'), txt('refs', 'Reference list (one per line)', 6, 'Smith, J. A., & Doe, B. (2021). Automated code review and defect detection. Journal of Software Engineering, 18(3), 112-128.')],
    compute: (v) => {
      const refs = linesOf(asStr(v.refs))
      if (!refs.length) return [sres('Converter', 'Paste your reference list first', T.warn)]
      const from = asSel(v.from)
      const to = asSel(v.to)
      const parse = (line: string) => {
        const authorBlock = line.split(/[.(]/)[0].trim()
        const authors = authorBlock
          .replace(/&/g, ',')
          .split(',')
          .map((a) => a.trim())
          .filter((a) => /^[A-Z]/.test(a))
        const yearMatch = line.match(/\b(19|20)\d{2}\b/)
        const year = yearMatch ? yearMatch[0] : 'n.d.'
        const afterYear = line.slice((yearMatch?.index || 0) + 4).replace(/^[).,\s]+/, '')
        const title = afterYear.split(/\.\s|\.\t/)[0].replace(/[.,]$/, '').trim()
        const rest = afterYear.slice(title.length).replace(/^[.\s]+/, '')
        return { authors, year, title, rest: rest || 'Untitled source', line }
      }
      const parsed = refs.map(parse)
      const initials = (a: string) => {
        const parts = a.split(/[\s-]+/).filter(Boolean)
        return parts.map((p) => p[0]?.toUpperCase() + '.').join(' ')
      }
      const surnameFirst = (a: string) => {
        const parts = a.split(/[\s-]+/).filter(Boolean)
        return parts.length > 1 ? `${parts[parts.length - 1]}, ${parts.slice(0, -1).map((p) => p[0].toUpperCase() + '.').join(' ')}` : a
      }
      const inText = (a: string) => (to === 'IEEE' ? `[1]${to === 'IEEE' ? '' : ''}` : `(${surnameFirst(a).split(',')[0]}, ${parsed[0].year})`)
      const convert = (p: (typeof parsed)[number]): string => {
        const aList = p.authors.length ? p.authors : ['Anonymous']
        switch (to) {
          case 'APA 7':
            return `${aList.map((a, i) => (i === aList.length - 1 ? `& ${initials(a)}` : initials(a))).join(', ')} (${p.year}). ${p.title}. ${p.rest}`
          case 'Harvard':
            return `${aList.map((a, i) => (i === aList.length - 1 ? `and ${surnameFirst(a)}` : surnameFirst(a))).join(', ')} (${p.year}) '${p.title}', ${p.rest}.`
          case 'MLA 9':
            return `${aList.length > 1 ? `${surnameFirst(aList[0])}, et al.` : surnameFirst(aList[0])} "${p.title}." ${p.rest}, ${p.year}.`
          case 'Chicago author-date':
            return `${aList.map((a, i) => (i === aList.length - 1 ? `and ${surnameFirst(a)}` : surnameFirst(a))).join(', ')}. ${p.year}. "${p.title}." ${p.rest}.`
          case 'IEEE':
            return `${aList.map((a) => initials(a)).join(', ')}, "${p.title}," ${p.rest}, ${p.year}.`
          default:
            return p.line
        }
      }
      const out = parsed.map(convert)
      const inTexts = parsed.map((p) => {
        const a = p.authors[0] || 'Anonymous'
        switch (to) {
          case 'IEEE': return `[${parsed.indexOf(p) + 1}]`
          case 'APA 7': return p.authors.length > 1 ? `(${p.authors.map((x) => surnameFirst(x).split(',')[0]).join(' & ')}, ${p.year})` : `(${surnameFirst(a).split(',')[0]}, ${p.year})`
          case 'Harvard': return p.authors.length > 1 ? `(${p.authors.map((x) => surnameFirst(x).split(',')[0]).join(' and ')}, ${p.year})` : `(${surnameFirst(a).split(',')[0]}, ${p.year})`
          case 'MLA 9': return `(${surnameFirst(a).split(',')[0]})`
          case 'Chicago author-date': return `(${surnameFirst(a).split(',')[0]} ${p.year})`
          default: return inText(a)
        }
      })
      const incomplete = parsed.filter((p) => !p.title || p.title === 'Untitled source' || p.authors.length === 0)
      return [
        sres('Converted', `${num(out.length, 0)} reference(s)`, to === from ? T.warn : T.good, `${from} → ${to}`, 100),
        sres('Parsing issues', num(incomplete.length, 0), incomplete.length ? T.warn : T.good, incomplete.length ? 'could not extract author or title — check these by hand' : 'all references parsed successfully', clamp(100 - incomplete.length * 20, 10, 100)),
        docr(`${to} reference list`, out.map((o, i) => `${i + 1}. ${o}`).join('\n')),
        docr(`${to} in-text citations`, inTexts.map((c, i) => `${i + 1}. ${c}   →   ${to === 'IEEE' ? `[${i + 1}]` : `${surnameFirst(parsed[i].authors[0] || 'Anonymous').split(',')[0]} ${to === 'Chicago author-date' ? parsed[i].year : to === 'MLA 9' ? '' : `(${parsed[i].year})`}`.trim()}`).join('\n')),
        res('Style check', to === from ? 'you selected the same style for input and output — pick the style your marker requires' : `converted from ${from} to ${to}. Verify DOI and volume/issue formatting by hand — those vary most between styles.`, to === from ? T.warn : T.neutral),
        res('What changes between styles', 'APA and Harvard put the year in parentheses; MLA and Chicago author-date use different author name forms; IEEE uses numbered citations and initials only. The title capitalisation also changes.', T.neutral),
        res('Most common error', 'having the right authors and year but the wrong capitalisation of the title — APA and Harvard use sentence case, MLA and Chicago use title case', T.warn),
      ]
    },
  },
]
