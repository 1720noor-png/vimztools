import {
  asNum,
  fmtMoney,
  n,
  pctres,
  res,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'ARR / MRR Waterfall & Churn Dynamics'

export const MOD04_SPECS: FintechSpec[] = [
  {
    id: 'arr-waterfall-net-retention-nrr-sizer',
    name: 'ARR Waterfall, Net Retention (NRR) & Churn Decomposition Sizer',
    subject: SUBJECT,
    blurb: 'Decompose Annual Recurring Revenue (ARR) across Beginning ARR, New Bookings, Expansion ARR, Contraction ARR, and Churned ARR to calculate Net Retention Rate (NRR) and Gross Retention Rate (GRR).',
    tip: 'Best-in-class enterprise SaaS companies achieve Net Retention Rates (NRR) of 120% to 135%, meaning revenue grows exponentially each year even without adding new customers.',
    usage: [
      'Enter Beginning Period ARR in USD.',
      'Enter New Logo Bookings and Expansion upsells ARR.',
      'Enter Contraction down-sells and Churned ARR cancellations.',
    ],
    method: [
      'Ending ARR = Beginning_ARR + New_ARR + Expansion_ARR - Contraction_ARR - Churned_ARR.',
      'Net Retention Rate (NRR) = (Beginning_ARR + Expansion_ARR - Contraction_ARR - Churned_ARR) / Beginning_ARR.',
      'Gross Retention Rate (GRR) = (Beginning_ARR - Contraction_ARR - Churned_ARR) / Beginning_ARR.',
    ],
    fields: [
      n('beginningArrUsd', 'Beginning Period ARR ($)', 5000000, 100000, 1000000000, 100000),
      n('newBookingsArrUsd', 'New Logo Bookings ARR ($)', 1200000, 0, 500000000, 50000),
      n('expansionArrUsd', 'Expansion / Upsell ARR ($)', 850000, 0, 500000000, 25000),
      n('contractionArrUsd', 'Contraction / Downgrade ARR ($)', 150000, 0, 100000000, 10000),
      n('churnedArrUsd', 'Churned / Cancelled ARR ($)', 250000, 0, 100000000, 10000),
    ],
    compute: (v) => {
      const beg = asNum(v, 'beginningArrUsd', 5000000)
      const newBook = asNum(v, 'newBookingsArrUsd', 1200000)
      const exp = asNum(v, 'expansionArrUsd', 850000)
      const cont = asNum(v, 'contractionArrUsd', 150000)
      const churn = asNum(v, 'churnedArrUsd', 250000)

      const endingArr = beg + newBook + exp - cont - churn
      const netArrDelta = endingArr - beg
      const netGrowthPct = (netArrDelta / beg) * 100

      const nrr = ((beg + exp - cont - churn) / beg) * 100
      const grr = ((beg - cont - churn) / beg) * 100

      const isNrrElite = nrr >= 115
      const tone: 'good' | 'warn' | 'bad' = isNrrElite ? 'good' : nrr >= 100 ? 'good' : 'warn'

      return [
        res('Ending ARR Period Balance', fmtMoney(endingArr), 'good', `Net ARR expansion: +${fmtMoney(netArrDelta)} (${netGrowthPct.toFixed(1)}% YoY)`),
        pctres('Net Retention Rate (NRR)', `${nrr.toFixed(1)}% NRR`, Math.min(100, Math.round(nrr * 0.75)), tone, nrr >= 110 ? 'Compounding installed base expansion' : 'Cohort revenue shrinking over time'),
        pctres('Gross Retention Rate (GRR)', `${grr.toFixed(1)}% GRR`, Math.round(grr), grr >= 90 ? 'good' : 'warn', 'Excludes expansion; measures baseline customer durability'),
        res('Net New ARR Added', fmtMoney(newBook + exp - cont - churn), 'good', `New bookings ${fmtMoney(newBook)} + Upsells ${fmtMoney(exp)}`),
      ]
    },
  },
]
