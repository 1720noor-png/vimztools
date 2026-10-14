import { describe, it, expect } from 'vitest'
import { calculateCreditCardPayoff } from './creditCardPayoff.js'

describe('Credit Card Fixed Payment Payoff Calculator (tool-core)', () => {
  it('calculates payoff timeline for $5000 balance at 21.9% APR with $200/mo payment', () => {
    const result = calculateCreditCardPayoff({
      balance: 5000,
      apr: 21.9,
      fixedPayment: 200
    })

    expect(result.balance).toBe(5000)
    expect(result.apr).toBe(21.9)
    expect(result.fixedPayment).toBe(200)
    expect(result.minMonthlyInterest).toBeCloseTo(91.25, 2)
    expect(result.months).toBe(34)
    expect(result.years).toBe(2.8)
    expect(result.totalPaid).toBe(6800)
    expect(result.totalInterest).toBe(1800)
    expect(result.summary).toContain('Paid off in 34 months (2.8 yrs)')
  })

  it('throws error if monthly payment is less than or equal to monthly interest', () => {
    expect(() => calculateCreditCardPayoff({
      balance: 5000,
      apr: 24, // 2% per month = $100 min interest
      fixedPayment: 100
    })).toThrow('Monthly payment must be greater than monthly interest ($100.00).')

    expect(() => calculateCreditCardPayoff({
      balance: 5000,
      apr: 24,
      fixedPayment: 50
    })).toThrow('Monthly payment must be greater than monthly interest ($100.00).')
  })

  it('throws error for invalid balance, APR, or payment', () => {
    expect(() => calculateCreditCardPayoff({ balance: 0, apr: 20, fixedPayment: 100 })).toThrow('Enter valid positive card balance, APR, and payment.')
    expect(() => calculateCreditCardPayoff({ balance: 1000, apr: 0, fixedPayment: 100 })).toThrow('Enter valid positive card balance, APR, and payment.')
    expect(() => calculateCreditCardPayoff({ balance: 1000, apr: 20, fixedPayment: 0 })).toThrow('Enter valid positive card balance, APR, and payment.')
  })
})
