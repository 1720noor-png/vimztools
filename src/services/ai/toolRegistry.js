import { calculateRuleOf72 } from '@tool-core/finance/ruleOf72.js'
import { calculateSimpleInterest } from '@tool-core/finance/simpleInterest.js'
import { calculateCompoundInterest } from '@tool-core/finance/compoundInterest.js'
import { calculateSalaryToHourly } from '@tool-core/finance/salaryToHourly.js'
import { calculateTipSplitter } from '@tool-core/finance/tipSplitter.js'
import { calculateMortgageEmi } from '@tool-core/finance/mortgageEmi.js'
import { calculateDebtToIncome } from '@tool-core/finance/debtToIncome.js'
import { calculateEmergencySavingsFund } from '@tool-core/finance/emergencySavingsFund.js'
import { calculateDcfValuation } from '@tool-core/finance/dcfValuation.js'
import { calculatePersonalNetWorth } from '@tool-core/finance/personalNetWorth.js'
import { calculateDividendDripGrowth } from '@tool-core/finance/dividendDripGrowth.js'
import { calculateCreditCardPayoff } from '@tool-core/finance/creditCardPayoff.js'
import { calculateInflationAdjustedReturn } from '@tool-core/finance/inflationAdjustedReturn.js'
import { calculateLoanPayoff } from '@tool-core/finance/loanPayoff.js'
import { calculateCollegeSavings529 } from '@tool-core/finance/collegeSavings529.js'
import { calculateSipInvestment } from '@tool-core/finance/sipInvestment.js'
import { calculateGpa } from '@tool-core/student/gpaCalculator.js'
import { calculateGrade } from '@tool-core/student/gradeCalculator.js'
import { calculateAttendance } from '@tool-core/student/attendanceCalculator.js'
import { calculatePercentage } from '@tool-core/student/percentageCalculator.js'
import { solveQuadratic } from '@tool-core/math/quadraticSolver.js'
import { calculateGcdLcm } from '@tool-core/math/gcdLcm.js'
import { calculateStandardDeviation } from '@tool-core/math/standardDeviation.js'
import { calculatePermutationsCombinations } from '@tool-core/math/permutationsCombinations.js'
import { calculateIdealBodyWeight } from '@tool-core/health/idealBodyWeight.js'
import { calculateBmi } from '@tool-core/health/bmiCalculator.js'
import { calculateBmrTdee } from '@tool-core/health/bmrTdeeCalculator.js'
import { calculateCalorieDeficit } from '@tool-core/health/calorieDeficit.js'
import { formatJson, minifyJson, validateJson } from '@tool-core/developer/jsonFormatter.js'
import { encodeBase64, decodeBase64 } from '@tool-core/developer/base64Converter.js'
import { encodeUrlText, encodeFullUrl, decodeUrl } from '@tool-core/developer/urlEncoderDecoder.js'
import { generateHash, normalizeAlgorithm } from '@tool-core/developer/hashGenerator.js'
import { calculateTextStats } from '@tool-core/writing/wordCounter.js'
import { convertTextCase } from '@tool-core/writing/textCaseConverter.js'
import { analyzeWordFrequency } from '@tool-core/writing/wordFrequencyDensity.js'
import { deduplicateLines } from '@tool-core/writing/lineDeduplicator.js'

/**
 * Tool Registry for AI Assistant
 * Maps Gemini Function Calling definitions directly to pure @tool-core calculation engines.
 * Strictly adheres to The Golden Rule: LLM never generates numbers, calculation is 100% deterministic.
 */
