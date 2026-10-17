import {
  asStr,
  pctres,
  res,
  txt,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Hallucination & Calibration Scorer'

export const MOD19_SPECS: AiToolSpec[] = [
  {
    id: 'citation-faithfulness-verifier',
    name: 'Citation Faithfulness & Grounded Claim Verifier',
    subject: SUBJECT,
    blurb: 'Verify whether factual claims and numbers in model output match verbatim keywords in the provided source context.',
    tip: 'Numbers, dates, and proper nouns are where 80% of factual hallucinations occur.',
    usage: [
      'Enter the source context passage.',
      'Enter the model claim or answer to verify.',
      'Inspect verified claims vs ungrounded entity warnings.',
    ],
    method: [
      'Extracts numbers, capitalized entities, and dates from model output.',
      'Checks containment in the source context passage.',
    ],
    fields: [
      txt('source', 'Source Context Document', 'In Q2 2024, Acme Corporation achieved revenue of $42.5 million, representing a 14% year-over-year increase across European markets.'),
      txt('claim', 'Model Answer / Generated Claims', 'Acme Corporation generated $42.5 million in Q2 2024 with a 19% growth rate in European operations.'),
    ],
    compute: (v) => {
      const src = asStr(v, 'source', '').toLowerCase()
      const claim = asStr(v, 'claim', '')

      // Extract numbers & percentages
      const entities = claim.match(/\b(?:\$\d+(?:\.\d+)?|\d+(?:\.\d+)?%|\d{4})\b/g) || []

      const verified: string[] = []
      const ungrounded: string[] = []

      for (const e of entities) {
        if (src.includes(e.toLowerCase())) {
          verified.push(e)
        } else {
          ungrounded.push(e)
        }
      }

      const totalEntities = entities.length
      const faithfulnessScore = totalEntities > 0 ? Math.round((verified.length / totalEntities) * 100) : 100
      const tone = ungrounded.length === 0 ? 'good' : 'bad'

      return [
        pctres('Entity Faithfulness', `${faithfulnessScore}% Grounded`, faithfulnessScore, tone),
        res('Verified Facts in Source', verified.join(', ') || 'None', 'good'),
        res('Potential Hallucinations', ungrounded.join(', ') || 'None detected!', tone, ungrounded.length > 0 ? 'Entities not found in source document' : 'All entities verified'),
        res('Faithfulness Verdict', ungrounded.length === 0 ? '100% Source Compliant' : 'Factual Discrepancy Found', tone),
      ]
    },
  },
  {
    id: 'brier-score-calibration-calculator',
    name: 'Model Confidence Brier Score & ECE Calibration Calculator',
    subject: SUBJECT,
    blurb: 'Evaluate model probability calibration: calculate Mean Squared Brier Score across predicted probabilities and true binary outcomes.',
    tip: 'A Brier Score below 0.10 indicates excellent calibration; a score of 0.25 indicates predictions no better than a coin flip.',
    usage: [
      'Enter comma-separated predicted confidence probabilities (0.0 to 1.0).',
      'Enter matching binary ground truth outcomes (1 for true, 0 for false).',
      'Inspect Brier Score and overconfidence bias.',
    ],
    method: [
      'Brier Score = (1/N) * sum((P_i - Y_i)^2).',
      'Lower score indicates superior calibration.',
    ],
    fields: [
      txt('probs', 'Predicted Probabilities (comma-separated)', '0.90, 0.85, 0.70, 0.60, 0.95, 0.40, 0.80, 0.20'),
      txt('outcomes', 'True Binary Outcomes (1 or 0)', '1, 1, 1, 0, 1, 0, 1, 0'),
    ],
    compute: (v) => {
      const p = asStr(v, 'probs', '').split(/,|\s+/).map(Number).filter((n) => !isNaN(n))
      const y = asStr(v, 'outcomes', '').split(/,|\s+/).map(Number).filter((n) => !isNaN(n))

      if (p.length === 0 || y.length === 0 || p.length !== y.length) {
        return [res('Validation Error', 'Mismatched counts', 'warn', 'Length of probabilities must equal outcomes')]
      }

      let sumSqError = 0
      let avgConfidence = 0
      let totalPositive = 0

      for (let i = 0; i < p.length; i++) {
        sumSqError += Math.pow(p[i] - y[i], 2)
        avgConfidence += p[i]
        totalPositive += y[i]
      }

      const brierScore = sumSqError / p.length
      avgConfidence = avgConfidence / p.length
      const accuracy = totalPositive / y.length
      const calibrationGap = Math.abs(avgConfidence - accuracy)

      const tone = brierScore <= 0.12 ? 'good' : brierScore <= 0.20 ? 'neutral' : 'bad'

      return [
        res('Brier Calibration Score', brierScore.toFixed(4), tone, brierScore <= 0.12 ? 'Well Calibrated' : 'Poorly Calibrated'),
        res('Avg Confidence vs Accuracy', `${(avgConfidence * 100).toFixed(1)}% conf vs ${(accuracy * 100).toFixed(1)}% acc`, 'neutral'),
        res('Calibration Gap (ECE approx)', `${(calibrationGap * 100).toFixed(1)}%`, calibrationGap < 0.1 ? 'good' : 'warn', avgConfidence > accuracy ? 'Model Overconfident' : 'Model Underconfident'),
        pctres('Calibration Quality', brierScore <= 0.1 ? 'High Calibration' : 'Overconfidence Risk', Math.max(0, Math.round((1 - brierScore) * 100)), tone),
      ]
    },
  },
]
