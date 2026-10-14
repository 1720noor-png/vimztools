import { describe, it, expect } from 'vitest'
import { calculateMortgageEmi } from './mortgageEmi.js'

describe('Mortgage & Loan EMI Calculator (tool-core)', () => {
  it('calculates standard 30-year $250,000 mortgage at 6.5% interest', () => {
    const result = calculateMortgageEmi({
      amount: 250000,
      rate: 6.5,
      tenureYears: 30,
      extraTax: 200
    })

    expect(result.principal).toBe(250000)
    expect(result.tenureMonths).toBe(360)
    expect(result.emi).toBeCloseTo(1580.17, 1)
    expect(result.formattedEmi).toBe('$1,580')
    expect(result.totalMonthly).toBeCloseTo(1780.17, 1)
    expect(result.formattedTotalMonthly).toBe('$1,780')
    expect(result.totalInterest).toBeCloseTo(318861, 0)
    expect(result.reportText).toContain('Mortgage & EMI Report')
  })

  it('calculates 0% interest loan correctly', () => {
    const result = calculateMortgageEmi({
      amount: 12000,
      rate: 0,
      tenureYears: 1,
      extraTax: 0
    })

    expect(result.emi).toBe(1000)
    expect(result.totalInterest).toBe(0)
    expect(result.totalPayment).toBe(12000)
  })

  it('throws validation error for invalid principal or tenure', () => {
    expect(() => calculateMortgageEmi({ amount: 0, rate: 5 })).toThrow('Enter a valid positive loan principal amount.')
    expect(() => calculateMortgageEmi({ amount: -1000, rate: 5 })).toThrow('Enter a valid positive loan principal amount.')
    expect(() => calculateMortgageEmi({ amount: 100000, rate: -2 })).toThrow('Interest rate cannot be negative.')
    expect(() => calculateMortgageEmi({ amount: 100000, rate: 5, tenureYears: 0 })).toThrow('Loan term must be greater than zero.')
  })
})