export const AI_TOOL_DEFINITIONS = [
  {
    name: 'calculateRuleOf72',
    slug: 'rule-of-72-doubling-time-calculator',
    description: 'Calculate how many years it will take for an investment to double at a given annual interest rate (Rule of 72). Use when user asks about doubling money or kitne saal me paisa double hoga.',
    parameters: {
      type: 'OBJECT',
      properties: {
        annualRate: {
          type: 'NUMBER',
          description: 'Annual interest rate or return percentage (e.g. 7 for 7%)'
        }
      },
      required: ['annualRate']
    },
    execute: (args) => calculateRuleOf72({ rate: args.annualRate ?? args.rate })
  },
  {
    name: 'calculateAttendance',
    slug: 'attendance-calculator',
    description: 'Calculate student attendance percentage and classes they can miss or must attend to achieve a target percentage (e.g. 75%). Use when user asks about attendance, hazri, classes short, or missing classes.',
    parameters: {
      type: 'OBJECT',
      properties: {
        attended: {
          type: 'INTEGER',
          description: 'Total number of classes attended so far'
        },
        total: {
          type: 'INTEGER',
          description: 'Total number of classes held so far'
        },
        target: {
          type: 'NUMBER',
          description: 'Target attendance percentage (default is 75)'
        }
      },
      required: ['attended', 'total']
    },
    execute: (args) => calculateAttendance(args)
  },
  {
    name: 'calculateGpa',
    slug: 'gpa-calculator',
    description: 'Calculate semester GPA (4.0 scale) and cumulative CGPA from course grades and credit hours. Use when user asks to calculate GPA or CGPA.',
    parameters: {
      type: 'OBJECT',
      properties: {
        courses: {
          type: 'ARRAY',
          description: 'List of courses with grade (A, A-, B+, B, B-, C+, C, C-, D, F) and credit hours',
          items: {
            type: 'OBJECT',
            properties: {
              grade: { type: 'STRING' },
              credits: { type: 'NUMBER' },
              name: { type: 'STRING' }
            },
            required: ['grade', 'credits']
          }
        },
        previousCgpa: {
          type: 'NUMBER',
          description: 'Previous cumulative GPA (0-4.0), optional'
        },
        previousCredits: {
          type: 'NUMBER',
          description: 'Previous total completed credit hours, optional'
        }
      },
      required: ['courses']
    },
    execute: (args) => calculateGpa(args)
  },
  {
    name: 'calculateGrade',
    slug: 'grade-calculator',
    description: 'Calculate overall marks, percentage, and letter grade from student assessments. Use when user asks for their total grade or percentage from test marks.',
    parameters: {
      type: 'OBJECT',
      properties: {
        assessments: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              marks: { type: 'NUMBER' },
              total: { type: 'NUMBER' }
            },
            required: ['marks', 'total']
          }
        }
      },
      required: ['assessments']
    },
    execute: (args) => calculateGrade(args)
  },
  {
    name: 'calculatePercentage',
    slug: 'percentage-calculator',
    description: 'Calculate percentages: "of" (What is X% of Y?), "is" (X is what % of Y?), or "chg" (Percent change from X to Y).',
    parameters: {
      type: 'OBJECT',
      properties: {
        mode: {
          type: 'STRING',
          enum: ['of', 'is', 'chg'],
          description: 'Mode of calculation: "of", "is", or "chg"'
        },
        a: { type: 'NUMBER', description: 'First number' },
        b: { type: 'NUMBER', description: 'Second number' }
      },
      required: ['a', 'b']
    },
    execute: (args) => calculatePercentage(args)
  },
  {
    name: 'calculateSalaryToHourly',
    slug: 'salary-to-hourly',
    description: 'Convert an annual or monthly salary to an equivalent hourly wage, and vice versa. Use when user asks what their salary equals per hour or tankhwah hisab.',
    parameters: {
      type: 'OBJECT',
      properties: {
        annualSalary: { type: 'NUMBER', description: 'Annual salary in currency' },
        hoursPerWeek: { type: 'NUMBER', description: 'Hours worked per week (default 40)' },
        weeksPerYear: { type: 'NUMBER', description: 'Weeks worked per year (default 52)' }
      },
      required: ['annualSalary']
    },
    execute: (args) =>
      calculateSalaryToHourly({
        salary: args.annualSalary ?? args.salary,
        hoursWeek: args.hoursPerWeek ?? args.hoursWeek,
        weeksYear: args.weeksPerYear ?? args.weeksYear
      })
  },
  {
    name: 'calculateTipSplit',
    slug: 'tip-splitter',
    description: 'Calculate restaurant tip, total bill with tip, and amount owed per person when splitting a bill.',
    parameters: {
      type: 'OBJECT',
      properties: {
        billAmount: { type: 'NUMBER', description: 'Bill total before tip' },
        tipPercent: { type: 'NUMBER', description: 'Tip percentage (e.g. 15 for 15%)' },
        numberOfPeople: { type: 'INTEGER', description: 'Number of people splitting the bill' }
      },
      required: ['billAmount', 'tipPercent', 'numberOfPeople']
    },
    execute: (args) =>
      calculateTipSplitter({
        bill: args.billAmount ?? args.bill,
        tip: args.tipPercent ?? args.tip,
        people: args.numberOfPeople ?? args.people
      })
  },
  {
    name: 'calculateMortgageEmi',
    slug: 'mortgage-emi-calculator',
    description: 'Calculate monthly mortgage payment (EMI / P&I), total interest, and total cost of home loan.',
    parameters: {
      type: 'OBJECT',
      properties: {
        principal: { type: 'NUMBER', description: 'Total loan amount borrowed' },
        annualInterestRate: { type: 'NUMBER', description: 'Annual mortgage interest rate percentage' },
        loanTermYears: { type: 'NUMBER', description: 'Loan term in years (e.g. 15 or 30)' },
        propertyTaxAnnual: { type: 'NUMBER', description: 'Annual property tax (optional)' },
        homeInsuranceAnnual: { type: 'NUMBER', description: 'Annual home insurance (optional)' },
        hoaMonthly: { type: 'NUMBER', description: 'Monthly HOA dues (optional)' }
      },
      required: ['principal', 'annualInterestRate', 'loanTermYears']
    },
    execute: (args) => calculateMortgageEmi(args)
  },
  {
    name: 'calculateSimpleInterest',
    slug: 'simple-interest-return-calculator',
    description: 'Calculate simple interest earned or owed over time on a principal sum.',
    parameters: {
      type: 'OBJECT',
      properties: {
        principal: { type: 'NUMBER', description: 'Principal amount' },
        rate: { type: 'NUMBER', description: 'Annual interest rate percentage' },
        timeYears: { type: 'NUMBER', description: 'Time duration in years' }
      },
      required: ['principal', 'rate', 'timeYears']
    },
    execute: (args) => calculateSimpleInterest(args)
  },
  {
    name: 'calculateCompoundInterest',
    slug: 'compound-interest-calculator',
    description: 'Calculate compound interest growth on a principal over years with compounding frequency.',
    parameters: {
      type: 'OBJECT',
      properties: {
        principal: { type: 'NUMBER', description: 'Initial deposit or principal' },
        annualRate: { type: 'NUMBER', description: 'Annual interest rate percentage' },
        timesCompoundedPerYear: { type: 'INTEGER', description: 'Compounding frequency per year (e.g. 12 for monthly, 1 for annually)' },
        years: { type: 'NUMBER', description: 'Number of years invested' }
      },
      required: ['principal', 'annualRate', 'years']
    },
    execute: (args) => calculateCompoundInterest(args)
  },
  {
    name: 'calculateDebtToIncome',
    slug: 'debt-to-income-dti-ratio-calculator',
    description: 'Calculate Debt-to-Income (DTI) ratio to check mortgage eligibility and financial health.',
    parameters: {
      type: 'OBJECT',
      properties: {
        grossMonthlyIncome: { type: 'NUMBER', description: 'Total pre-tax monthly income' },
        monthlyDebtPayments: { type: 'NUMBER', description: 'Total monthly debt payments' }
      },
      required: ['grossMonthlyIncome', 'monthlyDebtPayments']
    },
    execute: (args) => calculateDebtToIncome(args)
  },
  {
    name: 'calculateEmergencyFund',
    slug: 'emergency-savings-fund-calculator',
    description: 'Calculate required emergency savings runway (3-12 months) and shortfall.',
    parameters: {
      type: 'OBJECT',
      properties: {
        monthlyEssentialExpenses: { type: 'NUMBER', description: 'Essential monthly expenses' },
        targetMonths: { type: 'INTEGER', description: 'Desired emergency runway in months (e.g. 6)' },
        currentSavings: { type: 'NUMBER', description: 'Current emergency savings balance' }
      },
      required: ['monthlyEssentialExpenses', 'targetMonths']
    },
    execute: (args) =>
      calculateEmergencySavingsFund({
        housing: args.monthlyEssentialExpenses ?? args.housing ?? 0,
        months: args.targetMonths ?? args.months ?? 6
      })
  },
  {
    name: 'calculateSip',
    slug: 'sip-calculator',
    description: 'Calculate Systematic Investment Plan (SIP) mutual fund future value and total returns.',
    parameters: {
      type: 'OBJECT',
      properties: {
        monthlyInvestment: { type: 'NUMBER', description: 'Monthly amount invested' },
        expectedAnnualReturnPercent: { type: 'NUMBER', description: 'Expected annual return percentage' },
        investmentPeriodYears: { type: 'NUMBER', description: 'Duration of investment in years' }
      },
      required: ['monthlyInvestment', 'expectedAnnualReturnPercent', 'investmentPeriodYears']
    },
    execute: (args) =>
      calculateSipInvestment({
        amount: args.monthlyInvestment ?? args.amount,
        rate: args.expectedAnnualReturnPercent ?? args.rate,
        years: args.investmentPeriodYears ?? args.years
      })
  },
  {
    name: 'solveQuadratic',
    slug: 'quadratic-equation-solver-tool',
    description: 'Solve quadratic equations (ax² + bx + c = 0) to find real or complex roots and discriminant. Use when user asks to solve quadratic equations or find roots of quadratic formula.',
    parameters: {
      type: 'OBJECT',
      properties: {
        a: { type: 'NUMBER', description: 'Quadratic coefficient a (a ≠ 0)' },
        b: { type: 'NUMBER', description: 'Linear coefficient b' },
        c: { type: 'NUMBER', description: 'Constant term c' }
      },
      required: ['a', 'b', 'c']
    },
    execute: (args) => solveQuadratic({ a: args.a, b: args.b, c: args.c })
  },
  {
    name: 'calculateGcdLcm',
    slug: 'gcd-lcm-calculator-tool',
    description: 'Calculate Greatest Common Divisor (GCD/HCF) and Least Common Multiple (LCM) of two or more numbers. Use when user asks for GCD, HCF, LCM, ad-e-azam, or zuaaf-e-aql.',
    parameters: {
      type: 'OBJECT',
      properties: {
        a: { type: 'INTEGER', description: 'First number' },
        b: { type: 'INTEGER', description: 'Second number' }
      },
      required: ['a', 'b']
    },
    execute: (args) => calculateGcdLcm({ a: args.a, b: args.b })
  },
  {
    name: 'calculateStandardDeviation',
    slug: 'standard-deviation-variance-calculator',
    description: 'Calculate Mean, Variance, Sample Standard Deviation, and Population Standard Deviation for a dataset of numbers. Use when user asks for standard deviation, variance, or statistical dispersion.',
    parameters: {
      type: 'OBJECT',
      properties: {
        numbers: { type: 'STRING', description: 'Dataset of numbers separated by commas or spaces (e.g. "12, 15, 18, 22")' }
      },
      required: ['numbers']
    },
    execute: (args) => calculateStandardDeviation({ numbers: args.numbers })
  },
  {
    name: 'calculatePermutationsCombinations',
    slug: 'permutations-combinations-calculator',
    description: 'Calculate Permutations (nPr - order matters) and Combinations (nCr - order does not matter) for selecting r items from n total items.',
    parameters: {
      type: 'OBJECT',
      properties: {
        n: { type: 'INTEGER', description: 'Total number of items in the set (n)' },
        r: { type: 'INTEGER', description: 'Number of items to select/choose (r)' }
      },
      required: ['n', 'r']
    },
    execute: (args) => calculatePermutationsCombinations({ n: args.n, r: args.r })
  },
  {
    name: 'calculateIdealBodyWeight',
    slug: 'ideal-body-weight-calculator',
    description: 'Calculate ideal body weight (IBW) based on height and gender using the clinical Devine Formula.',
    parameters: {
      type: 'OBJECT',
      properties: {
        heightCm: { type: 'NUMBER', description: 'Height in centimeters (e.g. 175)' },
        gender: { type: 'STRING', description: 'Gender: "male" or "female"' }
      },
      required: ['heightCm']
    },
    execute: (args) => calculateIdealBodyWeight({ heightCm: args.heightCm ?? args.height, gender: args.gender })
  },
  {
    name: 'calculateBmi',
    slug: 'bmi-health-calculator',
    description: 'Calculate Body Mass Index (BMI), WHO weight category, and healthy weight range for height and weight.',
    parameters: {
      type: 'OBJECT',
      properties: {
        weight: { type: 'NUMBER', description: 'Weight in kilograms (or lbs if unit is imperial)' },
        height: { type: 'NUMBER', description: 'Height in centimeters (or inches if unit is imperial)' },
        unit: { type: 'STRING', description: '"metric" (kg/cm) or "imperial" (lbs/in)' }
      },
      required: ['weight', 'height']
    },
    execute: (args) => calculateBmi({ weight: args.weight, height: args.height, unit: args.unit })
  },
  {
    name: 'calculateBmrTdee',
    slug: 'bmr-tdee-calculator',
    description: 'Calculate Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) maintenance and weight loss targets using Mifflin-St Jeor formula.',
    parameters: {
      type: 'OBJECT',
      properties: {
        weightKg: { type: 'NUMBER', description: 'Weight in kilograms' },
        heightCm: { type: 'NUMBER', description: 'Height in centimeters' },
        age: { type: 'INTEGER', description: 'Age in years' },
        gender: { type: 'STRING', description: '"male" or "female"' },
        activity: { type: 'NUMBER', description: 'Activity multiplier (1.2 sedentary to 1.9 heavy athlete)' }
      },
      required: ['weightKg', 'heightCm', 'age']
    },
    execute: (args) =>
      calculateBmrTdee({
        weightKg: args.weightKg ?? args.weight,
        heightCm: args.heightCm ?? args.height,
        age: args.age,
        gender: args.gender,
        activity: args.activity
      })
  },
  {
    name: 'calculateCalorieDeficit',
    slug: 'calorie-deficit-weight-loss-planner',
    description: 'Calculate daily calorie deficit and target daily caloric intake to achieve a target weight goal over a timeline in weeks.',
    parameters: {
      type: 'OBJECT',
      properties: {
        currentWeight: { type: 'NUMBER', description: 'Current weight in lbs or kg' },
        targetWeight: { type: 'NUMBER', description: 'Target goal weight' },
        maintenanceTdee: { type: 'NUMBER', description: 'Daily maintenance calories (TDEE)' },
        timelineWeeks: { type: 'NUMBER', description: 'Duration in weeks' }
      },
      required: ['currentWeight', 'targetWeight', 'maintenanceTdee', 'timelineWeeks']
    },
    execute: (args) =>
      calculateCalorieDeficit({
        currentWeight: args.currentWeight,
        targetWeight: args.targetWeight,
        maintenanceTdee: args.maintenanceTdee ?? args.tdee,
        timelineWeeks: args.timelineWeeks ?? args.weeks
      })
  },
  {
    name: 'formatJson',
    slug: 'json-formatter',
    description: 'Format, pretty-print, or minify a JSON string with indentation (2 spaces, 4 spaces, or tab).',
    parameters: {
      type: 'OBJECT',
      properties: {
        input: { type: 'STRING', description: 'JSON string to format or minify' },
        indent: { type: 'STRING', description: 'Indentation spaces (2, 4, or tab)' },
        minify: { type: 'BOOLEAN', description: 'Set to true to minify the JSON' }
      },
      required: ['input']
    },
    execute: (args) => {
      if (args.minify) {
        const minified = minifyJson(args.input)
        return {
          formatted: minified,
          summary: `Minified JSON (${minified.length} chars)`
        }
      }
      const formatted = formatJson(args.input, args.indent ?? 2)
      return {
        formatted,
        summary: `Formatted JSON (${formatted.split('\n').length} lines)`
      }
    }
  },
  {
    name: 'validateJson',
    slug: 'json-validator',
    description: 'Validate a JSON string, report syntax errors, and show error line and column position.',
    parameters: {
      type: 'OBJECT',
      properties: {
        input: { type: 'STRING', description: 'JSON string to validate' }
      },
      required: ['input']
    },
    execute: (args) => validateJson(args.input)
  },
  {
    name: 'convertBase64',
    slug: 'base64-encoder-decoder',
    description: 'Encode text to Base64 or decode Base64 back to plain UTF-8 text with optional URL-safe format.',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'Text to encode or Base64 string to decode' },
        mode: { type: 'STRING', description: "'encode' to convert to Base64, or 'decode' to convert back to text" },
        urlSafe: { type: 'BOOLEAN', description: 'Use URL-safe Base64 without + or / and no padding' }
      },
      required: ['text']
    },
    execute: (args) => {
      const mode = (args.mode || 'encode').toLowerCase()
      if (mode === 'decode') {
        const decoded = decodeBase64(args.text)
        return {
          mode: 'decode',
          output: decoded,
          summary: `Decoded Base64: ${decoded}`
        }
      }
      const encoded = encodeBase64(args.text, { urlSafe: Boolean(args.urlSafe) })
      return {
        mode: 'encode',
        output: encoded,
        summary: `Base64 Encoded: ${encoded}`
      }
    }
  },
  {
    name: 'encodeDecodeUrl',
    slug: 'url-encoder-decoder',
    description: 'Percent-encode or decode a URL or text string, or encode a full URL preserving structure.',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'URL or text to encode or decode' },
        action: { type: 'STRING', description: "'encodeText', 'encodeFullUrl', or 'decode'" }
      },
      required: ['text']
    },
    execute: (args) => {
      const act = args.action || 'encodeText'
      let output = ''
      if (act === 'decode') {
        output = decodeUrl(args.text)
      } else if (act === 'encodeFullUrl') {
        output = encodeFullUrl(args.text)
      } else {
        output = encodeUrlText(args.text)
      }
      return {
        action: act,
        output,
        summary: `URL ${act}: ${output}`
      }
    }
  },
  {
    name: 'generateCryptoHash',
    slug: 'hash-generator',
    description: 'Generate cryptographic hash digests (SHA-1, SHA-256, SHA-384, SHA-512) for text using Web Crypto.',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'Input text to hash' },
        algorithm: { type: 'STRING', description: "Algorithm: 'SHA-1', 'SHA-256', 'SHA-384', or 'SHA-512'" }
      },
      required: ['text']
    },
    execute: async (args) => {
      const alg = normalizeAlgorithm(args.algorithm || 'SHA-256')
      const hash = await generateHash(args.text, alg)
      return {
        algorithm: alg,
        hash,
        summary: `${alg} Hash: ${hash}`
      }
    }
  },
  {
    name: 'calculateTextStats',
    slug: 'word-counter-text-stats',
    description: 'Count words, characters (with and without spaces), sentences, paragraphs, and estimate reading and speaking time.',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'Text content to count and analyze' }
      },
      required: ['text']
    },
    execute: (args) => calculateTextStats(args.text)
  },
  {
    name: 'convertTextCase',
    slug: 'text-case-converter-tool',
    description: 'Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case.',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'Input text to transform' },
        mode: { type: 'STRING', description: 'Target case: upper, lower, title, sentence, camel, pascal, snake, or kebab' }
      },
      required: ['text']
    },
    execute: (args) => convertTextCase(args.text, args.mode)
  },
  {
    name: 'analyzeWordFrequency',
    slug: 'word-frequency-density-analyzer',
    description: 'Analyze text for total word count, unique keywords, and top recurring keyword density percentages.',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'Text to analyze' },
        topN: { type: 'INTEGER', description: 'Number of top keywords to return (default 5)' }
      },
      required: ['text']
    },
    execute: (args) => analyzeWordFrequency(args.text, { topN: args.topN })
  },
  {
    name: 'deduplicateLines',
    slug: 'duplicate-line-deduplicator',
    description: 'Remove duplicate lines from text lists, sort lines alphabetically, and strip empty lines.',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'Multiline text or list of items' },
        sortMode: { type: 'STRING', description: "Sort mode: 'none', 'asc', or 'desc'" }
      },
      required: ['text']
    },
    execute: (args) => deduplicateLines(args.text, { sortMode: args.sortMode })
  }
]

