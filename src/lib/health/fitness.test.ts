import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  oneRepMaxEpley, oneRepMaxBrzycki, vo2MaxCooper, stepsToKm, paceMinPerKm,
  metCaloriesBurned, karvonenHeartRate, runningTimeHours, stepsToCalories,
  maxHeartRateAge,
} from './fitness.ts'

test('1RM formulas agree', () => {
  assert.equal(Number(oneRepMaxEpley(100, 5)!.toFixed(1)), 116.7)
  assert.equal(oneRepMaxBrzycki(100, 5), 112.5)
  assert.equal(oneRepMaxBrzycki(100, 11), null)
  assert.equal(oneRepMaxEpley(100, 0), null)
})

test('cooper VO2max', () => {
  assert.equal(Number(vo2MaxCooper(2500)!.toFixed(1)), 44.6)
  assert.equal(vo2MaxCooper(0), null)
})

test('steps and pace conversions', () => {
  assert.equal(stepsToKm(10000, 65), 6.5)
  assert.equal(stepsToKm(10000, 0), null)
  assert.equal(paceMinPerKm(10), 6)
  assert.equal(paceMinPerKm(0), null)
})

test('MET calories and Karvonen zone', () => {
  assert.equal(metCaloriesBurned(8, 70, 60), 588)
  assert.equal(metCaloriesBurned(8, 0, 60), null)
  assert.equal(karvonenHeartRate(180, 60, 70), 144)
  assert.equal(karvonenHeartRate(180, 60, 0), null)
})

test('duration, step calories, age HR', () => {
  assert.equal(runningTimeHours(10, 6), 1)
  assert.equal(runningTimeHours(10, 0), null)
  assert.equal(stepsToCalories(10000, 70), 350)
  assert.equal(maxHeartRateAge(30), 190)
})