import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  feedingInterval, milkVolumePerFeed, diaperCountByAge, percentileBand,
  milestoneForAge, feverDoseMg, nextGrowthSpurt, teethingStage,
} from './babyCare.ts'

test('feeding interval bands', () => {
  assert.ok(feedingInterval(7))
  assert.equal(feedingInterval(7)?.perDay, '8-12 feeds')
  assert.equal(feedingInterval(60)?.perDay, '6-8 feeds')
  assert.equal(feedingInterval(200)?.perDay, '4-6 feeds')
  assert.equal(feedingInterval(-1), null)
})

test('milk volume', () => {
  const v = milkVolumePerFeed(4.5, 1)
  assert.ok(v)
  assert.equal(v, 84)
  assert.equal(milkVolumePerFeed(0.5, 1), null)
})

test('diaper count', () => {
  const d = diaperCountByAge(1)
  assert.ok(d)
  assert.equal(d.min, 6)
  assert.equal(diaperCountByAge(30)?.min, 3)
})

test('percentile band', () => {
  const w = percentileBand(7.3, 5, 'weight')
  assert.ok(w)
  assert.equal(w.band, 'Around the typical band')
  const high = percentileBand(20, 24, 'weight')
  assert.ok(high)
  assert.equal(high.z, 3.5)
  assert.equal(percentileBand(10, 30, 'weight'), null)
})

test('milestones text', () => {
  assert.ok(milestoneForAge(2)?.includes('social smile'))
  assert.ok(milestoneForAge(10)?.includes('pulls to stand'))
  assert.equal(milestoneForAge(50), null)
})

test('fever dose', () => {
  const d = feverDoseMg(10)
  assert.ok(d)
  assert.equal(d.perDose, 150)
  assert.equal(d.maxPerDay, 600)
})

test('growth spurt next', () => {
  assert.equal(nextGrowthSpurt(10), '4-month growth spurt')
  assert.ok(nextGrowthSpurt(100)?.includes('steady'))
})

test('teething stage', () => {
  const t = teethingStage(7)
  assert.ok(t)
  assert.ok(t.present.includes('lower central incisors'))
  assert.equal(t.next, 'upper central incisors')
})