export const AI_TOOL_MAP = new Map(AI_TOOL_DEFINITIONS.map((t) => [t.name, t]))

/**
 * Execute a registered tool call by name with validated parameters.
 * Supports both synchronous and asynchronous (Promise) tool executions.
 *
 * @param {string} name - Tool function name
 * @param {Object} args - Arguments extracted by AI
 * @returns {Object|Promise<Object>} Execution result conforming to Golden Rule
 */
export function executeTool(name, args) {
  const tool = AI_TOOL_MAP.get(name)
  if (!tool) {
    throw new Error(`Tool "${name}" is not registered in the AI Assistant registry.`)
  }

  try {
    const calculation = tool.execute(args)
    if (calculation && typeof calculation.then === 'function') {
      return calculation
        .then((res) => ({
          success: true,
          toolName: tool.name,
          slug: tool.slug,
          args,
          data: res,
          summary: res?.summary || res?.message || JSON.stringify(res)
        }))
        .catch((err) => ({
          success: false,
          toolName: tool.name,
          slug: tool.slug,
          args,
          error: err.message
        }))
    }

    return {
      success: true,
      toolName: tool.name,
      slug: tool.slug,
      args,
      data: calculation,
      summary: calculation?.summary || calculation?.message || JSON.stringify(calculation)
    }
  } catch (err) {
    return {
      success: false,
      toolName: tool.name,
      slug: tool.slug,
      args,
      error: err.message
    }
  }
}
