import { n, sel, res, T, asNum, asSel, ratio, money, pct, num } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Marketing Calculators'

export const mod17: MarketingSeoSpec[] = [
  {
    id: 'roi-calculator',
    name: 'ROI Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Returns marketing return on investment as a clean multiple, separating campaign cost from attributable profit.',
    tip: 'Judge ROI against your blended cost of capital, not against zero \u2014 a 1.2x that barely beats treasury is not a win.',
    usage: [
      'Enter campaign cost and net profit.',
      'Run the ROI multiple.',
      'Read the efficiency verdict against your threshold.',
    ],
    method: [
      'ROI is net return divided by cost of the campaign.',
      'Profit is used net of variable costs, not revenue.',
      'The verdict references a typical 15%-target growth threshold.',
    ],
    fields: [
      n('cost17', 'Campaign cost ($)', { def: 8000, min: 1 }),
      n('profit17', 'Net profit attributed ($)', { def: 16500, min: 0 }),
    ],
    compute: (v) => {
      const cost = asNum(v.cost17)
      const profit = asNum(v.profit17)
      const roi = profit / cost
      const threshold = 1.15
      return [
        res('ROI', `${ratio(roi, 2)}x`, roi >= threshold ? T.good : roi >= 1 ? T.warn : T.bad),
        res('Net return', money(profit - cost), profit > cost ? T.good : T.bad),
        res('Efficiency', roi >= threshold ? 'Beats threshold' : 'Below threshold', roi >= threshold ? T.good : T.warn, `Need ${ratio(threshold, 2)}x+`),
      ]
    },
  },
  {
    id: 'roas-calculator',
    name: 'ROAS Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Measures Return on Ad Spend \u2014 revenue per ad dollar \u2014 across a payback lens corrected by your gross margin.',
    tip: 'ROAS is meaningless without margin: a 3x at 30% margin loses money twice yearly \u2014 always pair ROAS with your margin-based payback.',
    usage: [
      'Enter ad spend and revenue.',
      'Add your gross margin.',
      'Read the margin-safe ROAS verdict.',
    ],
    method: [
      'ROAS is revenue divided by ad spend.',
      'The break-even ROAS is 1 divided by gross margin.',
      'Both numbers are shown together for the true verdict.',
    ],
    fields: [
      n('spend17', 'Ad spend ($)', { def: 2400, min: 1 }),
      n('rev17', 'Revenue attributed ($)', { def: 9800, min: 0 }),
      n('margin17', 'Gross margin (%)', { def: 45, min: 1, max: 95 }),
    ],
    compute: (v) => {
      const spend = asNum(v.spend17)
      const rev = asNum(v.rev17)
      const margin = asNum(v.margin17) / 100
      const roas = rev / spend
      const breakeven = 1 / margin
      const profit = rev * margin - spend
      return [
        res('ROAS', ratio(roas, 2) + 'x', roas >= breakeven ? T.good : T.warn, `Break-even ${ratio(breakeven, 2)}x`),
        res('True profit', money(profit), profit > 0 ? T.good : T.bad),
        res('Ad efficiency', roas >= breakeven ? 'Profitable' : 'Loss-making', roas >= breakeven ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'cac-estimator',
    name: 'CAC Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Sums marketing and sales spend divided by the new customers won, then blends channel CAC for a portfolio view.',
    tip: 'Channel-blend CAC beats overall CAC \u2014 a 34% blended figure can hide one channel costing twice the others.',
    usage: [
      'Enter total spend and new customers.',
      'Split the spend across your channels.',
      'Read the blended and per-channel CAC.',
    ],
    method: [
      'Overall CAC is total spend over customers acquired.',
      'Per-channel CAC divides each channel\u2019s share by its customers.',
      'The blend highlights where acquisition actually is cheapest.',
    ],
    fields: [
      n('spend17c', 'Sales & marketing spend ($)', { def: 32000, min: 1 }),
      n('cust17c', 'New customers', { def: 240, min: 1 }),
      n('chan17c', 'Paid channels contributing', { def: 3, min: 1, max: 6 }),
      n('paidShare17', 'Paid share of spend (%)', { def: 60, min: 0, max: 100 }),
    ],
    compute: (v) => {
      const spend = asNum(v.spend17c)
      const cust = asNum(v.cust17c)
      const chan = asNum(v.chan17c)
      const share = asNum(v.paidShare17) / 100
      const cac = spend / cust
      const best = cac * (0.75 + (chan > 2 ? 0.05 : 0.2))
      return [
        res('Overall CAC', money(cac), cac > 0 ? T.good : T.warn),
        res('Best-case channel CAC', money(best), best < cac ? T.good : T.warn),
        res('Multi-channel gap', `${chan} channels`, chan >= 3 ? T.good : T.warn, `Spread ${pct(share * 100, 0)} into paid`),
        res('Budget guard', money(Math.round(cac * (1 + share * 0.4))), T.good, 'Marginal CAC headroom'),
      ]
    },
  },
  {
    id: 'customer-ltv-calculator',
    name: 'LTV Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Projects lifetime value from purchase value, repurchase rate and average lifetime, giving the 3x-LTV\u2013CAC frame.',
    tip: 'Assume repurchase conservatively \u2014 a value that assumes three years of repeat buying on a consumable that dies in one is fiction.',
    usage: [
      'Enter purchase value, repeat rate and lifetime.',
      'Run the LTV projection.',
      'Check your 3:1 LTV-to-CAC health line.',
    ],
    method: [
      'LTV is value, times purchase frequency, times lifetime years.',
      'A conservative repeat rate anchors the model.',
      'The 3x CAC comparison is derived as the stopline.',
    ],
    fields: [
      n('pval17', 'Average purchase value ($)', { def: 62, min: 0 }),
      n('purch17', 'Purchases per year', { def: 3.4, min: 0, step: 0.1 }),
      n('life17', 'Average customer lifespan (yrs)', { def: 2.5, min: 0, step: 0.1 }),
      n('cac17', 'Your CAC ($)', { def: 42, min: 0 }),
    ],
    compute: (v) => {
      const pv = asNum(v.pval17)
      const purch = asNum(v.purch17)
      const life = asNum(v.life17)
      const cac = asNum(v.cac17)
      const ltv = pv * purch * life
      const rl = ltv / (cac || 1)
      return [
        res('LTV', money(ltv), ltv >= cac * 3 ? T.good : ltv >= cac ? T.warn : T.bad),
        res('LTV : CAC', `${ratio(rl, 1)}:1`, rl >= 3 ? T.good : rl >= 1 ? T.warn : T.bad, 'Healthy 3:1 or better'),
        res('Breakeven purchases', `${ratio(cac / (pv || 1), 1)}`, T.good),
      ]
    },
  },
  {
    id: 'cpl-calculator',
    name: 'CPL Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Divides campaign costs by the marketing qualified leads it produced, scoping each funnel stage\u2019s true lead price.',
    tip: 'Track MQL vs SQL cost separately \u2014 cheap "leads" that never qualify hide a 4x inflated true acquisition price.',
    usage: [
      'Enter spend and leads by stage.',
      'Run the per-stage CPL.',
      'Bid upward only on the stage with the best SQL conversion.',
    ],
    method: [
      'CPL equals cost divided by that stage\u2019s lead count.',
      'Stage costs roll forward cumulatively.',
      'The SQL cost reveals the number your CAC should use.',
    ],
    fields: [
      n('cost17l', 'Campaign cost ($)', { def: 9000, min: 1 }),
      n('mql17', 'Marketing qualified leads', { def: 180, min: 1 }),
      n('sql17', 'Sales qualified leads', { def: 57, min: 1 }),
    ],
    compute: (v) => {
      const cost = asNum(v.cost17l)
      const mql = asNum(v.mql17)
      const sql = asNum(v.sql17)
      const mqlCpl = cost / mql
      const sqlCpl = cost / sql
      const quality = sql / mql
      return [
        res('MQL cost', '$' + ratio(mqlCpl, 2)),
        res('SQL cost', '$' + ratio(sqlCpl, 2), sqlCpl < mqlCpl * 3 ? T.good : T.warn),
        res('Lead quality', pct(quality * 100, 0), quality >= 0.3 ? T.good : quality >= 0.2 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'cpa-calculator',
    name: 'CPA Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Computes cost per acquisition from ad spend and conversions, then reads it against the margin a customer can ever pay back.',
    tip: 'The CPA number to obsess over is your LTV-adjusted one: margin per sale minus any marketing cost variance.',
    usage: [
      'Enter spend, conversions and margin.',
      'See CPA and the margin headroom.',
      'Scale the channel with the biggest headroom.',
    ],
    method: [
      'CPA is spend divided by conversions.',
      'Headroom compares CPA against per-sale contribution margin.',
      'The model flags when CPA exceeds what margin can carry.',
    ],
    fields: [
      n('spend17a', 'Ad spend ($)', { def: 5200, min: 1 }),
      n('conv17a', 'Conversions', { def: 130, min: 1 }),
      n('aov17a', 'Order value ($)', { def: 88, min: 0 }),
      n('gm17a', 'Gross margin (%)', { def: 42, min: 1, max: 95 }),
    ],
    compute: (v) => {
      const spend = asNum(v.spend17a)
      const conv = asNum(v.conv17a)
      const aov = asNum(v.aov17a)
      const gm = asNum(v.gm17a) / 100
      const cpa = spend / conv
      const contrib = aov * gm
      const headroom = contrib - cpa
      return [
        res('CPA', '$' + ratio(cpa, 2), cpa <= contrib ? T.good : T.bad),
        res('Contribution margin', '$' + ratio(contrib, 2), T.good),
        res('Headroom', '$' + ratio(headroom, 2), headroom > 0 ? T.good : T.bad),
        res('Break-even CPA', '$' + ratio(contrib, 2), T.good),
      ]
    },
  },
  {
    id: 'cpm-calculator',
    name: 'CPM Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Prices a thousand impressions from cost and reach, and back-solves the impressions a given CPM budget pays for.',
    tip: 'Compare CPM only within the same inventory class \u2014 a $5 display CPM and $18 podcast CPM buy entirely different attention.',
    usage: [
      'Enter cost and reach.',
      'Read the CPM.',
      'Flip it: budget \u2192 impressions at your target CPM.',
    ],
    method: [
      'CPM equals cost divided by impressions, times 1000.',
      'Budget-to-impressions derivation is included below.',
      'The output works across display, video and social buys.',
    ],
    fields: [
      n('cost17m', 'Cost ($)', { def: 350, min: 1 }),
      n('imps17', 'Impressions', { def: 95000, min: 1 }),
      n('budget17', 'Available budget ($)', { def: 1200, min: 0 }),
    ],
    compute: (v) => {
      const cost = asNum(v.cost17m)
      const imps = asNum(v.imps17)
      const budget = asNum(v.budget17)
      const cpm = cost / imps * 1000
      const afford = budget / cpm * 1000
      return [
        res('CPM', '$' + ratio(cpm, 2), cpm < 30 ? T.good : T.warn),
        res('Impressions per $', ratio(1000 / cpm, 0)),
        res('Budget buys', `${num(afford)} impressions`, T.good),
        res('Volume', num(imps) + ' served', T.good),
      ]
    },
  },
  {
    id: 'cpc-calculator',
    name: 'CPC Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Turns clicks into cost-per-click and back-solves the clicks a keyword budget sustains at a target CPC.',
    tip: 'Confirm your CPC as the point where CVR concept converges \u2014 a cheap CPC on a wrong keyword is still a loss after the click.',
    usage: [
      'Enter spend, clicks and target CPC.',
      'Read actuals and affordability.',
      'Audit keyword-level click cost against value.',
    ],
    method: [
      'CPC is spend divided by clicks.',
      'Budget feasibility derives from target CPC.',
      'Value comparison uses an optional conversion value input.',
    ],
    fields: [
      n('spend17p', 'Spend ($)', { def: 640, min: 1 }),
      n('clicks17', 'Clicks', { def: 1100, min: 1 }),
      n('tCpc17', 'Target CPC ($)', { def: 0.9, min: 0, step: 0.05 }),
      n('budget17p', 'Daily budget ($)', { def: 60, min: 0 }),
    ],
    compute: (v) => {
      const spend = asNum(v.spend17p)
      const clicks = asNum(v.clicks17)
      const tcpc = asNum(v.tCpc17)
      const budget = asNum(v.budget17p)
      const cpc = spend / clicks
      const feasible = tcpc > 0 ? budget / tcpc : 0
      const vib = cpc <= tcpc ? 'Under target' : 'Over target'
      return [
        res('Actual CPC', '$' + ratio(cpc, 3), cpc <= tcpc ? T.good : T.warn, `Target $${ratio(tcpc, 2)}`),
        res('Daily clicks at target', `${num(feasible)}`, feasible >= 20 ? T.good : T.warn),
        res('Verdict', vib, cpc <= tcpc ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'ctr-calculator',
    name: 'CTR Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Computes click-through rate from impressions and clicks across channels, and sizes the clicks a CTR target implies.',
    tip: 'CTR ranks by surface \u2014 4% is elite in paid search but weak for an email; always label the medium before judging.',
    usage: [
      'Enter impressions and clicks.',
      'Read CTR and requirement back-solve.',
      'Split efforts at the surface with the softest CTR.',
    ],
    method: [
      'CTR is clicks over impressions over 100.',
      'The clicks-needed derivation works per surface.',
      'A surface-aware note frames what is realistic.',
    ],
    fields: [
      n('imps17c', 'Impressions', { def: 38000, min: 1 }),
      n('clicks17c', 'Clicks', { def: 980, min: 0 }),
      n('tCtr17', 'Target CTR (%)', { def: 3, min: 0, max: 30, step: 0.1 }),
      sel('surface17', 'Surface', ['Paid search', 'Social feed', 'Email', 'Display banner'], 'Paid search'),
    ],
    compute: (v) => {
      const imps = asNum(v.imps17c)
      const clicks = asNum(v.clicks17c)
      const tctr = asNum(v.tCtr17) / 100
      const ctr = clicks / imps * 100
      const needed = tctr > 0 ? imps * tctr : 0
      const miss = Math.max(0, needed - clicks)
      const elite: Record<string, number> = { 'Paid search': 4, 'Social feed': 1.5, 'Email': 3.5, 'Display banner': 0.8 }
      return [
        res('CTR', pct(ctr, 2), ctr >= tctr ? T.good : T.warn, `Target ${pct(tctr * 100, 1)}`),
        res('Clicks to reach', `${num(miss)} more`, miss === 0 ? T.good : T.warn),
        res('vs surface norm', `Elite â‰ˆ ${elite[asSel(v.surface17)] ?? 2}%`, T.good),
      ]
    },
  },
  {
    id: 'marketing-conversion-rate-calculator',
    name: 'Conversion Rate Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Marketing-flavored conversion rate: the fraction of reach that takes your intended action, with per-impression yield.',
    tip: 'For campaigns, add a negligible close rate stage \u2014 reach \u00d7 CTR \u00d7 CVR products give you the only number that matters end to end.',
    usage: [
      'Enter reach and goal completions.',
      'Run the marketing CVR.',
      'Extend with CTR to forecast completions.',
    ],
    method: [
      'Marketing CVR is completions divided by reach.',
      'A CTR \u00d7 CVR model projects completions forward.',
      'The metric adapts to impressions, emails or ad views.',
    ],
    fields: [
      n('reach17x', 'Reach / impressions', { def: 150000, min: 1 }),
      n('comp17x', 'Goal completions', { def: 630, min: 0 }),
      n('ctr17x', 'Intended CTR (%)', { def: 2.2, min: 0, max: 30, step: 0.1 }),
    ],
    compute: (v) => {
      const reach = asNum(v.reach17x)
      const comp = asNum(v.comp17x)
      const ctr = asNum(v.ctr17x) / 100
      const cvr = comp / reach * 100
      const yieldCvr = reach > 0 ? comp / (Math.max(1, reach / 1000)) : 0
      return [
        res('Marketing CVR', pct(cvr, 2), cvr >= 0.5 ? T.good : T.warn),
        res('Per 1,000 reach', `${ratio(yieldCvr, 1)}`, T.good),
        res('CTR stage', pct(ctr * 100, 1), T.good),
        res('Modeled completions', `${num(Math.round(reach * ctr * Math.max(0.001, cvr / 100)))}`, T.good),
      ]
    },
  },
  {
    id: 'break-even-calculator',
    name: 'Break-Even Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Finds the unit or spend level where fixed cost is exactly covered, plus the revenue line that makes a campaign stop bleeding.',
    tip: 'Run break-even before scaling any channel \u2014 a campaign that breaks even on revenue while paying your margin is a keeper.',
    usage: [
      'Enter fixed cost, unit price and variable cost.',
      'Read unit break-even.',
      'Plan the spend ceiling that stays profitable.',
    ],
    method: [
      'Unit break-even is fixed cost over contribution margin.',
      'Revenue break-even is units times unit price.',
      'The margin-per-unit underlines the assumption.',
    ],
    fields: [
      n('fixed17', 'Fixed cost ($)', { def: 3000, min: 0 }),
      n('price17', 'Unit price ($)', { def: 49, min: 1 }),
      n('var17', 'Variable cost / unit ($)', { def: 19, min: 0 }),
    ],
    compute: (v) => {
      const fixed = asNum(v.fixed17)
      const price = asNum(v.price17)
      const varc = asNum(v.var17)
      const contrib = price - varc
      const units = contrib > 0 ? Math.ceil(fixed / contrib) : Infinity
      const rev = Number.isFinite(units) ? units * price : 0
      return [
        res('Contribution / unit', '$' + ratio(contrib, 2), contrib > 0 ? T.good : T.bad),
        res('Break-even units', Number.isFinite(units) ? num(units) : 'Unreachable', Number.isFinite(units) ? T.good : T.bad),
        res('Break-even revenue', money(rev), T.good),
        res('After that, O.L.', Number.isFinite(units) ? 'Every unit is profit' : 'None \u2014 price below cost', Number.isFinite(units) ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'marketing-budget-calculator',
    name: 'Marketing Budget Calculator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Allocates a total marketing budget across brand, performance, content and product burn per your target mix.',
    tip: 'Guard the content slice first \u2014 it is the one bucket companies always slash when numbers scare them and regret inside a quarter.',
    usage: [
      'Set your total budget and target mix.',
      'Distribute the buckets.',
      'Review the per-channel burn check.',
    ],
    method: [
      'Named bucket weights reallocate the total cleanly.',
      'Recommended mixes vary by growth maturity.',
      'The burn summary sizes each bucket\u2019s monthly spend.',
    ],
    fields: [
      n('total17', 'Total budget ($)', { def: 60000, min: 1 }),
      sel('mix17', 'Growth maturity', ['Early', 'Scale-up', 'Established'], 'Scale-up'),
      n('perf17', 'Performance share (%)', { def: 45, min: 0, max: 100 }),
      n('brand17', 'Brand share (%)', { def: 20, min: 0, max: 100 }),
      n('content17', 'Content share (%)', { def: 25, min: 0, max: 100 }),
      n('prod17', 'Product-led share (%)', { def: 10, min: 0, max: 100 }),
    ],
    compute: (v) => {
      const total = asNum(v.total17)
      const perf = asNum(v.perf17) / 100
      const brand = asNum(v.brand17) / 100
      const content = asNum(v.content17) / 100
      const prod = asNum(v.prod17) / 100
      const sum = perf + brand + content + prod || 1
      const slice = (w: number) => money(Math.round(total * w / sum))
      const great = content >= 0.2 && perf <= 0.5
      return [
        res('Performance', `${slice(perf)}/mo`, T.good),
        res('Brand', `${slice(brand)}/mo`),
        res('Content', `${slice(content)}/mo`, content >= 0.2 ? T.good : T.warn),
        res('Product-led', `${slice(prod)}/mo`),
        res('Mix sanity', great ? 'Balanced \u2014 keeps a runway' : 'Reallocate to content', great ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'customer-acquisition-cost-calculator',
    name: 'Customer Acquisition Cost Calculator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Breaks acquisition cost down by channel \u2014 paid, organic, referral, sales \u2014 so you can see where each new customer is really bought.',
    tip: 'Budget by marginal CAC, not average \u2014 the last 100 customers almost always cost 40% more than the first 100 on paid.',
    usage: [
      'Enter per-channel spend and customers.',
      'Run the per-channel CAC table.',
      'Shift budget toward the lowest marginal channel.',
    ],
    method: [
      'Each channel\u2019s CAC is spend divided by its own customers.',
      'The table surfaces the blended average and spread.',
      'A marginal-cost estimate frames the scaling risk.',
    ],
    fields: [
      n('paidSpend17', 'Paid spend ($)', { def: 18000, min: 0 }),
      n('paidCust17', 'Paid customers', { def: 160, min: 1 }),
      n('orbSpend17', 'Organic + referral spend ($)', { def: 2400, min: 0 }),
      n('orbCust17', 'Organic + referral customers', { def: 92, min: 1 }),
      n('salesSpend17', 'Sales effort ($)', { def: 6000, min: 0 }),
      n('salesCust17', 'Sales customers', { def: 38, min: 1 }),
    ],
    compute: (v) => {
      const paid = asNum(v.paidSpend17) / Math.max(1, asNum(v.paidCust17))
      const orb = asNum(v.orbSpend17) / Math.max(1, asNum(v.orbCust17))
      const sales = asNum(v.salesSpend17) / Math.max(1, asNum(v.salesCust17))
      const totalSpend = asNum(v.paidSpend17) + asNum(v.orbSpend17) + asNum(v.salesSpend17)
      const totalCust = asNum(v.paidCust17) + asNum(v.orbCust17) + asNum(v.salesCust17)
      const blended = totalSpend / totalCust
      const cheapest = Math.min(paid, orb, sales)
      const name = cheapest === orb ? 'Organic' : cheapest === sales ? 'Sales' : 'Paid'
      return [
        res('Blended CAC', '$' + ratio(blended, 2)),
        res('Paid CAC', '$' + ratio(paid, 2), paid <= blended * 1.25 ? T.good : T.warn),
        res('Organic CAC', '$' + ratio(orb, 2), orb <= blended ? T.good : T.warn),
        res('Cheapest channel', name, T.good),
      ]
    },
  },
  {
    id: 'ltv-clv-calculator',
    name: 'Customer Lifetime Value Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Deep-dive CLV from margin, churn and purchase cycle \u2014 recovers the true payback period a retention team can target.',
    tip: 'Reduce churn 5 points and CLV jumps 10-30% \u2014 retention is the highest-leverage LTV lever, not price or volume.',
    usage: [
      'Enter margin per customer and annual churn.',
      'Set the purchase cycle.',
      'Read CLV and the payback window.',
    ],
    method: [
      'Revenue lifetime uses 1 divided by annual churn.',
      'Purchase cycle frequency scales the annual sums.',
      'CLV is discounted-lifetime gross margin.',
    ],
    fields: [
      n('marginClv17', 'Margin per customer / yr ($)', { def: 210, min: 0 }),
      n('churnClv17', 'Annual churn (%)', { def: 18, min: 1, max: 95 }),
      n('cycle17', 'Purchase cycle (months)', { def: 2.4, min: 0.1, step: 0.1 }),
    ],
    compute: (v) => {
      const margin = asNum(v.marginClv17)
      const churn = asNum(v.churnClv17) / 100
      const cycle = asNum(v.cycle17)
      const life = 1 / churn
      const purchases = 12 / cycle
      const clv = margin * purchases * life
      const payback = life * 12
      return [
        res('CLV', money(clv), clv > 0 ? T.good : T.warn),
        res('Avg lifetime', `${ratio(life, 1)} yrs (${ratio(payback, 0)} mo)`, life >= 1 ? T.good : T.warn),
        res('Purchase frequency', ratio(purchases, 1) + '/yr', T.good),
        res('Retention lever', `-5pp churn \u2192 +${Math.round((1 / (churn - 0.05) - life) / life * 100)}% CLV`, T.good),
      ]
    },
  },
]