import { describe, it, expect } from 'vitest'
import { calculatePersonalNetWorth } from './personalNetWorth.js'

describe('Personal Net Worth Calculator (tool-core)', () => {
  it('calculates net worth accurately for standard assets and debts', () => {
    const result = calculatePersonalNetWorth({
      cash: 15000,
      investments: 85000,
      property: 250000,
      debts: 190000
    })

    expect(result.totalAssets).toBe(350000)
    expect(result.netWorth).toBe(160000)
    expect(result.formattedAssets).toBe('$350,000')
    expect(result.formattedDebts).toBe('$190,000')
    expect(result.formattedNetWorth).toBe('$160,000')
  })

  it('handles negative net worth (liabilities exceed assets) without error', () => {
    const result = calculatePersonalNetWorth({
      cash: 5000,
      debts: 25000
    })

    expect(result.totalAssets).toBe(5000)
    expect(result.netWorth).toBe(-20000)
    expect(result.formattedNetWorth).toBe('$-20,000')
  })

  it('throws error for negative inputs', () => {
    expect(() => calculatePersonalNetWorth({ cash: -100 })).toThrow('Asset and debt values cannot be negative.')
    expect(() => calculatePersonalNetWorth({ debts: -500 })).toThrow('Asset and debt values cannot be negative.')
  })
})
