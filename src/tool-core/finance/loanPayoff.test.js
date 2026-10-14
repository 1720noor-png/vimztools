import { describe, it, expect } from 'vitest'
import { calculateLoanPayoff } from './loanPayoff.js'

describe('Loan Payoff & Extra Payment Calculator (tool-core)', () => {
  it('calculates time and interest saved for $20000 loan at 12% with $450 regular and $100 extra payment', () => {
    const result = calculateLoanPayoff({
      balance: 20000,
      rate: 12,
      monthlyPayment: 450,
      extraPayment: 100
    })

    expect(result.standard.months).toBe(60)
    expect(result.accelerated.months).toBe(46)
    expect(result.monthsSaved).toBe(14)
    expect(result.interestSaved).toBeCloseTo(1598.64, 1)
    expect(result.summary).toContain('Time Saved: 14 mos | Interest Saved: $1,599')
  })

  it('handles 0 extra payment correctly (standard payoff matches accelerated)', () => {
    const result = calculateLoanPayoff({
      balance: 10000,
      rate: 6,
      monthlyPayment: 300,
      extraPayment: 0
    })

    expect(result.monthsSaved).toBe(0)
    expect(result.interestSaved).toBe(0)
    expect(result.standard.months).toBe(result.accelerated.months)
  })

  it('throws error when monthly payment is insufficient to cover interest', () => {
    expect(() => calculateLoanPayoff({
      balance: 20000,
      rate: 12, // $200/mo interest
      monthlyPayment: 150,
      extraPayment: 0
    })).toThrow('Monthly payment must be greater than monthly interest charges')
  })

  it('throws error for invalid balance, rate, or payment', () => {
    expect(() => calculateLoanPayoff({ balance: 0, rate: 5, monthlyPayment: 100 })).toThrow('Enter a valid positive loan balance.')
    expect(() => calculateLoanPayoff({ balance: 5000, rate: -1, monthlyPayment: 100 })).toThrow('Interest rate cannot be negative.')
    expect(() => calculateLoanPayoff({ balance: 5000, rate: 5, monthlyPayment: 0 })).toThrow('Enter a valid positive monthly payment.')
  })
})
