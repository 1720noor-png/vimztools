import { describe, it, expect } from 'vitest'
import { calculateGrade, GRADE_SCALE } from './gradeCalculator.js'

describe('Grade Calculator (tool-core)', () => {
  it('calculates aggregate marks, percentage, and letter grade A correctly', () => {
    const result = calculateGrade({
      assessments: [
        { name: 'Midterm', marks: 45, total: 50 },
        { name: 'Final', marks: 48, total: 50 }
      ]
    })

    // 93 / 100 = 93.00% => A
    expect(result.totalMarksObtained).toBe(93)
    expect(result.totalMarksPossible).toBe(100)
    expect(result.percentage).toBe(93.00)
    expect(result.formattedPercentage).toBe('93.00')
    expect(result.grade).toBe('A')
    expect(result.summary).toBe('93 / 100 = 93.00% · Grade A')
  })

  it('calculates grade B, C, D, F across thresholds', () => {
    // 85% -> B
    expect(calculateGrade({ assessments: [{ marks: 85, total: 100 }] }).grade).toBe('B')
    // 75% -> C
    expect(calculateGrade({ assessments: [{ marks: 75, total: 100 }] }).grade).toBe('C')
    // 65% -> D
    expect(calculateGrade({ assessments: [{ marks: 65, total: 100 }] }).grade).toBe('D')
    // 55% -> F
    expect(calculateGrade({ assessments: [{ marks: 55, total: 100 }] }).grade).toBe('F')
  })

  it('handles 0 marks obtained correctly without falsy bug', () => {
    const result = calculateGrade({
      assessments: [
        { name: 'Quiz 1', marks: 0, total: 10 }
      ]
    })

    expect(result.totalMarksObtained).toBe(0)
    expect(result.totalMarksPossible).toBe(10)
    expect(result.percentage).toBe(0.00)
    expect(result.grade).toBe('F')
  })

  it('throws when no assessments are provided', () => {
    expect(() => calculateGrade({ assessments: [] })).toThrow(
      'Enter marks and total marks for at least one assessment.'
    )
  })

  it('throws validation error when marks exceed total or total is zero/negative', () => {
    expect(() =>
      calculateGrade({
        assessments: [{ name: 'Exam', marks: 105, total: 100 }]
      })
    ).toThrow('Check “Exam”: total must be above 0 and marks must be between 0 and the total.')

    expect(() =>
      calculateGrade({
        assessments: [{ name: 'Project', marks: -5, total: 100 }]
      })
    ).toThrow('Check “Project”: total must be above 0 and marks must be between 0 and the total.')

    expect(() =>
      calculateGrade({
        assessments: [{ name: '', marks: 50, total: 0 }]
      })
    ).toThrow('Check “assessment”: total must be above 0 and marks must be between 0 and the total.')
  })

  it('supports custom grading scale', () => {
    const customScale = [
      [95, 'A+'],
      [85, 'A'],
      [70, 'B'],
      [0, 'F']
    ]
    const result = calculateGrade({
      assessments: [{ marks: 96, total: 100 }],
      scale: customScale
    })
    expect(result.grade).toBe('A+')
  })
})
