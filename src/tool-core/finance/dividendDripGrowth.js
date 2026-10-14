/**
 * Dividend Yield & DRIP Growth Calculator
 * Computes dividend yield, annual dividend income, and cumulative reinvested portfolio value across years.
 *
 * @param {Object} params
 * @param {number|string} params.shares - Number of shares owned
 * @param {number|string} params.price - Current share price ($)
 * @param {number|string} params.divPerShare - Annual dividend per share ($)
 * @param {number|string} [params.years=10] - Reinvestment time horizon in years
 * @returns {Object} Comprehensive DRIP growth projection
 */
export function calculateDividendDripGrowth({
  shares,
  price,
  divPerShare,
  years = 10
}) {
  const s = typeof shares === 'string' ? parseFloat(shares) : Number(shares)
  const p = typeof price === 'string' ? parseFloat(price) : Number(price)
  const d = typeof divPerShare === 'string' ? parseFloat(divPerShare) : Number(divPerShare)
  const y = years !== undefined && years !== '' ? (typeof years === 'string' ? parseFloat(years) : Number(years)) : 10

  if (isNaN(s) || isNaN(p) || isNaN(d) || isNaN(y) || s <= 0 || p <= 0 || d < 0 || y <= 0) {
    throw new Error('Enter valid positive values.')
  }

  const initialVal = s * p
  const yieldPct = (d / p) * 100
  let curShares = s

  for (let i = 0; i < y; i++) {
    const annualDiv = curShares * d
    curShares += annualDiv / p
  }

  const finalVal = curShares * p
  const annualDivIncome = s * d

  return {
    shares: s,
    price: p,
    divPerShare: d,
    years: y,
    initialVal,
    yieldPct,
    finalShares: curShares,
    finalVal,
    annualDivIncome,
    formattedYield: `${yieldPct.toFixed(2)}%`,
    formattedFinalVal: `$${Math.round(finalVal).toLocaleString('en-US')}`,
    summary: `Dividend Yield: ${yieldPct.toFixed(2)}% | Year ${y} Value: $${Math.round(finalVal).toLocaleString('en-US')} (${Math.round(curShares)} shares)`,
    copyText: `Yield: ${yieldPct.toFixed(2)}%, Annual Div: $${annualDivIncome.toFixed(2)}. Year ${y} DRIP Value: $${Math.round(finalVal)}`
  }
}
