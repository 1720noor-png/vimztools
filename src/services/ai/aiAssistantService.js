import { GoogleGenAI } from '@google/genai'
import { AI_TOOL_DEFINITIONS, executeTool } from './toolRegistry.js'
import { searchTools } from '../search/searchEngine.js'
import { normalizeAlgorithm } from '@tool-core/developer/hashGenerator.js'
import { BASELINE_FOREX_RATES } from '@tool-core/finance/currencyConverter.js'

export const SYSTEM_INSTRUCTION = `You are the official Vimz.ai Intelligent Assistant (Golden Rule Edition).
Vimz.ai is a suite of 1,000+ deterministic utilities.
YOUR GOLDEN RULE:
1. You MUST NEVER compute numbers or math yourself. NEVER estimate, guess, or do mental arithmetic.
2. Whenever a user asks a question involving calculations, you MUST identify the appropriate tool and invoke it via function calling with the extracted parameters.
3. If necessary parameters are missing from the user's prompt (e.g. rate, attendance counts, principal), politely ask clarifying questions to gather the missing inputs before executing.
4. You are fluent in English, Urdu, and Roman Urdu. Respond in the same language and tone as the user.
5. Ground all numerical values in the result returned by the tool execution.`

/**
 * Format tool declarations for the Google GenAI SDK.
 */
function getGeminiFunctionDeclarations() {
  return AI_TOOL_DEFINITIONS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }))
}

/**
 * Deterministic parameter extractor for Zero-LLM Fallback Mode ($0 cost).
 * Automatically extracts numeric inputs and delegates to pure @tool-core engines.
 *
 * @param {string} prompt - User query
 * @returns {Object|null} Extracted tool execution result or null
 */
