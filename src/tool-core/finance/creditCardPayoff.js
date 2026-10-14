/**
 * Credit Card Fixed Payment Payoff Calculator
 * Calculates payoff timeline in months/years and total interest paid based on balance, APR, and fixed monthly payment.
 * Formula: n = -ln(1 - (b * r) / p) / ln(1 + r)
 *
 * @param {Object} params
 * @param {number|string} params.balance - Outstanding credit card balance ($)
 * @param {number|string} params.apr - Annual Percentage Rate (%)
 * @param {number|string} params.fixedPayment - Fixed monthly payment amount ($)
 * @returns {Object} Comprehensive debt payoff schedule metrics
 */
export function calculateCreditCardPayoff({
  balance,
  apr,
  fixedPayment
}) {
  const b = typeof balance === 'string' ? parseFloat(balance) : Number(balance)
  const annualApr = typeof apr === 'string' ? parseFloat(apr) : Number(apr)
  const r = annualApr / 100 / 12
  const p = typeof fixedPayment === 'string' ? parseFloat(fixedPayment) : Number(fixedPayment)

  if (isNaN(b) || isNaN(annualApr) || isNaN(p) || b <= 0 || annualApr <= 0 || p <= 0) {
    throw new Error('Enter valid positive card balance, APR, and payment.')
  }

  const minPaymentNeeded = b * r
  if (p <= minPaymentNeeded) {
    throw new Error(`Monthly payment must be greater than monthly interest ($${minPaymentNeeded.toFixed(2)}).`)
  }

  const months = Math.ceil(-Math.log(1 - (b * r) / p) / Math.log(1 + r))
  const totalPaid = months * p
  const interest = totalPaid - b
  const years = (months / 12).toFixed(1)

  return {
    balance: b,
    apr: annualApr,
    monthlyRate: r,
    fixedPayment: p,
    minMonthlyInterest: minPaymentNeeded,
    months,
    years: parseFloat(years),
    totalPaid,
    totalInterest: interest,
    formattedInterest: `$${interest.toFixed(2)}`,
    formattedTotalPaid: `$${totalPaid.toFixed(2)}`,
    summary: `Paid off in ${months} months (${years} yrs) | Total Interest Paid: $${interest.toFixed(2)}`,
    copyText: `Balance: $${b}, Payment: $${p}/mo. Paid in ${months} mos. Interest: $${interest.toFixed(2)}`
  }
}
