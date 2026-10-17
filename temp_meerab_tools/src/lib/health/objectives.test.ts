import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  weightAtBmi,
  weightGoalPlan,
  weightGainPlan,
  maintenanceWeightKg,
  fatGramsFromKcal,
  servingNutrition,
  hydrationNeedsMl,
  hotWeatherFluidMl,
} from './objectives.ts'

test('weight at a target BMI', () => {
  assert.equal(weightAtBmi(25, 180), 81)
  assert.equal(weightAtBmi(18.5, 170), 53)
  assert.equal(weightAtBmi(0, 170), null)
  assert.equal(weightAtBmi(22, 80), null)
})

test('weight loss goal plan', () => {
  const p = weightGoalPlan(100, 85, 10)
  assert.ok(p)
  assert.equal(p.lossKg, 15)
  assert.equal(p.rateKgPerWeek, 1.5)
  assert.equal(p.dailyDeficitKcal, 1650)
  assert.equal(weightGoalPlan(80, 90, 10), null)
  assert.equal(weightGoalPlan(80, 70, 0), null)
})

test('weight gain plan', () => {
  const p = weightGainPlan(60, 65, 5)
  assert.ok(p)
  assert.equal(p.gainKg, 5)
  assert.equal(p.rateKgPerWeek, 1)
  assert.equal(p.dailySurplusKcal, 1100)
  assert.equal(weightGainPlan(65, 60, 5), null)
})

test('maintenance weight from intake', () => {
  assert.equal(maintenanceWeightKg(3000, 35), 86)
  assert.equal(maintenanceWeightKg(2000, 0), null)
  assert.equal(maintenanceWeightKg(0, 30), null)
})

test('fat grams from calories', () => {
  assert.equal(fatGramsFromKcal(2000, 30), 67)
  assert.equal(fatGramsFromKcal(2000, 0), 0)
  assert.equal(fatGramsFromKcal(2000, 101), null)
})

test('serving nutrition scales from per-100g', () => {
  const n = servingNutrition(200, 10, 20, 8, 3, 50)
  assert.ok(n)
  assert.equal(n.kcal, 100)
  assert.equal(n.proteinG, 5)
  assert.equal(n.carbsG, 10)
  assert.equal(n.fatG, 4)
  assert.equal(n.fiberG, 1.5)
  assert.equal(servingNutrition(200, 10, 20, 8, 3, 0), null)
})

test('hydration needs include age, heat and exercise', () => {
  const a = hydrationNeedsMl(70, 30, 30, 20)
  const b = hydrationNeedsMl(70, 30, 30, 32)
  assert.ok(a)
  assert.ok(b)
  assert.ok(b > a)
  assert.equal(hydrationNeedsMl(0, 30, 30, 20), null)
})

test('hot weather fluid adds heat and humidity allowances', () => {
  const a = hotWeatherFluidMl(70, 25, 40, 0)
  const b = hotWeatherFluidMl(70, 36, 80, 60)
  assert.ok(a)
  assert.ok(b)
  assert.ok(b > a)
  assert.equal(hotWeatherFluidMl(70, 25, 101, 0), null)
})