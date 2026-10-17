import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bpCategory, mapValue, pulsePressure, friedewaldLdl, tcHdlRatio, ldlBand, restingHrBand } from './heart.ts'

test('BP categories follow ACC/AHA', () => {
  assert.equal(bpCategory(118, 76), 'Normal blood pressure')
  assert.equal(bpCategory(130, 80), 'Hypertension stage 1 - discuss with your doctor')
  assert.equal(bpCategory(145, 90), 'Hypertension stage 2 - consult your doctor')
  assert.equal(bpCategory(185, 120), 'Hypertensive crisis - seek emergency care')
  assert.equal(bpCategory(0, 76), 'Enter valid readings')
})

test('MAP and pulse pressure', () => {
  assert.equal(mapValue(120, 80), 93)
  assert.equal(mapValue(120, 0), null)
  assert.equal(pulsePressure(120, 80), 40)
  assert.equal(pulsePressure(90, 120), null)
})

test('Friedewald LDL = TC - HDL - TG/5', () => {
  assert.equal(friedewaldLdl(200, 50, 150), 120)
  assert.equal(friedewaldLdl(200, 0, 150), null)
  assert.equal(tcHdlRatio(200, 50), 4)
  assert.equal(tcHdlRatio(200, 0), null)
})

test('LDL bands and resting HR', () => {
  assert.equal(ldlBand(150), 'Borderline high')
  assert.equal(ldlBand(null), 'Unknown')
  assert.equal(restingHrBand(70), 'Normal resting range')
  assert.equal(restingHrBand(55), 'Below typical (bradycardia range - context dependent)')
})