import { describe, it, expect } from 'vitest'
import { calculateSimpleInterest } from './simpleInterest.js'

describe('Simple Interest Return Calculator (tool-core)', () => {
  it('calculates interest correctly for standard inputs', () => {
    const result = calculateSimpleInterest({ principal: 5000, rate: 5, years: 3 })
    expect(result.interest).toBe(750)
    expect(result.total).toBe(5750)
    expect(result.formattedInterest).toBe('750.00')
    expect(result.formattedTotal).toBe('5750.00')
    expect(result.summary).toContain('Total Interest: $750.00 | Final Total: $5750.00')
  })

  it('accepts string inputs and coerces types correctly', () => {
    const result = calculateSimpleInterest({ principal: '1000', rate: '10', years: '2' })
    expect(result.interest).toBe(200)
    expect(result.total).toBe(1200)
  })

  it('handles 0% interest rate correctly', () => {
    const result = calculateSimpleInterest({ principal: 1000, rate: 0, years: 1 })
    expect(result.interest).toBe(0)
    expect(result.total).toBe(1000)
  })

  it('throws error for non-positive principal', () => {
    expect(() => calculateSimpleInterest({ principal: 0, rate: 5, years: 1 })).toThrow('Enter valid positive values.')
    expect(() => calculateSimpleInterest({ principal: -100, rate: 5, years: 1 })).toThrow('Enter valid positive values.')
  })

  it('throws error for negative rate or non-positive time', () => {
    expect(() => calculateSimpleInterest({ principal: 1000, rate: -2, years: 1 })).toThrow('Enter valid positive values.')
    expect(() => calculateSimpleInterest({ principal: 1000, rate: 5, years: 0 })).toThrow('Enter valid positive values.')
  })

  it('throws error for non-numeric input', () => {
    expect(() => calculateSimpleInterest({ principal: 'xyz', rate: 5, years: 1 })).toThrow('Enter valid positive values.')
  })
})
