import { describe, it, expect } from 'vitest'
import { calculateDcfValuation } from './dcfValuation.js'

describe('Discounted Cash Flow (DCF) Valuation Engine (tool-core)', () => {
  it('calculates intrinsic per share value for $500,000 FCF, 10% growth, 8.5% WACC, 100k shares', () => {
    const result = calculateDcfValuation({
      fcf: 500000,
      growthRate: 10,
      termRate: 2.5,
      wacc: 8.5,
      shares: 100000
    })

    expect(result.fcf).toBe(500000)
    expect(result.shares).toBe(100000)
    expect(result.perShare).toBeGreaterThan(100)
    expect(result.enterpriseVal).toBeGreaterThan(10000000)
    expect(result.projectedCashFlows.length).toBe(5)
    expect(result.summary).toContain('Intrinsic Value:')
    expect(result.copyText).toContain('Fair Value:')
  })

  it('throws error when WACC is less than or equal to terminal growth rate', () => {
    expect(() => calculateDcfValuation({
      fcf: 500000,
      growthRate: 10,
      termRate: 8.5,
      wacc: 8.5,
      shares: 100000
    })).toThrow('Discount rate (WACC) must be strictly greater than terminal growth rate.')

    expect(() => calculateDcfValuation({
      fcf: 500000,
      growthRate: 10,
      termRate: 10,
      wacc: 8,
      shares: 100000
    })).toThrow('Discount rate (WACC) must be strictly greater than terminal growth rate.')
  })

  it('throws error for non-positive FCF or shares', () => {
    expect(() => calculateDcfValuation({
      fcf: 0,
      growthRate: 10,
      wacc: 8.5,
      shares: 100000
    })).toThrow('Enter valid positive values.')

    expect(() => calculateDcfValuation({
      fcf: 500000,
      growthRate: 10,
      wacc: 8.5,
      shares: 0
    })).toThrow('Enter valid positive values.')
  })
})
