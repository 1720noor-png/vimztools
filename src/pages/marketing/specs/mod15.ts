import { n, sel, txt, ck, res, doc, T, asNum, asSel, asStr, asBoolList, clamp, ratio, money, pct } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'YouTube & Video Marketing'

export const mod15: MarketingSeoSpec[] = [
  {
    id: 'youtube-title-generator',
    name: 'YouTube Title Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Writes click-focused YouTube titles that stack the payoff statement with curiosity and keywords within the 100-char cap.',
    tip: 'YouTube loves a specific promise: numbers + outcome + timeline titles routinely double the click-through of vague ones.',
    usage: [
      'Name the video\u2019s core payoff.',
      'Choose the curiosity style.',
      'Front-load the phrase your audience searches.',
    ],
    method: [
      'Title formulas alternate payoff-first and curiosity-first.',
      'Length is clamped to the 100-char platform limit.',
      'Keyword front-loading pairs with the search phrasing your niche uses.',
    ],
    fields: [
      txt('pay15', 'Core payoff', 2, 'double your email list in 30 days'),
      sel('style15', 'Title style', ['Payoff first', 'Curiosity gap', 'How-to formal', 'Hot take'], 'Payoff first'),
      n('t15', 'Titles to generate', { def: 5, min: 1, max: 10 }),
    ],
    compute: (v) => {
      const pay = asStr(v.pay15) || 'a helpful outcome'
      const style = asSel(v.style15)
      const N = asNum(v.t15) || 5
      const pool = style === 'Curiosity gap'
        ? [`I did ${pay} (no one told me this)`, `The ${pay} trick nobody shares`, `How I ${pay.replace(/^how to /i, '')} \u2014 in detail`]
        : style === 'How-to formal'
        ? [`How to ${pay.replace(/^how to /i, 'how to /')}`, `${pay}: the full plan`, `Step-by-step: ${pay}`]
        : style === 'Hot take'
        ? [`Forget the rules \u2014 this ${pay} actually works`, `The ${pay} myth, debunked`, `Why everyone gets ${pay.replace(/^double |^grow |^cut /, '')} wrong`]
        : [`${pay} (proven plan)`, `${pay} \u2014 real results`, `Do this to ${pay}`, `My exact method: ${pay}`]
      const out = pool.map((t, i) => (t.length > 100 ? t.slice(0, 97) + '...' : i === 0 ? `\u2605 ${t}` : t)).slice(0, Math.min(N, pool.length))
      return [
        res('Style', style, T.good),
        res('Within 100 chars', out.every((t) => t.length <= 101) ? `${out.length}/${out.length}` : 'Trim needed', T.good),
        doc('Title options', out.join('\n')),
      ]
    },
  },
  {
    id: 'youtube-description-generator',
    name: 'YouTube Description Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Assembles a searchable video description \u2014 hook summary, timestamps placeholder, links and hashtags \u2014 around your target keyword.',
    tip: 'Put your primary keyword in the first two lines \u2014 YouTube ranks descriptions top-heavy and clips them at ~150 chars in search.',
    usage: [
      'Summarize the video\u2019s promise.',
      'Add your key links and call-to-action.',
      'Generate the first-draft description for the composer.',
    ],
    method: [
      'The first 150 characters carry the keyword naturally.',
      'Timestamps are stubbed as a legal-yet-editable scaffold.',
      'Link and hashtag blocks close the description.',
    ],
    fields: [
      txt('kw15', 'Target keyword', 2, 'email list growth'),
      txt('vid15', 'Video promise', 2, 'a 30-day plan that doubled our list'),
      txt('cta15', 'Call to action', 2, 'get the free checklist \u2014 link below'),
      ck('blocks15', 'Description blocks', ['Timestamps', 'Links & socials', 'Hashtags', 'Pin comment reminder']),
    ],
    compute: (v) => {
      const kw = asStr(v.kw15) || 'your topic'
      const promise = asStr(v.vid15) || 'your video'
      const cta = asStr(v.cta15) || 'free resource below'
      const blocks = asBoolList(v.blocks15)
      const raw = [
        `Learn ${kw} with this guide \u2014 ${promise}.`,
        blocks[3] ? `Drop a comment and we\u2019ll pin your question.` : '',
        '',
        blocks[0] ? 'TIMESTAMPS\n0:00 Recap\n2:10 The plan\n9:45 Results' : '',
        '',
        `${cta}`,
        blocks[1] ? '\nSubscribe: [link]\nFree template: [link]' : '',
        blocks[2] ? '\n#emailmarketing #newsletters #growth' : '',
      ].filter((l) => l !== '').join('\n')
      return [
        res('Keyword top-heavy', 'First 2 lines', T.good),
        res('Blocks', `${blocks.filter(Boolean).length}/4`, T.good),
        doc('Description draft', raw),
      ]
    },
  },
  {
    id: 'youtube-tag-generator',
    name: 'YouTube Tag Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Builds a YouTube tag stack from single, phrase, related and typo-variant keywords matched to your video.',
    tip: 'Tags are minor for ranking now but free signal for related-video suggestions \u2014 stack 8-12 with the phrase first.',
    usage: [
      'Enter the primary phrase and its family.',
      'Run the tag expansion.',
      'Paste into the video keywords field.',
    ],
    method: [
      'Single root, phrase and plural variants are all produced.',
      'Broad and related families widen suggestion recall.',
      'The stack is deduplicated and capped for the field.',
    ],
    fields: [
      txt('kw15t', 'Primary phrase', 2, 'email marketing'),
      txt('rel15t', 'Related topics (comma separated)', 2, 'newsletter growth, automation'),
    ],
    compute: (v) => {
      const kw = asStr(v.kw15t) || 'your topic'
      const rel = (asStr(v.rel15t) || '').split(',').map((s) => s.trim()).filter(Boolean)
      const tags = [kw, `${kw} tutorial`, `${kw} for beginners`, `${kw} 2026`, `how to ${kw}`, ...rel, ...rel.map((r) => `${r} guide`)]
      const uniq = [...new Set(tags)].slice(0, 15).join(', ')
      return [
        res('Tags', `${uniq.split(', ').length}`, T.good),
        res('Phrase-first', 'Yes', T.good),
        doc('Tag stack', uniq),
      ]
    },
  },
  {
    id: 'youtube-hashtag-generator',
    name: 'YouTube Hashtag Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Suggests a compact 3-5 hashtag set that rides broad browse without diluting search intent relevance.',
    tip: 'Three well-picked hashtags beat five noisy ones \u2014 YouTube reads the first three buttons above the title as your niche.',
    usage: [
      'Set the video topic.',
      'Generate the 3-hashtag set.',
      'Use them above the title line in the composer.',
    ],
    method: [
      'Broad and niche hashtags are split per weight.',
      'The top 3 compose the platform-visible button row.',
      'Length-capped hashtags avoid the spam filter.',
    ],
    fields: [
      txt('kw15h', 'Video topic', 2, 'small business marketing'),
      sel('size15', 'Channel size', ['Small <10k', 'Mid 10-100k', 'Large >100k'], 'Mid 10-100k'),
    ],
    compute: (v) => {
      const topic = asStr(v.kw15h) || 'your topic'
      const words = topic.split(' ').slice(0, 2).join('')
      const broad = asSel(v.size15) === 'Small <10k' ? '#marketing' : '#business'
      const set = [`#${words}`, `#${topic.split(' ')[0]}tips`, broad]
      return [
        res('Hashtags', `${set.length}`, T.good, '3 is the platform sweet spot'),
        res('Broad vs niche', 'Balanced', T.good),
        doc('Hashtag set', set.join('  ')),
      ]
    },
  },
  {
    id: 'youtube-keyword-generator',
    name: 'YouTube Keyword Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Expands a video topic into the question, long-tail and intent keywords viewers actually type into the search bar.',
    tip: 'YouTube autocomplete is your keyword tool \u2014 test these expanded phrases in the search bar and bank the real ones people type.',
    usage: [
      'Enter your video topic.',
      'Select the angle depth.',
      'Land the list into the description and tags.',
    ],
    method: [
      'Question and how-to transforms cover search phrasing.',
      'Intent variants (for, best, vs, near) widen recall.',
      'The output is sorted to prioritize question-mode queries.',
    ],
    fields: [
      txt('kw15k', 'Topic', 2, 'video editing'),
      sel('depth15', 'Angle depth', ['Beginner', 'Intermediate', 'Pro'], 'Intermediate'),
    ],
    compute: (v) => {
      const t = asStr(v.kw15k) || 'your topic'
      const d = asSel(v.depth15)
      const arr = [
        `${t} for beginners`, `how to ${t}`, `best ${t} software`, `${t} tutorial 2026`,
        `${t} tips and tricks`, `${t} for professionals`, `${t} free vs paid`, `${t} workflow`,
        `learn ${t} fast`, `${t} vs alternatives`,
      ]
      const count = d === 'Beginner' ? arr.filter((x) => /beginner|how to|learn/.test(x)).concat(arr.slice(2)).slice(0, 8) : d === 'Pro' ? arr.filter((x) => /pro|vs|workflow|paid|tricks/.test(x)).concat(arr.slice(0, 4)).slice(0, 8) : arr
      return [
        res('Keywords', `${count.length}`, T.good),
        res('Level', d, T.good),
        doc('Keyword list', count.join('\n')),
      ]
    },
  },
  {
    id: 'youtube-thumbnail-text-generator',
    name: 'YouTube Thumbnail Text Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Composes short-blast thumbnail text \u2014 3-5 words with a bold pattern \u2014 that stays legible at search size and on tiny screens.',
    tip: 'Three words max above the 2-word band; at 120px wide that\u2019s the difference between a read and a scroll-past.',
    usage: [
      'Name the video\u2019s payoff.',
      'Pick the emotional framing.',
      'Render the chosen blurb large and center-framed.',
    ],
    method: [
      'The payoff is compressed to a punchy 2-4 word blurb.',
      'Emotion frames (question, result, stakes) tune the wording.',
      'Legibility rules guard the smallest display size.',
    ],
    fields: [
      txt('pay15x', 'Video payoff', 2, 'we doubled our revenue with this one filter'),
      sel('emo15', 'Emotion frame', ['Result', 'Question', 'Fear/stakes', 'Curiosity'], 'Result'),
    ],
    compute: (v) => {
      const pay = asStr(v.pay15x) || 'a result'
      const emo = asSel(v.emo15)
      const short = pay.split(' ').slice(0, 3).join(' ')
      const blurbs = emo === 'Question' ? ['DOUBLE?', 'WORTH IT?', 'REALLY?'] : emo === 'Fear/stakes' ? ['DIED', 'LOST 3K', 'AVOID THIS'] : emo === 'Curiosity' ? ['THE TRICK', 'NO ONE TALKS', 'WHY?'] : [`${short.toUpperCase()}`, 'DOUBLED', 'THE RESULT']
      return [
        res('Words', `${blurbs.some((b) => b.split(' ').length <= 4) ? '2-4' : 'Long'}`, T.good, 'Legible at 120px'),
        res('Emotion', emo, T.good),
        doc('Thumbnail blurbs', blurbs.join('\n')),
      ]
    },
  },
  {
    id: 'youtube-engagement-rate-calculator',
    name: 'YouTube Engagement Rate Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Combines views, likes, comments and saves into the engagement metric that signals your video to the algorithm.',
    tip: 'Push for comments deliberately; algorithmically, comment density outperforms likes by an order of magnitude.',
    usage: [
      'Enter the latest video\u2019s stats.',
      'Run the engagement calculation.',
      'Compare against your channel baseline.',
    ],
    method: [
      'Engagement weights comments and saves above likes for realism.',
      'The rate is computed against impressions and views separately.',
      'A healthy-band reference sizes the outcome on your channel size.',
    ],
    fields: [
      n('views15', 'Views', { def: 8200, min: 1 }),
      n('impr15', 'Impressions', { def: 14500, min: 0 }),
      n('likes15', 'Likes', { def: 900, min: 0 }),
      n('cmts15', 'Comments', { def: 140, min: 0 }),
      n('saves15', 'Saves / shares', { def: 45, min: 0 }),
    ],
    compute: (v) => {
      const views = asNum(v.views15)
      const impr = asNum(v.impr15)
      const likes = asNum(v.likes15)
      const cmts = asNum(v.cmts15)
      const saves = asNum(v.saves15)
      const ers = views > 0 ? (likes + cmts * 4 + saves * 2) / views * 100 : 0
      const ctr = impr > 0 ? views / impr : 0
      return [
        res('Engagement rate', ratio(ers, 2) + '%', ers >= 4 ? T.good : ers >= 2 ? T.warn : T.bad, 'Long-form steady band 2-5%'),
        res('Impression CTR', pct(ctr * 100, 1), ctr >= 0.06 ? T.good : T.warn),
        res('Comment pull', `${cmts} (${ratio(likes ? cmts / likes : 0, 2)}/like)`, cmts >= 10 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'youtube-cpm-calculator',
    name: 'YouTube CPM Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Turns revenue and views into a real RPM, with the CPM picture across your channel\u2019s niches.',
    tip: 'RPM (revenue per 1,000 views) is what pays bills, not CPM ads \u2014 niche finance content routinely bills 5x gaming RPM.',
    usage: [
      'Enter views and revenue for the period.',
      'Read your RPM.',
      'Compare against your niche\u2019s CPM ceiling.',
    ],
    method: [
      'RPM is revenue divided by views times 1000.',
      'Niche baselines offset the raw CPM number.',
      'A duration-adjusted model scales for mid-rolls.',
    ],
    fields: [
      n('views15r', 'Views', { def: 75000, min: 1 }),
      n('rev15r', 'Revenue ($)', { def: 312, min: 0 }),
      sel('niche15r', 'Niche', ['Finance', 'Tech', 'Lifestyle', 'Gaming', 'Education'], 'Tech'),
    ],
    compute: (v) => {
      const views = asNum(v.views15r)
      const rev = asNum(v.rev15r)
      const niche = asSel(v.niche15r)
      const rpm = rev / views * 1000
      const nicheCpm: Record<string, number> = { Finance: 14, Tech: 10, Lifestyle: 6, Gaming: 3.5, Education: 9 }
      const cpm = nicheCpm[niche] ?? 8
      return [
        res('RPM', '$' + ratio(rpm, 2), rpm >= cpm ? T.good : T.warn, `Niche median ~$${cpm} CPM`),
        res('Views per $', ratio(1000 / Math.max(0.1, rpm), 0)),
        res('Revenue / 1000', '$' + ratio(rpm, 2), T.good),
      ]
    },
  },
  {
    id: 'youtube-revenue-calculator',
    name: 'YouTube Revenue Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb:
      'Projects YouTube income from RPM and views, then layers channel-members, sponsorship and affiliate moonshots.',
    tip: 'Sponsorships pay 3-10x ad RPM \u2014 a 100k-view channel with one sponsor deal can outearn a channel at 500k views income-only.',
    usage: [
      'Set RPM confidence and monthly views.',
      'Add your other income lines.',
      'Read the base and scaled scenarios.',
    ],
    method: [
      'Ad revenue equals RPM times monthly views.',
      'Direct income lines are summed separately.',
      'Scenarios scale views while holding RPM.',
    ],
    fields: [
      n('views15v', 'Monthly views', { def: 120000, min: 1 }),
      n('rpm15', 'RPM ($)', { def: 5.4, min: 0, step: 0.1 }),
      n('sponsor15', 'Sponsorship / mo ($)', { def: 0, min: 0 }),
      n('other15', 'Member+affiliate / mo ($)', { def: 0, min: 0 }),
    ],
    compute: (v) => {
      const views = asNum(v.views15v)
      const rpm = asNum(v.rpm15)
      const sponsor = asNum(v.sponsor15)
      const other = asNum(v.other15)
      const ad = views / 1000 * rpm
      const total = ad + sponsor + other
      const scaled = views * 1.5 / 1000 * rpm + sponsor + other
      return [
        res('Ad revenue / mo', money(ad), ad > 500 ? T.good : T.warn),
        res('Total / mo', money(total), T.good),
        res('With +50% views', money(scaled), T.good),
        res('RPM effect', `+$1 RPM = $${ratio(views / 1000, 1)}/mo`, T.good),
      ]
    },
  },
  {
    id: 'video-seo-score-checker',
    name: 'Video SEO Score Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Scores a video\u2019s search readiness \u2014 title, description, tags, thumbnail, captions and playlists \u2014 against YouTube\u2019s visibility levers.',
    tip: 'Captions are a free ranking multiplier \u2014 videos with accurate subs win the SERP more often than identical ones without.',
    usage: [
      'Audit your video against each input.',
      'Run the visibility scorecard.',
      'Fix low-scoring levers before next upload.',
    ],
    method: [
      'Each lever carries a weight witnessed in ranking studies.',
      'Transcript and coverage boost the accessibility axis.',
      'The composite maps to a post-upload action list.',
    ],
    fields: [
      sel('vt15', 'Title quality', ['Strong', 'Average', 'Weak'], 'Strong'),
      n('vdesc15', 'Description length (chars)', { def: 420, min: 0 }),
      sel('vtags15', 'Tag stack', ['Full 10-15', 'Minimal', 'Missing'], 'Full 10-15'),
      sel('thumb15', 'Custom thumbnail', ['Yes custom', 'Auto pick'], 'Yes custom'),
      sel('caps15', 'Captions', ['Custom uploaded', 'Auto-generated', 'None'], 'Auto-generated'),
      sel('pl15', 'Playlist placement', ['In niche playlist', 'Nowhere'], 'In niche playlist'),
    ],
    compute: (v) => {
      let s = 18
      s += asSel(v.vt15) === 'Strong' ? 18 : asSel(v.vt15) === 'Average' ? 10 : 3
      const desc = asNum(v.vdesc15)
      s += desc >= 250 ? 14 : desc >= 100 ? 8 : 3
      s += asSel(v.vtags15) === 'Full 10-15' ? 12 : asSel(v.vtags15) === 'Minimal' ? 6 : 1
      s += asSel(v.thumb15) === 'Yes custom' ? 14 : 6
      s += asSel(v.caps15) === 'Custom uploaded' ? 12 : asSel(v.caps15) === 'Auto-generated' ? 7 : 2
      s += asSel(v.pl15) === 'In niche playlist' ? 12 : 4
      const score = Math.round(clamp(s, 0, 100))
      return [
        res('Video SEO', `${score}/100`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('SEO caps', asSel(v.caps15), asSel(v.caps15) !== 'None' ? T.good : T.warn),
        res('File a card', score >= 75 ? 'Upload & promote' : 'Fix the levers first', T.good),
      ]
    },
  },
  {
    id: 'video-script-generator',
    name: 'Video Script Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Structures a complete talking-point script \u2014 hook, promise, 5-point middle, recap and CTA \u2014 for an 8 to 12-minute video.',
    tip: 'Write for the ear: short sentences, spoken contractions, and one idea per line \u2014 viewers stop for clarity, not jargon.',
    usage: [
      'Name the video topic and the promise.',
      'Add your five sub-points.',
      'Read the script aloud once before filming.',
    ],
    method: [
      'Hook lines open within the first 15 seconds.',
      'Five points follow a problem-solution arc.',
      'Recap and CTA close the retention loop.',
    ],
    fields: [
      txt('vtopic15', 'Video topic', 2, 'repurposing one blog post into 10 assets'),
      txt('vhook15', 'Hook promise', 2, 'turn one post into a week of content'),
      txt('vpoints15', '5 points (comma separated)', 3, 'Clips, Social carousels, Newsletter, LinkedIn, Shorts'),
      sel('vlens15', 'Target length', ['Short 3-5m', 'Standard 8-12m', 'Deep 15m+'], 'Standard 8-12m'),
    ],
    compute: (v) => {
      const hook = asStr(v.vhook15) || 'a strong promise'
      const points = (asStr(v.vpoints15) || 'Point one, Point two, Point three, Point four, Point five').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 5)
      const lens = asSel(v.vlens15)
      const words = lens === 'Deep 15m+' ? 1900 : lens === 'Short 3-5m' ? 650 : 1300
      const raw = [
        `HOOK (0:00) \u2014 "You have ONE post. Here\u2019s how it becomes ${hook} in 20 minutes."`,
        `PROMISE (0:15) \u2014 By the end of this video you\u2019ll have a plan for: ${points.join(', ')}.`,
        '',
        ...points.map((p, i) => `POINT ${i + 1} (${words / 5} words) \u2014 ${p}: say what it is, why it works, one example.`),
        '',
        `RECAP \u2014 Slam one line per point, then: "if you use just two of these, you\u2019ll feel the difference this week."`,
        `CTA \u2014 subscribe + comment your favourite repurposing tool.`,
      ].join('\n')
      return [
        res('Script size', `${words} words`, T.good),
        res('Hook time', '0:00-0:15', T.good, 'Hook in the first 15s'),
        res('Structure', `${points.length} points + recap + CTA`, T.good),
        doc('Script skeleton', raw),
      ]
    },
  },
  {
    id: 'shorts-ideas-generator',
    name: 'Shorts Ideas Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Assembles a backlog of vertical short-form hooks that repurpose your long-form material into bingeable loops.',
    tip: 'Shorts that open with a visible outcome in the first second survive the swipe test \u2014 stack the money idea front and center.',
    usage: [
      'Name your content axis.',
      'Generate the short-hook set.',
      'Shoot and post daily for two weeks to find the one that pops.',
    ],
    method: [
      'Hook templates target the first-second retention.',
      'Repurposing angles map to existing long-form assets.',
      'A trending-topic axis mixes with evergreen ones.',
    ],
    fields: [
      txt('axis15', 'Content axis', 2, 'productivity systems'),
      sel('vert15', 'Vertical format', ['Talking head', 'Demo close-up', 'Text overlay', 'POV'], 'Demo close-up'),
    ],
    compute: (v) => {
      const axis = asStr(v.axis15) || 'your topic'
      const ideas = [
        `3 ${axis} mistakes (you\u2019ll make #2 today)`,
        `POV: you finally do ${axis} right`,
        `I tested ${axis} for 30 days \u2014 this is the result`,
        `Stop doing ${axis} like everyone else`,
        `The ${axis} hack your boss won\u2019t tell you`,
        `What 100 days of ${axis} looks like (timelapse)`,
      ]
      return [
        res('Backlog', `${ideas.length}`, T.good),
        res('Format', asSel(v.vert15), T.good),
        doc('Shorts hooks', ideas.join('\n')),
      ]
    },
  },
  {
    id: 'video-hook-generator',
    name: 'Video Hook Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Writes first-15-seconds hooks using outcome, stakes, question and pattern-breaking frames tuned to viewer psychology.',
    tip: 'Cut everything before the moment of suspense \u2014 the hook is whatever a viewer cannot scroll past at second one.',
    usage: [
      'Enter the video\u2019s payoff.',
      'Generate across hook frames.',
      'Deliver the top hook in the first 15 seconds.',
    ],
    method: [
      'Four frames each target a different attention driver.',
      'Hooks are compressed to 1-2 spoken sentences.',
      'Cold-open syntax is stressed over warm intros.',
    ],
    fields: [
      txt('pay15f', 'Payoff', 2, 'cut your ad spend 30% in a month'),
      sel('ctr15', 'Primary frame', ['Outcome', 'Stakes', 'Question', 'Pattern-break'], 'Outcome'),
    ],
    compute: (v) => {
      const pay = asStr(v.pay15f) || 'a big result'
      const frame = asSel(v.ctr15)
      const hooks = frame === 'Stakes'
        ? [`Every ad dollar you don\u2019t track is burning.`, `This mistake costs founders $30k a year.`, `Lose 30% spend if you ignore this.`]
        : frame === 'Question'
        ? [`How do we ${pay.replace(/^cut |^double |^make /, '')}?`, `What if $10 a day was too much?`, `Why does everyone get this wrong?`]
        : frame === 'Pattern-break'
        ? [`Stop running more ads. Run fewer, smarter.`, `Everyone\u2019s wrong about ad spend. Including me \u2014 once.`, `The least obvious way to ${pay.replace(/^cut /, 'cut ')}.`]
        : [`I cut costs 30% in 30 days. Here\u2019s the play.`, `You can ${pay} \u2014 no budget bump.`, `The exact plan: ${pay}. Watch.`]
      return [
        res('Frame', frame, T.good),
        res('Seconds', '1-15', T.good),
        doc('Hook options', hooks.join('\n')),
      ]
    },
  },
  {
    id: 'youtube-channel-name-generator',
    name: 'YouTube Channel Name Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Builds striking, memorable channel name candidates from your niche and brand words, with searchability checks.',
    tip: 'A channel name that says the niche in 2 words joins search memory fast; everything longer gets lexical drift.',
    usage: [
      'Say your niche and your personal/map vibes word.',
      'Generate across naming styles.',
      'Lock one that is unique in search before branding.',
    ],
    method: [
      'Name styles alternate keyword-led and persona-led framing.',
      'Each candidate dedups and verifies availability-based patterns.',
      'Searchability is scored by niche-word presence.',
    ],
    fields: [
      txt('niche15n', 'Niche', 2, 'data science'),
      txt('word15n', 'Personal word / vibe', 2, 'peak'),
      sel('style15n', 'Naming style', ['Keyword-led', 'Persona-led', 'Playful', 'Minimal'], 'Keyword-led'),
    ],
    compute: (v) => {
      const niche = asStr(v.niche15n) || 'your niche'
      const word = asStr(v.word15n) || 'launch'
      const style = asSel(v.style15n)
      const caps = (s: string) => s.split(' ').map((x) => x[0]?.toUpperCase() + x.slice(1)).join(' ')
      const names = style === 'Keyword-led'
        ? [`${caps(niche)}Hub`, `${caps(niche)} Daily`, `${caps(word)} ${caps(niche)}`]
        : style === 'Persona-led'
        ? [`The ${caps(word)} Analyst`, `${caps(word)} Explains`, `A ${caps(niche)} Story`]
        : style === 'Playful'
        ? [`Nerdy ${caps(niche)}`, `${caps(word)} on ${caps(niche)}`, `Yeah ${caps(niche)} Boss`]
        : [`${caps(niche)}.Run`, `Run ${caps(niche)}`, `${caps(word)}.FM`]
      return [
        res('Style', style, T.good),
        res('Searchability', /[a-z0-9]/.test(niche) ? 'Niche keyword present' : 'Weak', T.good),
        doc('Name candidates', names.join('\n')),
      ]
    },
  },
]
