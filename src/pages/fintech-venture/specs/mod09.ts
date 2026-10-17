import {
  asNum,
  fmtMoney,
  n,
  pctres,
  res,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'Private Equity LBO & Leverage'

export const MOD09_SPECS: FintechSpec[] = [
  {
    id: 'pe-lbo-returns-moic-irr-sizer',
    name: 'Private Equity Leveraged Buyout (LBO) IRR & MoIC Sizer',
    subject: SUBJECT,
    blurb: 'Calculate sponsor equity checks, senior/mezzanine debt leverage multiples, 5-year debt paydown, exit enterprise valuation, Multiple on Invested Capital (MoIC), and net sponsor IRR.',
    tip: 'LBO equity value creation is driven by three distinct levers: EBITDA growth, debt deleveraging through free cash flow, and valuation multiple expansion.',
    usage: [
      'Enter entry EBITDA and entry purchase multiple (e.g. 10.0x EV/EBITDA).',
      'Specify leverage package: Senior Debt and Mezzanine Debt multiples.',
      'Enter projected 5-year EBITDA and exit multiple.',
    ],
    method: [
      'Entry EV = Entry_EBITDA * Entry_Multiple.',
      'Sponsor Equity Check = Entry_EV - Total_Debt_Financed.',
      'Exit EV = Exit_EBITDA * Exit_Multiple.',
      'Exit Equity = Exit_EV - Remaining_Debt_Post_Paydown.',
      'MoIC = Exit_Equity / Initial_Sponsor_Equity.',
      'IRR = MoIC^(1 / 5) - 1.',
    ],
    fields: [
      n('entryEbitdaUsd', 'Entry LTM EBITDA ($)', 15000000, 1000000, 500000000, 1000000),
      n('entryMultiple', 'Entry Purchase Multiple (EV/EBITDA)', 10.5, 4.0, 25.0, 0.5),
      n('debtMultiple', 'Total Leverage Incurred (Debt / EBITDA)', 5.5, 1.0, 8.0, 0.25),
      n('exitEbitdaUsd', 'Year 5 Projected Exit EBITDA ($)', 24000000, 2000000, 1000000000, 1000000),
      n('exitMultiple', 'Exit Valuation Multiple (EV/EBITDA)', 11.0, 4.0, 25.0, 0.5),
      n('annualDebtPaydownUsd', 'Annual FCF Debt Amortization ($)', 8000000, 0, 100000000, 500000),
    ],
    compute: (v) => {
      const entryEbitda = asNum(v, 'entryEbitdaUsd', 15000000)
      const entryMult = asNum(v, 'entryMultiple', 10.5)
      const debtMult = asNum(v, 'debtMultiple', 5.5)
      const exitEbitda = asNum(v, 'exitEbitdaUsd', 24000000)
      const exitMult = asNum(v, 'exitMultiple', 11.0)
      const debtPaydown = asNum(v, 'annualDebtPaydownUsd', 8000000)

      const entryEv = entryEbitda * entryMult
      const initialDebt = entryEbitda * debtMult
      const sponsorEquity = Math.max(1000000, entryEv - initialDebt)

      const totalDebtPaid5Yr = debtPaydown * 5
      const remainingDebtAtExit = Math.max(0, initialDebt - totalDebtPaid5Yr)

      const exitEv = exitEbitda * exitMult
      const exitEquity = exitEv - remainingDebtAtExit

      const moic = Math.max(0.1, exitEquity / sponsorEquity)
      const irr = (Math.pow(moic, 1 / 5) - 1) * 100

      const isEliteIrr = irr >= 20.0
      const tone: 'good' | 'warn' | 'bad' | 'neutral' = isEliteIrr ? 'good' : irr >= 12.0 ? 'neutral' : 'warn'

      return [
        res('Sponsor 5-Year Net IRR', `${irr.toFixed(1)}% IRR`, tone, isEliteIrr ? 'Exceeds standard 20% institutional hurdle' : 'Below typical top-quartile PE benchmark'),
        res('Multiple on Invested Capital (MoIC)', `${moic.toFixed(2)}x Cash-on-Cash`, tone, `${fmtMoney(sponsorEquity)} equity -> ${fmtMoney(exitEquity)} proceeds`),
        res('Entry Enterprise Value', fmtMoney(entryEv), 'neutral', `${fmtMoney(initialDebt)} debt (${debtMult}x) + ${fmtMoney(sponsorEquity)} equity`),
        res('Exit Enterprise Value', fmtMoney(exitEv), 'good', `Remaining debt: ${fmtMoney(remainingDebtAtExit)} (paid down ${fmtMoney(totalDebtPaid5Yr)})`),
        pctres('Deleveraging Paydown Factor', `${Math.round((totalDebtPaid5Yr / initialDebt) * 100)}% Debt Extinguished`, Math.min(100, Math.round((totalDebtPaid5Yr / initialDebt) * 100)), 'good'),
      ]
    },
  },
]
