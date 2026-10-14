/**
 * Systematic Investment Plan (SIP) & Lump Sum Growth Engine
 * Calculates expected wealth accumulation and returns for monthly SIP or lump sum mutual fund investments.
 * Formula (SIP): FV = P * [((1 + i)^n - 1) / i] * (1 + i)
 * Formula (Lump): FV = P * (1 + r)^t
 *
 * @param {Object} params
 * @param {'sip'|'lump'} [params.mode='sip'] - Investment mode: 'sip' (monthly) or 'lump' (one-time)
 * @param {number|string} params.amount - Investment contribution amount ($)
 * @param {number|string} params.rate - Expected annual rate of return (%)
 * @param {number|string} params.years - Investment horizon in years
 * @returns {Object} Comprehensive investment projection
 */
export function calculateSipInvestment({
  mode = 'sip',
  amount,
  rate,
  years
}) {
  const selectedMode = mode === 'lump' ? 'lump' : 'sip'
  const P = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
  const annualRate = typeof rate === 'string' ? parseFloat(rate) : Number(rate)
  const tenureYears = typeof years === 'string' ? parseFloat(years) : Number(years)

  if (isNaN(P) || P <= 0) {
    throw new Error('Enter a valid positive investment amount.')
  }
  if (isNaN(annualRate) || annualRate < 0) {
    throw new Error('Expected return rate cannot be negative.')
  }
  if (isNaN(tenureYears) || tenureYears <= 0) {
    throw new Error('Investment horizon must be greater than zero.')
  }

  let invested = 0
  let totalValue = 0

  if (selectedMode === 'sip') {
    const n = Math.round(tenureYears * 12)
    const i = annualRate / 12 / 100
    invested = P * n
    if (i > 0) {
      totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)
    } else {
      totalValue = invested
    }
  } else {
    invested = P
    totalValue = P * Math.pow(1 + annualRate / 100, tenureYears)
  }

  const estimatedReturns = Math.max(0, totalValue - invested)

  const fmt = (val) => '$' + Math.round(val).toLocaleString('en-US')

  const reportText = `Mutual Fund Investment Report (${selectedMode.toUpperCase()})
-----------------------------------------------
Investment Type: ${selectedMode === 'sip' ? 'Monthly SIP' : 'Lump Sum One-Time'}
${selectedMode === 'sip' ? 'Monthly Investment' : 'Initial Investment'}: ${fmt(P)}
Expected Annual Rate of Return: ${annualRate}%
Tenure: ${tenureYears} years

Total Amount Invested: ${fmt(invested)}
Estimated Wealth Gained: ${fmt(estimatedReturns)}
Total Expected Value: ${fmt(totalValue)}`

  return {
    mode: selectedMode,
    amount: P,
    rate: annualRate,
    years: tenureYears,
    invested,
    totalValue,
    estimatedReturns,
    formattedInvested: fmt(invested),
    formattedTotalValue: fmt(totalValue),
    formattedEstimatedReturns: fmt(estimatedReturns),
    reportText,
    summary: `Expected Value: ${fmt(totalValue)} | Invested: ${fmt(invested)} | Est. Returns: ${fmt(estimatedReturns)}`
  }
}
