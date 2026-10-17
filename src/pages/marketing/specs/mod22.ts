import { n, sel, txt, res, doc, T, asNum, asSel, asStr } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'PR & Media Marketing'

export const mod22: MarketingSeoSpec[] = [
  {
    id: 'press-release-generator',
    name: 'Press Release Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes a press-ready release in inverted-pyramid order \u2014 headline, who what where, quote, boilerplate \u2014 under 500 words.',
    tip: 'Journalists skim the first 100 words. Put the answer to "why should anyone care" in the second paragraph, or the pitch dies there.',
    usage: [
      'State the announcement in one sentence.',
      'Add the quote and the factual drop.',
      'Distribute only if it passes the 100-word test.',
    ],
    method: [
      'Inverted pyramid orders facts before color.',
      'The second paragraph carries the "who cares" payload.',
      'A quote and boilerplate close the standard format.',
    ],
    fields: [
      txt('ann22', 'The announcement', 2, 'we raised $8M to automate payroll for freelancers'),
      txt('addr22', 'For whom it changes', 2, 'freelancers billing across borders'),
      txt('quote22', 'Founder quote', 2, 'every freelancer should get paid at Friday speed'),
      txt('loc22', 'Dateline', 2, 'berlin'),
    ],
    compute: (v) => {
      const ann = asStr(v.ann22) || 'the announcement'
      const addr = asStr(v.addr22) || 'the audience it changes'
      const quote = asStr(v.quote22) || 'the founder quote'
      const loc = asStr(v.loc22) || 'the city'
      const raw = [
        `FOR IMMEDIATE RELEASE \u2014 ${cap22(loc)}, vimz.ai timezone`,
        `\nHEADLINE: ${cap22(ann)}.`,
        `\n${cap22(loc)} \u2014 ${cap22(ann)}, a change most felt by ${addr}.`,
        `Available today; numbers and customer references are factual and can be verified on request.`,
        `\nQUOTE: "${cap22(quote)}." \u2014 Founder, vimz.ai`,
        `\nABOUT: vimz.ai gives every browser 200+ tools. ${cap22(ann.split(' to ')[1] ?? ann)}.`,
        `Contact: pr@vimz.ai \u2014 assets on request. ###`,
      ].join('\n')
      const wc = raw.split(/\s+/).length
      return [
        res('Words', wc + ' / 500', wc <= 500 ? T.good : T.warn),
        res('Who cares', addr.split(' ').length <= 9 ? 'Stated early' : 'Tighten', T.good),
        res('Quote', quote.split(' ').length <= 12 ? 'Kept short' : 'Cut 10 words', quote.split(' ').length <= 12 ? T.good : T.warn),
        res('Boilerplate', 'Included', T.good),
        doc('Press release', raw),
      ]
    },
  },
  {
    id: 'press-release-headline-generator',
    name: 'Press Release Headline Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Produces headline variants \u2014 declarative, numbers-first, curiosity \u2014 calibrated to the medium they are pitched into.',
    tip: 'For wire distribution use the numbers-first headline; for emailing a beat reporter use the curiosity one \u2014 same story, two doors.',
    usage: [
      'Enter the news hook.',
      'Pick the outlet mood.',
      'Test both headlines with one reporter before publishing.',
    ],
    method: [
      'The declarative, numbers and curiosity formulas run in parallel.',
      'Medium fit is scored per headline type.',
      'A hook-grab check keeps the strongest fact at the front.',
    ],
    fields: [
      txt('hook22', 'News hook', 2, '80% of freelance invoices paid late last quarter'),
      txt('stat22', 'The number', 2, '$1.2B owed late to US freelancers'),
      sel('outlet22', 'Outlet mood', ['Wire / business', 'Consumer tech', 'Trade local'], 'Wire / business'),
    ],
    compute: (v) => {
      const hook = asStr(v.hook22) || 'the hook'
      const stat = asStr(v.stat22) || 'the number'
      const mood = asSel(v.outlet22)
      const variants = [
        `Freelancers Are Owed ${stat} \u2014 And It Is Growing`,
        `${hook}: Report`,
        `The Invoice That Fixed ${cap22(hook.split(' ').slice(-3).join(' '))}`,
      ]
      const pick = mood === 'Wire / business' ? variants[1] : mood === 'Consumer tech' ? variants[2] : variants[0]
      return [
        res('Numbers-first', stat.includes('$') ? 'Leads with $' : 'Add currency', stat.includes('$') ? T.good : T.warn),
        res('For this outlet', pick, T.good),
        res('Under 80 chars', variants.every((v) => v.length <= 80) ? 'All clean' : 'Check', T.good),
        doc('Headlines', variants.map((v, i) => `#${i + 1} ${v}`).join('\n')),
      ]
    },
  },
  {
    id: 'media-pitch-generator',
    name: 'Media Pitch Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes the 90-second media pitch \u2014 the story, why it fits their beat, and the concrete angle you hand the reporter.',
    tip: 'Pitch the story their reader cares about, not your launch. If you cannot finish the sentence "Their readers will click because ___", do not send it.',
    usage: [
      'Frame the story around reader interest.',
      'Reference their recent coverage.',
      'Offer the angle as a hook, not a claim.',
    ],
    method: [
      'The pitch opens on the reader-value sentence first.',
      'Beat-fit references personalize the pitch.',
      'A specific angle caps the pitch at one ask.',
    ],
    fields: [
      txt('story22', 'Story', 2, 'independent creators now out-earn agency median for the first time'),
      txt('beat22', 'Why their beat', 2, 'you covered creator economy labor last March'),
      txt('angle22', 'The angle you hand them', 2, 'a printable Federal-State rate map per creative niche'),
      txt('hookL22', 'Reader click reason', 2, 'their readers bill clients and can compare own rate'),
    ],
    compute: (v) => {
      const story = asStr(v.story22) || 'the story'
      const beat = asStr(v.beat22) || 'their beat'
      const angle = asStr(v.angle22) || 'the angle'
      const reason = asStr(v.hookL22) || 'the reader payoff'
      const pitch = [
        `Hi [First], `,
        `I have a story that pays off your readers: ${reason}.`,
        `In short: ${story}.`,
        `It fits what you covered in ${beat}.`,
        `The angle I can hand you pre-packaged: ${angle} \u2014 data included, no embargo pressure.`,
        `Reply "send" and it is yours today.`,
      ].join('\n')
      const clicky = reason.split(' ').length <= 12
      return [
        res('Click reason', clicky ? 'Clear' : 'Sharpen', clicky ? T.good : T.warn),
        res('Beat-fit', beat.split(' ').length <= 10 ? 'Specific' : 'Generic', T.good),
        res('One ask', 'Angle offered, not demanded', T.good),
        doc('Pitch', pitch),
      ]
    },
  },
  {
    id: 'journalist-outreach-email-generator',
    name: 'Journalist Outreach Email Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds the first-touch journalist email \u2014 100-word, specific-to-their-beat, value-first \u2014 engineered to get one reply line.',
    tip: 'Personalize with their coverage, not their name. "You covered X" triples replies; "Dear Sir" ends the thread at open.',
    usage: [
      'Reference one article they wrote.',
      'Give the story in two sentences.',
      'Offer a single concrete reason to reply.',
    ],
    method: [
      'The email front-loads their-beat relevance.',
      'Two-sentence story rule keeps the ask light.',
      'A low-friction reply offer lowers the barrier.',
    ],
    fields: [
      txt('cov22', 'Article they wrote', 2, 'your March piece on gig-worker banking'),
      txt('sto22', 'Your story (2 sentences)', 2, 'creators now form their own banks. Here is the data and three founders to talk to.'),
      txt('ask22', 'The low-friction ask', 2, 'want the survey of 1,200 creators we ran?'),
      txt('joe22', 'Their outlet', 2, 'your newsletter'),
    ],
    compute: (v) => {
      const cov = asStr(v.cov22) || 'their recent piece'
      const sto = asStr(v.sto22) || 'the story'
      const ask = asStr(v.ask22) || 'the ask'
      const outlet = asStr(v.joe22) || 'your outlet'
      const email = [
        `Hi [First], `,
        `Loved ${cov} \u2014 the angle on fees was sharp.`,
        `The parallel I am chasing for ${outlet}: ${sto}`,
        `If useful: ${ask} \u2014 no strings.`,
        `You are the only person I am sending this to today. Hope it is useful.`,
      ].join('\n')
      const wc = sto.split(' ').length
      const refd = cov.split(' ').length >= 3
      return [
        res('Story length', wc + ' words', wc <= 26 ? T.good : T.warn, '2 sentences rule'),
        res('Delighted reference', refd ? 'Specific coverage' : 'Say a real thing', refd ? T.good : T.warn),
        res('Low-friction ask', ask.split(' ').length <= 14 ? 'Yes' : 'Simplify', T.good),
        res('Uniqueness', 'You-are-the-only-one line', T.good),
        doc('Email', email),
      ]
    },
  },
  {
    id: 'pr-campaign-planner',
    name: 'PR Campaign Planner',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Programs a PR push \u2014 announcement, embargo window, media tier and follow-up cadence \u2014 sequenced like a launch, not a spray.',
    tip: 'An embargo turns a weak beat into a timeline asset: 5 embargoed exclusives outrank 50 "please cover" blasts.',
    usage: [
      'Pick announcement tier and embargo.',
      'Sequence the media tiers.',
      'Review the follow-up cadence list.',
    ],
    method: [
      'Exclusive and embargo sequencing precede the wide release.',
      'Media tiers are sequenced by leverage, not alphabet.',
      'Follow-up cadence is capped and precise.',
    ],
    fields: [
      sel('tier22', 'Announcement tier', ['Product launch', 'Funding', 'Milestone / social proof'], 'Product launch'),
      sel('embargo22', 'Embargo', ['None', '48h', '7 days'], '7 days'),
      n('outlets22', 'Tier-1 outlets', { def: 4, min: 0 }),
      n('midOut22', 'Tier-2 outlets', { def: 12, min: 0 }),
    ],
    compute: (v) => {
      const tier = asSel(v.tier22)
      const emb = asSel(v.embargo22)
      const t1 = asNum(v.outlets22)
      const t2 = asNum(v.midOut22)
      const total = t1 + t2
      const week = t1 >= 3 ? 'Day 0-3' : 'Day 0-7'
      const cadence = [
        `Day -7: brief 2 exclusives (${emb === 'None' ? 'no embargo' : emb + ' embargo'})`,
        `Day 0: ${tier} announcement \u2014 Tier-1 (${t1} outlets) email`,
        `Day 1: Tier-2 (${t2} outlets) + asset pack`,
        `Day 3: follow-up with the teaser number`,
        `Day 7: thank-you + success metric to the ones that ran it`,
      ].join('\n')
      return [
        res('Embarco strategy', emb === 'None' ? 'Open blast' : emb + ' embargo', T.good),
        res('Coverage math', total + ' targeted outlets', total >= 10 ? T.good : T.warn),
        res('First move', week, T.good),
        doc('PR plan', `${tier} push\nActive: ${week}\n\n${cadence}`),
      ]
    },
  },
  {
    id: 'media-contact-email-generator',
    name: 'Media Contact Email Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes the email to a media contact \u2014 outlet, audience fit, sample angle, asset promise \u2014 that makes the reply coche by design.',
    tip: 'Attach zero files to the first email. Promise the assets and let them ask \u2014 attachments silently raise the spam probability.',
    usage: [
      'Describe the contact\u2019s audience.',
      'Align your story to that audience.',
      'Promise assets, attach none.',
    ],
    method: [
      'Audience-fit opens before your story.',
      'The sample angle is journalist-shaped, not sales-shaped.',
      'An asset promise replaces attachments on first touch.',
    ],
    fields: [
      txt('aud22c', 'Their audience', 2, 'local retailers within 200 miles'),
      txt('story22c', 'Your hook for them', 2, 'a local-first delivery network revives 12 town centers'),
      txt('asset22c', 'Assets you can share', 2, 'map, photos, founders, a 1-min video'),
      sel('fmt22c', 'Deliverable', ['Interview', 'Guest piece', 'Data story'], 'Interview'),
    ],
    compute: (v) => {
      const aud = asStr(v.aud22c) || 'their audience'
      const story = asStr(v.story22c) || 'the hook'
      const asset = asStr(v.asset22c) || 'the assets'
      const fmt = asSel(v.fmt22c)
      const email = [
        `Hi [Name], `,
        `Your readers in ${aud} are living a problem we can name: ${story}.`,
        `Happy to offer: ${asset}.`,
        `Best shape: a ${fmt.toLowerCase()} \u2014 I can have both founders and the map ready by [date].`,
        `Assets come on request. Thanks for considering.`,
      ].join('\n')
      const local = /\b(within|local|nearby|street|town)\b/i.test(story)
      return [
        res('Audience-first', aud.split(' ').length <= 8 ? 'Pinpointed' : 'Widen?', T.good),
        res('Freight hook', local ? 'Local angle alive' : 'Add local texture', local ? T.good : T.warn),
        res('No attachments', 'Promised only', T.good),
        res('Deliverable', fmt, T.good),
        doc('Email', email),
      ]
    },
  },
  {
    id: 'newsworthy-story-idea-generator',
    name: 'Newsworthy Story Idea Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Screens story candidates through five newsworthiness filters and promotes the ones reporters would actually run.',
    tip: 'Newsworthiness = new + big + local + timely. A story scoring 2 of 4 gets covered once; 3 of 4 gets a series.',
    usage: [
      'Brainstorm candidate hooks.',
      'Score each against the five filters.',
      'Push only the 3+ scorers to reporters.',
    ],
    method: [
      'Five filters \u2014 novelty, scale, proximity, timeliness, surprise.',
      'Each filter converts to points; a gate blocks low scores.',
      'Crossover angles get promoted for the pitch list.',
    ],
    fields: [
      txt('story22s', 'Candidate story', 2, 'we now offset order-by-order carbon instantly'),
      sel('new22', 'Novelty', ['Genuinely new', 'Refresh of idea', 'Been covered'], 'Refresh of idea'),
      sel('scale22', 'Scale', ['Big numbers', 'Niche but real', 'Tiny'], 'Niche but real'),
      sel('proxim22', 'Proximity', ['Local community', 'National', 'Global'], 'Local community'),
      sel('soon22', 'Timeliness', ['This week gated', 'Evergreen', 'Busy-season'], 'This week gated'),
    ],
    compute: (v) => {
      const story = asStr(v.story22s) || 'the story'
      const pts = (x: string) => {
        if (x === 'Genuinely new' || x === 'Big numbers' || x === 'This week gated') return 2
        if (x === 'Refresh of idea' || x === 'Niche but real' || x === 'Local community' || x === 'National' || x === 'Evergreen' || x === 'Busy-season') return 1
        return 0
      }
      const score = pts(asSel(v.new22)) + pts(asSel(v.scale22)) + pts(asSel(v.proxim22)) + pts(asSel(v.soon22))
      const verdict = score >= 4 ? 'Lead pitch' : score >= 2 ? 'Sidebar angle' : 'Kill or re-frame'
      return [
        res('Newsworthiness', score + '/8', score >= 4 ? T.good : score >= 2 ? T.warn : T.bad),
        res('Proximity gold', asSel(v.proxim22) === 'Local community' ? 'Own this beat' : 'Check angle', T.good),
        res('Verdict', verdict, score >= 4 ? T.good : score >= 2 ? T.warn : T.bad),
        doc('Ticket', `${story}\nNovelty: ${asSel(v.new22)} | Scale: ${asSel(v.scale22)} | Proximity: ${asSel(v.proxim22)} | Timeliness: ${asSel(v.soon22)}\n\n${verdict}. If kill: reframe around a number or a person.`),
      ]
    },
  },
  {
    id: 'company-announcement-generator',
    name: 'Company Announcement Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes the internal-and-external company announcement \u2014 news, why it matters, what changes, next steps \u2014 that lands without drama.',
    tip: 'Announce change in three moves: the news, what it means for them, and what they should do now. Skip the first and you start a rumor mill.',
    usage: [
      'Write the news in plain verbs.',
      'State what changed for the audience.',
      'End with the concrete next step.',
    ],
    method: [
      'The news-first rule beats narrative preambles.',
      'Change-surface is called out explicitly.',
      'A single next-step closes the announcement.',
    ],
    fields: [
      txt('news22', 'The news', 2, 'obsolescing our per-order pricing for a flat plan'),
      txt('means22', 'What it means for them', 2, 'your bill no longer grows with volume'),
      txt('next22', 'Next step', 2, 'switch now and keep 8% off forever'),
      sel('heat22', 'Announcement heat', ['Cooling (friendly)', 'Neutral', 'Pricing stress'], 'Neutral'),
    ],
    compute: (v) => {
      const news = asStr(v.news22) || 'the news'
      const means = asStr(v.means22) || 'what it means'
      const next = asStr(v.next22) || 'the next step'
      const heat = asSel(v.heat22)
      const opener = heat === 'Pricing stress' ? 'A straight, unvarnished statement:' : 'An update worth your ten minutes:'
      const raw = [
        `${opener} ${cap22(news)}.`,
        `\nWhat it means for you: ${means}.`,
        `\nWhat you should do: ${next}.`,
        `\nQuestions are welcome at [channel]; we answer within a day.`,
      ].join('\n')
      return [
        res('News first', 'Line 1', T.good),
        res('Change surface', means.split(' ').length <= 14 ? 'Stated' : 'Tighten', T.good),
        res('Next step', next.split(' ').length <= 12 ? 'Concrete' : 'Make it a verb', next.split(' ').length <= 12 ? T.good : T.warn),
        res('Tone', heat, T.good),
        doc('Announcement', raw),
      ]
    },
  },
  {
    id: 'event-announcement-generator',
    name: 'Event Announcement Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes the event announcement \u2014 what, when, why worth it, register \u2014 optimized for the inbox, not the stage.',
    tip: 'Sell the one outcome attendees walk away with, not the guest list. "Leave with a launch checklist" beats "star-studded speakers".',
    usage: [
      'Name the event and the outcome.',
      'Set date, place, and the register link.',
      'Keep the announcement under 8 sentences.',
    ],
    method: [
      'The outcome promise leads the event description.',
      'Logistics sit in a scannable line.',
      'A scarcity-free CTA drives registration.',
    ],
    fields: [
      txt('event22', 'Event name', 2, 'the 2026 Launch Weekend'),
      txt('outcome22', 'The outcome they leave with', 2, 'a ready-to-ship product launch checklist'),
      txt('when22', 'Date & place', 2, 'Nov 14, 317 in the auditorium'),
      txt('who22', 'Who should come', 2, 'founders shipping something in Q1'),
    ],
    compute: (v) => {
      const event = asStr(v.event22) || 'the event'
      const outcome = asStr(v.outcome22) || 'the outcome'
      const when = asStr(v.when22) || 'TBA'
      const who = asStr(v.who22) || 'your audience'
      const raw = [
        `${cap22(event)} is on.`,
        `\u2022 You leave with: ${outcome}.`,
        `\u2022 When & where: ${when}.`,
        `\u2022 For: ${who}.`,
        `Register: [link] \u2014 no pass code needed, seats only.`,
      ].join('\n')
      const fresh = /launch|checklist|plan|guide|blueprint|troops|tactics/i.test(outcome) || /workshop|build|ship|do|leave|walk/i.test(outcome)
      return [
        res('Outcome-led', fresh ? 'Yes' : 'Name the outcome', fresh ? T.good : T.warn),
        res('Sentences', raw.split('\n').filter((l) => l.trim()).length + ' blocks', T.good),
        res('Scannable', 'No-paragraph format', T.good),
        res('Audience', who.split(' ').length <= 8 ? 'Pinpointed' : 'Sharpen', T.good),
        doc('Announcement', raw),
      ]
    },
  },
]

function cap22(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}