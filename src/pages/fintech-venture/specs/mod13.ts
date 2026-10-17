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

export const SUBJECT = 'Mortgage Analytics & Amortization'

export const MOD13_SPECS: FintechSpec[] = [
  {
    id: 'mortgage-biweekly-accelerated-payoff-sizer',
    name: 'Bi-Weekly vs Monthly Accelerated Mortgage Payoff Sizer',
    subject: SUBJECT,
    blurb: 'Calculate interest savings, principal payoff speed, and years shaved off home mortgages by making accelerated bi-weekly payments or extra monthly principal contributions.',
    tip: 'Switching to accelerated bi-weekly payments results in 26 half-payments per year—effectively making 13 full monthly payments instead of 12—knocking 4 to 6 years off a 30-year mortgage.',
    usage: [
      'Enter original loan principal balance ($).',
      'Enter annual mortgage interest rate (%).',
      'Enter loan term in years (e.g. 30 or 15 years).',
    ],
    method: [
      'Monthly Payment M = P * [r(1+r)^n] / [(1+r)^n - 1].',
      'Accelerated Bi-Weekly Payment = M / 2 (paid 26 times/year).',
      'Total Savings = Total_Interest_Monthly - Total_Interest_Biweekly.',
    ],
    fields: [
      n('loanAmountUsd', 'Mortgage Principal Amount ($)', 450000, 25000, 10000000, 10000),
      n('interestRatePct', 'Mortgage Interest Rate (%)', 6.75, 1.0, 18.0, 0.125),
      sel('loanTermYears', 'Loan Duration Term', ['30 Years (360 Months)', '15 Years (180 Months)', '20 Years (240 Months)']),
      n('extraMonthlyPrincipalUsd', 'Extra Principal Paid Monthly ($)', 250, 0, 10000, 25),
    ],
    compute: (v) => {
      const p = asNum(v, 'loanAmountUsd', 450000)
      const rAnnual = asNum(v, 'interestRatePct', 6.75) / 100
      const termStr = asSel(v, 'loanTermYears', '30 Years')
      const extraMonthly = asNum(v, 'extraMonthlyPrincipalUsd', 250)

      const termYears = termStr.includes('15') ? 15 : termStr.includes('20') ? 20 : 30
      const nMonths = termYears * 12
      const rMonthly = rAnnual / 12

      // Standard monthly payment
      const monthlyPayment = p * (rMonthly * Math.pow(1 + rMonthly, nMonths)) / (Math.pow(1 + rMonthly, nMonths) - 1)
      const totalStandardInterest = (monthlyPayment * nMonths) - p

      // Accelerated simulation with extra principal
      let balance = p
      let totalInterestWithExtra = 0
      let monthsToPayoff = 0
      const effectiveMonthlyPayment = monthlyPayment + extraMonthly

      while (balance > 0 && monthsToPayoff < 480) {
        const interestM = balance * rMonthly
        const principalM = Math.min(balance, effectiveMonthlyPayment - interestM)
        totalInterestWithExtra += interestM
        balance -= principalM
        monthsToPayoff++
      }

      const yearsToPayoff = monthsToPayoff / 12
      const yearsSaved = Math.max(0, termYears - yearsToPayoff)
      const interestSaved = Math.max(0, totalStandardInterest - totalInterestWithExtra)

      return [
        res('Standard Monthly Payment (P&I)', fmtMoney(monthlyPayment), 'neutral', `Before property taxes and hazard insurance`),
        res('Accelerated Payoff Timeline', `${yearsToPayoff.toFixed(1)} Years`, 'good', `Shaves ${yearsSaved.toFixed(1)} years off standard ${termYears}-year term`),
        res('Lifetime Interest Eliminated', fmtMoney(interestSaved), 'good', `Total paid ${fmtMoney(p + totalInterestWithExtra)} vs baseline ${fmtMoney(p + totalStandardInterest)}`),
        pctres('Interest Reduction Ratio', `${Math.round((interestSaved / totalStandardInterest) * 100)}% Interest Saved`, Math.round((interestSaved / totalStandardInterest) * 100), 'good'),
        res('Bi-Weekly Equivalent Half-Payment', fmtMoney(monthlyPayment / 2), 'neutral', `Paid every two weeks (26 payment cycles / year)`),
      ]
    },
  },
]
