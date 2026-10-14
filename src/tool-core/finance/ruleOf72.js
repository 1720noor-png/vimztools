/**
 * Rule of 72 Doubling Time Calculator
 * Estimates and calculates exact time required for an investment to double at a constant annual rate.
 *
 * Blueprint Architecture:
 * - Pure, deterministic calculation function
 * - Zero React/DOM dependencies
 * - Safe for AI tool-calling (L2 background execution)
 *
 * @param {Object} params
 * @param {number|string} params.rate - Annual interest or return rate (%)
 * @returns {Object} Calculated metrics and human-readable summary
 */
export function calculateRuleOf72({ rate }) {
  const numericRate = typeof rate === 'string' ? parseFloat(rate) : Number(rate)

  if (isNaN(numericRate) || numericRate <= 0) {
    throw new Error('Enter a valid positive return rate.')
  }

  const approxYears = 72 / numericRate
  const exactYears = Math.log(2) / Math.log(1 + numericRate / 100)

  return {
    rate: numericRate,
    approxYears,
    exactYears,
    formattedApproxYears: approxYears.toFixed(1),
    formattedExactYears: exactYears.toFixed(2),
    summary: `Doubles in approx. ${approxYears.toFixed(1)} years (Exact: ${exactYears.toFixed(2)} years)`,
    copyText: `At ${numericRate}% return, money doubles in approx ${approxYears.toFixed(1)} years.`
  }
}
