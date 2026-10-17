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

export const SUBJECT = 'Model Inference Latency & Cost'

export const MOD09_SPECS: AiToolSpec[] = [
  {
    id: 'time-to-first-token-ttft-throughput-calculator',
    name: 'Time to First Token (TTFT) & Streaming Throughput Sizer',
    subject: SUBJECT,
    blurb: 'Calculate prefill latency, Time to First Token (TTFT), Inter-Token Latency (ITL), and end-to-end streaming duration.',
    tip: 'Long prompt prefill is compute-bound, whereas token-by-token generation is memory-bandwidth-bound.',
    usage: [
      'Input prompt token count and target completion length.',
      'Enter Time to First Token (TTFT in ms) and generation speed (tokens/sec).',
      'View total response duration and perceived responsiveness rating.',
    ],
    method: [
      'Total Latency = TTFT + (Completion Tokens / Tokens Per Second).',
      'Inter-Token Latency = 1000 / Tokens Per Second.',
    ],
    fields: [
      n('promptTokens', 'Input Prompt Tokens', 2500, 10, 100000),
      n('completionTokens', 'Output Completion Tokens', 600, 10, 8192),
      n('ttftMs', 'Time to First Token (TTFT in ms)', 450, 50, 10000),
      n('tps', 'Generation Throughput (tokens/sec)', 45, 1, 500),
    ],
    compute: (v) => {
      const pTokens = asNum(v, 'promptTokens', 2500)
      const cTokens = asNum(v, 'completionTokens', 600)
      const ttft = asNum(v, 'ttftMs', 450)
      const tps = Math.max(1, asNum(v, 'tps', 45))

      const streamDurationSec = cTokens / tps
      const totalDurationSec = (ttft / 1000) + streamDurationSec
      const itlMs = Math.round(1000 / tps)

      const responsiveness = ttft < 600 ? 'Instant UI Feel' : ttft < 1500 ? 'Acceptable' : 'Sluggish'
      const tone = ttft < 600 ? 'good' : ttft < 1500 ? 'neutral' : 'warn'

      return [
        res('Total Response Duration', `${totalDurationSec.toFixed(2)} seconds`, 'good'),
        res('Time to First Token (TTFT)', `${ttft} ms`, tone, responsiveness),
        res('Inter-Token Latency (ITL)', `${itlMs} ms / token`, 'neutral', `At ${tps} tok/sec`),
        pctres('Perceived Streaming Smoothness', tps >= 35 ? 'Human Reading Speed+' : 'Noticeable Stutter', Math.min(100, Math.round((tps / 50) * 100)), tps >= 35 ? 'good' : 'warn'),
        res('Total Tokens Processed', `${fmtNum(pTokens + cTokens)} tokens`, 'neutral', `${fmtNum(pTokens)} prompt + ${fmtNum(cTokens)} completion`),
      ]
    },
  },
  {
    id: 'monthly-llm-api-bill-forecaster',
    name: 'Multi-Provider Monthly LLM API Bill Forecaster',
    subject: SUBJECT,
    blurb: 'Forecast monthly bills based on daily requests, input/output ratio, and prompt caching across GPT-4o, Claude 3.5, and Gemini.',
    tip: 'Output tokens are typically 4x more expensive than input tokens. Enforce concise answer formatting to slash bills.',
    usage: [
      'Enter daily API request volume.',
      'Specify average input tokens and average output tokens.',
      'Select target LLM model tier.',
    ],
    method: [
      'Cost = (DailyRequests * 30 / 1M) * (InputTokens * RateInput + OutputTokens * RateOutput).',
    ],
    fields: [
      n('dailyRequests', 'Daily API Requests', 5000, 10, 1000000, 500),
      n('avgInput', 'Average Input Tokens per Request', 1500, 50, 50000),
      n('avgOutput', 'Average Output Tokens per Request', 350, 10, 8192),
      sel('model', 'Model Tier', [
        'GPT-4o ($2.50 in / $10.00 out per 1M)',
        'Claude 3.5 Sonnet ($3.00 in / $15.00 out per 1M)',
        'GPT-4o-mini ($0.15 in / $0.60 out per 1M)',
        'Claude 3.5 Haiku ($0.80 in / $4.00 out per 1M)',
        'Gemini 1.5 Flash ($0.075 in / $0.30 out per 1M)',
      ]),
    ],
    compute: (v) => {
      const reqs = asNum(v, 'dailyRequests', 5000)
      const inTok = asNum(v, 'avgInput', 1500)
      const outTok = asNum(v, 'avgOutput', 350)
      const model = asSel(v, 'model', 'GPT-4o ($2.50 in / $10.00 out per 1M)')

      let inRate = 2.5
      let outRate = 10.0

      if (model.includes('Claude 3.5 Sonnet')) {
        inRate = 3.0
        outRate = 15.0
      } else if (model.includes('mini')) {
        inRate = 0.15
        outRate = 0.60
      } else if (model.includes('Haiku')) {
        inRate = 0.80
        outRate = 4.0
      } else if (model.includes('Flash')) {
        inRate = 0.075
        outRate = 0.30
      }

      const monthlyReqs = reqs * 30
      const monthlyInputTokens = monthlyReqs * inTok
      const monthlyOutputTokens = monthlyReqs * outTok

      const costInput = (monthlyInputTokens / 1_000_000) * inRate
      const costOutput = (monthlyOutputTokens / 1_000_000) * outRate
      const totalMonthly = costInput + costOutput

      return [
        res('Projected Monthly Bill', fmtMoney(totalMonthly), totalMonthly > 2000 ? 'warn' : 'good'),
        res('Input Tokens Cost', fmtMoney(costInput), 'neutral', `${fmtNum(monthlyInputTokens / 1_000_000, 1)}M tokens`),
        res('Output Tokens Cost', fmtMoney(costOutput), 'neutral', `${fmtNum(monthlyOutputTokens / 1_000_000, 1)}M tokens`),
        pctres('Cost Distribution', `${Math.round((costOutput / totalMonthly) * 100)}% Output Tokens`, Math.round((costOutput / totalMonthly) * 100), 'warn', 'Output generation drives bulk of invoice'),
      ]
    },
  },
  {
    id: 'self-hosted-vs-api-tco-comparator',
    name: 'Self-Hosted Cloud GPU vs Managed API TCO Break-Even Calculator',
    subject: SUBJECT,
    blurb: 'Calculate the volume break-even point between hosting dedicated GPUs (e.g. RunPod, Lambda Labs, AWS) vs pay-per-token APIs.',
    tip: 'Self-hosting open-weight models becomes cost-effective once daily traffic exceeds ~12M tokens with high GPU utilization.',
    usage: [
      'Enter GPU hourly rental cost (e.g. $1.89/hr for 1x A100 80GB).',
      'Enter expected monthly token throughput.',
      'Select equivalent managed API pricing.',
    ],
    method: [
      'GPU Monthly Cost = HourlyRate * 730 hours.',
      'API Monthly Cost = (TotalTokens / 1M) * BlendedRate.',
    ],
    fields: [
      n('hourlyGpu', 'Cloud GPU Hourly Rental ($/hr)', 1.89, 0.5, 25.0, 0.1),
      n('monthlyMillionTokens', 'Monthly Token Volume (Millions)', 45, 1, 2000, 5),
      n('apiBlendedRate', 'API Blended Rate ($ / 1M tokens)', 2.0, 0.1, 30.0, 0.5),
    ],
    compute: (v) => {
      const gpuHour = asNum(v, 'hourlyGpu', 1.89)
      const mTokens = asNum(v, 'monthlyMillionTokens', 45)
      const apiRate = asNum(v, 'apiBlendedRate', 2.0)

      const gpuMonthlyCost = gpuHour * 730
      const apiMonthlyCost = mTokens * apiRate
      const breakEvenMillionTokens = Math.round(gpuMonthlyCost / apiRate)

      const recommendation = apiMonthlyCost > gpuMonthlyCost ? 'Self-Hosted GPU Cheaper' : 'Managed API Cheaper'
      const tone = apiMonthlyCost > gpuMonthlyCost ? 'good' : 'neutral'

      return [
        res('Winner / Recommendation', recommendation, tone),
        res('Self-Hosted Monthly GPU Cost', fmtMoney(gpuMonthlyCost), 'neutral', `${gpuHour}/hr * 730 hrs`),
        res('Managed API Monthly Cost', fmtMoney(apiMonthlyCost), 'neutral', `${mTokens}M tokens @ ${fmtMoney(apiRate)}/M`),
        res('Volume Break-Even Point', `${fmtNum(breakEvenMillionTokens)}M tokens / month`, 'good', 'Beyond this volume, self-hosting is cheaper'),
      ]
    },
  },
]
