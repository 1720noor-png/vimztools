import { describe, it, expect } from 'vitest'
import { solveQuadratic } from './quadraticSolver.js'

describe('Math Engine: Quadratic Solver (solveQuadratic)', () => {
  it('solves two real distinct roots correctly (x² - 5x + 6 = 0)', () => {
    const res = solveQuadratic({ a: 1, b: -5, c: 6 })
    expect(res.type).toBe('two_real')
    expect(res.discriminant).toBe(1)
    expect(res.x1).toBe(3)
    expect(res.x2).toBe(2)
    expect(res.x1Formatted).toBe('3.0000')
    expect(res.x2Formatted).toBe('2.0000')
    expect(res.val).toContain('x₁ = 3.0000, x₂ = 2.0000')
  })

  it('solves two real roots with string inputs', () => {
    const res = solveQuadratic({ a: '1', b: '0', c: '-4' })
    expect(res.type).toBe('two_real')
    expect(res.discriminant).toBe(16)
    expect(res.x1).toBe(2)
    expect(res.x2).toBe(-2)
  })

  it('solves single repeated root when discriminant is zero (x² - 4x + 4 = 0)', () => {
    const res = solveQuadratic({ a: 1, b: -4, c: 4 })
    expect(res.type).toBe('single_real')
    expect(res.discriminant).toBe(0)
    expect(res.x1).toBe(2)
    expect(res.x2).toBe(2)
    expect(res.val).toContain('Single Root x = 2.0000')
  })

  it('solves complex roots when discriminant is negative (x² + 2x + 5 = 0)', () => {
    const res = solveQuadratic({ a: 1, b: 2, c: 5 })
    expect(res.type).toBe('complex')
    expect(res.discriminant).toBe(-16)
    expect(res.realPart).toBe(-1)
    expect(res.imagPart).toBe(2)
    expect(res.roots).toBe('No real roots')
    expect(res.val).toContain('-1.0000 + 2.0000i')
  })

  it('throws an error when coefficient "a" is zero', () => {
    expect(() => solveQuadratic({ a: 0, b: 2, c: 3 })).toThrow(
      'Coefficient "a" cannot be zero in a quadratic equation.'
    )
  })

  it('throws an error when non-numeric inputs are provided', () => {
    expect(() => solveQuadratic({ a: 'invalid', b: 2, c: 3 })).toThrow(
      'All coefficients (a, b, c) must be valid numbers.'
    )
  })
})
