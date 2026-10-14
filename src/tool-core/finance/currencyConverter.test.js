import { describe, it, expect } from 'vitest'
import { convertCurrency, BASELINE_FOREX_RATES } from './currencyConverter.js'

describe('Universal Currency Converter Engine (convertCurrency)', () => {
  it('converts USD to PKR using baseline rate', () => {
    const res = convertCurrency({ amount: 100, from: 'USD', to: 'PKR' })
    expect(res.amount).toBe(100)
    expect(res.from).toBe('USD')
    expect(res.to).toBe('PKR')
    expect(res.result).toBe(27850)
    expect(res.exchangeRate).toBe(278.5)
    expect(res.inverseRate).toBeCloseTo(1 / 278.5, 4)
  })

  it('converts cross-currency EUR to GBP accurately', () => {
    const res = convertCurrency({ amount: 50, from: 'EUR', to: 'GBP' })
    // EUR rate 0.92, GBP rate 0.78 => 50 * (0.78 / 0.92)
    const expected = 50 * (BASELINE_FOREX_RATES.GBP / BASELINE_FOREX_RATES.EUR)
    expect(res.result).toBeCloseTo(expected, 2)
  })

  it('handles identity currency conversion with exchangeRate 1.0', () => {
    const res = convertCurrency({ amount: 250, from: 'AED', to: 'AED' })
    expect(res.result).toBe(250)
    expect(res.exchangeRate).toBe(1.0)
    expect(res.inverseRate).toBe(1.0)
  })

  it('accepts lowercase currency codes and normalizes them', () => {
    const res = convertCurrency({ amount: 10, from: 'usd', to: 'sar' })
    expect(res.from).toBe('USD')
    expect(res.to).toBe('SAR')
    expect(res.result).toBe(37.5)
  })

  it('supports custom rates override', () => {
    const custom = { USD: 1.0, XYZ: 500.0 }
    const res = convertCurrency({ amount: 2, from: 'USD', to: 'XYZ', customRates: custom })
    expect(res.result).toBe(1000)
    expect(res.isCustomRates).toBe(true)
  })

  it('throws error on unsupported currency codes or negative amounts', () => {
    expect(() => convertCurrency({ amount: -10, from: 'USD', to: 'PKR' })).toThrow('Amount must be a non-negative number')
    expect(() => convertCurrency({ amount: 10, from: 'INVALID', to: 'PKR' })).toThrow('Unsupported or unknown source currency')
    expect(() => convertCurrency({ amount: 10, from: 'USD', to: 'UNKNOWN' })).toThrow('Unsupported or unknown target currency')
  })
})
