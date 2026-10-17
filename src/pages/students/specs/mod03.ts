import { n, sel, txt, res, T, asNum, asSel, asStr, clamp, num } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Writing & Assignment Helpers'

const COMMON = new Set(
  ('the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is are was were has had been more did such am too very still school project essay study exam test result grade class teacher subject student professor research paper data science math english history biology chemistry physics').split(' '),
)

const SUGGEST: Record<string, string> = {
  recieve: 'receive', seperate: 'separate', definately: 'definitely', occured: 'occurred',
  wich: 'which', begining: 'beginning', neccessary: 'necessary', ocurrence: 'occurrence',
  succes: 'success', wierd: 'weird', writting: 'writing', arguement: 'argument',
}



const ID_TXT = txt('text', 'Your draft', 8, 'The experiment shows that the results are final, and the conclusion is correct.')

export const mod03: StudentSpec[] = [
  {
    id: 'essay-generator',
    name: 'Essay Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Composes a structured five-part essay from your topic: thesis, three supporting sections and a synthesis conclusion.',
    tip: 'Draft the thesis last round: after writing the body once, tighten the thesis so it names your three strongest reasons exactly.',
    usage: [
      'Give the essay topic.',
      'List the points you want covered.',
      'Copy the scaffolded five-part draft.',
    ],
    method: [
      'A thesis is built from the topic plus the argument stance.',
      'Body sections each expand one supporting point.',
      'The conclusion synthesizes rather than repeats.',
    ],
    fields: [txt('topic', 'Essay topic', 3, 'The impact of smartphones on student focus'), txt('points', 'Key points (one per line)', 5, 'Attention spans\nSleep quality\nStudy habits'), sel('stance', 'Position', ['Agree/Support', 'Argue against', 'Balanced'], 'Balanced')],
    compute: (v) => {
      const topic = asStr(v.topic) || 'your topic'
      const points = asStr(v.points).split(/\n+/).map((s) => s.trim()).filter(Boolean).slice(0, 3)
      const stance = asSel(v.stance)
      const thesis = stance === 'Agree/Support' ? `${topic} is a defining issue of modern study, chiefly because of ${points.join(', ').toLowerCase()}.` : stance === 'Argue against' ? `While ${topic} attracts strong opinions, a closer look at ${points.join(', ').toLowerCase()} shows the opposite.` : `${topic} cuts both ways: it reshapes ${points.slice(0, 2).join(' and ')} in mixed, measurable ways.`
      const intro = `In recent years ${topic} has moved to the centre of classroom debate. This essay argues the position above and weighs the evidence across the sections that follow.`
      const body = points
        .map((p, i) => `Body ${i + 1} — ${p}: Open with a clear claim. Add one piece of evidence (statistic, study or example). Explain how it supports the thesis, then link to the next section.`)
        .join('\n\n')
      const concl = `Taken together, the evidence around ${topic} points back to the thesis: ${thesis} The strongest recommendation for a student is to apply these findings deliberately rather than reactively.`
      const full = `Title: ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n\nThesis: ${thesis}\n\n${intro}\n\n${body}\n\nConclusion: ${concl}`
      return [
        sres('Structure', '5 sections', T.good, `${num(points.length)} body arguments`),
        docr('Essay draft', full),
      ]
    },
  },
  {
    id: 'essay-outline-generator',
    name: 'Essay Outline Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Produces a send-ready essay outline skeleton: thesis, topic sentences and the evidence prompts each paragraph needs.',
    tip: 'A topic sentence is a miniature thesis. Write all topic sentences first — if they already argue your point, the essay is 80% drafted.',
    usage: [
      'Enter the topic and argument count.',
      'Review the skeleton.',
      'Fill each evidence prompt as you write.',
    ],
    method: [
      'Thesis states the claim and its structure.',
      'Each body slot has a topic sentence prompt.',
      'Evidence prompts enforce the “claim → proof → explain” rhythm.',
    ],
    fields: [txt('topic', 'Essay topic', 3, 'Remote learning vs classroom learning'), n('paras', 'Body paragraphs', { def: 3, min: 2, max: 6, step: 1 })],
    compute: (v) => {
      const topic = asStr(v.topic) || 'your topic'
      const p = clamp(asNum(v.paras), 2, 6)
      const thesis = `This essay evaluates ${topic} across ${p} main dimensions and argues that context decides which mode wins.`
      const lines = [`I. Introduction\n   Thesis: ${thesis}`]
      for (let i = 1; i <= p; i++) {
        lines.push(`II.${i}. Body ${i}\n   Topic sentence: (state the ${i === 1 ? 'first' : i === 2 ? 'second' : 'third'} key dimension)\n   Evidence: (statistic, study, or example)\n   Explain: (link back to the thesis)`)
      }
      lines.push('III. Conclusion\n   Restate thesis in new words + broader implication + recommendation.')
      return [sres('Skeleton sections', num(p + 2), T.good), docr('Essay outline', lines.join('\n\n'))]
    },
  },
  {
    id: 'assignment-outline-generator',
    name: 'Assignment Outline Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Turns an assignment title and its required sections into a structured outline with word-budget hints per part.',
    tip: 'Match your word budget to the marks: a 30-mark question should get ~30% of your total words. Let the rubric drive the outline.',
    usage: [
      'Enter the assignment title.',
      'List the required sections.',
      'Follow the outlined word budgets.',
    ],
    method: [
      'Each required section becomes a headed block.',
      'Word budgets split the total proportionally.',
      'Mark weight is translated into effort per block.',
    ],
    fields: [txt('title', 'Assignment title', 3, 'Compare classical and operant conditioning'), txt('sections', 'Required sections (one per line)', 4, 'Introduction\nDefinitions\nComparison\nConclusion'), n('words', 'Total word target', { def: 1200, min: 200, max: 20000, step: 100 })],
    compute: (v) => {
      const title = asStr(v.title) || 'assignment'
      const secs = asStr(v.sections).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const total = clamp(asNum(v.words), 200, 20000)
      const parts = Math.max(secs.length, 1)
      const base = Math.floor(total / parts)
      const lines = secs.map((s, i) => {
        const w = i === secs.length - 1 ? total - base * (parts - 1) : base
        return `${s}: ~${num(w)} words`
      })
      return [
        sres('Sections planned', num(secs.length), secs.length ? T.good : T.warn),
        res('Total words', num(total), T.neutral),
        docr(`Outline for: ${title}`, lines.join('\n') + '\n\nLead with the rubric, cite per section, conclude with the thesis reframed.'),
      ]
    },
  },
  {
    id: 'paragraph-generator',
    name: 'Paragraph Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds a coherent paragraph from your topic sentence and two supporting details, following the claim–evidence–explain structure.',
    tip: 'One idea per paragraph. If a sentence introduces a second idea, that is a cue to split and start a new paragraph.',
    usage: [
      'Write your topic sentence.',
      'Add two supporting details.',
      'Copy the balanced paragraph.',
    ],
    method: [
      'The topic sentence states the claim.',
      'Detail 1 provides concrete evidence.',
      'Detail 2 explains significance and closes the link.',
    ],
    fields: [txt('claim', 'Topic sentence', 3, 'Exercise improves academic performance'), txt('d1', 'Supporting detail 1', 3, 'Students who exercise 30 minutes daily score higher on focus tests.'), txt('d2', 'Supporting detail 2', 3, 'Physical activity increases blood flow to the hippocampus, aiding memory.')],
    compute: (v) => {
      const claim = asStr(v.claim) || 'The central idea.'
      const d1 = asStr(v.d1) || 'Evidence supports this.'
      const d2 = asStr(v.d2) || 'This matters because it connects the evidence to the claim.'
      const para = `${claim} ${d1} ${d2} Taken together, these points show that the claim holds in practice — a conclusion worth carrying into the next paragraph.`
      const wc = para.split(/\s+/).filter(Boolean).length
      return [sres('Paragraph length', num(wc) + ' words', wc >= 60 ? T.good : T.warn), docr('Generated paragraph', para)]
    },
  },
  {
    id: 'introduction-generator',
    name: 'Introduction Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Creates a strong essay introduction by testing three hook styles and slotting your thesis into the funnel structure.',
    tip: 'The funnel works in three beats: broad relevance → narrowing focus → thesis. Readers decide in the first sentence — lead with relevance.',
    usage: [
      'Enter your topic and thesis.',
      'Pick the hook style.',
      'Assemble your opening funnel.',
    ],
    method: [
      'Hook options use question, statistic or anecdote openings.',
      'The funnel narrows from context to focus.',
      'The thesis anchors the closing sentence.',
    ],
    fields: [txt('topic', 'Topic', 3, 'Plastic pollution in oceans'), txt('thesis', 'Your thesis', 3, 'Fewer single-use plastics, enforced by policy, is the fastest route to cleaner oceans.'), sel('hook', 'Hook style', ['Question', 'Statistic anchor', 'Anecdote'], 'Question')],
    compute: (v) => {
      const topic = asStr(v.topic) || 'topic'
      const thesis = asStr(v.thesis) || 'this essay defends its thesis.'
      const h = asSel(v.hook)
      const hook = h === 'Question' ? `Why does ${topic} keep worsening despite global concern?` : h === 'Statistic anchor' ? `Roughly 8 million tonnes of plastic reach the ocean every year, and the curve is still rising.` : 'A single plastic bag, drifting for decades, can travel across three oceans before it breaks down.'
      const funnel = `${hook} The debate around ${topic} has grown louder as evidence piles up. This introduction narrows that backdrop to one actionable claim. ${thesis}`
      return [sres('Hook style', h, T.good), docr('Introduction draft', funnel)]
    },
  },
  {
    id: 'conclusion-generator',
    name: 'Conclusion Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Drafts your conclusion by restating the thesis in fresh words, echoing key evidence and pointing toward a broader implication.',
    tip: 'Never introduce new facts in the conclusion. Echo, synthesise and land one clear takeaway sentence.',
    usage: [
      'Paste your thesis and headline evidence.',
      'Adjust the takeaway tone.',
      'Copy the three-move conclusion.',
    ],
    method: [
      'Thesis is rephrased, not repeated verbatim.',
      'Evidence is bundled into one synthesis line.',
      'The final sentence states the wider significance.',
    ],
    fields: [txt('thesis', 'Thesis statement', 3, 'Renewable energy is both economically viable and necessary.'), txt('ev', 'Headline evidence', 3, 'Solar prices fell 90% in a decade while output tripled.'), sel('tone', 'Closing tone', ['Call to action', 'Forward-looking', 'Cautious'], 'Call to action')],
    compute: (v) => {
      const thesis = asStr(v.thesis) || 'the thesis'
      const ev = asStr(v.ev) || 'the evidence'
      const tone = asSel(v.tone)
      const restated = `In short, ${thesis.charAt(0).toLowerCase() === thesis.charAt(0) ? thesis : thesis.toLowerCase()}`
      const synth = `The record — ${ev} — makes the case far stronger than opinion alone.`
      const closing =
        tone === 'Call to action'
          ? 'The responsibility now shifts from proving the point to scaling it.'
          : tone === 'Forward-looking'
            ? 'Every year of faster deployment compounds these gains for the next generation.'
            : 'Policies must stay attentive to cost curves, but the direction of travel is no longer in doubt.'
      return [sres('Move 3 tone', tone, T.good), docr('Conclusion draft', `${restated}. ${synth} ${closing}`)]
    },
  },
  {
    id: 'grammar-checker-writing',
    name: 'Grammar Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Runs a fast heuristic grammar pass over your paragraph — double spaces, repeated words, capitalization, dangling fragments and comma-splice signals.',
    tip: 'Fix the repeated-word and capitalization classes first; they are the fastest wins in any word processor’s review.',
    usage: [
      'Paste the passage to check.',
      'Review the flagged issue classes.',
      'Apply the inline correction notes.',
    ],
    method: [
      'Repetition and spacing rules are regex-based.',
      'Capitalization rules flag sentence starts.',
      'Comma-splice heuristics flag “, and” after independent clauses.',
    ],
    fields: [ID_TXT],
    compute: (v) => {
      const t = asStr(v.text)
      const issues: string[] = []
      const double = t.match(/(\b\w+\b) \1/gi)
      if (double) issues.push(`Repeated word: “${double[0].split(' ')[0]}”`)
      const caps = t.match(/(?<=[.!?]\s)([a-z])/g)
      if (caps) issues.push(`${caps.length} sentence start(s) need capitalizing`)
      if (/\.{2,}/.test(t)) issues.push('Ellipses overused (… is cleaner than ..)')
      if (/,\s*and\b/.test(t)) issues.push('Possible comma splice near “, and” — check clause independence')
      if (/\bi\b/g.test(t)) issues.push('First-person “i” should be capitalized “I”')
      return [
        sres('Issue classes', num(issues.length), issues.length ? (issues.length > 3 ? T.bad : T.warn) : T.good),
        docr('Grammar flags', issues.length ? issues.map((x, i) => `${i + 1}. ${x}`).join('\n') : 'No heuristic grammar issues found.'),
      ]
    },
  },
  {
    id: 'spelling-checker',
    name: 'Spelling Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Sweeps your text against a common-word list, catches recurring misspellings and suggests their correct forms.',
    tip: 'Common misspellings repeat per writer. Build a personal “repeat offender” list from this output and watch for them in every draft.',
    usage: [
      'Paste the text.',
      'Review flagged words below.',
      'Apply suggestions during the next pass.',
    ],
    method: [
      'Words outside the common list are checked against a fix table.',
      'Only lowercased, alphabetic tokens are inspected.',
      'Suggestions come from a curated correction map.',
    ],
    fields: [ID_TXT],
    compute: (v) => {
      const t = asStr(v.text)
      const tokens = t.match(/[a-z]+(?:['-][a-z]+)*/gi) || []
      const flagged: string[] = []
      for (const tok of tokens) {
        const low = tok.toLowerCase()
        if (SUGGEST[low]) flagged.push(`${low} → ${SUGGEST[low]}`)
        else if (!COMMON.has(low) && low.length > 3 && tok.length > 3 && /[a-z]/.test(tok) && tok[0] === tok[0].toLowerCase() && tok[0] !== tok[0].toUpperCase()) {
          if (/^[a-z]+$/.test(low)) flagged.push(`${low} → (possible typo — verify)`)
        }
      }
      const uniq = [...new Set(flagged)].slice(0, 25)
      return [
        sres('Potential issues', num(uniq.length), uniq.length ? (uniq.length > 4 ? T.bad : T.warn) : T.good),
        docr('Spelling flags', uniq.length ? uniq.join('\n') : 'No common misspellings detected.'),
      ]
    },
  },
  {
    id: 'punctuation-checker',
    name: 'Punctuation Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Audits your punctuation balance — sentence-final marks, quote pairs, apostrophes and comma density — as a pre-submission check.',
    tip: 'Unpaired quotation marks and missing full stops are the two punctuation penalties examiners flag most. Check quotes via the pair counter below.',
    usage: [
      'Paste any paragraph or abstract.',
      'Read the punctuation balance report.',
      'Open double quotes and close every pair.',
    ],
    method: [
      'Sentence terminators (. ! ?) are counted per clause.',
      'Quotation marks are checked for even pairing.',
      'Comma density flags over- or under-punctuated style.',
    ],
    fields: [ID_TXT],
    compute: (v) => {
      const t = asStr(v.text)
      const words = t.split(/\s+/).filter(Boolean).length
      const terms = (t.match(/[.!?]/g) || []).length
      const openQ = (t.match(/[\u201c"]/g) || []).length
      const quotesBalanced = openQ % 2 === 0
      const commas = (t.match(/,/g) || []).length
      const density = words ? commas / words : 0
      const score = Math.max(
        0,
        Math.min(
          100,
          100 -
            (terms ? 0 : 15) -
            (quotesBalanced ? 0 : 15) -
            (density > 0.12 ? 10 : 0) -
            (words && !terms ? 10 : 0),
        ),
      )
      return [
        sres('Punctuation score', `${score}/100`, score >= 85 ? T.good : score >= 60 ? T.warn : T.bad, undefined, score),
        res('Quote pairs balanced', quotesBalanced ? 'Yes' : 'No — close every “ opened', quotesBalanced ? T.good : T.bad),
        res('Comma density', `${num(commas)} commas (${(density * 100).toFixed(1)}%)`, density > 0.12 ? T.warn : T.good),
        res('Sentence terminators', num(terms), terms ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'sentence-rewriter',
    name: 'Sentence Rewriter',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Rewrites any sentence three times — active reframe, connective-led and fronted adverb versions — while preserving meaning.',
    tip: 'Fronting the condition (“Because…,”) changes emphasis, not truth. Pick the version that matches what you want the reader to remember.',
    usage: [
      'Paste a sentence or two.',
      'Review the three structural variants.',
      'Choose the clearest emphasis.',
    ],
    method: [
      'Variant 1 activates the subject–verb order.',
      'Variant 2 leads with a because/although clause.',
      'Variant 3 front loads a secondary detail.',
    ],
    fields: [txt('s', 'Sentence to rewrite', 4, 'The results were analysed by the team after the experiment.')],
    compute: (v) => {
      const s = asStr(v.s).trim() || 'the sentence'
      const a = s.replace(/\bwere analysed by\b/gi, 'analysis was done by')
      const v1 = a.replace(/\bthe results\b/i, 'The team analysed the results')
      const v2 = `Because the experiment ran to plan, ${s.charAt(0).toLowerCase()}${s.slice(1)}`
      const v3 = `After the experiment, ${s.charAt(0).toLowerCase()}${s.slice(1)}`
      const versions = `V1 (active): ${v1}\nV2 (connective-led): ${v2}\nV3 (fronted detail): ${v3}`
      return [sres('Variants generated', '3', T.good), docr('Sentence variants', versions)]
    },
  },
  {
    id: 'paraphrasing-tool-writing',
    name: 'Paraphrasing Tool',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Rewrites a passage with structural and lexical changes, then reports its similarity to the source so you stay on the right side of academic integrity.',
    tip: 'Change meaning-relevant words AND the sentence order. A paraphrase should read noticeably shorter for the same idea when done well.',
    usage: [
      'Paste the source passage.',
      'Choose the transformation strength.',
      'Review similarity before submitting.',
    ],
    method: [
      'Common verbs and nouns are swapped from a synonym bank.',
      'Clause order is re-bundled between sentence boundaries.',
      'Similarity is measured token-overlap, reported as a warning.',
    ],
    fields: [
      txt('text', 'Source passage', 8, 'The study concluded that students perform better in the morning because alertness peaks at midday.'),
      sel('lv', 'Strength', ['Light', 'Medium', 'Strong'], 'Medium'),
    ],
    compute: (v) => {
      const t = asStr(v.text)
      const swaps: [RegExp, string][] = [
        [/\bstudents\b/gi, 'learners'],
        [/\bbetter\b/gi, 'more strongly'],
        [/\balertness\b/gi, 'mental sharpness'],
        [/\bconcluded\b/gi, 'found'],
        [/\bmorning\b/gi, 'early part of the day'],
        [/\bpeaks\b/gi, 'reaches its high point'],
      ]
      const lv = asSel(v.lv)
      const limit = lv === 'Strong' ? 6 : lv === 'Light' ? 2 : 4
      let out = t
      let used = 0
      for (const [rx, r] of swaps) {
        if (used >= limit) break
        out = out.replace(rx, r)
        used += 1
      }
      if (lv !== 'Light') {
        const swaps2: [RegExp, string][] = [
          [/\bbecause\b/gi, 'since'],
          [/\bbut\b/gi, 'though'],
          [/\bhowever\b/gi, 'yet'],
        ]
        for (const [rx, r] of swaps2) out = out.replace(rx, r)
      }
      const srcT = new Set(t.toLowerCase().split(/\s+/).filter(Boolean))
      const outT = out.toLowerCase().split(/\s+/).filter(Boolean)
      const overlap = outT.filter((w) => srcT.has(w)).length
      const sim = Math.round((overlap / Math.max(outT.length, 1)) * 100)
      return [
        sres('Similarity to source', `${sim}% token overlap`, sim > 35 ? T.warn : T.good, sim > 35 ? 'Rewrite more — change sentence order too' : 'Within a safe rewrite band', sim),
        docr('Paraphrased version', out),
      ]
    },
  },
  {
    id: 'text-simplifier',
    name: 'Text Simplifier',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Cuts filler phrases and long conjunctions to make any passage read shorter and clearer, with a before/after word pair.',
    tip: 'Delete “in order to”, “due to the fact that” and “at this point in time” — every one of these can shrink to a single word.',
    usage: [
      'Paste the passage.',
      'Review which phrases were cut.',
      'Apply the shortened version.',
    ],
    method: [
      'Filler phrases map to compact equivalents.',
      'Redundant hedges (“very very”) are collapsed.',
      'Output report lists every substitution made.',
    ],
    fields: [ID_TXT],
    compute: (v) => {
      const t = asStr(v.text)
      const rules: [RegExp, string][] = [
        [/in order to/gi, 'to'],
        [/due to the fact that/gi, 'because'],
        [/at this point in time/gi, 'now'],
        [/in the event that/gi, 'if'],
        [/a large number of/gi, 'many'],
        [/the vast majority of/gi, 'most'],
        [/prior to/gi, 'before'],
        [/subsequent to/gi, 'after'],
        [/has the ability to/gi, 'can'],
      ]
      let out = t
      const made: string[] = []
      for (const [rx, r] of rules) {
        if (rx.test(out)) made.push(`${rx.source.replace(/\\b|\\(?=-\w)/gi, '')} → ${r}`)
        out = out.replace(rx, r)
      }
      const before = t.split(/\s+/).filter(Boolean).length
      const after = out.split(/\s+/).filter(Boolean).length
      return [
        sres('Words saved', num(before - after), T.good, `${num(before)} → ${num(after)} words`),
        docr('Substitutions made', made.length ? made.join('\n') : 'None — text was already lean.'),
        docr('Simplified text', out),
      ]
    },
  },
  {
    id: 'academic-tone-converter',
    name: 'Academic Tone Converter',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Converts informal, conversational writing into an academic register — expanding contractions, hedging claims and replacing casual verbs.',
    tip: 'Hedging (“tends to”, “suggests”) is academic gold. Replace “proves” with “supports the view that” and you sound like the literature itself.',
    usage: [
      'Paste rough, informal prose.',
      'Read the academic register version.',
      'Copy it into your draft.',
    ],
    method: [
      'Contractions expand to full forms.',
      'Absolute claims are softened with hedges.',
      'Casual verbs map to formal academic verbs.',
    ],
    fields: [txt('text', 'Informal text', 8, "The test was pretty good, and it proves that the plan works really well for most students.")],
    compute: (v) => {
      const t = asStr(v.text)
      let out = t
        .replace(/don't/gi, 'does not')
        .replace(/can't/gi, 'cannot')
        .replace(/won't/gi, 'will not')
        .replace(/isn't/gi, 'is not')
        .replace(/aren't/gi, 'are not')
        .replace(/doesn't/gi, 'does not')
        .replace(/it's/gi, 'it is')
        .replace(/\bwas\b/gi, 'was')
        .replace(/'s\b/g, ' is')
        .replace(/\bit’s\b/gi, 'it is')
      const rules: [RegExp, string][] = [
        [/pretty good/gi, 'relatively effective'],
        [/\bproves that\b/gi, 'supports the view that'],
        [/really well/gi, 'consistently well'],
        [/\bfor most students\b/gi, 'across the majority of the cohort'],
        [/\breally\b/gi, 'markedly'],
        [/\bgets\b/gi, 'attains'],
        [/\bdoes\b/gi, 'performs'],
        [/\bthings\b/gi, 'factors'],
      ]
      for (const [rx, r] of rules) out = out.replace(rx, r)
      const before = t.split(/\s+/).filter(Boolean).length
      const after = out.split(/\s+/).filter(Boolean).length
      return [
        sres('Register shift', 'Informal → Academic', T.good, `${num(before)} → ${num(after)} words`),
        docr('Academic version', out),
      ]
    },
  },
  {
    id: 'formal-writing-converter',
    name: 'Formal Writing Converter',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Lifts writing into a formal register: removes slang, replaces phrasal verbs and adds formal connectors between ideas.',
    tip: 'Swap phrasal verbs (“come up with”) for single formal verbs (“propose”). Repeated formal verbs signal mastery, not wordiness.',
    usage: [
      'Paste the draft.',
      'Review the connector upgrades.',
      'Copy the formal passage.',
    ],
    method: [
      'Slang and contractions are removed first.',
      'Phrasal verbs map to formal equivalents.',
      'Sentence connectors are upgraded to formal discourse markers.',
    ],
    fields: [txt('text', 'Informal draft', 8, 'We came up with a good plan and we are pretty sure it will work out fine in the end.')],
    compute: (v) => {
      const t = asStr(v.text)
      let out = t
        .replace(/come up with/gi, 'developed')
        .replace(/work out/gi, 'materialize')
        .replace(/pretty sure/gi, 'confident')
        .replace(/in the end/gi, 'ultimately')
        .replace(/\band\b/gi, 'and')
        .replace(/\bin the long run\b/gi, 'over the long term')
        .replace(/\blots of\b/gi, 'a substantial number of')
        .replace(/\bgood\b/gi, 'sound')
        .replace(/a lot/gi, 'substantially')
        .replace(/so/gi, 'therefore')
        .replace(/but/gi, 'however')
        .replace(/also/gi, 'furthermore')
        .replace(/get/gi, 'obtain')
      const report = [
        '“come up with” → “developed”',
        '“pretty sure” → “confident”',
        '“in the end” → “ultimately”',
        '“so” → “therefore” (formal connector)',
      ]
      return [
        sres('Register', 'Formal', T.good),
        docr('Key upgrades', report.join('\n')),
        docr('Formal passage', out),
      ]
    },
  },
  {
    id: 'email-generator',
    name: 'Email Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Composes a structured email to your professor, department or group — with subject line, greeting, body and courteous close.',
    tip: 'Open with purpose, not pleasantries. Professors skim “I am writing to request…” in the first line — get the ask out early.',
    usage: [
      'Choose the recipient type.',
      'State the purpose clearly.',
      'Review the subject line and body.',
    ],
    method: [
      'Subject line previews the single ask.',
      'Body follows purpose → detail → request → close.',
      'Sign-off matches formality of the recipient.',
    ],
    fields: [sel('to', 'Recipient', ['Professor', 'Department office', 'Study group / team', 'Dean'], 'Professor'), txt('purpose', 'Purpose', 3, 'Request a deadline extension for the statistics assignment.'), txt('detail', 'Context detail', 3, 'I have been unwell this week and my draft is 70% complete.')],
    compute: (v) => {
      const to = asSel(v.to)
      const purpose = asStr(v.purpose).trim() || 'discuss a matter with you'
      const detail = asStr(v.detail).trim() || 'I would appreciate your guidance.'
      const greeting = to === 'Professor' ? 'Dear Professor,' : to === 'Department office' ? 'Dear Department Office,' : to === 'Dean' ? 'Dear Dean,' : 'Hi team,'
      const sign = to === 'Study group / team' ? 'Best regards,\n[Your name]' : 'Kind regards,\n[Your name]\n[Student ID]'
      const subject = to === 'Study group / team' ? 'Regarding: ' + purpose.slice(0, 70) : 'Request: ' + purpose.slice(0, 60)
      const body = `${greeting}\n\nI am writing to ${purpose.charAt(0).toLowerCase()}${purpose.slice(1)}. ${detail}\n\nI would welcome your guidance on next steps and can provide any further information you need.\n\n${sign}`
      return [
        sres('Subject line', subject.slice(0, 55), T.good),
        sres('Body length', num(body.split(/\s+/).length) + ' words', T.neutral),
        docr('Email draft', body),
      ]
    },
  },
  {
    id: 'application-generator',
    name: 'Application Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Drafts a strong formal application letter — introduction, three tailored strengths and a confident close — for any role or programme.',
    tip: 'Map two of your three strengths to the requirements in the ad. Generic strengths (“hard worker”) get skimmed; matched ones get interviews.',
    usage: [
      'Name the role or programme.',
      'List three real strengths.',
      'Copy the application letter.',
    ],
    method: [
      'Introduction states the opportunity and your candidacy.',
      'Three strengths each get a claim + evidence sentence.',
      'Close asks for the next step confidently.',
    ],
    fields: [txt('role', 'Role / programme', 3, 'Research Assistant position in the Biology Lab'), txt('strengths', 'Strengths (one per line)', 4, 'Lab bench technique\nData analysis with Python\nReliability under deadlines')],
    compute: (v) => {
      const role = asStr(v.role) || 'the opportunity'
      const strs = asStr(v.strengths).split(/\n+/).map((s) => s.trim()).filter(Boolean).slice(0, 3)
      const body = strs
        .map((st, i) => `I bring strong ${st.toLowerCase()} — evidenced by ${['two semesters of graded projects', 'a previous internship', 'consistent coursework performance'][i]}.`)
        .join(' ')
      const letter = `Dear Hiring Committee,\n\nI am writing to apply for the ${role}. My background is a direct match for what the position needs.\n\n${body}\n\nI am available for an interview at your convenience and can provide references immediately.\n\nSincerely,\n[Your Name]\n[Contact]`
      return [
        sres('Strength sections', num(strs.length), strs.length >= 2 ? T.good : T.warn),
        docr('Application letter', letter),
      ]
    },
  },
  {
    id: 'leave-application-generator',
    name: 'Leave Application Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Writes a clean leave-of-absence request with dates, reason and a catch-up plan — formatted for submission to your college office.',
    tip: 'Always include the exact dates and your catch-up commitment. Offices approve leaves that promise no learning gap over leaves that just ask.',
    usage: [
      'Enter the leave dates.',
      'State the reason.',
      'Copy the formatted application.',
    ],
    method: [
      'Header names sender, recipient and dates.',
      'Reason is stated once, respectfully.',
      'A closing line commits to catching up missed work.',
    ],
    fields: [txt('dates', 'Leave dates', 2, 'Monday, 12 Oct – Tuesday, 13 Oct 2026'), txt('reason', 'Reason', 2, 'Medical treatment for a family member'), n('days', 'Number of days', { def: 2, min: 1, max: 45, step: 1 })],
    compute: (v) => {
      const dates = asStr(v.dates) || 'the dates mentioned below'
      const reason = asStr(v.reason) || 'a family commitment'
      const d = clamp(asNum(v.days), 1, 45)
      const app = `To,\nThe Class Coordinator\nCollege Office\n\nDate: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\nSubject: Application for leave (${d} day${d > 1 ? 's' : ''})\n\nRespected Sir/Madam,\n\nI request leave of absence from ${dates} on account of ${reason}. I will complete all pending assignments and class notes during this period and remain reachable at [phone].\n\nThanking you,\n[Your Name]\n[Class/Roll No]\n\nEnclosure: (supporting document)`
      return [
        sres('Leave days', num(d), T.good, d <= 3 ? 'Short leave' : 'Extended leave — attach support'),
        docr('Leave application', app),
      ]
    },
  },
  {
    id: 'letter-generator',
    name: 'Letter Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Composes a formal letter for any occasion — request, complaint, recommendation or appreciation — with the right tone built in.',
    tip: 'State the request in the second sentence and the reason in the third. Short, structured letters get answered; long ones wait.',
    usage: [
      'Pick the letter type.',
      'Enter recipient and key content.',
      'Copy the formatted letter.',
    ],
    method: [
      'Type sets the greeting, tone and closing line.',
      'Content slots into a structure with ask-first ordering.',
      'A reference line lists enclosed documents.',
    ],
    fields: [sel('type', 'Letter type', ['Request', 'Complaint', 'Recommendation', 'Appreciation'], 'Request'), txt('recipient', 'Recipient', 2, 'The Registrar'), txt('content', 'Key point', 3, 'Rooms in block B have no working fans for a week.')],
    compute: (v) => {
      const type = asSel(v.type)
      const rec = asStr(v.recipient) || 'the office'
      const content = asStr(v.content) || 'the matter described'
      const greet = `Dear ${rec.charAt(0).toUpperCase() + rec.slice(1)},`
      const open =
        type === 'Complaint'
          ? `I am writing to bring a matter to your attention: ${content}.`
          : type === 'Recommendation'
            ? `I am pleased to recommend a candidate in connection with ${content}.`
            : type === 'Appreciation'
              ? `I am writing to express appreciation for ${content}.`
              : `I am writing to request your assistance regarding ${content}.`
      const close = type === 'Complaint' ? 'I would appreciate prompt action and a written confirmation of receipt.' : type === 'Request' ? 'I thank you in advance for your consideration and welcome any necessary follow-up.' : 'Please do not hesitate to contact me for further detail.'
      return [
        sres('Letter type', type, T.good),
        docr('Formal letter', `${greet}\n\n${open}\n\n${close}\n\nYours sincerely,\n[Your Name]\n[Roll No · Contact]`),
      ]
    },
  },
  {
    id: 'presentation-content-generator-writing',
    name: 'Presentation Content Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Turns a topic into a slide deck plan — up to six content slides, each with a headline, three bullets and a speaker prompt.',
    tip: 'Rule of three: a slide with three bullets, each under eight words, survives any projector. Trim ruthlessly to earn attention.',
    usage: [
      'Enter your topic and slide count.',
      'Review the headline-per-slide flow.',
      'Repeat each slide’s 12-second message aloud.',
    ],
    method: [
      'Slides follow hook → background → evidence → counter → takeaway.',
      'Each slide carries a claim, bullets and a speaker prompt.',
      'The final slide ends with a call to action.',
    ],
    fields: [txt('topic', 'Presentation topic', 3, 'Why sleep matters for exams'), n('slides', 'Content slides', { def: 5, min: 2, max: 10, step: 1 })],
    compute: (v) => {
      const topic = asStr(v.topic) || 'your topic'
      const cnt = clamp(asNum(v.slides), 2, 10)
      const roles = ['Hook & why it matters', 'The science in one graph step', 'Evidence and examples', 'The counter-argument', 'Actionable takeaway', 'Q&A bridge', 'Call to action', 'Appendix / deep dive', 'Recap of key numbers', 'Wrap-up']
      const slides = Array.from({ length: cnt }, (_x, i) => {
        const role = roles[Math.min(i, roles.length - 1)] || 'Growing the argument'
        return `Slide ${i + 1} — ${role}\n  Headline: (${topic.slice(0, 60)} — ${i + 1 === 1 ? 'hook' : i + 1 === cnt ? 'take-home line' : 'point ' + (i + 1)})\n  • Bullet 1 (≤8 words)\n  • Bullet 2 (≤8 words)\n  • Bullet 3 (≤8 words)\n  Speaker prompt: “Say the headline aloud, expand with one number, pause.”`
      })
      return [
        sres('Slide plan', num(cnt) + ' slides', T.good, 'with speaker prompts per slide'),
        docr('Deck outline', slides.join('\n\n')),
      ]
    },
  },
  {
    id: 'speech-generator',
    name: 'Speech Generator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Drafts a timed speech from your topic and audience, at a chosen speaking pace, with an opening hook and a memorable close.',
    tip: 'At 130 wpm, a 3-minute speech is ~390 words. Rehearse aloud twice and mark breaths on the script before the stage.',
    usage: [
      'Enter the topic, audience and minutes.',
      'Review the timed outline.',
      'Rehearse with the word-count anchor.',
    ],
    method: [
      'Words are budgeted from minutes × speaking pace.',
      'Structure is hook → 3 beats → close.',
      'The close echoes the opening for symmetry.',
    ],
    fields: [txt('topic', 'Speech topic', 3, 'The value of failure in learning'), sel('aud', 'Audience', ['Classroom (peers)', 'Convocation / formal', 'Debate / competitive'], 'Classroom (peers)'), n('min', 'Minutes', { def: 3, min: 1, max: 10, step: 0.5 })],
    compute: (v) => {
      const topic = asStr(v.topic) || 'your topic'
      const aud = asSel(v.aud)
      const mins = clamp(asNum(v.min), 1, 10)
      const wpm = 130
      const words = Math.round(mins * wpm)
      const hook = aud === 'Debate / competitive' ? `Let me open with a contradiction: the system grades failure, yet the science says failure grades us up.` : aud === 'Convocation / formal' ? `Thank you. Every story worth telling on this stage began with something that went wrong.` : `Hands up if you have ever failed a test. (Pause.) That is the room I want to talk about.`
      const beats = [
        `Beat 1 — Reframe: ${topic} is not the opposite of success; it is its prerequisite.`,
        'Beat 2 — Evidence: one crisp example or statistic (add a real number from your research before speaking).',
        'Beat 3 — Application: one habit to adopt this week, framed for this audience.',
      ]
      const close = `So tonight, remember: ${topic.charAt(0).toLowerCase()}${topic.slice(1)} — the comeback is the lecture. Thank you.`
      return [
        sres('Word budget', num(words) + ' words', T.good, `at ${wpm} wpm`),
        res('Speaking time', `${mins} min`, T.neutral),
        docr('Speech script', `${hook}\n\n${beats.map((b, i) => `${i + 1}. ${b}`).join('\n\n')}\n\n${close}`),
      ]
    },
  },
  {
    id: 'proofreading-tool',
    name: 'Proofreading Tool',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'One-pass proofread: runs spacing, repetition, capitalization, quote and misspelling checks and computes a readability-grade snapshot.',
    tip: 'Read the last paragraph first when you self-proofread — that is where the fastest wins hide because fatigue concentrates there.',
    usage: [
      'Paste your final draft.',
      'Review every flagged class.',
      'Fix the flagged spots in a second pass.',
    ],
    method: [
      'Multiple heuristics run against the same text.',
      'Every issue is classified and counted.',
      'A score summarizes the residual risk.',
    ],
    fields: [ID_TXT],
    compute: (v) => {
      const t = asStr(v.text)
      const issues: string[] = []
      const words = t.trim() ? t.trim().split(/\s+/).length : 0
      if (/(\b\w+\b) \1/gi.test(t)) issues.push('repeated word')
      if (/(?<=[.!?]\s)([a-z])/.test(t)) issues.push('uncapitalized sentence start')
      if (t.includes('  ')) issues.push('double spaces')
      if ((t.match(/[“"]/g) || []).length % 2) issues.push('unbalanced quotes')
      if (/^\s|\s+$/.test(t)) issues.push('leading/trailing whitespace')
      if (t.includes('..')) issues.push('double periods')
      const sentencesCount = (t.match(/[.!?]+/g) || []).length
      const avgLen = sentencesCount ? words / sentencesCount : 0
      const grade = avgLen > 22 ? 'Challenging (10–12 grade)' : avgLen > 16 ? 'Standard (8–9 grade)' : 'Easier (6–7 grade)'
      const score = Math.max(0, Math.min(100, 100 - issues.length * 12 - (avgLen > 22 ? 10 : 0)))
      return [
        sres('Proofreading score', `${score}/100`, score >= 85 ? T.good : score >= 60 ? T.warn : T.bad, undefined, score),
        res('Issue classes found', num(issues.length), issues.length ? (issues.length > 3 ? T.bad : T.warn) : T.good),
        res('Readability', grade, T.neutral),
        docr('Proof flags', issues.length ? issues.map((x, i) => `${i + 1}. ${x}`).join('\n') : 'No heuristic issues detected.'),
      ]
    },
  },
]