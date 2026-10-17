import {
  asNum,
  asSel,
  asStr,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  txt,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'LLM Token Counter & Context Sizer'

export const MOD02_SPECS: AiToolSpec[] = [
  {
    id: 'multimodel-token-estimator',
    name: 'Multi-Model Token Estimator (GPT-4o, Claude 3.5, Gemini 1.5, Llama 3)',
    subject: SUBJECT,
    blurb: 'Compare heuristic BPE token counts and cost estimates across leading frontier and open-weight models.',
    tip: 'Code and non-English text consume 1.5x to 3x more tokens per word than standard English prose.',
    usage: [
      'Enter or paste your prompt text.',
      'Select text type (English prose, code/JSON, or multilingual).',
      'Compare token usage across 4 major model families.',
    ],
    method: [
      'Applies calibrated character-to-token ratios derived from tiktoken (o200k_base / cl100k_base) and SentencePiece.',
    ],
    fields: [
      txt('text', 'Prompt or Document Text', 'You are an autonomous AI research scientist tasked with evaluating climate telemetry datasets across 40 countries.'),
      sel('contentType', 'Content Type', ['English Prose (~1.3 tokens/word)', 'Code & JSON (~1.8 tokens/word)', 'Multilingual / Non-Latin (~2.5 tokens/word)']),
    ],
    compute: (v) => {
      const text = asStr(v, 'text', '')
      const type = asSel(v, 'contentType', 'English Prose (~1.3 tokens/word)')

      const words = text.split(/\s+/).filter(Boolean).length
      const chars = text.length

      let mult = 1.3
      if (type.includes('Code')) mult = 1.8
      if (type.includes('Multilingual')) mult = 2.5

      const gpt4oTokens = Math.max(1, Math.round(words * mult))
      const claudeTokens = Math.max(1, Math.round(words * (mult * 1.04)))
      const geminiTokens = Math.max(1, Math.round(words * (mult * 0.98)))
      const llamaTokens = Math.max(1, Math.round(words * (mult * 1.02)))

      return [
        res('Word & Character Count', `${fmtNum(words)} words · ${fmtNum(chars)} chars`, 'neutral'),
        res('GPT-4o (o200k_base)', `~${fmtNum(gpt4oTokens)} tokens`, 'good', `${fmtMoney((gpt4oTokens / 1_000_000) * 2.5, 4)} input cost`),
        res('Claude 3.5 Sonnet', `~${fmtNum(claudeTokens)} tokens`, 'good', `${fmtMoney((claudeTokens / 1_000_000) * 3.0, 4)} input cost`),
        res('Gemini 1.5 Pro', `~${fmtNum(geminiTokens)} tokens`, 'good', `${fmtMoney((geminiTokens / 1_000_000) * 1.25, 4)} input cost`),
        res('Llama 3 70B (Open)', `~${fmtNum(llamaTokens)} tokens`, 'good', `${fmtMoney((llamaTokens / 1_000_000) * 0.6, 4)} host cost`),
      ]
    },
  },
  {
    id: 'context-window-fill-ratio-calculator',
    name: 'Context Window Utilization & Safety Buffer Sizer',
    subject: SUBJECT,
    blurb: 'Calculate prompt context saturation, remaining token capacity, and safety margins before hitting context limits.',
    tip: 'Keep total prompt tokens under 80% of window size to avoid "lost-in-the-middle" attention degradation.',
    usage: [
      'Select model context window capacity (8K to 2M tokens).',
      'Input system prompt, user prompt, and retrieved context tokens.',
      'Check saturation percentage and headroom for model output.',
    ],
    method: [
      'Calculates active payload + safety reserve against total addressable KV cache capacity.',
    ],
    fields: [
      sel('windowSize', 'Model Context Window', [
        '128,000 tokens (GPT-4o, Llama 3.1)',
        '200,000 tokens (Claude 3.5 Sonnet)',
        '1,000,000 tokens (Gemini 1.5 Flash/Pro)',
        '32,768 tokens (Mistral Small / Gemma 2)',
        '8,192 tokens (Legacy Models / Small Edge)',
      ]),
      n('systemTokens', 'System Prompt Tokens', 1200, 0, 50000),
      n('retrievalTokens', 'Retrieved Context / RAG Tokens', 18500, 0, 200000),
      n('historyTokens', 'Chat History Tokens', 4200, 0, 100000),
      n('outputReserve', 'Desired Output Reserve (max_tokens)', 4096, 256, 16384),
    ],
    compute: (v) => {
      const windowStr = asSel(v, 'windowSize', '128,000 tokens (GPT-4o, Llama 3.1)')
      let totalCapacity = 128000
      if (windowStr.includes('200,000')) totalCapacity = 200000
      else if (windowStr.includes('1,000,000')) totalCapacity = 1000000
      else if (windowStr.includes('32,768')) totalCapacity = 32768
      else if (windowStr.includes('8,192')) totalCapacity = 8192

      const sys = asNum(v, 'systemTokens', 1200)
      const rag = asNum(v, 'retrievalTokens', 18500)
      const hist = asNum(v, 'historyTokens', 4200)
      const outReserve = asNum(v, 'outputReserve', 4096)

      const usedTokens = sys + rag + hist
      const totalDemanded = usedTokens + outReserve
      const remainingHeadroom = Math.max(0, totalCapacity - totalDemanded)
      const utilizationPct = Math.round((totalDemanded / totalCapacity) * 100)

      const tone = utilizationPct > 90 ? 'bad' : utilizationPct > 75 ? 'warn' : 'good'

      return [
        res('Total Context Consumed', `${fmtNum(totalDemanded)} / ${fmtNum(totalCapacity)} tokens`, tone),
        pctres('Context Window Saturation', `${utilizationPct}% Used`, utilizationPct, tone, utilizationPct > 80 ? 'Attention degradation risk' : 'Safe operating margin'),
        res('Input Tokens (Sys + RAG + Hist)', `${fmtNum(usedTokens)} tokens`, 'neutral'),
        res('Safe Output Allowance', `${fmtNum(outReserve)} tokens`, 'good'),
        res('Unused Available Headroom', `${fmtNum(remainingHeadroom)} tokens`, remainingHeadroom > 0 ? 'good' : 'bad'),
      ]
    },
  },
  {
    id: 'chat-history-sliding-window-trimmer',
    name: 'Conversation History Sliding Window Trimmer & Budgeter',
    subject: SUBJECT,
    blurb: 'Simulate sliding-window message pruning strategies to keep multi-turn chatbot conversations within budget.',
    tip: 'Pruning older user messages while preserving system prompts prevents instruction amnesia.',
    usage: [
      'Enter total token budget dedicated to conversation history.',
      'Input average tokens per turn and total turns.',
      'View retention capacity and truncation recommendation.',
    ],
    method: [
      'FIFO sliding-window math with sticky system prompt retention.',
    ],
    fields: [
      n('budget', 'Chat History Token Budget', 8000, 1000, 100000),
      n('avgTurnTokens', 'Average Tokens per Turn (User + Assistant)', 450, 50, 5000),
      n('currentTurns', 'Current Number of Turns', 24, 1, 100),
    ],
    compute: (v) => {
      const budget = asNum(v, 'budget', 8000)
      const perTurn = asNum(v, 'avgTurnTokens', 450)
      const turns = asNum(v, 'currentTurns', 24)

      const totalAccumulated = turns * perTurn
      const maxRetainableTurns = Math.floor(budget / perTurn)
      const turnsToPrune = Math.max(0, turns - maxRetainableTurns)
      const overflowTokens = Math.max(0, totalAccumulated - budget)

      return [
        res('Accumulated Tokens', `${fmtNum(totalAccumulated)} tokens`, overflowTokens > 0 ? 'warn' : 'good'),
        res('Max Retainable Turns', `${maxRetainableTurns} turns`, 'good', `Within ${fmtNum(budget)} token limit`),
        res('Turns to Prune / Summarize', `${turnsToPrune} older turns`, turnsToPrune > 0 ? 'warn' : 'good'),
        pctres('Budget Utilization', `${Math.min(100, Math.round((totalAccumulated / budget) * 100))}%`, Math.round((totalAccumulated / budget) * 100), overflowTokens > 0 ? 'bad' : 'good'),
      ]
    },
  },
  {
    id: 'code-to-token-density-ratio-analyzer',
    name: 'Code vs Natural Language Token Density Comparator',
    subject: SUBJECT,
    blurb: 'Analyze token inflation across programming languages (Python, TypeScript, JSON, Rust, Go) vs prose.',
    tip: 'Minifying JSON (removing spaces & indentation) can reduce LLM input tokens by up to 35%.',
    usage: [
      'Select data or programming format.',
      'Enter lines of code or character count.',
      'Inspect estimated tokens and token-to-character compression ratio.',
    ],
    method: [
      'Empirical density multipliers: Python (3.2 chars/tok), JSON formatted (2.4 chars/tok), minified JSON (3.6 chars/tok), Rust (2.8 chars/tok).',
    ],
    fields: [
      sel('format', 'Data / Code Format', [
        'Formatted Pretty JSON (Indented)',
        'Minified JSON (No whitespace)',
        'Python Script',
        'TypeScript / JavaScript',
        'Rust with Type Signatures',
      ]),
      n('charCount', 'Total Character Count', 8500, 100, 500000),
    ],
    compute: (v) => {
      const format = asSel(v, 'format', 'Formatted Pretty JSON (Indented)')
      const chars = asNum(v, 'charCount', 8500)

      let charsPerToken = 3.2
      if (format.includes('Pretty JSON')) charsPerToken = 2.4
      else if (format.includes('Minified JSON')) charsPerToken = 3.6
      else if (format.includes('Rust')) charsPerToken = 2.7
      else if (format.includes('TypeScript')) charsPerToken = 3.0

      const estimatedTokens = Math.round(chars / charsPerToken)
      const costGpt4o = (estimatedTokens / 1_000_000) * 2.5

      return [
        res('Estimated Tokens', `~${fmtNum(estimatedTokens)} tokens`, 'neutral'),
        res('Density Efficiency', `${charsPerToken.toFixed(2)} chars / token`, charsPerToken > 3.0 ? 'good' : 'warn'),
        res('Relative Inflation', format.includes('Pretty') ? '+50% vs Minified' : 'Optimal Density', format.includes('Pretty') ? 'warn' : 'good'),
        res('Inference Ingest Cost', fmtMoney(costGpt4o, 4), 'neutral'),
      ]
    },
  },
  {
    id: 'rag-chunk-context-budget-allocator',
    name: 'RAG Chunk Retrieval & Context Partition Allocator',
    subject: SUBJECT,
    blurb: 'Determine how many retrieved RAG chunks can be injected into the context window without exceeding latency or cost targets.',
    tip: 'More chunks do NOT always equal better answers. Aim for 5-8 highly relevant chunks to avoid distracting the cross-attention layers.',
    usage: [
      'Specify total model context limit.',
      'Input chunk size (e.g. 500 tokens) and safety reserves.',
      'Calculate optimal Top-K retrieval limit.',
    ],
    method: [
      'Allocates: Total - System - Conversation - Query - Output Reserve = Available Chunk Budget.',
    ],
    fields: [
      n('contextWindow', 'Available Window for Ingestion', 32000, 4000, 200000),
      n('chunkSize', 'RAG Chunk Size (tokens)', 512, 128, 2048),
      n('systemAndQuery', 'System + User Query Tokens', 1500, 100, 10000),
      n('outputReserve', 'Output Generation Reserve', 2048, 512, 8192),
    ],
    compute: (v) => {
      const window = asNum(v, 'contextWindow', 32000)
      const chunkSize = asNum(v, 'chunkSize', 512)
      const sys = asNum(v, 'systemAndQuery', 1500)
      const out = asNum(v, 'outputReserve', 2048)

      const availableForChunks = Math.max(0, window - sys - out)
      const maxChunks = Math.floor(availableForChunks / chunkSize)
      const recommendedTopK = Math.min(maxChunks, 10)

      return [
        res('Max Ingestible Chunks', `${maxChunks} Chunks`, 'good', `At ${chunkSize} tokens/chunk`),
        res('Recommended Top-K', `${recommendedTopK} Chunks`, 'good', 'Avoids attention diffusion'),
        res('Available Chunk Budget', `${fmtNum(availableForChunks)} tokens`, 'neutral'),
        pctres('Chunk Space Allocation', `${Math.round((availableForChunks / window) * 100)}% of Window`, Math.round((availableForChunks / window) * 100), 'good'),
      ]
    },
  },
  {
    id: 'prompt-cache-breakpoint-sizer',
    name: 'Prompt Cache Breakpoint & Sizing Optimizer',
    subject: SUBJECT,
    blurb: 'Align system prompts and static context blocks with Anthropic (1024-token) and OpenAI caching breakpoints for up to 90% cost savings.',
    tip: 'Anthropic prompt caching requires at least 1,024 tokens to activate. Smaller prompts receive zero discount.',
    usage: [
      'Enter token length of your static system instructions and documentation.',
      'Review threshold eligibility for Anthropic and OpenAI caching.',
      'Check padding recommendations to hit the cache boundary.',
    ],
    method: [
      'Evaluates token counts against Anthropic minimum (1,024 tokens) and OpenAI minimum (1,024 tokens) breakpoints.',
    ],
    fields: [
      n('staticTokens', 'Static Prompt Tokens (System + Docs)', 850, 100, 50000),
      n('dailyRequests', 'Estimated Daily API Invocations', 5000, 10, 500000),
    ],
    compute: (v) => {
      const tokens = asNum(v, 'staticTokens', 850)
      const reqs = asNum(v, 'dailyRequests', 5000)

      const threshold = 1024
      const qualifies = tokens >= threshold
      const tokensNeeded = qualifies ? 0 : threshold - tokens

      const uncachedMonthlyCost = (tokens * reqs * 30 / 1_000_000) * 3.0
      const cachedMonthlyCost = (tokens * reqs * 30 / 1_000_000) * 0.3
      const potentialMonthlySavings = Math.max(0, uncachedMonthlyCost - cachedMonthlyCost)

      return [
        res('Cache Eligibility Status', qualifies ? 'Eligible for Caching' : 'Under Minimum Threshold', qualifies ? 'good' : 'warn'),
        res('Tokens to Reach 1024 Boundary', qualifies ? '0 (Threshold Met)' : `+${tokensNeeded} tokens needed`, qualifies ? 'good' : 'warn'),
        res('Monthly Potential Savings', fmtMoney(potentialMonthlySavings), 'good', '90% discount on cache hits'),
        pctres('Cache Threshold Progress', `${Math.min(100, Math.round((tokens / threshold) * 100))}%`, Math.round((tokens / threshold) * 100), qualifies ? 'good' : 'warn'),
      ]
    },
  },
]
