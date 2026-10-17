import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  netCarbs, calorieSurplusKcal, dailyProteinTargetKgPerDay, dailyFiberTargetKcal,
  macroSplitFromKcal, calorieIntakeTarget, netCarbsToGlucoseEffectKcal, roastedPortionCalories,
} from './nutrition.ts'

test('net carbs subtracts fiber floor 0', () => {
  assert.equal(netCarbs(30, 8), 22)
  assert.equal(netCarbs(5, 12), 0)
  assert.equal(netCarbs(-1, 2), null)
})

test('calorie surplus signed', () => {
  assert.equal(calorieSurplusKcal(2200, 2500), -300)
  assert.equal(calorieSurplusKcal(2200, 0), null)
})

test('protein targets by activity', () => {
  assert.equal(dailyProteinTargetKgPerDay(70, 'athlete'), 112)
  assert.equal(dailyProteinTargetKgPerDay(70, 'sedentary'), 56)
  assert.equal(dailyProteinTargetKgPerDay(0, 'active'), null)
})

test('fiber target 14g per 1000 kcal', () => {
  assert.equal(dailyFiberTargetKcal(2000), 28)
  assert.equal(dailyFiberTargetKcal(0), null)
})

test('macro split enforces 100% and uses 4/4/9', () => {
  const m = macroSplitFromKcal(2000, 50, 20, 30)!
  assert.equal(m.carbsG, 250)
  assert.equal(m.proteinG, 100)
  assert.equal(Number(m.fatG.toFixed(2)), 66.67)
  assert.equal(macroSplitFromKcal(2000, 50, 20, 45), null)
  assert.equal(macroSplitFromKcal(0, 50, 20, 30), null)
})

test('calorie target Mifflin-St Jeor', () => {
  const male = calorieIntakeTarget(70, 175, 30, 'male', 1.375)!
  assert.equal(male, 2267)
  assert.equal(calorieIntakeTarget(0, 175, 30, 'male', 1.375), null)
})

test('carb effect and portions', () => {
  assert.equal(netCarbsToGlucoseEffectKcal(30), 120)
  assert.equal(roastedPortionCalories(2.5, 200), 500)
  assert.equal(roastedPortionCalories(0, 200), null)
})