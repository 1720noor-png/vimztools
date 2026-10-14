import { describe, it, expect } from 'vitest'
import { calculateSalaryToHourly } from './salaryToHourly.js'

describe('Salary to Hourly Wage Converter (tool-core)', () => {
  it('calculates hourly rate for standard 40 hrs / 52 wks schedule', () => {
    const result = calculateSalaryToHourly({ salary: 60000, hoursWeek: 40, weeksYear: 52 })
    expect(result.hourly).toBeCloseTo(28.846, 2)
    expect(result.formattedHourly).toBe('28.85')
    expect(result.formattedWeekly).toBe('1153.85')
    expect(result.formattedDaily).toBe('230.77')
    expect(result.formattedMonthly).toBe('5000.00')
  })

  it('uses default 40 hours and 52 weeks if omitted', () => {
    const result = calculateSalaryToHourly({ salary: '104000' })
    expect(result.hourly).toBe(50)
    expect(result.formattedHourly).toBe('50.00')
    expect(result.formattedWeekly).toBe('2000.00')
    expect(result.formattedDaily).toBe('400.00')
    expect(result.formattedMonthly).toBe('8666.67')
  })

  it('calculates custom schedule correctly (part-time: 20 hrs, 48 wks)', () => {
    const result = calculateSalaryToHourly({ salary: 24000, hoursWeek: 20, weeksYear: 48 })
    expect(result.hourly).toBe(25)
    expect(result.formattedHourly).toBe('25.00')
  })

  it('throws error for invalid salary', () => {
    expect(() => calculateSalaryToHourly({ salary: 0 })).toThrow('Enter a valid positive annual salary.')
    expect(() => calculateSalaryToHourly({ salary: -5000 })).toThrow('Enter a valid positive annual salary.')
    expect(() => calculateSalaryToHourly({ salary: 'invalid' })).toThrow('Enter a valid positive annual salary.')
  })

  it('throws error for invalid working hours or weeks', () => {
    expect(() => calculateSalaryToHourly({ salary: 50000, hoursWeek: 0 })).toThrow('Working hours and weeks must be greater than zero.')
    expect(() => calculateSalaryToHourly({ salary: 50000, weeksYear: -1 })).toThrow('Working hours and weeks must be greater than zero.')
  })
})
