import {
  asNum,
  asSel,
  fmtMoney,
  n,
  pctres,
  res,
  sel,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'Invoice Factoring & Working Capital Debt'

export const MOD19_SPECS: FintechSpec[] = [
  {
    id: 'invoice-factoring-effective-apr-sizer',
    name: 'Accounts Receivable Invoice Factoring & Effective APR Sizer',
    subject: SUBJECT,
    blurb: 'Calculate immediate advance cash, factor fees, reserve rebate payouts, and true annualized effective borrowing cost (APR) when factoring commercial B2B customer invoices.',
    tip: 'While a 2.5% invoice factor fee sounds modest, if the invoice is paid in 30 days, the annualized effective APR exceeds 30.4%, making factoring significantly more expensive than traditional bank credit lines.',
    usage: [
      'Enter total face value of commercial invoice ledger ($).',
      'Enter lender advance rate percentage (typically 80% to 90%).',
      'Enter factor fee discount percentage and expected invoice collection days.',
    ],
    method: [
      'Immediate Advance Cash = Invoice_Value * Advance_Rate %.',
      'Factor Fee ($) = Invoice_Value * Factor_Fee_Rate %.',
      'Reserve Rebate = Invoice_Value - Immediate_Advance - Factor_Fee.',
      'Effective Annualized APR = (Factor_Fee / Immediate_Advance) * (365 / Collection_Days) * 100.',
    ],
    fields: [
      n('invoiceFaceValueUsd', 'Invoice Face Value ($)', 250000, 5000, 10000000, 5000),
      n('advanceRatePct', 'Advance Rate (%)', 85.0, 50.0, 95.0, 1.0),
      n('factorFeePct', 'Factor Fee Rate (%)', 2.25, 0.5, 10.0, 0.25),
      n('collectionDays', 'Customer Days to Pay (Days)', 42, 10, 120, 1),
      sel('recourseType', 'Factoring Recourse Terms', [
        'Recourse Factoring (Borrower absorbs bad debt risk)',
        'Non-Recourse Factoring (Factor absorbs customer bankruptcy risk)',
      ]),
    ],
    compute: (v) => {
      const face = asNum(v, 'invoiceFaceValueUsd', 250000)
      const advRate = asNum(v, 'advanceRatePct', 85.0) / 100
      const feeRate = asNum(v, 'factorFeePct', 2.25) / 100
      const days = asNum(v, 'collectionDays', 42)
      const recourse = asSel(v, 'recourseType', 'Recourse')

      const immediateAdvance = face * advRate
      const factorFee = face * feeRate
      const reserveRebate = face - immediateAdvance - factorFee

      const effectiveApr = (factorFee / immediateAdvance) * (365 / days) * 100

      const isAprHigh = effectiveApr > 25.0
      const tone: 'good' | 'warn' | 'bad' = isAprHigh ? 'warn' : 'good'

      return [
        res('Immediate Upfront Cash Advance', fmtMoney(immediateAdvance), 'good', `${(advRate * 100).toFixed(0)}% available within 24 hours`),
        res('True Effective Annualized APR', `${effectiveApr.toFixed(1)}% APR`, tone, isAprHigh ? 'High cost of short-term liquidity' : 'Competitive working capital pricing'),
        res('Factor Fee Financing Cost', fmtMoney(factorFee), 'neutral', `${(feeRate * 100).toFixed(2)}% fee on gross invoice volume`),
        res('Reserve Rebate Returned', fmtMoney(reserveRebate), 'good', `Released upon customer settlement in ${days} days`),
        pctres('Immediate Liquidity Unlock', `${Math.round(advRate * 100)}% Accelerated Cash Flow`, Math.round(advRate * 100), 'good', recourse),
      ]
    },
  },
]
