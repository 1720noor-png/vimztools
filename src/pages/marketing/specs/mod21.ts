import { n, sel, txt, res, doc, T, asNum, asSel, asStr, pct } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Customer & Reputation Marketing'

export const mod21: MarketingSeoSpec[] = [
  {
    id: 'customer-review-analyzer',
    name: 'Customer Review Analyzer',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Parses a review corpus into a sentiment ledger \u2014 praise, complaint and theme counts \u2014 and names the repairable complaint cluster.',
    tip: 'Dig the "so close" reviews: 4-star reviews carry the exact fix that upgrades you to 5. Their complaint is your roadmap item.',
    usage: [
      'Estimate how many positive and negative you hold.',
      'Tag the top recurring theme.',
      'Turn the top theme into one roadmap item.',
    ],
    method: [
      'Sentiment split and theme counts model the ledger.',
      'A repairability score ranks complaint clusters.',
      'The top theme is converted into an owner-less action item.',
    ],
    fields: [
      n('pos21', 'Positive (4-5 star) reviews', { def: 210, min: 0 }),
      n('neg21', 'Negative (1-3 star) reviews', { def: 34, min: 0 }),
      txt('thm21', 'Top recurring theme', 2, 'shipping takes too long'),
      sel('fixable21', 'Theme fixability', ['Easy fix', 'Marketing fix', 'Product change'], 'Easy fix'),
    ],
    compute: (v) => {
      const pos = asNum(v.pos21)
      const neg = asNum(v.neg21)
      const total = pos + neg
      const share = total > 0 ? pos / total * 100 : 0
      const theme = asStr(v.thm21) || 'the theme'
      const fix = asSel(v.fixable21)
      const cost = fix === 'Easy fix' ? 10 : fix === 'Marketing fix' ? 40 : 70
      const gain = Math.round(share >= 80 ? share - 70 : Math.min(15, 70 - share))
      return [
        res('Positive share', pct(share, 1), share >= 85 ? T.good : share >= 70 ? T.warn : T.bad),
        res('Repairs scoring', fix + ' \u2248 ' + cost + '% effort', T.good),
        res('Theme', theme, T.good),
        res('Potential uplift', '+' + Math.max(0, gain) + 'pp by fixing', gain > 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'review-response-generator',
    name: 'Review Response Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes the public reply that keeps the review thread from poisoning \u2014 empathy-first, fix-named, escalation offered.',
    tip: 'Reply in 24 hours or never argue in public. A visible, calm response converts a 1-star critic into respect \u2014 and fence-sitters into buyers.',
    usage: [
      'Identify whether the review is praise or pain.',
      'Name the fix without promising the impossible.',
      'Post the reply and fix privately the same week.',
    ],
    method: [
      'Sentinental empathy comes before any defense.',
      'Fix language names the action, never blames the user.',
      'A private escalation line is always included.',
    ],
    fields: [
      sel('kind21', 'Review type', ['Praise', 'Star bump available', 'Pain / bug'], 'Pain / bug'),
      txt('about21', 'What it is about', 2, 'the app crashed on the payment step'),
      sel('action21', 'What you will do', ['Fix queued', 'Refund issued', 'Escalated to team'], 'Fix queued'),
    ],
    compute: (v) => {
      const kind = asSel(v.kind21)
      const about = asStr(v.about21) || 'the issue'
      const action = asSel(v.action21)
      const line = kind === 'Praise'
        ? `Thank you \u2014 genuinely. The team celebrates notes like this. What worked best for you?`
        : kind === 'Star bump available'
        ? `Thanks for the honest middle-rating on ${about}. We would love a second chance \u2014 the fix is ${action}.`
        : `We are sorry ${about}. That is on us. ${action} as of today \u2014 and if anything else comes up, the in-app chat gets a human within an hour.`
      return [
        res('Tone', kind === 'Praise' ? 'Warm' : 'Accountable', T.good),
        res('Fix named', action, T.good),
        res('Escalation', 'Private line offered', T.good),
        doc('Public reply', line),
      ]
    },
  },
  {
    id: 'customer-feedback-analyzer',
    name: 'Customer Feedback Analyzer',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Aggregates survey feedback into three buckets \u2014 must-fix, should-fix, nice-to-have \u2014 weighted by how many customers hit it.',
    tip: 'The 80/20 of feedback: fix the single must-fix that the most people named, and the "is anyone listening" churn disappears overnight.',
    usage: [
      'Count responses naming each area.',
      'Bucket by impact and frequency.',
      'Pick one must-fix for the quarter.',
    ],
    method: [
      'Each theme\u2019s frequency is its show-of-hands count.',
      'Impact scores weight the bucket assignment.',
      'The quarter pick is the highest frequency-weighted item.',
    ],
    fields: [
      n('uiF21', 'Named "too hard to use"', { def: 42, min: 0 }),
      n('priceF21', 'Named "too expensive"', { def: 18, min: 0 }),
      n('speedF21', 'Named "too slow"', { def: 31, min: 0 }),
      n('missingF21', 'Named "feature missing"', { def: 9, min: 0 }),
      n('allF21', 'Total responses', { def: 120, min: 1 }),
    ],
    compute: (v) => {
      const ui = asNum(v.uiF21)
      const price = asNum(v.priceF21)
      const speed = asNum(v.speedF21)
      const missing = asNum(v.missingF21)
      const total = asNum(v.allF21)
      const rows = [
        { label: 'Usability', n: ui, impact: 4 },
        { label: 'Pricing', n: price, impact: 3 },
        { label: 'Performance', n: speed, impact: 2 },
        { label: 'Missing feature', n: missing, impact: 1 },
      ].map((r) => ({ ...r, w: r.n / Math.max(1, total) * r.impact }))
      const top = rows.reduce((a, b) => (b.w > a.w ? b : a))
      const bucket = top.w >= 1 ? 'MUST-FIX' : top.w >= 0.5 ? 'SHOULD-FIX' : 'NICE-TO-HAVE'
      return [
        res('Top theme', top.label, T.good),
        res('Share', pct(top.n / Math.max(1, total) * 100, 1)),
        res('Bucket', bucket, bucket === 'SHOULD-FIX' ? T.warn : bucket === 'NICE-TO-HAVE' ? T.warn : T.good),
        res('Priority pick', `${top.label} \u2014 ${bucket}`, T.good),
      ]
    },
  },
  {
    id: 'customer-satisfaction-score-calculator',
    name: 'CSAT Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Computes Customer Satisfaction Score from the "% satisfied" question \u2014 happy responses as a share of all answers.',
    tip: 'CSAT is a smile gate, not a strategy metric \u2014 pair it with effort scores; customers who find it easy are four times more loyal.',
    usage: [
      'Collect responses to the 1-5 satisfaction question.',
      'Count responses 4-5 as satisfied.',
      'Track CSAT monthly \u2014 spikes reveal broken touchpoints.',
    ],
    method: [
      'CSAT is satisfied (4-5) divided by all responses.',
      'Satisfaction depth is split into two bands.',
      'A trend flag suggests the next probe.',
    ],
    fields: [
      n('resp21', 'Responses received', { def: 220, min: 1 }),
      n('happy21', 'Satisfied (4-5) responses', { def: 161, min: 0 }),
    ],
    compute: (v) => {
      const total = asNum(v.resp21)
      const happy = asNum(v.happy21)
      const csat = happy / total * 100
      const neutral = (total - happy) / total * 100
      return [
        res('CSAT', pct(csat, 1), csat >= 80 ? T.good : csat >= 60 ? T.warn : T.bad),
        res('Not satisfied', pct(neutral, 1), neutral <= 20 ? T.good : T.warn),
        res('Need to = 80', pct(Math.max(0, Math.round((total * 0.8 - happy) / Math.max(1, total) * 100)), 0) + ' more pp', csat >= 80 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'nps-calculator',
    name: 'NPS Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Derives Net Promoter Score from the 0-10 likelihood question, splitting promoters, passives and detractors.',
    tip: 'NPS drift is a story, not a number \u2014 read the detractor quotes the same week you read the score, or you only get the symptom.',
    usage: [
      'Collect 0-10 likelihood responses.',
      'Count promoters (9-10) and detractors (0-6).',
      'Read the NPS band and the detractor warning.',
    ],
    method: [
      'Promoter and detractor shares create the score.',
      'Passives are the improvement buffer.',
      'The band verdict repeats standard NPS ranges.',
    ],
    fields: [
      n('prom21', 'Promoters (9-10)', { def: 52, min: 0 }),
      n('pass21', 'Passives (7-8)', { def: 23, min: 0 }),
      n('detr21', 'Detractors (0-6)', { def: 25, min: 0 }),
    ],
    compute: (v) => {
      const p = asNum(v.prom21)
      const pa = asNum(v.pass21)
      const d = asNum(v.detr21)
      const total = p + pa + d || 1
      const nps = Math.round((p - d) / total * 100)
      const band = nps >= 50 ? 'World class' : nps >= 30 ? 'Good' : nps >= 0 ? 'Needs work' : 'Warning'
      return [
        res('NPS', nps + (nps > 0 ? '+' : ''), nps >= 30 ? T.good : nps >= 0 ? T.warn : T.bad),
        res('Promoter share', pct(p / total * 100, 0), T.good),
        res('Detractor share', pct(d / total * 100, 0), d / total <= 0.15 ? T.good : T.warn),
        res('Band', band, nps >= 30 ? T.good : nps >= 0 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'customer-retention-calculator',
    name: 'Customer Retention Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Measures retained customers against a starting cohort, then isolates the cohort beauty behind the number.',
    tip: 'Retention of 90% and 70% look tiny on paper and massive in revenue \u2014 a 5pp retention gain compounds every month forever.',
    usage: [
      'Pick the cohort window.',
      'Count customers who remained.',
      'Run retention plus the survival-view.',
    ],
    method: [
      'Rate retention is retained over starting cohort.',
      'Lapse share shows what leaked each period.',
      'The survival view frames the compounding effect.',
    ],
    fields: [
      n('start21', 'Cohort at start', { def: 500, min: 1 }),
      n('remain21', 'Still active at end', { def: 415, min: 0 }),
      n('months21', 'Window (months)', { def: 6, min: 1 }),
    ],
    compute: (v) => {
      const start = asNum(v.start21)
      const remain = asNum(v.remain21)
      const months = asNum(v.months21)
      const rate = remain / start * 100
      const lapse = 100 - rate
      const annual = Math.pow(rate / 100, 12 / Math.max(1, months)) * 100
      return [
        res('Retention', pct(rate, 1), rate >= 80 ? T.good : rate >= 60 ? T.warn : T.bad),
        res('Lapsed', pct(lapse, 1), lapse <= 20 ? T.good : T.warn),
        res('Annualized', pct(annual, 0), annual >= 60 ? T.good : T.warn),
        res('Survival', `~${Math.round(start * Math.pow(rate / 100, 1 / Math.max(1, months)))} fit/mo`, T.good),
      ]
    },
  },
  {
    id: 'churn-rate-calculator',
    name: 'Churn Rate Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Computes monthly churn and its annualized cousin, and back-solves the retention you need to hit a growth target.',
    tip: 'Know your churn to the decimal \u2014 a 2% monthly churn compounds to ~21% per year, and each point above 5% makes CAC math explode.',
    usage: [
      'Enter customers at period start and those lost.',
      'Read monthly and annualized churn.',
      'Set the churn target paired to growth.',
    ],
    method: [
      'Monthly churn is lost over starting base.',
      'Annualized churn compounds the monthly figure.',
      'The target-churn derivation uses CLV payback logic.',
    ],
    fields: [
      n('base21', 'Customers at start', { def: 850, min: 1 }),
      n('lost21', 'Lost this month', { def: 36, min: 0 }),
      n('cacTime21', 'CAC payback window (mo)', { def: 12, min: 1 }),
    ],
    compute: (v) => {
      const base = asNum(v.base21)
      const lost = asNum(v.lost21)
      const payback = asNum(v.cacTime21)
      const churn = lost / base * 100
      const annual = (1 - Math.pow(1 - churn / 100, 12)) * 100
      const target = 100 / payback
      const ok = churn <= target
      return [
        res('Monthly churn', pct(churn, 2), churn <= 5 ? T.good : T.warn),
        res('Annualized', pct(annual, 1), annual <= 45 ? T.good : T.bad),
        res('Healthy ceiling', pct(target, 1) + '/mo', T.good, 'For ' + payback + '-mo CAC payback'),
        res('Verdict', ok ? 'Under ceiling' : 'Above ceiling \u2014 fix churn', ok ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'customer-complaint-response-generator',
    name: 'Customer Complaint Response Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'De-escalates complaint responses \u2014 validate, own, act, protect \u2014 with the exact fix and the promise you can keep.',
    tip: 'Never apologize twice in one reply and never promise an outcome you cannot timestamp. One clean "sorry, here is the fix, by Friday" wins.',
    usage: [
      'Summarize the complaint in the customer\u2019s frame.',
      'Choose your concrete action.',
      'Post and actually do the action with a date.',
    ],
    method: [
      'The four moves \u2014 validate, own, act, protect \u2014 order the reply.',
      'Action language is concrete and timestamped.',
      'A guard fires if the apology repeats.',
    ],
    fields: [
      txt('comp21', 'The complaint', 2, 'billed twice for the same subscription'),
      sel('fix21', 'Your action', ['Immediate refund + fee waived', 'Priority bugfix with patched ETA', 'Personal call from the manager'], 'Immediate refund + fee waived'),
      txt('tm21', 'Timeline you can keep', 2, 'by Friday noon'),
    ],
    compute: (v) => {
      const comp = asStr(v.comp21) || 'the complaint'
      const fix = asSel(v.fix21)
      const tm = asStr(v.tm21) || 'this week'
      const line = [
        `I hear you \u2014 ${comp} is exactly the frustration you described.`,
        `That is on us. ${fix}, ${tm}.`,
        `You will not need to chase us: I will send the confirmation when it is done.`,
        `If anything else glides wrong, reply here and a human answers the same day.`,
      ].join('\n\n')
      const tsl = fix.split(' ').length <= 8
      return [
        res('Empathy first', 'Yes', T.good),
        res('Action concrete', fix, tsl ? T.good : T.warn),
        res('Timestamp', tm, T.good),
        res('Promise kept', 'Confirmed + self-report', T.good),
        doc('Reply', line),
      ]
    },
  },
  {
    id: 'testimonial-generator',
    name: 'Testimonial Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Turns a satisfied moment into a permission-ready testimonial \u2014 problem, outcome, number, attribution \u2014 editors can drop straight in.',
    tip: 'Ask for the number, not the praise. "It saved us 9 hours a week" outsells "amazing tool" every single time.',
    usage: [
      'Describe the pre-pain.',
      'Add the concrete outcome with a number.',
      'Collect verifiable attribution.',
    ],
    method: [
      'The problem-result-number formula is enforced.',
      'Specific numbers are weighted over adjectives.',
      'Attribution block makes it consent-clean.',
    ],
    fields: [
      txt('prob21t', 'Their problem before', 2, 'weekly reporting took all day Tuesday'),
      txt('outcome21t', 'Outcome', 2, 'reports now take 40 minutes'),
      txt('num21t', 'A number', 2, '9.5 hours saved weekly'),
      txt('who21t', 'Who says it', 2, 'Alex Chen, COO at a 40-person SaaS'),
    ],
    compute: (v) => {
      const prob = asStr(v.prob21t) || 'their old problem'
      const outcome = asStr(v.outcome21t) || 'the outcome'
      const num = asStr(v.num21t) || 'a number'
      const who = asStr(v.who21t) || 'your customer'
      const test = `"${cap21(prob)}. Now ${outcome} \u2014 that is ${num}. I would not go back." \u2014 ${who}`
      const numeric = /\d/.test(num)
      return [
        res('Number present', numeric ? 'Backed by ' + num : 'Add a number', numeric ? T.good : T.warn),
        res('Problem \u2192 result', '2 beats', T.good),
        res('Attributable', who.split(' ').length >= 3 ? 'Yes' : 'Anonymous', who.split(' ').length >= 3 ? T.good : T.warn),
        doc('Testimonial', test + '\n\nConsent: confirm "ok to publish with title + company".'),
      ]
    },
  },
  {
    id: 'customer-survey-generator',
    name: 'Customer Survey Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Composes a 7-question feedback survey \u2014 one metric question, three open probes and a churn canary \u2014 that people actually finish.',
    tip: 'A survey over 7 questions loses half its completions. Keep the metric in question 1 \u2014 everything else is scaffolding.',
    usage: [
      'Pick the single metric to run.',
      'Keep the 3 probes as-is.',
      'Pilot on 10 customers before the blast.',
    ],
    method: [
      'One metric question leads, three open probes follow.',
      'A churn canary measures intent, not just history.',
      'Completable length is enforced under 7 questions.',
    ],
    fields: [
      sel('metric21', 'Metric', ['NPS', 'CSAT', 'Effort'], 'NPS'),
      txt('focus21', 'Area to probe', 2, 'the new dashboard'),
      txt('reward21', 'Incentive (optional)', 2, '1 month Pro for a full completion'),
    ],
    compute: (v) => {
      const metric = asSel(v.metric21)
      const focus = asStr(v.focus21) || 'the recent change'
      const reward = asStr(v.reward21) || 'no incentive'
      const scale = metric === 'NPS' ? 'How likely are you to recommend us? (0-10)' : metric === 'CSAT' ? 'How satisfied were you with today\u2019s experience? (1-5)' : 'How much effort did ${focus} take? (1-5)'
      const survey = [
        `Q1 (metric): ${scale}`,
        `Q2: What are you trying to do with ${focus}? (open)`,
        `Q3: What almost made you give up \u2014 but did not? (open)`,
        `Q4: What nearly stopped you from continuing? (open)`,
        `Q5 (churn canary): If you had to scale back, what would go first? (multi)`,
        `Q6: Anything you would pay us to fix? (open)`,
        `Q7 (permission): May we quote you? [yes/no]`,
        `Incentive: ${reward}.`,
      ].join('\n\n')
      const count = 7
      return [
        res('Question count', count + ' / 7', count <= 7 ? T.good : T.warn),
        res('Metric first', metric, T.good),
        res('Incentive', reward, reward !== 'no incentive' ? T.good : T.warn),
        doc('Survey', scale.startsWith('How much effort') ? survey.replace('${focus}', focus) : survey),
      ]
    },
  },
  {
    id: 'feedback-form-generator',
    name: 'Feedback Form Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds the on-page feedback form \u2014 two fields, one score, one note \u2014 tuned for passive collection that does not nag.',
    tip: 'Online feedback forms win on friction: one score question and one text box beat five-star matrices that nobody scans.',
    usage: [
      'Name the page or flow being rated.',
      'Choose the score style.',
      'Embed the two-field form and watch the drop-off rate.',
    ],
    method: [
      'One quantitative control and one open text box.',
      'The score style matches page context.',
      'Anti-nag rules keep the form exit-friendly.',
    ],
    fields: [
      txt('flow21', 'Page/flow', 2, 'checkout completion'),
      sel('style21', 'Score style', ['Satisfied?', 'Recommend?', 'Effort?'], 'Satisfied?'),
      sel('trigger21', 'Trigger', ['After exit intent', 'After success', 'One-time popup'], 'After exit intent'),
    ],
    compute: (v) => {
      const flow = asStr(v.flow21) || 'the flow'
      const style = asSel(v.style21)
      const trigger = asSel(v.trigger21)
      const q = style === 'Satisfied?' ? 'Were you satisfied with ' + flow + '?' : style === 'Recommend?' ? 'Would you recommend ' + flow + ' to a colleague?' : 'How much effort did ' + flow + ' take?'
      const note = trigger === 'After exit intent' ? 'Catch the abandoners \u2014 exit-intent asks right as they leave.' : trigger === 'After success' ? 'Ask at the win moment for the freshest read.' : 'One-time popup keeps it unobtrusive.'
      return [
        res('Question', q, T.good),
        res('Friction', '2 fields', T.good),
        res('Timing', trigger + ' \u2014 ' + note, T.good),
        doc('Form spec', `Title: Quick ${style}\nQ: ${q}\nControl: 1-5 scale (labeled emojis)\nNote: "Anything we can improve?" (optional text)\nCTA: Send feedback\nTiming: ${trigger}.`),
      ]
    },
  },
]

function cap21(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}