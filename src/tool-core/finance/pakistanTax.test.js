import { describe, it, expect } from 'vitest'
import { calculatePakistanTax } from './pakistanTax.js'

describe('Pakistan Income Tax Engine (calculatePakistanTax)', () => {
  it('returns 0 tax for income under Rs. 600,000 / year (50K/month)', () => {
    const res = calculatePakistanTax({ monthlySalary: 50000 })
    expect(res.annualIncome).toBe(600000)
    expect(res.annualTax).toBe(0)
    expect(res.monthlyTax).toBe(0)
    expect(res.effectiveTaxRate).toBe(0)
    expect(res.monthlyTakeHome).toBe(50000)
  })

  it('calculates 5% tax for slab Rs. 600k – 1.2M', () => {
    const res = calculatePakistanTax({ annualIncome: 1000000 })
    // Excess = 400,000 * 0.05 = 20,000
    expect(res.annualTax).toBe(20000)
    expect(res.monthlyTax).toBe(Math.round(20000 / 12))
    expect(res.effectiveTaxRate).toBe(2.0)
    expect(res.annualTakeHome).toBe(980000)
  })

  it('calculates progressive tax for Rs. 150,000 / month (1.8M/year)', () => {
    const res = calculatePakistanTax({ monthlySalary: 150000 })
    // 1.8M is in Slab 3 (1.2M - 2.2M): 30,000 + 15% of (1,800,000 - 1,200,000)
    // 30,000 + 0.15 * 600,000 = 30,000 + 90,000 = 120,000
    expect(res.annualTax).toBe(120000)
    expect(res.monthlyTax).toBe(10000)
    expect(res.monthlyTakeHome).toBe(140000)
    expect(res.effectiveTaxRate).toBeCloseTo((120000 / 1800000) * 100, 1)
  })

  it('throws error when neither monthlySalary nor annualIncome is provided', () => {
    expect(() => calculatePakistanTax({})).toThrow('Please provide either monthlySalary or annualIncome')
  })
})