export function extractAndExecuteLocal(prompt) {
  const p = (prompt || '').trim()
  if (!p) return null

  // 1. Rule of 72 / Doubling
  if (/rule.*72|doubl|paisa.*double|kitne.*saal.*double/i.test(p)) {
    // Match rate specifically, ignoring the literal 72 in "Rule of 72"
    let rateMatch = p.match(/(\d+(?:\.\d+)?)\s*(?:%|percent|feesad)/i)
    if (!rateMatch) {
      rateMatch = p.match(/(?:rate|return|sood|interest|at)\s*(?:of|is|hai|pe)?\s*(\d+(?:\.\d+)?)/i)
    }
    if (!rateMatch) {
      const allNums = p.match(/\b\d+(?:\.\d+)?\b/g)
      const non72 = (allNums || []).find((n) => n !== '72')
      if (non72) rateMatch = [null, non72]
    }

    if (rateMatch) {
      const rate = parseFloat(rateMatch[1])
      if (rate > 0) {
        const res = executeTool('calculateRuleOf72', { annualRate: rate })
        return {
          tool: 'calculateRuleOf72',
          slug: 'rule-of-72-doubling-time-calculator',
          result: res,
          text: `At an annual return of **${rate}%**, your investment will double in approximately **${res.data.approxYears.toFixed(1)} years** (exact: ${res.data.exactYears.toFixed(2)} years) according to the Rule of 72.`
        }
      }
    }
    return {
      tool: 'calculateRuleOf72',
      slug: 'rule-of-72-doubling-time-calculator',
      text: 'To calculate doubling time, what is your expected annual interest rate or return percentage?'
    }
  }

  // 2. Attendance Calculator
  if (/attend|hazri|classes|short.*attendance/i.test(p)) {
    // Check patterns like: "40 out of 50", "40/50", "attended 40 total 50"
    const numbers = p.match(/\b\d+\b/g)
    if (numbers && numbers.length >= 2) {
      const attended = parseInt(numbers[0], 10)
      const total = parseInt(numbers[1], 10)
      const target = numbers.length >= 3 ? parseFloat(numbers[2]) : 75

      if (attended >= 0 && total >= attended && total > 0) {
        const res = executeTool('calculateAttendance', { attended, total, target })
        return {
          tool: 'calculateAttendance',
          slug: 'attendance-calculator',
          result: res,
          text: res.data.message
        }
      }
    }
    return {
      tool: 'calculateAttendance',
      slug: 'attendance-calculator',
      text: 'Please tell me: how many classes have you attended, and what is the total number of classes held?'
    }
  }

  // 3. Salary to Hourly Wage
  if (!/\btax\b/i.test(p) && /salary|hourly|tankhwah|per hour/i.test(p)) {
    const salaryMatch = p.match(/(\d[\d,]*)/)
    if (salaryMatch) {
      const annualSalary = parseFloat(salaryMatch[1].replace(/,/g, ''))
      if (annualSalary > 0) {
        const res = executeTool('calculateSalaryToHourly', { annualSalary })
        return {
          tool: 'calculateSalaryToHourly',
          slug: 'salary-to-hourly',
          result: res,
          text: `An annual salary of **$${annualSalary.toLocaleString()}** equals approximately **$${res.data.hourlyRate.toFixed(2)}/hour** ($${res.data.monthlyRate.toFixed(2)}/month, assuming 40 hrs/wk).`
        }
      }
    }
    return {
      tool: 'calculateSalaryToHourly',
      slug: 'salary-to-hourly',
      text: 'What is your annual or monthly salary amount?'
    }
  }

  // 4. Tip Splitter
  if (/tip|bill.*split|bakhsheesh/i.test(p)) {
    const numbers = p.match(/\b\d+(?:\.\d+)?\b/g)
    if (numbers && numbers.length >= 2) {
      const bill = parseFloat(numbers[0])
      const tipPct = parseFloat(numbers[1])
      const people = numbers.length >= 3 ? parseInt(numbers[2], 10) : 1
      const res = executeTool('calculateTipSplit', { billAmount: bill, tipPercent: tipPct, numberOfPeople: people })
      return {
        tool: 'calculateTipSplit',
        slug: 'tip-splitter',
        result: res,
        text: res.data.summary
      }
    }
  }

  // 5. Quadratic Equation Solver
  if (/quadratic|roots.*equation|muraba.*masawat/i.test(p)) {
    const coeffMatches = p.match(/-?\b\d+(?:\.\d+)?\b/g)
    if (coeffMatches && coeffMatches.length >= 3) {
      const a = parseFloat(coeffMatches[0])
      const b = parseFloat(coeffMatches[1])
      const c = parseFloat(coeffMatches[2])
      if (a !== 0) {
        const res = executeTool('solveQuadratic', { a, b, c })
        return {
          tool: 'solveQuadratic',
          slug: 'quadratic-equation-solver-tool',
          result: res,
          text: `For equation **${a}x² + (${b})x + (${c}) = 0**: ${res.data.val}`
        }
      }
    }
    return {
      tool: 'solveQuadratic',
      slug: 'quadratic-equation-solver-tool',
      text: 'To solve a quadratic equation (ax² + bx + c = 0), please provide coefficients a, b, and c (where a ≠ 0).'
    }
  }

  // 6. GCD & LCM
  if (/\b(gcd|hcf|lcm|ad-e-azam|zuaaf)\b/i.test(p)) {
    const nums = p.match(/\b\d+\b/g)
    if (nums && nums.length >= 2) {
      const a = parseInt(nums[0], 10)
      const b = parseInt(nums[1], 10)
      const res = executeTool('calculateGcdLcm', { a, b })
      return {
        tool: 'calculateGcdLcm',
        slug: 'gcd-lcm-calculator-tool',
        result: res,
        text: `For numbers **${a}** and **${b}**: **GCD = ${res.data.gcd}**, **LCM = ${res.data.lcm}**.`
      }
    }
    return {
      tool: 'calculateGcdLcm',
      slug: 'gcd-lcm-calculator-tool',
      text: 'Please provide at least two positive integers to calculate GCD and LCM.'
    }
  }

  // 7. Standard Deviation & Variance
  if (/standard\s*deviation|std\s*dev|variance|meyari.*inhiraf/i.test(p)) {
    const numbersMatch = p.match(/-?\d+(?:\.\d+)?/g)
    if (numbersMatch && numbersMatch.length >= 2) {
      const numbersStr = numbersMatch.join(', ')
      const res = executeTool('calculateStandardDeviation', { numbers: numbersStr })
      return {
        tool: 'calculateStandardDeviation',
        slug: 'standard-deviation-variance-calculator',
        result: res,
        text: `Statistical analysis for dataset: **Mean = ${res.data.mean.toFixed(2)}**, **Sample SD = ${res.data.stdDevSample.toFixed(2)}**, **Pop SD = ${res.data.stdDevPop.toFixed(2)}**, **Sample Variance = ${res.data.varianceSample.toFixed(2)}**.`
      }
    }
    return {
      tool: 'calculateStandardDeviation',
      slug: 'standard-deviation-variance-calculator',
      text: 'Please provide at least two numbers (comma or space separated) to calculate standard deviation and variance.'
    }
  }

  // 8. Permutations & Combinations
  if (/permutation|combination|npr|ncr|tartib/i.test(p)) {
    const numbers = p.match(/\b\d+\b/g)
    if (numbers && numbers.length >= 2) {
      const n = parseInt(numbers[0], 10)
      const r = parseInt(numbers[1], 10)
      if (n >= r && r >= 0) {
        const res = executeTool('calculatePermutationsCombinations', { n, r })
        return {
          tool: 'calculatePermutationsCombinations',
          slug: 'permutations-combinations-calculator',
          result: res,
          text: `For set of **n = ${n}** items choosing **r = ${r}**: **Permutations P(${n},${r}) = ${res.data.nPrFormatted}**, **Combinations C(${n},${r}) = ${res.data.nCrFormatted}**.`
        }
      }
    }
    return {
      tool: 'calculatePermutationsCombinations',
      slug: 'permutations-combinations-calculator',
      text: 'Please provide total items (n) and chosen items (r) where n ≥ r ≥ 0.'
    }
  }

  // 9. Ideal Body Weight
  if (/ideal.*weight|ibw|wazan.*kitna/i.test(p)) {
    const heightMatch = p.match(/(1\d\d|2[0-5]\d)/)
    const genderMatch = p.match(/\b(male|female|m|f|aurat|mard|larki|larka)\b/i)
    if (heightMatch) {
      const height = parseFloat(heightMatch[1])
      const gender = /f|female|aurat|larki/i.test(genderMatch?.[1] || '') ? 'female' : 'male'
      const res = executeTool('calculateIdealBodyWeight', { heightCm: height, gender })
      return {
        tool: 'calculateIdealBodyWeight',
        slug: 'ideal-body-weight-calculator',
        result: res,
        link: `/tools/ideal-body-weight-calculator?height=${height}&gender=${gender}`,
        text: `For a **${gender}** of height **${height} cm**, your clinical ideal body weight is **${res.data.devineKgFormatted} kg** (${res.data.ibwLbsFormatted} lbs) according to the Devine Formula.`
      }
    }
    return {
      tool: 'calculateIdealBodyWeight',
      slug: 'ideal-body-weight-calculator',
      text: 'Please specify your height in cm (e.g. 175cm) and biological sex (male/female) to calculate your ideal body weight.'
    }
  }

  // 10. BMI Calculator
  if (/\b(bmi|body.*mass.*index)\b/i.test(p)) {
    const numbers = p.match(/\d+(?:\.\d+)?/g)
    if (numbers && numbers.length >= 2) {
      let weight = parseFloat(numbers[0])
      let height = parseFloat(numbers[1])
      if (weight > 100 && height < 100) {
        const temp = weight
        weight = height
        height = temp
      }
      const res = executeTool('calculateBmi', { weight, height, unit: 'metric' })
      return {
        tool: 'calculateBmi',
        slug: 'bmi-health-calculator',
        result: res,
        link: `/tools/bmi-health-calculator?weight=${weight}&height=${height}`,
        text: `With weight **${weight} kg** and height **${height} cm**, your **BMI is ${res.data.bmiFormatted}** (${res.data.category}). Healthy weight range for this height is **${res.data.healthyWeightMinKg} - ${res.data.healthyWeightMaxKg} kg**.`
      }
    }
    return {
      tool: 'calculateBmi',
      slug: 'bmi-health-calculator',
      text: 'Please provide your weight in kg and height in cm (e.g. "BMI calculate karo 70kg 175cm").'
    }
  }

  // 11. BMR & TDEE
  if (/\b(bmr|tdee|calories.*burn|maintenance.*calories)\b/i.test(p)) {
    const numbers = p.match(/\d+(?:\.\d+)?/g)
    if (numbers && numbers.length >= 3) {
      const weight = parseFloat(numbers[0])
      const height = parseFloat(numbers[1])
      const age = parseInt(numbers[2], 10)
      const genderMatch = p.match(/\b(male|female|aurat|mard)\b/i)
      const gender = /female|aurat/i.test(genderMatch?.[1] || '') ? 'female' : 'male'
      const res = executeTool('calculateBmrTdee', { weightKg: weight, heightCm: height, age, gender })
      return {
        tool: 'calculateBmrTdee',
        slug: 'bmr-tdee-calculator',
        result: res,
        link: `/tools/bmr-tdee-calculator?weight=${weight}&height=${height}&age=${age}&gender=${gender}`,
        text: `At ${age} years old (${gender}, ${weight}kg, ${height}cm): **BMR = ${res.data.bmr} kcal/day**, **Daily Maintenance (TDEE) = ${res.data.tdee} kcal/day**, and **Weight Loss Goal = ${res.data.weightLossCalories} kcal/day**.`
      }
    }
    return {
      tool: 'calculateBmrTdee',
      slug: 'bmr-tdee-calculator',
      text: 'Please provide weight (kg), height (cm), age, and gender to calculate your BMR and TDEE calorie requirements.'
    }
  }

  // 12. Calorie Deficit Planner
  if (/calorie.*deficit|weight.*loss.*plan|wazan.*kam.*karna/i.test(p)) {
    const numbers = p.match(/\b\d+(?:\.\d+)?\b/g)
    if (numbers && numbers.length >= 4) {
      const cw = parseFloat(numbers[0])
      const tw = parseFloat(numbers[1])
      const tdee = parseFloat(numbers[2])
      const weeks = parseFloat(numbers[3])
      const res = executeTool('calculateCalorieDeficit', { currentWeight: cw, targetWeight: tw, maintenanceTdee: tdee, timelineWeeks: weeks })
      return {
        tool: 'calculateCalorieDeficit',
        slug: 'calorie-deficit-weight-loss-planner',
        result: res,
        link: `/tools/calorie-deficit-weight-loss-planner?current=${cw}&target=${tw}&tdee=${tdee}&weeks=${weeks}`,
        text: `To drop from **${cw} lbs** to **${tw} lbs** in **${weeks} weeks**: Eat **${res.data.targetDailyCalories} kcal/day** (a daily deficit of ${res.data.dailyDeficit} kcal for ${res.data.lossRatePerWeekLbs} lbs/week loss).`
      }
    }
    return {
      tool: 'calculateCalorieDeficit',
      slug: 'calorie-deficit-weight-loss-planner',
      text: 'Please provide your current weight, target goal weight, daily maintenance calories (TDEE), and timeline in weeks.'
    }
  }

  // 13. JSON Formatter & Validator
  if (/(?:json.*(?:format|pretty|beautify|minify|validate|check))|(?:format|pretty|minify|validate).*(?:json)/i.test(p)) {
    const jsonMatch = p.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    const isMinify = /minify|compact/i.test(p)
    const isValidateOnly = /validate|check\s*syntax/i.test(p)

    if (jsonMatch) {
      const rawJson = jsonMatch[0]
      if (isValidateOnly) {
        const valRes = executeTool('validateJson', { input: rawJson })
        return {
          tool: 'validateJson',
          slug: 'json-validator',
          result: valRes,
          link: `/tools/json-validator?text=${encodeURIComponent(rawJson)}`,
          text: valRes.data.valid ? `✅ **${valRes.data.summary}**` : `❌ **Syntax Error:** ${valRes.data.error} (${valRes.data.positionDescription || ''})`
        }
      }

      const fmtRes = executeTool('formatJson', { input: rawJson, minify: isMinify })
      if (fmtRes.success) {
        return {
          tool: 'formatJson',
          slug: 'json-formatter',
          result: fmtRes,
          link: `/tools/json-formatter?src=${encodeURIComponent(rawJson)}`,
          text: `Here is your ${isMinify ? 'minified' : 'formatted'} JSON:\n\`\`\`json\n${fmtRes.data.formatted}\n\`\`\``
        }
      } else {
        return {
          tool: 'formatJson',
          slug: 'json-formatter',
          result: fmtRes,
          link: `/tools/json-formatter?src=${encodeURIComponent(rawJson)}`,
          text: `Invalid JSON syntax: ${fmtRes.error}.`
        }
      }
    }

    return {
      tool: 'formatJson',
      slug: 'json-formatter',
      link: '/tools/json-formatter',
      text: 'Please provide the JSON string you want to format, validate, or minify.'
    }
  }

  // 14. Base64 Converter
  if (/base64\s*(?:encode|decode|converter)?/i.test(p)) {
    const isDecode = /\bdecode\b/i.test(p)
    const textMatch = p.match(/(?:encode|decode|base64)[:\s]+["']?([^"'\n]+)["']?$/i) || p.match(/["']([^"']+)["']/)
    if (textMatch) {
      const text = textMatch[1].trim()
      const mode = isDecode ? 'decode' : 'encode'
      const res = executeTool('convertBase64', { text, mode })
      if (res.success) {
        return {
          tool: 'convertBase64',
          slug: 'base64-encoder-decoder',
          result: res,
          link: `/tools/base64-encoder-decoder?src=${encodeURIComponent(text)}&mode=${mode}`,
          text: mode === 'encode'
            ? `Base64 Encoded Output:\n\`${res.data.output}\``
            : `Base64 Decoded UTF-8 Output:\n\`${res.data.output}\``
        }
      }
    }
    return {
      tool: 'convertBase64',
      slug: 'base64-encoder-decoder',
      link: '/tools/base64-encoder-decoder',
      text: 'Please provide the text or Base64 string you want to encode or decode (e.g., `base64 encode: Hello World`).'
    }
  }

  // 15. URL Encoder/Decoder
  if (/(?:url|percent)\s*(?:encode|decode)/i.test(p)) {
    const isDecode = /\bdecode\b/i.test(p)
    const textMatch = p.match(/(?:encode|decode)[:\s]+["']?([^"'\n]+)["']?$/i) || p.match(/["']([^"']+)["']/)
    if (textMatch) {
      const text = textMatch[1].trim()
      const action = isDecode ? 'decode' : 'encodeText'
      const res = executeTool('encodeDecodeUrl', { text, action })
      if (res.success) {
        return {
          tool: 'encodeDecodeUrl',
          slug: 'url-encoder-decoder',
          result: res,
          link: `/tools/url-encoder-decoder?text=${encodeURIComponent(text)}`,
          text: `URL ${isDecode ? 'Decoded' : 'Encoded'} Result:\n\`${res.data.output}\``
        }
      }
    }
    return {
      tool: 'encodeDecodeUrl',
      slug: 'url-encoder-decoder',
      link: '/tools/url-encoder-decoder',
      text: 'Please specify the text or URL to encode or decode (e.g., `url encode: hello world?test=1`).'
    }
  }

  // 16. Cryptographic Hash Generator
  if (/\b(sha[-_]?(?:1|256|384|512)|hash\s*(?:generator|of|for)?)\b/i.test(p)) {
    const algMatch = p.match(/\b(sha[-_]?(?:1|256|384|512))\b/i)
    const algorithm = algMatch ? normalizeAlgorithm(algMatch[1]) : 'SHA-256'
    const textMatch = p.match(/(?:of|for|hash)[:\s]+["']?([^"'\n]+)["']?$/i) || p.match(/["']([^"']+)["']/)
    if (textMatch) {
      const text = textMatch[1].trim()
      const resPromise = executeTool('generateCryptoHash', { text, algorithm })
      return {
        tool: 'generateCryptoHash',
        slug: 'hash-generator',
        result: resPromise,
        link: `/tools/hash-generator?txt=${encodeURIComponent(text)}&alg=${algorithm}`,
        text: `Generating **${algorithm}** hash for "${text}"... You can also view it in the Hash Generator tool.`
      }
    }
    return {
      tool: 'generateCryptoHash',
      slug: 'hash-generator',
      link: '/tools/hash-generator',
      text: 'Please provide the text and optional algorithm (e.g., `sha256 of hello`).'
    }
  }

  // 17. Word Counter & Text Statistics
  if (/\b(word\s*count|character\s*count|text\s*stats|reading\s*time|lafz\s*count)\b/i.test(p)) {
    const textMatch = p.match(/(?:count|for|text|stats)[:\s]+["']?([^"'\n]+)["']?$/i) || p.match(/["']([^"']+)["']/)
    if (textMatch) {
      const text = textMatch[1].trim()
      const res = executeTool('calculateTextStats', { text })
      return {
        tool: 'calculateTextStats',
        slug: 'word-counter-text-stats',
        result: res,
        link: `/tools/word-counter-text-stats?text=${encodeURIComponent(text)}`,
        text: `**Text Statistics:**\n- Words: **${res.data.words}**\n- Characters: **${res.data.chars}** (${res.data.charsNoSpace} without spaces)\n- Reading time: **${res.data.readingTimeFormatted}** · Speaking time: **${res.data.speakingTimeFormatted}**`
      }
    }
    return {
      tool: 'calculateTextStats',
      slug: 'word-counter-text-stats',
      link: '/tools/word-counter-text-stats',
      text: 'Please provide the text you would like to count and analyze.'
    }
  }

  // 18. Text Case Converter
  if (/(?:convert.*case|uppercase|lowercase|camelcase|snake_case|kebab-case|title\s*case|sentence\s*case)/i.test(p)) {
    const modeMatch = p.match(/\b(upper|lower|title|sentence|camel|pascal|snake|kebab)(?:case)?\b/i)
    const mode = modeMatch ? modeMatch[1].toLowerCase() : 'upper'
    const textMatch = p.match(/(?:to\s+\w+\s*:?|case\s*:?|text\s*:?)\s*["']?([^"'\n]+)["']?$/i) || p.match(/["']([^"']+)["']/)
    if (textMatch) {
      const text = textMatch[1].trim()
      const res = executeTool('convertTextCase', { text, mode })
      return {
        tool: 'convertTextCase',
        slug: 'text-case-converter-tool',
        result: res,
        link: `/tools/text-case-converter-tool?text=${encodeURIComponent(text)}&mode=${mode}`,
        text: `**${res.data.mode.toUpperCase()} Case:**\n\`${res.data.val}\``
      }
    }
    return {
      tool: 'convertTextCase',
      slug: 'text-case-converter-tool',
      link: '/tools/text-case-converter-tool',
      text: 'Please provide the text and target case format (e.g., `convert to camelcase: hello world`).'
    }
  }

  // 19. Word Frequency & Density Analyzer
  if (/(?:word\s*frequency|keyword\s*density|density\s*analyzer)/i.test(p)) {
    const textMatch = p.match(/(?:for|analyze|text)[:\s]+["']?([^"'\n]+)["']?$/i) || p.match(/["']([^"']+)["']/)
    if (textMatch) {
      const text = textMatch[1].trim()
      const res = executeTool('analyzeWordFrequency', { text })
      return {
        tool: 'analyzeWordFrequency',
        slug: 'word-frequency-density-analyzer',
        result: res,
        link: `/tools/word-frequency-density-analyzer?text=${encodeURIComponent(text)}`,
        text: `**Keyword Density Analysis:**\n${res.data.val}`
      }
    }
    return {
      tool: 'analyzeWordFrequency',
      slug: 'word-frequency-density-analyzer',
      link: '/tools/word-frequency-density-analyzer',
      text: 'Please paste the text content you want to analyze for word frequency and keyword density.'
    }
  }

  // 20. Duplicate Line Deduplicator
  if (/(?:duplicate\s*line|deduplicate|remove\s*duplicates)/i.test(p)) {
    const isSortAsc = /\b(sort|alphabetical|a to z)\b/i.test(p)
    const isSortDesc = /\b(z to a|reverse)\b/i.test(p)
    const sortMode = isSortDesc ? 'desc' : (isSortAsc ? 'asc' : 'none')
    const textMatch = p.match(/(?:remove\s*duplicates\s*(?:from)?|deduplicate\s*(?:lines)?|from)[:\s]+([\s\S]+)$/i) || p.match(/["']([^"']+)["']/)
    if (textMatch) {
      const text = textMatch[1].trim()
      const res = executeTool('deduplicateLines', { text, sortMode })
      return {
        tool: 'deduplicateLines',
        slug: 'duplicate-line-deduplicator',
        result: res,
        link: `/tools/duplicate-line-deduplicator?text=${encodeURIComponent(text)}&sort=${sortMode}`,
        text: `**Deduplication Result:**\n${res.data.val}`
      }
    }
    return {
      tool: 'deduplicateLines',
      slug: 'duplicate-line-deduplicator',
      link: '/tools/duplicate-line-deduplicator',
      text: 'Please provide the multiline list from which you want to remove duplicate entries.'
    }
  }

  // 21. Temperature Converter (Celsius, Fahrenheit, Kelvin)
  if (/(?:convert\s+)?(-?\d+(?:\.\d+)?)\s*(?:°|deg|degrees)?\s*([cfk]|celsius|centigrade|fahrenheit|kelvin)\b/i.test(p) || /(?:celsius|fahrenheit|kelvin|temperature\s*converter)/i.test(p)) {
    const tempMatch = p.match(/(-?\d+(?:\.\d+)?)\s*(?:°|deg|degrees)?\s*([cfk]|celsius|centigrade|fahrenheit|kelvin)\b/i)
    if (tempMatch) {
      const val = parseFloat(tempMatch[1])
      const fromUnit = tempMatch[2].toLowerCase()
      const res = executeTool('convertTemperature', { value: val, fromUnit })
      if (res.success) {
        return {
          tool: 'convertTemperature',
          slug: 'celsius-fahrenheit-kelvin-converter',
          result: res,
          link: `/tools/celsius-fahrenheit-kelvin-converter?val=${val}&from=${res.data.fromUnit}`,
          text: `**Temperature Conversion:**\n• Celsius: **${res.data.celsius} °C**\n• Fahrenheit: **${res.data.fahrenheit} °F**\n• Kelvin: **${res.data.kelvin} K**`
        }
      }
    }
    return {
      tool: 'convertTemperature',
      slug: 'celsius-fahrenheit-kelvin-converter',
      link: '/tools/celsius-fahrenheit-kelvin-converter',
      text: 'Please specify the temperature and unit to convert (e.g., `convert 100 C to Fahrenheit` or `98.6 F to Celsius`).'
    }
  }

  // 22. CSS Px to Rem & Em Converter
  if (/(?:convert\s+)?(\d+(?:\.\d+)?)\s*(?:px|pixels?)\b/i.test(p) || /(?:px\s*to\s*rem|rem\s*to\s*px|px\s*rem\s*em|css\s*unit)/i.test(p)) {
    const pxMatch = p.match(/(\d+(?:\.\d+)?)\s*(?:px|pixels?)\b/i)
    const baseMatch = p.match(/(?:base|root)[:\s]+(\d+(?:\.\d+)?)/i)
    if (pxMatch) {
      const px = parseFloat(pxMatch[1])
      const basePx = baseMatch ? parseFloat(baseMatch[1]) : 16
      const res = executeTool('convertPxToUnits', { px, basePx })
      if (res.success) {
        return {
          tool: 'convertPxToUnits',
          slug: 'px-rem-em-converter',
          result: res,
          link: `/tools/px-rem-em-converter?px=${px}&base=${basePx}&target=${px}`,
          text: `**CSS Unit Conversion:**\n• **${res.data.formattedRem}** (${res.data.px}px at base ${res.data.basePx}px)\n• EM: **${res.data.formattedEm}** | PT: **${res.data.formattedPt}**\n\`\`\`css\n${res.data.cssSnippet}\n\`\`\``
        }
      }
    }
    return {
      tool: 'convertPxToUnits',
      slug: 'px-rem-em-converter',
      link: '/tools/px-rem-em-converter',
      text: 'Please specify the pixel value to convert (e.g., `convert 24px to rem` or `16px to rem with base 10`).'
    }
  }

  // 23. Universal Unit Converter (Length, Mass, Speed, Area, Volume)
  const unitMatch = p.match(/(?:convert\s+)?(\d+(?:\.\d+)?)\s*([a-zA-Z²³\/]+)\s*(?:to|in|into|me)\s*([a-zA-Z²³\/]+)/i)
  if (unitMatch) {
    const val = parseFloat(unitMatch[1])
    const fromUnit = unitMatch[2]
    const toUnit = unitMatch[3]
    const res = executeTool('convertUnit', { value: val, fromUnit, toUnit })
    if (res.success) {
      return {
        tool: 'convertUnit',
        slug: 'universal-unit-converter',
        result: res,
        link: `/tools/universal-unit-converter?cat=${res.data.category}&from=${res.data.fromUnit}&to=${res.data.toUnit}&val=${val}`,
        text: `**Unit Conversion:**\n**${val} ${res.data.fromUnitName}** = **${res.data.resultFormatted} ${res.data.toUnitName}**\n*Formula: ${res.data.formula}*`
      }
    }
  }
  if (/(?:unit\s*converter|convert\s*units|measurement\s*converter)/i.test(p)) {
    return {
      tool: 'convertUnit',
      slug: 'universal-unit-converter',
      link: '/tools/universal-unit-converter',
      text: 'Please specify the value and units to convert (e.g., `convert 10 km to miles`, `50 kg to lbs`, `100 kmh to mph`, `5 acres to sqft`).'
    }
  }

  // 24. 2D & 3D Geometry Calculator
  if (/\b(circle|rectangle|triangle|sphere|cylinder|prism|geometry\s*calculator)\b/i.test(p)) {
    const shapeMatch = p.match(/\b(circle|rectangle|triangle|sphere|cylinder|prism)\b/i)
    const shape = shapeMatch ? shapeMatch[1].toLowerCase() : 'circle'

    const rMatch = p.match(/(?:radius|r)[:\s=]+(\d+(?:\.\d+)?)/i)
    const lMatch = p.match(/(?:length|l)[:\s=]+(\d+(?:\.\d+)?)/i)
    const wMatch = p.match(/(?:width|w)[:\s=]+(\d+(?:\.\d+)?)/i)
    const hMatch = p.match(/(?:height|h)[:\s=]+(\d+(?:\.\d+)?)/i)
    const bMatch = p.match(/(?:base|b)[:\s=]+(\d+(?:\.\d+)?)/i)

    const numMatches = p.match(/\b\d+(?:\.\d+)?\b/g)

    let valA = rMatch ? parseFloat(rMatch[1]) : (lMatch ? parseFloat(lMatch[1]) : (bMatch ? parseFloat(bMatch[1]) : (numMatches ? parseFloat(numMatches[0]) : null)))
    let valB = wMatch ? parseFloat(wMatch[1]) : (hMatch ? parseFloat(hMatch[1]) : (numMatches && numMatches[1] ? parseFloat(numMatches[1]) : null))
    let valC = hMatch && shape === 'prism' ? parseFloat(hMatch[1]) : (numMatches && numMatches[2] ? parseFloat(numMatches[2]) : null)

    if (valA !== null) {
      const res = executeTool('calculateGeometry', {
        shape,
        a: valA,
        b: valB || (shape === 'rectangle' || shape === 'cylinder' || shape === 'triangle' ? 5 : 0),
        c: valC || (shape === 'prism' ? 8 : 0)
      })
      if (res.success) {
        return {
          tool: 'calculateGeometry',
          slug: 'geometry-calculator',
          result: res,
          link: `/tools/geometry-calculator?shape=${shape}&a=${valA}&b=${valB || 5}&c=${valC || 8}`,
          text: `**${shape.toUpperCase()} Geometric Calculation:**\n${res.data.is3D ? `• Volume: **${res.data.volume} unit³**\n• Surface Area: **${res.data.surfaceArea} unit²**` : `• Area: **${res.data.area} unit²**\n• Perimeter: **${res.data.perimeter} units**`}\n*Formula: ${res.data.formula}*`
        }
      }
    }

    return {
      tool: 'calculateGeometry',
      slug: 'geometry-calculator',
      link: '/tools/geometry-calculator',
      text: `Please provide the dimensions for your ${shape} (e.g., \`${shape} radius 10\` or \`cylinder radius 5 height 10\`).`
    }
  }

  // 25. Age & Date of Birth Calculator
  if (/(?:\bage\b|\bumar\b|date\s*of\s*birth|\bdob\b|\bbirthday\b)/i.test(p)) {
    const dateMatch = p.match(/\b(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/)
    if (dateMatch) {
      const birthDate = dateMatch[1]
      const res = executeTool('calculateAge', { birthDate })
      if (res.success) {
        return {
          tool: 'calculateAge',
          slug: 'age-calculator',
          result: res,
          link: `/tools/age-calculator?dob=${encodeURIComponent(birthDate)}`,
          text: `**Age Calculation:**\n• **${res.data.years} Years, ${res.data.months} Months, ${res.data.days} Days old**\n• Total Days: **${res.data.totalDays.toLocaleString()} days**\n• Next Birthday: **${res.data.nextBirthday.date}** (${res.data.nextBirthday.daysUntil} days left, ${res.data.nextBirthday.dayOfWeek})\n• Zodiac: **${res.data.zodiac}**`
        }
      }
    }
    return {
      tool: 'calculateAge',
      slug: 'age-calculator',
      link: '/tools/age-calculator',
      text: 'Please provide your date of birth in YYYY-MM-DD format (e.g., `calculate age for 1995-04-10` or `meri umar 2000-01-15`).'
    }
  }

  // 26. Time Zone Converter
  const tzMatch = p.match(/(\d{1,2}:\d{2})\s*([a-zA-Z]+)\s*(?:to|in|into)\s*([a-zA-Z/_]+)/i)
  if (tzMatch) {
    const time = tzMatch[1]
    const fromZone = tzMatch[2]
    const toZone = tzMatch[3]
    const res = executeTool('convertTimeZone', { time, fromZone, toZone })
    if (res.success) {
      return {
        tool: 'convertTimeZone',
        slug: 'time-zone-converter',
        result: res,
        link: `/tools/time-zone-converter?time=${time}&from=${encodeURIComponent(fromZone)}&to=${encodeURIComponent(toZone)}`,
        text: `**Time Zone Conversion:**\n• **${res.data.inputTime} ${fromZone.toUpperCase()}** = **${res.data.convertedTime} ${toZone.toUpperCase()}** (${res.data.dayDiffLabel})\n• Local Date: ${res.data.convertedDate}`
      }
    }
  }
  if (/(?:time\s*zone|timezone|convert\s*time|what\s*time\s*is\s*it\s*in)/i.test(p)) {
    return {
      tool: 'convertTimeZone',
      slug: 'time-zone-converter',
      link: '/tools/time-zone-converter',
      text: 'Please specify the time and timezones to convert (e.g., `convert 14:00 UTC to PKT` or `09:00 EST to GMT`).'
    }
  }

  // 27. Cryptographic Password Generator
  if (/(?:generate\s*password|create\s*password|password\s*generator|strong\s*password|nayi\s*password)/i.test(p)) {
    const lenMatch = p.match(/\b(\d{1,3})\s*(?:char|characters|chars|length)/i) || p.match(/\b(?:length|of)\s*(\d{1,3})\b/i)
    const length = lenMatch ? parseInt(lenMatch[1], 10) : 16
    const validLength = Math.min(Math.max(length, 8), 128)
    const res = executeTool('generatePassword', { length: validLength })
    if (res.success) {
      return {
        tool: 'generatePassword',
        slug: 'password-generator',
        result: res,
        link: `/tools/password-generator?len=${validLength}`,
        text: `**Generated Secure Password (${validLength} chars):**\n\`${res.data.password}\`\n\n• Entropy: **${res.data.entropy} bits** (${res.data.strength})\n• Estimated crack time: ${res.data.crackTime}`
      }
    }
    return {
      tool: 'generatePassword',
      slug: 'password-generator',
      link: '/tools/password-generator',
      text: 'Click below to open the secure local Password Generator.'
    }
  }

  // 28. IPv4 CIDR Subnet Calculator
  const cidrMatch = p.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:\/(\d{1,2}))?\b/)
  if (cidrMatch && (/(?:subnet|cidr|netmask|\bmask\b|\bip\b)/i.test(p) || cidrMatch[2])) {
    const ip = cidrMatch[1]
    const cidr = cidrMatch[2] ? parseInt(cidrMatch[2], 10) : 24
    const res = executeTool('calculateSubnet', { ip, cidr })
    if (res.success) {
      return {
        tool: 'calculateSubnet',
        slug: 'subnet-calculator',
        result: res,
        link: `/tools/subnet-calculator?ip=${ip}&cidr=${cidr}`,
        text: `**IPv4 Subnet Calculation:**\n• Network: **${res.data.networkAddress}/${res.data.cidr}**\n• Subnet Mask: **${res.data.netmask}**\n• Usable Host Range: **${res.data.firstUsableIp} – ${res.data.lastUsableIp}**\n• Total Usable Hosts: **${res.data.usableHosts.toLocaleString()}** (Class ${res.data.ipClass})`
      }
    }
  }
  if (/(?:subnet\s*calculator|calculate\s*subnet|cidr\s*calculator)/i.test(p)) {
    return {
      tool: 'calculateSubnet',
      slug: 'subnet-calculator',
      link: '/tools/subnet-calculator',
      text: 'Please provide an IP and CIDR prefix (e.g., `calculate subnet for 192.168.1.0/24` or `10.0.0.1/16`).'
    }
  }

  // 29. CSV Column Statistics & Data Profiler
  if (/(?:csv\s*column\s*stats|csv\s*stats|csv\s*profil|profile\s*csv|analyze\s*csv)/i.test(p) || (p.toLowerCase().includes('csv:') && p.includes(','))) {
    const csvMatch = p.match(/csv:\s*([\s\S]+)/i)
    if (csvMatch) {
      const csvText = csvMatch[1].trim()
      const res = executeTool('computeCsvStats', { csvText })
      if (res.success) {
        const colList = res.data.columns.map(c => `• **${c.column}** (${c.type}): ${c.type === 'numeric' ? `Mean ${c.mean}, Min ${c.min}, Max ${c.max}` : `${c.distinctCount} unique values`}`).join('\n')
        return {
          tool: 'computeCsvStats',
          slug: 'csv-column-stats',
          result: res,
          link: `/tools/csv-column-stats?text=${encodeURIComponent(csvText)}`,
          text: `**CSV Data Profile (${res.data.rowCount} rows, ${res.data.columnCount} columns):**\n${colList}`
        }
      }
    }
    return {
      tool: 'computeCsvStats',
      slug: 'csv-column-stats',
      link: '/tools/csv-column-stats',
      text: 'Please paste your CSV data (e.g., `analyze csv: name,age\nAlice,30\nBob,25`) or open the CSV Column Statistics tool below.'
    }
  }

  // 30. PDF Bates Numbering & Exhibit Stamper
  if (/(?:bates\s*number|bates\s*stamp|bates\s*sequence|exhibit\s*stamp|bates)/i.test(p)) {
    const prefixMatch = p.match(/(?:prefix|tag)[:\s]+([a-zA-Z0-9_-]+)/i)
    const pagesMatch = p.match(/(?:pages|count|total)[:\s]+(\d+)/i) || p.match(/(\d+)\s*pages/i)
    const startMatch = p.match(/(?:start|from)[:\s]+(\d+)/i)

    const prefix = prefixMatch ? prefixMatch[1] : 'CONF-EXHIBIT'
    const totalPages = pagesMatch ? parseInt(pagesMatch[1], 10) : 10
    const startNum = startMatch ? parseInt(startMatch[1], 10) : 1

    const res = executeTool('generateBatesSequence', { prefix, totalPages, startNum })
    if (res.success) {
      return {
        tool: 'generateBatesSequence',
        slug: 'pdf-bates-stamper',
        result: res,
        link: `/tools/pdf-bates-stamper?prefix=${encodeURIComponent(prefix)}&totalPages=${totalPages}&startNum=${startNum}`,
        text: `**Bates Series Generated:**\n• Range: **${res.data.sampleRange}**\n• Total Exhibits: **${res.data.totalPages}**\n• Format: \`${res.data.firstStamp}\` through \`${res.data.lastStamp}\``
      }
    }
    return {
      tool: 'generateBatesSequence',
      slug: 'pdf-bates-stamper',
      link: '/tools/pdf-bates-stamper',
      text: 'Configure your Bates sequence (e.g., `generate bates for 20 pages with prefix PLAINTIFF`).'
    }
  }

  // 31. Universal Currency Converter (Forex)
  const currencyMatch = p.match(/(?:convert\s+)?(\d+(?:\.\d+)?)\s*([a-zA-Z]{3})\s*(?:to|in|into|me)\s*([a-zA-Z]{3})\b/i)
  if (currencyMatch && (BASELINE_FOREX_RATES[currencyMatch[2].toUpperCase()] || BASELINE_FOREX_RATES[currencyMatch[3].toUpperCase()])) {
    const amt = parseFloat(currencyMatch[1])
    const from = currencyMatch[2].toUpperCase()
    const to = currencyMatch[3].toUpperCase()
    const res = executeTool('convertCurrency', { amount: amt, from, to })
    if (res.success) {
      return {
        tool: 'convertCurrency',
        slug: 'currency-converter',
        result: res,
        link: `/tools/currency-converter?amount=${amt}&from=${from}&to=${to}`,
        text: `**Currency Exchange:**\n**${amt} ${res.data.fromName}** = **${res.data.resultFormatted} ${res.data.to}**\n• Exchange Rate: 1 ${from} = **${res.data.exchangeRate} ${to}**\n• Reciprocal: 1 ${to} = **${res.data.inverseRate} ${from}**`
      }
    }
  }
  if (/(?:currency\s*converter|convert\s*currency|exchange\s*rate|forex\s*rate|dollar\s*rate)/i.test(p)) {
    return {
      tool: 'convertCurrency',
      slug: 'currency-converter',
      link: '/tools/currency-converter',
      text: 'Please specify the amount and currencies (e.g., `convert 100 USD to PKR` or `50 EUR to GBP`).'
    }
  }

  // 32. Crypto Profit & Loss Calculator
  if (/(?:crypto\s*pnl|crypto\s*profit|crypto\s*loss|bitcoin\s*profit|crypto\s*roi)/i.test(p) || (/(?:crypto|coin|btc|eth)/i.test(p) && /(?:buy|bought)/i.test(p) && /(?:sell|sold)/i.test(p))) {
    const buyMatch = p.match(/(?:buy|bought|entry)[:\s]+(\d+(?:\.\d+)?)/i)
    const sellMatch = p.match(/(?:sell|sold|exit)[:\s]+(\d+(?:\.\d+)?)/i)
    const qtyMatch = p.match(/(?:amount|qty|quantity|units)[:\s]+(\d+(?:\.\d+)?)/i) || p.match(/(\d+(?:\.\d+)?)\s*(?:coins?|btc|eth|sol)\b/i)

    const numMatches = p.match(/\b\d+(?:\.\d+)?\b/g)
    const buyPrice = buyMatch ? parseFloat(buyMatch[1]) : (numMatches ? parseFloat(numMatches[0]) : null)
    const sellPrice = sellMatch ? parseFloat(sellMatch[1]) : (numMatches && numMatches[1] ? parseFloat(numMatches[1]) : null)
    const amount = qtyMatch ? parseFloat(qtyMatch[1]) : (numMatches && numMatches[2] ? parseFloat(numMatches[2]) : 1)

    if (buyPrice !== null && sellPrice !== null) {
      const res = executeTool('calculateCryptoPnl', { buyPrice, sellPrice, amount })
      if (res.success) {
        return {
          tool: 'calculateCryptoPnl',
          slug: 'crypto-pnl-calculator',
          result: res,
          link: `/tools/crypto-pnl-calculator?buy=${buyPrice}&sell=${sellPrice}&amount=${amount}`,
          text: `**Crypto P&L Result:**\n• **${res.data.statusText}**\n• Total Invested: **$${res.data.totalCost.toLocaleString()}** | Net Proceeds: **$${res.data.netProceeds.toLocaleString()}**\n• Total Fees: **$${res.data.totalFees}** | Break-Even: **$${res.data.breakEvenPrice.toLocaleString()}**`
        }
      }
    }
    return {
      tool: 'calculateCryptoPnl',
      slug: 'crypto-pnl-calculator',
      link: '/tools/crypto-pnl-calculator',
      text: 'Please provide buy price, sell price, and quantity (e.g., `crypto buy 50000 sell 65000 amount 1` or `bought btc at 30000 sold at 35000`).'
    }
  }

  // 33. Pakistan Income Tax & Salary Deductions
  if ((/\btax\b/i.test(p) && /(?:salary|income|tankhwah|kamai|earnings|fbr|bracket|deduction|slab)/i.test(p)) || /(?:salary\s*tax|income\s*tax|fbr\s*tax|tax\s*bracket|tax\s*deduction|kitna\s*tax)/i.test(p)) {
    const numMatch = p.match(/\b\d+(?:\.\d+)?\b/)
    if (numMatch) {
      let val = parseFloat(numMatch[0])
      if (/(?:k\b|thousand)/i.test(p)) val *= 1000
      else if (/(?:lakh|lac)\b/i.test(p)) val *= 100000
      else if (/(?:million|m\b)/i.test(p)) val *= 1000000

      const isAnnual = /(?:annual|per\s*year|salana|yearly)/i.test(p)
      const args = isAnnual ? { annualIncome: val } : { monthlySalary: val }
      const res = executeTool('calculatePakistanTax', args)
      if (res.success) {
        return {
          tool: 'calculatePakistanTax',
          slug: 'tax-bracket-calc',
          result: res,
          link: `/tools/tax-bracket-calc?salary=${val}&type=${isAnnual ? 'annual' : 'monthly'}`,
          text: `**Pakistan Income Tax Calculation:**\n• Monthly Tax: **Rs. ${res.data.monthlyTax.toLocaleString()}**\n• Net Monthly Take-Home: **Rs. ${res.data.monthlyTakeHome.toLocaleString()}**\n• Annual Tax: **Rs. ${res.data.annualTax.toLocaleString()}** (${res.data.effectiveTaxRate}% effective rate)\n• *${res.data.taxSlab}*`
        }
      }
    }
    return {
      tool: 'calculatePakistanTax',
      slug: 'tax-bracket-calc',
      link: '/tools/tax-bracket-calc',
      text: 'Please specify your monthly salary or annual income (e.g., `tax on 150000 salary` or `annual income 2000000 tax`).'
    }
  }

  // 34. Fallback: Search top matching tool from 1,059 tools index
  const matches = searchTools(p, { limit: 3 })


  if (matches.length > 0) {
    const top = matches[0]
    return {
      tool: null,
      slug: top.slug,
      suggestedTool: top,
      text: `I found the **${top.name}** tool for your request. You can open it directly or provide your numbers here to calculate!`
    }
  }

  return null
}

