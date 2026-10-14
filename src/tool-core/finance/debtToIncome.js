/**
 * Debt-to-Income (DTI) Ratio Calculator
 * Evaluates financial borrowing health and lender approval risk based on gross income and recurring debt obligations.
 *
 * @param {Object} params
 * @param {number|string} params.income - Gross monthly income ($)
 * @param {number|string} [params.housing=0] - Monthly housing debt, mortgage, or rent ($)
 * @param {number|string} [params.auto=0] - Monthly car or vehicle payments ($)
 * @param {number|string} [params.otherDebt=0] - Student loans, credit card minimums, other debt ($)
 * @returns {Object} Comprehensive DTI analysis
 */
export function calculateDebtToIncome({
  income,
  housing = 0,
  auto = 0,
  otherDebt = 0
}) {
  const inc = typeof income === 'string' ? parseFloat(income) : Number(income)
  const h = housing !== undefined && housing !== '' ? (typeof housing === 'string' ? (parseFloat(housing) || 0) : Number(housing)) : 0
  const a = auto !== undefined && auto !== '' ? (typeof auto === 'string' ? (parseFloat(auto) || 0) : Number(auto)) : 0
  const o = otherDebt !== undefined && otherDebt !== '' ? (typeof otherDebt === 'string' ? (parseFloat(otherDebt) || 0) : Number(otherDebt)) : 0

  if (isNaN(inc) || inc <= 0) {
    throw new Error('Enter valid gross monthly income.')
  }
  if (isNaN(h) || h < 0 || isNaN(a) || a < 0 || isNaN(o) || o < 0) {
    throw new Error('Debt amounts cannot be negative.')
  }

  const totalMonthlyDebt = h + a + o
  const dti = (totalMonthlyDebt / inc) * 100

  let status = ''
  let riskLevel = ''
  if (dti <= 36) {
    status = 'Excellent DTI'
    riskLevel = 'low'
  } else if (dti <= 43) {
    status = 'Acceptable DTI for most lenders'
    riskLevel = 'moderate'
  } else {
    status = 'High DTI Risk (>43%)'
    riskLevel = 'high'
  }

  return {
    income: inc,
    housing: h,
    auto: a,
    otherDebt: o,
    totalMonthlyDebt,
    dti,
    formattedDti: dti.toFixed(1),
    status,
    riskLevel,
    summary: `DTI Ratio: ${dti.toFixed(1)}% ($${totalMonthlyDebt}/mo debt vs $${inc}/mo income) - ${status}`,
    copyText: `DTI Ratio: ${dti.toFixed(1)}% (${status})`
  }
}
