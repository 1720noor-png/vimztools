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

export const SUBJECT = 'Venture Capital Waterfall & Carried Interest'

export const MOD17_SPECS: FintechSpec[] = [
  {
    id: 'vc-fund-distribution-waterfall-carry-sizer',
    name: 'Venture Capital Distribution Waterfall & Carried Interest Sizer',
    subject: SUBJECT,
    blurb: 'Model LP return of capital, preferred return (hurdle rate), GP catch-up, and 80/20 carried interest profit splits across whole-fund (European) and deal-by-deal (American) waterfalls.',
    tip: 'Under European waterfalls, General Partners (GPs) receive 0% carried interest until Limited Partners (LPs) have received 100% of their contributed fund capital plus preferred return.',
    usage: [
      'Enter total LP committed capital fund size ($).',
      'Enter total gross exit cash distributions realized by the fund ($).',
      'Select waterfall structure (European Whole-Fund vs American Deal-by-Deal).',
    ],
    method: [
      'Tier 1: 100% distribution to LPs until Contributed_Capital is returned.',
      'Tier 2: Preferred return hurdle (typically 8% per annum compounding).',
      'Tier 3: GP Catch-Up (100% to GP until GP receives 20% of total profits).',
      'Tier 4: 80% to LPs / 20% to GPs (standard 80/20 carried interest split).',
    ],
    fields: [
      n('fundCommittedCapitalUsd', 'Total Fund Committed Capital ($)', 50000000, 1000000, 2000000000, 5000000),
      n('totalRealizedProceedsUsd', 'Total Realized Exit Distributions ($)', 175000000, 1000000, 10000000000, 5000000),
      sel('waterfallStyle', 'Fund Waterfall Architecture', [
        'European Waterfall (Whole-Fund: 100% LP Capital Return First)',
        'American Waterfall (Deal-by-Deal with Clawback Provision)',
      ]),
      n('preferredReturnHurdlePct', 'LP Preferred Return Hurdle Rate (%)', 8.0, 0.0, 15.0, 0.5),
    ],
    compute: (v) => {
      const fundSize = asNum(v, 'fundCommittedCapitalUsd', 50000000)
      const proceeds = asNum(v, 'totalRealizedProceedsUsd', 175000000)
      const style = asSel(v, 'waterfallStyle', 'European')
      const hurdleRate = asNum(v, 'preferredReturnHurdlePct', 8.0) / 100

      const netFundProfit = Math.max(0, proceeds - fundSize)
      // Standard 7-year life assumption for hurdle compounding
      const hurdleAmount = fundSize * Math.pow(1 + hurdleRate, 5) - fundSize

      let lpCapitalReturned = Math.min(proceeds, fundSize)
      let remainingProceeds = proceeds - lpCapitalReturned

      let lpHurdleReceived = Math.min(remainingProceeds, hurdleAmount)
      remainingProceeds -= lpHurdleReceived

      // GP 20% carry on total profits
      const totalCarryPotential = netFundProfit * 0.20
      let gpCarryDistributed = 0
      let lpProfitShare = 0

      if (remainingProceeds > 0) {
        gpCarryDistributed = Math.min(remainingProceeds, totalCarryPotential)
        remainingProceeds -= gpCarryDistributed
        lpProfitShare = remainingProceeds
      }

      const totalLpProceeds = lpCapitalReturned + lpHurdleReceived + lpProfitShare
      const totalGpProceeds = gpCarryDistributed

      const fundMoic = proceeds / fundSize
      const lpNetMoic = totalLpProceeds / fundSize

      return [
        res('Gross Fund Multiple (TVPI)', `${fundMoic.toFixed(2)}x Gross`, 'good', `${fmtMoney(proceeds)} total distributions on ${fmtMoney(fundSize)} fund`),
        res('LP Net Return Multiple (DPI)', `${lpNetMoic.toFixed(2)}x Net to LPs`, 'good', `${fmtMoney(totalLpProceeds)} cash returned to Limited Partners`),
        res('GP Total Carried Interest', fmtMoney(totalGpProceeds), 'good', `20% carry incentive allocation (${style.split(' ')[0]} waterfall)`),
        pctres('Profit Share Distribution', `${Math.round((totalLpProceeds / proceeds) * 100)}% LP / ${Math.round((totalGpProceeds / proceeds) * 100)}% GP`, Math.round((totalLpProceeds / proceeds) * 100), 'good'),
      ]
    },
  },
]
