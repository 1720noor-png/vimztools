import { describe, it, expect } from 'vitest'
import { formatBatesNumber, generateBatesSequence, calculateStampPosition } from './batesStamper.js'

describe('PDF Bates Numbering Engine (batesStamper)', () => {
  describe('formatBatesNumber', () => {
    it('formats basic bates number with default padding', () => {
      const res = formatBatesNumber(1, 'CONF', 6)
      expect(res).toBe('CONF-000001')
    })

    it('formats with suffix and custom padding', () => {
      const res = formatBatesNumber(42, 'EXHIBIT', 4, 'REDACTED')
      expect(res).toBe('EXHIBIT-0042-REDACTED')
    })

    it('formats without prefix or suffix', () => {
      const res = formatBatesNumber(105, '', 5)
      expect(res).toBe('00105')
    })

    it('throws on negative or invalid numbers', () => {
      expect(() => formatBatesNumber(-1)).toThrow('Number must be a non-negative integer')
      expect(() => formatBatesNumber('invalid')).toThrow('Number must be a non-negative integer')
    })
  })

  describe('generateBatesSequence', () => {
    it('generates correct sequence for multiple pages', () => {
      const seq = generateBatesSequence({
        prefix: 'DOC',
        startNum: 10,
        digits: 4,
        totalPages: 5
      })

      expect(seq.totalPages).toBe(5)
      expect(seq.items.length).toBe(5)
      expect(seq.firstStamp).toBe('DOC-0010')
      expect(seq.lastStamp).toBe('DOC-0014')
      expect(seq.sampleRange).toBe('DOC-0010 to DOC-0014')
      expect(seq.items[0]).toEqual({ page: 1, stamp: 'DOC-0010' })
      expect(seq.items[4]).toEqual({ page: 5, stamp: 'DOC-0014' })
    })

    it('throws on invalid page count or padding', () => {
      expect(() => generateBatesSequence({ totalPages: 0 })).toThrow('Total pages must be an integer between 1 and 5000')
      expect(() => generateBatesSequence({ digits: 1 })).toThrow('Digit padding must be between 2 and 12')
    })
  })

  describe('calculateStampPosition', () => {
    it('calculates bottom-right coordinates with standard letter dimensions', () => {
      const pos = calculateStampPosition('bottom-right', 612, 792, 36)
      expect(pos.x).toBe(576) // 612 - 36
      expect(pos.y).toBe(36)
      expect(pos.alignment).toBe('right')
    })

    it('calculates bottom-center coordinates', () => {
      const pos = calculateStampPosition('bottom-center', 612, 792, 36)
      expect(pos.x).toBe(306) // 612 / 2
      expect(pos.y).toBe(36)
      expect(pos.alignment).toBe('center')
    })

    it('calculates top-left coordinates', () => {
      const pos = calculateStampPosition('top-left', 612, 792, 36)
      expect(pos.x).toBe(36)
      expect(pos.y).toBe(756) // 792 - 36
      expect(pos.alignment).toBe('left')
    })
  })
})
