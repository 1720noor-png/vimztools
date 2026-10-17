import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  cycleStats, nextPeriodDate, bbtLutealDays, lutealPhaseLength,
  conceptionDate, ivfDueDate, pregnancyMilestones, hcgDoublingHours,
  fundalHeightRange, pcosSymptomScore, pcosCycleScore, pcosCalorieTarget,
  pcosLifestyleScore, postpartumWeightProgress, breastfeedingFluidMl,
  postpartumRecoveryScore,
} from './womenCycles.ts'

test('cycle stats', () => {
  const s = cycleStats(28, 30, 29)
  assert.ok(s)
  assert.equal(s.average, 29)
  assert.equal(s.shortest, 28)
  assert.equal(s.longest, 30)
  assert.equal(cycleStats(10, 30, 29), null)
})

test('next period date', () => {
  const r = nextPeriodDate('2026-09-01', 28)
  assert.ok(r)
  assert.equal(r.date, '2026-09-29')
})

test('BBT and luteal phases', () => {
  assert.equal(bbtLutealDays(28, 14), 15)
  assert.equal(lutealPhaseLength(28, 14), 14)
  assert.equal(bbtLutealDays(28, 30), null)
})

test('conception and IVF dates', () => {
  assert.equal(conceptionDate('due', '2027-06-08'), '2026-09-15')
  assert.equal(ivfDueDate('2027-01-01', 5), '2027-09-19')
  assert.equal(ivfDueDate('2027-01-01', 3), '2027-09-21')
  assert.equal(ivfDueDate('2027-01-01', 7), null)
})

test('pregnancy milestones', () => {
  const m = pregnancyMilestones('2026-09-01')
  assert.ok(m)
  assert.equal(m.length, 5)
  assert.ok(m[4].includes('2027-06-08'))
})

test('hCG doubling', () => {
  assert.equal(hcgDoublingHours(100, 200, 2), 48)
  assert.equal(hcgDoublingHours(200, 100, 2), null)
})

test('fundal height range', () => {
  const r = fundalHeightRange(24)
  assert.ok(r)
  assert.equal(r.low, 22)
  assert.equal(r.high, 26)
  assert.equal(fundalHeightRange(12), null)
})

test('PCOS scoring', () => {
  assert.equal(pcosSymptomScore(true, true, true, true, true, true), 10)
  assert.equal(pcosSymptomScore(false, false, false, false, false, false), null)
  assert.equal(pcosCycleScore(38, 7, true), 3)
  assert.equal(pcosCalorieTarget(1600, 1.4, true), 2016)
  assert.equal(pcosLifestyleScore(20, 20, 20, 20, 20), 100)
})

test('postpartum tracking', () => {
  const p = postpartumWeightProgress(70, 60, 12)
  assert.ok(p)
  assert.equal(p.lostKg, 10)
  assert.equal(p.pctBack, 14)
  assert.equal(breastfeedingFluidMl(65, 6, 30), 4075)
  assert.equal(postpartumRecoveryScore(1, 1, 1, 1, 1), 90)
})