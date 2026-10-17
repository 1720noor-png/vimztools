import {
  asNum,
  asSel,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'Cross-Border Payments & FX Spread'

export const MOD20_SPECS: FintechSpec[] = [
  {
    id: 'cross-border-remittance-hidden-markup-sizer',
    name: 'Cross-Border Remittance & Hidden FX Markup Calculator',
    subject: SUBJECT,
    blurb: 'Expose total true transaction costs across international wire transfers by calculating hidden foreign exchange markup spreads and upfront correspondent banking fees.',
    tip: 'Traditional retail banks frequently advertise "$0 wire fee" while quietly embedding a 3% to 5% hidden markup spread above the true mid-market interbank exchange rate.',
    usage: [
      'Enter transfer sending amount in USD.',
      'Enter interbank true mid-market exchange rate (e.g. 83.25 INR, 18.15 MXN).',
      'Enter provider offered retail exchange rate and advertised flat transfer fee.',
    ],
    method: [
      'Hidden FX Markup % = ((Mid_Market_Rate - Provider_Rate) / Mid_Market_Rate) * 100.',
      'Hidden FX Cost ($) = Transfer_Amount * (Hidden_Markup_% / 100).',
      'Total True Transaction Fee = Flat_Fee + Hidden_FX_Cost.',
      'Receiver Net Amount = (Transfer_Amount - Flat_Fee) * Provider_Rate.',
    ],
    fields: [
      n('sendAmountUsd', 'Sending Amount ($)', 2500, 50, 1000000, 50),
      sel('corridorName', 'Remittance Corridor', [
        'USD to INR (India)',
        'USD to MXN (Mexico)',
        'USD to PHP (Philippines)',
        'USD to EUR (Eurozone)',
      ]),
      n('midMarketRate', 'Real Interbank Mid-Market Exchange Rate', 83.50, 0.5, 500.0, 0.01),
      n('offeredRetailRate', 'Provider Offered Exchange Rate', 81.25, 0.5, 500.0, 0.01),
      n('advertisedFlatFeeUsd', 'Advertised Transfer Fee ($)', 5.0, 0.0, 150.0, 1.0),
    ],
    compute: (v) => {
      const send = asNum(v, 'sendAmountUsd', 2500)
      const corridor = asSel(v, 'corridorName', 'USD to INR')
      const midRate = asNum(v, 'midMarketRate', 83.50)
      const retailRate = asNum(v, 'offeredRetailRate', 81.25)
      const flatFee = asNum(v, 'advertisedFlatFeeUsd', 5.0)

      const fxMarkupSpreadPct = Math.max(0, ((midRate - retailRate) / midRate) * 100)
      const hiddenFxDollarCost = send * (fxMarkupSpreadPct / 100)
      const totalTrueCost = flatFee + hiddenFxDollarCost
      const effectiveTotalFeePct = (totalTrueCost / send) * 100

      const receivedUnits = (send - flatFee) * retailRate
      const fairReceivedUnits = send * midRate
      const lostUnits = Math.max(0, fairReceivedUnits - receivedUnits)

      const isHighMarkup = effectiveTotalFeePct > 2.5
      const tone: 'good' | 'warn' | 'bad' = isHighMarkup ? 'warn' : 'good'

      const currencyCode = corridor.split('to ')[1]?.split(' ')[0] || 'Units'

      return [
        res('Total True Transaction Cost', fmtMoney(totalTrueCost), tone, `${fmtMoney(flatFee)} stated fee + ${fmtMoney(hiddenFxDollarCost)} hidden FX spread`),
        pctres('Effective Transaction Fee Drag', `${effectiveTotalFeePct.toFixed(2)}% Total Friction`, Math.min(100, Math.round(effectiveTotalFeePct * 10)), tone, isHighMarkup ? 'Excessive retail bank markup' : 'Near mid-market transparent pricing'),
        res('Hidden FX Markup Spread', `${fxMarkupSpreadPct.toFixed(2)}% Markup`, isHighMarkup ? 'warn' : 'good', `Mid-market ${midRate.toFixed(2)} vs Provider ${retailRate.toFixed(2)}`),
        res('Recipient Delivered Amount', `${fmtNum(Math.round(receivedUnits))} ${currencyCode}`, 'good', `Loss to intermediary spread: ${fmtNum(Math.round(lostUnits))} ${currencyCode}`),
      ]
    },
  },
]
