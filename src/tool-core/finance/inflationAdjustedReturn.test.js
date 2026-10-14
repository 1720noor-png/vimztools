import { describe, it, expect } from 'vitest'
import { calculateInflationAdjustedReturn } from './inflationAdjustedReturn.js'

describe('Inflation-Adjusted (Real) Return Calculator (tool-core)', () => {
  it('calculates real purchasing power return for 9.5% nominal and 3.2% inflation', () => {
    const result = calculateInflationAdjustedReturn({
      nominalReturn: 9.5,
      inflationRate: 3.2
    })

    expect(result.nominalReturn).toBe(9.5)
    expect(result.inflationRate).toBe(3.2)
    expect(result.realReturn).toBeCloseTo(6.1046, 3)
    expect(result.formattedRealReturn).toBe('6.10%')
    expect(result.summary).toContain('Real Purchasing Power Return: 6.10%')
  })

  it('handles negative real return when inflation exceeds nominal return', () => {
    const result = calculateInflationAdjustedReturn({
      nominalReturn: 3,
      inflationRate: 7
    })

    expect(result.realReturn).toBeCloseTo(-3.738, 2)
    expect(result.formattedRealReturn).toBe('-3.74%')
  })

  it('throws validation error for invalid numeric inputs or extreme inflation', () => {
    expect(() => calculateInflationAdjustedReturn({ nominalReturn: 'abc', inflationRate: 3 })).toThrow('Enter valid percentage rates.')
    expect(() => calculateInflationAdjustedReturn({ nominalReturn: 10, inflationRate: 'xyz' })).toThrow('Enter valid percentage rates.')
    expect(() => calculateInflationAdjustedReturn({ nominalReturn: 10, inflationRate: -100 })).toThrow('Inflation rate cannot be -100% or lower.')
  })
})
