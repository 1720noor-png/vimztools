import {
  asNum,
  fmtMoney,
  n,
  pctres,
  res,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'Real Estate Cap Rate & Valuation'

export const MOD14_SPECS: FintechSpec[] = [
  {
    id: 'commercial-cre-noi-cap-rate-sizer',
    name: 'Commercial Real Estate NOI & Capitalization Rate Sizer',
    subject: SUBJECT,
    blurb: 'Calculate Gross Scheduled Income (GSI), Effective Gross Income (EGI), Net Operating Income (NOI), Capitalization Rate (Cap Rate), Debt Service Coverage Ratio (DSCR), and property valuation.',
    tip: 'Cap Rate measures the unleveraged property return. Lower Cap Rates indicate higher property valuation multiples and lower perceived regional risk (e.g. 4.5% Manhattan vs 8.0% secondary markets).',
    usage: [
      'Enter Gross Scheduled Annual Rental Income ($).',
      'Enter vacancy and credit loss allowance (%).',
      'Enter annual property operating expenses (property taxes, insurance, management, maintenance).',
    ],
    method: [
      'Effective Gross Income EGI = Gross_Rent * (1 - Vacancy_Rate %).',
      'Net Operating Income NOI = EGI - Operating_Expenses.',
      'Cap Rate = (NOI / Acquisition_Purchase_Price) * 100.',
      'Property Valuation = NOI / Market_Cap_Rate.',
    ],
    fields: [
      n('grossScheduledRentUsd', 'Gross Scheduled Annual Rent ($)', 650000, 25000, 100000000, 25000),
      n('vacancyLossPct', 'Vacancy & Credit Loss Allowance (%)', 6.0, 0.0, 30.0, 0.5),
      n('operatingExpensesUsd', 'Total Annual Operating Expenses ($)', 210000, 5000, 50000000, 5000),
      n('purchasePriceUsd', 'Property Acquisition / Market Price ($)', 7200000, 100000, 500000000, 100000),
      n('annualDebtServiceUsd', 'Annual Mortgage Debt Service ($)', 310000, 0, 50000000, 5000),
    ],
    compute: (v) => {
      const gross = asNum(v, 'grossScheduledRentUsd', 650000)
      const vac = asNum(v, 'vacancyLossPct', 6.0) / 100
      const opex = asNum(v, 'operatingExpensesUsd', 210000)
      const price = asNum(v, 'purchasePriceUsd', 7200000)
      const debt = asNum(v, 'annualDebtServiceUsd', 310000)

      const egi = gross * (1 - vac)
      const noi = egi - opex
      const capRate = (noi / price) * 100

      const cashFlowAfterDebt = noi - debt
      const dscr = debt > 0 ? noi / debt : 999
      const opexRatio = (opex / egi) * 100

      const isDscrSafe = dscr >= 1.25
      const tone: 'good' | 'warn' | 'bad' = isDscrSafe && capRate >= 5.0 ? 'good' : dscr < 1.0 ? 'bad' : 'warn'

      return [
        res('Net Operating Income (NOI)', fmtMoney(noi), 'good', `EGI ${fmtMoney(egi)} minus ${fmtMoney(opex)} OpEx`),
        res('Market Capitalization Rate', `${capRate.toFixed(2)}% Cap Rate`, tone, 'Unleveraged return on asset purchase price'),
        res('Debt Service Coverage Ratio (DSCR)', `${dscr.toFixed(2)}x`, isDscrSafe ? 'good' : 'bad', isDscrSafe ? 'Qualifies for standard institutional commercial lending (>= 1.25x)' : 'Insufficient cash flow to cover debt service!'),
        res('Net Cash Flow After Debt Service', fmtMoney(cashFlowAfterDebt), cashFlowAfterDebt >= 0 ? 'good' : 'bad', 'Leveraged cash flow to equity investors'),
        pctres('Operating Expense Efficiency', `${Math.round(opexRatio)}% OpEx Ratio`, Math.min(100, Math.round(opexRatio)), opexRatio <= 45 ? 'good' : 'warn', 'Fraction of revenue consumed by building operations'),
      ]
    },
  },
]
