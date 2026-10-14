import { describe, it, expect } from 'vitest'
import { calculateAttendance } from './attendanceCalculator.js'

describe('Attendance Calculator (tool-core)', () => {
  it('calculates attendance above target and classes that can be missed', () => {
    // 40 attended out of 45 held, target 75%
    // 40/45 = 88.89%
    // can miss: floor((40 * 100) / 75 - 45) = floor(53.333 - 45) = 8
    const result = calculateAttendance({
      attended: 40,
      total: 45,
      target: 75
    })

    expect(result.percentage).toBe(88.89)
    expect(result.formattedPercentage).toBe('88.89')
    expect(result.canMiss).toBe(8)
    expect(result.mustAttend).toBeNull()
    expect(result.message).toContain('Current attendance: 88.89%')
    expect(result.message).toContain('You can miss 8 more class(es)')
  })

  it('calculates classes needed to reach target when attendance is below target', () => {
    // 25 attended out of 40 held, target 75%
    // 25/40 = 62.5%
    // must attend: ceil((75 * 40 - 100 * 25) / (100 - 75)) = ceil((3000 - 2500) / 25) = ceil(500 / 25) = 20
    const result = calculateAttendance({
      attended: 25,
      total: 40,
      target: 75
    })

    expect(result.percentage).toBe(62.50)
    expect(result.mustAttend).toBe(20)
    expect(result.canMiss).toBeNull()
    expect(result.message).toContain('Attend the next 20 class(es) in a row')
  })

  it('handles 100% target when already missed classes', () => {
    const result = calculateAttendance({
      attended: 9,
      total: 10,
      target: 100
    })

    expect(result.canReachTarget).toBe(false)
    expect(result.message).toContain('You cannot reach 100% because past absences cannot be undone.')
  })

  it('handles 0 attended correctly without falsy bugs', () => {
    const result = calculateAttendance({
      attended: 0,
      total: 10,
      target: 50
    })

    expect(result.percentage).toBe(0.00)
    expect(result.attended).toBe(0)
    expect(result.mustAttend).toBe(10)
  })

  it('throws error for invalid integer inputs or negative attended', () => {
    expect(() => calculateAttendance({ attended: -1, total: 10 })).toThrow(
      'Enter whole numbers: classes attended (0 or more) and total classes (above 0).'
    )
    expect(() => calculateAttendance({ attended: 2.5, total: 10 })).toThrow(
      'Enter whole numbers'
    )
    expect(() => calculateAttendance({ attended: '', total: '' })).toThrow(
      'Enter whole numbers'
    )
  })

  it('throws error when attended > total', () => {
    expect(() => calculateAttendance({ attended: 15, total: 10 })).toThrow(
      'Classes attended cannot be more than total classes.'
    )
  })

  it('throws error for invalid target percentage', () => {
    expect(() => calculateAttendance({ attended: 10, total: 10, target: 0 })).toThrow(
      'Target must be above 0 and at most 100.'
    )
    expect(() => calculateAttendance({ attended: 10, total: 10, target: 105 })).toThrow(
      'Target must be above 0 and at most 100.'
    )
  })
})
