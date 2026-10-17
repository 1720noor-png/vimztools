import assert from 'node:assert'
import test from 'node:test'
import {
  rhinitisScore, rhinitisBand, soreThroatScore, soreThroatBand, coughScore,
  headacheSeverity, nauseaScore, nauseaBand, diarrheaStatus, constipationScore,
  constipationBand, lymphNodeScore, rashScore, rashBand, dizzinessScore,
  fatigueScore, fatigueBand, insomniaScore, insomniaBand, eyeStrainScore,
  eyeStrainBand, refluxScore, refluxBand,
} from './symptomChecks.ts'

test('rhinitis', () => {
  assert.equal(rhinitisScore(true, true, true, true, true, true), 6)
  assert.equal(rhinitisBand(6), 'Very allergy-shaped picture')
  assert.equal(rhinitisScore(false, false, false, false, false, false), 0)
  assert.equal(rhinitisBand(1), 'Few allergic features')
})

test('sore throat', () => {
  assert.equal(soreThroatScore(true, true, true, true, 5), 4)
  assert.equal(soreThroatBand(4), 'Several throat infection signs')
  assert.equal(soreThroatScore(true, false, false, false, 12), 3)
  assert.equal(soreThroatScore(false, false, false, false, 1), 0)
  assert.equal(soreThroatScore(false, false, false, false, -1), null)
})

test('cough', () => {
  assert.equal(coughScore(1, true, false, 2, false)?.score, 1)
  assert.equal(coughScore(2, false, true, 10, true)?.score, 6)
  assert.equal(coughScore(3, true, true, 4, false)?.band, 'Worth a clinical review')
  assert.equal(coughScore(0, false, false, 1, false), null)
})

test('headache severity', () => {
  assert.equal(headacheSeverity(8, false, false, false, false)?.score, 2)
  assert.equal(headacheSeverity(9, true, true, true, true)?.score, 10)
  assert.equal(headacheSeverity(1, false, false, false, false)?.band, 'Milder headache')
  assert.equal(headacheSeverity(11, false, false, false, false), null)
})

test('nausea', () => {
  assert.equal(nauseaScore(6, true, true, true, true, 3), 8)
  assert.equal(nauseaBand(8), 'High burden - fluids and review')
  assert.equal(nauseaScore(1, false, false, false, false, 0), 0)
})

test('diarrhea', () => {
  assert.equal(diarrheaStatus(9, true, true, 8)?.score, 10)
  assert.equal(diarrheaStatus(9, true, true, 8)?.band, 'High concern - hydrate and seek review')
  assert.equal(diarrheaStatus(2, false, false, 1)?.score, 0)
})

test('constipation', () => {
  assert.equal(constipationScore(1, true, true, true), 5)
  assert.equal(constipationBand(5), 'Frequent constipation pattern')
  assert.equal(constipationScore(6, false, false, false), 0)
})

test('lymph nodes', () => {
  assert.equal(lymphNodeScore(4, true, true, 6)?.score, 8)
  assert.equal(lymphNodeScore(4, true, true, 6)?.band, 'Prolonged or extensive - review needed')
  assert.equal(lymphNodeScore(1, false, false, 1)?.score, 1)
})

test('rash', () => {
  assert.equal(rashScore(true, true, true, true, 8), 7)
  assert.equal(rashBand(7), 'Worth a clinician look')
  assert.equal(rashScore(false, false, false, false, 2), 0)
})

test('dizziness', () => {
  assert.equal(dizzinessScore(false, false, true, true, true, 45)?.score, 9)
  assert.equal(dizzinessScore(false, false, true, true, true, 45)?.band, 'Red-flag territory - urgent review')
  assert.equal(dizzinessScore(true, false, false, false, false, 5)?.score, 1)
  assert.equal(dizzinessScore(true, false, false, false, false, 5)?.band, 'Minor episode')
})

test('fatigue', () => {
  assert.equal(fatigueScore(2, 5, true, true, 6), 8)
  assert.equal(fatigueBand(8), 'Persistent heavy fatigue')
  assert.equal(fatigueScore(9, 8, false, false, 1), 1)
})

test('insomnia', () => {
  assert.equal(insomniaScore(90, 3, true, true, 6), 7)
  assert.equal(insomniaBand(7), 'Insomnia-shaped pattern')
  assert.equal(insomniaScore(10, 0, false, false, 4), 1)
})

test('eye strain', () => {
  assert.equal(eyeStrainScore(9, true, true, true, 30), 6)
  assert.equal(eyeStrainBand(6), 'Significant screen-strain pattern')
  assert.equal(eyeStrainScore(2, false, false, false, 50), 0)
})

test('reflux', () => {
  assert.equal(refluxScore(4, true, true, true, true), 6)
  assert.equal(refluxBand(6), 'Frequent reflux pattern')
  assert.equal(refluxScore(0, false, false, false, false), 0)
  assert.equal(refluxScore(1, false, false, false, false), 1)
  assert.equal(refluxBand(1), 'Mild or rare reflux')
})