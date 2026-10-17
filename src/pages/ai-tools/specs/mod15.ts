import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Sampling (Temperature/Top-P/Top-K)'

export const MOD15_SPECS: AiToolSpec[] = [
  {
    id: 'softmax-temperature-probability-simulator',
    name: 'Softmax Temperature Logit Distribution Simulator',
    subject: SUBJECT,
    blurb: 'Simulate how varying Temperature (0.0 to 1.5) alters token probabilities, entropy, and creativity vs determinism.',
    tip: 'For code, JSON, and factual QA, set Temperature to 0.0 or 0.2. For brainstorming and fiction, use 0.7 to 0.9.',
    usage: [
      'Set Temperature slider (0.0 to 1.5).',
      'Review re-weighted probabilities across candidate tokens.',
      'Check output entropy and randomness verdict.',
    ],
    method: [
      'Applies Softmax with Temperature: P(x_i) = exp(z_i / T) / sum(exp(z_j / T)).',
      'At T -> 0, probability collapses to argmax (Greedy / 100%).',
    ],
    fields: [
      n('temperature', 'Sampling Temperature (T)', 0.7, 0.0, 2.0, 0.05),
      sel('taskType', 'Application Task Goal', [
        'Creative Writing / Brainstorming (High Diversity)',
        'Code Generation & Debugging (Deterministic)',
        'JSON / Structured Output Extraction (Strict)',
        'General Conversational Chat',
      ]),
    ],
    compute: (v) => {
      const t = asNum(v, 'temperature', 0.7)
      const task = asSel(v, 'taskType', 'Creative Writing / Brainstorming (High Diversity)')

      // Mock raw logits for 4 candidate tokens: [4.0, 3.2, 2.1, 1.0]
      const rawLogits = [4.0, 3.2, 2.1, 1.0]
      const tokenLabels = ['"def"', '"class"', '"import"', '"return"']

      let probs: number[] = []
      if (t <= 0.01) {
        probs = [1.0, 0.0, 0.0, 0.0]
      } else {
        const expVals = rawLogits.map((z) => Math.exp(z / t))
        const sumExp = expVals.reduce((a, b) => a + b, 0)
        probs = expVals.map((e) => e / sumExp)
      }

      const top1Prob = Math.round(probs[0] * 100)
      const top2Prob = Math.round(probs[1] * 100)
      const top3Prob = Math.round(probs[2] * 100)
      const top4Prob = Math.round(probs[3] * 100)

      const entropy = t <= 0.01 ? 0 : -probs.reduce((sum, p) => (p > 0 ? sum + p * Math.log2(p) : sum), 0)

      return [
        pctres('Top Token Probability', `${top1Prob}% (${tokenLabels[0]})`, top1Prob, t < 0.3 ? 'good' : 'neutral', t <= 0.01 ? 'Greedy Deterministic' : 'Probabilistic Selection'),
        res('Second Choice Probability', `${top2Prob}% (${tokenLabels[1]})`, 'neutral'),
        res('Tail Options (3 & 4)', `${top3Prob}% / ${top4Prob}%`, 'neutral'),
        res('Entropy (Randomness Bits)', `${entropy.toFixed(2)} bits`, entropy < 0.5 ? 'good' : entropy > 1.5 ? 'warn' : 'neutral'),
        res('Task Alignment Assessment', task.includes('Code') || task.includes('JSON') ? (t <= 0.2 ? 'Optimal Temperature' : 'Too High for Code (Risk of syntax errors)') : (t >= 0.6 ? 'Optimal for Creativity' : 'Too Deterministic'), t <= 0.3 ? 'good' : 'neutral'),
      ]
    },
  },
  {
    id: 'top-p-nucleus-sampling-cutoff-calculator',
    name: 'Top-P (Nucleus) Sampling Mass Cutoff Calculator',
    subject: SUBJECT,
    blurb: 'Simulate Top-P nucleus truncation to dynamically filter low-probability tail tokens while preserving creativity.',
    tip: 'Top-P 0.9 discards the bottom 10% of improbable tokens, preventing the model from producing bizarre hallucinatory words.',
    usage: [
      'Set Top-P threshold (e.g. 0.85, 0.90, 0.95).',
      'Inspect how many candidate tokens remain in the active nucleus.',
      'Review truncated tail probability mass.',
    ],
    method: [
      'Orders logits by descending probability; accumulates until cumulative sum >= Top-P.',
    ],
    fields: [
      n('topP', 'Top-P Nucleus Threshold', 0.9, 0.1, 1.0, 0.05),
      n('vocabularyTail', 'Simulated Distribution Flatness', 50, 10, 100),
    ],
    compute: (v) => {
      const topP = asNum(v, 'topP', 0.9)
      const flatness = asNum(v, 'vocabularyTail', 50)

      // Simulates active tokens required to reach topP
      const activeTokens = Math.max(1, Math.round((flatness / 10) * Math.pow(topP, 2) * 5))
      const discardedMass = Math.round((1 - topP) * 100)

      return [
        res('Active Nucleus Size', `~${activeTokens} Candidate Tokens`, 'good', `Retained inside ${topP * 100}% cumulative mass`),
        res('Discarded Long Tail', `${discardedMass}% improbable tokens removed`, 'good', 'Guards against nonsense words'),
        pctres('Nucleus Retention', `${Math.round(topP * 100)}% Cumulative Mass`, Math.round(topP * 100), 'good'),
        res('Recommended Setting', topP >= 0.85 && topP <= 0.95 ? 'Standard Industry Range (0.85 - 0.95)' : 'Extreme Setting', 'neutral'),
      ]
    },
  },
]
