import {
  asNum,
  n,
  pctres,
  res,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'Credit Risk & Default Probability'

export const MOD10_SPECS: FintechSpec[] = [
  {
    id: 'altman-z-score-bankruptcy-credit-sizer',
    name: 'Altman Z-Score Corporate Bankruptcy & Distress Predictor',
    subject: SUBJECT,
    blurb: 'Calculate the multi-factor Altman Z-Score across working capital, retained earnings, EBIT, market equity, and sales turnover to classify corporate insolvency risk into Safe, Grey, or Distress zones.',
    tip: 'An Altman Z-Score below 1.81 indicates severe financial distress with a statistically elevated probability of filing for Chapter 11 bankruptcy within 24 months.',
    usage: [
      'Enter Total Assets and Total Liabilities in USD.',
      'Enter Working Capital (Current Assets minus Current Liabilities).',
      'Enter Retained Earnings, EBIT, and Market Value of Equity.',
    ],
    method: [
      'X1 = Working Capital / Total Assets.',
      'X2 = Retained Earnings / Total Assets.',
      'X3 = EBIT / Total Assets.',
      'X4 = Market Value of Equity / Total Liabilities.',
      'X5 = Sales / Total Assets.',
      'Z = 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 0.999*X5.',
    ],
    fields: [
      n('totalAssetsUsd', 'Total Company Assets ($)', 50000000, 100000, 10000000000, 1000000),
      n('totalLiabilitiesUsd', 'Total Liabilities ($)', 32000000, 100000, 10000000000, 1000000),
      n('workingCapitalUsd', 'Working Capital ($)', 8000000, -1000000000, 1000000000, 500000),
      n('retainedEarningsUsd', 'Retained Earnings Balance ($)', 6500000, -1000000000, 1000000000, 500000),
      n('ebitUsd', 'Operating Earnings EBIT ($)', 5500000, -500000000, 1000000000, 250000),
      n('marketEquityUsd', 'Market Value of Equity ($)', 38000000, 100000, 20000000000, 1000000),
      n('annualSalesUsd', 'Annual Net Sales Revenue ($)', 45000000, 100000, 10000000000, 1000000),
    ],
    compute: (v) => {
      const ta = asNum(v, 'totalAssetsUsd', 50000000)
      const tl = asNum(v, 'totalLiabilitiesUsd', 32000000)
      const wc = asNum(v, 'workingCapitalUsd', 8000000)
      const re = asNum(v, 'retainedEarningsUsd', 6500000)
      const ebit = asNum(v, 'ebitUsd', 5500000)
      const mve = asNum(v, 'marketEquityUsd', 38000000)
      const sales = asNum(v, 'annualSalesUsd', 45000000)

      const x1 = wc / ta
      const x2 = re / ta
      const x3 = ebit / ta
      const x4 = mve / tl
      const x5 = sales / ta

      const zScore = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 0.999 * x5

      let zone = 'Safe Zone (Low Default Probability)'
      let tone: 'good' | 'warn' | 'bad' = 'good'
      let impliedRating = 'Investment Grade (A / BBB)'

      if (zScore < 1.81) {
        zone = 'Distress Zone (High Insolvent / Bankruptcy Probability)'
        tone = 'bad'
        impliedRating = 'Speculative / High Yield (CCC / D)'
      } else if (zScore <= 2.99) {
        zone = 'Grey Zone (Elevated Financial Vulnerability)'
        tone = 'warn'
        impliedRating = 'Moderate Risk (BB)'
      }

      const scorePct = Math.min(100, Math.max(0, Math.round((zScore / 4.0) * 100)))

      return [
        res('Calculated Altman Z-Score', `${zScore.toFixed(2)}`, tone, zone),
        res('Credit Risk Rating Equivalent', impliedRating, tone, 'Statistical proxy for bond agency ratings'),
        res('EBIT / Assets Productivity (X3)', `${(x3 * 100).toFixed(1)}% ROA`, x3 >= 0.10 ? 'good' : 'warn', 'Strongest weighted factor in Altman formulation (3.3x)'),
        res('Equity-to-Debt Cushion (X4)', `${x4.toFixed(2)}x Coverage`, x4 >= 1.0 ? 'good' : 'warn', 'Market equity buffer over total liabilities'),
        pctres('Financial Solvency Health Index', `${scorePct}% Health Score`, scorePct, tone),
      ]
    },
  },
]
