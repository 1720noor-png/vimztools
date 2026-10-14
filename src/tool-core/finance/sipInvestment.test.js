import { describe, it, expect } from 'vitest'
import { calculateSipInvestment } from './sipInvestment.js'

describe('SIP & Lump Sum Investment Growth Engine (tool-core)', () => {
  it('calculates 15-year SIP growth accurately for $500/mo at 12% annual return', () => {
    const result = calculateSipInvestment({
      mode: 'sip',
      amount: 500,
      rate: 12,
      years: 15
    })

    expect(result.mode).toBe('sip')
    expect(result.invested).toBe(90000) // 500 * 180
    expect(result.totalValue).toBeGreaterThan(240000)
    expect(result.estimatedReturns).toBe(result.totalValue - result.invested)
    expect(result.summary).toContain('Expected Value:')
  })

  it('calculates lump sum growth for $10,000 at 10% over 5 years', () => {
    const result = calculateSipInvestment({
      mode: 'lump',
      amount: 10000,
      rate: 10,
      years: 5
    })

    expect(result.mode).toBe('lump')
    expect(result.invested).toBe(10000)
    expect(result.totalValue).toBeCloseTo(16105.10, 1)
    expect(result.estimatedReturns).toBeCloseTo(6105.10, 1)
  })

  it('handles 0% return rate correctly for SIP', () => {
    const result = calculateSipInvestment({
      mode: 'sip',
      amount: 200,
      rate: 0,
      years: 2
    })

    expect(result.invested).toBe(4800)
    expect(result.totalValue).toBe(4800)
    expect(result.estimatedReturns).toBe(0)
  })

  it('throws error for invalid amount or years', () => {
    expect(() => calculateSipInvestment({ amount: 0, rate: 10, years: 5 })).toThrow('Enter a valid positive investment amount.')
    expect(() => calculateSipInvestment({ amount: -100, rate: 10, years: 5 })).toThrow('Enter a valid positive investment amount.')
    expect(() => calculateSipInvestment({ amount: 500, rate: -5, years: 5 })).toThrow('Expected return rate cannot be negative.')
    expect(() => calculateSipInvestment({ amount: 500, rate: 10, years: 0 })).toThrow('Investment horizon must be greater than zero.')
  })
})
