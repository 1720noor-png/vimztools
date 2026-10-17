import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  moodScoreCard, stressCopingCount, resilienceScore, panicLog,
  ruminationScore, digitalDetoxScore, selfCompassionScore, supportCheck,
} from './mentalScore.ts'

test('mood score card', () => {
  assert.equal(moodScoreCard(10, 10, 8, 0), 100)
  assert.equal(moodScoreCard(0, 0, 0, 10), 0)
  assert.equal(moodScoreCard(11, 5, 6, 3), null)
})

test('stress coping count', () => {
  assert.equal(stressCopingCount([true, false, true, true, false, true]), 4)
  assert.equal(stressCopingCount([]), 0)
})

test('resilience score', () => {
  const r = resilienceScore([4, 4, 4, 4, 4])
  assert.ok(r)
  assert.equal(r.total, 20)
  assert.equal(r.pct, 100)
  assert.equal(resilienceScore([1, 1, 1, 1, 1])?.band, 'Buffers are thin right now')
  assert.equal(resilienceScore([5, 1, 1, 1, 1]), null)
})

test('panic log', () => {
  assert.equal(panicLog(0, 0, 0), 0)
  const h = panicLog(10, 60, 10)
  assert.ok(h)
  assert.ok(h > 95)
})

test('rumination score', () => {
  assert.equal(ruminationScore(0, 0), 0)
  const r = ruminationScore(24, 100)
  assert.ok(r)
  assert.ok(r > 90)
  assert.equal(ruminationScore(30, 5), null)
})

test('digital detox score', () => {
  assert.equal(digitalDetoxScore(120, 240), 100)
  const low = digitalDetoxScore(1, 0)
  assert.ok(low)
  assert.ok(low < 10)
  assert.equal(digitalDetoxScore(60, 120), 50)
  assert.equal(digitalDetoxScore(0, 60), null)
})

test('self compassion', () => {
  const s = selfCompassionScore(4, 4, 4)
  assert.ok(s)
  assert.equal(s.total, 12)
  assert.equal(s.pct, 100)
})

test('support check', () => {
  assert.equal(supportCheck(false, false, false)?.level, 0)
  assert.equal(supportCheck(false, true, true)?.level, 2)
  assert.equal(supportCheck(true, false, false)?.level, 3)
})