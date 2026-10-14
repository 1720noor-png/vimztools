import { describe, it, expect } from 'vitest'
import { calculateEmergencySavingsFund } from './emergencySavingsFund.js'

describe('Emergency Savings Fund Target Calculator (tool-core)', () => {
  it('calculates 6-month safety buffer for default baseline living expenses', () => {
    const result = calculateEmergencySavingsFund({
      housing: 1600,
      utilities: 350,
      food: 600,
      other: 450,
      months: 6
    })

    expect(result.monthlyEssential).toBe(3000)
    expect(result.totalTarget).toBe(18000)
    expect(result.formattedMonthlyEssential).toBe('$3,000')
    expect(result.formattedTotalTarget).toBe('$18,000')
    expect(result.summary).toContain('Target Emergency Fund: $18,000 (6 months of $3,000/mo essential living cost)')
  })

  it('calculates 3-month buffer accurately with string coercion', () => {
    const result = calculateEmergencySavingsFund({
      housing: '1200',
      utilities: '200',
      food: '400',
      other: '200',
      months: '3'
    })

    expect(result.monthlyEssential).toBe(2000)
    expect(result.totalTarget).toBe(6000)
    expect(result.formattedTotalTarget).toBe('$6,000')
  })

  it('throws error when no expenses are provided or expenses are negative', () => {
    expect(() => calculateEmergencySavingsFund({ housing: 0, utilities: 0, food: 0, other: 0 })).toThrow('At least one essential monthly expense must be greater than zero.')
    expect(() => calculateEmergencySavingsFund({ housing: -500, utilities: 200 })).toThrow('Expense values cannot be negative.')
    expect(() => calculateEmergencySavingsFund({ housing: 1000, months: 0 })).toThrow('Safety buffer months must be greater than zero.')
  })
})
