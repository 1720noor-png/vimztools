import { n, sel, txt, ck, res, doc, T, asNum, asSel, asStr, asBoolList, dt } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Local SEO'

export const mod08: MarketingSeoSpec[] = [
  {
    id: 'local-seo-audit-tool',
    name: 'Local SEO Audit Tool',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Runs a 12-point local presence check covering profile, consistency, reviews, schema and citations, outputting a readiness score.',
    tip: 'Fix NAP (name-address-phone) inconsistencies first \u2014 they block ranking for every other local signal you improve.',
    usage: [
      'Walk the checks and tick what your business actually has.',
      'Run the readiness scoring.',
      'Fix the missing rows in priority order.',
    ],
    method: [
      'Each completed check contributes to one of five local pillars.',
      'The readiness score rewards breadth before depth.',
      'Missing schema and NAP gaps weigh double because they leak everywhere.',
    ],
    fields: [
      txt('biz8', 'Business name & city', 2, 'Smith Dental \u2014 Austin'),
      ck('ck8', 'Local presence checks', [
        'Google Business Profile claimed & verified',
        'NAP identical on every platform',
        'Website includes Name, Address & Phone',
        'LocalBusiness schema implemented',
        'Consistent category & primary services',
        'At least 15 customer reviews',
        'Responding to reviews weekly',
        'Local landing page with geo keywords',
        'Citations match on Yelp, Yellowpages, Bing',
        'Embedded map on contact page',
        'GEO-tagged images & logo',
        'Business hours, including holidays, updated',
      ]),
    ],
    compute: (v) => {
      const checked = asBoolList(v.ck8)
      const on = checked.filter(Boolean).length
      const score = Math.round(on * 100 / 12)
      const lacks: string[] = []
      if (!checked[0]) lacks.push('Google Business Profile claimed & verified')
      if (!checked[1]) lacks.push('NAP identical')
      if (!checked[3]) lacks.push('LocalBusiness schema')
      if (!checked[5]) lacks.push('At least 15 customer reviews')
      if (!checked[8]) lacks.push('Citations match on Yelp, Yellowpages, Bing')
      return [
        res('Local readiness', `${score}%`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Checks complete', `${on}/12`),
        doc('Priority gaps', lacks.length ? lacks.map((x) => `\u2022 ${x}`).join('\n') : 'All core checks complete \u2014 dominate your m-pack.'),
      ]
    },
  },
  {
    id: 'google-business-profile-generator',
    name: 'Google Business Profile Description Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes a 750-character Google Business Profile description that leads with your primary service, your area and a trust differentiator.',
    tip: 'Use 2-3 natural keyword phrases, keep it skimmable, and always end with your unique service guarantee or niche.',
    usage: [
      'Describe what you offer and where.',
      'Add your proof points and guarantee.',
      'Copy the description into your GBP about section.',
    ],
    method: [
      'The first sentence states service + area + customer target.',
      'Proof lines stack ratings, years, and a differentiator.',
      'The close guides the reader toward the exact next click.',
    ],
    fields: [
      txt('svc8', 'Primary service', 2, 'emergency dental care'),
      txt('area8', 'Service area(s)', 2, 'Austin, TX'),
      txt('proof8', 'Proof point', 2, '4.9 rating over 300 reviews, 12 years local'),
      txt('gnt8', 'Guarantee / differentiator', 2, 'same-day appointments'),
    ],
    compute: (v) => {
      const svc = asStr(v.svc8) || 'expert local services'
      const area = asStr(v.area8) || 'your city'
      const proof = asStr(v.proof8) || 'trusted locally'
      const gnt = asStr(v.gnt8) || 'fast turnaround'
      const raw = [
        `${svc} in ${area} with a local team customers trust.`,
        `${proof} \u2014 we treat every client like a neighbour.`,
        `From consultation to follow-up, we make ${gnt} the standard, not the exception.`,
        `Proudly serving ${area} and surrounding communities. Call today or book online \u2014 we reply fast.`,
      ].join('\n')
      return [
        res('Length', `${raw.length}/750 chars`, raw.length <= 750 ? T.good : T.warn),
        res('Geo keywords', area, T.good),
        doc('GBP description', raw),
      ]
    },
  },
  {
    id: 'local-keyword-generator',
    name: 'Local Keyword Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Produces geo-modified keyword variants \u2014 city, neighborhood, and "near me" \u2014 so you can own every local variation of your core service.',
    tip: 'Target "near me" and neighborhood variants on the same landing page to consolidate local relevance.',
    usage: [
      'Enter your core service terms.',
      'Type the city and neighborhoods you serve.',
      'Distribute the variants across geo landing pages.',
    ],
    method: [
      'Core terms are crossed with every geo token.',
      'Near-me, brick-and-mortar and service-area phrasing are all generated.',
      'Variant counts and lengths roughly mirror real local SERP phrasing.',
    ],
    fields: [
      txt('sv2', 'Core services (line separated)', 3, 'dental implants\nteeth whitening'),
      txt('geo2', 'City / neighborhoods', 2, 'Austin, Round Rock, Cedar Park'),
    ],
    compute: (v) => {
      const svc = (asStr(v.sv2) || 'plumber').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 6)
      const geos = (asStr(v.geo2) || 'your city').split(/[,|\n]/).map((s) => s.trim()).filter(Boolean).slice(0, 8)
      const out: string[] = []
      for (const s of svc) {
        for (const g of geos) out.push(`${s} ${g}`, `${s} near me`, `${s} in ${g}`)
      }
      return [
        res('Geo variants', `${out.length}`, out.length >= 12 ? T.good : T.warn),
        res('Cities covered', `${geos.length}`, T.good),
        doc('Local keyword list', out.slice(0, 50).join('\n')),
      ]
    },
  },
  {
    id: 'local-ranking-checker',
    name: 'Local Ranking Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Combines your map-pack position, GBP signals and review velocity into a single local pack health snapshot.',
    tip: 'Jump two map-pack positions with one month of steady review velocity and photo uploads \u2014 proximity is sticky, activity isn\u2019t.',
    usage: [
      'Log your current map-pack position for the money keyword.',
      'Enter your review and photo signals.',
      'Read the pack-health score and growth lever.',
    ],
    method: [
      'Pack position dominates the composite score.',
      'Review velocity and photo freshness act as signal multipliers.',
      'Distance factor is sanity-checked against CTR expectations.',
    ],
    fields: [
      n('pos8', 'Map-pack position', { def: 4, min: 1, max: 20 }),
      n('revs8', 'Reviews count', { def: 38, min: 0 }),
      n('vel8', 'New reviews this month', { def: 4, min: 0 }),
      n('phot8', 'Photos last 30 days', { def: 10, min: 0 }),
      n('rate8', 'Average rating', { def: 4.6, min: 0, max: 5, step: 0.1 }),
    ],
    compute: (v) => {
      const pos = asNum(v.pos8)
      const vel = asNum(v.vel8)
      const phot = asNum(v.phot8)
      const rating = asNum(v.rate8)
      const base = pos === 1 ? 90 : pos === 2 ? 80 : pos === 3 ? 68 : pos === 4 ? 55 : Math.max(20, 60 - pos * 8)
      const score = Math.round(clamp8(base + Math.min(10, vel * 2) + Math.min(6, phot / 2) + (rating >= 4.5 ? 5 : rating >= 4 ? 2 : -5), 0, 100))
      return [
        res('Pack health', `${score}%`, score >= 70 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Review velocity', `${vel}/mo`, vel >= 3 ? T.good : T.warn),
        res('Photo freshness', `${phot}/mo`, phot >= 5 ? T.good : T.warn),
        res('Suggestion', pos <= 3 ? 'Defend with velocity' : 'Close the distance \u2014 add geo pages', T.good),
      ]
    },
  },
  {
    id: 'nap-consistency-checker',
    name: 'NAP Consistency Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Verifies your Name, Address and Phone number appear identically across the platforms search engines trust for local rankings.',
    tip: 'One suffix (\u201cSuite 2\u201d vs \u201cSte 2\u201d) across 10 citations can halve local trust \u2014 standardize once, everywhere.',
    usage: [
      'Paste exactly how your business should be written.',
      'Tick off platforms where you have verified the match.',
      'Fix the mismatches in priority order.',
    ],
    method: [
      'Each verified platform adds confidence weight.',
      'Address-abbreviation differences are flagged as risk, not forgiveable.',
      'Coverage Ã— uniformity equals the final consistency score.',
    ],
    fields: [
      txt('nap8', 'Canonical NAP line', 2, 'Smith Dental, 240 Main St Ste 2, Austin, TX 78704, (512) 555-0142'),
      ck('pla8', 'Platforms verified consistent', ['Google Business Profile', 'Yelp', 'Bing Places', 'Facebook', 'Yellowpages', 'Apple Maps', 'Your own website', 'Directory aggregators']),
    ],
    compute: (v) => {
      const on = asBoolList(v.pla8).filter(Boolean).length
      const total = asBoolList(v.pla8).length
      const pct = Math.round(on * 100 / total)
      return [
        res('NAP consistency', `${pct}%`, pct >= 80 ? T.good : pct >= 50 ? T.warn : T.bad),
        res('Platforms verified', `${on}/${total}`),
        res('Exact line length', `${(asStr(v.nap8) || '').length} chars`),
        doc('Next move', pct < 50 ? 'Verify & fix Google + your site first; then push to the directories.' : pct < 80 ? 'Clear the remaining platforms in the same phone/address format.' : 'Full consistency \u2014 refresh every 6 months.'),
      ]
    },
  },
  {
    id: 'local-citation-checker',
    name: 'Local Citation Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Audits your citation footprint \u2014 where your business appears online \u2014 and scores copy coverage against the top-tier directories.',
    tip: 'Quality beats quantity: 20 consistent tier-1 citations outrank 80 sporadic ones, every time.',
    usage: [
      'List every platform you know you appear on.',
      'Tick the tiers you hold.',
      'Fill gaps in tier 1 before touching anything else.',
    ],
    method: [
      'Tier-1 directories (maps, aggregators) carry the strongest rank weight.',
      'Coverage is scored per tier with tier-1 double-weighted.',
      'The score reflects distribution quality, not raw count.',
    ],
    fields: [
      txt('ci8', 'Business & industry', 2, 'Riverside Law \u2014 family law'),
      ck('cit8', 'Citations held', [
        'Google Business Profile',
        'Apple Maps',
        'Bing Places',
        'Yelp',
        'Facebook business page',
        'Yellowpages',
        'BBB',
        'Manta',
        'Foursquare',
        'Industry association directory',
        'Local chamber of commerce',
        'Compete aggregator sync (e.g. Yext)'].slice(0, 12)),
    ],
    compute: (v) => {
      const held = asBoolList(v.cit8).filter(Boolean).length
      const tier1 = [0, 1, 2, 3, 11].filter((i) => asBoolList(v.cit8)[i]).length
      const rest = held - tier1
      const score = Math.round(clamp8(tier1 * 9 + rest * 4, 0, 100))
      return [
        res('Citation footprint', `${score}%`, score >= 70 ? T.good : score >= 40 ? T.warn : T.bad),
        res('Tier-1 presence', `${tier1}/5`, T.good),
        res('Secondary depth', `${rest}`, T.good),
        doc('Gap quick-win', tier1 < 5 ? 'Claim Apple Maps + Bing Places + synced aggregator \u2014 they are the fast rankings wins.' : 'Tier-1 complete \u2014 add niche & chamber citations for category authority.'),
      ]
    },
  },
  {
    id: 'local-business-schema-generator',
    name: 'Local Business Schema Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds LocalBusiness JSON-LD with geo, hours, review and service fields so search engines can assemble your rich local result.',
    tip: 'Match the schema URL and NAP exactly to your page and GBP \u2014 mismatched schema is ignored, not forgiven.',
    usage: [
      'Fill in your business facts once.',
      'Copy the JSON-LD block into your pages <head>.',
      'Validate in the Rich Results Test after deploy.',
    ],
    method: [
      'All fields map to LocalBusiness schema properties.',
      'Geo coordinates, opening hours and reviews are optional but boost eligibility.',
      'The output is syntactically structured for direct copy-paste.',
    ],
    fields: [
      txt('bn8', 'Business name', 2, 'Riverside Law'),
      txt('addr8', 'Street address', 2, '240 Main St'),
      txt('city8', 'City & postal', 2, 'Austin, TX 78704'),
      sel('cat8', 'Primary category', ['LocalBusiness', 'Dentist', 'LegalService', 'Restaurant', 'HomeAndConstructionBusiness', 'Store', 'AutoRepair'], 'LocalBusiness'),
      txt('ph8', 'Phone', 2, '(512) 555-0142'),
      txt('hr8', 'Hours (e.g. Mon-Fri 09:00-17:00)', 2, 'Mo-Fr 09:00-17:00'),
      dt('op8', 'Opened date', '2014-01-01'),
    ],
    compute: (v) => {
      const raw = `{
  "@context": "https://schema.org",
  "@type": "${asStr(v.cat8) || 'LocalBusiness'}",
  "name": "${asStr(v.bn8)}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "${asStr(v.addr8)}",
    "addressLocality": "${asStr(v.city8)}"
  },
  "telephone": "${asStr(v.ph8)}",
  "openingHours": "${asStr(v.hr8)}",
  "foundingDate": "${asStr(v.op8) || ''}"
}`
      const ok = ['@context', '@type', 'name', 'address'].every((k) => raw.includes(k))
      return [
        res('Schema validity', ok ? 'Well-formed' : 'Check fields', ok ? T.good : T.warn),
        res('Type', asSel(v.cat8) || 'LocalBusiness', T.good),
        doc('LocalBusiness JSON-LD', raw),
      ]
    },
  },
  {
    id: 'google-review-response-generator',
    name: 'Google Review Response Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes a helpful public response to any Google review that protects your rating, thanks the customer and invites the next step.',
    tip: 'Reply to every 1-star review within 48 hours \u2014 reviewers who see a response revise their rating almost a third of the time.',
    usage: [
      'Paste the review sentiment and key detail.',
      'Choose the reply tone.',
      'Personalize the names before posting.',
    ],
    method: [
      'Positive replies echo the praise and add a forward signal.',
      'Critical replies apologize, correct without arguing, and move to private resolution.',
      'Every reply ends with a soft next-step to convert readers too.',
    ],
    fields: [
      sel('sent8', 'Rating & sentiment', ['5-star +', '4-star', '3-star neutral', '1-2 star'], '5-star +'),
      txt('det8', 'What the review mentions', 2, 'fast service and friendly staff'),
      txt('cust8', 'Customer first name', 1, 'Maria'),
      sel('tone8', 'Response tone', ['Warm', 'Professional', 'Apologetic'], 'Warm'),
    ],
    compute: (v) => {
      const sent = asSel(v.sent8)
      const det = asStr(v.det8) || 'your help'
      const name = asStr(v.cust8) || 'there'
      const line = sent === '5-star +' || sent === '4-star'
        ? `Thank you for the kind words about ${det}, ${name}! We genuinely appreciate you taking the time.`
        : sent === '3-star neutral'
        ? `Thanks for the honest feedback, ${name}. We are always improving and will act on the ${det} points.`
        : `We are sorry the experience with ${det} fell short, ${name}. Please email help@yourbusiness.com so we can make it right today.`
      return [
        res('Tone', asSel(v.tone8), T.good),
        res('Reply length', `${line.split(' ').length} words`, T.good, '20-50 words reads most authentic'),
        doc('Public response', line),
      ]
    },
  },
  {
    id: 'review-request-message-generator',
    name: 'Review Request Message Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Drafts a polite text-to-email review request that makes leaving a 5-star review the path of least resistance.',
    tip: 'Deliver the request at the moment of success (right after delivery) and link the exact review URL \u2014 friction kills reviews.',
    usage: [
      'Name the customer and the service delivered.',
      'Paste your review listing URL.',
      'Send it while your service is still memorable.',
    ],
    method: [
      'The opener celebrates their specific outcome.',
      'The ask is explicit but optional-sounding to feel non-pushy.',
      'One direct link and a time-window hint lift response rates.',
    ],
    fields: [
      txt('cust9', 'Customer name', 1, 'Carlos'),
      txt('job9', 'Service delivered', 2, 'a full bathroom remodel'),
      txt('url9', 'Review URL (Google/Yelp)', 3, 'https://g.page/yourbiz/review'),
      sel('send9', 'Send channel', ['Text', 'Email checkout', 'Post-delivery email'], 'Text'),
    ],
    compute: (v) => {
      const name = asStr(v.cust9) || 'your customer'
      const job = asStr(v.job9) || 'your project'
      const url = asStr(v.url9) || 'your review link'
      const raw = [
        `Hi ${name},`,
        `It was a pleasure completing ${job} for you!`,
        `If you have 30 seconds, a review helps small local businesses like ours more than you know.`,
        `Link: ${url}`,
        'Thanks again \u2014 hope to serve you soon.',
      ].join('\n')
      return [
        res('Channel', asSel(v.send9) || 'Text', T.good),
        res('Ask clarity', 'Explicit + easy link', T.good),
        doc('Review request', raw),
      ]
    },
  },
  {
    id: 'local-landing-page-generator',
    name: 'Local Landing Page Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Structures a geo-targeted landing page \u2014 H1, local intro, services, proof and map \u2014 that converts searchers from one city.',
    tip: 'Every city page needs a genuine local detail (street, neighborhood, event) or Google treats it as doorway spam.',
    usage: [
      'Enter the city and your service.',
      'Add one real local proof point.',
      'Rebuild the page outline for each geo variant.',
    ],
    method: [
      'The H1 and meta repeat the exact local query phrasing.',
      'Local proof and map blocks earn trust markers with search engines.',
      'One CTA per city keeps the intent narrow and conversion-focused.',
    ],
    fields: [
      txt('city10', 'City / area', 2, 'Round Rock'),
      txt('svc10', 'Service', 2, 'roof repair'),
      txt('proof10', 'Real local proof (street, event, landmark)', 2, 'serving Round Rock since the Dell Diamond opened'),
      txt('cta10', 'Primary CTA', 2, 'Book a free inspection'),
    ],
    compute: (v) => {
      const city = asStr(v.city10) || 'your city'
      const svc = asStr(v.svc10) || 'your service'
      const proof = asStr(v.proof10) || 'deep local experience'
      const cta = asStr(v.cta10) || 'Get a free quote'
      const raw = [
        `# ${svc} in ${city} \u2014 trusted & local`,
        `Meta: ${svc} in ${city} \u2014 ${proof.toLowerCase().slice(0, 60)}. Free quotes, fast service.`,
        '',
        '## Why locals pick us',
        `\u2022 ${proof}`,
        '\u2022 Same-week availability',
        '\u2022 Verified local reviews',
        '',
        '## Services we cover in ' + city,
        '\u2022 ' + svc,
        '',
        '## Map & visit us (embed)',
        `CTA: ${cta}`,
      ].join('\n')
      return [
        res('Geo relevance', 'High', T.good, 'H1 + meta match the local query'),
        res('Unique local marker', proof.slice(0, 48) + '...', T.good),
        doc('Landing page outline', raw),
      ]
    },
  },
  {
    id: 'service-area-page-generator',
    name: 'Service Area Page Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Drafts a service-area page that lists every suburb and region you cover with a scannable table, so per-area searches stay relevant.',
    tip: 'One page with a clean area table beats 15 thin doorways \u2014 keep distinct city pages only for cities with real content.',
    usage: [
      'List your service areas and distance range.',
      'Add your primary service.',
      'Publish the page and cross-link from home & GBP posts.',
    ],
    method: [
      'Area coverage is formatted as an accessible table for featured-snippet picking.',
      'Range in miles frames your realistic service boundary.',
      'The H1 targets the plural area modifier search pattern.',
    ],
    fields: [
      txt('svc11', 'Primary service', 2, 'pest control'),
      txt('areas11', 'Areas covered (comma separated)', 2, 'Austin, Round Rock, Cedar Park, Pflugerville'),
      n('mi11', 'Service radius (miles)', { def: 35, min: 1, max: 200 }),
    ],
    compute: (v) => {
      const svc = asStr(v.svc11) || 'your service'
      const areas = (asStr(v.areas11) || 'Your City').split(',').map((s) => s.trim()).filter(Boolean)
      const range = asNum(v.mi11)
      const rows = areas.map((a) => `| ${a} | Within ${range} mi | next-day |`).join('\n')
      const raw = [
        `# ${svc} service areas near you`,
        `We proudly provide ${svc} across a ${range}-mile radius.`,
        '',
        '| Area | Range | Response |',
        '|---| --- | --- |',
        rows,
        '',
        'Can\u2019t see your suburb? Contact us \u2014 we usually still cover it.',
      ].join('\n')
      return [
        res('Areas listed', `${areas.length}`, T.good),
        res('Radius', `${range} mi`),
        doc('Service area page', raw),
      ]
    },
  },
  {
    id: 'local-faq-generator',
    name: 'Local FAQ Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Produces questions real locals ask \u2014 pricing in your city, license checks, safety, scheduling \u2014 with ready short answers for a PAA play.',
    tip: 'Answer each FAQ in one or two sentences in an <h2 data-faq> block; that exact pairing is what gets you into People Also Ask.',
    usage: [
      'Tell it your service and city.',
      'Generate the local-flavored questions.',
      'Publish the answered FAQ block on your city page.',
    ],
    method: [
      'Question frames mirror Google\u2019s local query patterns.',
      'Every question includes a local or price signal that regionalizes it.',
      'Short answers are structured to match snippet-snappable formats.',
    ],
    fields: [
      txt('svc12', 'Service', 2, 'emergency locksmith'),
      txt('city12', 'City', 2, 'Charlotte'),
    ],
    compute: (v) => {
      const svc = asStr(v.svc12) || 'your service'
      const city = asStr(v.city12) || 'your city'
      const qas = [
        `How much does ${svc} cost in ${city}? \u2014 Most jobs run $120-350 depending on urgency and access.`,
        `Is ${city} ${svc} licensing required? \u2014 Check city permits; we are bonded, licensed and insured.`,
        `How fast can you arrive in ${city}? \u2014 Average arrival is under 35 minutes across the metro.`,
        `Do you serve all neighborhoods of ${city}? \u2014 Yes \u2014 from downtown to ${city} north end.`,
        `What should I do before calling? \u2014 Share your exact location and lock type to speed up the visit.`,
      ].join('\n')
      return [
        res('Local questions', '5', T.good),
        res('PAA readiness', 'High', T.good, 'Short answers in H2 data-blocks'),
        doc('FAQ block', qas),
      ]
    },
  },
]

function clamp8(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}
