import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  bmi, absi, absiBand, adjustedBodyWeight, ibw, healthyWeightRange,
  weightChangeKg, weightLossPct, weightGainPct, weightLossTimelineWeeks,
  weightLossRateKgPerWeek, maintenanceWeightKcal, midParentalHeight,
  bodyShape, idealBodyWeightVentilation,
} from './weight.ts'

test('bmi exact', () => {
  assert.equal(Number(bmi(80, 180)!.toFixed(2)), 24.69)
  assert.equal(bmi(0, 180), null)
  assert.equal(bmi(80, 0), null)
  assert.equal(bmi(NaN, 180), null)
})

test('absi uses meters and reference bands', () => {
  const a = absi(90, 180, 80)!
  assert.ok(Math.abs(a - 0.0791) < 0.001, `absi was ${a}`)
  assert.equal(absi(0, 180, 80), null)
  assert.equal(absiBand(0.095, 35, true), 'Above average risk - worth discussing')
  assert.equal(absiBand(0.08, 45, false), 'Average risk')
  assert.equal(absiBand(null, 30, false), 'Reference frame required (age 20+)')
})

test('adjusted body weight only adds 25% above IBW', () => {
  assert.equal(adjustedBodyWeight(80, 65), 68.75)
  assert.equal(adjustedBodyWeight(60, 65), 60)
  assert.equal(adjustedBodyWeight(0, 65), null)
})

test('ibw methods for 180cm male', () => {
  assert.equal(Number(ibw('male', 180, 'Devine')!.toFixed(1)), 75.0)
  assert.equal(Number(ibw('male', 180, 'Robinson')!.toFixed(1)), 70.6)
  assert.equal(Number(ibw('female', 180, 'Hamwi')!.toFixed(1)), 69.4)
  assert.equal(ibw('male', 0, 'Devine'), null)
})

test('healthy weight range', () => {
  const r = healthyWeightRange(180)!
  assert.equal(Number(r.lowKg.toFixed(2)), 59.94)
  assert.equal(Number(r.highKg.toFixed(2)), 80.68)
  assert.equal(healthyWeightRange(0), null)
})

test('weight changes and percentages', () => {
  assert.equal(weightChangeKg(80, 75), -5)
  assert.equal(weightChangeKg(0, 75), null)
  assert.equal(Number(weightLossPct(90, 85)!.toFixed(2)), 5.56)
  assert.equal(Number(weightGainPct(80, 84)!.toFixed(2)), 5.0)
})

test('timeline uses 7700 kcal per kg', () => {
  assert.equal(weightLossTimelineWeeks(90, 80, 500), 22)
  assert.equal(weightLossTimelineWeeks(80, 90, 500), null)
  assert.equal(weightLossRateKgPerWeek(2, 4), 0.5)
  assert.equal(weightLossRateKgPerWeek(2, 0), null)
})

test('misc helpers', () => {
  assert.equal(maintenanceWeightKcal(2400), 2400)
  assert.equal(maintenanceWeightKcal(0), null)
  assert.equal(midParentalHeight('male', 160, 180), 176.5)
  assert.equal(midParentalHeight('female', 160, 180), 163.5)
  assert.equal(midParentalHeight('male', 0, 180), null)
  assert.equal(bodyShape(70, 100), 'Hourglass / pear tendencies')
  assert.equal(bodyShape(80, 0), 'Invalid - enter positive values')
  assert.equal(Number(idealBodyWeightVentilation(180, 'male')!.toFixed(1)), 75.0)
})