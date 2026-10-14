/**
 * Simple Interest Return Calculator
 * Computes simple interest earned and final total.
 * Formula: I = (P * r * t) / 100
 *
 * @param {Object} params
 * @param {number|string} params.principal - Initial amount ($)
 * @param {number|string} params.rate - Annual interest rate (%)
 * @param {number|string} params.years - Time period in years
 * @returns {Object} Calculated metrics
 */
export function calculateSimpleInterest({ principal, rate, years }) {
  const p = typeof principal === 'string' ? parseFloat(principal) : Number(principal)
  const r = typeof rate === 'string' ? parseFloat(rate) : Number(rate)
  const t = typeof years === 'string' ? parseFloat(years) : Number(years)

  if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || r < 0 || t <= 0) {
    throw new Error('Enter valid positive values.')
  }

  const interest = (p * r * t) / 100
  const total = p + interest

  return {
    principal: p,
    rate: r,
    years: t,
    interest,
    total,
    formattedInterest: interest.toFixed(2),
    formattedTotal: total.toFixed(2),
    summary: `Total Interest: $${interest.toFixed(2)} | Final Total: $${total.toFixed(2)}`,
    copyText: `Principal: $${p}, Interest: $${interest.toFixed(2)}, Total: $${total.toFixed(2)}`
  }
}
