import { describe, it, expect } from 'vitest'
import { computeColumnStats } from './csvColumnStats.js'

describe('CSV Column Statistics Engine (computeColumnStats)', () => {
  it('throws error on empty or invalid CSV text', () => {
    expect(() => computeColumnStats('')).toThrow('CSV text must be a non-empty string')
    expect(() => computeColumnStats('   ')).toThrow('CSV text must be a non-empty string')
  })

  it('correctly calculates statistics for numeric columns', () => {
    const csv = `id,score,age
1,85,25
2,90,30
3,95,35
4,100,40`

    const res = computeColumnStats(csv)
    expect(res.rowCount).toBe(4)
    expect(res.columnCount).toBe(3)

    const scoreCol = res.columns.find(c => c.column === 'score')
    expect(scoreCol.type).toBe('numeric')
    expect(scoreCol.min).toBe(85)
    expect(scoreCol.max).toBe(100)
    expect(scoreCol.sum).toBe(370)
    expect(scoreCol.mean).toBe(92.5)
    expect(scoreCol.median).toBe(92.5)
    expect(scoreCol.nonNullCount).toBe(4)
    expect(scoreCol.nullCount).toBe(0)
  })

  it('computes correct median for odd number of rows', () => {
    const csv = `val\n10\n20\n30`
    const res = computeColumnStats(csv)
    const col = res.columns[0]
    expect(col.median).toBe(20)
    expect(col.min).toBe(10)
    expect(col.max).toBe(30)
  })

  it('correctly handles categorical / text columns with frequency and length', () => {
    const csv = `name,department
Alice,Engineering
Bob,Marketing
Charlie,Engineering
Dave,Engineering
Eve,HR`

    const res = computeColumnStats(csv)
    const deptCol = res.columns.find(c => c.column === 'department')
    expect(deptCol.type).toBe('text')
    expect(deptCol.distinctCount).toBe(3)
    expect(deptCol.topValues[0].value).toBe('Engineering')
    expect(deptCol.topValues[0].count).toBe(3)
    expect(deptCol.topValues[0].percentage).toBe(60)
  })

  it('handles missing values and computes null percentages accurately', () => {
    const csv = `product,price
Apple,1.5
Banana,
Orange,2.5
Grape,`

    const res = computeColumnStats(csv)
    const priceCol = res.columns.find(c => c.column === 'price')
    expect(priceCol.nonNullCount).toBe(2)
    expect(priceCol.nullCount).toBe(2)
    expect(priceCol.nullPercentage).toBe(50)
    expect(priceCol.sum).toBe(4)
    expect(priceCol.mean).toBe(2)
  })

  it('strips currency symbols and commas from numeric values', () => {
    const csv = `item,revenue
Widget,"$1,000"
Gadget,"$2,500"
Gizmo,"$1,500"`

    const res = computeColumnStats(csv)
    const revCol = res.columns.find(c => c.column === 'revenue')
    expect(revCol.type).toBe('numeric')
    expect(revCol.sum).toBe(5000)
    expect(revCol.min).toBe(1000)
    expect(revCol.max).toBe(2500)
  })

  it('supports CSV without headers when hasHeader: false is set', () => {
    const csv = `10,20\n30,40\n50,60`
    const res = computeColumnStats(csv, { hasHeader: false })
    expect(res.rowCount).toBe(3)
    expect(res.columnCount).toBe(2)
    expect(res.columns[0].column).toBe('Column_1')
    expect(res.columns[0].mean).toBe(30)
  })
})
