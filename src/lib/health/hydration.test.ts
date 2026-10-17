import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dailyFluidIntakeMl, exerciseFluidMl, sweatRateMlPerHour, waterBalanceMl, hydrationStatus } from './hydration.ts'

test('daily fluid intake scales with weight/climate/activity', () => {
  assert.equal(dailyFluidIntakeMl(70, 30, 'moderate'), 2810)
  assert.equal(dailyFluidIntakeMl(70, 0, 'hot'), 2800)
  assert.equal(dailyFluidIntakeMl(0, 30, 'moderate'), null)
})

test('exercise fluid per intensity', () => {
  assert.equal(exerciseFluidMl(70, 60, 'vigorous'), 1080)
  assert.equal(exerciseFluidMl(70, 60, 'light'), 420)
  assert.equal(exerciseFluidMl(0, 60, 'light'), null)
})

test('sweat rate uses pre-post weight + fluids', () => {
  assert.equal(sweatRateMlPerHour(72, 71.5, 500, 60), 1000)
  assert.equal(sweatRateMlPerHour(72, 71.5, 500, 0), null)
})

test('water balance signed', () => {
  assert.equal(waterBalanceMl(2500, 2200), 300)
  assert.equal(waterBalanceMl(-1, 2200), null)
  assert.equal(hydrationStatus(2.5), 'Severe dehydration risk - rehydrate now')
  assert.equal(hydrationStatus(0.5), 'Within normal range')
  assert.equal(hydrationStatus(null), 'Unknown')
})