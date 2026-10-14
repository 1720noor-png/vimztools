import { describe, it, expect, beforeEach } from 'vitest'
import { searchTools, getToolBySlug, initSearchEngine } from './searchEngine.js'

describe('Zero-LLM Fast Search Engine (MiniSearch)', () => {
  beforeEach(() => {
    initSearchEngine()
  })

  it('finds tools by exact English title', () => {
    const results = searchTools('GPA/CGPA Calculator')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].slug).toBe('gpa-calculator')
    expect(results[0].name).toContain('GPA')
  })

  it('finds tools by English prefix as user types', () => {
    const results = searchTools('mortg')
    expect(results.length).toBeGreaterThan(0)
    const slugs = results.map((r) => r.slug)
    expect(slugs.some((s) => s.includes('mortgage'))).toBe(true)
  })

  it('matches natural language Roman Urdu queries (paisa double)', () => {
    const results = searchTools('paisa double')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].slug).toBe('rule-of-72-doubling-time-calculator')
  })

  it('matches Roman Urdu query for student attendance (attendance short)', () => {
    const results = searchTools('attendance short')
    expect(results.length).toBeGreaterThan(0)
    const slugs = results.map((r) => r.slug)
    expect(slugs.includes('attendance-calculator') || slugs.includes('attendance-tracker')).toBe(true)
  })

  it('matches Roman Urdu query for salary/tankhwah (tankhwah)', () => {
    const results = searchTools('tankhwah')
    expect(results.length).toBeGreaterThan(0)
    const slugs = results.map((r) => r.slug)
    expect(slugs.some((s) => s.includes('salary') || s.includes('wage'))).toBe(true)
  })

  it('handles typos with fuzzy search (caluclator)', () => {
    const results = searchTools('caluclator')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].name.toLowerCase()).toContain('calculator')
  })

  it('filters results by category', () => {
    const studentResults = searchTools('calculator', { category: 'student-tools' })
    expect(studentResults.length).toBeGreaterThan(0)
    expect(studentResults.every((r) => r.cat === 'student-tools')).toBe(true)
  })

  it('returns empty array on empty or whitespace query', () => {
    expect(searchTools('')).toEqual([])
    expect(searchTools('   ')).toEqual([])
    expect(searchTools(null)).toEqual([])
  })

  it('retrieves tool details by slug with getToolBySlug', () => {
    const tool = getToolBySlug('gpa-calculator')
    expect(tool).toBeDefined()
    expect(tool.name).toBe('GPA/CGPA Calculator')
    expect(tool.cat).toBe('student-tools')
  })
})
