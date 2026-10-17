import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  anionGap, correctedCalcium, correctedSodium, bunCreatinineRatio,
  absoluteNeutrophilCount, absoluteLymphocyteCount, glucoseMmolToMg,
  glucoseMgToMmol, cholesterolMmolToMg, cholesterolMgToMmol, hbgdlToGperL,
  hbGperLtoGdl,
} from './labs.ts'

test('anion gap', () => {
  assert.equal(anionGap(140, 104, 24), 12)
  assert.equal(anionGap(140, 104, 0), null)
})

test('corrected calcium and sodium', () => {
  assert.equal(correctedCalcium(8.5, 4.5), 8.1)
  assert.equal(correctedCalcium(8.5, 0), null)
  assert.equal(correctedSodium(140, 200), 142.4)
})

test('BUN:creatinine and blood counts', () => {
  assert.equal(bunCreatinineRatio(20, 1.0), 20)
  assert.equal(bunCreatinineRatio(20, 0), null)
  assert.equal(absoluteNeutrophilCount(6.0, 60), 3600)
  assert.equal(absoluteLymphocyteCount(6.0, 25), 1500)
  assert.equal(absoluteNeutrophilCount(6.0, 110), null)
})

test('unit conversions', () => {
  assert.equal(Number(glucoseMmolToMg(5.55)!.toFixed(1)), 100.0)
  assert.equal(Number(glucoseMgToMmol(100)!.toFixed(2)), 5.55)
  assert.equal(cholesterolMmolToMg(5.2), 201)
  assert.equal(Number(cholesterolMgToMmol(201)!.toFixed(2)), 5.2)
  assert.equal(hbgdlToGperL(13.5), 135)
  assert.equal(hbGperLtoGdl(135), 13.5)
  assert.equal(hbgdlToGperL(0), null)
})