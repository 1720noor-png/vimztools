import { describe, it, expect } from 'vitest'
import { executeTool, AI_TOOL_DEFINITIONS, AI_TOOL_MAP } from './toolRegistry.js'
import { extractAndExecuteLocal, sendMessageToAssistant } from './aiAssistantService.js'

describe('AI Assistant Service & Golden Rule Engine', () => {
  describe('Tool Registry Integrity', () => {
    it('has definitions for all registered AI tools with valid JSON schemas', () => {
      expect(AI_TOOL_DEFINITIONS.length).toBeGreaterThanOrEqual(13)
      for (const def of AI_TOOL_DEFINITIONS) {
        expect(def.name).toBeDefined()
        expect(def.description).toBeDefined()
        expect(def.parameters).toBeDefined()
        expect(def.parameters.type).toBe('OBJECT')
        expect(typeof def.execute).toBe('function')
      }
    })

    it('executes calculateRuleOf72 deterministically via executeTool', () => {
      const res = executeTool('calculateRuleOf72', { annualRate: 7.2 })
      expect(res.success).toBe(true)
      expect(res.data.approxYears).toBe(10)
      expect(res.slug).toBe('rule-of-72-doubling-time-calculator')
    })

    it('executes calculateAttendance deterministically via executeTool', () => {
      const res = executeTool('calculateAttendance', { attended: 40, total: 50, target: 75 })
      expect(res.success).toBe(true)
      expect(res.data.percentage).toBe(80.00)
      expect(res.data.canMiss).toBe(3)
    })

    it('executes calculateGpa deterministically via executeTool', () => {
      const res = executeTool('calculateGpa', {
        courses: [
          { grade: 'A', credits: 3 },
          { grade: 'B', credits: 3 }
        ]
      })
      expect(res.success).toBe(true)
      expect(res.data.gpa).toBe(3.5)
    })

    it('handles calculation execution errors gracefully without throwing', () => {
      const res = executeTool('calculateRuleOf72', { annualRate: -5 })
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('throws error when tool is not registered', () => {
      expect(() => executeTool('unknownTool123', {})).toThrow('not registered')
    })
  })

  describe('Zero-LLM Deterministic Intent & Parameter Extractor ($0 Cost)', () => {
    it('extracts rate and executes Rule of 72 from Roman Urdu query', () => {
      const out = extractAndExecuteLocal('mera interest rate 8% hai kitne saal me paisa double hoga?')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculateRuleOf72')
      expect(out.result.data.approxYears).toBe(9.0)
      expect(out.text).toContain('double in approximately **9.0 years**')
    })

    it('extracts attended/total classes and recommends attendance action', () => {
      const out = extractAndExecuteLocal('I attended 35 out of 45 classes, will I reach 75% attendance?')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculateAttendance')
      expect(out.result.data.percentage).toBe(77.78)
      expect(out.text).toContain('Current attendance: 77.78%')
    })

    it('extracts salary amount and calculates equivalent hourly rate', () => {
      const out = extractAndExecuteLocal('What is my hourly wage if my annual salary is 104,000?')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculateSalaryToHourly')
      expect(out.result.data.hourlyRate).toBe(50)
      expect(out.text).toContain('$50.00/hour')
    })

    it('extracts bill amount and tip percent for tip splitter', () => {
      const out = extractAndExecuteLocal('Calculate tip for bill of 100 with 15 percent tip split among 2 people')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculateTipSplit')
      expect(out.result.data.totalPerPerson).toBe(57.5)
    })

    it('prompts for missing parameters when intent is detected without numbers', () => {
      const out = extractAndExecuteLocal('How many years to double money?')
      expect(out).toBeDefined()
      expect(out.text).toContain('expected annual interest rate')
    })
  })

  describe('sendMessageToAssistant Integration', () => {
    it('returns deterministic reply in zero-llm mode when no api key is configured', async () => {
      const res = await sendMessageToAssistant('What is rule of 72 doubling time at 6% rate?')
      expect(res.mode).toBe('zero-llm-deterministic')
      expect(res.reply).toContain('12.0 years')
      expect(res.data.approxYears).toBe(12)
    })

    it('returns helpful tool suggestions for general queries', async () => {
      const res = await sendMessageToAssistant('I need to calculate my mortgage loan')
      expect(res.reply).toBeDefined()
    })
  })
})
