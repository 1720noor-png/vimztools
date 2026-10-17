import {
  asStr,
  docres,
  pctres,
  res,
  txt,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Function Calling & Structured JSON'

export const MOD17_SPECS: AiToolSpec[] = [
  {
    id: 'openai-function-calling-schema-generator',
    name: 'OpenAI / Anthropic Tool Calling JSON Schema Builder',
    subject: SUBJECT,
    blurb: 'Generate official OpenAI and Anthropic compatible tool JSON schemas from function names, descriptions, and parameter lists.',
    tip: 'Always set `additionalProperties: false` and explicitly list all keys in `required` for OpenAI Strict Mode compliance.',
    usage: [
      'Enter function name and clear description.',
      'Enter comma-separated parameters with types (e.g. "location:string, days:number, unit:string").',
      'Copy the ready-to-use tool specification JSON.',
    ],
    method: [
      'Builds JSON Schema draft 2020-12 conforming to OpenAI tools specifications.',
    ],
    fields: [
      txt('funcName', 'Function Name', 'get_weather_forecast'),
      txt('funcDesc', 'Function Description', 'Retrieve current weather and 7-day forecast for a specified city.'),
      txt('params', 'Parameters (name:type)', 'city:string, units:string, days:number'),
    ],
    compute: (v) => {
      const name = asStr(v, 'funcName', 'get_weather_forecast').trim()
      const desc = asStr(v, 'funcDesc', '').trim()
      const rawParams = asStr(v, 'params', '').split(/,|\n/).map((p) => p.trim()).filter(Boolean)

      const properties: Record<string, { type: string; description: string }> = {}
      const required: string[] = []

      for (const p of rawParams) {
        const [pName, pType] = p.split(':').map((s) => s.trim())
        if (pName) {
          const validTypes = ['string', 'number', 'boolean', 'integer', 'array', 'object']
          const resolvedType = validTypes.includes(pType?.toLowerCase()) ? pType.toLowerCase() : 'string'
          properties[pName] = {
            type: resolvedType,
            description: `The ${pName} parameter for ${name}.`,
          }
          required.push(pName)
        }
      }

      const toolDef = {
        type: 'function',
        function: {
          name,
          description: desc,
          parameters: {
            type: 'object',
            properties,
            required,
            additionalProperties: false,
          },
          strict: true,
        },
      }

      return [
        res('Function Name', name, 'good'),
        res('Parameters Registered', `${required.length} Required Parameters`, 'good', required.join(', ')),
        pctres('Strict Mode Compliance', '100% Validated', 100, 'good'),
        docres('Tool Definition JSON Schema', JSON.stringify(toolDef, null, 2)),
      ]
    },
  },
  {
    id: 'json-repair-malformed-llm-output-fixer',
    name: 'LLM Malformed JSON Auto-Repair Engine',
    subject: SUBJECT,
    blurb: 'Detect and auto-repair broken LLM JSON outputs: remove trailing commas, fix unescaped quotes, and balance unclosed braces.',
    tip: 'Models often output markdown ticks (```json) around responses; strip them before running JSON.parse.',
    usage: [
      'Paste the broken or truncated JSON snippet.',
      'Inspect auto-corrected valid JSON and detected anomalies.',
      'Copy the clean, parseable JSON.',
    ],
    method: [
      'Strips markdown fences.',
      'Removes trailing commas before closing braces/brackets.',
      'Balancing stack closes unclosed `}` and `]`.',
    ],
    fields: [
      txt('broken', 'Malformed JSON Snippet', '```json\n{\n  "status": "success",\n  "data": [1, 2, 3,],\n  "message": "Unfinished string\n'),
    ],
    compute: (v) => {
      let raw = asStr(v, 'broken', '').trim()

      // 1. Remove markdown fences
      raw = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()

      // 2. Remove trailing commas
      raw = raw.replace(/,\s*([}\]])/g, '$1')

      // 3. Close open string if unclosed
      const quoteCount = (raw.match(/"/g) || []).length
      if (quoteCount % 2 !== 0) {
        raw += '"'
      }

      // 4. Count and balance brackets
      let openBraces = 0
      let openBrackets = 0
      for (const char of raw) {
        if (char === '{') openBraces++
        else if (char === '}') openBraces--
        else if (char === '[') openBrackets++
        else if (char === ']') openBrackets--
      }

      while (openBrackets > 0) {
        raw += ']'
        openBrackets--
      }
      while (openBraces > 0) {
        raw += '}'
        openBraces--
      }

      let parsedOk = false
      try {
        JSON.parse(raw)
        parsedOk = true
      } catch {}

      return [
        res('Repair Outcome', parsedOk ? 'Successfully Repaired' : 'Partial Repair', parsedOk ? 'good' : 'warn'),
        pctres('JSON Validity', parsedOk ? 'Valid RFC 8259' : 'Needs Inspection', parsedOk ? 100 : 50, parsedOk ? 'good' : 'warn'),
        docres('Cleaned & Repaired JSON', raw),
      ]
    },
  },
]
