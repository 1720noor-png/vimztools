import { describe, it, expect } from 'vitest'
import { calculateCalorieDeficit } from './calorieDeficit.js'

describe('Health Engine: Calorie Deficit Planner (calculateCalorieDeficit)', () => {
  it('calculates correct daily deficit and target calories (185lbs to 165lbs in 10 weeks)', () => {
    const res = calculateCalorieDeficit({
      currentWeight: 185,
      targetWeight: 165,
      maintenanceTdee: 2400,
      timelineWeeks: 10,
      unit: 'lbs'
    })
    expect(res.totalWeightToLose).toBe(20)
    expect(res.totalLbsToLose).toBe(20)
    expect(res.dailyDeficit).toBe(1000)
    expect(res.targetDailyCalories).toBe(1400)
    expect(res.lossRatePerWeekLbs).toBe(2)
    expect(res.val).toContain('Target Daily Intake: 1400 kcal/day (1000 kcal deficit/day for 2.0 lbs/wk loss)')
  })

  it('calculates metric deficit in kg (80kg to 75kg in 10 weeks)', () => {
    const res = calculateCalorieDeficit({
      currentWeight: 80,
      targetWeight: 75,
      maintenanceTdee: 2200,
      timelineWeeks: 10,
      unit: 'kg'
    })
    expect(res.totalWeightToLose).toBe(5)
    expect(res.totalLbsToLose).toBeCloseTo(11.0, 1)
    expect(res.dailyDeficit).toBe(551)
    expect(res.targetDailyCalories).toBe(1649)
    expect(res.lossRatePerWeekKg).toBe(0.5)
  })

  it('flags aggressive deficit over 1000 kcal/day', () => {
    const res = calculateCalorieDeficit({
      currentWeight: 200,
      targetWeight: 180,
      maintenanceTdee: 2500,
      timelineWeeks: 5,
      unit: 'lbs'
    })
    expect(res.dailyDeficit).toBe(2000)
    expect(res.isAggressive).toBe(true)
  })

  it('throws an error if current weight is not greater than target weight', () => {
    expect(() =>
      calculateCalorieDeficit({
        currentWeight: 150,
        targetWeight: 160,
        maintenanceTdee: 2000,
        timelineWeeks: 8
      })
    ).toThrow('Current weight must be greater than target goal weight for a calorie deficit.')
  })

  it('throws an error for non-positive timeline or invalid TDEE', () => {
    expect(() =>
      calculateCalorieDeficit({
        currentWeight: 170,
        targetWeight: 160,
        maintenanceTdee: 2000,
        timelineWeeks: 0
      })
    ).toThrow('Timeline weeks must be greater than 0.')

    expect(() =>
      calculateCalorieDeficit({
        currentWeight: 170,
        targetWeight: 160,
        maintenanceTdee: 500,
        timelineWeeks: 8
      })
    ).toThrow('Maintenance calories (TDEE) must be at least 800 kcal.')

    expect(() =>
      calculateCalorieDeficit({
        currentWeight: 'invalid',
        targetWeight: 160,
        maintenanceTdee: 2000,
        timelineWeeks: 8
      })
    ).toThrow('All inputs must be valid numeric values.')
  })
})
