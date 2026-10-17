import {
  asNum,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'Startup Runway & Burn Dynamics'

export const MOD01_SPECS: FintechSpec[] = [
  {
    id: 'startup-runway-zero-cash-date-calculator',
    name: 'Startup Burn Rate, Net Runway & Zero-Cash Date Sizer',
    subject: SUBJECT,
    blurb: 'Calculate net and gross monthly burn rate, remaining cash runway in months, zero-cash drop-dead date, and minimum required fundraising lead time.',
    tip: 'Venture-backed startups should initiate their next equity financing round when they have at least 6 months of runway remaining, as institutional Series A/B rounds typically take 4-6 months to close.',
    usage: [
      'Enter current cash balance in bank accounts.',
      'Enter total monthly operating expenses (Gross Burn).',
      'Enter total monthly collected customer revenue (Cash Inflows).',
    ],
    method: [
      'Net Monthly Burn = Gross_Monthly_Expenses - Monthly_Cash_Revenue.',
      'Runway (Months) = Current_Cash_Balance / Net_Monthly_Burn.',
      'Fundraising Trigger Threshold = max(6, Runway_Months - 6).',
    ],
    fields: [
      n('cashBalanceUsd', 'Current Cash Balance ($)', 1500000, 10000, 100000000, 25000),
      n('monthlyGrossExpensesUsd', 'Monthly Gross Operating Expenses ($)', 125000, 5000, 10000000, 5000),
      n('monthlyRevenueUsd', 'Monthly Cash Revenue ($)', 35000, 0, 10000000, 2500),
      n('monthlyHiringGrowthPct', 'Monthly Headcount/Expense Growth (%)', 3.0, 0.0, 20.0, 0.5),
    ],
    compute: (v) => {
      const cash = asNum(v, 'cashBalanceUsd', 1500000)
      const gross = asNum(v, 'monthlyGrossExpensesUsd', 125000)
      const rev = asNum(v, 'monthlyRevenueUsd', 35000)
      const expGrowth = asNum(v, 'monthlyHiringGrowthPct', 3.0) / 100

      const netBurn = Math.max(0, gross - rev)
      const isDefaultAlive = rev >= gross

      let monthsLeft = 0
      if (isDefaultAlive) {
        monthsLeft = 999
      } else if (expGrowth === 0) {
        monthsLeft = cash / netBurn
      } else {
        // Dynamic runway simulation with compounding expense growth
        let currentCash = cash
        let curGross = gross
        let curRev = rev
        while (currentCash > 0 && monthsLeft < 120) {
          const mBurn = Math.max(0, curGross - curRev)
          currentCash -= mBurn
          curGross *= (1 + expGrowth)
          monthsLeft++
        }
      }

      const isCritical = monthsLeft < 6 && !isDefaultAlive
      const tone: 'good' | 'warn' | 'bad' = isDefaultAlive ? 'good' : isCritical ? 'bad' : monthsLeft < 12 ? 'warn' : 'good'

      const zeroDate = new Date()
      zeroDate.setMonth(zeroDate.getMonth() + Math.round(monthsLeft))
      const zeroDateStr = isDefaultAlive ? 'Indefinite (Profitable)' : zeroDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      return [
        res('Current Runway Longevity', isDefaultAlive ? 'Infinite (Default Alive)' : `${monthsLeft.toFixed(1)} Months`, tone, isDefaultAlive ? 'Profitable cash flow positive' : `Projected zero-cash date: ${zeroDateStr}`),
        res('Net Monthly Burn Rate', isDefaultAlive ? '$0 (Net Cash Flow +)' : fmtMoney(netBurn), isDefaultAlive ? 'good' : 'warn', `Gross spend ${fmtMoney(gross)} - Inflows ${fmtMoney(rev)}`),
        res('Recommended Action', isDefaultAlive ? 'Self-Sustaining Growth' : monthsLeft <= 6 ? 'IMMEDIATE Emergency Financing / Cost Cut' : monthsLeft <= 9 ? 'Prepare Pitch Deck & Data Room' : 'Focus on Product-Market Fit', tone),
        pctres('Burn Efficiency Ratio', `${Math.round((rev / gross) * 100)}% Revenue-to-Expense Coverage`, Math.min(100, Math.round((rev / gross) * 100)), tone),
        res('Capital Preservation Target', fmtMoney(cash * 0.15), 'neutral', 'Recommended 15% emergency winding-down severance reserve'),
      ]
    },
  },
  {
    id: 'post-money-safe-dilution-modeler',
    name: 'Post-Money SAFE Note Dilution & Ownership Sizer',
    subject: SUBJECT,
    blurb: 'Model exact founder equity dilution, investor ownership percentage, and post-money valuation across single or stacked Y Combinator Post-Money SAFEs with valuation caps and discounts.',
    tip: 'Under the standard YC Post-Money SAFE, investor ownership is simply equal to Investment Amount divided by the Post-Money Valuation Cap, removing round-to-round dilution ambiguity.',
    usage: [
      'Enter total existing founder & employee shares outstanding.',
      'Enter SAFE investment amount in USD.',
      'Enter SAFE Post-Money Valuation Cap in USD.',
    ],
    method: [
      'Investor Ownership % = Investment_Amount / Post_Money_Valuation_Cap.',
      'Implied Share Price = Post_Money_Cap / Fully_Diluted_Shares_Post_Round.',
      'Founder Dilution = 100% - Investor_Ownership_%.',
    ],
    fields: [
      n('founderShares', 'Existing Founder Shares Outstanding', 10000000, 100000, 100000000, 500000),
      n('safeInvestmentAmount', 'SAFE Investment Amount ($)', 1000000, 25000, 50000000, 50000),
      n('postMoneyValuationCap', 'SAFE Post-Money Valuation Cap ($)', 10000000, 500000, 500000000, 250000),
      n('targetOptionPoolPct', 'Unallocated Option Pool Created (%)', 10.0, 0.0, 25.0, 0.5),
    ],
    compute: (v) => {
      const shares = asNum(v, 'founderShares', 10000000)
      const invest = asNum(v, 'safeInvestmentAmount', 1000000)
      const cap = asNum(v, 'postMoneyValuationCap', 10000000)
      const poolPct = asNum(v, 'targetOptionPoolPct', 10.0) / 100

      const safeInvestorPct = Math.min(0.90, invest / cap)
      const postRoundFounderPct = (1 - safeInvestorPct) * (1 - poolPct)
      const actualPoolPct = (1 - safeInvestorPct) * poolPct

      const impliedPreMoney = cap - invest
      const safeSharesIssued = Math.round((shares / (1 - safeInvestorPct - actualPoolPct)) * safeInvestorPct)
      const totalPostShares = Math.round(shares + safeSharesIssued + (shares * poolPct))
      const impliedSharePrice = cap / totalPostShares

      return [
        pctres('SAFE Investor Ownership', `${(safeInvestorPct * 100).toFixed(2)}% Equity`, Math.round(safeInvestorPct * 100), 'neutral', `${fmtMoney(invest)} on ${fmtMoney(cap)} Post-Money Cap`),
        pctres('Founder Retained Ownership', `${(postRoundFounderPct * 100).toFixed(2)}% Equity`, Math.round(postRoundFounderPct * 100), 'good', `After SAFE & ${(poolPct * 100).toFixed(0)}% employee option pool`),
        res('Implied Pre-Money Valuation', fmtMoney(impliedPreMoney), 'good', 'Effective valuation before capital injection'),
        res('Estimated Post-Conversion Share Price', `$${impliedSharePrice.toFixed(4)} / share`, 'neutral', `Across ~${fmtNum(totalPostShares)} fully diluted shares`),
      ]
    },
  },
]
