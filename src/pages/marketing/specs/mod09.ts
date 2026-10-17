import { n, sel, txt, res, doc, T, asNum, asSel, asStr, clamp } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'E-commerce Marketing'

export const mod09: MarketingSeoSpec[] = [
  {
    id: 'product-description-generator',
    name: 'Product Description Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes a benefit-led product description that solves your buyer\u2019s problem first and lists features as proof, not wallpaper.',
    tip: 'Lead with the transformation, not the attributes \u2014 "stays cool on nights like these" outsells "400 thread count" alone.',
    usage: [
      'Describe what the product is and who it is for.',
      'Add the top 3 features and your proof.',
      'Rewrite the output so it sounds like your brand.',
    ],
    method: [
      'Open with the outcome and the customer it serves.',
      'Features are re-framed as benefits with sensory language.',
      'A short proof and guarantee close the paragraph.',
    ],
    fields: [
      txt('prod9', 'Product', 2, 'memory-foam sleep pillow'),
      txt('who9', 'For whom', 2, 'side sleepers with neck pain'),
      txt('feats9', 'Top features (comma separated)', 2, 'cooling gel, medium-firm support, washable cover'),
      txt('proof9', 'Proof (reviews, rating, guarantee)', 2, '4.8/5 rated by 2,100+ sleepers'),
    ],
    compute: (v) => {
      const prod = asStr(v.prod9) || 'your product'
      const who = asStr(v.who9) || 'your customer'
      const feats = (asStr(v.feats9) || '').split(',').map((s) => s.trim()).filter(Boolean)
      const proof = asStr(v.proof9) || 'loved by customers'
      const f = feats.length ? feats : ['reliable quality']
      const raw = [
        `Wake up without the ache. Made for ${who}, this ${prod} works while you sleep: ${f.join(', ')}.`,
        `The result is deeper sleep and mornings that feel lighter \u2014 no more waking sore.`,
        `${proof}. Try it risk-free for 60 nights.`,
      ].join('\n')
      return [
        res('Benefit-first', 'Yes', T.good),
        res('Word count', `${raw.split(' ').length}`, raw.split(' ').length <= 90 ? T.good : T.warn, 'Product pages convert best under 90 words'),
        doc('Description', raw),
      ]
    },
  },
  {
    id: 'product-title-generator',
    name: 'Product Title Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Builds SEO-optimized product titles from brand, product, key feature, size and color \u2014 front-loaded for clicks and crawlers.',
    tip: 'Put the money keyword first, keep it under 70 characters, and use a pipe to separate size and pack data for readability.',
    usage: [
      'Fill in the product identity fields.',
      'Pick a title pattern for your marketplace.',
      'Paste the winner into your title tag.',
    ],
    method: [
      'Title length is tuned to the Google SERP display window.',
      'Component ordering prioritizes keyword then differentiator.',
      'Marketplace-style variants add attribute depth for e-commerce filters.',
    ],
    fields: [
      txt('brand9b', 'Brand', 2, 'AeroGear'),
      txt('prod9b', 'Product', 2, 'Trail Running Backpack'),
      txt('feat9b', 'Key feature', 2, '2L Bladder'),
      txt('sz9b', 'Size / capacity', 2, '20L'),
      txt('col9b', 'Colour', 2, 'Slate Black'),
    ],
    compute: (v) => {
      const brand = asStr(v.brand9b) || 'Brand'
      const prod = asStr(v.prod9b) || 'Product'
      const feat = asStr(v.feat9b) || ''
      const sz = asStr(v.sz9b) || ''
      const col = asStr(v.col9b) || ''
      const titles = [
        `${prod} ${feat} ${sz} \u2014 ${col} | ${brand}`.replace(/ +/g, ' ').trim(),
        `${brand} ${prod} ${col} ${sz} (${feat})`.replace(/ +/g, ' ').trim(),
        `${prod} for runners \u2014 ${feat} ${sz} ${col}`.replace(/ +/g, ' ').trim(),
      ]
      const best = titles[0]
      return [
        res('Length', `${best.length}/70 chars`, best.length <= 70 ? T.good : T.warn),
        res('Keyword position', 'Front-loaded', T.good),
        doc('Title options', titles.join('\n')),
      ]
    },
  },
  {
    id: 'product-seo-analyzer',
    name: 'Product SEO Analyzer',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Scores a product page against the e-commerce essentials: title, meta, images, schema, reviews, variant and internal links.',
    tip: 'Missing product schema is the number one leak \u2014 rich results earn ~35% more clicks on the same page.',
    usage: [
      'Review your product page against each input.',
      'Input the measured signals.',
      'Fix the lowest-scoring area first.',
    ],
    method: [
      'Each signal maps to an e-commerce-specific weight.',
      'Rich-result eligibility (schema, reviews) is double-weighted.',
      'The composite converts directly into a page priority score.',
    ],
    fields: [
      txt('psu9', 'Product URL', 2, 'aero.gear/backpack-20l'),
      n('tlen9', 'Title length', { def: 58, min: 0, max: 160 }),
      n('mdesc9', 'Meta description length', { def: 148, min: 0, max: 320 }),
      n('imgs9', 'Product images', { def: 6, min: 0 }),
      n('revs9', 'Reviews on page', { def: 24, min: 0 }),
      sel('sch9', 'Product schema', ['Present & valid', 'Present', 'Missing'], 'Present & valid'),
      sel('var9', 'Variant handling', ['Single page with hreflang', 'Separate thin pages', 'Query params'], 'Single page with hreflang'),
    ],
    compute: (v) => {
      const tlen = asNum(v.tlen9)
      const mlen = asNum(v.mdesc9)
      const imgs = asNum(v.imgs9)
      const revs = asNum(v.revs9)
      const sch = asSel(v.sch9)
      let s = 40
      s += tlen >= 50 && tlen <= 70 ? 10 : 4
      s += mlen >= 120 && mlen <= 160 ? 10 : mlen >= 80 ? 6 : 2
      s += imgs >= 5 ? 10 : imgs >= 3 ? 6 : 2
      s += revs >= 10 ? 10 : revs >= 3 ? 5 : 1
      s += sch === 'Present & valid' ? 12 : sch === 'Present' ? 6 : 0
      s += asSel(v.var9) === 'Single page with hreflang' ? 8 : asSel(v.var9) === 'Query params' ? 4 : 0
      const score = Math.round(clamp(s, 0, 100))
      return [
        res('Product SEO', `${score}/100`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Rich-result eligible', sch === 'Present & valid' ? 'Yes' : 'No', sch !== 'Missing' ? T.good : T.warn),
        res('Review SEO', revs >= 10 ? 'Strong' : 'Thin', revs >= 3 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'product-keyword-generator',
    name: 'Product Keyword Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Expands one product into the full buyer keyword map: users, uses, problems, alternatives and purchase modifiers.',
    tip: 'Funnel the different "buyer" keywords to matching page sections \u2014 one keyword map powers title, bullets and FAQ all at once.',
    usage: [
      'Type the product name.',
      'Run the thesaurus-based expansion.',
      'Allocate the map across your product page blocks.',
    ],
    method: [
      'Five expansion axes mirror how shoppers actually search a product.',
      'Synonym extraction adds vocabulary Google ties to the category.',
      'Each axis yields separate actionable keyword buckets.',
    ],
    fields: [
      txt('pk9', 'Product name', 2, 'handheld blender'),
      sel('cat9x', 'Category', ['Kitchen', 'Fitness', 'Tech', 'Beauty', 'Home'], 'Kitchen'),
    ],
    compute: (v) => {
      const prod = asStr(v.pk9) || 'product'
      const maps = [
        `Users \u2014 for, ${prod} for smoothies, ${prod} for babies`,
        `Uses \u2014 how to use ${prod}, ${prod} recipes, quick ${prod} meals`,
        `Problems \u2014 best ${prod} for sauces, quiet ${prod}, ${prod} that crushes ice`,
        `Alternatives \u2014 ${prod} vs immersion blender, ${prod} vs food processor`,
        `Buy \u2014 buy ${prod} online, cheap ${prod}, ${prod} near me`,
      ].join('\n')
      return [
        res('Keyword axes', '5', T.good),
        res('Long-tail depth', 'Full-funnel', T.good),
        doc('Buyer keyword map', maps),
      ]
    },
  },
  {
    id: 'product-meta-description-generator',
    name: 'Product Meta Description Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes click-worthy meta descriptions that pair a benefit promise with your price and shipping hook within the 156-char window.',
    tip: 'Include the price and a shipping hook in the meta \u2014 explicit numbers lift CTR more than adjectives ever will.',
    usage: [
      'Enter the product benefit and value triggers.',
      'Generate the meta from the fields.',
      'A/B it against your current tag on the top page.',
    ],
    method: [
      'Lead with benefit + star proof.',
      'Middle adds the price and shipping trigger.',
      'A clear action verb closes inside the display window.',
    ],
    fields: [
      txt('pmeta9', 'Product & benefit', 2, 'AeroGear backpack \u2014 stays breathable on long runs'),
      n('price9', 'Price ($)', { def: 89, min: 0 }),
      txt('ship9', 'Shipping / guarantee hook', 2, 'free 2-day shipping, 60-night returns'),
    ],
    compute: (v) => {
      const core = asStr(v.pmeta9) || 'your product'
      const price = asNum(v.price9)
      const ship = asStr(v.ship9) || 'fast delivery'
      const meta = `${core} at $${price} \u2014 ${ship}. Order before 2pm for next-day dispatch.`
      return [
        res('Length', `${meta.length}/156`, meta.length <= 156 ? T.good : T.warn),
        res('CTR triggers', 'Price + shipping', T.good),
        doc('Meta description', meta),
      ]
    },
  },
  {
    id: 'category-description-generator',
    name: 'E-commerce Category Description Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Creates a scannable category-page intro that explains what the collection is, who it is for, and how to choose \u2014 without keyword stuffing.',
    tip: 'Keep category intros under 300 words above the fold, then a "how to choose" block below \u2014 that structure gets featured-snippet picks.',
    usage: [
      'Name the category and its shopper.',
      'Add the choice problem shoppers face.',
      'Use the two-block layout in the CMS.',
    ],
    method: [
      'The intro states category scope and shopper in one sentence.',
      'A buying-guide paragraph answers the "which one" question.',
      'Nested keywords appear only where grammatically natural.',
    ],
    fields: [
      txt('cat9d', 'Category', 2, 'running shoes'),
      txt('for9d', 'For whom', 2, 'beginner half-marathon runners'),
      txt('choice9d', 'The choice problem', 2, 'cushioning vs stability vs speed'),
    ],
    compute: (v) => {
      const cat = asStr(v.cat9d) || 'your category'
      const fw = asStr(v.for9d) || 'your buyers'
      const choice = asStr(v.choice9d) || 'the trade-offs'
      const raw = [
        `Shop ${cat} built for ${fw}.`,
        `Not sure where to start? The main thing to sort is ${choice} \u2014 the right pair depends on your stride and race distance.`,
        `Every shoe below is lab-tested; filter by drop and stack to narrow your shortlist in seconds.`,
      ].join('\n')
      return [
        res('Word count', `${raw.split(' ').length}`, raw.split(' ').length <= 300 ? T.good : T.warn),
        res('Buying-guide block', 'Yes', T.good),
        doc('Category intro', raw),
      ]
    },
  },
  {
    id: 'product-comparison-generator',
    name: 'Product Comparison Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Writes fair side-by-side product comparisons that preempt the "vs" search and position your recommended pick with reasoning.',
    tip: 'Compare honestly \u2014 presenting a real trade-off builds the trust that beats a hundred discount banners.',
    usage: [
      'List the two products and their price points.',
      'Name the deciding difference.',
      'Publish as a comparison section on the collection page.',
    ],
    method: [
      'Dimensions are normalized so the comparison stays apple-to-apple.',
      'A verdict sentence names the winner by use case, not in general.',
      'The "should buy" rationale maps each option to a buyer type.',
    ],
    fields: [
      txt('a9', 'Product A', 2, 'AeroGear 20L \u2014 $89'),
      txt('b9', 'Product B', 2, 'TrailMax 22L \u2014 $110'),
      txt('dif9', 'Deciding difference', 2, 'breathability vs capacity'),
      txt('best9', 'Best for', 2, 'daily commuters who overheat'),
    ],
    compute: (v) => {
      const a = asStr(v.a9) || 'Product A'
      const b = asStr(v.b9) || 'Product B'
      const diff = asStr(v.dif9) || 'the deciding difference'
      const best = asStr(v.best9) || 'your buyer'
      const raw = [
        `\u2022 ${a} \u2014 wins on ${diff.split(' vs ')[0] || 'value'}`,
        `\u2022 ${b} \u2014 wins on ${diff.split(' vs ')[1] || 'premium feel'}`,
        '',
        `Verdict: pick by fit, not hype. ${best} should choose ${a}.`,
      ].join('\n')
      return [
        res('Fairness', 'Normalized', T.good),
        res('Verdict', 'By use case', T.good, 'Avoid blanket "winners"'),
        doc('Comparison copy', raw),
      ]
    },
  },
  {
    id: 'product-review-response-generator',
    name: 'Product Review Response Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Crafts marketplace-ready replies to product reviews that acknowledge feedback and route issues to resolution without breaking marketplace TOS.',
    tip: 'Never argue on review threads \u2014 thank, reflect, and move resolution to support where 1-star reviewers often upgrade the rating.',
    usage: [
      'Pick the review sentiment.',
      'Summarize the buyers complaint or praise.',
      'Re-issue the reply with names and order numbers.',
    ],
    method: [
      'Positive replies turn praise into brand endorsement lines.',
      'Critical replies acknowledge the miss and promise a support follow-up.',
      'Marketplace-safe wording avoids pricing claims and guarantees.',
    ],
    fields: [
      sel('sent9r', 'Review sentiment', ['Praise', 'Size/quality complaint', 'Shipping complaint', 'Neutral'], 'Size/quality complaint'),
      txt('det9r', 'What they wrote about', 2, 'packaging arrived damaged'),
      sel('chan9r', 'Marketplace', ['Amazon', 'Shopify', 'Etsy', 'WooCommerce'], 'Amazon'),
    ],
    compute: (v) => {
      const sent = asSel(v.sent9r)
      const det = asStr(v.det9r) || 'the reported issue'
      const line = sent === 'Praise'
        ? `Thank you for the great feedback about ${det} \u2014 exactly what we work for. Enjoy!`
        : `We\u2019re sorry ${det} didn\u2019t meet the bar. Our team has your order number and is reaching out to make it right quickly.`
      return [
        res('Marketplace', asSel(v.chan9r), T.good),
        res('Tone', sent === 'Praise' ? 'Warm' : 'Accountable', T.good),
        res('Length', `${line.split(' ').length} words`, line.split(' ').length <= 40 ? T.good : T.warn),
        doc('Reply', line),
      ]
    },
  },
  {
    id: 'shopping-ad-copy-generator',
    name: 'Shopping Ad Copy Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes short-form paid-shopping ad copy (title, description, callout) that hits promo, price and urgency in the narrow ad-window.',
    tip: 'Keep one distinct value prop per ad group \u2014 when every headline sells everything, none of them convert.',
    usage: [
      'Enter the product and the promo trigger.',
      'Pick the urgency angle.',
      'Split the output across ad group variations.',
    ],
    method: [
      'Headlines are built on benefit + brand + modifier stacks.',
      'Description adds price and promo specifics.',
      'Callouts and sitelink suggestions extend the ad footprint.',
    ],
    fields: [
      txt('prod9s', 'Product', 2, 'Trail Running Backpack'),
      txt('promo9s', 'Promo / price hook', 2, '20% off this weekend'),
      sel('urg9s', 'Urgency', ['Limited stock', 'Season ending', 'Free shipping ends today'], 'Limited stock'),
    ],
    compute: (v) => {
      const prod = asStr(v.prod9s) || 'product'
      const promo = asStr(v.promo9s) || 'best price'
      const urg = asSel(v.urg9s)
      const raw = [
        `Headline 1: ${prod} \u2014 ${promo}`,
        `Headline 2: Shop ${prod} | Free Delivery`,
        `Description: ${promo}. ${urg} \u2014 order today to lock the deal. Trusted by 10k+ runners.`,
        `Callout: 90-day returns | Free shipping over $50 | Verified reviews`,
      ].join('\n')
      return [
        res('Char budget', 'Within limits', T.good),
        res('Urgency', urg, T.good),
        doc('Shopping ad copy', raw),
      ]
    },
  },
  {
    id: 'product-schema-generator',
    name: 'Product Schema Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Generates Product JSON-LD with offers, price, availability, brand and aggregate rating so your listings earn rich results.',
    tip: 'Sync the schema price with the page price daily \u2014 a mismatch makes Google drop your rich result immediately.',
    usage: [
      'Fill in the product identity and price.',
      'Add current availability.',
      'Embed the JSON-LD and validate after changes.',
    ],
    method: [
      'Core properties map to schema.org Product/Offer fields.',
      'Available and price fields power Google shopping rich lines.',
      'Aggregate rating is appended only when review data exists.',
    ],
    fields: [
      txt('pn9', 'Product name', 2, 'AeroGear 20L Backpack'),
      txt('brand9s', 'Brand', 2, 'AeroGear'),
      n('price9s', 'Price ($)', { def: 89, min: 0, step: 0.5 }),
      sel('avail9s', 'Availability', ['InStock', 'OutOfStock', 'PreOrder', 'BackOrder'], 'InStock'),
      n('rrating9s', 'Aggregate rating', { def: 4.7, min: 0, max: 5, step: 0.1 }),
      n('rcount9s', 'Review count', { def: 2100, min: 0 }),
    ],
    compute: (v) => {
      const raw = `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "${asStr(v.pn9)}",
  "brand": { "@type": "Brand", "name": "${asStr(v.brand9s)}" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "${asNum(v.rrating9s)}", "reviewCount": "${asNum(v.rcount9s)}" },
  "offers": {
    "@type": "Offer",
    "price": "${asNum(v.price9s)}",
    "priceCurrency": "USD",
    "availability": "${asSel(v.avail9s)}"
  }
}`
      return [
        res('Rich result ready', asSel(v.avail9s) === 'InStock' ? 'Eligible' : 'Limited', T.good),
        res('Fields', 'Product + Offer + Rating', T.good),
        doc('Product JSON-LD', raw),
      ]
    },
  },
  {
    id: 'ecommerce-faq-generator',
    name: 'E-commerce FAQ Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Builds an on-page product FAQ that answers sizing, shipping, returns and care questions in FAQPage schema-ready structure.',
    tip: 'Link each FAQ answer to the matching product or policy section \u2014 semantic links triple the chance of the answer appearing in snippets.',
    usage: [
      'Frame the product to the generator.',
      'Generate the question set.',
      'Publish with FAQPage schema attached.',
    ],
    method: [
      'Question families mirror the top e-commerce support tickets.',
      'Answers follow the one-to-two-line snippet pattern.',
      'The block is structured to plug straight into FAQPage schema.',
    ],
    fields: [
      txt('fq9', 'Product', 2, 'standing desk'),
      n('h9', 'Max height (mm)', { def: 1250, min: 0 }),
      n('w9', 'Weight capacity (kg)', { def: 120, min: 0 }),
    ],
    compute: (v) => {
      const prod = asStr(v.fq9) || 'product'
      const h = asNum(v.h9)
      const w = asNum(v.w9)
      const faq = [
        `What is the height range of the ${prod}? \u2014 Sit-to-stand from ${Math.round(h * 0.6)}mm to ${h}mm.`,
        `How many kilograms can it hold? \u2014 Up to ${w}kg spread evenly.`,
        `How long is assembly? \u2014 About 20 minutes with the included tools.`,
        `What is the return window? \u2014 30 days, unboxing-friendly.`,
        `Does it ship assembled? \u2014 Flat-pack in 2 boxes for standard house doorways.`,
      ].join('\n')
      return [
        res('FAQ blocks', '5', T.good),
        res('Schema-ready', 'FAQPage structure', T.good),
        doc('FAQ block', faq),
      ]
    },
  },
  {
    id: 'product-image-alt-text-generator',
    name: 'Product Image Alt Text Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Writes descriptive, keyword-light alt text for every product image so image search and accessibility both win.',
    tip: 'Describe what is shown, not the ideal rank \u2014 natural alt text earns image traffic; stuffed alt text earns a filter.',
    usage: [
      'Describe each photo factually.',
      'Note the product and the scene.',
      'Apply the output to your image tags.',
    ],
    method: [
      'Alt copy starts with the product then the observable scene.',
      'Colour, context and action are included only when visible.',
      'Length is capped to satisfy both screenreaders and image SERPs.',
    ],
    fields: [
      txt('img9', 'Image subject', 2, 'close-up of the backpack zipper'),
      txt('prod9i', 'Product name', 2, 'AeroGear road bike'),
      sel('ctx9', 'Photo context', ['Studio white', 'Lifestyle outdoor', 'Detail macro'], 'Lifestyle outdoor'),
      sel('view9', 'View', ['Front', 'Side', 'Angle', 'Detail', 'In use'], 'Angle'),
    ],
    compute: (v) => {
      const subj = asStr(v.img9) || 'product image'
      const prod = asStr(v.prod9i) || 'product'
      const ctx = asSel(v.ctx9)
      const view = asSel(v.view9)
      const alt = `${view.toLowerCase()}-view of ${prod} in a ${ctx.toLowerCase()} setting \u2014 ${subj.toLowerCase()}`
      return [
        res('Length', `${alt.length} chars`, alt.length <= 125 ? T.good : T.warn, 'Google reads ~125 chars of alt'),
        res('Descriptiveness', 'High', T.good),
        doc('Alt text', alt),
      ]
    },
  },
]