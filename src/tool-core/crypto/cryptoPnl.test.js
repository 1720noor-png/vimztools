import { describe, it, expect } from 'vitest'
import { calculateCryptoPnl } from './cryptoPnl.js'

describe('Crypto P&L Calculator Engine (calculateCryptoPnl)', () => {
  it('calculates net profit and ROI with zero fees', () => {
    const res = calculateCryptoPnl({
      buyPrice: 50000,
      sellPrice: 60000,
      amount: 2,
      buyFeePercent: 0,
      sellFeePercent: 0
    })

    expect(res.initialInvestment).toBe(100000)
    expect(res.totalCost).toBe(100000)
    expect(res.grossProceeds).toBe(120000)
    expect(res.netProceeds).toBe(120000)
    expect(res.netPnl).toBe(20000)
    expect(res.roiPercent).toBe(20)
    expect(res.breakEvenPrice).toBe(50000)
    expect(res.isProfit).toBe(true)
  })

  it('correctly deducts exchange maker/taker fees', () => {
    const res = calculateCryptoPnl({
      buyPrice: 1000,
      sellPrice: 1100,
      amount: 1,
      buyFeePercent: 0.1, // $1
      sellFeePercent: 0.1 // $1.10
    })

    expect(res.initialInvestment).toBe(1000)
    expect(res.buyFee).toBe(1)
    expect(res.totalCost).toBe(1001)
    expect(res.grossProceeds).toBe(1100)
    expect(res.sellFee).toBe(1.1)
    expect(res.netProceeds).toBe(1098.9)
    expect(res.netPnl).toBe(97.9) // 1098.9 - 1001
    expect(res.totalFees).toBe(2.1)
  })

  it('calculates loss correctly when sell price is lower than entry', () => {
    const res = calculateCryptoPnl({
      buyPrice: 3000,
      sellPrice: 2500,
      amount: 4,
      buyFeePercent: 0.1,
      sellFeePercent: 0.1
    })

    expect(res.netPnl).toBeLessThan(0)
    expect(res.isProfit).toBe(false)
    expect(res.statusText).toContain('Loss')
  })

  it('throws error for invalid parameters', () => {
    expect(() => calculateCryptoPnl({ buyPrice: -10, sellPrice: 50 })).toThrow('Buy price must be a positive number')
    expect(() => calculateCryptoPnl({ buyPrice: 100, sellPrice: -5 })).toThrow('Sell price must be a non-negative number')
    expect(() => calculateCryptoPnl({ buyPrice: 100, sellPrice: 150, amount: 0 })).toThrow('Crypto amount/quantity must be a positive number')
  })
})
