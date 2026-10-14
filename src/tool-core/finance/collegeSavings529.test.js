import { describe, it, expect } from 'vitest'
import { calculateCollegeSavings529 } from './collegeSavings529.js'

describe('529 College Savings Plan Calculator (tool-core)', () => {
  it('calculates 15-year fund projection for 3-year-old with $5000 saved, $300/mo, 6.5% return', () => {
    const result = calculateCollegeSavings529({
      childAge: 3,
      currentSaved: 5000,
      monthlyContrib: 300,
      returnRate: 6.5
    })

    expect(result.yearsToCollege).toBe(15)
    expect(result.monthsToCollege).toBe(180)
    expect(result.totalContributed).toBe(59000) // 5000 + (300 * 180)
    expect(result.estimatedFund).toBeGreaterThan(100000)
    expect(result.summary).toContain('Est. Fund at Age 18:')
  })

  it('handles child starting from 0 savings and 0 age (newborn)', () => {
    const result = calculateCollegeSavings529({
      childAge: 0,
      currentSaved: 0,
      monthlyContrib: 200,
      returnRate: 7
    })

    expect(result.yearsToCollege).toBe(18)
    expect(result.monthsToCollege).toBe(216)
    expect(result.estimatedFund).toBeGreaterThan(80000)
  })

  it('throws error for child age 18 or older, or negative inputs', () => {
    expect(() => calculateCollegeSavings529({ childAge: 18 })).toThrow('Enter valid age (< 18, >= 0), positive savings, and return rate.')
    expect(() => calculateCollegeSavings529({ childAge: 19 })).toThrow('Enter valid age (< 18, >= 0), positive savings, and return rate.')
    expect(() => calculateCollegeSavings529({ childAge: -1 })).toThrow('Enter valid age (< 18, >= 0), positive savings, and return rate.')
    expect(() => calculateCollegeSavings529({ childAge: 5, currentSaved: -100 })).toThrow('Enter valid age (< 18, >= 0), positive savings, and return rate.')
    expect(() => calculateCollegeSavings529({ childAge: 5, monthlyContrib: -50 })).toThrow('Enter valid age (< 18, >= 0), positive savings, and return rate.')
  })
})
