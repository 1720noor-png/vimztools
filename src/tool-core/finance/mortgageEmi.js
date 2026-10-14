/**
 * Mortgage & Loan EMI Calculator
 * Calculates monthly EMI, property tax/insurance, total interest, and total payable amount.
 * Formula: EMI = (P * r * (1 + r)^n) / ((1 + r)^n - 1)
 *
 * @param {Object} params
 * @param {number|string} params.amount - Principal loan amount ($)
 * @param {number|string} params.rate - Annual interest rate (%)
 * @param {number|string} [params.tenureYears=30] - Loan term in years
 * @param {number|string} [params.extraTax=0] - Monthly property tax, insurance, or escrow ($)
 * @returns {Object} Comprehensive loan breakdown
 */
export function calculateMortgageEmi({
  amount,
  rate,
  tenureYears = 30,
  extraTax = 0
}) {
  const P = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
  const annualRate = typeof rate === 'string' ? parseFloat(rate) : Number(rate)
  const years = tenureYears !== undefined && tenureYears !== '' ? (typeof tenureYears === 'string' ? parseFloat(tenureYears) : Number(tenureYears)) : 30
  const tax = extraTax !== undefined && extraTax !== '' ? (typeof extraTax === 'string' ? (parseFloat(extraTax) || 0) : Number(extraTax)) : 0

  if (isNaN(P) || P <= 0) {
    throw new Error('Enter a valid positive loan principal amount.')
  }
  if (isNaN(annualRate) || annualRate < 0) {
    throw new Error('Interest rate cannot be negative.')
  }
  if (isNaN(years) || years <= 0) {
    throw new Error('Loan term must be greater than zero.')
  }

  const n = Math.round(years * 12)
  const r = annualRate / 12 / 100

  let emi = 0
  if (r > 0) {
    const factor = Math.pow(1 + r, n)
    emi = (P * r * factor) / (factor - 1)
  } else {
    emi = P / n
  }

  const totalMonthly = emi + tax
  const totalPayment = emi * n
  const totalInterest = Math.max(0, totalPayment - P)
  const totalWithTax = totalPayment + tax * n

  const fmt = (num) => '$' + Math.round(num).toLocaleString('en-US')

  const reportText = `Mortgage & EMI Report
----------------------------------------
Loan Principal: ${fmt(P)}
Annual Interest Rate: ${annualRate}%
Tenure: ${years} years (${n} months)
Monthly Property Tax & Insurance: ${fmt(tax)}

Monthly EMI (Principal + Interest): ${fmt(emi)}
Total Monthly Payment: ${fmt(totalMonthly)}

Total Interest Payable: ${fmt(totalInterest)}
Total Principal & Interest: ${fmt(totalPayment)}
Total Amount Payable over Loan: ${fmt(totalWithTax)}`

  return {
    principal: P,
    annualRate,
    tenureYears: years,
    tenureMonths: n,
    extraTax: tax,
    emi,
    totalMonthly,
    totalPayment,
    totalInterest,
    totalWithTax,
    formattedEmi: fmt(emi),
    formattedTotalMonthly: fmt(totalMonthly),
    formattedTotalInterest: fmt(totalInterest),
    formattedTotalWithTax: fmt(totalWithTax),
    reportText,
    summary: `Monthly Loan EMI: ${fmt(emi)}/mo | Total Payment: ${fmt(totalMonthly)}/mo | Total Interest: ${fmt(totalInterest)}`
  }
}
