/**
 * Personal Net Worth Calculator
 * Computes total assets, total liabilities/debts, and net worth.
 * Formula: Net Worth = Total Assets - Total Liabilities
 *
 * @param {Object} params
 * @param {number|string} [params.cash=0] - Liquid cash, savings, checking accounts ($)
 * @param {number|string} [params.investments=0] - Stocks, bonds, crypto, retirement ($)
 * @param {number|string} [params.property=0] - Real estate, vehicle, physical assets ($)
 * @param {number|string} [params.debts=0] - Mortgages, auto loans, student loans, credit card balances ($)
 * @returns {Object} Comprehensive balance sheet breakdown
 */
export function calculatePersonalNetWorth({
  cash = 0,
  investments = 0,
  property = 0,
  debts = 0
}) {
  const c = cash !== undefined && cash !== '' ? (typeof cash === 'string' ? (parseFloat(cash) || 0) : Number(cash)) : 0
  const inv = investments !== undefined && investments !== '' ? (typeof investments === 'string' ? (parseFloat(investments) || 0) : Number(investments)) : 0
  const pr = property !== undefined && property !== '' ? (typeof property === 'string' ? (parseFloat(property) || 0) : Number(property)) : 0
  const d = debts !== undefined && debts !== '' ? (typeof debts === 'string' ? (parseFloat(debts) || 0) : Number(debts)) : 0

  if (isNaN(c) || c < 0 || isNaN(inv) || inv < 0 || isNaN(pr) || pr < 0 || isNaN(d) || d < 0) {
    throw new Error('Asset and debt values cannot be negative.')
  }

  const totalAssets = c + inv + pr
  const netWorth = totalAssets - d

  return {
    cash: c,
    investments: inv,
    property: pr,
    debts: d,
    totalAssets,
    netWorth,
    formattedAssets: `$${Math.round(totalAssets).toLocaleString('en-US')}`,
    formattedDebts: `$${Math.round(d).toLocaleString('en-US')}`,
    formattedNetWorth: `$${Math.round(netWorth).toLocaleString('en-US')}`,
    summary: `Net Worth: $${netWorth.toLocaleString()} (Assets: $${totalAssets.toLocaleString()} - Debts: $${d.toLocaleString()})`,
    copyText: `Net Worth: $${netWorth} (Assets: $${totalAssets}, Debts: ${d})`
  }
}
