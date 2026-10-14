/**
 * Pure Standard Deviation and Variance Calculator Engine
 * Calculates Mean, Count, Sample/Population Variance and Standard Deviation.
 * Strictly decoupled from React and UI.
 *
 * @param {Object} params
 * @param {string|Array<number|string>} params.numbers - Array or comma/space-separated string of numbers
 * @returns {Object} Comprehensive statistical metrics
 */
export function calculateStandardDeviation({ numbers } = {}) {
  let nums = []

  if (Array.isArray(numbers)) {
    nums = numbers.map(Number).filter(n => typeof n === 'number' && !isNaN(n))
  } else if (typeof numbers === 'string') {
    nums = numbers
      .split(/[,\s]+/)
      .map(n => n.trim())
      .filter(Boolean)
      .map(Number)
      .filter(n => !isNaN(n))
  }

  if (nums.length < 2) {
    throw new Error('Enter at least 2 valid numbers to calculate standard deviation.')
  }

  const count = nums.length
  const sum = nums.reduce((s, v) => s + v, 0)
  const mean = sum / count

  const sumOfSquares = nums.reduce((s, v) => s + Math.pow(v - mean, 2), 0)
  const variancePop = sumOfSquares / count
  const varianceSample = sumOfSquares / (count - 1)

  const stdDevPop = Math.sqrt(variancePop)
  const stdDevSample = Math.sqrt(varianceSample)

  return {
    count,
    sum,
    mean,
    variancePop,
    varianceSample,
    stdDevPop,
    stdDevSample,
    // Backwards compatibility aliases
    sd: stdDevPop.toFixed(4),
    variance: variancePop.toFixed(4),
    // Formatted strings
    meanFormatted: mean.toFixed(4),
    stdDevSampleFormatted: stdDevSample.toFixed(4),
    stdDevPopFormatted: stdDevPop.toFixed(4),
    varianceSampleFormatted: varianceSample.toFixed(4),
    variancePopFormatted: variancePop.toFixed(4),
    val: `Mean: ${mean.toFixed(2)} | Sample Std Dev: ${stdDevSample.toFixed(2)} | Pop. Std Dev: ${stdDevPop.toFixed(2)} | Sample Variance: ${varianceSample.toFixed(2)}`,
    copyText: `Mean: ${mean.toFixed(2)}, Sample SD: ${stdDevSample.toFixed(2)}, Pop SD: ${stdDevPop.toFixed(2)}`,
    summary: `Mean = ${mean.toFixed(2)}, Sample SD = ${stdDevSample.toFixed(2)}, Pop SD = ${stdDevPop.toFixed(2)}`
  }
}
