import { describe, it, expect } from 'vitest'
import { calculateStandardDeviation } from './standardDeviation.js'

describe('Math Engine: Standard Deviation (calculateStandardDeviation)', () => {
  it('calculates mean, sample SD, and population SD for comma-separated dataset', () => {
    const res = calculateStandardDeviation({ numbers: '12, 15, 18, 22, 25, 30' })
    expect(res.count).toBe(6)
    expect(res.sum).toBe(122)
    expect(res.mean).toBeCloseTo(20.3333, 4)
    expect(res.varianceSample).toBeCloseTo(44.2667, 3)
    expect(res.stdDevSample).toBeCloseTo(6.6533, 3)
    expect(res.variancePop).toBeCloseTo(36.8889, 3)
    expect(res.stdDevPop).toBeCloseTo(6.0736, 3)
    expect(res.val).toContain('Mean: 20.33')
  })

  it('calculates statistics for an array of numbers', () => {
    const res = calculateStandardDeviation({ numbers: [10, 20, 30, 40, 50] })
    expect(res.count).toBe(5)
    expect(res.sum).toBe(150)
    expect(res.mean).toBe(30)
    expect(res.variancePop).toBe(200)
    expect(res.stdDevPop).toBeCloseTo(14.1421, 4)
    expect(res.varianceSample).toBe(250)
    expect(res.stdDevSample).toBeCloseTo(15.8114, 4)
  })

  it('handles space and newline delimited inputs', () => {
    const res = calculateStandardDeviation({ numbers: '10   20\n30' })
    expect(res.count).toBe(3)
    expect(res.mean).toBe(20)
  })

  it('throws an error if fewer than 2 valid numbers are supplied', () => {
    expect(() => calculateStandardDeviation({ numbers: '42' })).toThrow(
      'Enter at least 2 valid numbers to calculate standard deviation.'
    )
    expect(() => calculateStandardDeviation({ numbers: '' })).toThrow(
      'Enter at least 2 valid numbers to calculate standard deviation.'
    )
  })
})
