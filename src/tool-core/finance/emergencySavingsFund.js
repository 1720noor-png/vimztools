/**
 * Emergency Savings Fund Target Calculator
 * Calculates monthly essential baseline living costs and target emergency reserve across safety buffer months.
 *
 * @param {Object} params
 * @param {number|string} [params.housing=0] - Monthly rent or mortgage ($)
 * @param {number|string} [params.utilities=0] - Utilities and bills ($)
 * @param {number|string} [params.food=0] - Food, groceries, and dining essentials ($)
 * @param {number|string} [params.other=0] - Insurance, loans, other essentials ($)
 * @param {number|string} [params.months=6] - Desired safety buffer in months (typically 3 to 12)
 * @returns {Object} Calculated metrics
 */
export function calculateEmergencySavingsFund({
  housing = 0,
  utilities = 0,
  food = 0,
  other = 0,
  months = 6
}) {
  const h = housing !== undefined && housing !== '' ? (typeof housing === 'string' ? (parseFloat(housing) || 0) : Number(housing)) : 0
  const u = utilities !== undefined && utilities !== '' ? (typeof utilities === 'string' ? (parseFloat(utilities) || 0) : Number(utilities)) : 0
  const f = food !== undefined && food !== '' ? (typeof food === 'string' ? (parseFloat(food) || 0) : Number(food)) : 0
  const o = other !== undefined && other !== '' ? (typeof other === 'string' ? (parseFloat(other) || 0) : Number(other)) : 0
  const m = months !== undefined && months !== '' ? (typeof months === 'string' ? (parseFloat(months) || 6) : Number(months)) : 6

  if (isNaN(h) || h < 0 || isNaN(u) || u < 0 || isNaN(f) || f < 0 || isNaN(o) || o < 0) {
    throw new Error('Expense values cannot be negative.')
  }
  if (isNaN(m) || m <= 0) {
    throw new Error('Safety buffer months must be greater than zero.')
  }

  const monthlyEssential = h + u + f + o
  if (monthlyEssential <= 0) {
    throw new Error('At least one essential monthly expense must be greater than zero.')
  }

  const totalTarget = monthlyEssential * m

  return {
    housing: h,
    utilities: u,
    food: f,
    other: o,
    months: m,
    monthlyEssential,
    totalTarget,
    formattedMonthlyEssential: `$${Math.round(monthlyEssential).toLocaleString('en-US')}`,
    formattedTotalTarget: `$${Math.round(totalTarget).toLocaleString('en-US')}`,
    summary: `Target Emergency Fund: $${Math.round(totalTarget).toLocaleString('en-US')} (${m} months of $${Math.round(monthlyEssential).toLocaleString('en-US')}/mo essential living cost)`,
    copyText: `Emergency Fund Target: $${Math.round(totalTarget).toLocaleString('en-US')} (${m} months @ $${Math.round(monthlyEssential).toLocaleString('en-US')}/mo)`
  }
}
