import {
  asNum,
  fmtMoney,
  n,
  pctres,
  res,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'DCF Valuation & WACC Capital Cost'

export const MOD05_SPECS: FintechSpec[] = [
  {
    id: 'dcf-wacc-enterprise-valuation-sizer',
    name: 'Discounted Cash Flow (DCF) & WACC Enterprise Valuation Sizer',
    subject: SUBJECT,
    blurb: 'Calculate Weighted Average Cost of Capital (WACC), present value of explicit 5-year Free Cash Flows to Firm (FCFF), Gordon Growth terminal value, and implied equity share price.',
    tip: 'Small variations in the Terminal Value growth rate or WACC discount rate can swing intrinsic enterprise valuation by 30-50%, making sensitivity tables essential.',
    usage: [
      'Enter Year 1 Free Cash Flow to Firm (FCFF) in USD.',
      'Enter 5-year compound annual FCF growth rate (%).',
      'Input Weighted Average Cost of Capital (WACC %) and Terminal Value perpetuity growth rate (%).',
    ],
    method: [
      'WACC = (E/V * Re) + (D/V * Rd * (1 - Tax_Rate)).',
      'Explicit PV = sum(FCF_t / (1 + WACC)^t) for t=1..5.',
      'Terminal Value TV = (FCF_5 * (1 + g)) / (WACC - g).',
      'Enterprise Value EV = Explicit_PV + PV_of_TV.',
    ],
    fields: [
      n('year1FcffUsd', 'Year 1 Free Cash Flow FCFF ($)', 4500000, 100000, 5000000000, 250000),
      n('fcfGrowthPct', '5-Year FCF Annual Growth Rate (%)', 15.0, -10.0, 60.0, 0.5),
      n('waccDiscountPct', 'WACC Discount Rate (%)', 9.5, 4.0, 25.0, 0.25),
      n('terminalGrowthPct', 'Long-Term Perpetuity Growth Rate g (%)', 2.5, 1.0, 4.5, 0.25),
      n('netDebtUsd', 'Net Debt ($ Cash minus Total Debt)', -2000000, -500000000, 500000000, 500000),
    ],
    compute: (v) => {
      const fcf1 = asNum(v, 'year1FcffUsd', 4500000)
      const gFcf = asNum(v, 'fcfGrowthPct', 15.0) / 100
      const wacc = asNum(v, 'waccDiscountPct', 9.5) / 100
      const gTerm = asNum(v, 'terminalGrowthPct', 2.5) / 100
      const netDebt = asNum(v, 'netDebtUsd', -2000000)

      if (wacc <= gTerm) {
        return [
          res('Valuation Mathematical Boundary', 'WACC must be strictly greater than Terminal Growth Rate (g)', 'bad'),
        ]
      }

      let explicitPv = 0
      let currentFcf = fcf1
      for (let t = 1; t <= 5; t++) {
        explicitPv += currentFcf / Math.pow(1 + wacc, t)
        if (t < 5) currentFcf *= (1 + gFcf)
      }

      const fcf5 = currentFcf
      const tvNominal = (fcf5 * (1 + gTerm)) / (wacc - gTerm)
      const tvPv = tvNominal / Math.pow(1 + wacc, 5)

      const enterpriseValue = explicitPv + tvPv
      const equityValue = enterpriseValue - netDebt
      const tvFractionPct = Math.round((tvPv / enterpriseValue) * 100)

      return [
        res('Intrinsic Enterprise Value (EV)', fmtMoney(enterpriseValue), 'good', `Explicit FCF PV ${fmtMoney(explicitPv)} + Terminal PV ${fmtMoney(tvPv)}`),
        res('Implied Equity Value', fmtMoney(equityValue), 'good', `Adjusted for ${fmtMoney(netDebt)} net balance sheet debt`),
        pctres('Terminal Value Contribution', `${tvFractionPct}% of Total EV`, tvFractionPct, tvFractionPct > 75 ? 'warn' : 'good', tvFractionPct > 75 ? 'High sensitivity to terminal growth assumptions' : 'Balanced valuation profile'),
        res('Year 5 Projected FCF', fmtMoney(fcf5), 'neutral', `Compounded at ${(gFcf * 100).toFixed(1)}% annually`),
      ]
    },
  },
]
