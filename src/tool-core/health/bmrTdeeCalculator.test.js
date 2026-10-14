import { describe, it, expect } from 'vitest'
import { calculateBmrTdee } from './bmrTdeeCalculator.js'

describe('Health Engine: BMR & TDEE Calculator (calculateBmrTdee)', () => {
  it('calculates Mifflin-St Jeor BMR & TDEE for adult male', () => {
    const res = calculateBmrTdee({
      weightKg: 70,
      heightCm: 175,
      age: 28,
      gender: 'male',
      activity: 1.375
    })
    expect(res.bmr).toBe(1659)
    expect(res.tdee).toBe(2281)
    expect(res.weightLossCalories).toBe(1781)
    expect(res.muscleGainCalories).toBe(2781)
    expect(res.summary).toContain('BMR: 1659 kcal/day')
  })

  it('calculates Mifflin-St Jeor BMR & TDEE for adult female', () => {
    const res = calculateBmrTdee({
      weightKg: 60,
      heightCm: 165,
      age: 25,
      gender: 'female',
      activity: 1.2
    })
    expect(res.bmr).toBe(1345)
    expect(res.tdee).toBe(1614)
    expect(res.gender).toBe('female')
  })

  it('throws an error for out of range inputs', () => {
    expect(() => calculateBmrTdee({ weightKg: 10, heightCm: 175, age: 25, gender: 'male' })).toThrow(
      'Please enter a realistic weight between 20 kg and 350 kg.'
    )
    expect(() => calculateBmrTdee({ weightKg: 70, heightCm: 50, age: 25, gender: 'male' })).toThrow(
      'Please enter a realistic height between 80 cm and 260 cm.'
    )
    expect(() => calculateBmrTdee({ weightKg: 70, heightCm: 175, age: 150, gender: 'male' })).toThrow(
      'Please enter a valid age between 10 and 120 years.'
    )
    expect(() => calculateBmrTdee({ weightKg: 70, heightCm: 175, age: 25, gender: 'alien' })).toThrow(
      'Gender must be "male" or "female".'
    )
  })
})
