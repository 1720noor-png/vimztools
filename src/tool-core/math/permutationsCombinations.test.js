import { describe, it, expect } from 'vitest'
import { calculatePermutationsCombinations } from './permutationsCombinations.js'

describe('Math Engine: Permutations & Combinations (calculatePermutationsCombinations)', () => {
  it('calculates correct nPr and nCr for n=10, r=3', () => {
    const res = calculatePermutationsCombinations({ n: 10, r: 3 })
    expect(res.nPr).toBe(720)
    expect(res.nCr).toBe(120)
    expect(res.val).toContain('Combinations nCr (Order doesn\'t matter): 120')
    expect(res.val).toContain('Permutations nPr (Order matters): 720')
  })

  it('handles edge case where r = 0 (P(n,0)=1, C(n,0)=1)', () => {
    const res = calculatePermutationsCombinations({ n: 5, r: 0 })
    expect(res.nPr).toBe(1)
    expect(res.nCr).toBe(1)
  })

  it('handles edge case where r = n (P(n,n)=n!, C(n,n)=1)', () => {
    const res = calculatePermutationsCombinations({ n: 5, r: 5 })
    expect(res.nPr).toBe(120)
    expect(res.nCr).toBe(1)
  })

  it('accurately computes larger combinatorics using BigInt (n=30, r=4)', () => {
    const res = calculatePermutationsCombinations({ n: '30', r: '4' })
    expect(res.nPr).toBe(657720)
    expect(res.nCr).toBe(27405)
  })

  it('throws an error if r is greater than n', () => {
    expect(() => calculatePermutationsCombinations({ n: 3, r: 5 })).toThrow(
      'Number of items chosen (r) cannot exceed total items (n).'
    )
  })

  it('throws an error for negative values', () => {
    expect(() => calculatePermutationsCombinations({ n: -5, r: 2 })).toThrow(
      'n and r must be non-negative integers.'
    )
  })

  it('throws an error for non-integer inputs', () => {
    expect(() => calculatePermutationsCombinations({ n: 'abc', r: 2 })).toThrow(
      'Both n and r must be valid integers.'
    )
  })
})
