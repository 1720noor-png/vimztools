import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  pfRatio, pfRatioBand, aaGradient, packYears, packYearsBand, peakFlowZone,
  kidneyStage, fluidBalanceNetMl, kidneyStoneRiskScore, kidneyStoneBand,
  wetBulbCelsius, wetBulbAlert,
} from './respKidney.ts'

test('P/F ratio', () => {
  assert.equal(pfRatio(80, 0.21), 381)
  assert.equal(pfRatioBand(250), 'Mild impairment (<300)')
  assert.equal(pfRatio(80, 0), null)
})

test('A-a gradient sea level', () => {
  assert.equal(Number(aaGradient(90, 40, 0)!.toFixed(1)), 9.7)
  assert.equal(aaGradient(90, 40, 0), 9.7)
  assert.equal(aaGradient(0, 40, 0), null)
})

test('pack-years', () => {
  assert.equal(packYears(2, 20), 40)
  assert.equal(packYearsBand(22), 'High exposure (>=20 pack-years meets screening criteria in at-risk groups)')
  assert.equal(packYears(0, 20), 0)
})

test('peak flow zones', () => {
  assert.equal(peakFlowZone(450, 400), 'Green zone (>=80% of best) - controlled')
  assert.equal(peakFlowZone(450, 300), 'Yellow zone (50-79%) - caution, use action plan')
  assert.equal(peakFlowZone(450, 200), 'Red zone (<50%) - seek urgent care / follow asthma plan')
  assert.equal(peakFlowZone(0, 300), 'Enter valid readings')
})

test('kidney stage and fluid balance', () => {
  assert.equal(kidneyStage(45), 'G3a (mild-moderate - 45-59)')
  assert.equal(kidneyStage(89), 'G2 (mildly reduced - 60-89)')
  assert.equal(fluidBalanceNetMl(2400, 2100), 300)
  assert.equal(fluidBalanceNetMl(-1, 2100), null)
})

test('kidney stone risk', () => {
  assert.equal(kidneyStoneRiskScore(false, true, true, false, false, false), 2)
  assert.equal(kidneyStoneBand(2), 'Low estimated risk')
  assert.equal(kidneyStoneRiskScore(false, false, false, false, false, false), null)
})

test('wet bulb via Stull approximation', () => {
  const wb = wetBulbCelsius(25, 50)!
  assert.ok(wb > 17 && wb < 19, `wet bulb was ${wb}`)
  assert.equal(wetBulbAlert(25, 50), 'Low heat stress - normal activity with fluids')
  assert.equal(wetBulbAlert(40, 80), 'Very high heat stress - limit strenuous exertion')
  assert.equal(wetBulbCelsius(25, 200), null)
})