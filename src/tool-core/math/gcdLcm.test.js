import { describe, it, expect } from 'vitest'
import { calculateGcdLcm } from './gcdLcm.js'

describe('Math Engine: GCD & LCM (calculateGcdLcm)', () => {
  it('calculates correct GCD and LCM for 24 and 36', () => {
    const res = calculateGcdLcm({ a: 24, b: 36 })
    expect(res.gcd).toBe(12)
    expect(res.lcm).toBe(72)
    expect(res.val).toContain('GCD (24, 36): 12 | LCM (24, 36): 72')
  })

  it('calculates correct GCD and LCM for coprime numbers (7 and 13)', () => {
    const res = calculateGcdLcm({ a: 7, b: 13 })
    expect(res.gcd).toBe(1)
    expect(res.lcm).toBe(91)
  })

  it('handles string inputs correctly', () => {
    const res = calculateGcdLcm({ a: '45', b: '60' })
    expect(res.gcd).toBe(15)
    expect(res.lcm).toBe(180)
  })

  it('calculates GCD and LCM for multiple numbers array', () => {
    const res = calculateGcdLcm({ numbers: [12, 18, 24] })
    expect(res.gcd).toBe(6)
    expect(res.lcm).toBe(72)
  })

  it('calculates GCD and LCM when passed arbitrary object values', () => {
    const res = calculateGcdLcm({ first: 12, second: 18 })
    expect(res.gcd).toBe(6)
    expect(res.lcm).toBe(36)
  })

  it('throws error when fewer than 2 positive integers are provided', () => {
    expect(() => calculateGcdLcm({ a: 0, b: 12 })).toThrow(
      'Please enter at least two positive integers.'
    )
    expect(() => calculateGcdLcm({ a: -5, b: 0 })).toThrow(
      'Please enter at least two positive integers.'
    )
  })
})
