import {
  asNum,
  n,
  pctres,
  res,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'DeFi & AMM Impermanent Loss'

export const MOD08_SPECS: FintechSpec[] = [
  {
    id: 'amm-impermanent-loss-lp-yield-sizer',
    name: 'AMM Constant Product (x*y=k) Impermanent Loss Sizer',
    subject: SUBJECT,
    blurb: 'Calculate exact impermanent loss percentage and net dollar P&L when providing liquidity to 50/50 automated market maker pools compared to simply holding tokens (HODL).',
    tip: 'A 2x price increase of one asset relative to the other results in 5.72% impermanent loss. A 5x price divergence results in 25.5% impermanent loss.',
    usage: [
      'Enter initial total liquidity deposited in USD.',
      'Enter percentage price change of Token A relative to Token B (e.g. +100% for 2x, -50% for 0.5x).',
      'Enter estimated earned trading fee APY (%).',
    ],
    method: [
      'Price Ratio k = 1 + Price_Change_Pct / 100.',
      'Impermanent Loss = (2 * sqrt(k) / (1 + k)) - 1.',
      'Net LP Gain = (HODL_Value * (1 + IL)) + Earned_Fee_Yield - Initial_Deposit.',
    ],
    fields: [
      n('initialDepositUsd', 'Initial Liquidity Deposited ($)', 10000, 100, 10000000, 500),
      n('priceChangeTokenAPct', 'Token A Price Change Relative to B (%)', 100.0, -99.0, 1000.0, 5.0),
      n('tradingFeeApyPct', 'Trading Fee APR Earned by Pool (%)', 18.0, 0.0, 200.0, 1.0),
      n('holdingPeriodDays', 'Liquidity Provision Duration (Days)', 90, 1, 365, 5),
    ],
    compute: (v) => {
      const deposit = asNum(v, 'initialDepositUsd', 10000)
      const pctChange = asNum(v, 'priceChangeTokenAPct', 100.0)
      const apy = asNum(v, 'tradingFeeApyPct', 18.0) / 100
      const days = asNum(v, 'holdingPeriodDays', 90)

      const r = Math.max(0.01, 1 + pctChange / 100)
      const sqrtR = Math.sqrt(r)
      const ilRatio = (2 * sqrtR) / (1 + r) - 1 // Always <= 0
      const ilPct = Math.abs(ilRatio * 100)

      // 50/50 split at deposit
      const hodlValue = (deposit / 2) + (deposit / 2) * r
      const lpPoolValue = hodlValue * (1 + ilRatio)
      const feeEarned = deposit * (apy * (days / 365))
      const totalLpValueWithFees = lpPoolValue + feeEarned

      const netDeltaVsHodl = totalLpValueWithFees - hodlValue
      const isProfitableVsHodl = netDeltaVsHodl > 0

      return [
        pctres('Impermanent Loss (IL)', `${ilPct.toFixed(2)}% Drag`, Math.min(100, Math.round(ilPct)), ilPct > 15 ? 'warn' : 'good', `Opportunity loss compared to HODL`),
        res('Current AMM Pool Value', `$${lpPoolValue.toFixed(2)}`, 'neutral', `Before fee yield distributions`),
        res('Accrued Trading Fees', `$${feeEarned.toFixed(2)}`, 'good', `@ ${(apy * 100).toFixed(1)}% APY over ${days} days`),
        res('Net Delta vs 100% HODL', `${netDeltaVsHodl >= 0 ? '+$' : '-$'}${Math.abs(netDeltaVsHodl).toFixed(2)}`, isProfitableVsHodl ? 'good' : 'warn', isProfitableVsHodl ? 'Trading fees successfully offset impermanent loss' : 'Impermanent loss exceeded earned swap fees'),
      ]
    },
  },
]
