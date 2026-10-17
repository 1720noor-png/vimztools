import { n, sel, txt, res, doc, T, asNum, asSel, asStr, clamp } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Email Marketing'

export const mod10: MarketingSeoSpec[] = [
  {
    id: 'email-subject-line-generator',
    name: 'Email Subject Line Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Batches subject lines in five psychological styles \u2014 curiosity, benefit, fear, personal and numbers \u2014 sized for the mobile preview pane.',
    tip: 'Preview-pane cut-off is real: keep subjects under 41 chars on mobile or drop the pay-off word into the preheader.',
    usage: [
      'Name your campaign\u2019s core promise.',
      'Pick two or three styles to test.',
      'A/B the top two against a re-send.',
    ],
    method: [
      'Each psychological frame targets a different opener neuron.',
      'Length is capped to the mobile preview window.',
      'Personalization and number tokens reappear in every style.',
    ],
    fields: [
      txt('prom10', 'Core promise', 2, 'Quiet VPN protection on 5 devices'),
      sel('sty10', 'Primary style', ['Curiosity', 'Benefit', 'Fear', 'Personal', 'Numbers', 'Urgency'], 'Benefit'),
      n('bt10', 'Lines to generate', { def: 6, min: 1, max: 12 }),
    ],
    compute: (v) => {
      const p = asStr(v.prom10) || 'your offer'
      const N = (asNum(v.bt10) || 6)
      const styles: Record<string, string[]> = {
        Curiosity: [`Who turned your log-in into a shield?`, `The one setting security pros flip on first`, `Your browser just got quieter`],
        Benefit: [`${p} \u2014 ready in 60 seconds`, `Protect 5 devices without slowing Netflix`, `Install once. Sleep better tonight.`],
        Fear: [`Still on the default password?`, `That public Wi-Fi leak is avoidable`, `Your kids\u2019 tablets are exposed`],
        Personal: [`Today\u2019s VPN update is for you`, `We noticed 3 devices offline`, `Your renewal reminder, simplified`],
        Numbers: [`5 devices, 1 plan, 0 slowdowns`, `Setup in 60 seconds \u2014 3 steps`, `${N} reasons to patch tonight`],
        Urgency: [`24h left on the family plan`, `Tonight: security week pricing`, `Last call \u2014 5-device plan`],
      }
      const pool = styles[asSel(v.sty10)] ?? styles.Benefit
      const out = pool.map((s, i) => `${i % 2 ? '\u2605 ' : '> '}${s}`).slice(0, Math.min(N, pool.length))
      return [
        res('Style', asSel(v.sty10), T.good),
        res('Mobile-safe', out.every((s) => s.replace(/[^\w ]/g, '').length <= 41) ? `${out.length}/${out.length} under 41 chars` : 'Longer than ideal', T.good),
        doc('Subject lines', [...pool.slice(0, Math.min(N, pool.length))].join('\n')),
      ]
    },
  },
  {
    id: 'email-copy-generator',
    name: 'Email Copy Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes a complete promotional email \u2014 subject, preheader, body, bullets and CTA \u2014 from your promise and target list.',
    tip: 'Structure for scan: one idea per paragraph, 2-3 bullet proof points, and a single unmissable CTA above the fold.',
    usage: [
      'Describe the offer and who receives it.',
      'Add the proof and deadline.',
      'Personalize the send name and CTA URL.',
    ],
    method: [
      'Preheader continues the subject line\u2019s unfinished thought.',
      'Body alternates short lines and scannable bullets.',
      'The CTA is repeated with a soft second link in the P.S.',
    ],
    fields: [
      txt('offer10', 'The offer', 2, '30% off the annual security plan'),
      txt('list10', 'Audience', 2, 'free-plan users, 6+ months inactive'),
      txt('proof10b', 'Proof / social proof', 2, '4.8/5 from 12k reviews'),
      txt('dead10', 'Deadline', 2, 'ends Friday midnight'),
    ],
    compute: (v) => {
      const offer = asStr(v.offer10) || 'your offer'
      const list = asStr(v.list10) || 'your readers'
      const proof = asStr(v.proof10b) || 'loved by customers'
      const dead = asStr(v.dead10) || 'soon'
      const raw = [
        `Subject: ${offer} \u2014 ${dead}`,
        `Preheader: just for ${list}.`,
        '',
        `Hey there,`,
        `You\u2019ve been on the free tier for a while \u2014 time to unlock the full speed.`,
        `\u2022 ${offer}`,
        `\u2022 ${proof}`,
        `\u2022 No contract, cancel anytime`,
        '',
        `Claim it now: [CTA] \u2014 ${dead}.`,
        '',
        `P.S. Still unsure? Reply \u201cquestions\u201d and a human answers within a day.`,
      ].join('\n')
      return [
        res('Structure', 'Subject + preheader + CTA', T.good),
        res('Read time', '< 30 seconds', T.good, 'Scannable emails win the phone inbox'),
        doc('Full email', raw),
      ]
    },
  },
  {
    id: 'cold-email-generator',
    name: 'Cold Email Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Drafts a curiosity-driven cold email that names the prospect\u2019s problem, hints your fix, and asks only for a 10-minute slot.',
    tip: 'Send Tuesday-Thursday mornings and keep the ask tiny: "call with thoughts?" beats "demo scheduled?" on thread-open rates.',
    usage: [
      'Enter the prospect and their known problem.',
      'Describe your specific angle.',
      'Personalize the first line with a recent sign.',
    ],
    method: [
      'The subject teaser triggers relevance, not spam words.',
      'Problem naming builds instant empathy before any pitch.',
      'A micro-CTA (reply with thoughts) lowers the reply cost.',
    ],
    fields: [
      txt('pro10', 'Prospect persona', 2, 'VP of Growth at a SaaS startup'),
      txt('prob10', 'Their known problem', 2, 'churn after the free trial'),
      txt('fix10', 'Your fix / differentiator', 2, 'a 10-min churn call-out review'),
    ],
    compute: (v) => {
      const who = asStr(v.pro10) || 'you'
      const prob = asStr(v.prob10) || 'a problem you solve'
      const fix = asStr(v.fix10) || 'a fast fix'
      const raw = [
        `Subject: ${prob.split(' ').slice(0, 4).join(' ')}? (short version)`,
        '',
        `Hi {{first_name}},`,
        `I left you a 90-second loom: I think ${prob} is costing your team numbers every week`,
        `We help ${who} fix exactly that with ${fix} \u2014 no long deck attached.`,
        `Down for 10 minutes this week to compare notes? Reply with a time.`,
        '',
        `Best,\nAlex`,
      ].join('\n')
      return [
        res('Word count', `${raw.split(' ').length}`, raw.split(' ').length <= 120 ? T.good : T.warn, 'Cold emails under 120 words win'),
        res('Ask', '10-minute micro-CTA', T.good),
        doc('Cold email', raw),
      ]
    },
  },
  {
    id: 'newsletter-generator',
    name: 'Newsletter Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Plans a weekly newsletter with a hook headline, three curated links with one-line takes, and a reader-engagement close.',
    tip: 'Pick 3 links max per issue and write one personal line per link \u2014 curation with opinion is the entire value.',
    usage: [
      'Name the issue theme.',
      'Jot 3 links with your take for each.',
      'Generate, then staple on your own opener voice.',
    ],
    method: [
      'A theme headline focuses the issue\u2019s promise.',
      'Each curated item pairs the link with a distinct take.',
      'A signature question drives replies and list warmth.',
    ],
    fields: [
      txt('theme10', 'Issue theme', 2, 'three lessons from a failed product launch'),
      txt('link1', 'Link 1 + your take', 2, 'postmortem post \u2014 the pricing silence killed it'),
      txt('link2', 'Link 2 + your take', 2, 'retention metrics deep-dive \u2014 real churn math'),
      txt('link3', 'Link 3 + your take', 2, 'interview \u2014 what they\u2019d redo'),
    ],
    compute: (v) => {
      const theme = asStr(v.theme10) || 'your theme'
      const links = [asStr(v.link1), asStr(v.link2), asStr(v.link3)].filter(Boolean)
      const raw = [
        `# ${theme}`,
        '',
        ...links.map((l, i) => `${i + 1}. ${l}`),
        '',
        `One question for you: what\u2019s your rule for unpausing a paused campaign?`,
      ].join('\n')
      return [
        res('Curated links', `${links.length}/3`, links.length >= 2 ? T.good : T.warn),
        res('Engagement close', 'Question hook', T.good),
        doc('Newsletter skeleton', raw),
      ]
    },
  },
  {
    id: 'welcome-email-generator',
    name: 'Welcome Email Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Composes the high-open welcome sequence opener\u2019s first email and sequences the follow-ups so new subscribers join an activated list.',
    tip: 'Welcome emails earn 4x the open rate of business-as-usual mail \u2014 send the first one within 5 minutes of signup.',
    usage: [
      'Define the signup promise you made.',
      'Add the immediate next step for them.',
      'Schedule email 1 instantly, email 2 three days later.',
    ],
    method: [
      'Email 1 re-states the signup promise and delivers instant value.',
      'Email 2 adds the one- action activation step.',
      'Email 3 transitions to a soft commercial CTA.',
    ],
    fields: [
      txt('prom10w', 'Signup promise', 2, 'the free SEO checklist'),
      txt('next10w', 'Immediate next step', 2, 'run the checklist on your homepage'),
      txt('ttl10w', 'Bonus value', 2, 'a 5-minute screencast of the audit'),
    ],
    compute: (v) => {
      const prom = asStr(v.prom10w) || 'the promised asset'
      const next = asStr(v.next10w) || 'try it today'
      const bonus = asStr(v.bonus10w || '')
      const raw = [
        `Subject: You\u2019re in \u2014 here\u2019s ${prom}`,
        '',
        `Welcome! Before anything else: ${bonus ? `open ${bonus} first \u2014 it makes everything clearer.` : 'here is what we promised you.'}`,
        `Your action item: ${next}.`,
        `Next I\u2019ll send the exact audit borrowers fast in 3 days.`,
        `Talk soon.`,
      ].join('\n')
      return [
        res('First-open velocity', '<= 5 min', T.good),
        res('Sequence length', '3 emails', T.good),
        doc('Welcome email 1', raw),
      ]
    },
  },
  {
    id: 'follow-up-email-generator',
    name: 'Follow-up Email Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Composes the non-pushy follow-up that politely re-raises your prior email and adds one new piece of value to justify a second look.',
    tip: 'Wait 3-4 days between sends, change the subject line, and add fresh value \u2014 the "bumping" subject nearly doubles re-opens.',
    usage: [
      'Recap the original ask in one line.',
      'Add one new nugget they missed.',
      'Send between 3-4 days after the first.',
    ],
    method: [
      'Re-opener signals this is a continuation, not a duplicate.',
      'New value justifies the second email\u2019s existence.',
      'The CTA shrinks further to feel lighter than round one.',
    ],
    fields: [
      txt('og10', 'Original ask', 2, 'quick call about your ad spend'),
      txt('nug10', 'New nugget', 2, 'a screenshot of a similar brand\u2019s winning structure'),
      sel('st10', 'Subject strategy', ['Bump: RE:', 'New value', 'Soft case study'], 'New value'),
    ],
    compute: (v) => {
      const ask = asStr(v.og10) || 'your original ask'
      const nug = asStr(v.nug10) || 'a useful detail'
      const raw = [
        `Subject: ${asSel(v.st10) === 'Bump: RE:' ? 'RE: ' + ask : asSel(v.st10) === 'Soft case study' ? 'A short case study you might like' : 'one more thing on ' + ask}`,
        '',
        `Just gently bumping my last email about ${ask}.`,
        `New nugget: ${nug} \u2014 hope it helps either way.`,
        `If now is busy, totally fine. If you want the two-sentence version, reply "short".`,
      ].join('\n')
      return [
        res('Timing', '3-4 days', T.good),
        res('Subject', asSel(v.st10), T.good),
        res('Pressure', 'Low \u2014 optional exit', T.good),
        doc('Follow-up', raw),
      ]
    },
  },
  {
    id: 'abandoned-cart-email-generator',
    name: 'Abandoned Cart Email Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes the three-part abandoned cart sequence \u2014 1h reminder, 24h social proof, 48h incentive \u2014 that recovers borderline carts.',
    tip: 'Send email 1 within the hour: carts recovered in the first 90 minutes convert at roughly double the 24h send.',
    usage: [
      'Name the cart reminder focus for each send.',
      'Set the timing in your ESP.',
      'Personalize with the actual product image + price.',
    ],
    method: [
      'Email 1 removes friction by reminding them of the item.',
      'Email 2 adds reviews and stock scarcity.',
      'Email 3 closes with an incentive and a clear deadline.',
    ],
    fields: [
      txt('prod10c', 'Product left behind', 2, 'the AeroGear 20L backpack'),
      n('pr10c', 'Price ($)', { def: 89, min: 0 }),
      txt('inc10c', 'Incentive', 2, 'free shipping + 10% off'),
    ],
    compute: (v) => {
      const prod = asStr(v.prod10c) || 'your product'
      const price = asNum(v.pr10c)
      const inc = asStr(v.inc10c) || 'a little extra'
      const raw = [
        `Email 1 (1h): \u201cYour ${prod} ($${price}) is still waiting\u201d \u2014 1-click back to checkout.`,
        `Email 2 (24h): \u201dPeople love the ${prod} \u2014 4.8/5\u201d + review proof.`,
        `Email 3 (48h): \u201cWe saved ${inc} for you \u2014 ends tonight.\u201d`,
      ].join('\n')
      return [
        res('Sequence', `${prod ? 3 : 3} emails`, T.good),
        res('First send', 'Within 1 hour', T.good),
        doc('Cart recovery sequence', raw),
      ]
    },
  },
  {
    id: 'promotional-email-generator',
    name: 'Promotional Email Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Composes promo campaign copy with a single hero focus, a deadline, and urgency that converts readers into clicks.',
    tip: 'One offer per email \u2014 split tests show single-focus promos routinely double click-through versus multi-offer shotgun sends.',
    usage: [
      'Enter the hero offer and discount.',
      'Set the deadline for real urgency.',
      'Use the variant block for day-of and last-call sends.',
    ],
    method: [
      'Hero framing concentrates the reader on one action.',
      'Countdown and deadline tokens create scarcity pressure.',
      'A "last call" variant re-sends only to non-openers.',
    ],
    fields: [
      txt('hero10', 'Hero offer', 2, 'Buy one, get one 50% off'),
      txt('prod10p', 'Product range', 2, 'all running gear'),
      txt('date10p', 'Deadline', 2, 'Sunday, 11:59pm'),
    ],
    compute: (v) => {
      const hero = asStr(v.hero10) || 'your offer'
      const range = asStr(v.prod10p) || 'our range'
      const date = asStr(v.date10p) || 'soon'
      const raw = [
        `Subject: ${hero} on ${range}`,
        `Preheader: ends ${date}.`,
        '',
        `This weekend only: ${hero} across ${range.toLowerCase()}.`,
        `No code needed \u2014 discount applied automatically at checkout.`,
        `Go: [CTA] before ${date}.`,
      ].join('\n')
      return [
        res('Focus', 'Single hero offer', T.good),
        res('Urgency', date, T.good),
        doc('Promo email', raw),
      ]
    },
  },
  {
    id: 'email-cta-generator',
    name: 'Email CTA Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Produces a stack of email button copy alternatives with the benefit-verb style matched to your campaign stage.',
    tip: 'Put the outcome in the button: "Get the template" beats "Download" \u2014 outcome-first CTAs lift click-through by a fifth on average.',
    usage: [
      'Name the desired action.',
      'Choose the funnel stage.',
      'Pick the strongest button variant.',
    ],
    method: [
      'Stage drives verb strength (read vs book vs buy).',
      'Outcome phrasing appears in the primary variants.',
      'Length is kept button-friendly for mobile rendering.',
    ],
    fields: [
      txt('act10x', 'Desired action', 2, 'download the audit template'),
      sel('stage10x', 'Funnel stage', ['Cold read', 'Warm conversion', 'Hot purchase'], 'Warm conversion'),
    ],
    compute: (v) => {
      const act = asStr(v.act10x) || 'get the thing'
      const stage = asSel(v.stage10x)
      const verbs = stage === 'Cold read' ? ['See how it works', 'Read the full guide'] : stage === 'Hot purchase' ? ['Buy now', 'Start my plan'] : ['Get the template', 'Claim the audit', 'Download free']
      const raw = [`\u2022 ${verbs[0]} \u2014 ${act}`, `\u2022 ${verbs[1]}`, `\u2022 ${verbs[2]} \u2192`].join('\n')
      return [
        res('Stage-verb match', stage, T.good),
        res('Outcome-first', 'Yes', T.good),
        doc('CTA variants', raw),
      ]
    },
  },
  {
    id: 'email-preview-tool',
    name: 'Email Preview Tool',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Slices your subject, preheader and first line through a 5-inch screen simulator to surface where the preview-pane cut happens.',
    tip: 'Vital copy lives above the fold on all devices \u2014 preheader under 85 chars and the ask within the first two lines.',
    usage: [
      'Enter subject, preheader and first line.',
      'Run the preview-pane simulation.',
      'Trim until the CTA shows cleanly uncut.',
    ],
    method: [
      'Simulated character budgets mirror iPhone and Gmail desktop panes.',
      'Each field is scored against its cutoff risk.',
      'The verdict flags the exact element too long to survive preview.',
    ],
    fields: [
      txt('sub10v', 'Subject line', 2, 'Your quiet internet is 60 seconds away'),
      txt('pre10v', 'Preheader', 2, 'One-click updates, zero tracking.'),
      txt('line10v', 'First body line', 2, 'Hey Alex, we wrapped your privacy upgrade.'),
    ],
    compute: (v) => {
      const sub = asStr(v.sub10v)
      const pre = asStr(v.pre10v)
      const mobileBudget = { sub: 41, pre: 85, line: 120 }
      const ok = sub.length <= mobileBudget.sub && pre.length <= mobileBudget.pre
      const culprit = sub.length > mobileBudget.sub ? 'subject' : pre.length > mobileBudget.pre ? 'preheader' : ok ? 'none' : 'body'
      return [
        res('Mobile-safe', ok ? 'Pass' : 'Trim ' + culprit, ok ? T.good : T.warn),
        res('Subject', `${sub.length}/${mobileBudget.sub} chars`, sub.length <= mobileBudget.sub ? T.good : T.warn),
        res('Preheader', `${pre.length}/${mobileBudget.pre} chars`, pre.length <= mobileBudget.pre ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'email-length-checker',
    name: 'Email Length Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Scores your email draft against the readability sweet spot \u2014 word count, sentences, sections and paragraph density.',
    tip: 'Aim for 150 words or under per email; if you exceed 250, split it into a short email plus a linked article.',
    usage: [
      'Paste your draft into the main field.',
      'Review counts and density score.',
      'Trim paragraphs flagged as walls of text.',
    ],
    method: [
      'Word and sentence counts feed a readability regression model.',
      'Paragraph density penalizes unbroken text blocks.',
      'The final score targets the industry open-and-read sweet spot.',
    ],
    fields: [
      txt('body10l', 'Email draft', 8, 'Subject: Quick update\n\nHi team,\n\nWe shipped the new dashboard. It should make reporting much faster, and I hope you love the new filters. There is a lot more coming next month, and I wanted to share the roadmap with you all before we announce it publicly.'),
    ],
    compute: (v) => {
      const body = asStr(v.body10l)
      const words = body.split(/\s+/).filter(Boolean).length
      const paras = body.split(/\n\s*\n/).filter((p) => p.trim()).length
      const sentences = (body.match(/[.!?]+(\s|$)/g) ?? []).length
      const score = Math.round(clamp(100 - Math.abs(words - 150) * 0.4 - (paras < 3 ? (3 - paras) * 5 : 0) - (sentences > 12 ? (sentences - 12) * 3 : 0), 0, 100))
      return [
        res('Word count', `${words}`, words <= 200 ? T.good : T.warn, '150 is the sweet spot'),
        res('Readability score', `${score}%`, score >= 70 ? T.good : T.warn),
        res('Paragraphs', `${paras}`, paras >= 3 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'email-spam-word-checker',
    name: 'Email Spam Word Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Flags high-risk terms in your subject and preview text that trip modern spam filters and kill deliverability.',
    tip: 'Avoid ALL-CAPS words, "$" symbols, and urgency spam terms; one flagged phrase can put your whole campaign in the junk tray.',
    usage: [
      'Paste the subject and preview.',
      'Run the spam-token scan.',
      'Rewrite flagged phrases before the send.',
    ],
    method: [
      'Known trigger families (money, urgency, claims) are scanned.',
      'Shouting (all-caps) and symbols add compounding risk.',
      'The final risk tone guides a safe rewrite.',
    ],
    fields: [
      txt('sub10sp', 'Subject line', 2, 'FREE $1000 GIFT inside \u2014 act now!!'),
      txt('pre10sp', 'Preheader', 2, 'double your money today guaranteed'),
    ],
    compute: (v) => {
      const sub = asStr(v.sub10sp) + ' ' + asStr(v.pre10sp)
      const u = sub.toLowerCase()
      const triggers = ['free', '$', 'win', 'guarantee', 'act now', 'limited time', 'offer expires', 'opportunity', '100%', 'urgent', '!!!', 'order now', 'click here']
      const hits = triggers.filter((t) => u.includes(t, 0) || u.includes(t))
      const caps = (sub.match(/[A-Z]{3,}/g) ?? []).length
      const risk = Math.min(100, hits.length * 18 + caps * 14)
      return [
        res('Spam risk', `${risk}%`, risk < 30 ? T.good : risk < 60 ? T.warn : T.bad),
        res('Trigger tokens', `${hits.length}`, hits.length < 2 ? T.good : T.warn, hits.length ? hits.join(', ') : 'None'),
        res('All-caps blocks', `${caps}`, caps === 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'email-signature-generator',
    name: 'Email Signature Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds a compliant email signature with name, role, contact, link stack and one social handle \u2014 culled for the professional inbox.',
    tip: 'Cap your signature at 3 lines plus a 2-link stack; oversized signatures get stripped by Gmail\u2019s overflow clamp.',
    usage: [
      'Add your details and role.',
      'Pick the link stack.',
      'Paste into your mail client\u2019s signature setting.',
    ],
    method: [
      'Contact fields are stacked for cross-client rendering.',
      'One social link prevents signature bloat.',
      'The layout keeps everyone\u2019s mail client happy.',
    ],
    fields: [
      txt('nm10g', 'Name', 2, 'Alex Morgan'),
      txt('role10g', 'Role & company', 2, 'SEO Lead \u2014 Brightly'),
      txt('em10g', 'Email & phone', 2, 'alex@brightly.co \u00b7 +1 555-0100'),
      txt('site10g', 'Website', 2, 'brightly.co'),
      sel('soc10g', 'Social link', ['LinkedIn', 'X/Twitter', 'GitHub', 'None'], 'LinkedIn'),
    ],
    compute: (v) => {
      const raw = [
        `\u2014`,
        `${asStr(v.nm10g) || 'Your Name'}`,
        `${asStr(v.role10g) || 'Role \u2014 Company'}`,
        `${asStr(v.em10g) || 'email \u00b7 phone'}`,
        `${asStr(v.site10g) || 'your site'} \u00b7 ${asSel(v.soc10g) === 'None' ? '' : asSel(v.soc10g)}`,
      ].join('\n')
      return [
        res('Lines', '5', T.good, 'Kept under the Gmail overflow clamp'),
        res('Link stack', asSel(v.soc10g) === 'None' ? 'Site only' : 'Site + ' + asSel(v.soc10g), T.good),
        doc('Signature', raw),
      ]
    },
  },
]