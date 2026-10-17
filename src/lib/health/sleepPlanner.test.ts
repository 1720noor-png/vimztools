import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  minToClock, wakeTimesFromBedtime, bedtimesFromWake, sleepDurationMinutes,
  sleepCyclesBetween, napAdvice, sleepConsistency, sleepEfficiency, shiftPlan,
} from './sleepPlanner.ts'

test('clock formatting', () => {
  assert.equal(minToClock(0), '12:00 AM')
  assert.equal(minToClock(720), '12:00 PM')
  assert.equal(minToClock(1320), '10:00 PM')
})

test('wake times from bedtime', () => {
  const t = wakeTimesFromBedtime(1320, 4)
  assert.ok(t)
  assert.equal(t[0], 240)
  assert.equal(minToClock(t[0]), '4:00 AM')
})

test('bedtimes from wake', () => {
  const b = bedtimesFromWake(420, 4)
  assert.ok(b)
  assert.equal(minToClock(b[0]), '12:45 AM')
})

test('sleep duration', () => {
  assert.equal(sleepDurationMinutes(1380, 420), 480)
  const r = sleepCyclesBetween(1380, 420)
  assert.ok(r)
  assert.equal(r.cycles, 5)
  assert.equal(r.remainderMin, 30)
})

test('nap advice', () => {
  assert.equal(napAdvice(25), 'A classic power nap - wake before deep sleep begins')
  assert.equal(napAdvice(-1), null)
})

test('consistency and efficiency', () => {
  assert.equal(sleepConsistency(30, 30), 58)
  assert.equal(sleepEfficiency(420, 480), 88)
  assert.equal(sleepEfficiency(500, 480), null)
})

test('shift planning', () => {
  assert.equal(shiftPlan(420, 360), -15)
  assert.equal(shiftPlan(360, 420), 15)
  assert.equal(shiftPlan(420, 420), 0)
})