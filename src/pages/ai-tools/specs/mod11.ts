import {
  asNum,
  asSel,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Agentic ReAct & Tool Call Planning'

export const MOD11_SPECS: AiToolSpec[] = [
  {
    id: 'react-loop-step-cost-latency-sizer',
    name: 'ReAct Agent Loop Step Cost & Latency Accumulator',
    subject: SUBJECT,
    blurb: 'Calculate the compounding quadratic token accumulation, latency, and API cost across multi-step Thought-Action-Observation loops.',
    tip: 'Every ReAct step re-sends the entire past history of observations. By step 10, each call costs 8x more than step 1.',
    usage: [
      'Enter planned or average agent steps per task (e.g. 5 to 15 steps).',
      'Input average tokens per observation and per tool call.',
      'Inspect total cumulative tokens consumed across the full execution.',
    ],
    method: [
      'Cumulative Tokens = Sum_{i=1}^{Steps} [BasePrompt + i * (Thought + ToolCall + Observation)].',
      'Quadratic context growth modeling.',
    ],
    fields: [
      n('steps', 'Number of ReAct Steps / Turns', 8, 1, 30),
      n('basePrompt', 'Initial System & User Prompt Tokens', 2000, 200, 20000),
      n('turnPayload', 'Average Tokens Added per Step (Thought + Obs)', 600, 50, 4000),
      n('costPer1M', 'Blended Model Cost ($ / 1M tokens)', 5.0, 0.5, 30.0, 0.5),
    ],
    compute: (v) => {
      const steps = asNum(v, 'steps', 8)
      const base = asNum(v, 'basePrompt', 2000)
      const turn = asNum(v, 'turnPayload', 600)
      const costPer1M = asNum(v, 'costPer1M', 5.0)

      let totalTokens = 0
      for (let i = 1; i <= steps; i++) {
        totalTokens += base + (i * turn)
      }

      const totalCost = (totalTokens / 1_000_000) * costPer1M
      const finalTurnContext = base + (steps * turn)
      const estDurationSec = Math.round(steps * 2.8)

      return [
        res('Cumulative Tokens Consumed', `${fmtNum(totalTokens)} tokens`, totalTokens > 50000 ? 'warn' : 'good', `Across ${steps} ReAct iterations`),
        res('Total Execution Cost', fmtMoney(totalCost, 3), 'good'),
        res('Final Turn Context Size', `${fmtNum(finalTurnContext)} tokens`, finalTurnContext > 32000 ? 'warn' : 'good'),
        res('Estimated Execution Time', `~${estDurationSec} seconds`, 'neutral', 'Assuming ~2.8s per tool roundtrip'),
        pctres('Compounding Overhead Ratio', `${Math.round((totalTokens / (base * steps)) * 100)}%`, Math.min(100, Math.round((totalTokens / (base * steps)) * 50)), 'warn', 'Quadratic history accumulation'),
      ]
    },
  },
  {
    id: 'agentic-tool-catalog-overhead-calculator',
    name: 'Agent Tool Catalog JSON Schema Overhead Sizer',
    subject: SUBJECT,
    blurb: 'Calculate prompt context consumed simply by advertising available tool schemas to an autonomous agent.',
    tip: 'Injecting more than 15 tool definitions significantly degrades function selection accuracy. Use dynamic tool routing.',
    usage: [
      'Enter number of registered tools in the agent catalog.',
      'Specify average parameters per tool schema.',
      'View static token overhead per API call.',
    ],
    method: [
      'Average tool definition consumes ~120 to 180 tokens depending on parameter descriptions.',
    ],
    fields: [
      n('toolCount', 'Active Tools Registered in Agent', 14, 1, 60),
      sel('schemaComplexity', 'Tool Schema Detail Level', [
        'Detailed (Descriptions, Enums, Types ~180 tokens/tool)',
        'Compact (Types & brief descriptions ~120 tokens/tool)',
        'Minimal (Name & parameters only ~70 tokens/tool)',
      ]),
    ],
    compute: (v) => {
      const count = asNum(v, 'toolCount', 14)
      const complexity = asSel(v, 'schemaComplexity', 'Detailed (Descriptions, Enums, Types ~180 tokens/tool)')

      let tokPerTool = 180
      if (complexity.startsWith('Compact')) tokPerTool = 120
      else if (complexity.startsWith('Minimal')) tokPerTool = 70

      const totalTokens = count * tokPerTool
      const tone = count > 20 ? 'bad' : count > 12 ? 'warn' : 'good'

      return [
        res('Tool Definition Overhead', `${fmtNum(totalTokens)} tokens`, tone, `Injected into every API call`),
        res('Tools Count Status', count <= 12 ? 'Optimal (<12)' : count <= 20 ? 'Acceptable' : 'Tool Selection Confusion Risk', tone),
        pctres('Context Penalty', `${count} Tools`, Math.min(100, Math.round((count / 25) * 100)), tone),
      ]
    },
  },
]
