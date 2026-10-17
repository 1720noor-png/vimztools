import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sofaScore, apache2Simplified, serumOsmolality, rdwBand, nlrRatio, agrRatio } from './clinicalExtra.ts'
import { fev1FvcRatio, fvcPredicted, sfRatio, borgBand, mrcGrade, pcrBand, uacrBand, fenaPct } from './kidneyResp.ts'

test('sofa score', () => {
  assert.equal(sofaScore([0, 0, 0, 0, 0, 0])?.total, 0)
  assert.equal(sofaScore([2, 3, 1, 2, 1, 0])?.total, 9)
  const h = sofaScore([4, 4, 4, 4, 4, 4])
  assert.ok(h)
  assert.equal(h.total, 24)
  assert.ok(h.band.includes('High'))
  assert.equal(sofaScore([5, 0, 0, 0, 0, 0]), null)
})

test('apache2 simplified', () => {
  assert.equal(apache2Simplified(40, false, 15, 90, 90, 37), 0)
  assert.ok((apache2Simplified(70, true, 8, 180, 40, 33) ?? 0) > 20)
})

test('serum osmolality', () => {
  const o = serumOsmolality(140, 180, 60)
  assert.ok(o)
  assert.equal(o.osm, 311)
  assert.equal(o.band, 'High osmolality')
  assert.equal(serumOsmolality(90, 100, 20), null)
})

test('rdw band', () => {
  assert.ok(rdwBand(13)?.includes('Typical'))
  assert.ok(rdwBand(16)?.includes('High variation'))
  assert.equal(rdwBand(5), null)
})

test('NLR ratio', () => {
  const n = nlrRatio(6, 2)
  assert.ok(n)
  assert.equal(n.ratio, 3)
  assert.equal(n.band, 'Mid-normal')
  assert.equal(nlrRatio(6, 0), null)
})

test('AGR', () => {
  const a = agrRatio(4, 7)
  assert.ok(a)
  assert.equal(a.ratio, 1.33)
  const reversed = agrRatio(2, 7)
  assert.ok(reversed)
  assert.ok(reversed.band.includes('Reversed'))
})

test('FEV1/FVC', () => {
  const r = fev1FvcRatio(2.5, 3.5)
  assert.ok(r)
  assert.equal(r.ratio, 0.71)
  assert.ok(r.band.includes('typical'))
  const low = fev1FvcRatio(1.6, 3.5)
  assert.ok(low)
  assert.ok(low.band.includes('obstructive'))
})

test('FVC predicted', () => {
  const m = fvcPredicted(180, 50, false)
  assert.ok(m)
  assert.ok(m.predicted > 3 && m.predicted < 4.5)
  const f = fvcPredicted(165, 40, true)
  assert.ok(f)
  assert.ok(f.predicted > 3 && f.predicted < 5)
})

test('S/F ratio', () => {
  const g = sfRatio(96, 21)
  assert.ok(g)
  assert.ok(g.band.includes('Good'))
  const s = sfRatio(80, 60)
  assert.ok(s)
  assert.ok(s.band.includes('Severe'))
})

test('borg and MRC', () => {
  assert.equal(borgBand(0), 'Nothing at all')
  assert.ok(borgBand(6)?.includes('Very severe'))
  assert.equal(mrcGrade(1)?.includes('strenuous'), true)
  assert.equal(mrcGrade(5)?.includes('leave the house'), true)
  assert.equal(mrcGrade(9), null)
})

test('PCR and UACR', () => {
  const p = pcrBand(30, 100)
  assert.ok(p)
  assert.equal(p.pcr, 300)
  assert.ok(p.band.includes('Moderately'))
  const u = uacrBand(20, 100)
  assert.ok(u)
  assert.equal(u.mgG, 20)
  assert.ok(u.band.includes('Low'))
})

test('FENa', () => {
  const f1 = fenaPct(20, 140, 100, 1)
  assert.ok(f1)
  assert.equal(f1.fena, 0.1)
  assert.ok(f1.band.includes('pre-renal'))
  assert.ok(fenaPct(80, 140, 20, 1)?.band.includes('intrinsic'))
})