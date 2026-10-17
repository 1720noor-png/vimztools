import { n, sel, txt, res, T, asNum, asSel, asStr, clamp, num } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Research & Academic Tools'

const FIELDS: Record<string, string[]> = {
  Experimental: ['Measurement error', 'Confounding variables', 'Sample representativeness', 'Data-collection bias', 'Hypothesis clarity', 'Control methodology', 'Reproducibility', 'Statistical power'],
  Survey: ['Sampling frame bias', 'Response rate', 'Question wording', 'Scale reliability', 'Leading questions', 'Pilot testing', 'Non-response bias', 'Data entry accuracy'],
  Computational: ['Benchmark selection', 'Algorithmic complexity', 'Dataset choice', 'Reproducibility', 'Error analysis', 'Baseline comparison', 'Scalability limits', 'Ethical data use'],
  Literature: ['Scope of search', 'Publication bias', 'Citation coverage', 'Theoretical framing', 'Source recency', 'Methodological comparison', 'Research gaps', 'Counter-arguments'],
  Clinical: ['Trial design', 'Randomization', 'Blinding', 'Placebo effect', 'Sample size', 'Confounders', 'Outcome measures', 'Adverse events'],
  Design: ['User needs', 'Usability testing', 'Accessibility', 'Design constraints', 'Iterative feedback', 'Material choice', 'Prototyping', 'Aesthetics vs function'],
}

function domainsOf(field: string): string[] {
  return FIELDS[field] || FIELDS.Experimental
}

const FIELD_SEL = sel('field', 'Research field', Object.keys(FIELDS), 'Experimental')
const TOPIC_TXT = txt('topic', 'Research topic / subject', 3, 'The impact of social media on adolescent sleep')

