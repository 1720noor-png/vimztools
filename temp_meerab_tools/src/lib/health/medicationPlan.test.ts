import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  spacedDosingTimes, daysOfSupply, missedDoseAdvice, interactionTier,
  steadyStateDays, monthlyCost, doseUnitConvert, daysToExpiry,
} from './medicationPlan.ts'

test('spaced dosing times', () => {
  const three = spacedDosingTimes(3)
  assert.ok(three)
  assert.equal(three.intervalHrs, '8 hours')
  assert.equal(three.times.length, 3)
  assert.equal(spacedDosingTimes(0), null)
})

test('days of supply', () => {
  assert.equal(daysOfSupply(30, 1), 30)
  assert.equal(daysOfSupply(28, 2), 14)
  assert.equal(daysOfSupply(28, 0), null)
})

test('missed dose advice', () => {
  assert.ok(missedDoseAdvice(4)?.includes('do not double'))
  assert.ok(missedDoseAdvice(24)?.includes('never take two'))
  assert.equal(missedDoseAdvice(0), null)
})

test('interaction tier', () => {
  assert.ok(interactionTier('nsaid', 'anticoag')?.includes('High alert'))
  assert.ok(interactionTier('anticoag', 'nsaid')?.includes('High alert'))
  assert.equal(interactionTier('metformin', 'statin'), 'Watch closely - increased risk of bleeding or side effects. Verify dosing with a professional.')
  assert.equal(interactionTier('antacid', 'antihistamine'), 'No obvious serious pair mined from the general families here - still confirm with a pharmacist.')
})

test('steady state days', () => {
  assert.equal(steadyStateDays(24), 5)
  assert.equal(steadyStateDays(72), 15)
  assert.equal(steadyStateDays(-2), null)
})

test('monthly cost', () => {
  assert.equal(monthlyCost(2, 2), 121.68)
  assert.equal(monthlyCost(1, 0), null)
})

test('unit conversion', () => {
  assert.equal(doseUnitConvert(5, 'mg', 'mcg'), 5000)
  assert.equal(doseUnitConvert(500, 'mcg', 'mg'), 0.5)
  assert.equal(doseUnitConvert(2, 'mg', 'mg'), 2)
})

test('days to expiry', () => {
  const d = daysToExpiry(new Date(Date.now() + 3 * 86400000).toISOString())
  assert.ok(d)
  assert.equal(d, 3)
  assert.equal(daysToExpiry('nope'), null)
})