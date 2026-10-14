import { describe, it, expect } from 'vitest'
import { calculateDividendDripGrowth } from './dividendDripGrowth.js'

describe('Dividend Yield & DRIP Growth Calculator (tool-core)', () => {
  it('calculates 10-year DRIP projection accurately for 500 shares @ $85 with $3.40 div/share', () => {
    const result = calculateDividendDripGrowth({
      shares: 500,
      price: 85,
      divPerShare: 3.40,
      years: 10
    })

    expect(result.initialVal).toBe(42500)
    expect(result.yieldPct).toBe(4)
    expect(result.formattedYield).toBe('4.00%')
    expect(result.finalVal).toBeGreaterThan(60000)
    expect(result.finalShares).toBeGreaterThan(700)
    expect(result.summary).toContain('Dividend Yield: 4.00%')
  })

  it('handles 0 dividend per share without error', () => {
    const result = calculateDividendDripGrowth({
      shares: 100,
      price: 50,
      divPerShare: 0,
      years: 5
    })

    expect(result.yieldPct).toBe(0)
    expect(result.finalVal).toBe(5000)
    expect(result.finalShares).toBe(100)
  })

  it('throws error for non-positive shares, price, or years', () => {
    expect(() => calculateDividendDripGrowth({ shares: 0, price: 50, divPerShare: 2 })).toThrow('Enter valid positive values.')
    expect(() => calculateDividendDripGrowth({ shares: 100, price: -10, divPerShare: 2 })).toThrow('Enter valid positive values.')
    expect(() => calculateDividendDripGrowth({ shares: 100, price: 50, divPerShare: -1 })).toThrow('Enter valid positive values.')
    expect(() => calculateDividendDripGrowth({ shares: 100, price: 50, divPerShare: 2, years: 0 })).toThrow('Enter valid positive values.')
  })
})
