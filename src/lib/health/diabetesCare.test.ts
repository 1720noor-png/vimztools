import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  a1cToEag, eagToA1c, dawnRise, insulinSensitivityFactor,
  carbRatioPerUnit, correctionDose, hypoAwarenessScore, glycemicLoad,
} from './diabetesCare.ts'

test('A1C to eAG conversion', () => {
  const d = a1cToEag(7.0)
  assert.ok(d)
  assert.equal(d, 154)
  assert.equal(a1cToEag(5.5), 111)
  assert.equal(a1cToEag(1.5), null)
})

test('eAG to A1C conversion', () => {
  const a = eagToA1c(154)
  assert.ok(a)
  assert.equal(a, 7)
  assert.equal(eagToA1c(700), null)
})

test('dawn phenomenon', () => {
  const r = dawnRise(110, 150)
  assert.ok(r)
  assert.equal(r.diffMg, 40)
  assert.equal(r.rising, true)
  const flat = dawnRise(110, 120)
  assert.ok(flat)
  assert.equal(flat.rising, false)
})

test('insulin sensitivity factor', () => {
  assert.equal(insulinSensitivityFactor(50), 34)
  assert.equal(insulinSensitivityFactor(2), null)
})

test('carb ratio per unit', () => {
  assert.equal(carbRatioPerUnit(50), 9)
  assert.equal(carbRatioPerUnit(100), 4.5)
})

test('correction dose', () => {
  assert.equal(correctionDose(180, 120, 30), 2)
  assert.equal(correctionDose(100, 120, 30), 0)
  assert.equal(correctionDose(180, 120, 0), null)
})

test('hypo awareness score', () => {
  assert.equal(hypoAwarenessScore(1, false, false), 88)
  assert.equal(hypoAwarenessScore(5, true, true), 0)
  assert.equal(hypoAwarenessScore(-1, false, false), null)
})

test('glycemic load bands', () => {
  const l = glycemicLoad(50, 15)
  assert.ok(l)
  assert.equal(l.gl, 7.5)
  assert.equal(l.band, 'Low')
  const h = glycemicLoad(80, 60)
  assert.ok(h)
  assert.equal(h.band, 'High')
})