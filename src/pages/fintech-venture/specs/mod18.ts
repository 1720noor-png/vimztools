import {
  asNum,
  fmtMoney,
  n,
  pctres,
  res,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'Working Capital & Cash Conversion Cycle'

export const MOD18_SPECS: FintechSpec[] = [
  {
    id: 'cash-conversion-cycle-ccc-working-capital-sizer',
    name: 'Cash Conversion Cycle (CCC) & Working Capital Velocity Sizer',
    subject: SUBJECT,
    blurb: 'Calculate Days Sales Outstanding (DSO), Days Inventory Outstanding (DIO), Days Payable Outstanding (DPO), and total Cash Conversion Cycle (CCC) in days to identify trapped balance sheet capital.',
    tip: 'Companies like Dell, Apple, and Amazon operate with a negative Cash Conversion Cycle, meaning suppliers effectively finance customer inventory before cash is paid out.',
    usage: [
      'Enter annual net revenue and Cost of Goods Sold (COGS).',
      'Enter average Accounts Receivable (A/R) balance.',
      'Enter average Inventory balance and Accounts Payable (A/P) balance.',
    ],
    method: [
      'Days Sales Outstanding DSO = (Accounts_Receivable / Annual_Revenue) * 365.',
      'Days Inventory Outstanding DIO = (Inventory / Annual_COGS) * 365.',
      'Days Payable Outstanding DPO = (Accounts_Payable / Annual_COGS) * 365.',
      'Cash Conversion Cycle CCC = DIO + DSO - DPO.',
    ],
    fields: [
      n('annualRevenueUsd', 'Annual Net Revenue ($)', 28000000, 100000, 1000000000, 500000),
      n('annualCogsUsd', 'Annual Cost of Goods Sold COGS ($)', 16000000, 50000, 1000000000, 500000),
      n('accountsReceivableUsd', 'Average Accounts Receivable A/R ($)', 3800000, 10000, 500000000, 100000),
      n('inventoryUsd', 'Average Inventory Balance ($)', 2400000, 0, 500000000, 100000),
      n('accountsPayableUsd', 'Average Accounts Payable A/P ($)', 2100000, 0, 500000000, 100000),
    ],
    compute: (v) => {
      const rev = asNum(v, 'annualRevenueUsd', 28000000)
      const cogs = asNum(v, 'annualCogsUsd', 16000000)
      const ar = asNum(v, 'accountsReceivableUsd', 3800000)
      const inv = asNum(v, 'inventoryUsd', 2400000)
      const ap = asNum(v, 'accountsPayableUsd', 2100000)

      const dso = (ar / rev) * 365
      const dio = (inv / cogs) * 365
      const dpo = (ap / cogs) * 365
      const ccc = dio + dso - dpo

      const dailyOperatingSpend = cogs / 365
      const trappedCapital = ccc * dailyOperatingSpend

      const isCccEfficient = ccc < 45
      const tone: 'good' | 'warn' | 'bad' = ccc <= 0 ? 'good' : isCccEfficient ? 'good' : ccc > 90 ? 'bad' : 'warn'

      return [
        res('Cash Conversion Cycle (CCC)', `${ccc.toFixed(1)} Days`, tone, ccc <= 0 ? 'Negative CCC (Customer funded working capital)' : `${ccc.toFixed(0)} days between cash outflow and customer cash collection`),
        res('Days Sales Outstanding (DSO)', `${dso.toFixed(1)} Days`, dso <= 45 ? 'good' : 'warn', 'Average collection period for customer invoices'),
        res('Days Inventory Outstanding (DIO)', `${dio.toFixed(1)} Days`, dio <= 60 ? 'good' : 'warn', 'Average days inventory sits in warehouse before sale'),
        res('Days Payable Outstanding (DPO)', `${dpo.toFixed(1)} Days`, dpo >= 45 ? 'good' : 'neutral', 'Average payment terms extended by suppliers'),
        res('Trapped Working Capital Buffer', fmtMoney(Math.abs(trappedCapital)), tone, `${ccc >= 0 ? 'Capital tied up in operating cycle' : 'Excess supplier credit surplus'}`),
        pctres('Operating Cycle Efficiency', `${Math.max(0, Math.min(100, Math.round(100 - ccc)))}% Efficiency Index`, Math.max(0, Math.min(100, Math.round(100 - ccc))), tone),
      ]
    },
  },
]
