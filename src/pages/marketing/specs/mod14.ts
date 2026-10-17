import { n, sel, txt, res, doc, T, asNum, asSel, asStr, pct, ratio, money, num } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Influencer & Affiliate Marketing'

function engagement(likes: number, comments: number, reach: number): number {
  return reach > 0 ? ((likes + comments) / reach) * 100 : 0
}

export const mod14: MarketingSeoSpec[] = [
  {
    id: 'influencer-engagement-rate-calculator',
    name: 'Influencer Engagement Rate Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Turns likes, comments and reach into the engagement rate benchmark that predicts whether a creator will actually stir your audience.',
    tip: 'Weight comments ~5x likes in your evaluation \u2014 comment-heavy engagement signals a real community, not a vanity audience.',
    usage: [
      'Pull reach, likes and comments from the last 10 posts.',
      'Run the engagement calculation.',
      'Shortlist only creators above your tier benchmark.',
    ],
    method: [
      'Engagement equals reactions plus comments divided by reach.',
      'Comment-weighted and raw variants are both reported.',
      'Benchmarks scale by follower tier to prevent false cuts.',
    ],
    fields: [
      txt('handle14', 'Creator handle', 2, '@sarahfits'),
      n('reach14', 'Avg post reach', { def: 48000, min: 1 }),
      n('likes14', 'Avg likes', { def: 3200, min: 0 }),
      n('cmts14', 'Avg comments', { def: 240, min: 0 }),
      sel('tier14', 'Follower tier', ['Micro <10k', 'Mid 10-100k', 'Macro 100k-1M', 'Mega >1M'], 'Mid 10-100k'),
    ],
    compute: (v) => {
      const reach = asNum(v.reach14)
      const likes = asNum(v.likes14)
      const cmts = asNum(v.cmts14)
      const raw = engagement(likes, cmts, reach)
      const weighted = engagement(likes, cmts * 4, reach)
      const bench = asSel(v.tier14) === 'Micro <10k' ? 5 : asSel(v.tier14) === 'Mid 10-100k' ? 3.5 : asSel(v.tier14) === 'Macro 100k-1M' ? 2 : 1.2
      const buys = raw >= bench
      return [
        res('Engagement rate', ratio(raw, 2) + '%', buys ? T.good : T.warn, `Benchmark ${bench}% for this tier`),
        res('Comment-weighted', ratio(weighted, 2) + '%', weighted >= bench ? T.good : T.warn),
        res('Verdict', buys ? 'Strong buy' : 'Keep watching', buys ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'influencer-roi-calculator',
    name: 'Influencer ROI Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Measures what a creator campaign returned versus what it cost, across direct sales and attributed CALC revenue.',
    tip: 'Count owned-brand value too: reposts, rights to content and audience list growth are real proceeds after a campaign.',
    usage: [
      'Enter fee, per-post cost and revenue attributed.',
      'Add your product margin.',
      'Read ROI and profit verdicts.',
    ],
    method: [
      'ROI is net profit attributable divided by campaign cost.',
      'Margin percent converts revenue to tangible profit.',
      'Owned-value uplift is added as a conservative bonus line.',
    ],
    fields: [
      n('fee14', 'Creator fee ($)', { def: 1200, min: 0 }),
      n('rev14', 'Attributed revenue ($)', { def: 3900, min: 0 }),
      n('marg14', 'Product margin (%)', { def: 55, min: 0, max: 100 }),
      n('owned14', 'Estimated owned value ($)', { def: 300, min: 0 }),
    ],
    compute: (v) => {
      const fee = asNum(v.fee14)
      const rev = asNum(v.rev14)
      const marg = asNum(v.marg14) / 100
      const owned = asNum(v.owned14)
      const profit = rev * marg + owned
      const roi = fee > 0 ? profit / fee : 0
      const net = profit - fee
      return [
        res('Return on spend', ratio(roi, 2) + 'x', roi >= 1.5 ? T.good : roi >= 1 ? T.warn : T.bad),
        res('Net profit', money(net), net > 0 ? T.good : T.bad),
        res('Effective margin', pct(marg * 100), T.good),
        res('Owned bonus', money(owned), owned > 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'influencer-pricing-calculator',
    name: 'Influencer Pricing Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb:
      'Estimates a fair creator rate from reach, engagement and niche before you negotiate the CPM or flat fee.',
    tip: 'Use engagement-adjusted rates, not follower counts \u2014 a targeted 20k micro-influencer frequently prices better than a 200k broad one.',
    usage: [
      'Enter reach, engagement and niche.',
      'Read the market-rate band and CPM.',
      'Anchor your offer inside the fair range.',
    ],
    method: [
      'Base rate derives from reach times a tier-per-CPM.',
      'Engagement multiplier rewards real communities.',
      'Niche (beauty/finance) lifts the base by demand scarcity.',
    ],
    fields: [
      n('reach14p', 'Average reach', { def: 60000, min: 1 }),
      n('er14p', 'Engagement rate (%)', { def: 4.2, min: 0, step: 0.1 }),
      sel('niche14p', 'Niche', ['Beauty', 'Finance/tech', 'Lifestyle', 'Gaming', 'Food'], 'Lifestyle'),
      n('posts14p', 'Posts in campaign', { def: 2, min: 1 }),
    ],
    compute: (v) => {
      const reach = asNum(v.reach14p)
      const er = asNum(v.er14p)
      const niche = asSel(v.niche14p)
      const posts = asNum(v.posts14p)
      const cpm = reach / 1000
      const nicheMult = niche === 'Finance/tech' ? 1.6 : niche === 'Beauty' ? 1.35 : niche === 'Gaming' ? 0.9 : niche === 'Food' ? 0.95 : 1
      const basePerPost = cpm * (er >= 4 ? 9 : er >= 2 ? 5.5 : 3.5) * nicheMult
      const fairLow = basePerPost * posts * 0.85
      const fairHigh = basePerPost * posts * 1.2
      return [
        res('Fair range', `${money(fairLow)} \u2013 ${money(fairHigh)}`, T.good),
        res('Average per post', money((fairLow + fairHigh) / 2 / posts), T.good),
        res('Effective CPM', '$' + ratio(basePerPost / cpm, 2), T.good),
        res('Niche multiplier', `${niche} \u00d7${ratio(nicheMult, 2)}`, T.good),
      ]
    },
  },
  {
    id: 'affiliate-commission-calculator',
    name: 'Affiliate Commission Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Slices a sale into commission, net payout and your true breakeven clicks, based on order value and rate.',
    tip: 'Negotiate tiered commission: 10% plus a 15% kicker above $50 cart size \u2014 baskets beat pure rates on every scale.',
    usage: [
      'Enter order value and commission rate.',
      'Add your expected conversion rate.',
      'Read the payout and the clicks equation.',
    ],
    method: [
      'Commission equals order value times the tiered rate.',
      'Net payout subtracts the network\u2019s fee.',
      'Breakeven clicks equals payout divided by per-click cost and conversion.',
    ],
    fields: [
      n('aov14', 'Average order value ($)', { def: 74, min: 0 }),
      n('rate14', 'Commission rate (%)', { def: 20, min: 0, max: 80 }),
      n('cr14', 'Click conversion (%)', { def: 2.5, min: 0, max: 30, step: 0.1 }),
      n('nw14', 'Network fee (%)', { def: 8, min: 0, max: 30 }),
    ],
    compute: (v) => {
      const aov = asNum(v.aov14)
      const rate = asNum(v.rate14) / 100
      const cr = asNum(v.cr14) / 100
      const nwf = asNum(v.nw14) / 100
      const comm = aov * rate
      const net = comm * (1 - nwf)
      const clicksToSale = cr > 0 ? 1 / cr : Infinity
      return [
        res('Commission per sale', money(comm), comm > 10 ? T.good : T.warn),
        res('Net payout', money(net), net > 8 ? T.good : T.warn, 'After network fee'),
        res('Clicks per sale', Number.isFinite(clicksToSale) ? ratio(clicksToSale, 0) : 'N/A', T.good),
        res('Blended CAC headroom', '$' + ratio(net / (clicksToSale || 1), 2), T.good),
      ]
    },
  },
  {
    id: 'affiliate-revenue-calculator',
    name: 'Affiliate Revenue Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb:
      'Projects your affiliate income from traffic, click rate, conversion and commission into a monthly estimate with upside scenarios.',
    tip: 'Income per click is the hero number \u2014 double it (better fit or better rate) and your projection doubles with traffic flat.',
    usage: [
      'Enter monthly traffic and target click rate.',
      'Add conversion and commission.',
      'Build the base and stretch scenarios.',
    ],
    method: [
      'Visitors times click-through equals monthly clicks.',
      'Monthly revenue is clicks times conversion times commission.',
      'Conservative and stretch margins bracket uncertainty.',
    ],
    fields: [
      n('vis14', 'Monthly visits', { def: 45000, min: 1 }),
      n('ctrTo14', 'Click-through to merchant (%)', { def: 1.8, min: 0, max: 30, step: 0.1 }),
      n('cr14b', 'Conversion (%)', { def: 3, min: 0, max: 30, step: 0.1 }),
      n('comm14', 'Avg commission ($)', { def: 9.5, min: 0 }),
    ],
    compute: (v) => {
      const vis = asNum(v.vis14)
      const ctr = asNum(v.ctrTo14) / 100
      const cr = asNum(v.cr14b) / 100
      const comm = asNum(v.comm14)
      const clicks = vis * ctr
      const base = clicks * cr * comm
      const stretch = base * 1.6
      return [
        res('Monthly clicks', num(clicks)),
        res('Base revenue / mo', money(base), base > 500 ? T.good : T.warn),
        res('Stretch revenue', money(stretch), T.good, 'Optimized landing variant'),
        res('Income / click', '$' + ratio(cr * comm, 3), T.good),
      ]
    },
  },
  {
    id: 'affiliate-epc-calculator',
    name: 'Affiliate EPC Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Computes Earnings Per Click across a program using earnings and clicks, so you can compare one program against another fairly.',
    tip: 'EPC is the only stat that compares across merchants \u2014 a 40% program may earn less EPC than a 12% one when the cart is bigger.',
    usage: [
      'Enter clicks sent and earnings received.',
      'Run the EPC calculation.',
      'Rank programs by EPC, not by stated percentage.',
    ],
    method: [
      'EPC is earnings divided by clicks across a period.',
      'A network baseline (~$2-8) contextualizes the figure.',
      'Trend-by-trend EPC exposes program health changes.',
    ],
    fields: [
      n('clicks14', 'Clicks sent', { def: 1300, min: 1 }),
      n('earn14', 'Earnings ($)', { def: 510, min: 0 }),
      n('days14', 'Period (days)', { def: 30, min: 1 }),
    ],
    compute: (v) => {
      const clicks = asNum(v.clicks14)
      const earn = asNum(v.earn14)
      const days = asNum(v.days14)
      const epc = earn / clicks
      const daily = earn / days
      return [
        res('EPC', '$' + ratio(epc, 2), epc >= 2 ? T.good : epc >= 1 ? T.warn : T.bad, 'Network median $2-8 range'),
        res('Daily earnings', '$' + ratio(daily, 2)),
        res('Conversion implied', epc > 0 ? ratio(clicks / Math.max(1, earn / 10), 0) + ' clicks/$10 earned' : 'N/A', T.good),
      ]
    },
  },
  {
    id: 'affiliate-conversion-calculator',
    name: 'Affiliate Conversion Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Turns landing-reach into affiliate orders, revealing how many visitors each link traffic inflow must deliver.',
    tip: 'Judge links by orders-per-rank, not clicks alone \u2014 a #3-rank that converts twice is worth more than the #1 that clicks cheaply.',
    usage: [
      'Enter reach and link clicks.',
      'Add the merchant conversion rate.',
      'Read orders and the gap to your target.',
    ],
    method: [
      'Reach-to-click-to-order flows sequentially.',
      'Orders per click come from the merchant conversion benchmark.',
      'The delta to target surfaces the traffic you need to add.',
    ],
    fields: [
      n('reach14c', 'Page reach', { def: 18000, min: 1 }),
      n('taps14', 'Affiliate link taps', { def: 620, min: 0 }),
      n('conv14c', 'Merchant conversion (%)', { def: 3.2, min: 0, max: 30, step: 0.1 }),
      n('goal14c', 'Monthly order goal', { def: 40, min: 0 }),
    ],
    compute: (v) => {
      const reach = asNum(v.reach14c)
      const taps = asNum(v.taps14c)
      const conv = asNum(v.conv14c) / 100
      const goal = asNum(v.goal14c)
      const orders = taps * conv
      const gap = Math.max(0, goal - orders)
      const needTaps = conv > 0 && gap > 0 ? gap / conv : 0
      return [
        res('Orders / mo', ratio(orders, 1), orders >= goal ? T.good : T.warn),
        res('Link tap rate', pct(taps / reach * 100, 1), taps / reach >= 0.04 ? T.good : T.warn),
        res('Delivery to goal', `+${num(needTaps)} taps needed`, gap > 0 ? T.warn : T.good),
        res('Conv benchmark', pct(conv * 100, 1), conv >= 0.03 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'affiliate-link-generator',
    name: 'Affiliate Link Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds a clean tracked affiliate URL with your sub-id and source token so every click is attributable in one dashboard.',
    tip: 'Append a per-post source token (e.g. ?vt_aff=holiday-guide) so your analytics can cut by message, not just by merchant.',
    usage: [
      'Enter the merchant base link.',
      'Add your affiliate ID and source token.',
      'Copy the complete tracked URL for your post.',
    ],
    method: [
      'The base URL is parsed and re-serialized with your params.',
      'Affiliate ID and source tokens are appended safely.',
      'A utm source layer records the placement context.',
    ],
    fields: [
      txt('base14l', 'Merchant product URL', 2, 'https://shop.com/products/running-shoes'),
      txt('aff14l', 'Affiliate ID / sub-id', 2, 'vz-tools-21'),
      txt('src14l', 'Source token', 2, 'best-shoes-guide'),
    ],
    compute: (v) => {
      const base = asStr(v.base14l) || 'https://merchant.com/product'
      const aff = asStr(v.aff14l) || 'aff123'
      const src = asStr(v.src14l) || 'post-placeholder'
      const sep = base.includes('?') ? '&' : '?'
      const link = `${base}${sep}ref=${encodeURIComponent(aff)}&vt_aff=${encodeURIComponent(src)}&utm_source=${encodeURIComponent(src)}`
      return [
        res('Tracking', 'ID + source + utm', T.good),
        res('Length', `${link.length} chars`, link.length < 200 ? T.good : T.warn),
        doc('Tracked link', link),
      ]
    },
  },
  {
    id: 'influencer-brief-generator',
    name: 'Influencer Brief Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes a crisp creator brief \u2014 goals, audience, deliverables, musts and proof \u2014 that protects your campaign message.',
    tip: 'Lock 3 must-haves max and leave the creative open; over-briefed creators post stiff ads with low engagement.',
    usage: [
      'Describe the product and campaign goal.',
      'Add the key message and 3 must-haves.',
      'Send alongside your content license terms.',
    ],
    method: [
      'The brief leads with objective and audience to guide context.',
      'Key message is repeated in every delivery instruction.',
      'Must-haves are bounded to three to preserve creativity.',
    ],
    fields: [
      txt('prod14', 'Product / offer', 2, 'the AeroFlow water bottle'),
      txt('goal14b', 'Campaign goal', 2, 'drive trial signups from fitness audiences'),
      txt('msg14', 'Key message', 2, 'stays cold 24 hours, fits every bottle cage'),
      txt('aud14b', 'Target audience', 2, 'weekend cyclists, 25-45'),
    ],
    compute: (v) => {
      const prod = asStr(v.prod14) || 'your product'
      const goal = asStr(v.goal14b) || 'drive conversions'
      const msg = asStr(v.msg14) || 'your key message'
      const aud = asStr(v.aud14b) || 'your audience'
      const raw = [
        `Campaign: ${prod} \u2014 ${goal}`,
        `Audience: ${aud}`,
        '',
        `Key message (repeat in every format): "${msg}"`,
        '',
        'Deliverables:',
        '\u2022 1 reel + 1 static story set + 1 feed post',
        '\u2022 Native voice, authentic demo, no scripted reads',
        '\u2022 Include the tracked link + discount code',
        '',
        'Must-haves (max 3):',
        '\u2022 Show the 24h cold claim in action',
        '\u2022 Mention your commute ease',
        '\u2022 Drop the code on screen 2+ times',
      ].join('\n')
      return [
        res('Brief structure', 'Goal \u2192 audience \u2192 message', T.good),
        res('Must-haves', '3', T.good, 'Kept bounded for authentic delivery'),
        doc('Creator brief', raw),
      ]
    },
  },
  {
    id: 'influencer-outreach-generator',
    name: 'Influencer Outreach Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Drafts a DM/email that compliments a creator\u2019s real work, introduces your fit and proposes a no-pressure collab leap.',
    tip: 'Lead with a specific post you genuinely liked \u2014 creators blacklist template DMs within one look.',
    usage: [
      'Add the creator and the post you love.',
      'State your brand fit in one line.',
      'Close with the lightest hook: sample or teaser.',
    ],
    method: [
      'Compliment-relative specificity does the personalization lifting.',
      'The fit line shows you\u2019ve watched their niche, not bulk mailed.',
      'A low-commitment hook (sample) converts more than a paid pitch.',
    ],
    fields: [
      txt('creator14', 'Creator @handle', 2, '@sara_runs'),
      txt('post14', 'Post you liked', 2, 'your hydration myth-buster reel'),
      txt('fit14', 'Brand fit', 2, 'our water bottle stays cold 24h \u2014 perfect for your audience'),
      sel('hook14', 'First hook', ['Free sample', 'Paid trial post', 'Event invite'], 'Free sample'),
    ],
    compute: (v) => {
      const creator = asStr(v.creator14) || '@creator'
      const post = asStr(v.post14) || 'that post'
      const fit = asStr(v.fit14) || 'a genuine fit for you'
      const hook = asSel(v.hook14)
      const raw = [
        `Hey ${creator} \u2014 loved ${post}. The pacing was unreal.`,
        `We make ${fit}. Feels like a natural fit for your feed.`,
        `Would you be open to a ${hook === 'Free sample' ? 'free sample' : session(hook)} and an honest take?`,
        `No strings if you don\u2019t vibe with it.`,
      ].join('\n')
      return [
        res('Personalization', 'Specific post cited', T.good),
        res('Hook', hook, T.good),
        doc('Outreach DM', raw),
      ]
    },
  },
  {
    id: 'brand-collaboration-email-generator',
    name: 'Brand Collaboration Email Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Composes a polished collab email proposing a co-creation, giveaway or sponsored placement between brand and creator.',
    tip: 'Name the reciprocity: give value (exclusive preview) before asking for posts \u2014 reciprocity is the collab grease.',
    usage: [
      'Add the brand and creator names.',
      'Choose the collaboration type.',
      'Send after the DM warm-up, not cold.',
    ],
    method: [
      'The greeting opens the relationship already started in DMs.',
      'The value-in-flow makes the collab feel fair, not bought.',
      'Terms are left light across a two-step CTA.',
    ],
    fields: [
      txt('brand14', 'Brand name', 2, 'AeroFlow'),
      txt('creator14b', 'Creator name', 2, 'Sara'),
      sel('type14', 'Collab type', ['Co-created product', 'Giveaway', 'Sponsored feature', 'Affiliate 20%'], 'Giveaway'),
      txt('value14', 'Value we bring + ask', 2, 'exclusively-stocked batch for your first 100 followers'),
    ],
    compute: (v) => {
      const brand = asStr(v.brand14) || 'our brand'
      const creator = asStr(v.creator14b) || 'creator'
      const type = asSel(v.type14)
      const value = asStr(v.value14) || 'a fresh idea'
      const raw = [
        `Hi ${creator},`,
        `Loved our DM thread \u2014 the energy smelt like a match.`,
        `We\u2019d like to propose a ${type}: ${value}.`,
        `Full detail in 5 bullets (no deck, promise). Okay to send?`,
        `\u2014 ${brand}`,
      ].join('\n')
      return [
        res('Collab type', type, T.good),
        res('Reciprocity', 'Value first', T.good),
        doc('Collab email', raw),
      ]
    },
  },
  {
    id: 'affiliate-content-ideas-generator',
    name: 'Affiliate Content Ideas Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Produces linkable, review-led content angles for your affiliate niche with the buying-stage each article targets.',
    tip: 'Alternate commercial pages with informational magnets \u2014 the magnets earn links and rankings that feed the review pages.',
    usage: [
      'Set your niche and the products you promote.',
      'Generate the idea set with stage labels.',
      'Schedule the alternation into your editorial calendar.',
    ],
    method: [
      'Idea templates map to distinct buying stages.',
      'Commercial and magnet formats interleave for SEO balance.',
      'Each idea names the primary product hook.',
    ],
    fields: [
      txt('niche14', 'Niche', 2, 'home coffee gear'),
      txt('prod14c', 'Flagship product', 2, 'the AeroPress Go'),
    ],
    compute: (v) => {
      const niche = asStr(v.niche14) || 'your niche'
      const prod = asStr(v.prod14c) || 'featured product'
      const ideas = [
        `[Magnet] The complete guide to ${niche} for beginners (earns backlinks)`,
        `[Commercial] ${prod} review \u2014 honest after 3 months`,
        `[Magnet] Best ${niche} under $100 (comparison table)`,
        `[Commercial] ${prod} vs budget competitors \u2014 real data`,
        `[Magnet] How to travel-brew ${niche.replace('gear', 'coffee')} like a pro`,
        `[Commercial] ${prod} accessories worth buying (upsell links)`,
      ].join('\n')
      return [
        res('Mix', '3 magnets + 3 commercial', T.good, 'Alternate in the calendar'),
        res('Linkable magnets', '3', T.good),
        doc('Content calendar angles', ideas),
      ]
    },
  },
]

function session(hook: string): string {
  return hook === 'Paid trial post' ? 'paid trial post' : 'event slot'
}