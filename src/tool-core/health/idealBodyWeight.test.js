import { describe, it, expect } from 'vitest'
import { calculateIdealBodyWeight } from './idealBodyWeight.js'

describe('Health Engine: Ideal Body Weight (calculateIdealBodyWeight)', () => {
  it('calculates Devine ideal weight for 175cm male', () => {
    const res = calculateIdealBodyWeight({ heightCm: 175, gender: 'male' })
    expect(res.devineKgFormatted).toBe('70.5')
    expect(res.ibwLbsFormatted).toBe('155.3')
    expect(res.val).toContain('70.5 kg (155.3 lbs)')
  })

  it('calculates Devine ideal weight for 160cm female', () => {
    const res = calculateIdealBodyWeight({ heightCm: 160, gender: 'female' })
    expect(res.devineKgFormatted).toBe('52.4')
    expect(res.ibwLbsFormatted).toBe('115.5')
    expect(res.gender).toBe('female')
  })

  it('handles height below 60 inches (150cm) without dropping below base', () => {
    const res = calculateIdealBodyWeight({ heightCm: 150, gender: 'male' })
    expect(res.devineKgFormatted).toBe('50.0')
  })

  it('throws an error for height out of clinical bounds', () => {
    expect(() => calculateIdealBodyWeight({ heightCm: 80, gender: 'male' })).toThrow(
      'Please enter a valid height between 100 cm and 250 cm.'
    )
    expect(() => calculateIdealBodyWeight({ heightCm: 300, gender: 'male' })).toThrow(
      'Please enter a valid height between 100 cm and 250 cm.'
    )
  })

  it('throws an error for invalid gender', () => {
    expect(() => calculateIdealBodyWeight({ heightCm: 175, gender: 'other' })).toThrow(
      'Gender must be either "male" or "female".'
    )
  })
})
