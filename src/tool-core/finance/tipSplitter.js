/**
 * Tip and Bill Splitter
 * Computes tip amount, total bill with tip, and amount owed per person.
 *
 * @param {Object} params
 * @param {number|string} params.bill - Total bill amount ($)
 * @param {number|string} [params.tip=0] - Tip percentage (%)
 * @param {number|string} [params.people=1] - Number of people splitting the bill
 * @returns {Object} Calculated metrics
 */
export function calculateTipSplitter({ bill, tip = 0, people = 1 }) {
  const b = typeof bill === 'string' ? parseFloat(bill) : Number(bill)
  const t = tip !== undefined && tip !== '' ? (typeof tip === 'string' ? parseFloat(tip) : Number(tip)) : 0
  const p = people !== undefined && people !== '' ? (typeof people === 'string' ? parseInt(people, 10) : Number(people)) : 1

  if (isNaN(b) || b <= 0) {
    throw new Error('Enter a valid positive bill amount.')
  }
  if (isNaN(t) || t < 0) {
    throw new Error('Tip percentage cannot be negative.')
  }
  if (isNaN(p) || p < 1) {
    throw new Error('Number of people must be at least 1.')
  }

  const tipAmount = (b * t) / 100
  const total = b + tipAmount
  const perPerson = total / p

  return {
    bill: b,
    tipPercentage: t,
    people: p,
    tipAmount,
    total,
    perPerson,
    totalPerPerson: perPerson,
    formattedTip: tipAmount.toFixed(2),
    formattedTotal: total.toFixed(2),
    formattedPerPerson: perPerson.toFixed(2),
    summary: `Tip: $${tipAmount.toFixed(2)} | Total: $${total.toFixed(2)} | Per Person (${p}): $${perPerson.toFixed(2)}`
  }
}
