/**
 * Inflation-Adjusted (Real) Return Calculator
 * Computes purchasing power real rate of return using the Fisher equation.
 * Formula: Real Return = ((1 + nominal) / (1 + inflation) - 1) * 100
 *
 * @param {Object} params
 * @param {number|string} params.nominalReturn - Nominal annual investment return (%)
 * @param {number|string} params.inflationRate - Annual inflation rate (%)
 * @returns {Object} Real return rate metrics
 */
export function calculateInflationAdjustedReturn({
  nominalReturn,
  inflationRate
}) {
  const n = typeof nominalReturn === 'string' ? parseFloat(nominalReturn) : Number(nominalReturn)
  const i = typeof inflationRate === 'string' ? parseFloat(inflationRate) : Number(inflationRate)

  if (isNaN(n) || isNaN(i)) {
    throw new Error('Enter valid percentage rates.')
  }

  const nDec = n / 100
  const iDec = i / 100

  if (1 + iDec <= 0) {
    throw new Error('Inflation rate cannot be -100% or lower.')
  }

  const realReturn = ((1 + nDec) / (1 + iDec) - 1) * 100

  return {
    nominalReturn: n,
    inflationRate: i,
    realReturn,
    formattedRealReturn: `${realReturn.toFixed(2)}%`,
    summary: `Real Purchasing Power Return: ${realReturn.toFixed(2)}%`,
    copyText: `Nominal: ${n}%, Inflation: ${i}%, Real Return: ${realReturn.toFixed(2)}%`
  }
}
