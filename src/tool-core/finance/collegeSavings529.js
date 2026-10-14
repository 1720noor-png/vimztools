/**
 * 529 College Savings Plan Calculator
 * Projects growth of education savings fund until child turns 18 for higher education.
 *
 * @param {Object} params
 * @param {number|string} params.childAge - Current age of child (must be < 18)
 * @param {number|string} [params.currentSaved=0] - Current balance already saved ($)
 * @param {number|string} [params.monthlyContrib=0] - Monthly recurring contribution ($)
 * @param {number|string} [params.returnRate=6.5] - Expected annual return rate (%)
 * @returns {Object} Comprehensive college fund projection
 */
export function calculateCollegeSavings529({
  childAge,
  currentSaved = 0,
  monthlyContrib = 0,
  returnRate = 6.5
}) {
  const age = typeof childAge === 'string' ? parseFloat(childAge) : Number(childAge)
  const saved = currentSaved !== undefined && currentSaved !== '' ? (typeof currentSaved === 'string' ? parseFloat(currentSaved) : Number(currentSaved)) : 0
  const m = monthlyContrib !== undefined && monthlyContrib !== '' ? (typeof monthlyContrib === 'string' ? parseFloat(monthlyContrib) : Number(monthlyContrib)) : 0
  const annualReturn = returnRate !== undefined && returnRate !== '' ? (typeof returnRate === 'string' ? parseFloat(returnRate) : Number(returnRate)) : 6.5
  const r = annualReturn / 100 / 12

  if (isNaN(age) || isNaN(saved) || isNaN(m) || isNaN(annualReturn) || age >= 18 || age < 0 || saved < 0 || m < 0 || annualReturn < 0) {
    throw new Error('Enter valid age (< 18, >= 0), positive savings, and return rate.')
  }

  const yearsToCollege = 18 - age
  const monthsToCollege = Math.round(yearsToCollege * 12)
  let total = saved
  let totalContributed = saved

  for (let i = 0; i < monthsToCollege; i++) {
    total = (total + m) * (1 + r)
    totalContributed += m
  }

  const totalGrowth = total - totalContributed

  return {
    childAge: age,
    currentSaved: saved,
    monthlyContrib: m,
    returnRate: annualReturn,
    yearsToCollege,
    monthsToCollege,
    estimatedFund: total,
    totalContributed,
    totalGrowth,
    formattedEstimatedFund: `$${Math.round(total).toLocaleString('en-US')}`,
    formattedTotalContributed: `$${Math.round(totalContributed).toLocaleString('en-US')}`,
    formattedTotalGrowth: `$${Math.round(totalGrowth).toLocaleString('en-US')}`,
    summary: `Est. Fund at Age 18: $${Math.round(total).toLocaleString('en-US')} (${yearsToCollege} years of saving)`,
    copyText: `Est 529 Balance at Age 18: $${Math.round(total)} for child age ${age}.`
  }
}
