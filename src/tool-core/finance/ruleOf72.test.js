import { describe, it, expect } from 'vitest'
import { calculateRuleOf72 } from './ruleOf72.js'

describe('Rule of 72 Doubling Time Calculator (tool-core)', () => {
  it('calculates doubling time accurately for default rate of 7.2%', () => {
    const result = calculateRuleOf72({ rate: 7.2 })

    expect(result.rate).toBe(7.2)
    expect(result.approxYears).toBeCloseTo(10.0, 4)
    expect(result.formattedApproxYears).toBe('10.0')
    expect(result.exactYears).toBeCloseTo(9.9695, 3)
    expect(result.formattedExactYears).toBe('9.97')
    expect(result.summary).toContain('approx. 10.0 years')
  })

  it('accepts string input and calculates correctly for 10%', () => {
    const result = calculateRuleOf72({ rate: '10' })

    expect(result.rate).toBe(10)
    expect(result.approxYears).toBe(7.2)
    expect(result.formattedApproxYears).toBe('7.2')
    expect(result.exactYears).toBeCloseTo(7.2725, 3)
    expect(result.formattedExactYears).toBe('7.27')
  })

  it('calculates accurately for high return rate of 24%', () => {
    const result = calculateRuleOf72({ rate: 24 })

    expect(result.approxYears).toBe(3.0)
    expect(result.formattedApproxYears).toBe('3.0')
    expect(result.exactYears).toBeCloseTo(3.222, 2)
  })

  it('throws validation error for zero rate', () => {
    expect(() => calculateRuleOf72({ rate: 0 })).toThrow('Enter a valid positive return rate.')
  })

  it('throws validation error for negative rate', () => {
    expect(() => calculateRuleOf72({ rate: -5 })).toThrow('Enter a valid positive return rate.')
  })

  it('throws validation error for non-numeric input', () => {
    expect(() => calculateRuleOf72({ rate: 'abc' })).toThrow('Enter a valid positive return rate.')
  })
})
