import { test } from 'node:test'
import assert from 'node:assert/strict'
import { walkingPace, workoutDurationMinutes, kcalPerHourFromMet, trainingVolumeKg } from './fitnessPlanner.ts'

test('walking pace from distance and time', () => {
  const p = walkingPace(5, 60)
  assert.ok(p)
  assert.equal(p.minPerKm, 12)
  assert.equal(p.kmh, 5)
  assert.equal(walkingPace(0, 60), null)
})

test('workout duration', () => {
  assert.equal(workoutDurationMinutes(10, 10), 60)
  assert.equal(workoutDurationMinutes(10, 0), null)
})

test('MET calories per hour', () => {
  assert.equal(kcalPerHourFromMet(8, 70), 560)
  assert.equal(kcalPerHourFromMet(0, 70), null)
})

test('training volume', () => {
  assert.equal(trainingVolumeKg(4, 8, 60), 1920)
  assert.equal(trainingVolumeKg(0, 8, 60), null)
})