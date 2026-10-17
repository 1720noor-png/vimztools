import {
  asNum,
  asSel,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'Cap Table & Equity Dilution'

export const MOD02_SPECS: FintechSpec[] = [
  {
    id: 'priced-equity-round-dilution-sizer',
    name: 'Priced Equity Round (Series A/B) Cap Table & Option Pool Sizer',
    subject: SUBJECT,
    blurb: 'Model post-money valuation, investor share issuance, price per share, and unallocated option pool shuffle dilution across institutional priced equity financing rounds.',
    tip: 'Venture funds often mandate a 10-15% unallocated option pool created on a pre-money basis, which concentrates dilution exclusively on existing founders rather than new investors.',
    usage: [
      'Enter pre-money valuation ($).',
      'Enter new round capital investment ($).',
      'Enter existing pre-round fully diluted shares outstanding.',
    ],
    method: [
      'Post-Money Valuation = Pre-Money Valuation + New_Investment.',
      'New Investor Ownership = New_Investment / Post-Money Valuation.',
      'Effective Founder Dilution = 1 - (1 - Investor_Ownership) * (1 - Option_Pool).',
    ],
    fields: [
      n('preMoneyValuation', 'Pre-Money Valuation ($)', 25000000, 1000000, 1000000000, 1000000),
      n('newInvestment', 'New Round Capital Investment ($)', 6000000, 250000, 500000000, 500000),
      n('existingShares', 'Existing Pre-Round Shares', 10000000, 100000, 100000000, 500000),
      sel('optionPoolShuffle', 'Option Pool Creation Timing', [
        'Pre-Money Shuffle (Standard - Founders absorb dilution)',
        'Post-Money Pool (Mutual dilution between founders & investors)',
      ]),
      n('targetPoolPct', 'Target Post-Closing Option Pool (%)', 10.0, 0.0, 25.0, 0.5),
    ],
    compute: (v) => {
      const pre = asNum(v, 'preMoneyValuation', 25000000)
      const inv = asNum(v, 'newInvestment', 6000000)
      const shares = asNum(v, 'existingShares', 10000000)
      const poolMode = asSel(v, 'optionPoolShuffle', 'Pre-Money')
      const poolPct = asNum(v, 'targetPoolPct', 10.0) / 100

      const post = pre + inv
      const invPct = inv / post

      let founderPct = 0
      if (poolMode.includes('Pre-Money')) {
        founderPct = (1 - invPct) * (1 - poolPct)
      } else {
        founderPct = (1 - poolPct) * (pre / post)
      }

      const totalPostShares = Math.round(shares / (founderPct / (1 - invPct - poolPct) || 1) + (shares * 0.3))
      const pps = pre / shares

      return [
        res('Post-Money Valuation', fmtMoney(post), 'good', `Pre-money ${fmtMoney(pre)} + ${fmtMoney(inv)} new cash`),
        pctres('New Investor Ownership', `${(invPct * 100).toFixed(2)}% Preferred Stock`, Math.round(invPct * 100), 'neutral'),
        pctres('Founder Remaining Stake', `${(founderPct * 100).toFixed(2)}% Common Stock`, Math.round(founderPct * 100), 'good', `Diluted from 100% to ${(founderPct * 100).toFixed(1)}%`),
        res('Effective Price Per Share (PPS)', `$${pps.toFixed(4)} / share`, 'good', `Estimated post-closing share count: ${fmtNum(totalPostShares)}`),
      ]
    },
  },
]
