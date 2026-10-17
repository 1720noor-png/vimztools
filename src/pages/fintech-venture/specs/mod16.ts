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

export const SUBJECT = 'Employee Stock Options & AMT Tax'

export const MOD16_SPECS: FintechSpec[] = [
  {
    id: 'iso-nso-stock-option-amt-tax-sizer',
    name: 'Incentive Stock Option (ISO) vs NSO & AMT Tax Sizer',
    subject: SUBJECT,
    blurb: 'Calculate exercise costs, Alternative Minimum Tax (AMT) preference spread exposure, ordinary income tax for NSOs, and net post-tax cash proceeds upon eventual startup exit.',
    tip: 'Exercising ISOs in private companies triggers AMT on the "spread" (409A Fair Market Value minus Strike Price) even though the underlying shares cannot be sold for liquid cash.',
    usage: [
      'Enter total number of stock options granted.',
      'Enter option grant strike price and current 409A Fair Market Value (FMV).',
      'Select option grant type (Incentive Stock Option ISO vs Non-Qualified NSO).',
    ],
    method: [
      'Total Exercise Cost = Options_Count * Strike_Price.',
      'Bargain Element (Spread) = Options_Count * (FMV - Strike_Price).',
      'AMT Tax Liability ISO = Bargain_Element * AMT_Rate (26% or 28%).',
      'NSO Ordinary Income Tax = Bargain_Element * Ordinary_Income_Tax_Bracket %.',
    ],
    fields: [
      n('optionsCount', 'Total Vested Options to Exercise', 25000, 100, 10000000, 500),
      n('strikePricePerShare', 'Grant Strike Price ($/share)', 1.25, 0.01, 1000.0, 0.05),
      n('currentFmvPerShare', 'Current 409A Fair Market Value ($/share)', 8.50, 0.01, 5000.0, 0.25),
      sel('optionType', 'Option Plan Structure', [
        'Incentive Stock Options (ISO - Triggers AMT Spread)',
        'Non-Qualified Stock Options (NSO - Triggers W-2 Ordinary Income)',
      ]),
      n('ordinaryIncomeRatePct', 'Marginal Income Tax Rate (%)', 35.0, 10.0, 55.0, 1.0),
    ],
    compute: (v) => {
      const count = asNum(v, 'optionsCount', 25000)
      const strike = asNum(v, 'strikePricePerShare', 1.25)
      const fmv = asNum(v, 'currentFmvPerShare', 8.50)
      const typeStr = asSel(v, 'optionType', 'ISO')
      const ordinaryRate = asNum(v, 'ordinaryIncomeRatePct', 35.0) / 100

      const exerciseCost = count * strike
      const spreadPerShare = Math.max(0, fmv - strike)
      const totalSpread = count * spreadPerShare

      const isIso = typeStr.includes('ISO')
      const amtRate = 0.28 // Standard AMT bracket
      const taxDueAtExercise = isIso ? totalSpread * amtRate : totalSpread * ordinaryRate

      const totalCashOutOfPocket = exerciseCost + taxDueAtExercise
      const currentGrossValue = count * fmv

      return [
        res('Out-of-Pocket Exercise Cost', fmtMoney(exerciseCost), 'neutral', `$${strike.toFixed(2)} / share across ${count} shares`),
        res(`${isIso ? 'Estimated AMT Preference Tax' : 'W-2 Withholding Tax Due'}`, fmtMoney(taxDueAtExercise), 'warn', isIso ? `28% AMT rate on ${fmtMoney(totalSpread)} paper spread` : `${(ordinaryRate * 100).toFixed(0)}% ordinary tax on spread`),
        res('Total Cash Required to Exercise', fmtMoney(totalCashOutOfPocket), 'warn', 'Exercise price + immediate tax obligation'),
        res('Current Illiquid Equity Value', fmtMoney(currentGrossValue), 'good', `At $${fmv.toFixed(2)} current 409A valuation`),
        pctres('Spread Gain Ratio', `${Math.round((totalSpread / currentGrossValue) * 100)}% Embedded Gain`, Math.round((totalSpread / currentGrossValue) * 100), 'good'),
      ]
    },
  },
]
