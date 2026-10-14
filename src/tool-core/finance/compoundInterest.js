/**
 * Compound Interest Growth Calculator
 * Computes compound growth, annual breakdown, total deposits, and interest earned.
 *
 * @param {Object} params
 * @param {number|string} [params.initial=0] - Initial investment amount ($)
 * @param {number|string} [params.monthly=0] - Monthly deposit ($)
 * @param {number|string} [params.rate=0] - Expected annual return (%)
 * @param {number|string} [params.years=1] - Investment period in years (1 - 50)
 * @param {number|string} [params.frequency=12] - Compounding frequency (1, 4, 12, 365)
 * @returns {Object} Comprehensive compound projection and report
 */
export function calculateCompoundInterest({
  initial = 0,
  monthly = 0,
  rate = 0,
  years = 1,
  frequency = 12
}) {
  const P = Math.max(0, typeof initial === 'string' ? (parseFloat(initial) || 0) : (Number(initial) || 0))
  const PMT = Math.max(0, typeof monthly === 'string' ? (parseFloat(monthly) || 0) : (Number(monthly) || 0))
  const rPct = typeof rate === 'string' ? (parseFloat(rate) || 0) : (Number(rate) || 0)
  const r = rPct / 100
  const tRaw = typeof years === 'string' ? (parseInt(years, 10) || 1) : (Number(years) || 1)
  const t = Math.min(50, Math.max(1, tRaw))
  const n = typeof frequency === 'string' ? (parseInt(frequency, 10) || 12) : (Number(frequency) || 12)

  const yearlyData = []
  let balance = P
  let totalDeposited = P

  for (let y = 1; y <= t; y++) {
    for (let m = 1; m <= 12; m++) {
      balance += PMT
      totalDeposited += PMT
      const monthlyInterest = balance * (r / n) * (n / 12)
      balance += monthlyInterest
    }
    yearlyData.push({
      year: y,
      deposited: totalDeposited,
      interest: balance - totalDeposited,
      balance: balance
    })
  }

  const finalBalance = balance
  const finalInterest = finalBalance - totalDeposited

  const fmt = (val) => '$' + Math.round(val).toLocaleString('en-US')

  const reportText = `Compound Interest Growth Report
-----------------------------------------
Initial Investment: ${fmt(P)}
Monthly Deposit: ${fmt(PMT)}
Expected Annual Return: ${rPct}%
Investment Horizon: ${t} years

Total Money Deposited: ${fmt(totalDeposited)}
Total Interest Earned: ${fmt(finalInterest)}
Future Portfolio Value: ${fmt(finalBalance)}`

  return {
    initial: P,
    monthly: PMT,
    rate: rPct,
    years: t,
    frequency: n,
    totalDeposited,
    finalInterest,
    finalBalance,
    yearlyData,
    reportText,
    summary: `Portfolio Value: ${fmt(finalBalance)} | Deposited: ${fmt(totalDeposited)} | Interest: ${fmt(finalInterest)}`
  }
}
