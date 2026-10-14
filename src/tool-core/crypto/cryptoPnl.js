/**
 * Pure Engine: Crypto Profit & Loss (P&L) and ROI Calculator
 * Computes exact returns, exchange fee overhead, net proceeds, and break-even sell price.
 */

export function calculateCryptoPnl(options = {}) {
  const {
    buyPrice,
    sellPrice,
    amount = 1,
    buyFeePercent = 0.1,
    sellFeePercent = 0.1
  } = options

  const buy = Number(buyPrice)
  const sell = Number(sellPrice)
  const qty = Number(amount)
  const buyFeeRate = Number(buyFeePercent) / 100
  const sellFeeRate = Number(sellFeePercent) / 100

  if (isNaN(buy) || buy <= 0) {
    throw new Error('Buy price must be a positive number')
  }
  if (isNaN(sell) || sell < 0) {
    throw new Error('Sell price must be a non-negative number')
  }
  if (isNaN(qty) || qty <= 0) {
    throw new Error('Crypto amount/quantity must be a positive number')
  }
  if (isNaN(buyFeeRate) || buyFeeRate < 0 || isNaN(sellFeeRate) || sellFeeRate < 0) {
    throw new Error('Fee percentages must be non-negative numbers')
  }

  const initialInvestment = qty * buy
  const buyFee = initialInvestment * buyFeeRate
  const totalCost = initialInvestment + buyFee

  const grossProceeds = qty * sell
  const sellFee = grossProceeds * sellFeeRate
  const netProceeds = grossProceeds - sellFee

  const netPnl = netProceeds - totalCost
  const roiPercent = (netPnl / totalCost) * 100

  // Break-even sell price where netProceeds = totalCost:
  // (qty * breakEven) * (1 - sellFeeRate) = totalCost
  // breakEven = totalCost / (qty * (1 - sellFeeRate))
  const breakEvenPrice = totalCost / (qty * (1 - sellFeeRate))

  return {
    buyPrice: buy,
    sellPrice: sell,
    amount: qty,
    initialInvestment: Number(initialInvestment.toFixed(2)),
    buyFee: Number(buyFee.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    grossProceeds: Number(grossProceeds.toFixed(2)),
    sellFee: Number(sellFee.toFixed(2)),
    totalFees: Number((buyFee + sellFee).toFixed(2)),
    netProceeds: Number(netProceeds.toFixed(2)),
    netPnl: Number(netPnl.toFixed(2)),
    roiPercent: Number(roiPercent.toFixed(2)),
    breakEvenPrice: Number(breakEvenPrice.toFixed(4)),
    isProfit: netPnl >= 0,
    statusText: netPnl >= 0 ? `Profit of +$${netPnl.toFixed(2)} (+${roiPercent.toFixed(2)}%)` : `Loss of -$${Math.abs(netPnl).toFixed(2)} (${roiPercent.toFixed(2)}%)`
  }
}
