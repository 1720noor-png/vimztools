export const PERCENTAGE_MODES = {
  of: ['What is X% of Y?', 'Percent (X)', 'Number (Y)'],
  is: ['X is what % of Y?', 'X', 'Y'],
  chg: ['Percent change from X to Y', 'From (X)', 'To (Y)']
}

/**
 * Percentage Calculator Engine
 * Handles 3 core calculation modes:
 * - 'of': What is X% of Y? => (X / 100) * Y
 * - 'is': X is what % of Y? => (X / Y) * 100
 * - 'chg': Percentage change from X to Y => ((Y - X) / X) * 100
 *
 * @param {Object} params
 * @param {'of'|'is'|'chg'} [params.mode='of'] - Calculation mode
 * @param {number|string} params.a - First operand (X)
 * @param {number|string} params.b - Second operand (Y)
 * @returns {Object} Calculated percentage result
 */
export function calculatePercentage({
  mode = 'of',
  a,
  b
}) {
  if (
    a === undefined ||
    a === '' ||
    b === undefined ||
    b === ''
  ) {
    throw new Error('Enter both numbers.')
  }

  const x = parseFloat(a)
  const y = parseFloat(b)

  if (Number.isNaN(x) || Number.isNaN(y)) {
    throw new Error('Enter both numbers.')
  }

  if (mode === 'is' && y === 0) {
    throw new Error('That calculation would divide by zero. Change the number.')
  }

  if (mode === 'chg' && x === 0) {
    throw new Error('That calculation would divide by zero. Change the number.')
  }

  let rawResult
  if (mode === 'of') {
    rawResult = (x / 100) * y
  } else if (mode === 'is') {
    rawResult = (x / y) * 100
  } else if (mode === 'chg') {
    rawResult = ((y - x) / x) * 100
  } else {
    throw new Error(`Unknown mode: "${mode}". Allowed modes are 'of', 'is', 'chg'.`)
  }

  const rounded = Number((+rawResult.toFixed(4)))
  const formatted = String(+rawResult.toFixed(4)) + (mode === 'of' ? '' : '%')

  return {
    mode,
    x,
    y,
    result: rounded,
    formatted,
    summary: `Result: ${formatted}`
  }
}
