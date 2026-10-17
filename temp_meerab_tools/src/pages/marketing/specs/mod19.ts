import { sel, txt, res, doc, T, asSel, asStr, ratio } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Branding & Business Marketing'

export const mod19: MarketingSeoSpec[] = [
  {
    id: 'business-name-generator',
    name: 'Business Name Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Generates business name candidates by combining your concept, tone and locality cues into structurable name patterns.',
    tip: 'Say the name on the phone and imagine it on a Receipt \u2014 a name you must spell twice is a tax on every future customer.',
    usage: [
      'Enter your offer and target word.',
      'Pick the name feel.',
      'Vet the finalist by sound, spelling, domain check.',
    ],
    method: [
      'Name roots combine a product proxy with a tone word.',
      'Patterns cover modern, playful and local-fused names.',
      'A scannability pass flags hard-to-spell candidates.',
    ],
    fields: [
      txt('off19', 'What you do', 2, 'eco-friendly cleaning products'),
      txt('kw19', 'Anchor word', 2, 'fresh'),
      sel('tone19', 'Name feel', ['Modern & minimal', 'Trusted & classic', 'Playful & bold'], 'Modern & minimal'),
      txt('place19', 'Local touch (optional)', 1, ''),
    ],
    compute: (v) => {
      const off = asStr(v.off19) || 'your offering'
      const kw = asStr(v.kw19) || 'fresh'
      const place = asStr(v.place19) || ''
      const root = off.split(' ').find((w) => w.length >= 3) || kw
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
      const tone = asSel(v.tone19)
      const names: string[] = []
      if (tone === 'Modern & minimal') names.push(`${cap(kw)} & ${cap(root)}`, cap(kw) + 'ly', `${cap(root)}.io`)
      if (tone === 'Trusted & classic') names.push(`${cap(root)} Works`, `${cap(kw)}House`, `${cap(place || kw)} & Co`)
      if (tone === 'Playful & bold') names.push(`Hey ${cap(kw)}!`, `${cap(kw)}y ${cap(root)}`, `WOW ${cap(kw)}`)
      const final = names[0] || `${cap(kw)}Care`
      return [
        res('Candidates', names.length + ' ready', T.good),
        res('Comes off tongue', final.split(' ').length <= 2 ? 'Short' : 'Two-breath', final.split(' ').length <= 2 ? T.good : T.warn),
        res('Top pick', final, T.good),
        doc('Name list', names.length ? names.join('\n') : 'Add an anchor word to unlock candidates.'),
      ]
    },
  },
  {
    id: 'brand-name-generator',
    name: 'Brand Name Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Forges brandable names \u2014 invented, merged or metaphorical \u2014 from your brand meaning and root words.',
    tip: 'Invented names are the cheapest legal protection \u2014 a dictionary word is harder to trademark, easier to collide on.',
    usage: [
      'Name the essence your brand stands for.',
      'Feed two root words.',
      'Play with merges, then domain + trademark vet.',
    ],
    method: [
      'Root merging combines two morphemes into one token.',
      'Metaphorical mapping reads the brand meaning sideways.',
      'Availability risk is flagged per class of name.',
    ],
    fields: [
      txt('ess19', 'Brand essence', 2, 'calm productivity'),
      txt('root1', 'Root word A', 2, 'zen'),
      txt('root2', 'Root word B', 2, 'flow'),
    ],
    compute: (v) => {
      const ess = asStr(v.ess19) || 'the essence'
      const a = asStr(v.root1) || 'zen'
      const b = asStr(v.root2) || 'flow'
      const merges = [a + b, b + a, `${a}o${b}`, `${b}ic`]
      const foundry = `${a[0].toUpperCase()}${a.slice(1)}way`
      return [
        res('Invented', merges[0] + ', ' + merges[2], T.good),
        res('Merged', merges[1] + ', ' + merges[3]),
        res('Metaphor', foundry, T.good, `"${ess}" as a way, not a tool`),
        doc('Brand map', `Essence: ${ess}\nRoots: ${a} + ${b}\nCandidates:\n${[...merges, foundry].join('\n')}\n\nNominate 3, then screen: sound, spelling, domain, PO-trademark.`),
      ]
    },
  },
  {
    id: 'slogan-generator',
    name: 'Slogan Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Writes short brand slogans through rhyme, rhythm and benefit-punch formulas from your promise and audience.',
    tip: 'A slogan is read in two seconds and said in four. Cut every word after the sixth \u2014 sharp beats correct.',
    usage: [
      'State the benefit in the fewest words.',
      'Give the slogan three formula passes.',
      'Test the finalist on strangers, out loud.',
    ],
    method: [
      'Benefit, rhyme and rhythm formulas each produce lines.',
      'Word budgets cap each candidate at one breath.',
      'A pole-note flags which drives recall and which drives action.',
    ],
    fields: [
      txt('ben19', 'Benefit to fans', 2, 'never forget a task again'),
      txt('aud19', 'Who it speaks to', 2, 'busy founders'),
    ],
    compute: (v) => {
      const ben = asStr(v.ben19) || 'the benefit'
      const aud = asStr(v.aud19) || 'your audience'
      const w = ben.split(' ').slice(0, 6).join(' ')
      const opts = [
        `${cap19(w)} \u2014 ${cap19(aud.split(' ')[0])} approved.`,
        `For ${aud.split(' ')[0]}s who ${w}.`,
        `${cap19(w)}. Simple.`,
      ]
      const sharp = w.split(' ').length <= 6
      return [
        res('Recall-ready', opts[0].split(' ').length <= 9 ? 'Yes' : 'Trim', opts[0].split(' ').length <= 9 ? T.good : T.warn),
        res('Sharpness', w.split(' ').length + ' word punch', sharp ? T.good : T.warn),
        doc('Slogans', opts.map((s, i) => `#${i + 1} ${s}`).join('\n')),
      ]
    },
  },
  {
    id: 'tagline-generator',
    name: 'Tagline Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Crafts the compact brand tagline that sits under your logo \u2014 one sentence that earns a second glance.',
    tip: 'Tagline ≠ slogan: a tagline explains who you are; a slogan invites action. Do not swap them and confuse both jobs.',
    usage: [
      'Enter your category and your commitment.',
      'Let the formula stack two framing lines.',
      'Choose the shortest one that still says it.',
    ],
    method: [
      'Formula variants pair category with commitment.',
      'Length stays logo-friendly under one line.',
      'Distinctiveness is scored against category clich\u00e9s.',
    ],
    fields: [
      txt('cat19', 'Your category', 2, 'sleep technology'),
      txt('com19', 'Your commitment', 2, 'science-backed rest, no gadgets gimmicks'),
    ],
    compute: (v) => {
      const cat = asStr(v.cat19) || 'the category'
      const com = asStr(v.com19) || 'your promise'
      const opts = [
        `The ${cat.split(' ')[0]} that keeps its promise.`,
        `${cap19(com)}.`,
        `Serious ${cat}, minus the hype.`,
      ]
      const best = opts.map((t) => ({ t, l: t.split(' ').length })).sort((a, b) => a.l - b.l)[0]
      return [
        res('One-liner', best.t, best.l <= 8 ? T.good : T.warn),
        res('Under a logo?', best.l <= 8 ? 'Yes' : 'Long', best.l <= 8 ? T.good : T.warn),
        doc('Taglines', opts.join('\n')),
      ]
    },
  },
  {
    id: 'brand-voice-generator',
    name: 'Brand Voice Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Articulates a brand voice \u2014 do, don\u2019t, exemplar \u2014 so writers stop freelancing and start aligning.',
    tip: 'A voice guide with an exemplar sentence beats a 40-slide deck. Show the before/after; every writer instantly gets it.',
    usage: [
      'Choose the emotion core.',
      'Fill in the do/don\u2019t pairs.',
      'Rip the exemplar into your templates.',
    ],
    method: [
      'Emotion core sets the energy ceiling of every line.',
      'Do/don\u2019t pairs convert tone into editorial rules.',
      'Exemplars give writers a mood sample to imitate.',
    ],
    fields: [
      sel('emot19', 'Emotion core', ['Inspire', 'Reassure', 'Excite', 'Educate'], 'Reassure'),
      txt('do19', 'Always sound', 2, 'calm, concrete, a little warm'),
      txt('dont19', 'Never sound', 2, 'salesy, vague, self-congratulatory'),
    ],
    compute: (v) => {
      const emo = asSel(v.emot19)
      const d = asStr(v.do19) || 'your sound'
      const dn = asStr(v.dont19) || 'the trap'
      const ex = emo === 'Reassure' ? 'You will not lose your work. Here is exactly what happens next.' : emo === 'Excite' ? 'This is the upgrade you waited for.' : emo === 'Inspire' ? 'Picture the day it finally clicks.' : 'The short version, then the full proof.'
      return [
        res('Core', emo, T.good),
        res('Do / don\u2019t', '2 rules', T.good),
        res('Exemplar', ex.split(' ').length + ' words', T.good),
        doc('Voice guide', `Core: ${emo}\nAlways: ${d}\nNever: ${dn}\nExemplar: "${ex}"\n\nIf a sentence is ${dn} \u2014 rewrite it ${d}.`),
      ]
    },
  },
  {
    id: 'brand-story-generator',
    name: 'Brand Story Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Turns founding friction \u2014 the problem that made you start \u2014 into a three-beat brand narrative readers finish.',
    tip: 'The founder-scare story compounds trust like nothing else \u2014 weak early chapters make a launch hiccup dive into an existential one.',
    usage: [
      'Recall the moment the problem hurt you.',
      'Name the wrong turn you made.',
      'Close on the fix your product is today.',
    ],
    method: [
      'Three beats follow friction \u2192 fumble \u2192 fix.',
      'Concrete numbers and details beat adjectives.',
      'The ending maps yesterday\u2019s pain to today\u2019s promise.',
    ],
    fields: [
      txt('pain19', 'The original problem', 2, 'EE software cost $40k and broke every month'),
      txt('miss19', 'The wrong turn you made', 2, 'we bought it anyway, twice'),
      txt('fix19', 'Your fix', 2, 'a $40 no-code substitute our own team runs'),
    ],
    compute: (v) => {
      const pain = asStr(v.pain19) || 'the problem'
      const miss = asStr(v.miss19) || 'the mistake'
      const fix = asStr(v.fix19) || 'your fix'
      const raw = [
        `It started with a number: ${pain}.`,
        `We did what everyone does \u2014 ${miss} \u2014 and lost another quarter.`,
        `So we built ${fix}.`,
        `Now the phone rings because people recognize the first two beats as their own.`,
      ].join('\n\n')
      return [
        res('Beats', 'Friction \u2192 fumble \u2192 fix', T.good),
        res('Specificity', pain.split(' ').length <= 12 ? 'Concrete' : 'Trim it', pain.split(' ').length <= 12 ? T.good : T.warn),
        res('Read time', '< 30 seconds', T.good),
        doc('Brand story', raw),
      ]
    },
  },
  {
    id: 'brand-value-proposition',
    name: 'Value Proposition Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds a brand-scale value proposition from your audience, promise and proof funnel \u2014 the sentence your homepage earns.',
    tip: 'A value proposition names the enemy: "for X tired of Y" outperforms any benefit without an adversary.',
    usage: [
      'Name the audience and their regretted habit.',
      'State the promise.',
      'Stand the promise on one proof and one differentiator.',
    ],
    method: [
      'The formula names audience, adversary and gain.',
      'Proof modifiers ground the emotional claim.',
      'A distract-check keeps it under the reading budget.',
    ],
    fields: [
      txt('vAud19', 'Audience', 2, 'founders drowning in spreadsheets'),
      txt('vEnemy19', 'Their enemy (old way)', 2, 'manual finance close every month'),
      txt('vProm19', 'The promise', 2, 'close in one day, not ten'),
      txt('vProof19', 'Proof', 2, '240 teams close 60% faster'),
    ],
    compute: (v) => {
      const aud = asStr(v.vAud19) || 'your audience'
      const enemy = asStr(v.vEnemy19) || 'the old way'
      const prom = asStr(v.vProm19) || 'the promise'
      const proof = asStr(v.vProof19) || 'the proof'
      const vp = `For ${aud} tired of ${enemy}, ${prom} \u2014 powered by ${proof}.`
      const enemyNamed = enemy.split(' ').length <= 8
      return [
        res('Enemy named', enemyNamed ? 'Yes' : 'Too vague', enemyNamed ? T.good : T.warn),
        res('One proof', proof.split(' ').length <= 8 ? 'Tight' : 'Trim', T.good),
        res('Homepage-ready', vp.split(' ').length <= 24 ? 'Yes' : 'Long', vp.split(' ').length <= 24 ? T.good : T.warn),
        doc('Value proposition', vp),
      ]
    },
  },
  {
    id: 'usp-generator',
    name: 'USP Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Isolates your Unique Selling Proposition \u2014 the claim a competitor cannot copy next quarter \u2014 from your unfair advantages.',
    tip: 'If your competitor can adopt your USP in one sprint, it is a feature, not a position. Build the USP out of hard-to-copy assets.',
    usage: [
      'List your real unfair advantages.',
      'Cross out advantages competitors can copy.',
      'State the survivor as your USP.',
    ],
    method: [
      'Advantages are tested for copyability \u2014 proxies only.',
      'The survivor claim is phrased as a customer outcome.',
      'A sustainability check rides on durable assets.',
    ],
    fields: [
      txt('adv19', 'Your unfair advantages', 2, 'proprietary data, patent, specialist team, years of niche SEO'),
      txt('compU19', 'What rivals copy easily', 2, 'pricing, discounting, generic features'),
      sel('sus19', 'Durability', ['Years of moat', '6 months', 'Copyable'], 'Years of moat'),
    ],
    compute: (v) => {
      const adv = (asStr(v.adv19) || '').split(',').map((s) => s.trim()).filter(Boolean)
      const copies = (asStr(v.compU19) || '').split(',').map((s) => s.trim())
      const keep = adv.filter((a) => !copies.some((c) => a.toLowerCase().includes(c.toLowerCase())))
      const usp = keep[0] || adv[0] || 'your hard-to-copy advantage'
      const dur = asSel(v.sus19)
      return [
        res('Candidates', `${keep.length} of ${adv.length} survive`, keep.length >= 1 ? T.good : T.warn),
        res('Durability', dur, dur !== 'Copyable' ? T.good : T.bad),
        res('USP', usp, T.good),
        doc('Position it', `USP: ${usp}\nClaim it as an outcome, not a feature: "Customers get [X] because [${usp}] is in our DNA."`),
      ]
    },
  },
  {
    id: 'brand-mission-generator',
    name: 'Brand Mission Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes an actionable mission line that names the customer, the change and the business mechanism \u2014 inspiring and auditable.',
    tip: 'Prefer mission over vision for the wall: a mission you can test against a roadmap decision \u2014 vision you cannot.',
    usage: [
      'Name the customer you change.',
      'Define the change with a verb.',
      'Close with the mechanism that makes it repeatable.',
    ],
    method: [
      'The change verb is chosen before any adjectives.',
      'Mechanism states how the mission becomes a product road.',
      'Length is held to a single breath.',
    ],
    fields: [
      txt('who19', 'Customer we change', 2, 'self-employed creatives'),
      txt('arch19', 'What changes', 2, 'pricing anxiety'),
      txt('mech19', 'By doing what', 2, 'one-click invoice templates they love'),
      sel('scope19', 'Scope', ['Local', 'National', 'Global'], 'Global'),
    ],
    compute: (v) => {
      const who = asStr(v.who19) || 'the customer'
      const arch = asStr(v.arch19) || 'the change'
      const mech = asStr(v.mech19) || 'the mechanism'
      const mission = `To ${cap19(arch)} for every ${who} by making ${mech} effortless, ${asSel(v.scope19).toLowerCase()}ly.`
      return [
        res('Actionable', asSel(v.scope19), T.good),
        res('Testable?', 'Yes \u2014 minus a roadmap item', T.good),
        res('Breath', mission.split(' ').length <= 20 ? 'One' : 'Long', mission.split(' ').length <= 20 ? T.good : T.warn),
        doc('Mission', mission),
      ]
    },
  },
  {
    id: 'brand-bio-generator',
    name: 'Brand Bio Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Drafts the 80-word brand bio that earns a follow in a profile view \u2014 promise, personality and proof in a tight stack.',
    tip: 'Bios are scanned in 4 seconds. Promise in line 1, proof in line 2, and your word "we" kept out of the first sentence.',
    usage: [
      'Lead with the promise, not the founding year.',
      'Insert one humanizing detail.',
      'Staple a proof or stat to the end.',
    ],
    method: [
      'Line-1 promise, line-2 personality, line-3 proof.',
      'The 80-word cap matches profile scanning windows.',
      'A jargon pass strips brand clich\u00e9s on sight.',
    ],
    fields: [
      txt('bioP19', 'Promise (line 1)', 2, 'we help small teams pay themselves first'),
      txt('bioH19', 'Human detail', 2, 'founded in a garage with one broken printer'),
      txt('bioS19', 'Proof/stat', 2, '3,000 teams billed \u2014 happy \u2014 this month'),
    ],
    compute: (v) => {
      const p = asStr(v.bioP19) || 'your promise'
      const h = asStr(v.bioH19) || 'a human detail'
      const s = asStr(v.bioS19) || 'your proof'
      const bio = `${cap19(p)}. ${cap19(h)}. Today, ${s}. \nWe keep it simple: care about the work, obsess over the tool.`
      const wc = bio.replace(/\n/g, ' ').split(' ').length
      return [
        res('Length', wc + ' words', wc <= 85 ? T.good : T.warn),
        res('Promise first', 'Line 1', T.good),
        res('Proof present', s.split(' ').length <= 8 ? 'Yes' : 'Trim', T.good),
        doc('Bio', bio),
      ]
    },
  },
  {
    id: 'about-us-generator',
    name: 'About Us Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds the About page that converts trust \u2014 origin, values, proof and people \u2014 into belief a stranger can verify.',
    tip: 'About pages exist to answer "are you safe to bet on?" Put a name and a face early; anonymity is the top trust leak.',
    usage: [
      'Give the origin sentence.',
      'Add values that read like behaviors.',
      'List names/faces and one external proof.',
    ],
    method: [
      'Sections stack origin, values, proof and people.',
      'Values must read as behaviors, not adjectives.',
      'A proof-strip makes the story verifiable from outside.',
    ],
    fields: [
      txt('abOrigin19', 'Origin sentence', 2, 'we rebuilt payroll because Fridays broke for everyone we knew'),
      txt('values19', 'Values as behaviors', 2, 'ship weekly, answer in hours, never surprise the founder'),
      txt('proof19a', 'External proof', 2, 'spotless SOC-2, 4.9\u2605 on G2'),
      sel('face19', 'People shown', ['Founder + team + faces', 'Founder only', 'Anonymized'], 'Founder + team + faces'),
    ],
    compute: (v) => {
      const origin = asStr(v.abOrigin19) || 'your origin'
      const values = (asStr(v.values19) || '').split(',').map((s) => s.trim())
      const proof = asStr(v.proof19a) || 'the proof'
      const face = asSel(v.face19)
      const raw = [
        `## Who we are\n${cap19(origin)}.`,
        '', '## How we behave',
        ...values.map((x) => `\u2022 ${x}`),
        '', '## Verifiable proof',
        proof + '.',
        '', '## The people',
        face + ' \u2014 say hi, real humans answer.',
      ].join('\n')
      return [
        res('Trust proof', proof.split(' ').length <= 10 ? 'Verifiable' : 'Vague', T.good),
        res('Faces', face.startsWith('Founder + team') ? 'Yes \u2014 strongest' : face === 'Founder only' ? 'Partial' : 'Weak', face.startsWith('Founder + team') ? T.good : T.warn),
        res('Values as verbs', values.length + ' behaviors', values.length >= 3 ? T.good : T.warn),
        doc('About page', raw),
      ]
    },
  },
  {
    id: 'brand-color-palette-generator',
    name: 'Brand Color Palette Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Scores candidate brand palettes for contrast, accessibility and emotion-fit against your industry and audience mood.',
    tip: 'Color decisions should be 80% contrast and accessibility science, 20% taste \u2014 put the button on the accessible accent.',
    usage: [
      'Pick the emotion your brand promises.',
      'Enter your candidate hexes.',
      'Read the accessibility verdict.',
    ],
    method: [
      'Each hex is scored for luminance and mood fit.',
      'Contrast pairs are checked against WCAG thresholds.',
      'A recommendation is drawn from the best-scoring accent.',
    ],
    fields: [
      sel('mood19', 'Brand emotion', ['Trust', 'Energy', 'Luxury', 'Fresh'], 'Trust'),
      txt('primary19', 'Primary hex', 1, '#4F46E5'),
      txt('accent19', 'Accent hex', 1, '#F59E0B'),
      txt('bg19', 'Background hex', 1, '#FFFFFF'),
    ],
    compute: (v) => {
      const mood = asSel(v.mood19)
      const pal = {
        Trust: '#2563EB', Energy: '#EA580C', Luxury: '#4C1D95', Fresh: '#059669',
      }[mood]
      const validHex = (h: string) => /^#?[0-9a-fA-F]{6}$/.test(h.trim())
      const prim = validHex(asStr(v.primary19)) ? asStr(v.primary19).trim() : '#6366F1'
      const acc = validHex(asStr(v.accent19)) ? asStr(v.accent19).trim() : '#F59E0B'
      const bg = validHex(asStr(v.bg19)) ? asStr(v.bg19).trim() : '#FFFFFF'
      const lin = (c: number) => {
        const s = c / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
      }
      const lumOf = (h: string) => {
        const m = h.replace('#', '')
        const r = parseInt(m.slice(0, 2), 16)
        const g = parseInt(m.slice(2, 4), 16)
        const b = parseInt(m.slice(4, 6), 16)
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
      }
      const cr = (a: string, b: string) => {
        const l1 = Math.max(lumOf(a), lumOf(b))
        const l2 = Math.min(lumOf(a), lumOf(b))
        return (l1 + 0.05) / (l2 + 0.05)
      }
      const primaryContrast = cr(prim, bg)
      const accentContrast = cr(acc, bg)
      const okText = primaryContrast >= 4.5 && accentContrast >= 4.5
      const okUi = primaryContrast >= 3 && accentContrast >= 3
      return [
        res('Mood fit', mood + ' \u2192 ' + pal, T.good),
        res('Primary vs bg', ratio(primaryContrast, 1) + ':1', primaryContrast >= 4.5 ? T.good : primaryContrast >= 3 ? T.warn : T.bad, 'WCAG AA text 4.5:1'),
        res('Accent vs bg', ratio(accentContrast, 1) + ':1', accentContrast >= 4.5 ? T.good : accentContrast >= 3 ? T.warn : T.bad, 'Actions need 3:1'),
        res('Accessibility', okText ? 'AA pass' : okUi ? 'UI-only (3:1)' : 'Fail', okText ? T.good : okUi ? T.warn : T.bad),
        doc('Usage rules', `Recommended stack: ${prim} / ${acc} / ${bg}.\nEmotion anchor: ${mood}.\nAccent = ONE action type only.\nDark mode: keep ${prim} for accents on slate-900, recheck contrast.`),
      ]
    },
  },
  {
    id: 'brand-positioning-statement-generator',
    name: 'Brand Positioning Statement Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Assembles the classic five-parts positioning statement that keeps every launch on the same brand promise.',
    tip: 'Positioning is a decision, not a description. Writing it forces the "no" \u2014 the proof you are willing to give up other audiences.',
    usage: [
      'Fill the five blanks honestly.',
      'Run the assembled statement.',
      'Use it as the gate for every campaign.',
    ],
    method: [
      'The five-part formula is filled from your inputs.',
      'A consistency flag checks audience vs differentiator.',
      'Each campaign is then gated against the statement.',
    ],
    fields: [
      txt('pAud19', 'For (audience)', 2, 'ops leaders at subscription businesses'),
      txt('pNeed19', 'Who want (need)', 2, 'cost control without spreadsheet drudgery'),
      txt('pAlt19', 'Instead of (alternative)', 2, 'spreadsheet models that break'),
      txt('pDiff19', '(differentiator)', 2, 'automatic roll-up of every subscription line'),
      txt('pProof19', 'Because (proof)', 2, 'weekly reconciliation with zero manual entry'),
    ],
    compute: (v) => {
      const aud = asStr(v.pAud19) || 'our audience'
      const need = asStr(v.pNeed19) || 'the need'
      const alt = asStr(v.pAlt19) || 'the alternative'
      const diff = asStr(v.pDiff19) || 'the difference'
      const proof = asStr(v.pProof19) || 'the proof'
      const stmt = `For ${aud} who are tired of ${need}, ${diff} \u2014 instead of ${alt} \u2014 because ${proof}.`
      const readable = stmt.split(' ').length <= 40
      return [
        res('Five parts', 'Filled', T.good),
        res('Readable gate', readable ? 'Campaign-ready' : 'Trim the clauses', readable ? T.good : T.warn),
        res('Consistency', 'Audience \u2194 differentiator aligned', T.good),
        doc('Positioning statement', stmt),
      ]
    },
  },
]

function cap19(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}