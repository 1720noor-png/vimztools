import assert from 'node:assert'
import test from 'node:test'
import {
  brushingHabitScore, brushingScoreBand, flossingStatus, whiteningFrequency,
  fluorideCoverage, dryMouthScore, dryMouthBand, badBreathScore, badBreathBand,
  gumHealthScore, gumHealthBand, scalpHealthScore, scalpHealthBand, hairWashFrequency,
  skinMoistureRoutine, moleAwarenessScore, moleAwarenessBand,
} from './dentalBeauty.ts'

test('brushing habit score', () => {
  assert.equal(brushingHabitScore(2, 2, 7, true, true), 100)
  assert.equal(brushingHabitScore(1, 1, 1, false, false), 27)
  assert.equal(brushingHabitScore(0, 0, 0, false, false), 0)
  assert.equal(brushingHabitScore(4, 3, 10, true, true), 100)
  assert.equal(brushingHabitScore(-1, 2, 7, true, true), null)
  assert.equal(brushingScoreBand(100), 'Excellent routine')
  assert.equal(brushingScoreBand(20), 'Needs a reset')
})

test('flossing status', () => {
  assert.equal(flossingStatus(7)?.band, 'Daily - gold standard')
  assert.equal(flossingStatus(3)?.times, 3)
  assert.equal(flossingStatus(0)?.band, 'Not yet started')
  assert.equal(flossingStatus(-1), null)
})

test('whitening frequency', () => {
  assert.equal(whiteningFrequency(0, false)?.band, 'Low frequency')
  assert.equal(whiteningFrequency(5, false)?.band, 'High frequency')
  assert.equal(whiteningFrequency(2, false)?.band, 'Moderate use')
  assert.equal(whiteningFrequency(1, true)?.band, 'Sensitive teeth - careful')
  assert.equal(whiteningFrequency(-1, false), null)
})

test('fluoride coverage', () => {
  assert.equal(fluorideCoverage(true, true, true)?.count, 3)
  assert.equal(fluorideCoverage(true, true, true)?.band, 'Full fluoride shield')
  assert.equal(fluorideCoverage(false, false, false)?.band, 'Low coverage')
})

test('dry mouth', () => {
  assert.equal(dryMouthScore(true, true, true, true, true), 5)
  assert.equal(dryMouthScore(false, false, false, false, false), 0)
  assert.equal(dryMouthBand(4), 'Pronounced dry mouth')
  assert.equal(dryMouthBand(2), 'Noticeable dry mouth')
})

test('bad breath', () => {
  assert.equal(badBreathScore(true, false, true, false, true), 3)
  assert.equal(badBreathBand(3), 'A couple of likely causes')
  assert.equal(badBreathScore(false, false, false, false, false), 0)
})

test('gum health', () => {
  assert.equal(gumHealthScore(true, true, true, true, true), 5)
  assert.equal(gumHealthBand(5), 'Talk with your dentist soon')
  assert.equal(gumHealthScore(false, false, false, false, false), 0)
  assert.equal(gumHealthBand(0), 'Gums look healthy')
})

test('scalp health', () => {
  assert.equal(scalpHealthScore(true, false, true, true, true), 4)
  assert.equal(scalpHealthBand(4), 'Visible scalp discomfort')
  assert.equal(scalpHealthScore(false, false, false, false, false), 0)
})

test('hair wash frequency', () => {
  assert.equal(hairWashFrequency(2, 3)?.washesPerWeek, 3)
  assert.equal(hairWashFrequency(1, 3)?.band, 'Normal scalp - 1-2 washes a week')
  assert.equal(hairWashFrequency(0, 3), null)
  assert.equal(hairWashFrequency(3, 2)?.washesPerWeek, 2)
})

test('skin moisture routine', () => {
  assert.ok((skinMoistureRoutine(2, true, true, true)?.goals.length ?? 0) >= 4)
  assert.equal(skinMoistureRoutine(2, true, true, true)?.count, 5)
  assert.equal(skinMoistureRoutine(2, false, false, false)?.band, 'Core plan')
  assert.equal(skinMoistureRoutine(5, false, false, false), null)
})

test('mole awareness', () => {
  assert.equal(moleAwarenessScore(true, true, true, false, false), 3)
  assert.equal(moleAwarenessBand(3), 'Schedule a skin review')
  assert.equal(moleAwarenessScore(false, false, false, false, false), 0)
})