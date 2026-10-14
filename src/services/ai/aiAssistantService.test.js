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

    it('extracts quadratic equation coefficients and solves real roots', () => {
      const out = extractAndExecuteLocal('Solve quadratic equation with a=1, b=-5, c=6')
      expect(out).toBeDefined()
      expect(out.tool).toBe('solveQuadratic')
      expect(out.result.data.x1).toBe(3)
      expect(out.result.data.x2).toBe(2)
      expect(out.text).toContain('x₁ = 3.0000, x₂ = 2.0000')
    })

    it('extracts numbers and calculates GCD and LCM', () => {
      const out = extractAndExecuteLocal('Find gcd and lcm of 24 and 36')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculateGcdLcm')
      expect(out.result.data.gcd).toBe(12)
      expect(out.result.data.lcm).toBe(72)
      expect(out.text).toContain('GCD = 12')
      expect(out.text).toContain('LCM = 72')
    })

    it('extracts numbers and calculates standard deviation', () => {
      const out = extractAndExecuteLocal('calculate standard deviation for 10, 20, 30, 40, 50')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculateStandardDeviation')
      expect(out.result.data.mean).toBe(30)
      expect(out.result.data.count).toBe(5)
      expect(out.text).toContain('Mean = 30.00')
    })

    it('extracts n and r and calculates permutations and combinations', () => {
      const out = extractAndExecuteLocal('Calculate permutations and combinations for 10 items choose 3')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculatePermutationsCombinations')
      expect(out.result.data.nPr).toBe(720)
      expect(out.result.data.nCr).toBe(120)
      expect(out.text).toContain('Permutations P(10,3) = 720')
      expect(out.text).toContain('Combinations C(10,3) = 120')
    })

    it('extracts height and gender to calculate ideal body weight (IBW)', () => {
      const out = extractAndExecuteLocal('mera ideal body weight kitna hona chahiye for male 175cm?')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculateIdealBodyWeight')
      expect(out.result.data.devineKgFormatted).toBe('70.5')
      expect(out.link).toContain('/tools/ideal-body-weight-calculator?height=175&gender=male')
    })

    it('extracts weight and height to calculate BMI with L1 deep-link', () => {
      const out = extractAndExecuteLocal('BMI calculate karo 70kg 175cm')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculateBmi')
      expect(out.result.data.bmi).toBe(22.9)
      expect(out.link).toContain('/tools/bmi-health-calculator?weight=70&height=175')
      expect(out.text).toContain('BMI is 22.9')
    })

    it('extracts weight, height, age to calculate BMR & TDEE', () => {
      const out = extractAndExecuteLocal('Calculate BMR for male 70kg 175cm age 28')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculateBmrTdee')
      expect(out.result.data.bmr).toBe(1659)
      expect(out.result.data.tdee).toBe(2281)
      expect(out.link).toContain('/tools/bmr-tdee-calculator?')
    })

    it('extracts parameters to plan calorie deficit weight loss', () => {
      const out = extractAndExecuteLocal('Calorie deficit to go from 185 to 165 with 2400 maintenance in 10 weeks')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculateCalorieDeficit')
      expect(out.result.data.dailyDeficit).toBe(1000)
      expect(out.result.data.targetDailyCalories).toBe(1400)
    })

    it('extracts JSON and formats it with deep link', () => {
      const out = extractAndExecuteLocal('format json: {"hello":"world"}')
      expect(out).toBeDefined()
      expect(out.tool).toBe('formatJson')
      expect(out.result.data.formatted).toContain('{\n  "hello": "world"\n}')
      expect(out.link).toContain('/tools/json-formatter?src=')
    })

    it('extracts text to encode in Base64 with deep link', () => {
      const out = extractAndExecuteLocal('base64 encode: "Hello World"')
      expect(out).toBeDefined()
      expect(out.tool).toBe('convertBase64')
      expect(out.result.data.output).toBe('SGVsbG8gV29ybGQ=')
      expect(out.link).toContain('/tools/base64-encoder-decoder?src=')
      expect(out.text).toContain('SGVsbG8gV29ybGQ=')
    })

    it('extracts URL to encode with deep link', () => {
      const out = extractAndExecuteLocal('url encode: "https://vimz.ai/search?q=test tool"')
      expect(out).toBeDefined()
      expect(out.tool).toBe('encodeDecodeUrl')
      expect(out.result.data.output).toContain('https%3A%2F%2Fvimz.ai')
      expect(out.link).toContain('/tools/url-encoder-decoder?text=')
    })

    it('detects hash intent with algorithm and text', () => {
      const out = extractAndExecuteLocal('sha256 of "hello"')
      expect(out).toBeDefined()
      expect(out.tool).toBe('generateCryptoHash')
      expect(out.link).toContain('/tools/hash-generator?txt=hello&alg=SHA-256')
    })

    it('extracts text to count words and statistics', () => {
      const out = extractAndExecuteLocal('word count for: "The quick brown fox jumps over the lazy dog"')
      expect(out).toBeDefined()
      expect(out.tool).toBe('calculateTextStats')
      expect(out.result.data.words).toBe(9)
      expect(out.link).toContain('/tools/word-counter-text-stats?text=')
      expect(out.text).toContain('Words: **9**')
    })

    it('extracts text and mode to convert text case', () => {
      const out = extractAndExecuteLocal('convert to camelcase: "make this camel case"')
      expect(out).toBeDefined()
      expect(out.tool).toBe('convertTextCase')
      expect(out.result.data.val).toBe('makeThisCamelCase')
      expect(out.link).toContain('/tools/text-case-converter-tool?text=')
      expect(out.text).toContain('`makeThisCamelCase`')
    })

    it('extracts text to analyze word frequency and keyword density', () => {
      const out = extractAndExecuteLocal('word frequency for: "apple banana apple orange apple"')
      expect(out).toBeDefined()
      expect(out.tool).toBe('analyzeWordFrequency')
      expect(out.result.data.totalWords).toBe(5)
      expect(out.link).toContain('/tools/word-frequency-density-analyzer?text=')
      expect(out.text).toContain('apple')
    })

    it('extracts multiline list to remove duplicate lines', () => {
      const out = extractAndExecuteLocal('remove duplicates from: apple\nbanana\napple')
      expect(out).toBeDefined()
      expect(out.tool).toBe('deduplicateLines')
      expect(out.result.data.uniqueCount).toBe(2)
      expect(out.link).toContain('/tools/duplicate-line-deduplicator?text=')
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

    it('resolves async hash generation through sendMessageToAssistant', async () => {
      const res = await sendMessageToAssistant('sha256 of "hello"')
      expect(res.mode).toBe('zero-llm-deterministic')
      expect(res.reply).toContain('SHA-256 Hash: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
      expect(res.link).toContain('/tools/hash-generator?txt=hello&alg=SHA-256')
    })

    it('returns helpful tool suggestions for general queries', async () => {
      const res = await sendMessageToAssistant('I need to calculate my mortgage loan')
      expect(res.reply).toBeDefined()
    })
  })
})
