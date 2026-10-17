import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  cockcroftGault, egfrCkdEpi2021, meldScore, meldNaScore, qsofaScore, qsofaBand,
  cha2ds2Vasc, cha2ds2VascBand, hasBled, hasBledBand, wellsDvt, wellsDvtBand,
  wellsPe, wellsPeBand, childPugh, childPughBand, gcsTotal, gcsBand,
} from './clinical.ts'

test('Cockcroft-Gault and CKD-EPI 2021', () => {
  assert.equal(Number(cockcroftGault(60, 80, 1.2, false)!.toFixed(1)), 74.1)
  assert.equal(Number(cockcroftGault(60, 80, 1.2, true)!.toFixed(1)), 63.0)
  assert.equal(cockcroftGault(60, 80, 0, false), null)
  assert.equal(egfrCkdEpi2021(1.0, 60, true), 64)
  assert.equal(egfrCkdEpi2021(1.0, 60, false), 86)
  assert.equal(egfrCkdEpi2021(0, 60, true), null)
})

test('MELD and MELD-Na', () => {
  assert.equal(meldScore(2.0, 1.5, 1.5, false), 17)
  assert.equal(meldScore(2.0, 1.5, 1.5, true), 27)
  assert.equal(meldScore(0, 1.5, 1.5, false), null)
  assert.equal(meldNaScore(17, 130), 22)
  assert.equal(meldNaScore(5, 130), null)
})

test('qSOFA >=2 is the alert', () => {
  assert.equal(qsofaScore(24, 95, false), 2)
  assert.equal(qsofaScore(18, 120, false), 0)
  assert.equal(qsofaBand(2), 'qSOFA >=2 - urgent clinical review indicated')
  assert.equal(qsofaScore(0, 120, false), null)
})

test('CHA2DS2-VASc', () => {
  assert.equal(cha2ds2Vasc(70, false, true, true, false, false, false), 3)
  assert.equal(cha2ds2Vasc(80, true, false, false, false, false, false), 2 + 1)
  assert.equal(cha2ds2VascBand(0), 'Low stroke risk - anticoagulation usually not needed in AF')
  assert.equal(cha2ds2Vasc(45, false, false, false, false, false, false), 0)
})

test('HAS-BLED', () => {
  assert.equal(hasBled(true, false, false, false, false, false, true, true, false), 3)
  assert.equal(hasBledBand(3), 'High bleeding risk (>=3) - careful monitoring advised')
  assert.equal(hasBledBand(1), 'Low to moderate bleeding risk')
})

test('Wells DVT and PE', () => {
  assert.equal(wellsDvt(true, false, true, true, false, false, false, false, true), 1)
  assert.equal(wellsDvtBand(1), 'Moderate probability')
  assert.equal(wellsDvtBand(4), 'High probability - urgent imaging advised')
  assert.equal(wellsPe(true, false, true, true, false, false, false), 6)
  assert.equal(wellsPeBand(6), 'Moderate probability')
  assert.equal(wellsPeBand(8), 'High probability - urgent work-up advised')
})

test('Child-Pugh class', () => {
  assert.equal(childPugh(2.5, 3.0, 1.8, 2, 1), 9)
  assert.equal(childPughBand(9), 'Class B (moderate impairment)')
  assert.equal(childPugh(2.5, 0, 1.8, 2, 1), null)
})

test('GCS', () => {
  assert.equal(gcsTotal(4, 5, 6), 15)
  assert.equal(gcsTotal(4, 5, 7), null)
  assert.equal(gcsBand(7), 'Severe (coma range)')
})