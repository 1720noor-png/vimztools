import { n, sel, txt, res, doc, T, asNum, asSel, asStr, clamp, ratio } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'App Store & ASO'

export const mod16: MarketingSeoSpec[] = [
  {
    id: 'app-store-keyword-generator',
    name: 'App Store Keyword Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Inventories App Store keywords from your app\u2019s core functions, audience and USP across a 100-character limit field.',
    tip: 'Niche-low-competition keywords first, brand-y high-competition last \u2014 the 100-char wallet is the whole game.',
    usage: [
      'Name the app type and its function.',
      'Add the audience scope.',
      'Paste the list into the keyword field up to 100 chars.',
    ],
    method: [
      'Function words, use-cases and audience tokens are expanded.',
      'The 100-char capping mirrors the store keyword field.',
      'Competition ordering guides priority placement.',
    ],
    fields: [
      txt('app16', 'App name & function', 2, 'Habit tracker'),
      txt('aud16', 'Audience hooks', 2, 'students, weight loss, daily routine'),
      sel('store16', 'Store', ['App Store (iOS)', 'Google Play'], 'App Store (iOS)'),
    ],
    compute: (v) => {
      const app = asStr(v.app16) || 'your app'
      const aud = (asStr(v.aud16) || '').split(',').map((s) => s.trim()).filter(Boolean)
      const pool = [...new Set([app, `${app} app`, ...aud, ...aud.map((a) => `${a} ${app}`)])]
      let s = pool.join(', ')
      let usable = s.slice(0, 100)
      if (usable.length > 0 && pool.length > 1) {
        const lastComma = usable.lastIndexOf(',')
        if (lastComma > 40) usable = usable.slice(0, lastComma)
      }
      return [
        res('Keywords', `${pool.length}`, T.good),
        res('Field usage', `${usable.length}/100`, usable.length <= 100 ? T.good : T.warn),
        doc('Keyword field', usable),
      ]
    },
  },
  {
    id: 'aso-score-checker',
    name: 'ASO Score Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Grades app-store optimization across title, subtitle, keywords, screenshots, ratings and size \u2014 the levers that move conversion.',
    tip: 'Conversion-rate levers (screenshots, rating, icon) outrank pure keyword ranking for downloads \u2014 fix screenshot story first.',
    usage: [
      'Assess each ASO element on your listing.',
      'Run the weighted scorecard.',
      'Fix the lowest-weight item this sprint.',
    ],
    method: [
      'Each element is weighted by store-visibility evidence.',
      'Ratings and screenshots carry conversion-side weights.',
      'The composite converts to a priority file list.',
    ],
    fields: [
      sel('att16', 'Title strategy', ['Keyword-first 30 chars', 'Brand-only', 'Weak'], 'Keyword-first 30 chars'),
      n('sub16', 'Subtitle length (chars)', { def: 30, min: 0 }),
      n('kwhit16', 'Kw slots matching top terms', { def: 4, min: 0 }),
      sel('shot16', 'Screenshot set', ['Strong 6-8 story', 'Average', 'Sparse'], 'Strong 6-8 story'),
      n('rate16', 'App rating', { def: 4.6, min: 0, max: 5, step: 0.1 }),
      n('size16', 'App size (MB)', { def: 42, min: 1 }),
    ],
    compute: (v) => {
      let s = 14
      s += asSel(v.att16) === 'Keyword-first 30 chars' ? 18 : asSel(v.att16) === 'Brand-only' ? 9 : 3
      s += asNum(v.sub16) >= 25 && asNum(v.sub16) <= 55 ? 12 : asNum(v.sub16) ? 6 : 2
      s += asNum(v.kwhit16) >= 4 ? 14 : asNum(v.kwhit16) ? 8 : 2
      s += asSel(v.shot16) === 'Strong 6-8 story' ? 16 : asSel(v.shot16) === 'Average' ? 9 : 3
      s += asNum(v.rate16) >= 4.5 ? 16 : asNum(v.rate16) >= 4 ? 10 : 3
      s += asNum(v.size16) <= 60 ? 10 : 5
      const score = Math.round(clamp(s, 0, 100))
      return [
        res('ASO score', `${score}/100`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Rating lever', `${asNum(v.rate16)} \u2605`, asNum(v.rate16) >= 4.5 ? T.good : T.warn),
        res('Screenshot story', asSel(v.shot16), asSel(v.shot16) !== 'Sparse' ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'app-title-generator',
    name: 'App Title Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Builds an iOS title-and-subtitle pair that front-loads your highest-value keyword inside the 30-char strong-signal window.',
    tip: 'The first 30 characters dominate search relevance on iOS \u2014 put the money keyword there, not the brand.',
    usage: [
      'Enter the app name and top keyword.',
      'Split the 30-char budget correctly.',
      'Place the winner in store metadata.',
    ],
    method: [
      'The 30-char keyword window is measured per candidate.',
      'Title and subtitle pairings are both scored.',
      'Brand placement follows keyword, never precedes it.',
    ],
    fields: [
      txt('name16', 'App name', 2, 'PeakTrack'),
      txt('kw16t', 'Top keyword', 2, 'workout tracker'),
      txt('sub16x', 'Subtitle idea', 2, 'personal fitness log & stats'),
    ],
    compute: (v) => {
      const name = asStr(v.name16) || 'AppName'
      const kw = asStr(v.kw16t) || 'top keyword'
      const sub = asStr(v.sub16x) || 'subtitle copy'
      const candidates = [
        { t: `${kw} \u2014 ${name}`, s: sub },
        { t: `${name} ${kw}`, s: sub },
        { t: `${kw}: ${sub.slice(0, 30)}`, s: sub },
      ].map((c) => ({ ...c, l: c.t.length }))
      const best = candidates.reduce((a, b) => (Math.abs(a.l - 30) < Math.abs(b.l - 30) ? a : b))
      return [
        res('Keyword in 30 chars', best.l <= 30 ? 'Yes' : best.l > 40 ? 'No' : 'Partly', best.l <= 30 ? T.good : T.warn),
        res('Title length', `${best.l} chars`, best.l <= 30 ? T.good : T.warn),
        doc('Title pairings', candidates.map((c) => `${c.t.length} \u2014 "${c.t}"\nSubtitle: ${c.s}`).join('\n\n')),
      ]
    },
  },
  {
    id: 'app-description-generator',
    name: 'App Description Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Wields the first line as a keyword-forlife promise, then feature bullets and social proof \u2014 the Google Play conversion machine.',
    tip: 'The first 80 characters render in search and at top of the page \u2014 put the keyword, not the greeting, there.',
    usage: [
      'State the app\u2019s first-line promise.',
      'Add 4-6 feature bullets.',
      'Paste into Google Play description field.',
    ],
    method: [
      'First line carries keyword + value in one sentence.',
      'Feature bullets are ordered by user-perceived value.',
      'Proof and update notes close for freshness signals.',
    ],
    fields: [
      txt('app16d', 'App & promise', 2, 'Track every workout & hit your goals'),
      txt('feat16', 'Top features (comma separated)', 3, 'auto-track sets, offline mode, weekly stats, share streaks'),
      txt('proof16', 'Proof', 2, '4.8 \u2605, 40k monthly active users'),
    ],
    compute: (v) => {
      const promise = asStr(v.app16d) || 'your app promise'
      const feats = (asStr(v.feat16) || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8)
      const proof = asStr(v.proof16) || 'loved by users'
      const raw = [
        `${promise}.`,
        '',
        ...feats.map((f) => `\u2022 ${cap16(f)}`),
        '',
        `${proof} \u2014 download and grow today.`,
        '',
        'We ship updates every ~2 weeks based on your feedback.',
      ].join('\n')
      return [
        res('First line', `${raw.split('\n')[0].length} chars`, raw.split('\n')[0].length <= 100 ? T.good : T.warn),
        res('Bullets', `${feats.length}`, feats.length >= 4 && feats.length <= 6 ? T.good : T.warn),
        doc('Play description', raw),
      ]
    },
  },
  {
    id: 'app-subtitle-generator',
    name: 'App Subtitle Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Writes single-liner subtitles for the iOS metadata row that competes for index surface and readability.',
    tip: 'Use the subtitle for a second keyword Apple won\u2019t weight in the title \u2014 it\u2019s a free slot, spend it twice.',
    usage: [
      'Enter your second keyword weight.',
      'Pick the subtitle formula.',
      'Drop the outcome into metadata.',
    ],
    method: [
      'Subtitle formulas balance keyword and comprehension.',
      'Each option is capped at the 30-char iOS subtitle limit.',
      'A second-keyword weighting scores the variants.',
    ],
    fields: [
      txt('kw16s', 'Second keyword', 2, 'personal trainer'),
      txt('fn16', 'Core function', 2, 'custom workout plans'),
    ],
    compute: (v) => {
      const kw = asStr(v.kw16s) || 'your keyword'
      const fn = asStr(v.fn16) || 'core feature'
      const opts = [
        `${kw} \u2014 ${fn}`,
        `${fn} for every ${kw.split(' ')[0]}`,
        `${cap16(kw)} & tracking in one`,
      ].map((t) => ({ t, l: t.length }))
      const used = opts.every((o) => o.l <= 30)
      return [
        res('Under 30 chars', used ? `${opts.length}/${opts.length}` : 'Trim needed', used ? T.good : T.warn),
        res('Second keyword', kw, T.good),
        doc('Subtitle options', opts.map((o) => `${o.l} \u2014 ${o.t}`).join('\n')),
      ]
    },
  },
  {
    id: 'app-keyword-density-checker',
    name: 'App Keyword Density Checker',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Scores how prominently your top-owned keyword appears across title, subtitle and the keyword field without repetition waste.',
    tip: 'Repeating a keyword in title + subtitle exploits real relevance; repeating it inside the keyword field burns characters you can\u2019t afford.',
    usage: [
      'Enter your target keyword and the field text.',
      'Run the coverage scan.',
      'Spread coverage instead of doubling down.',
    ],
    method: [
      'Coverage counts distinct placements, not raw mentions.',
      'Duplicate mentions inside the field are penalized as waste.',
      'A coverage map reports where the keyword is and where it is not.',
    ],
    fields: [
      txt('kw16k', 'Target keyword', 2, 'habit tracker'),
      txt('title16k', 'Title + subtitle', 2, 'Habit Tracker \u2014 Daily Routine'),
      txt('field16k', 'Keyword field text', 2, 'habit tracker, daily routine, habit app'),
    ],
    compute: (v) => {
      const kw = asStr(v.kw16k) || 'keyword'
      const title = (asStr(v.title16k) || '').toLowerCase()
      const field = (asStr(v.field16k) || '').toLowerCase()
      const inTitle = title.includes(kw)
      const fieldMentions = (field.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length
      const score = (inTitle ? 45 : 10) + (fieldMentions >= 1 ? 40 : 5) - (fieldMentions > 1 ? (fieldMentions - 1) * 15 : 0)
      return [
        res('Title coverage', inTitle ? 'Awarded' : 'Missing', inTitle ? T.good : T.warn),
        res('Field mentions', `${fieldMentions}`, fieldMentions === 1 ? T.good : T.warn, 'One mention max inside 100 chars'),
        res('Coverage score', `${Math.round(clamp(score, 0, 100))}%`, score >= 70 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'app-rating-calculator',
    name: 'App Rating Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Projects the new aggregate rating after a rating prompt wave, given current count, score and the expected wave yield.',
    tip: 'Prompt high-intent users only, near a success moment \u2014 a focused wave protects your 4.5 against mass 3-star fair-weather ratings.',
    usage: [
      'Enter current ratings and the wave average.',
      'Size the wave realistically (5-15% of starts).',
      'Read the resulting store score.',
    ],
    method: [
      'New aggregate is count-weighted over the review pool.',
      'The wave average models your prompt\u2019s typical star mix.',
      'A verdict flags if the wave would drop you a band.',
    ],
    fields: [
      n('cur16', 'Current rating', { def: 4.5, min: 0, max: 5, step: 0.1 }),
      n('cnt16', 'Current review count', { def: 380, min: 1 }),
      n('wave16', 'Wave reviews expected', { def: 42, min: 0 }),
      n('waveAv16', 'Wave average rating', { def: 4.1, min: 0, max: 5, step: 0.1 }),
    ],
    compute: (v) => {
      const cur = asNum(v.cur16)
      const cnt = asNum(v.cnt16)
      const wave = asNum(v.wave16)
      const av = asNum(v.waveAv16)
      const next = (cur * cnt + av * wave) / (cnt + wave)
      const drop = next < 4.5
      return [
        res('Projected rating', `${ratio(next, 2)} \u2605`, next >= 4.5 ? T.good : T.warn),
        res('Review pool', `${cnt + wave}`, T.good),
        res('Band verdict', next >= 4.5 ? 'Safe band' : 'Dropped below 4.5', drop ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'app-review-response-generator',
    name: 'App Review Response Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Crafts a support-ready reply to app store reviews that acknowledges the bug politely and drives the fix to the right channel.',
    tip: 'Public replies move ratings \u2014 a bug acknowledged in public with "fixed in v2.3" visibly recovers stars within days.',
    usage: [
      'Summarize the review\u2019s sentiment.',
      'Frame the fix you shipped or will ship.',
      'Paste the reply under the review.',
    ],
    method: [
      'Praise responses mirror the sentiment and add a version note.',
      'Bug responses apologize, name the fix, and offer private channels.',
      'Scope is kept store-policy-safe (no prompts, no guarantees).',
    ],
    fields: [
      sel('sent16', 'Sentiment', ['5-star praise', '4-star nitpick', '1-2 star bug'], '1-2 star bug'),
      txt('what16', 'Review about', 2, 'crash on the streak screen'),
      sel('fix16', 'Fix status', ['Fixed in next build', 'Fixed in 2.3', 'Investigating'], 'Fixed in next build'),
    ],
    compute: (v) => {
      const sent = asSel(v.sent16)
      const what = asStr(v.what16) || 'the reported issue'
      const fix = asSel(v.fix16)
      const line = sent === '5-star praise'
        ? `So glad ${what} is clicking for you! What feature should we nail next?`
        : sent === '4-star nitpick'
        ? `Thanks \u2014 noted your ${what} point. We\u2019ve passed it to the team for the next polish pass.`
        : `We\u2019re sorry about ${what}. ${fix} \u2014 if it still happens, tap support inside the app and we\u2019ll fix it within a day.`
      return [
        res('Tone', sent === '1-2 star bug' ? 'Accountable' : 'Warm', T.good),
        res('Resolution path', 'Named + private line', T.good),
        res('Length', `${line.split(' ').length} words`, line.split(' ').length <= 45 ? T.good : T.warn),
        doc('Public reply', line),
      ]
    },
  },
  {
    id: 'app-screenshot-text-generator',
    name: 'App Screenshot Text Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Composes the 6-8 screenshot headlines that walk a browser from problem to install in the App Store gallery.',
    tip: 'First screenshot = the promise, second = the "how", last = the proof \u2014 browsers swipe in order; make the story climb.',
    usage: [
      'Name the app benefit per frame.',
      'Generate the six frame lines.',
      'Keep the first frame under 6 words.',
    ],
    method: [
      'Six frames follow a problem \u2192 solution \u2192 proof arc.',
      'Each line is capped for tiny-screen legibility.',
      'The first frame is weight-doubled in the copy.',
    ],
    fields: [
      txt('app16s', 'App & benefit', 2, 'sleep better with smart wind-down'),
      txt('how16', 'How it works', 2, 'lantern-light mode + gentle alarm'),
      txt('proof16s', 'Proof', 2, 'avg +40 min deep sleep'),
    ],
    compute: (v) => {
      const benefit = asStr(v.app16s) || 'your app benefit'
      const how = asStr(v.how16) || 'how it works'
      const proof = asStr(v.proof16s) || 'your proof'
      const shots = [
        `${short16(benefit, 6)}`, `Built for: ${short16(how, 7)}`, `${short16(proof, 8)}`,
        `Try it tonight`, `Track 30 days of sleep`, `Works with your routine`,
      ]
      return [
        res('Frames', `${shots.length}`, shots.length >= 6 ? T.good : T.warn),
        res('First frame', `${shots[0].split(' ').length} words`, shots[0].split(' ').length <= 6 ? T.good : T.warn),
        doc('Screenshot lines', shots.map((s, i) => `Frame ${i + 1}: ${s}`).join('\n')),
      ]
    },
  },
  {
    id: 'app-store-category-research',
    name: 'App Store Category Research Tool',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Surveys category competition, top-app ratings and keyword inflation to size how hard dominating your genre really is.',
    tip: 'A category with 3+ incumbent mega-apps at 4.8\u2605 is a red ocean \u2014 pick the adjacent niche the giants ignore.',
    usage: [
      'Estimate category app count and leaders.',
      'Input the top-3 ratings.',
      'Locate the underserved niche corner.',
    ],
    method: [
      'App count and incumbent ratings model competition density.',
      'Feature and review thresholds suggest the entry bar.',
      'Adjacent-niche recommendation is derived from the gaps.',
    ],
    fields: [
      txt('cat16', 'Category', 2, 'meditation'),
      n('apps16', 'Apps in category', { def: 4200, min: 1 }),
      n('topr16', 'Top-1 app rating', { def: 4.8, min: 0, max: 5, step: 0.1 }),
      n('toprev16', 'Top-1 review count', { def: 320000, min: 0 }),
      n('yours16', 'Your launch reviews (est)', { def: 1200, min: 0 }),
    ],
    compute: (v) => {
      const apps = asNum(v.apps16)
      const topr = asNum(v.topr16)
      const topRev = asNum(v.toprev16)
      const yours = asNum(v.yours16)
      const density = apps > 5000 ? 'Red ocean' : apps > 1500 ? 'Competitive' : 'Open niche'
      const gap = yours / (topRev || 1)
      const entryFeasible = topr >= 4.7 && gap < 0.02
      return [
        res('Density', density, density === 'Open niche' ? T.good : T.warn),
        res('Leader moat', `${topRev.toLocaleString()} reviews`, T.warn, 'Review moats are hard to jump'),
        res('Entry feasibility', entryFeasible ? 'Hard \u2014 find the gap' : 'Challenging but open', entryFeasible ? T.warn : T.good),
        doc('Angle', entryFeasible ? `Target the sub-niche ${short16(asStr(v.cat16), 3)} users complain about in reviews.` : 'Ambiguous niche \u2014 differentiate on feature, price or platform skew.'),
      ]
    },
  },
  {
    id: 'aso-competitor-analyzer',
    name: 'ASO Competitor Analyzer',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Benchmarks your store listing against a competitor\u2019s title, keywords, screenshots and rating to expose the gap the search algorithm cares about.',
    tip: 'Copy their keyword roots, never their positioning \u2014 mirror the words the store already associates with the category.',
    usage: [
      'Note the competitor\u2019s main keyword slots.',
      'Score your relative screenshots and rating.',
      'Plan the difference that outranks them.',
    ],
    method: [
      'Keyword, screenshot and rating axes are compared side by side.',
      'The gap score isolates where you lose relevance share.',
      'A prioritization note names the single best lever to move.',
    ],
    fields: [
      sel('kw16c', 'Your keyword coverage', ['Wider', 'Similar', 'Narrower'], 'Similar'),
      sel('shot16c', 'Screenshot story', ['Stronger', 'Equal', 'Weaker'], 'Equal'),
      n('rate16c', 'Your rating vs theirs (diff)', { def: 0.2, min: -2, max: 2, step: 0.1 }),
      sel('ic16c', 'Icon distinctness', ['Distinct', 'Similar genre look'], 'Distinct'),
    ],
    compute: (v) => {
      let s = 30
      s += asSel(v.kw16c) === 'Wider' ? 25 : asSel(v.kw16c) === 'Similar' ? 15 : 5
      s += asSel(v.shot16c) === 'Stronger' ? 20 : asSel(v.shot16c) === 'Equal' ? 12 : 4
      s += asNum(v.rate16c) >= 0.1 ? 15 : asNum(v.rate16c) < -0.1 ? 2 : 8
      s += asSel(v.ic16c) === 'Distinct' ? 10 : 4
      const edge = Math.round(clamp(s, 0, 100))
      const lever = edge < 60 ? 'Keyword coverage' : asNum(v.rate16c) < 0 ? 'Rating recovery' : 'Screenshot story'
      return [
        res('Competitive edge', `${edge}%`, edge >= 70 ? T.good : edge >= 45 ? T.warn : T.bad),
        res('Your lever', lever, T.good),
        res('Screenshot gap', asSel(v.shot16c), asSel(v.shot16c) !== 'Weaker' ? T.good : T.warn),
      ]
    },
  },
]

function cap16(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function short16(s: string, n: number): string {
  const w = s.split(' ').slice(0, n).join(' ')
  return w.length > 48 ? w.slice(0, 45) + '...' : w
}