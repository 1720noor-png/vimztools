import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  phq9Severity, gad7Severity, rosenbergSelfEsteem, diabetesRiskScore,
  diabetesRiskBand, carbGramPerKgTarget, burnoutScore,
} from './mentalDiabetes.ts'

test('PHQ-9 bands', () => {
  const mild = phq9Severity([1, 1, 1, 0, 0, 0, 1, 0, 1])!
  assert.equal(mild.total, 5)
  assert.equal(mild.band, 'Mild depression')
  const severe = phq9Severity([3, 3, 3, 3, 3, 3, 3, 3, 3])!
  assert.equal(severe.total, 27)
  assert.equal(severe.band, 'Severe depression')
  assert.equal(phq9Severity([3, 3, 3]), null)
  assert.equal(phq9Severity([3, 3, 3, 3, 3, 3, 3, 3, 9]), null)
})

test('GAD-7 bands', () => {
  const m = gad7Severity([2, 2, 1, 0, 1, 0, 1])!
  assert.equal(m.total, 7)
  assert.equal(m.band, 'Mild anxiety')
  assert.equal(gad7Severity([1, 2]), null)
})

test('Rosenberg self-esteem bands', () => {
  assert.equal(rosenbergSelfEsteem([2, 2, 2, 2, 2, 2, 2, 2, 2, 2])!.band, 'Normal range')
  assert.equal(rosenbergSelfEsteem([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])!.band, 'Healthy self-esteem')
  assert.equal(rosenbergSelfEsteem([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])!.band, 'Low self-esteem - support could help')
})

test('diabetes risk scoring', () => {
  assert.equal(diabetesRiskScore(50, true, true, false, true)!, 3 + 1 + 1 + 0 + 3)
  assert.equal(diabetesRiskBand(2), 'Low risk')
  assert.equal(diabetesRiskBand(4), 'Moderate risk')
  assert.equal(diabetesRiskBand(9), 'Higher risk - worth a screening visit')
})

test('carb targets per style', () => {
  assert.equal(carbGramPerKgTarget(70, 'moderate'), 154)
  assert.equal(carbGramPerKgTarget(70, 'keto'), 35)
  assert.equal(carbGramPerKgTarget(0, 'keto'), null)
})

test('burnout score inverts efficacy', () => {
  const b = burnoutScore(8, 7, 9)!
  assert.equal(b.total, 8 + 7 + 1)
  assert.equal(b.band, 'Moderate - rest and boundaries help')
  const strong = burnoutScore(9, 8, 9)!
  assert.equal(strong.total, 18)
  assert.equal(strong.band, 'Strong burnout signal - consider support')
  assert.equal(burnoutScore(11, 5, 5), null)
})