import { describe, it, expect } from 'vitest'
import { calculateDebtToIncome } from './debtToIncome.js'

describe('Debt-to-Income (DTI) Ratio Calculator (tool-core)', () => {
  it('calculates standard DTI of 32.7% (Excellent DTI) for $7500 income', () => {
    const result = calculateDebtToIncome({
      income: 7500,
      housing: 1800,
      auto: 350,
      otherDebt: 300
    })

    expect(result.income).toBe(7500)
    expect(result.totalMonthlyDebt).toBe(2450)
    expect(result.dti).toBeCloseTo(32.666, 2)
    expect(result.formattedDti).toBe('32.7')
    expect(result.status).toBe('Excellent DTI')
    expect(result.riskLevel).toBe('low')
  })

  it('classifies 40% DTI as Acceptable', () => {
    const result = calculateDebtToIncome({
      income: 5000,
      housing: 1500,
      auto: 300,
      otherDebt: 200
    })

    expect(result.dti).toBe(40)
    expect(result.formattedDti).toBe('40.0')
    expect(result.status).toBe('Acceptable DTI for most lenders')
    expect(result.riskLevel).toBe('moderate')
  })

  it('classifies 50% DTI as High Risk', () => {
    const result = calculateDebtToIncome({
      income: 4000,
      housing: 1500,
      auto: 300,
      otherDebt: 200
    })

    expect(result.dti).toBe(50)
    expect(result.formattedDti).toBe('50.0')
    expect(result.status).toBe('High DTI Risk (>43%)')
    expect(result.riskLevel).toBe('high')
  })

  it('handles zero non-housing debts correctly', () => {
    const result = calculateDebtToIncome({
      income: 6000,
      housing: 1200
    })

    expect(result.totalMonthlyDebt).toBe(1200)
    expect(result.dti).toBe(20)
    expect(result.formattedDti).toBe('20.0')
  })

  it('throws validation error for invalid income or negative debts', () => {
    expect(() => calculateDebtToIncome({ income: 0 })).toThrow('Enter valid gross monthly income.')
    expect(() => calculateDebtToIncome({ income: -100 })).toThrow('Enter valid gross monthly income.')
    expect(() => calculateDebtToIncome({ income: 5000, housing: -500 })).toThrow('Debt amounts cannot be negative.')
  })
})
