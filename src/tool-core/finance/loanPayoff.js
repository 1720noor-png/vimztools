/**
 * Loan Payoff & Extra Payment Accelerator Calculator
 * Evaluates standard vs accelerated loan payoff schedules, computing time and interest saved.
 *
 * @param {Object} params
 * @param {number|string} params.balance - Current outstanding loan balance ($)
 * @param {number|string} params.rate - Annual interest rate (%)
 * @param {number|string} params.monthlyPayment - Standard monthly contractual payment ($)
 * @param {number|string} [params.extraPayment=0] - Additional monthly principal contribution ($)
 * @returns {Object} Comprehensive comparative payoff analysis
 */
export function calculateLoanPayoff({
  balance,
  rate,
  monthlyPayment,
  extraPayment = 0
}) {
  const B = typeof balance === 'string' ? parseFloat(balance) : Number(balance)
  const annualRate = typeof rate === 'string' ? parseFloat(rate) : Number(rate)
  const r = annualRate / 12 / 100
  const P = typeof monthlyPayment === 'string' ? parseFloat(monthlyPayment) : Number(monthlyPayment)
  const E = extraPayment !== undefined && extraPayment !== '' ? (typeof extraPayment === 'string' ? (parseFloat(extraPayment) || 0) : Number(extraPayment)) : 0

  if (isNaN(B) || B <= 0) {
    throw new Error('Enter a valid positive loan balance.')
  }
  if (isNaN(annualRate) || annualRate < 0) {
    throw new Error('Interest rate cannot be negative.')
  }
  if (isNaN(P) || P <= 0) {
    throw new Error('Enter a valid positive monthly payment.')
  }
  if (isNaN(E) || E < 0) {
    throw new Error('Extra payment cannot be negative.')
  }

  function simulatePayoff(extraP) {
    const monthlyTotal = P + extraP
    if (monthlyTotal <= B * r) {
      return { months: Infinity, totalInterest: Infinity }
    }
    let cur = B
    let months = 0
    let totalInt = 0

    while (cur > 0 && months < 600) {
      const interest = cur * r
      totalInt += interest
      const principal = monthlyTotal - interest
      cur -= principal
      months++
    }
    return { months, totalInterest: totalInt }
  }

  const standard = simulatePayoff(0)
  const accelerated = simulatePayoff(E)

  const isInvalid = accelerated.months === Infinity
  if (isInvalid) {
    throw new Error(`Monthly payment must be greater than monthly interest charges ($${Math.round(B * r)}/mo).`)
  }

  const monthsSaved = standard.months !== Infinity ? Math.max(0, standard.months - accelerated.months) : 0
  const interestSaved = standard.totalInterest !== Infinity ? Math.max(0, standard.totalInterest - accelerated.totalInterest) : 0

  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US')
  const fmtMonths = (m) => {
    if (m === Infinity) return 'Never (payment too low to cover interest)'
    const y = Math.floor(m / 12)
    const rem = m % 12
    return `${m} months (${y} yrs ${rem} mos)`
  }

  const reportText = `Loan Payoff & Extra Payment Analysis
------------------------------------------------
Current Loan Balance: ${fmt(B)}
Interest Rate: ${annualRate}%
Standard Monthly Payment: ${fmt(P)}
Extra Monthly Payment: ${fmt(E)}

Standard Payoff: ${fmtMonths(standard.months)}
Accelerated Payoff: ${fmtMonths(accelerated.months)}

Time Saved: ${monthsSaved} months (${(monthsSaved / 12).toFixed(1)} years)
Interest Saved: ${fmt(interestSaved)}`

  return {
    balance: B,
    rate: annualRate,
    monthlyPayment: P,
    extraPayment: E,
    standard,
    accelerated,
    monthsSaved,
    interestSaved,
    formattedMonthsSaved: `${monthsSaved} months (${(monthsSaved / 12).toFixed(1)} yrs)`,
    formattedInterestSaved: fmt(interestSaved),
    reportText,
    summary: `Accelerated Payoff: ${fmtMonths(accelerated.months)} | Time Saved: ${monthsSaved} mos | Interest Saved: ${fmt(interestSaved)}`
  }
}
