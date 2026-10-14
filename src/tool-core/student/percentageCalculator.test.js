import { describe, it, expect } from 'vitest'
import { calculatePercentage } from './percentageCalculator.js'

describe('Percentage Calculator (tool-core)', () => {
  describe("Mode 'of': What is X% of Y?", () => {
    it('calculates percentage of a number correctly', () => {
      // 25% of 200 = 50
      const result = calculatePercentage({ mode: 'of', a: 25, b: 200 })
      expect(result.result).toBe(50)
      expect(result.formatted).toBe('50')
    })

    it('handles decimal percentages and numbers', () => {
      // 7.5% of 80 = 6
      const result = calculatePercentage({ mode: 'of', a: '7.5', b: '80' })
      expect(result.result).toBe(6)
      expect(result.formatted).toBe('6')
    })
  })

  describe("Mode 'is': X is what % of Y?", () => {
    it('calculates ratio percentage correctly', () => {
      // 45 is what % of 90? => 50%
      const result = calculatePercentage({ mode: 'is', a: 45, b: 90 })
      expect(result.result).toBe(50)
      expect(result.formatted).toBe('50%')
    })

    it('throws error when dividing by zero in is mode', () => {
      expect(() => calculatePercentage({ mode: 'is', a: 10, b: 0 })).toThrow(
        'That calculation would divide by zero. Change the number.'
      )
    })
  })

  describe("Mode 'chg': Percent change from X to Y", () => {
    it('calculates positive percentage change (increase)', () => {
      // 100 to 125 = +25%
      const result = calculatePercentage({ mode: 'chg', a: 100, b: 125 })
      expect(result.result).toBe(25)
      expect(result.formatted).toBe('25%')
    })

    it('calculates negative percentage change (decrease)', () => {
      // 100 to 80 = -20%
      const result = calculatePercentage({ mode: 'chg', a: 100, b: 80 })
      expect(result.result).toBe(-20)
      expect(result.formatted).toBe('-20%')
    })

    it('throws error when dividing by zero in chg mode', () => {
      expect(() => calculatePercentage({ mode: 'chg', a: 0, b: 50 })).toThrow(
        'That calculation would divide by zero. Change the number.'
      )
    })
  })

  describe('Validation & Boundary Cases', () => {
    it('throws error when either number is missing or empty', () => {
      expect(() => calculatePercentage({ a: '', b: 100 })).toThrow('Enter both numbers.')
      expect(() => calculatePercentage({ a: 10, b: '' })).toThrow('Enter both numbers.')
      expect(() => calculatePercentage({ a: 'abc', b: 100 })).toThrow('Enter both numbers.')
    })

    it('handles zero percentage in of mode without throwing', () => {
      // 0% of 100 = 0
      const result = calculatePercentage({ mode: 'of', a: 0, b: 100 })
      expect(result.result).toBe(0)
      expect(result.formatted).toBe('0')
    })

    it('throws error for unknown mode', () => {
      expect(() => calculatePercentage({ mode: 'invalid', a: 10, b: 20 })).toThrow(
        'Unknown mode'
      )
    })
  })
})
