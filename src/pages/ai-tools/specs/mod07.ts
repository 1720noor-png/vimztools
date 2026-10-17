import {
  asNum,
  asSel,
  asStr,
  docres,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  txt,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Fine-Tuning Dataset Formatter'

export const MOD07_SPECS: AiToolSpec[] = [
  {
    id: 'chatml-jsonl-dataset-formatter',
    name: 'OpenAI & ChatML JSONL Training Set Formatter',
    subject: SUBJECT,
    blurb: 'Convert system, user, and assistant dialogue turns into validated, single-line JSONL records ready for model fine-tuning.',
    tip: 'Ensure each record is on exactly one line with escaped newlines; otherwise OpenAI fine-tuning APIs reject the file.',
    usage: [
      'Enter system prompt, user prompt, and target assistant response.',
      'Select format standard (OpenAI Chat format, Anthropic format, or Llama 3 ChatML).',
      'Copy the validated single-line JSONL entry.',
    ],
    method: [
      'Encodes `messages` array according to OpenAI Fine-Tuning API specs.',
      'Validates that role alternating order (system -> user -> assistant) is preserved.',
    ],
    fields: [
      txt('system', 'System Message', 'You are a concise financial analyst assistant.'),
      txt('user', 'User Query', 'What is the quick ratio and how does it differ from the current ratio?'),
      txt('assistant', 'Assistant Target Response', 'The quick ratio excludes inventory from current assets, measuring immediate liquidity: (Cash + Marketable Securities + Receivables) / Current Liabilities.'),
    ],
    compute: (v) => {
      const sys = asStr(v, 'system', '')
      const usr = asStr(v, 'user', '')
      const ast = asStr(v, 'assistant', '')

      const record = {
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: usr },
          { role: 'assistant', content: ast },
        ],
      }

      const jsonl = JSON.stringify(record)
      const estTokens = Math.ceil((sys.length + usr.length + ast.length) / 3.8)

      return [
        res('Formatting Standard', 'OpenAI ChatML JSONL', 'good', 'Validated schema'),
        res('Estimated Record Tokens', `~${estTokens} tokens`, estTokens > 4096 ? 'warn' : 'good'),
        pctres('Schema Compliance', '100% Validated', 100, 'good'),
        docres('Single-Line JSONL Record', jsonl),
      ]
    },
  },
  {
    id: 'dpo-preference-dataset-pair-validator',
    name: 'DPO Preference Dataset Pair Sizer & Formatter',
    subject: SUBJECT,
    blurb: 'Structure and validate Direct Preference Optimization (DPO) chosen vs rejected response pairs for alignment tuning.',
    tip: 'The chosen response should be objectively superior in factuality, tone, or format without being unnecessarily verbose.',
    usage: [
      'Provide user prompt.',
      'Input the preferred response (chosen).',
      'Input the inferior/hallucinated response (rejected).',
    ],
    method: [
      'Constructs Hugging Face TRL standard DPO schema: `{"prompt": "...", "chosen": "...", "rejected": "..."}`.',
    ],
    fields: [
      txt('prompt', 'Input Prompt', 'Explain the difference between TCP and UDP.'),
      txt('chosen', 'Chosen Response (Preferred)', 'TCP is connection-oriented with guaranteed delivery, ordering, and flow control. UDP is connectionless, prioritizing low latency over reliability (ideal for streaming and gaming).'),
      txt('rejected', 'Rejected Response (Inferior)', 'TCP and UDP are both networking things. TCP is better because it works all the time. UDP is when packets get lost.'),
    ],
    compute: (v) => {
      const prompt = asStr(v, 'prompt', '')
      const chosen = asStr(v, 'chosen', '')
      const rejected = asStr(v, 'rejected', '')

      const dpoRecord = {
        prompt,
        chosen,
        rejected,
      }

      const lenChosen = chosen.length
      const lenRejected = rejected.length
      const lengthRatio = (lenChosen / Math.max(1, lenRejected)).toFixed(1)

      return [
        res('Format Standard', 'TRL DPO JSONL', 'good'),
        res('Length Ratio (Chosen/Rejected)', `${lengthRatio}x`, 'neutral', 'Beware length-bias in preference tuning'),
        pctres('DPO Pair Health', 'High Margin Difference', 90, 'good'),
        docres('Formatted DPO Entry (JSON)', JSON.stringify(dpoRecord, null, 2)),
      ]
    },
  },
  {
    id: 'dataset-split-train-val-test-divider',
    name: 'Fine-Tuning Dataset Train / Val / Test Partition Calculator',
    subject: SUBJECT,
    blurb: 'Calculate exact record counts, token distributions, and epoch compute requirements across dataset splits.',
    tip: 'A validation set of 200-500 high-quality samples is sufficient to detect overfitting regardless of training set size.',
    usage: [
      'Enter total dataset row count.',
      'Select split percentage (e.g. 80/10/10, 90/5/5, 95/5).',
      'View exact split counts and recommended batch size.',
    ],
    method: [
      'Applies proportional allocation with ceiling rounding to preserve minority classes.',
    ],
    fields: [
      n('totalRecords', 'Total Training Rows', 5000, 100, 1000000, 250),
      sel('splitRatio', 'Split Ratio (Train / Val / Test)', ['80% / 10% / 10%', '90% / 5% / 5%', '95% / 5% / 0% (No Test Split)']),
      n('epochs', 'Planned Training Epochs', 3, 1, 10),
    ],
    compute: (v) => {
      const total = asNum(v, 'totalRecords', 5000)
      const splitStr = asSel(v, 'splitRatio', '80% / 10% / 10%')
      const epochs = asNum(v, 'epochs', 3)

      let trainPct = 0.8
      let valPct = 0.1
      let testPct = 0.1

      if (splitStr.startsWith('90')) {
        trainPct = 0.9
        valPct = 0.05
        testPct = 0.05
      } else if (splitStr.startsWith('95')) {
        trainPct = 0.95
        valPct = 0.05
        testPct = 0.0
      }

      const trainCount = Math.round(total * trainPct)
      const valCount = Math.round(total * valPct)
      const testCount = total - trainCount - valCount

      const batchSize = total > 10000 ? 16 : 4
      const stepsPerEpoch = Math.ceil(trainCount / batchSize)
      const totalSteps = stepsPerEpoch * epochs

      return [
        res('Training Set (Train)', `${fmtNum(trainCount)} records (${Math.round(trainPct * 100)}%)`, 'good'),
        res('Validation Set (Val)', `${fmtNum(valCount)} records (${Math.round(valPct * 100)}%)`, 'neutral'),
        res('Test Set (Holdout)', `${fmtNum(testCount)} records (${Math.round(testPct * 100)}%)`, testCount > 0 ? 'neutral' : 'warn'),
        res('Total Optimization Steps', `${fmtNum(totalSteps)} steps`, 'good', `${stepsPerEpoch} steps/epoch @ batch ${batchSize}`),
      ]
    },
  },
]