/**
 * Process a message turn through the AI Assistant.
 * Supports both Live Gemini API and deterministic offline fallback.
 *
 * @param {string} userMessage - User input prompt
 * @param {Object} [options]
 * @param {string} [options.apiKey] - Optional Gemini API key
 * @param {string} [options.model] - Model name (defaults to gemini-3.8-flash)
 * @param {Array} [options.history] - Chat history array
 * @returns {Promise<Object>} Assistant response with deterministic tool grounding
 */
export async function sendMessageToAssistant(userMessage, options = {}) {
  const apiKey =
    options.apiKey ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('vimz_gemini_api_key') : null) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    null

  // If no Gemini API key is provided, execute via Zero-LLM Deterministic Mode ($0 cost)
  if (!apiKey) {
    let localResult = extractAndExecuteLocal(userMessage)
    if (localResult) {
      if (localResult.result && typeof localResult.result.then === 'function') {
        const resolved = await localResult.result
        localResult = {
          ...localResult,
          result: resolved,
          text: resolved.success && resolved.summary ? `**${resolved.summary}**` : localResult.text
        }
      }
      return {
        reply: localResult.text,
        toolCall: localResult.tool,
        toolSlug: localResult.slug,
        link: localResult.link,
        data: localResult.result?.data || null,
        mode: 'zero-llm-deterministic'
      }
    }
    return {
      reply: "I couldn't identify the exact calculation tool for your query. Try asking something like: 'How many years to double my money at 8%?', 'I attended 35 out of 45 classes', or search from 1,000+ tools above!",
      toolCall: null,
      mode: 'zero-llm-fallback'
    }
  }

  // Online Gemini Mode (The Golden Rule via Function Calling)
  const client = new GoogleGenAI({ apiKey })
  const modelName = options.model || 'gemini-3.8-flash'
  const declarations = getGeminiFunctionDeclarations()

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: declarations }]
      }
    })

    const functionCalls = response.functionCalls || []
    if (functionCalls.length > 0) {
      const call = functionCalls[0]
      let toolExecution = executeTool(call.name, call.args)
      if (toolExecution && typeof toolExecution.then === 'function') {
        toolExecution = await toolExecution
      }

      if (toolExecution.success) {
        return {
          reply: `I calculated this using **${call.name}**:\n\n${toolExecution.summary}`,
          toolCall: call.name,
          toolSlug: toolExecution.slug,
          data: toolExecution.data,
          args: call.args,
          mode: 'gemini-function-calling'
        }
      } else {
        return {
          reply: `Execution error in ${call.name}: ${toolExecution.error}. Please check your inputs.`,
          toolCall: call.name,
          error: toolExecution.error,
          mode: 'gemini-function-calling'
        }
      }
    }

    // Direct conversational text response from Gemini
    return {
      reply: response.text || 'Calculation completed.',
      toolCall: null,
      mode: 'gemini-direct'
    }
  } catch (error) {
    // If Gemini API throws (e.g. invalid key or network issue), gracefully fallback to local parser
    const fallback = extractAndExecuteLocal(userMessage)
    if (fallback) {
      return {
        reply: fallback.text,
        toolCall: fallback.tool,
        toolSlug: fallback.slug,
        data: fallback.result?.data || null,
        mode: 'zero-llm-fallback'
      }
    }
    throw error
  }
}
