import { describe, it, expect } from 'vitest'
import { calculateCompoundInterest } from './compoundInterest.js'

describe('Compound Interest Growth Calculator (tool-core)', () => {
  it('calculates 10-year projection accurately for $5000 principal, $250/mo, 7% return', () => {
    const result = calculateCompoundInterest({
      initial: 5000,
      monthly: 250,
      rate: 7,
      years: 10,
      frequency: 12
    })

    expect(result.initial).toBe(5000)
    expect(result.monthly).toBe(250)
    expect(result.years).toBe(10)
    expect(result.totalDeposited).toBe(35000) // 5000 + (250 * 12 * 10)
    expect(result.finalBalance).toBeGreaterThan(45000)
    expect(result.finalInterest).toBe(result.finalBalance - result.totalDeposited)
    expect(result.yearlyData.length).toBe(10)
    expect(result.reportText).toContain('Future Portfolio Value:')
  })

  it('handles 0 initial investment and 0 interest rate', () => {
    const result = calculateCompoundInterest({
      initial: 0,
      monthly: 100,
      rate: 0,
      years: 5
    })

    expect(result.totalDeposited).toBe(6000)
    expect(result.finalInterest).toBe(0)
    expect(result.finalBalance).toBe(6000)
  })

  it('caps years to 50 max and coerces string parameters safely', () => {
    const result = calculateCompoundInterest({
      initial: '1000',
      monthly: '50',
      rate: '5',
      years: '100'
    })

    expect(result.years).toBe(50)
    expect(result.yearlyData.length).toBe(50)
  })
})
