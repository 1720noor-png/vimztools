import {
  asNum,
  fmtMoney,
  n,
  pctres,
  res,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'Retirement & Safe Withdrawal Rate'

export const MOD15_SPECS: FintechSpec[] = [
  {
    id: 'trinity-study-safe-withdrawal-rate-sizer',
    name: 'Trinity Study 4% Safe Withdrawal Rate & Capital Depletion Sizer',
    subject: SUBJECT,
    blurb: 'Calculate sustainable annual retirement distributions, inflation-adjusted annual spending budgets, sequence of returns risk, and portfolio longevity across 30 to 40-year retirements.',
    tip: 'The landmark Trinity Study demonstrated that a 4.0% initial withdrawal rate with annual inflation adjustments had a 95%+ historical survival rate over a 30-year horizon for a 60/40 stock/bond portfolio.',
    usage: [
      'Enter total invested nest-egg retirement portfolio value ($).',
      'Select initial withdrawal rate percentage (typically 3.25% to 4.5%).',
      'Enter expected long-term portfolio real return and retirement duration in years.',
    ],
    method: [
      'Year 1 Annual Withdrawal = Portfolio_Value * Withdrawal_Rate %.',
      'Monthly Spending Budget = Year_1_Withdrawal / 12.',
      'Required Nest Egg = Desired_Annual_Spend / Withdrawal_Rate %.',
    ],
    fields: [
      n('portfolioValueUsd', 'Total Invested Portfolio Nest Egg ($)', 1800000, 25000, 50000000, 50000),
      n('withdrawalRatePct', 'Initial Annual Withdrawal Rate (%)', 3.85, 2.0, 8.0, 0.05),
      n('annualInflationPct', 'Projected Long-Term Inflation (%)', 2.8, 1.0, 8.0, 0.1),
      n('portfolioRealReturnPct', 'Expected Real (Above Inflation) Return (%)', 4.5, 0.0, 10.0, 0.1),
      n('retirementYears', 'Target Retirement Horizon (Years)', 30, 10, 50, 1),
    ],
    compute: (v) => {
      const port = asNum(v, 'portfolioValueUsd', 1800000)
      const swr = asNum(v, 'withdrawalRatePct', 3.85) / 100
      const infl = asNum(v, 'annualInflationPct', 2.8) / 100
      const realRet = asNum(v, 'portfolioRealReturnPct', 4.5) / 100
      const years = asNum(v, 'retirementYears', 30)

      const year1Spend = port * swr
      const monthlySpend = year1Spend / 12

      // Historical survival estimate based on Trinity empirical curves
      let survivalPct = 98
      if (swr > 0.05) survivalPct = Math.max(30, 98 - (swr - 0.05) * 1200)
      else if (swr > 0.04) survivalPct = 95 - (swr - 0.04) * 300

      if (years > 30) {
        survivalPct -= (years - 30) * 0.7
      }

      const nominalReturn = realRet + infl
      // Wealth trajectory after 30 years with inflation-adjusted withdrawals
      let balance = port
      let annualWithdrawal = year1Spend
      for (let y = 1; y <= years; y++) {
        balance = balance * (1 + nominalReturn) - annualWithdrawal
        annualWithdrawal *= (1 + infl)
      }

      const isSafe = swr <= 0.04
      const tone: 'good' | 'warn' | 'bad' = isSafe ? 'good' : swr <= 0.045 ? 'warn' : 'bad'

      return [
        res('Year 1 Annual Spending Allowance', fmtMoney(year1Spend), 'good', `${fmtMoney(monthlySpend)} per month before tax`),
        pctres('Historical Portfolio Survival Rate', `${Math.round(survivalPct)}% Probability of Success`, Math.min(100, Math.round(survivalPct)), tone, 'Based on rolling 30-year US market cycles'),
        res('Safe Withdrawal Status', swr <= 0.035 ? 'Ultra-Conservative (Multi-Generational)' : swr <= 0.04 ? 'Trinity Standard (Highly Resilient)' : 'Aggressive (Elevated Depletion Risk)', tone),
        res(`Projected Balance After ${years} Years`, balance > 0 ? fmtMoney(balance) : '$0 (Depleted)', balance > 0 ? 'good' : 'bad', `Factoring ${(realRet * 100).toFixed(1)}% real return above ${(infl * 100).toFixed(1)}% inflation`),
      ]
    },
  },
]
