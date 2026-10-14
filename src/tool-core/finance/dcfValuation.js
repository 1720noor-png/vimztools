/**
 * Discounted Cash Flow (DCF) Valuation Engine
 * Projects 5-year future cash flows, discounts them at WACC, and applies the Gordon Growth Model for terminal value.
 *
 * @param {Object} params
 * @param {number|string} params.fcf - Current annual free cash flow ($)
 * @param {number|string} params.growthRate - Expected 5-year annual growth rate (%)
 * @param {number|string} [params.termRate=2.5] - Perpetual terminal growth rate (%)
 * @param {number|string} params.wacc - Weighted Average Cost of Capital / Discount rate (%)
 * @param {number|string} params.shares - Number of shares outstanding
 * @returns {Object} Comprehensive equity valuation
 */
export function calculateDcfValuation({
  fcf,
  growthRate,
  termRate = 2.5,
  wacc,
  shares
}) {
  const f = typeof fcf === 'string' ? parseFloat(fcf) : Number(fcf)
  const g = (typeof growthRate === 'string' ? parseFloat(growthRate) : Number(growthRate)) / 100
  const t = (typeof termRate === 'string' ? parseFloat(termRate) : Number(termRate)) / 100
  const r = (typeof wacc === 'string' ? parseFloat(wacc) : Number(wacc)) / 100
  const sh = typeof shares === 'string' ? parseFloat(shares) : Number(shares)

  if (isNaN(f) || isNaN(g) || isNaN(t) || isNaN(r) || isNaN(sh) || f <= 0 || sh <= 0) {
    throw new Error('Enter valid positive values.')
  }
  if (r <= t) {
    throw new Error('Discount rate (WACC) must be strictly greater than terminal growth rate.')
  }

  let pvSum = 0
  let cf = f
  const projectedCashFlows = []

  for (let i = 1; i <= 5; i++) {
    cf *= (1 + g)
    const discountedCf = cf / Math.pow(1 + r, i)
    pvSum += discountedCf
    projectedCashFlows.push({
      year: i,
      cashFlow: cf,
      discountedCashFlow: discountedCf
    })
  }

  const terminalVal = (cf * (1 + t)) / (r - t)
  const pvTerminal = terminalVal / Math.pow(1 + r, 5)
  const enterpriseVal = pvSum + pvTerminal
  const perShare = enterpriseVal / sh

  return {
    fcf: f,
    growthRatePct: g * 100,
    termRatePct: t * 100,
    waccPct: r * 100,
    shares: sh,
    pvSum,
    terminalVal,
    pvTerminal,
    enterpriseVal,
    perShare,
    projectedCashFlows,
    formattedPerShare: `$${perShare.toFixed(2)}`,
    formattedEnterpriseVal: `$${Math.round(enterpriseVal).toLocaleString('en-US')}`,
    summary: `Intrinsic Value: $${perShare.toFixed(2)} / share (Total Enterprise Value: $${Math.round(enterpriseVal).toLocaleString('en-US')})`,
    copyText: `Fair Value: $${perShare.toFixed(2)}/share, EV: $${Math.round(enterpriseVal)}`
  }
}
