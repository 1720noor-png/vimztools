import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  hrReserveValue,
  karvonenTargetFromReserve,
  ldlHdlRatio,
  ldlHdlBand,
  hrRecoveryDrop,
  hrRecoveryBand,
  cvRiskScore,
  cvRiskBand,
  framinghamPoints,
  framinghamBand,
  ascvdPoints,
  ascvdBand,
} from './cardiovascularRisk.ts'

test('heart rate reserve and Karvonen target', () => {
  assert.equal(hrReserveValue(180, 60), 120)
  assert.equal(hrReserveValue(60, 180), null)
  assert.equal(karvonenTargetFromReserve(60, 120, 70), 144)
  assert.equal(karvonenTargetFromReserve(60, 120, 0), null)
})

test('LDL/HDL ratio', () => {
  assert.equal(ldlHdlRatio(100, 50), 2)
  assert.equal(ldlHdlRatio(90, 55), 1.64)
  assert.equal(ldlHdlBand(1.64), 'Optimal - low LDL boost relative to HDL')
  assert.equal(ldlHdlBand(2), 'Acceptable - keep monitoring')
  assert.equal(ldlHdlRatio(100, 0), null)
})

test('heart rate recovery', () => {
  assert.equal(hrRecoveryDrop(170, 140), 30)
  assert.equal(hrRecoveryBand(30), 'Strong recovery - good fitness signal')
  assert.equal(hrRecoveryDrop(140, 170), null)
})

test('cv risk score', () => {
  assert.equal(cvRiskScore(60, true, true, false, true, false, false, false), 5)
  assert.equal(cvRiskBand(6), 'Elevated - a doctor visit is wise')
  assert.equal(cvRiskScore(20, true, false, false, false, false, false, false), 1)
})

test('framingham-style points and bands', () => {
  const p = framinghamPoints(60, true, 240, 45, 150, true, true)
  assert.ok(p)
  assert.ok(p >= 15)
  const band = framinghamBand(p, true)
  assert.ok(band)
  assert.equal(band.risk, '10-year risk exceeding 20%')
  const low = framinghamBand(framinghamPoints(30, false, 180, 60, 110, false, false), false)
  assert.ok(low)
  assert.equal(low.band, 'Low')
  assert.equal(low.risk, '10-year risk under 10%')
})

test('ascvd style points', () => {
  const p = ascvdPoints(60, true, 240, 45, 150, true, false)
  assert.ok(p)
  assert.ok(p >= 15)
  assert.equal(ascvdBand(p), 'Elevated estimated risk - a clinician visit is recommended')
})