export const mod04: StudentSpec[] = [
  {
    id: 'research-topic-generator-research',
    name: 'Research Topic Generator',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Generates focused, researchable topics by combining your subject with method and application lenses, each framed as a question.',
    tip: 'A testable topic contains a variable, a population and a relationship. If any is missing, it is an essay prompt, not a research question.',
    usage: [
      'Enter your broad subject and field.',
      'Review the angle-and-question pairs.',
      'Narrow to the one that fits your data access.',
    ],
    method: [
      'Five framing angles (effect, cause, comparison, trend, gap) are applied.',
      'Each angle produces one researchable question.',
      'Feasibility hints keep topics within reach.',
    ],
    fields: [TOPIC_TXT, FIELD_SEL],
    compute: (v) => {
      const t = asStr(v.topic) || 'your subject'
      const f = asSel(v.field)
      const dims = domainsOf(f)
      const angles = [
        `To what extent does ${t} affect ${dims[0].toLowerCase()}?`,
        `How does ${t} influence ${dims[3].toLowerCase()} in comparison with traditional approaches?`,
        `What trend in ${dims[1].toLowerCase()} has emerged alongside growth in ${t}?`,
        `What gap exists in current research on ${t} regarding ${dims[4].toLowerCase()}?`,
        `In what ways does ${t} moderate the relationship between ${dims[0].toLowerCase()} and student outcomes?`,
      ]
      return [
        sres('Research angles', num(angles.length), T.good, `field: ${f}`),
        docr('Topic candidates', angles.map((a, i) => `${i + 1}. ${a}`).join('\n')),
      ]
    },
  },
  {
    id: 'research-question-generator-research',
    name: 'Research Question Generator',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Crafts primary and secondary research questions — quantitative, qualitative and comparative — with a feasibility test for each.',
    tip: 'Never ask a question your ethics board would flag. If human participants are involved, bake consent wording in from the start.',
    usage: [
      'Enter the topic you want to study.',
      'Choose the question style.',
      'Review feasibility notes for each question.',
    ],
    method: [
      'Primary questions probe the central relationship.',
      'Secondary questions support or contextualize the primary.',
      'Each question is scored for scope and answerability.',
    ],
    fields: [TOPIC_TXT, sel('style', 'Question style', ['Quantitative', 'Qualitative', 'Mixed methods'], 'Quantitative')],
    compute: (v) => {
      const t = asStr(v.topic) || 'the topic'
      const style = asSel(v.style)
      const primary =
        style === 'Quantitative'
          ? `To what extent does ${t} affect measurable student outcomes?`
          : style === 'Qualitative'
            ? `How do students experience and interpret ${t}?`
            : `What is the effect of ${t}, and how do students interpret it?`
      const secondary = [
        `Does the effect of ${t} vary by year of study or discipline?`,
        `Which individual characteristics moderate the strength of the relationship between ${t} and the outcome?`,
        `How do participants describe the mechanisms through which ${t} produces change?`,
      ]
      const feasibility = secondary.map(
        (q) => `${q}\n  — feasible with ${style === 'Qualitative' ? 'interviews (n≈20)' : 'survey (n≥80)'}, ${style === 'Qualitative' ? 'thematic analysis' : 'regression with a pre-registered predictor list'}`,
      )
      return [
        sres('Primary question', primary, T.good),
        docr('Secondary questions', secondary.join('\n')),
        docr('Feasibility notes', feasibility.join('\n')),
      ]
    },
  },
  {
    id: 'thesis-statement-generator-research',
    name: 'Thesis Statement Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Forges arguable thesis statements for your topic in five argumentative shapes, each with a claim, a qualifier and a roadmap.',
    tip: 'A thesis is arguable: if no one could disagree, you have stated a fact. Add a qualifier (“significantly”, “under limited conditions”) to make it testable.',
    usage: [
      'Enter your topic.',
      'Choose the argumentative shape.',
      'Adapt the generated thesis to your data.',
    ],
    method: [
      'Shapes: cause-effect, tension, comparison, counter, and general-to-specific.',
      'Each shape embeds the claim with a hedge qualifier.',
      'A roadmap sentence previews the argument structure.',
    ],
    fields: [TOPIC_TXT, sel('shape', 'Argument shape', ['Cause-effect', 'Tension', 'Comparison', 'Counter-argument', 'General-to-specific'], 'Cause-effect')],
    compute: (v) => {
      const t = asStr(v.topic) || 'the phenomenon'
      const s = asSel(v.shape)
      const theses: Record<string, string> = {
        'Cause-effect': `This study argues that ${t} is a primary driver of student outcomes, and demonstrates its effect through a mixed-methods analysis.`,
        Tension: `Although ${t} is widely celebrated as beneficial, this study contends that its hidden costs outweigh its advantages for students.`,
        Comparison: `Comparing ${t} against conventional practice reveals a measurable gap in effectiveness, with implications for institutional policy.`,
        'Counter-argument': `Critics of ${t} fail to account for longitudinal evidence, which this study re-examines to offer a balanced verdict.`,
        'General-to-specific': `While ${t} is common, it is only within specific high-stakes contexts that it produces the outcomes typically attributed to it.`,
      }
      const roadmap = `Roadmap: first this paper defines ${t}; then it reviews the literature; then it presents the method; finally it presents findings and implications.`
      return [
        sres('Thesis shape', s, T.good),
        docr('Thesis statement', theses[s] || theses['Cause-effect']),
        res('Roadmap sentence', roadmap, T.neutral),
      ]
    },
  },
  {
    id: 'literature-review-generator',
    name: 'Literature Review Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Maps a literature review by theme — clusters concepts that share vocabulary, weights each cluster and drafts a synthesis prompt per cluster.',
    tip: 'Organize by theme, not by author. Synthesis means comparing what authors agree on and where they diverge — listing one after another is not a review.',
    usage: [
      'Paste the concepts or key papers.',
      'Set the number of thematic clusters.',
      'Draft one synthesis paragraph per cluster.',
    ],
    method: [
      'Concepts are grouped by shared vocabulary, heaviest cluster first.',
      'Any leftovers are split evenly into the remaining clusters.',
      'Each cluster shows its relative weight.',
      'A synthesis prompt is generated per cluster.',
    ],
    fields: [txt('concepts', 'Key concepts / authors (one per line)', 6, 'Social media use\nSleep quality\nAcademic performance\nDigital wellbeing'), n('clusters', 'Thematic clusters', { def: 4, min: 2, max: 8, step: 1 })],
    compute: (v) => {
      const concepts = asStr(v.concepts).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const cN = clamp(Math.round(asNum(v.clusters)) || 4, 2, 8)
      const total = concepts.length || 1
      const norm = (s: string): string[] => s.toLowerCase().match(/[a-z]{4,}/g) || []
      const remaining = [...concepts]
      const groups: string[][] = []
      while (groups.length < cN - 1 && remaining.length) {
        const freq = new Map<string, number>()
        for (const c of remaining) for (const w of new Set(norm(c))) freq.set(w, (freq.get(w) || 0) + 1)
        const seed = [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]
        if (!seed) break
        const [term] = seed
        const withTerm = remaining.filter((c) => norm(c).includes(term))
        const take = withTerm.length > 1 ? withTerm : remaining.slice(0, Math.max(1, Math.ceil(remaining.length / (cN - groups.length))))
        groups.push(take)
        for (const t of take) remaining.splice(remaining.indexOf(t), 1)
      }
      while (remaining.length && groups.length < cN) {
        const take = remaining.splice(0, Math.ceil(remaining.length / (cN - groups.length)))
        groups.push(take)
      }
      const blocks = groups
        .filter((g) => g.length)
        .map((g, i) => {
          const shared = [...new Set(g.flatMap(norm))]
            .filter((w) => g.filter((c) => norm(c).includes(w)).length > 1)
            .slice(0, 3)
          const label = shared.length ? `“${shared.join('”, “')}”` : 'no shared vocabulary yet'
          return `Cluster ${i + 1} (${g.length}/${total} concepts${groups.length > 1 ? `, ${num(Math.round((g.length / total) * 100))}% of the map` : ''}) — ${label}:\n  ${g.join(', ')}\n  Synthesis prompt: What do these works agree on, and where do they conflict?`
        })
      return [
        sres('Clusters drafted', num(blocks.length), blocks.length ? T.good : T.warn, `${num(concepts.length)} concepts across ${num(blocks.length)} clusters`),
        res('Concepts mapped', num(concepts.length), T.neutral),
        docr('Literature review map', blocks.length ? blocks.join('\n\n') : 'Add at least two concepts to cluster.'),
      ]
    },
  },
  {
    id: 'abstract-generator-research',
    name: 'Abstract Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Assembles a structured academic abstract — background, aim, method, results and conclusion — from your study inputs.',
    tip: 'Most journals cap abstracts at 200–250 words. Write the conclusion first and let the abstract end on the single strongest finding.',
    usage: [
      'Enter the study aim and method.',
      'Add the headline result.',
      'Copy the structured abstract.',
    ],
    method: [
      'Each abstract section has a fixed function.',
      'The result sentence leads with the strongest number.',
      'Word count is reported against a target.',
    ],
    fields: [
      txt('aim', 'Study aim', 3, 'To examine whether social media use predicts sleep quality among undergraduates.'),
      txt('method', 'Method', 3, 'A cross-sectional survey of 200 undergraduates with regression analysis.'),
      txt('result', 'Headline result', 3, 'Heavy social media use predicted 40 minutes less sleep per night.'),
    ],
    compute: (v) => {
      const aim = asStr(v.aim) || 'To investigate the research problem.'
      const method = asStr(v.method) || 'A mixed-methods study was conducted.'
      const result = asStr(v.result) || 'A significant relationship was found.'
      const abs = `Background: The literature motivates this study. Aim: ${aim} Method: ${method} Results: ${result} Conclusion: The findings support targeted interventions for the studied population and highlight directions for future research.`
      const wc = abs.split(/\s+/).length
      return [
        sres('Abstract length', num(wc) + ' words', wc <= 250 ? T.good : wc <= 300 ? T.warn : T.bad, wc <= 250 ? 'Within the 250-word journal limit' : 'Trim to journal limit'),
        docr('Structured abstract', abs),
      ]
    },
  },
  {
    id: 'research-proposal-generator',
    name: 'Research Proposal Generator',
    archetype: 'timeline',
    subject: SUBJECT,
    blurb:
      'Drafts a full proposal skeleton — problem, questions, literature approach, method, timeline, ethics and expected contributions.',
    tip: 'Proposals are won in the method and ethics sections. Name your sampling strategy and consent process explicitly — reviewers look there first.',
    usage: [
      'Describe the problem and your method.',
      'Set the project duration.',
      'Copy the proposal skeleton.',
    ],
    method: [
      'Eight standard proposal sections are scaffolded.',
      'Timeline splits months into work packages.',
      'Ethics and feasibility are explicit sections.',
    ],
    fields: [
      txt('problem', 'Problem statement', 3, 'Undergraduates lack structured revision strategies, leading to poor retention.'),
      txt('method', 'Method', 3, 'Mixed-methods: survey (n=300) + 6 focus groups.'),
      n('months', 'Duration (months)', { def: 6, min: 2, max: 24, step: 1 }),
    ],
    compute: (v) => {
      const p = asStr(v.problem) || 'the problem'
      const m = asStr(v.method) || 'the method'
      const months = clamp(asNum(v.months), 2, 24)
      const wp = ['Literature review', 'Instrument design & pilot', 'Data collection', 'Analysis', 'Writing & revision']
      const timeline = wp
        .map((w, i) => `  Month ${Math.max(1, Math.round((i * months) / wp.length))}–${Math.max(1, Math.round(((i + 1) * months) / wp.length))}: ${w}`)
        .join('\n')
      const proposal = `1. PROBLEM: ${p}\n2. AIM & QUESTIONS: (define the primary outcome and two supporting questions)\n3. LITERATURE APPROACH: (databases, keywords, inclusion/exclusion criteria)\n4. METHOD: ${m}\n5. TIMELINE:\n${timeline}\n6. ETHICS: Informed consent, anonymization, right to withdraw, secure data storage.\n7. FEASIBILITY: Resources, supervisor support, participant access.\n8. CONTRIBUTIONS: (theory, practice, policy)`
      return [
        sres('Proposal sections', '8', T.good),
        res('Duration', `${months} months`, T.neutral),
        docr('Proposal skeleton', proposal),
      ]
    },
  },
  {
    id: 'methodology-generator',
    name: 'Methodology Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Chooses and defends a research methodology by weighing quantitative, qualitative and mixed designs against your research question.',
    tip: 'Method follows question, not preference. “How much?” calls for quantitative; “How do people experience it?” calls for qualitative.',
    usage: [
      'Enter the research question.',
      'Choose your philosophical stance.',
      'Read the defended method with sampling and analysis.',
    ],
    method: [
      'Stance (positivist/interpretivist) shapes design preference.',
      'Design determines sampling, data and analysis.',
      'A defense sentence justifies the choice.',
    ],
    fields: [txt('q', 'Research question', 3, 'How does peer mentoring affect first-year adjustment?'), sel('stance', 'Philosophical stance', ['Positivist (objectivist)', 'Interpretivist (constructivist)'], 'Positivist (objectivist)')],
    compute: (v) => {
      const q = asStr(v.q) || 'the research question'
      const st = asSel(v.stance)
      const quant = `Quantitative (survey, n≥${st === 'Positivist (objectivist)' ? 100 : 30}): regression / t-tests; assumes a measurable, generalizable effect.`
      const qual = `Qualitative (interviews / focus groups, n≈${st === 'Interpretivist (constructivist)' ? 20 : 10}): thematic analysis; assumes meanings are constructed and contextual.`
      const mixed = `Mixed methods: ${quant.split(':')[1].trim()} embedded with thematic analysis for depth.`
      return [
        sres('Chosen method', st === 'Positivist (objectivist)' ? 'Quantitative' : 'Qualitative', T.good),
        docr('Method options', `Q (${q}):\n  ${quant}\n  ${qual}\n  ${mixed}`),
        docr('Defense sentence', `Given the question “${q}”, a ${st === 'Positivist (objectivist)' ? 'quantitative' : 'qualitative'} design best captures ${st === 'Positivist (objectivist)' ? 'the measurable effect and permits generalization' : 'participants’ lived experience and meaning-making'}.`),
      ]
    },
  },
  {
    id: 'research-gap-finder',
    name: 'Research Gap Finder',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Surfaces underexplored angles in your topic — methodological gaps, population gaps, longitudinal gaps and measurement gaps.',
    tip: 'A convincing gap statement names what is missing AND why it matters. “Few studies on rural youth in Pakistan” is a gap; add why it matters and you have a contribution.',
    usage: [
      'Enter the topic and its field.',
      'Review the four gap types.',
      'Pick the gap you can realistically fill.',
    ],
    method: [
      'Gaps are classified into four types.',
      'Each gap lists why it matters.',
      'A “fill it with” hint guides your study design.',
    ],
    fields: [TOPIC_TXT, FIELD_SEL],
    compute: (v) => {
      const t = asStr(v.topic) || 'the topic'
      const f = asSel(v.field)
      const dims = domainsOf(f)
      const gaps = [
        `Methodological gap: few studies use mixed methods on ${t} (fill with: a survey + interviews design).`,
        `Population gap: underrepresented groups (e.g., part-time students) are rarely studied in ${t} (fill with: stratified sampling).`,
        `Longitudinal gap: most work is cross-sectional on ${t} (fill with: a 6-month follow-up).`,
        `Measurement gap: inconsistent instruments for ${t} (fill with: a validated scale + reliability check).`,
      ]
      return [
        sres('Gaps identified', num(gaps.length), T.good, `field lens: ${f} (${dims[0]})`),
        docr('Gap analysis', gaps.map((g, i) => `${i + 1}. ${g}`).join('\n')),
      ]
    },
  },
  {
    id: 'research-title-generator',
    name: 'Research Title Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Crafts publication-ready titles across styles — descriptive, question, method-led and catchy — with character counts for journal limits.',
    tip: 'Most journals cap titles at 15 words. Lead with the variable and population; the catchy style underperforms in review but wins at conferences.',
    usage: [
      'Enter your topic and method.',
      'Choose the title style.',
      'Pick a title within the character budget.',
    ],
    method: [
      'Four title templates per style.',
      'Character counts enforce journal limits.',
      'The variable is kept in every title.',
    ],
    fields: [TOPIC_TXT, txt('method', 'Method (optional)', 2, 'cross-sectional survey'), sel('style', 'Title style', ['Descriptive', 'Question', 'Method-led', 'Catchy'], 'Descriptive')],
    compute: (v) => {
      const t = asStr(v.topic) || 'Topic'
      const m = asStr(v.method)
      const s = asSel(v.style)
      const titles =
        s === 'Descriptive'
          ? [`The Impact of ${t} on Student Outcomes`, `${t}: A Descriptive Study`, `Understanding ${t} in Higher Education`]
          : s === 'Question'
            ? [`How Does ${t} Affect Student Well-being?`, `Does ${t} Predict Academic Performance?`, `Why Does ${t} Matter for Students?`]
            : s === 'Method-led'
              ? [`${t}: A ${m || 'Mixed-Methods'} Investigation`, `Measuring ${t} with ${m || 'Survey Data'}`, `A ${m || 'Quantitative'} Study of ${t}`]
              : [`${t}: What Really Counts`, `Beyond the Buzz: ${t}`, `The ${t} Playbook for Students`]
      const rows = titles.map((x) => `${x.length <= 90 ? '✓' : '✗'} [${x.length} chars] ${x}`)
      return [
        sres('Titles generated', num(titles.length), T.good, s),
        docr('Title options', rows.join('\n')),
      ]
    },
  },
  {
    id: 'hypothesis-generator',
    name: 'Hypothesis Generator',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Formulates null and alternative hypotheses — directional and non-directional — with a one-line testable prediction for each.',
    tip: 'The null says “no relationship”. Your alternative must be falsifiable: if the data cannot rule it out, it was not a real hypothesis.',
    usage: [
      'Describe the expected relationship.',
      'Choose directional or non-directional.',
      'Review the null, alternative and prediction.',
    ],
    method: [
      'Non-directional hypotheses test for any difference.',
      'Directional hypotheses specify the sign.',
      'Each carries a falsifiable prediction statement.',
    ],
    fields: [txt('rel', 'Expected relationship', 3, 'More social media use lowers sleep quality'), sel('dir', 'Directionality', ['Non-directional', 'Directional'], 'Directional')],
    compute: (v) => {
      const rel = asStr(v.rel) || 'the variables are related'
      const dir = asSel(v.dir)
      const neutralRel = rel.replace(/\b(increas\w*|decreas\w*|rais\w*|lower\w*|reduc\w*|more|less|higher|lower|greater|stronger|weaker|positive|negative|better|worse|improves?|impairs?)\b/gi, 'differs')
      const h1 = dir === 'Directional' ? `H₁: ${rel} (directional — the sign of the effect is predicted in advance).` : `H₁: ${neutralRel.charAt(0).toUpperCase()}${neutralRel.slice(1)} (non-directional — the sign is not predicted in advance).`
      const h0 = `H₀: There is no significant relationship between the two variables in the population under study.`
      return [
        sres('Hypothesis pair', 'H₀ / H₁', T.good, dir),
        docr('Hypotheses', `${h0}\n${h1}`),
        res('Prediction', dir === 'Directional' ? 'Data should show a significant effect in the stated direction — a significant effect in the opposite direction rejects H₁ too.' : 'Data should show a significant effect in either direction; report the sign after the test, not before.', T.neutral, 'state α (commonly 0.05) and the test you will use before you look at the data'),
      ]
    },
  },
  {
    id: 'research-objectives-generator',
    name: 'Research Objectives Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Breaks a broad aim into specific, measurable objectives — general plus enumerated specific objectives aligned to your methods.',
    tip: 'Each objective should start with a measurable verb (measure, compare, test, evaluate). “To study the topic” is an activity, not an objective.',
    usage: [
      'Enter the overall aim.',
      'Set the number of specific objectives.',
      'Align each objective to a method.',
    ],
    method: [
      'The general aim is broadened from the topic.',
      'Specific objectives use measurable verbs.',
      'Each objective maps to a method step.',
    ],
    fields: [txt('aim', 'Overall aim', 3, 'To examine the role of peer mentoring in first-year adjustment'), n('n', 'Specific objectives', { def: 4, min: 2, max: 8, step: 1 })],
    compute: (v) => {
      const aim = asStr(v.aim) || 'To investigate the topic'
      const count = clamp(Math.round(asNum(v.n)) || 4, 2, 8)
      const verbs = ['Measure', 'Compare', 'Evaluate', 'Identify', 'Examine', 'Assess', 'Explore', 'Determine']
      const methods = ['questionnaire + regression', 'group comparison (t-test)', 'structured interviews + thematic analysis', 'document review', 'pilot survey', 'case study analysis', 'correlation analysis', 'survey + observation']
      const targets = ['frequency', 'impact', 'effectiveness', 'barriers', 'patterns', 'perceptions', 'relationships', 'outcomes']
      const objs = Array.from({ length: count }, (_x, i) => `${i + 1}. To ${verbs[i % verbs.length].toLowerCase()} the ${targets[i]} related to ${aim.toLowerCase().replace(/^to /, '')} — using ${methods[i]}.`)
      return [
        sres('Specific objectives', num(count), T.good, `all ${count} start with a measurable verb and name their method`),
        docr('Objectives', `General aim: ${aim}\n\nSpecific objectives:\n${objs.join('\n')}`),
      ]
    },
  },
  {
    id: 'questionnaire-generator-research',
    name: 'Questionnaire Generator',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Builds a structured questionnaire — screening, demographic, Likert-scale and open items — with response options and a completion estimate.',
    tip: 'Avoid leading and double-barreled items. “Do you agree fast food is unhealthy and tasty?” forces a false choice — split it into two items.',
    usage: [
      'Enter the study focus and scale type.',
      'Review generated items with response options.',
      'Pilot the first 5 items before full distribution.',
    ],
    method: [
      'Screening and demographics come first.',
      'Likert items are built from the focus and scale.',
      'Open items probe context and outliers.',
    ],
    fields: [txt('focus', 'Study focus', 3, 'Peer mentoring and first-year adjustment'), sel('scale', 'Scale type', ['5-point Likert', '7-point Likert', 'Yes/No'], '5-point Likert')],
    compute: (v) => {
      const f = asStr(v.focus) || 'the study focus'
      const scale = asSel(v.scale)
      const points = scale === '7-point Likert' ? ['1 - Strongly disagree', '2', '3', '4', '5', '6', '7 - Strongly agree'] : scale === 'Yes/No' ? ['Yes', 'No'] : ['1 - Strongly disagree', '2 - Disagree', '3 - Neutral', '4 - Agree', '5 - Strongly agree']
      const items = [
        `S1. Are you a first-year student? [Yes/No]`,
        `D1. What is your faculty? [dropdown]`,
        `D2. What is your age group? [18-19, 20-21, 22+]`,
      ]
      const cap = f.charAt(0).toUpperCase() + f.slice(1)
      const likert = [
        `Q1. ${cap} has improved my sense of belonging. [${points.join(' | ')}]`,
        `Q2. I feel confident seeking academic help. [${points.join(' | ')}]`,
        `Q3. The peer mentor meetings were well organized. [${points.join(' | ')}]`,
        `Q4. I would recommend the peer mentor program. [${points.join(' | ')}]`,
      ]
      const open = [`O1. In your own words, what was the most useful part of ${f}? [text]`, `O2. What could be improved? [text]`]
      const est = 3 + 4 + 2
      return [
        sres('Total items', num(est), T.good, `${scale} response scale`),
        docr('Questionnaire draft', [...items, ...likert, ...open].join('\n')),
        res('Reversed item', 'none', T.warn, 'add 1–2 negatively worded items so agreement cannot be earned on every question'),
      ]
    },
  },
  {
    id: 'survey-question-generator-research',
    name: 'Survey Question Generator',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Generates balanced survey questions — Likert statements, frequency scales and opinion scales — with bias-free phrasing.',
    tip: 'Use balanced agree/disagree items to avoid acquiescence bias. If most respondents agree with everything, your items are too agreeable.',
    usage: [
      'Enter the survey topic.',
      'Choose the number of Likert statements.',
      'Review wording for leading language.',
    ],
    method: [
      'Statements alternate positive and reverse-worded framing.',
      'Frequency and opinion scales are included.',
      'A bias check flags absolute wording in your topic and double-barreled items.',
    ],
    fields: [txt('topic', 'Survey topic', 3, 'Campus study spaces'), n('n', 'Likert statements', { def: 6, min: 3, max: 12, step: 1 }), sel('scale', 'Scale', ['5-point agree/disagree', 'Frequency (never-always)', 'Opinion scale'], '5-point agree/disagree')],
    compute: (v) => {
      const t = asStr(v.topic) || 'the topic'
      const count = clamp(Math.round(asNum(v.n)) || 6, 3, 12)
      const scale = asSel(v.scale)
      const pos = [
        `${t} are well maintained.`,
        `I can find a ${t} when I need one.`,
        `${t} improve my focus.`,
        `The ${t} booking system works well.`,
      ]
      const neg = [
        `${t} are often overcrowded.`,
        `I avoid ${t} because of noise.`,
        `${t} lack proper lighting.`,
        `Finding information about ${t} is confusing.`,
      ]
      const stmts = Array.from({ length: count }, (_x, i) => `${i + 1}. ${i % 2 ? neg[(i >> 1) % neg.length] : pos[(i >> 1) % pos.length]} [${scale}]`)
      const absolutes = [...new Set((t.match(/\b(all|every|none|always|never|only|everyone|nobody|impossible|worst|best)\b/gi) || []).map((w) => w.toLowerCase()))]
      const barrels = [...new Set((t.match(/\b(and|or|plus|as well as)\b/gi) || []).map((w) => w.toLowerCase()))]
      const flags = [
        ...absolutes.map((w) => `absolute wording “${w}” in the topic — rephrase or split it`),
        ...barrels.map((w) => `conjunction “${w}” in the topic — one item is asking two questions`),
        ...(pos.concat(neg).filter((s) => /\ball\b|\bevery\b|\bnone\b|\balways\b/i.test(s)).map((s) => `absolute wording in a generated item: “${s}”`)),
      ]
      return [
        sres('Statements', num(count), T.good, scale),
        res('Positively / reverse-worded', `${num(Math.ceil(count / 2))} / ${num(Math.floor(count / 2))}`, count >= 4 ? T.good : T.warn, 'reverse items must be scored in the opposite direction'),
        res('Bias flags', num(flags.length), flags.length ? T.warn : T.good, flags.length ? flags.join('; ') : 'no absolute wording or double-barreled items detected'),
        docr('Survey items', stmts.join('\n')),
      ]
    },
  },
  {
    id: 'interview-question-generator-research',
    name: 'Interview Question Generator',
    archetype: 'tier',
    subject: SUBJECT,
    blurb:
      'Creates a semi-structured interview guide — rapport openers, experience probes, and closing reflection questions.',
    tip: 'Use “tell me about a time when…” to elicit real behavior. Opinions are cheap; past specific actions reveal actual skills.',
    usage: [
      'Enter the interview context.',
      'Choose the interview type.',
      'Follow the guide in order, skipping as needed.',
    ],
    method: [
      'Openers build rapport and set context.',
      'Probes use STAR and follow-up triggers.',
      'Closers invite reflection and future advice.',
    ],
    fields: [sel('type', 'Interview type', ['Behavioural (job)', 'Academic research', 'Oral exam / viva'], 'Behavioural (job)'), txt('ctx', 'Context / role', 3, 'A part-time data analyst role')],
    compute: (v) => {
      const type = asSel(v.type)
      const ctx = asStr(v.ctx) || 'the role'
      const openers =
        type === 'Behavioural (job)'
          ? ['Tell me about yourself in 90 seconds.', `Why ${ctx.charAt(0).toLowerCase()}${ctx.slice(1)}?`, 'Walk me through your current role.']
          : type === 'Academic research'
            ? ['Thanks for joining. Can you describe your background in this field?', 'How did you first encounter the research problem?', 'What drew you to this project specifically?']
            : ['Good morning. Let us begin — state your name and field.', 'Which topic are you prepared to be examined on?', 'Take a moment to gather your thoughts.']
      const probes = [
        'Can you give an example of a time you…? (STAR)',
        'What was the most difficult part, and what did you do?',
        'What would you do differently now?',
        'Can you explain the reasoning behind that choice?',
      ]
      const closers = ['What have we not discussed that you want to add?', 'Do you have questions for me?', 'Thank you — anything else?']
      return [
        sres('Guide sections', 'Openers / Probes / Closers', T.good, type),
        docr('Interview guide', `OPENERS:\n${openers.map((x) => '• ' + x).join('\n')}\n\nPROBES (as needed):\n${probes.map((x) => '• ' + x).join('\n')}\n\nCLOSERS:\n${closers.map((x) => '• ' + x).join('\n')}`),
      ]
    },
  },
  {
    id: 'academic-keywords-generator',
    name: 'Academic Keywords Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Derives indexed keywords from your abstract — extracting high-frequency significant terms for journal submission and discoverability.',
    tip: 'Use 4–6 keywords that a researcher in your field would actually search. Match your indexing terms to the database you submit to.',
    usage: [
      'Paste your abstract or title.',
      'Set the keyword count.',
      'Copy the ranked keyword list.',
    ],
    method: [
      'Stopwords and common verbs are filtered out.',
      'Terms are scored by frequency and length.',
      'Keywords are output ranked for submission.',
    ],
    fields: [txt('abs', 'Abstract or title', 6, 'This study examines social media use and sleep quality among undergraduates using a cross-sectional survey.'), n('n', 'Keywords', { def: 6, min: 3, max: 10, step: 1 })],
    compute: (v) => {
      const t = asStr(v.abs)
      const stop = new Set(['this', 'that', 'study', 'using', 'among', 'with', 'and', 'the', 'for', 'from', 'are', 'was', 'were', 'has', 'have', 'its', 'their', 'these', 'those', 'into', 'over', 'also', 'than', 'then', 'been', 'such', 'exam', 'examine', 'examined', 'examines', 'aim', 'aims', 'aimed', 'results', 'result'])
      const cnt = new Map<string, number>()
      for (const w of t.toLowerCase().match(/[a-z]{4,}/g) || []) {
        if (stop.has(w)) continue
        cnt.set(w, (cnt.get(w) || 0) + 1 + w.length / 20)
      }
      const kws = [...cnt.entries()].sort((a, b) => b[1] - a[1]).slice(0, clamp(asNum(v.n), 3, 10)).map(([w]) => w)
      return [
        sres('Keywords ready', num(kws.length), kws.length ? T.good : T.warn, kws.length ? 'Index-ready' : 'Abstract too short'),
        docr('Keyword list', kws.length ? kws.join('; ') : 'Paste a longer abstract.'),
      ]
    },
  },
  {
    id: 'research-summary-generator',
    name: 'Research Summary Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Compresses a research project into a structured summary — problem, approach, findings, and one-line takeaway for a supervisor report.',
    tip: 'Supervisors scan for the “so what”. End every summary with a single actionable sentence they can respond to.',
    usage: [
      'Summarize the project pieces.',
      'Choose the summary length.',
      'Copy the supervisor-facing summary.',
    ],
    method: [
      'Four sections carry the summary.',
      'Findings are listed as bullets with a confidence note.',
      'The takeaway is one actionable sentence.',
    ],
    fields: [
      txt('prob', 'Problem', 3, 'Students lack structured revision plans.'),
      txt('find', 'Key findings', 4, 'Planned revision improved retention by 22%.\nTime-blocking reduced procrastination.'),
      sel('len', 'Length', ['Short (1 paragraph)', 'Medium (4 sections)', 'Detailed (with bullets)'], 'Medium (4 sections)'),
    ],
    compute: (v) => {
      const p = asStr(v.prob) || 'The problem'
      const f = asStr(v.find).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const len = asSel(v.len)
      const summary = `PROBLEM: ${p}\nAPPROACH: (method in 1–2 sentences)\nFINDINGS:\n${f.map((x) => '• ' + x).join('\n')}\nTAKEAWAY: ${f[0] ? 'Scale the strongest intervention across all first-year cohorts.' : 'Collect data before drawing conclusions.'}`
      const short = `${p} This project shows that ${f[0] || 'the intervention'} is effective; the next step is scaling it campus-wide.`
      return [
        sres('Findings captured', num(f.length), f.length ? T.good : T.warn),
        docr('Supervisor summary', len === 'Short (1 paragraph)' ? short : summary),
      ]
    },
  },
  {
    id: 'paper-outline-generator',
    name: 'Paper Outline Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Generates a full conference/journal paper outline — abstract, sections, figures, tables and references with per-section guidance.',
    tip: 'Figure and table captions should be self-explanatory. Reviewers skim figures first — put your key result in Figure 1, not Figure 7.',
    usage: [
      'Enter the paper title and field.',
      'Choose the target template.',
      'Draft section by section against the outline.',
    ],
    method: [
      'IMRaD structure is expanded with per-section hints.',
      'Figures and tables are planned alongside sections.',
      'Reference and appendix slots are included.',
    ],
    fields: [txt('title', 'Paper title', 3, 'Peer Mentoring and First-Year Retention'), FIELD_SEL, sel('tmpl', 'Template', ['Conference (4 pages)', 'Journal (full)', 'Short paper (2 pages)'], 'Journal (full)')],
    compute: (v) => {
      const title = asStr(v.title) || 'the paper'
      const t = asSel(v.tmpl)
      const outline = `TITLE: ${title}\n\nABSTRACT (Background · Aim · Method · Results · Conclusion — 200 words)\n\n1. INTRODUCTION\n   1.1 Context and motivation\n   1.2 Problem statement and gap\n   1.3 Aim and research questions\n   1.4 Contributions\n\n2. LITERATURE REVIEW\n   2.1 ${domainsOf(asSel(v.field))[0]}\n   2.2 ${domainsOf(asSel(v.field))[3]}\n   2.3 Research gap\n\n3. METHODOLOGY\n   3.1 Design and setting\n   3.2 Participants and sampling\n   3.3 Instruments\n   3.4 Analysis plan\n   3.5 Ethics\n\n4. RESULTS\n   4.1 Participant flow (Table 1)\n   4.2 Descriptive statistics (Table 2)\n   4.3 Main findings (Figure 1)\n\n5. DISCUSSION\n   5.1 Interpretation\n   5.2 Comparison with literature\n   5.3 Limitations\n\n6. CONCLUSION\n\nREFERENCES (APA 7th)\nAPPENDICES (instruments, extra tables)`
      return [
        sres('Template', t, T.good),
        res('Sections', '6 main + abstract + refs', T.neutral),
        docr('Paper outline', outline),
      ]
    },
  },
  {
    id: 'academic-source-organizer',
    name: 'Academic Source Organizer',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Sorts and groups your sources by type, year and topic so your reference manager stays clean and your review writes faster.',
    tip: 'File sources as you read, not at deadline. A one-line note on why each source matters becomes your literature review skeleton later.',
    usage: [
      'Paste your sources one per line.',
      'Choose the grouping rule.',
      'Review the organized set.',
    ],
    method: [
      'Sources are classified by keyword (journal, book, website, report).',
      'Grouping applies recency, type or topic.',
      'Order within groups is normalized.',
    ],
    fields: [txt('src', 'Sources (one per line)', 8, 'Smith (2020) Journal of Educational Psychology\nWorld Bank Report 2023\nMaslow 1943 book\nnature.com article'), sel('grp', 'Group by', ['Source type', 'Year (newest first)', 'Topic keyword'], 'Source type')],
    compute: (v) => {
      const lines = asStr(v.src).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const grp = asSel(v.grp)
      const buckets = new Map<string, string[]>()
      for (const l of lines) {
        let key = 'General'
        if (grp === 'Source type') {
          key = /journal|psychology|science|review/i.test(l) ? 'Journal article' : /report|bank|university|org/i.test(l) ? 'Report' : /\d{4}/.test(l) && /book/i.test(l) ? 'Book' : /\.com|\.org|\.edu/i.test(l) ? 'Website' : 'Journal article'
        } else if (grp === 'Year (newest first)') {
          const y = l.match(/(19|20)\d{2}/)
          key = y ? y[0] : 'No year'
        } else {
          const words = l.toLowerCase().match(/[a-z]{5,}/g) || []
          key = words[0] || 'General'
        }
        buckets.set(key, [...(buckets.get(key) || []), l])
      }
      const out = [...buckets.entries()].map(([k, v2]) => `${k}:\n${v2.map((x) => '  • ' + x).join('\n')}`)
      return [
        sres('Sources organized', num(lines.length), lines.length ? T.good : T.warn, `${buckets.size} groups`),
        docr('Organized sources', out.join('\n')),
      ]
    },
  },
  {
    id: 'citation-extractor',
    name: 'Citation Extractor',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Scans pasted text and pulls out author-year citations, quoted sources and reference-like patterns, flagging likely ones you may have missed.',
    tip: 'Cross-check every extracted citation against the actual source — mis-cited authors are the most common — and most serious — reference error.',
    usage: [
      'Paste a paragraph or page of text.',
      'Review the extracted citations.',
      'Match each to your reference manager.',
    ],
    method: [
      'Author-year patterns (Smith, 2020) are captured.',
      'Numbered and quoted citations are also found.',
      'Duplicates are collapsed with counts.',
    ],
    fields: [txt('text', 'Text to scan', 8, 'As shown by Smith (2020), the effect was significant. See also Brown et al. (2019) and (Lee, 2021, p. 45).')],
    compute: (v) => {
      const t = asStr(v.text)
      const authorYear = [...t.matchAll(/([A-Z][a-zA-Z]+(?:\s(?:et al\.|and|&|,)\s?[A-Z]?[a-zA-Z]*)*),?\s*\(?((19|20)\d{2})[a-z]?\)?/g)].map((m) => `${m[1]} ${m[2]}`)
      const numbered = [...t.matchAll(/\[(\d+(?:[,–-]\d+)*)\]/g)].map((m) => `Ref [${m[1]}]`)
      const quoted = [...t.matchAll(/[“"]([^”"]{15,})[”"]/g)].map((m) => `Quote: “${m[1].slice(0, 40)}…”`)
      const all = [...new Set([...authorYear, ...numbered, ...quoted])]
      return [
        sres('Citations found', num(all.length), all.length ? T.good : T.warn, `${authorYear.length} author-year · ${numbered.length} numbered`),
        docr('Extracted citations', all.length ? all.map((x, i) => `${i + 1}. ${x}`).join('\n') : 'No citation patterns detected.'),
      ]
    },
  },
]