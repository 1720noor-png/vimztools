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

export const SUBJECT = 'Tax-Loss Harvesting & Wash Sale Rules'

export const MOD12_SPECS: FintechSpec[] = [
  {
    id: 'wash-sale-rule-tax-loss-harvesting-sizer',
    name: 'IRS Wash Sale Rule & Tax-Loss Harvesting Disallowance Sizer',
    subject: SUBJECT,
    blurb: 'Calculate disallowed tax losses, adjusted replacement cost basis, deferred tax shield, and 30-day window violations under IRS Section 1091 Wash Sale regulations.',
    tip: 'The IRS Wash Sale rule disallows tax deductions if you purchase a "substantially identical" security within 30 days BEFORE or 30 days AFTER realizing a capital loss.',
    usage: [
      'Enter original purchase price and shares sold at a loss.',
      'Enter actual sale price per share realizing capital loss.',
      'Select whether replacement shares were purchased within the 61-day wash sale window.',
    ],
    method: [
      'Realized Loss = Shares * (Sale_Price - Original_Cost_Basis).',
      'If Wash Sale: Disallowed_Loss = Realized_Loss.',
      'Adjusted Replacement Basis = Replacement_Purchase_Price + (Disallowed_Loss / Shares).',
      'Tax Savings Shield = Allowed_Loss * Marginal_Tax_Bracket %.',
    ],
    fields: [
      n('sharesCount', 'Number of Shares Sold', 500, 1, 100000, 50),
      n('originalBasisPerShare', 'Original Cost Basis per Share ($)', 140.0, 1.0, 10000.0, 1.0),
      n('salePricePerShare', 'Sale Execution Price ($)', 95.0, 1.0, 10000.0, 1.0),
      sel('repurchaseWindow', 'Replacement Share Purchase Timing', [
        'No Repurchase (Valid Clean Tax-Loss Harvest)',
        'Repurchased within 30 days (IRS Wash Sale Triggered)',
        'Swapped for Correlated ETF / Non-Identical Index',
      ]),
      n('replacementPricePerShare', 'Replacement Share Price ($)', 97.0, 1.0, 10000.0, 1.0),
      n('marginalTaxBracketPct', 'Marginal Capital Gains Tax Rate (%)', 24.0, 0.0, 50.0, 1.0),
    ],
    compute: (v) => {
      const shares = asNum(v, 'sharesCount', 500)
      const costBasis = asNum(v, 'originalBasisPerShare', 140.0)
      const salePrice = asNum(v, 'salePricePerShare', 95.0)
      const windowStr = asSel(v, 'repurchaseWindow', 'No Repurchase')
      const repPrice = asNum(v, 'replacementPricePerShare', 97.0)
      const taxRate = asNum(v, 'marginalTaxBracketPct', 24.0) / 100

      const lossPerShare = Math.max(0, costBasis - salePrice)
      const totalRealizedLoss = shares * lossPerShare

      const isWashSale = windowStr.includes('Wash Sale Triggered')
      const isCorrelatedSwap = windowStr.includes('Correlated ETF')

      const allowedLoss = isWashSale ? 0 : totalRealizedLoss
      const disallowedLoss = isWashSale ? totalRealizedLoss : 0
      const immediateTaxShield = allowedLoss * taxRate

      const adjustedReplacementBasisPerShare = isWashSale ? repPrice + lossPerShare : repPrice

      const tone: 'good' | 'warn' | 'bad' = isWashSale ? 'warn' : 'good'

      return [
        res('Realized Capital Loss', fmtMoney(totalRealizedLoss), 'neutral', `$${lossPerShare.toFixed(2)} loss per share across ${shares} shares`),
        res('Disallowed Wash Sale Loss', fmtMoney(disallowedLoss), isWashSale ? 'warn' : 'good', isWashSale ? 'Added to basis of replacement shares' : 'Zero wash sale disallowance'),
        res('Current Year Tax Deduction Allowed', fmtMoney(allowedLoss), tone, isWashSale ? 'Disallowed by IRS Section 1091 (Wash Sale triggered)' : isCorrelatedSwap ? 'Fully allowable via correlated proxy asset' : 'Fully allowable capital loss'),
        res('Immediate Net Tax Shield Savings', fmtMoney(immediateTaxShield), tone, `@ ${(taxRate * 100).toFixed(0)}% marginal capital gains bracket`),
        res('Adjusted Replacement Cost Basis', `$${adjustedReplacementBasisPerShare.toFixed(2)} / share`, 'neutral', isWashSale ? `Original purchase $${repPrice.toFixed(2)} + $${lossPerShare.toFixed(2)} deferred loss added to basis` : 'No adjustment required'),
        pctres('Tax-Loss Harvesting Efficiency', isWashSale ? '0% Disallowed (Deferred)' : '100% Active Tax Offset', isWashSale ? 0 : 100, tone),
      ]
    },
  },
]
