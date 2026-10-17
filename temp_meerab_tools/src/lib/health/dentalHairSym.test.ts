import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  sugarExposureScore, sugarExposureBand, uvBurnTimeMinutes, uvBurnLabel,
  hairLossRiskScore, hairLossBand, hairPorosityTest, dehydrationScore,
  dehydrationBand, coldOrFlu, chestPainRedFlagCount, chestPainBand,
  utiLikelihoodScore, utiBand, migraineScore, migraineBand,
} from './dentalHairSym.ts'

test('sugar exposure bands', () => {
  assert.equal(sugarExposureScore(2, 3, 1), 6)
  assert.equal(sugarExposureBand(6), 'Moderate - try cutting one exposure daily')
  assert.equal(sugarExposureScore(-1, 3, 1), null)
})

test('UV burn time', () => {
  assert.equal(uvBurnTimeMinutes(3, 30), 900)
  assert.equal(uvBurnTimeMinutes(3, 1), 30)
  assert.equal(uvBurnLabel(900), 'Burn time is longer - still reapply after swimming or sweating')
  assert.equal(uvBurnTimeMinutes(0, 30), null)
})

test('hair loss and porosity', () => {
  assert.equal(hairLossRiskScore(true, true, false, false, false, false), 3)
  assert.equal(hairLossBand(3), 'Moderate - nutrition and stress review help')
  assert.equal(hairLossRiskScore(false, false, false, false, false, false), null)
  assert.equal(hairPorosityTest(1), 'High porosity - strands sink fast, focus on moisture retention')
  assert.equal(hairPorosityTest(400), 'Enter a value between 0 and 300 seconds')
})

test('dehydration checklist', () => {
  assert.equal(dehydrationScore(true, true, false, true, false, false), 3)
  assert.equal(dehydrationBand(3), 'Moderate signs - hydrate steadily')
  assert.equal(dehydrationScore(false, false, false, false, false, false), null)
})

test('cold vs flu triage', () => {
  assert.equal(coldOrFlu(true, true, true, false, false, false, true), 'Flu-like pattern is likely (sudden fever with aches)')
  assert.equal(coldOrFlu(false, false, false, true, false, true, false), 'Common-cold pattern is likely (nose/throat symptoms dominate)')
  assert.equal(coldOrFlu(false, false, false, false, false, false, false), null)
})

test('chest pain red flags escalate', () => {
  assert.equal(chestPainRedFlagCount(true, true, false, false, false), 2)
  assert.equal(chestPainBand(2), 'Multiple red flags - seek urgent medical review')
  assert.equal(chestPainBand(4), 'Several red flags - this warrants emergency care now')
  assert.equal(chestPainRedFlagCount(false, false, false, false, false), null)
})

test('UTI likelihood', () => {
  assert.equal(utiLikelihoodScore(true, true, false, false, true, true), 6)
  assert.equal(utiBand(6), 'Strong UTI signal (with back pain/fever) - seek care soon')
  assert.equal(utiLikelihoodScore(false, false, false, false, false, false), null)
})

test('migraine screening', () => {
  assert.equal(migraineScore(true, true, false, false, true), 3)
  assert.equal(migraineBand(3), 'Migrainous features likely - a clinician can confirm and plan triggers')
  assert.equal(migraineScore(false, false, false, false, false), null)
})