import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fin, safeDiv, clamp } from './guard.ts'

test('fin returns numbers and rejects junk', () => {
  assert.equal(fin(42), 42)
  assert.equal(fin('12.5'), 12.5)
  assert.equal(fin(''), null)
  assert.equal(fin('abc'), null)
  assert.equal(fin(NaN), null)
  assert.equal(fin(Infinity), null)
  assert.equal(fin(undefined), null)
  assert.equal(fin(null), null)
  assert.equal(fin({}), null)
})

test('safeDiv guards division by zero', () => {
  assert.equal(safeDiv(10, 2), 5)
  assert.equal(safeDiv(3, 0), null)
  assert.equal(safeDiv(3, NaN), null)
  assert.equal(safeDiv(3, Infinity), null)
})

test('clamp bounds values', () => {
  assert.equal(clamp(50, 0, 100), 50)
  assert.equal(clamp(-5, 0, 100), 0)
  assert.equal(clamp(150, 0, 100), 100)
})