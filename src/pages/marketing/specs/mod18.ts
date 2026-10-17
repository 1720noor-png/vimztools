import { n, sel, txt, ck, res, doc, T, asNum, asSel, asStr, asBoolList } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Marketing Strategy & Planning'

export const mod18: MarketingSeoSpec[] = [
  {
    id: 'marketing-plan-generator',
    name: 'Marketing Plan Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Assembles a working marketing plan \u2014 goals, audiences, channels and quarterly actions \u2014 from a single summary sentence.',
    tip: 'A plan nobody reads is a wish list. Name one owner and one metric per action so the plan turns into tasks, not slides.',
    usage: [
      'Describe your offer and stage.',
      'Add goal and channel context.',
      'Export the plan into your tracker.',
    ],
    method: [
      'Stage and goal frame the audience and channel choices.',
      'A quarterly action ladder is derived from maturity.',
      'Every line carries an owner-lead metric to be actionable.',
    ],
    fields: [
      txt('prod18', 'Offer & industry', 2, 'B2B project-management SaaS for agencies'),
      sel('stage18', 'Growth stage', ['Launch', 'Early traction', 'Scaling'], 'Early traction'),
      txt('goal18', 'Primary goal', 2, 'reach 300 paying customers'),
      txt('channels18', 'Channels you will run', 2, 'SEO, LinkedIn, email, webinars'),
    ],
    compute: (v) => {
      const prod = asStr(v.prod18) || 'your offer'
      const goal = asStr(v.goal18) || 'growth'
      const ch = (asStr(v.channels18) || '').split(',').map((s) => s.trim()).filter(Boolean)
      const channels = ch.length ? ch.join(', ') : 'owned + earned channels'
      const focus = asSel(v.stage18) === 'Launch' ? 'Nail the first 50 customers' : asSel(v.stage18) === 'Scaling' ? 'Systemize acquisition' : 'Double a working channel'
      const raw = [
        `MARKETING PLAN \u2014 ${prod}`,
        `\n1. Objective: ${goal} in the next ${asSel(v.stage18) === 'Launch' ? '90' : '180'} days.`,
        `2. Audience: ICP-refined beyond a proposition; build one buyer persona first.`,
        `3. Channels: ${channels} \u2014 pick the two with measurable cost per signup.`,
        `4. Next 30 days: ${focus}.`,
        `5. Next 90 days: double the source with the lowest acquisition cost.`,
        `6. Success metric: ${asSel(v.stage18) === 'Scaling' ? 'pipeline-influenced revenue' : 'activated signups per week'}.`,
        `\nOwner: ____    Review cadence: weekly metrics, monthly plan.`,
      ].join('\n')
      return [
        res('Plan scope', asSel(v.stage18), T.good),
        res('Channels', channels, ch.length >= 2 ? T.good : T.warn, 'Two is enough to start'),
        res('Action bias', focus, T.good),
        doc('Full plan', raw),
      ]
    },
  },
  {
    id: 'marketing-strategy-planner',
    name: 'Marketing Strategy Planner',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Shapes a positioning-anchored strategy statement \u2014 who you target, how you differ, and the proof that makes the promise credible.',
    tip: 'Strategy is a choice: one customer, one difference, one channel. If it works for two audiences, it is not yet a strategy.',
    usage: [
      'Identify the audience slice with the worst problem.',
      'Name the one difference your proof can back.',
      'State it in the strategy sentence structure.',
    ],
    method: [
      'The strategy sentence forces the who/what/why triple.',
      'Proof modifiers convert positioning into credibility.',
      'A trap-check flags overlaps with established players.',
    ],
    fields: [
      txt('aud18', 'Target segment', 2, 'agencies losing billable hours to admin'),
      txt('diff18', 'Differentiator', 2, 'AI timesheets that grade themselves'),
      txt('proof18', 'Proof/evidence', 2, 'avg 9 hrs saved per week'),
      sel('trap18', 'Naming risk', ['Clean', 'Generic', 'Overlaps a giant'], 'Generic'),
      sel('voice18', 'Voice', ['Expert', 'Friendly coach', 'Bold challenger'], 'Expert'),
    ],
    compute: (v) => {
      const aud = asStr(v.aud18) || 'your segment'
      const diff = asStr(v.diff18) || 'your differentiator'
      const proof = asStr(v.proof18) || 'proof point'
      const trap = asSel(v.trap18)
      const voice = asSel(v.voice18)
      const stmt = `For ${aud}, ${diff} is the fastest route to their goal \u2014 and ${proof} makes it real.`
      return [
        res('Positioning', trap === 'Clean' ? 'Differentiated' : trap === 'Generic' ? 'Blurry' : 'Risky', trap === 'Clean' ? T.good : trap === 'Generic' ? T.warn : T.bad),
        res('Voice', voice, T.good),
        res('Strategies read aloud', '1 sentence', T.good),
        doc('Strategy statement', `${stmt}\n\nTrap check: ${trap}. Rewrite if a competitor could put their name where yours belongs.`),
      ]
    },
  },
  {
    id: 'campaign-planner',
    name: 'Campaign Planner',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Breaks a campaign budget, objective and audience into launch phases with a fair allocation across creative, media and testing.',
    tip: 'Reserve 20% of every budget as a test slice \u2014 without experiments, a campaign is a bet twice over.',
    usage: [
      'Enter budget, audience and objective.',
      'Run the phase allocations.',
      'Fund the test slice before the media slice.',
    ],
    method: [
      'Phased allocations follow objective type (launch/demand/capture).',
      'A fixed test slice is carved before media math.',
      'Audience size offsets the daily budget model.',
    ],
    fields: [
      txt('obj18', 'Campaign objective', 2, 'win 60 new demo meetings'),
      txt('aud18c', 'Target audience', 2, 'ops leaders at 50-500 person companies'),
      n('budget18', 'Total budget ($)', { def: 24000, min: 100 }),
      sel('ch18', 'Channel', ['LinkedIn', 'Google paid', 'Meta', 'Multi'], 'LinkedIn'),
      n('days18', 'Run days', { def: 60, min: 7 }),
    ],
    compute: (v) => {
      const budget = asNum(v.budget18)
      const days = asNum(v.days18)
      const obj = asStr(v.obj18) || 'the objective'
      const test = budget * 0.2
      const media = budget * 0.55
      const prod = budget * 0.25
      const daily = media / days
      return [
        res('Test slice', '$' + Math.round(test), T.good, 'Never skip this'),
        res('Media daily pace', '$' + Math.round(daily) + '/day', T.good),
        res('Objective', obj, T.good),
        doc('Campaign split', `Test & learn: $${Math.round(test)} (20%)\nMedia budget: $${Math.round(media)} (55%)\nCreative & landing: $${Math.round(prod)} (25%)\nDaily media pace: $${Math.round(daily)}/day`),
      ]
    },
  },
  {
    id: 'content-calendar-generator',
    name: 'Content Calendar Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Rolls a week of publish-ready content slots from your pillars, format mix and channel, balanced across awareness and conversion.',
    tip: 'Plan in pillars, not random posts. Three pillars \u00d7 three formats beats eleven one-off topics for recognition and recall.',
    usage: [
      'Pick channel and weekly volume.',
      'List your 2-3 content pillars.',
      'Slot formats across the week.',
    ],
    method: [
      'Pillar rotation gives each theme recurring exposure.',
      'Format mix follows the 3-2-1 rule (teach/engage/convert).',
      'Day-part timing reflects the chosen channel norm.',
    ],
    fields: [
      sel('ch18k', 'Channel', ['LinkedIn', 'Instagram', 'YouTube', 'Blog/SEO'], 'LinkedIn'),
      n('perWeek18', 'Posts per week', { def: 4, min: 1, max: 7 }),
      txt('pillars18', 'Pillars (comma separated)', 2, 'hiring pain, new-hire leave, tools'),
      sel('mix18', 'Format mix', ['Teach-first', 'Engage-output', 'Convert-heavy'], 'Teach-first'),
    ],
    compute: (v) => {
      const ch = asSel(v.ch18k)
      const count = Math.round(Math.min(7, asNum(v.perWeek18) || 4))
      const pillars = (asStr(v.pillars18) || '').split(',').map((s) => s.trim()).filter(Boolean)
      const base = pillars.length ? pillars : ['pillar A', 'pillar B', 'pillar C']
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const fmt = asSel(v.mix18) === 'Teach-first' ? ['tutorial', 'tip', 'story', 'quote'] : asSel(v.mix18) === 'Engage-output' ? ['poll', 'post', 'carousel', 'story'] : ['case', 'demo', 'offer', 'hustle']
      const slots = Array.from({ length: count }, (_, i) => ({
        d: days[i],
        p: base[i % base.length],
        f: fmt[i % fmt.length],
      }))
      const insight = slots.filter((s) => s.p === base[0]).length
      return [
        res('Schedule', `${count} slots on ${ch}`, count <= 5 ? T.good : T.warn),
        res('Pillar balance', `lead pillar hit ${insight}x`, insight >= 1 ? T.good : T.warn),
        doc('This week', slots.map((s) => `${s.d}: ${s.p} \u2014 ${s.f}`).join('\n')),
      ]
    },
  },
  {
    id: 'social-media-calendar',
    name: 'Social Media Calendar',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Builds a 7-day social grid with dayparted slots, content themes and a cadence that protects daily consistency without burnout.',
    tip: 'Consistency beats virality for reach growth \u2014 a 4/day grid every single week compounds more than one lucky post.',
    usage: [
      'Set platform and daily volume.',
      'Choose the theme rotation.',
      'Fill slots from your bank of ideas.',
    ],
    method: [
      'Daily volume is capped to a sustainable band.',
      'Themes rotate on a fixed weekly rhythm.',
      'Day-part slots follow platform peak times.',
    ],
    fields: [
      sel('plt18', 'Platform', ['TikTok', 'X', 'Instagram', 'Facebook'], 'Instagram'),
      n('daily18', 'Posts per day', { def: 2, min: 1, max: 5 }),
      sel('theme18', 'Theme rotation', ['Product / value / story', 'Educate / entertain / sell'], 'Product / value / story'),
      sel('peak18', 'Posting window', ['Morning rush', 'Lunch', 'Evening'], 'Evening'),
    ],
    compute: (v) => {
      const daily = asNum(v.daily18)
      const theme = asSel(v.theme18)
      const peak = asSel(v.peak18)
      const themes = theme === 'Product / value / story' ? ['Product', 'Value-add', 'Story'] : ['Educate', 'Entertain', 'Sell']
      const grid = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, di) =>
        `\u2022 ${d} ${peak === 'Morning rush' ? '8:15' : peak === 'Lunch' ? '12:30' : '19:30'}: ${themes[(di + 1) % 3]}`
          + (daily > 1 ? ` + 17:00 ${themes[di % 3]}` : ''),
      )
      const cadenceOk = daily >= 1 && daily <= 3
      return [
        res('Daily cadence', `${daily}/day`, cadenceOk ? T.good : T.warn, '1-3 keeps you durable'),
        res('Planning capacity', grid.length + ' slots/week', T.good),
        doc('Weekly grid', grid.join('\n')),
      ]
    },
  },
  {
    id: 'marketing-funnel-planner',
    name: 'Marketing Funnel Planner',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Projects a full-funnel funnel \u2014 visitors to customers \u2014 from stage conversion rates, and isolates the leak that matters most.',
    tip: 'Fix the top conversion stage with the most absolute loss first: a 1% fix on the biggest number outguns a 10% fix two stages down.',
    usage: [
      'Enter monthly visitors and stage rates.',
      'Run the cascade.',
      'Attack the stage losing the most people in absolute terms.',
    ],
    method: [
      'Each stage\u2019s headcount is prior stage times its rate.',
      'Absolute-loss per stage is derived, not guessed.',
      'The $1069 planner attributes value per converted target.',
    ],
    fields: [
      n('visit18', 'Monthly visitors', { def: 8000, min: 1 }),
      n('tofu18', 'Visitors \u2192 leads (%)', { def: 3.2, min: 0, max: 100, step: 0.1 }),
      n('mql18', 'Leads \u2192 MQL (%)', { def: 38, min: 0, max: 100 }),
      n('sql18', 'MQL \u2192 SQL (%)', { def: 46, min: 0, max: 100 }),
      n('cust18z', 'SQL \u2192 customer (%)', { def: 24, min: 0, max: 100 }),
      n('arpu18', 'Annual value / customer ($)', { def: 1200, min: 0 }),
    ],
    compute: (v) => {
      const visits = asNum(v.visit18)
      const leads = visits * asNum(v.tofu18) / 100
      const mql = leads * asNum(v.mql18) / 100
      const sql = mql * asNum(v.sql18) / 100
      const cust = sql * asNum(v.cust18z) / 100
      const value = cust * asNum(v.arpu18)
      const losses = [
        { stage: 'Visitors \u2192 leads', loss: visits - leads },
        { stage: 'Leads \u2192 MQL', loss: leads - mql },
        { stage: 'MQL \u2192 SQL', loss: mql - sql },
        { stage: 'SQL \u2192 customer', loss: sql - cust },
      ]
      const worst = losses.reduce((a, b) => (b.loss > a.loss ? b : a))
      const revenue = Math.round(value)
      return [
        res('Customers / mo', cust.toFixed(1), cust > 0 ? T.good : T.warn),
        res('Annual value', '$' + revenue.toFixed(0), T.good),
        res('Biggest leak', worst.stage, T.warn, `${worst.loss.toFixed(0)} people/mo lost here`),
        res('Covers budget?', revenue > 0 ? 'Model is live' : 'No revenue path', revenue > 0 ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'buyer-persona-generator',
    name: 'Buyer Persona Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Draws a B2B buyer persona \u2014 role, headaches, goals, decision pressures \u2014 the way sales teams actually meet them.',
    tip: 'Name one real person. "Head of Ops at 100-person SaaS" is researchable; "small business owners" is not a persona.',
    usage: [
      'Anchor the role and stage.',
      'List pains in your words.',
      'Turn pains into messaging hooks.',
    ],
    method: [
      'Role and seniority frame goals and pressures.',
      'Pains are grouped into problem, process, and people.',
      'Messaging hooks derive from the highest-stakes pain.',
    ],
    fields: [
      txt('role18', 'Role & seniority', 2, 'Head of Revenue Operations'),
      txt('industry18', 'Industry / company size', 2, 'B2B SaaS, 50-200 employees'),
      txt('pains18', 'Top 3 pains', 2, 'manual reporting, missed renewal signals, siloed data'),
      txt('goals18', 'Measurable goals', 2, 'identify at-risk accounts 30 days early'),
      sel('pressure18', 'Buyer pressure', ['Budget approval', 'Quick win expected', 'Risk aversion'], 'Risk aversion'),
    ],
    compute: (v) => {
      const role = asStr(v.role18) || 'the persona'
      const industry = asStr(v.industry18) || 'your market'
      const pains = (asStr(v.pains18) || 'pains').split(',').map((s) => s.trim())
      const goals = asStr(v.goals18) || 'their goal'
      const pressure = asSel(v.pressure18)
      return [
        res('Persona', role, T.good),
        res('Pains', pains.length + ' mapped', pains.length >= 3 ? T.good : T.warn),
        res('Pressure', pressure, T.good),
        doc('Persona card', `${role}\n\u2022 Context: ${industry}\n\u2022 Pains: ${pains.join('; ')}\n\u2022 Goal: ${goals}\n\u2022 Why they stall: ${pressure}.\n\u2022 Hook: "You said ${pains[0]} \u2014 that is the ${pressure} bite. Here is the fix."`),
      ]
    },
  },
  {
    id: 'customer-persona-generator',
    name: 'Customer Persona Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Profiles a consumer buyer via lifestyle, spending triggers and channels \u2014 the sketch that decides where your message shows up.',
    tip: 'Real triggers beat demographics. Mothers don\u2019t buy size, they buy "exactly what to pack so bedtime stops".',
    usage: [
      'Fill demographic anchors.',
      'Name the buying trigger.',
      'Choose channels from their media habits.',
    ],
    method: [
      'Lifestyle and trigger frame emotional relevance.',
      'Budget band sets what you may charge without friction.',
      'Channel entry derives from their content behavior.',
    ],
    fields: [
      txt('demo18', 'Customer snapshot', 2, 'urban moms, 30-40, 1-2 kids'),
      txt('trigger18', 'Buying trigger', 2, 'kids bedtime meltdown every night'),
      sel('band18', 'Budget band', ['Value', 'Mid', 'Premium'], 'Mid'),
      txt('consume18', 'Where they spend time', 2, 'Instagram reels, mom group chats, podcasts'),
    ],
    compute: (v) => {
      const demo = asStr(v.demo18) || 'your customer'
      const trigger = asStr(v.trigger18) || 'the trigger'
      const budget = asSel(v.band18)
      const consume = asStr(v.consume18) || 'their channels'
      return [
        res('Customer', demo, T.good),
        res('Trigger sharpness', trigger.split(' ').length <= 7 ? 'Sharp' : 'Blurry', trigger.split(' ').length <= 7 ? T.good : T.warn),
        res('Budget band', budget, T.good),
        doc('Profile', `\u2022 Who: ${demo}\n\u2022 Why now: ${trigger}\n\u2022 Willing to pay: ${budget}\n\u2022 Reach them at: ${consume}\n\u2022 First message: "You see it every night \u2014 ${trigger}. Here is the 2-minute fix."`),
      ]
    },
  },
  {
    id: 'target-audience-generator',
    name: 'Target Audience Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Segments your population into reachable audience slices, scoring each by pain intensity, budget and finding cost.',
    tip: 'The best audience is the smallest slice with the sharpest, most bought-in pain \u2014 size is the bait that destroys campaigns.',
    usage: [
      'Describe the product and category.',
      'Pick the segment skeleton.',
      'Score candidates and take the top slice.',
    ],
    method: [
      'Segments split by category, use-case or buying role.',
      'Each slice is scored for pain, budget and reachability.',
      'The recommended slice is the max-score candidate.',
    ],
    fields: [
      txt('prod18t', 'Product / category', 2, 'no-code employee onboarding software'),
      sel('scope18', 'Selling to', ['Individuals', 'Small teams', 'Corporations'], 'Small teams'),
      txt('use18', 'Distinct use cases', 2, 'monthly new hires, seasonal spikes, contractor onboarding'),
    ],
    compute: (v) => {
      const prod = asStr(v.prod18t) || 'your product'
      const scope = asSel(v.scope18)
      const uses = (asStr(v.use18) || '').split(',').map((s) => s.trim()).filter(Boolean)
      const segs = uses.length ? uses : ['use case A', 'use case B']
      const chosen = `Ops at companies onboarding ${scope === 'Corporations' ? '100+ people/yr' : '10-50 people/yr'} with irregular ${segs[0] || 'hiring'}`
      return [
        res('Focus slice', chosen, T.good),
        res('Slices on radar', `${segs.length}`, segs.length >= 2 ? T.good : T.warn),
        res('Buyer role', scope, T.good),
        doc('Targeting note', `Overlap check: "${prod}" audiences that already buy adjacent tools \u2014 intercept their intent with a side-by-side.`),
      ]
    },
  },
  {
    id: 'marketing-swot-analysis',
    name: 'Marketing SWOT Analysis',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Collects the internal and external factors that move your marketing, then triggers the strategy move each quadrant implies.',
    tip: 'SWOT without a move is a mural. Force one, one actionable insight per quadrant \u2014 otherwise it fuels opinion, not output.',
    usage: [
      'Check every factor that is genuinely true.',
      'Count each quadrant.',
      'Run the suggested strategic move you actually commit to.',
    ],
    method: [
      'Each factor toggles a quadrant count.',
      'The heaviest quadrant drives the strategic posture.',
      'Commentary is written to be executed, not admired.',
    ],
    fields: [
      ck('swot18', 'Strengths (internal, helpful)', [
        'Strong brand awareness',
        'Proven content engine',
        'Low-cost acquisition channel',
        'Loyal, churn-resistant base',
      ]),
      ck('swot18w', 'Weaknesses (internal, harmful)', [
        'Thin SEO footprint',
        'Over-reliance on one channel',
        'Sluggish content output',
        'Weak conversion data',
      ]),
      ck('swot18o', 'Opportunities (external, helpful)', [
        'Underserved search niche',
        'New social platform early',
        'Competitor retreating',
        'New budget-friendly format',
      ]),
      ck('swot18t', 'Threats (external, harmful)', [
        'Bigger rivals entering',
        'Rising ad costs',
        'Algorithm dependencies',
        'Customer budget squeeze',
      ]),
    ],
    compute: (v) => {
      const s = asBoolList(v.swot18).filter(Boolean).length
      const w = asBoolList(v.swot18w).filter(Boolean).length
      const o = asBoolList(v.swot18o).filter(Boolean).length
      const t = asBoolList(v.swot18t).filter(Boolean).length
      const move = s + o >= w + t
        ? 'Build on strengths + pursue the ranked opportunity.'
        : w >= t
        ? 'Defend: fix the top weakness before new spend.'
        : 'Grow: pair an opportunity with the sharpest strength.'
      return [
        res('Strengths', s + ' flagged', s > 0 ? T.good : T.warn),
        res('Weaknesses', w + ' flagged', w <= 2 ? T.good : T.warn),
        res('Opportunities', o + ' flagged', o > 0 ? T.good : T.warn),
        res('Threats', t + ' flagged', t <= 2 ? T.good : T.warn),
        res('Strategic move', move, T.good),
      ]
    },
  },
  {
    id: 'competitor-analysis-template',
    name: 'Competitor Analysis Template',
    archetype: 'matrix',
    subject: SUBJECT,
    blurb:
      'Profiles three competitors across positioning, pricing, rating and channel posture to find the white space you are allowed to own.',
    tip: 'Pick the competitor where you have a 2x advantage on one axis \u2014 beating a leader everywhere at once is the plan nobody funds.',
    usage: [
      'Fill one competitor row per real player.',
      'Compare across the axes.',
      'Claim the axis where you are unambiguous best.',
    ],
    method: [
      'Each competitor is scored against the same axes.',
      'A strength/weakness read summarizes each row.',
      'The gap attack names the one axis to own.',
    ],
    fields: [
      txt('c1', 'Competitor #1', 2, 'Notion \u2014 all-in-one workspace'),
      txt('c2', 'Competitor #2', 2, 'Confluence \u2014 enterprise wiki'),
      txt('c3', 'Competitor #3', 2, 'old wiki plugin stack'),
      txt('pos1', 'Their positioning (C1)', 2, 'do everything, own your data'),
      txt('pos2', 'Their positioning (C2)', 2, 'secure docs for big orgs'),
      n('pr1', 'Price signal C1 ($/mo)', { def: 12, min: 0 }),
      n('pr2', 'Price signal C2 ($/mo)', { def: 7, min: 0 }),
      n('rt1', 'C1 rating', { def: 4.7, min: 0, max: 5, step: 0.1 }),
      n('rt2', 'C2 rating', { def: 4.2, min: 0, max: 5, step: 0.1 }),
    ],
    compute: (v) => {
      const c1 = asStr(v.c1) || 'C1'
      const c2 = asStr(v.c2) || 'C2'
      const c3 = asStr(v.c3) || 'C3'
      const rt1 = asNum(v.rt1)
      const rt2 = asNum(v.rt2)
      const gap = `SMB solo-owner docs at 1/2 the C1 price \u2014 leader is over-engineering, follower is over-built.`
      return [
        res('Best-rated', rt1 >= rt2 ? c1.split(' \u2014 ')[0] : c2.split(' \u2014 ')[0], T.good),
        res('Price spread', '$' + Math.min(asNum(v.pr1), asNum(v.pr2)) + '-' + '$' + Math.max(asNum(v.pr1), asNum(v.pr2)) + '/mo', T.good),
        res('White space', gap, rt1 - rt2 >= 0.3 ? T.good : T.warn),
        doc('Matrix summary',
          `\u2022 ${c1}\n   Position: ${asStr(v.pos1) || '-'} | Price $${asNum(v.pr1)} | Rating ${rt1}\n\u2022 ${c2}\n   Position: ${asStr(v.pos2) || '-'} | Price $${asNum(v.pr2)} | Rating ${rt2}\n\u2022 ${c3}\n   Gap entry point: the SMB solo-owner niche`),
      ]
    },
  },
  {
    id: 'campaign-brief-generator',
    name: 'Campaign Brief Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Compresses a campaign into a one-page brief \u2014 objective, audience, channels, creative, budget and the success metric \u2014 creatives actually read.',
    tip: 'A brief that lacks a single unambiguous success metric guarantees a post-mortem with two opinions about success.',
    usage: [
      'Answer the six fields in plain words.',
      'Run the one-page brief.',
      'Say back the creative idea in one sentence aloud.',
    ],
    method: [
      'Fields mirror the real approval sequence.',
      'Success metric is forced to be single and primary.',
      'Creative angle is scored for distinctiveness.',
    ],
    fields: [
      txt('name18', 'Campaign name', 2, 'Q3 retention push'),
      txt('obj18b', 'Objective', 2, 're-activate 800 lapsed accounts'),
      txt('aud18b', 'Audience', 2, 'paying users offline 60+ days'),
      txt('ch18b', 'Channels', 2, 'email, in-app banner, retargeting'),
      txt('idea18', 'Creative angle', 2, 'replay their best month'),
      sel('timeline18', 'Timeline', ['2 weeks', '1 month', '1 quarter'], '1 month'),
      n('budget18b', 'Budget ($)', { def: 15000, min: 0 }),
    ],
    compute: (v) => {
      const name = asStr(v.name18) || 'Campaign'
      const idea = asStr(v.idea18) || 'the angle'
      const distinct = idea.split(' ').length >= 3
      return [
        res('Readability', asStr(v.obj18b).length <= 90 ? 'One-liner' : 'Slow', asStr(v.obj18b).length <= 90 ? T.good : T.warn),
        res('Metric', asStr(v.obj18b) || '-', T.good),
        res('Angle distinct', distinct ? 'Distinct' : 'Generic', distinct ? T.good : T.warn),
        doc('One-page brief',
          `${name}\nObjective: ${asStr(v.obj18b) || '-'}\nAudience: ${asStr(v.aud18b) || '-'}\nChannels: ${asStr(v.ch18b) || '-'}\nCreative: ${idea}\nTimeline: ${asSel(v.timeline18)} | Budget: $${asNum(v.budget18b)}\nSuccess metric (only one): ____\nDone when: ____`),
      ]
    },
  },
  {
    id: 'marketing-goal-planner',
    name: 'Marketing Goal Planner',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Decomposes a headline revenue or pipeline goal into monthly, channel-level targets that a team can actually staff.',
    tip: 'Work backward from goal per channel, not forward from budget \u2014 backward math exposes the hiring case nobody wanted to have.',
    usage: [
      'Set the annual target.',
      'Assign channel revenue weights.',
      'Read the monthly per-channel target.',
    ],
    method: [
      'Reverse math flows from annual to monthly totals.',
      'Channel weights split the annual number realistically.',
      'Per-rep capacity frames the staffing implication.',
    ],
    fields: [
      n('goal18a', 'Annual revenue goal ($)', { def: 480000, min: 1000 }),
      n('organic18', 'Organic share (%)', { def: 30, min: 0, max: 100 }),
      n('paid18', 'Paid share (%)', { def: 40, min: 0, max: 100 }),
      n('sales18', 'Sales-assisted share (%)', { def: 30, min: 0, max: 100 }),
      n('rep18', 'Quota per rep / mo ($)', { def: 14000, min: 1000 }),
    ],
    compute: (v) => {
      const goal = asNum(v.goal18a)
      const org = asNum(v.organic18) / 100
      const paid = asNum(v.paid18) / 100
      const sales = asNum(v.sales18) / 100
      const sum = org + paid + sales || 1
      const month = Math.round(goal / 12)
      const orgM = Math.round(month * org / sum)
      const paidM = Math.round(month * paid / sum)
      const salesM = Math.round(month * sales / sum)
      const reps = Math.ceil(salesM / asNum(v.rep18))
      return [
        res('Monthly goal', '$' + month.toFixed(0), T.good),
        res('From organic', '$' + orgM.toFixed(0) + '/mo'),
        res('From paid', '$' + paidM.toFixed(0) + '/mo', T.good),
        res('Sales-assisted', '$' + salesM.toFixed(0) + '/mo', T.good),
        res('Reps implied', reps + (reps > 1 ? ' reps' : ' rep'), reps <= 3 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'smart-marketing-goals-generator',
    name: 'SMART Marketing Goals Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Converts a loose ambition into a SMART goal \u2014 Specific, Measurable, Achievable, Relevant, Time-bound \u2014 written to survive a Monday review.',
    tip: '"Write more content" fails SMART on four of five letters. The formula that passes: verb + metric + from X to Y + by date.',
    usage: [
      'State the ambition plainly.',
      'Add the metric and your numbers.',
      'Read the SMART rewrite, then assign an owner.',
    ],
    method: [
      'Each SMART letter is produced from the same inputs.',
      'Achievability is judged against progress rate math.',
      'A single primary metric is isolated as the north star.',
    ],
    fields: [
      txt('amb18', 'Ambition', 2, 'improve search traffic'),
      txt('mtr18', 'Metric to move', 2, 'organic sessions'),
      n('cur18', 'Current value', { def: 24000, min: 0 }),
      n('tgt18', 'Target value', { def: 33000, min: 0 }),
      sel('frame18', 'Timeframe', ['1 month', '3 months', '6 months'], '3 months'),
    ],
    compute: (v) => {
      const amb = asStr(v.amb18) || 'the ambition'
      const mtr = asStr(v.mtr18) || 'the metric'
      const cur = asNum(v.cur18)
      const tgt = asNum(v.tgt18)
      const frame = asSel(v.frame18)
      const lift = cur > 0 ? (tgt - cur) / cur * 100 : 0
      const perMonth = (tgt - cur) / (frame === '1 month' ? 1 : frame === '3 months' ? 3 : 6)
      const lines = [
        `Specific: ${amb} \u2014 focus only on ${mtr}.`,
        `Measurable: move ${mtr} from ${cur.toLocaleString()} to ${tgt.toLocaleString()}.`,
        `Achievable: that is ~${lift.toFixed(0)}% growth ${frame} \u2014 about ${perMonth.toFixed(0)}/month with focused effort.`,
        `Relevant: it feeds pipeline, the thing leadership reviews first.`,
        `Time-bound: re-audit by end of ${frame}.`,
        `Owner: ____`,
      ]
      return [
        res('SMART', lift >= 0 ? 'Passes all five' : 'Lower target needed', lift >= 0 ? T.good : T.bad),
        res('Trajectory', lift.toFixed(0) + '% over ' + frame, T.good),
        res('Monthly pace', perMonth.toFixed(0) + ' / mo', T.good),
        doc('SMART goal', lines.join('\n')),
      ]
    },
  },
]