import { describe, it, expect } from 'vitest'
import { calculateGpa } from './gpaCalculator.js'

describe('GPA & CGPA Calculator (tool-core)', () => {
  it('calculates semester GPA for 3 courses (A, B+, A-)', () => {
    const result = calculateGpa({
      courses: [
        { grade: 'A', credits: 3 },  // 4.0 * 3 = 12
        { grade: 'B+', credits: 4 }, // 3.3 * 4 = 13.2
        { grade: 'A-', credits: 3 }  // 3.7 * 3 = 11.1
      ]
    })

    // Total credits: 10, total points: 36.3 => GPA = 3.63
    expect(result.semesterCredits).toBe(10)
    expect(result.semesterPoints).toBeCloseTo(36.3, 2)
    expect(result.gpa).toBe(3.63)
    expect(result.formattedGpa).toBe('3.63')
    expect(result.cgpa).toBeNull()
  })

  it('calculates cumulative CGPA when previous credits and GPA are supplied', () => {
    const result = calculateGpa({
      courses: [
        { grade: 'A', credits: 4 } // 4.0 * 4 = 16 pts
      ],
      previousCgpa: 3.5,
      previousCredits: 30 // 3.5 * 30 = 105 pts
    })

    // (105 + 16) / 34 = 121 / 34 = 3.5588 => 3.56
    expect(result.gpa).toBe(4.0)
    expect(result.cgpa).toBe(3.56)
    expect(result.formattedCgpa).toBe('3.56')
    expect(result.summary).toContain('Cumulative CGPA: 3.56')
  })

  it('throws error when no valid courses are provided', () => {
    expect(() => calculateGpa({ courses: [] })).toThrow('Enter credit hours greater than 0 for every course you list.')
  })

  it('throws error for invalid grade letter or non-positive credit hours', () => {
    expect(() => calculateGpa({ courses: [{ grade: 'Z', credits: 3 }] })).toThrow('Invalid letter grade')
    expect(() => calculateGpa({ courses: [{ grade: 'A', credits: 0 }] })).toThrow('Enter credit hours greater than 0 for every course you list.')
  })

  it('throws error for invalid previous CGPA parameters', () => {
    expect(() => calculateGpa({
      courses: [{ grade: 'A', credits: 3 }],
      previousCgpa: 4.5,
      previousCredits: 20
    })).toThrow('For CGPA enter both a previous CGPA (0–4)')
  })
})
