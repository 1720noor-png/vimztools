import { describe, it, expect } from 'vitest'
import { calculateBmi } from './bmiCalculator.js'

describe('Health Engine: BMI Calculator (calculateBmi)', () => {
  it('calculates normal healthy BMI correctly (70kg, 175cm)', () => {
    const res = calculateBmi({ weight: 70, height: 175 })
    expect(res.bmi).toBe(22.9)
    expect(res.bmiFormatted).toBe('22.9')
    expect(res.category).toBe('Normal / Healthy Weight')
    expect(res.healthyWeightMinKg).toBeCloseTo(56.7, 1)
    expect(res.healthyWeightMaxKg).toBeCloseTo(76.3, 1)
  })

  it('classifies underweight category correctly (< 18.5)', () => {
    const res = calculateBmi({ weight: 50, height: 175 })
    expect(res.bmi).toBe(16.3)
    expect(res.category).toBe('Underweight')
  })

  it('classifies overweight category correctly (25.0 - 29.9)', () => {
    const res = calculateBmi({ weight: 85, height: 175 })
    expect(res.bmi).toBe(27.8)
    expect(res.category).toBe('Overweight')
  })

  it('classifies obesity category correctly (>= 30.0)', () => {
    const res = calculateBmi({ weight: 110, height: 175 })
    expect(res.bmi).toBe(35.9)
    expect(res.category).toBe('Obesity Range')
  })

  it('handles imperial measurements accurately (154 lbs, 69 inches)', () => {
    const res = calculateBmi({ weight: 154, height: 69, unit: 'imperial' })
    expect(res.bmi).toBe(22.7)
    expect(res.category).toBe('Normal / Healthy Weight')
  })

  it('throws an error for non-positive or unrealistic inputs', () => {
    expect(() => calculateBmi({ weight: 0, height: 175 })).toThrow('Please enter a valid positive weight.')
    expect(() => calculateBmi({ weight: 70, height: -10 })).toThrow('Please enter a valid positive height.')
    expect(() => calculateBmi({ weight: 70, height: 350 })).toThrow('Please enter a realistic height between 50 cm and 280 cm.')
  })
})
