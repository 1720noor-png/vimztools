import {
  asNum,
  fmtMoney,
  n,
  pctres,
  res,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'SaaS Unit Economics & Rule of 40'

export const MOD03_SPECS: FintechSpec[] = [
  {
    id: 'saas-unit-economics-ltv-cac-payback-sizer',
    name: 'SaaS LTV, CAC, Payback Period & Magic Number Sizer',
    subject: SUBJECT,
    blurb: 'Calculate Customer Lifetime Value (LTV), Customer Acquisition Cost (CAC), LTV/CAC ratio, CAC payback months, and Sales & Marketing Magic Number.',
    tip: 'Top-quartile public B2B SaaS companies maintain an LTV/CAC ratio > 3.0x and recover fully loaded customer acquisition costs within 12 to 14 months.',
    usage: [
      'Enter Average Revenue Per Account (ARPA) in USD/year.',
      'Enter gross margin percentage and annual customer logo churn rate.',
      'Enter total sales & marketing spend and new customers acquired in the period.',
    ],
    method: [
      'LTV = (ARPA * Gross_Margin %) / Annual_Logo_Churn_%.',
      'Blended CAC = Total_Sales_Marketing_Spend / New_Customers_Acquired.',
      'CAC Payback (Months) = (CAC / (ARPA * Gross_Margin %)) * 12.',
      'Magic Number = (Net_New_ARR_Quarter * 4) / Prior_Quarter_S&M_Spend.',
    ],
    fields: [
      n('arpaAnnualUsd', 'Average Annual Revenue Per Account ARPA ($)', 14000, 100, 500000, 500),
      n('grossMarginPct', 'Subscription Gross Margin (%)', 78, 20, 95, 1),
      n('annualLogoChurnPct', 'Annual Logo Churn Rate (%)', 6.5, 0.5, 50.0, 0.5),
      n('totalSmSpendUsd', 'Quarterly Sales & Marketing Spend ($)', 350000, 5000, 20000000, 10000),
      n('newCustomersAcquired', 'New Customers Acquired in Quarter', 28, 1, 10000, 1),
    ],
    compute: (v) => {
      const arpa = asNum(v, 'arpaAnnualUsd', 14000)
      const gm = asNum(v, 'grossMarginPct', 78) / 100
      const churn = asNum(v, 'annualLogoChurnPct', 6.5) / 100
      const smSpend = asNum(v, 'totalSmSpendUsd', 350000)
      const newCust = asNum(v, 'newCustomersAcquired', 28)

      const cac = smSpend / newCust
      const annualGrossProfitPerCustomer = arpa * gm
      const ltv = annualGrossProfitPerCustomer / churn
      const ltvCacRatio = ltv / cac

      const cacPaybackMonths = (cac / annualGrossProfitPerCustomer) * 12
      const isPaybackGood = cacPaybackMonths <= 14
      const isLtvGood = ltvCacRatio >= 3.0

      const tone: 'good' | 'warn' | 'bad' = isLtvGood && isPaybackGood ? 'good' : ltvCacRatio < 1.5 ? 'bad' : 'warn'

      return [
        res('LTV / CAC Multiple', `${ltvCacRatio.toFixed(2)}x`, tone, ltvCacRatio >= 3.0 ? 'Exceptional unit economics (>3.0x standard)' : 'High acquisition cost relative to customer value'),
        res('Customer Lifetime Value (LTV)', fmtMoney(ltv), 'good', `Gross margin adjusted @ ${(gm * 100).toFixed(0)}%`),
        res('Customer Acquisition Cost (CAC)', fmtMoney(cac), 'neutral', `Fully loaded S&M spend per new customer`),
        res('CAC Payback Velocity', `${cacPaybackMonths.toFixed(1)} Months`, isPaybackGood ? 'good' : 'warn', isPaybackGood ? 'Fast capital recovery (< 14 mo)' : 'Protracted working capital drain (> 14 mo)'),
        pctres('Unit Economic Health Index', `${Math.min(100, Math.round(ltvCacRatio * 25))}% Health Score`, Math.min(100, Math.round(ltvCacRatio * 25)), tone),
      ]
    },
  },
]
