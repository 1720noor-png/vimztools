import { describe, it, expect } from 'vitest'
import { calculateTipSplitter } from './tipSplitter.js'

describe('Tip and Bill Splitter (tool-core)', () => {
  it('calculates tip and split for 4 people with 18% tip', () => {
    const result = calculateTipSplitter({ bill: 85.50, tip: 18, people: 4 })
    expect(result.tipAmount).toBeCloseTo(15.39, 2)
    expect(result.total).toBeCloseTo(100.89, 2)
    expect(result.formattedTip).toBe('15.39')
    expect(result.formattedTotal).toBe('100.89')
    expect(result.formattedPerPerson).toBe('25.22')
    expect(result.summary).toContain('Per Person (4): $25.22')
  })

  it('handles 0% tip correctly', () => {
    const result = calculateTipSplitter({ bill: 100, tip: 0, people: 2 })
    expect(result.tipAmount).toBe(0)
    expect(result.total).toBe(100)
    expect(result.formattedPerPerson).toBe('50.00')
  })

  it('defaults to 1 person if people omitted', () => {
    const result = calculateTipSplitter({ bill: 50, tip: 20 })
    expect(result.people).toBe(1)
    expect(result.formattedTotal).toBe('60.00')
    expect(result.formattedPerPerson).toBe('60.00')
  })

  it('throws error for invalid bill amount', () => {
    expect(() => calculateTipSplitter({ bill: 0 })).toThrow('Enter a valid positive bill amount.')
    expect(() => calculateTipSplitter({ bill: -20 })).toThrow('Enter a valid positive bill amount.')
    expect(() => calculateTipSplitter({ bill: 'abc' })).toThrow('Enter a valid positive bill amount.')
  })

  it('throws error for negative tip or less than 1 person', () => {
    expect(() => calculateTipSplitter({ bill: 50, tip: -5 })).toThrow('Tip percentage cannot be negative.')
    expect(() => calculateTipSplitter({ bill: 50, people: 0 })).toThrow('Number of people must be at least 1.')
  })
})
