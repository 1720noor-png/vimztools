import { test } from 'node:test'
import assert from 'node:assert/strict'
import { naegeleDueDate, lutealPhaseFertileWindow, acogPregnancyWeightGain, breastfeedingCalorieBonus, pediatricBSA, quicki, recommendedSleepHours, jetLagDays } from './womenSleep.ts'

test('Naegele adds 280 days', () => {
  const due = naegeleDueDate('2026-01-01')!
  const local = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`
  assert.equal(local, '2026-10-08')
  assert.equal(naegeleDueDate('garbage'), null)
})

test('fertile window assumes 14-day luteal phase', () => {
  const w = lutealPhaseFertileWindow(28)!
  assert.equal(w.ovulationDay, 14)
  assert.equal(w.fertileStart, 9)
  assert.equal(w.fertileEnd, 15)
  assert.equal(lutealPhaseFertileWindow(20), null)
})

test('ACOG weight gain by starting BMI', () => {
  assert.equal(acogPregnancyWeightGain(22)!.lowKg, 11.5)
  assert.equal(acogPregnancyWeightGain(22)!.highKg, 16)
  assert.equal(acogPregnancyWeightGain(32)!.lowKg, 5)
  assert.equal(acogPregnancyWeightGain(0), null)
})

test('breastfeeding bonus declines after 6/12 months', () => {
  assert.equal(breastfeedingCalorieBonus(3), 500)
  assert.equal(breastfeedingCalorieBonus(9), 400)
  assert.equal(breastfeedingCalorieBonus(18), 300)
})

test('pediatric BSA (Mosteller)', () => {
  assert.equal(Number(pediatricBSA(120, 25)!.toFixed(2)), 0.91)
  assert.equal(pediatricBSA(0, 25), null)
})

test('QUICKI formula', () => {
  assert.ok(Math.abs(Number(quicki(10, 90)!.toFixed(3)) - 0.339) < 0.01)
  assert.equal(quicki(0, 90), null)
})

test('recommended sleep by age group', () => {
  assert.equal(recommendedSleepHours(10)!.low, 9)
  assert.equal(recommendedSleepHours(10)!.high, 11)
  assert.equal(recommendedSleepHours(40)!.low, 7)
  assert.equal(recommendedSleepHours(80)!.low, 7)
  assert.equal(recommendedSleepHours(200), null)
})

test('jet lag recovery estimate', () => {
  assert.equal(jetLagDays(6, 'east'), 3.5)
  assert.equal(jetLagDays(6, 'west'), 3)
  assert.equal(jetLagDays(0, 'east'), null)
})