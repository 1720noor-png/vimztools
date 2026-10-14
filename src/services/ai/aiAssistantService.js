import { GoogleGenAI } from '@google/genai'
import { AI_TOOL_DEFINITIONS, executeTool } from './toolRegistry.js'
import { searchTools } from '../search/searchEngine.js'

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
  if (/salary|hourly|tankhwah|per hour/i.test(p)) {
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

  // 9. Fallback: Search top matching tool from 1,059 tools index
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
    const localResult = extractAndExecuteLocal(userMessage)
    if (localResult) {
      return {
        reply: localResult.text,
        toolCall: localResult.tool,
        toolSlug: localResult.slug,
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
      const toolExecution = executeTool(call.name, call.args)

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
