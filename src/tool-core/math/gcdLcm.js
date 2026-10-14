/**
 * Pure GCD (Greatest Common Divisor) and LCM (Least Common Multiple) Engine
 * Strictly decoupled from React and UI.
 *
 * @param {Object} params
 * @param {number|string} [params.a] - First number
 * @param {number|string} [params.b] - Second number
 * @param {Array<number|string>} [params.numbers] - Optional array of numbers
 * @returns {Object} Calculated GCD and LCM
 */
export function calculateGcdLcm(params = {}) {
  let list = []

  if (Array.isArray(params.numbers) && params.numbers.length > 0) {
    list = params.numbers
  } else if (params.a !== undefined && params.b !== undefined) {
    list = [params.a, params.b]
  } else if (typeof params === 'object' && Object.keys(params).length >= 2) {
    const vals = Object.values(params)
    list = vals
  }

  const nums = list
    .map(v => Math.abs(parseInt(v, 10)))
    .filter(v => !isNaN(v) && v > 0)

  if (nums.length < 2) {
    throw new Error('Please enter at least two positive integers.')
  }

  const gcdTwo = (x, y) => (y === 0 ? x : gcdTwo(y, x % y))
  const lcmTwo = (x, y) => (x * y) / gcdTwo(x, y)

  const gcd = nums.reduce((acc, curr) => gcdTwo(acc, curr))
  const lcm = nums.reduce((acc, curr) => lcmTwo(acc, curr))

  const numsStr = nums.join(', ')

  return {
    gcd,
    lcm,
    numbers: nums,
    a: nums[0],
    b: nums[1],
    val: `GCD (${numsStr}): ${gcd} | LCM (${numsStr}): ${lcm}`,
    copyText: `GCD: ${gcd}, LCM: ${lcm}`,
    summary: `GCD = ${gcd}, LCM = ${lcm}`
  }
}
