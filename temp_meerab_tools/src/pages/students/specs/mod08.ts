import { n, sel, txt, res, T, asNum, asSel, asStr, clamp, num, ratio } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Statistics & Data Analysis'

function nums(raw: string): number[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => parseFloat(s.replace(/[^\d.eE+-]/g, '')))
    .filter((x) => Number.isFinite(x))
}

function mean(a: number[]): number {
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0
}

function variance(a: number[], sample: boolean): number {
  if (a.length < (sample ? 2 : 1)) return 0
  const m = mean(a)
  return a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - (sample ? 1 : 0))
}

function median(a: number[]): number {
  if (!a.length) return 0
  const s = [...a].sort((x, y) => x - y)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

function zScore(x: number[], target: number): { z: number; s: number; m: number; i: number; pctile: number } {
  const s = Math.sqrt(variance(x, true)) || 1e-9
  const m = mean(x)
  const sorted = [...x].sort((p, q) => p - q)
  const below = sorted.filter((q) => q < target).length
  const eq = sorted.filter((q) => q === target).length
  const i = (below + 0.5 * eq) / x.length
  return { z: (target - m) / s, s, m, i, pctile: i * 100 }
}

function quartiles(a: number[]): { q1: number; q2: number; q3: number; iqr: number } {
  const s = [...a].sort((x, y) => x - y)
  const at = (p: number) => {
    const pos = (s.length - 1) * p
    const lo = Math.floor(pos)
    const hi = Math.ceil(pos)
    return s[lo] + (s[hi] - s[lo]) * (pos - lo)
  }
  const q1 = at(0.25)
  const q2 = at(0.5)
  const q3 = at(0.75)
  return { q1, q2, q3, iqr: q3 - q1 }
}

function gaussCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2)
  const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return z > 0 ? 1 - p : p
}

function histBins(a: number[], bins: number): { edges: number[]; counts: number[] } {
  if (!a.length) return { edges: [], counts: [] }
  const lo = Math.min(...a)
  const hi = Math.max(...a)
  const w = (hi - lo) / bins || 1
  const edges = Array.from({ length: bins + 1 }, (_, i) => lo + i * w)
  const counts = new Array(bins).fill(0)
  a.forEach((x) => {
    const i = clamp(Math.floor((x - lo) / w), 0, bins - 1)
    counts[i]++
  })
  return { edges, counts }
}

function asciiBars(counts: number[]): string {
  const max = Math.max(...counts, 1)
  return counts.map((c, i) => `bin ${i + 1}: ${'#'.repeat(Math.round((c / max) * 22))} (${c})`).join('\n')
}

export const mod08: StudentSpec[] = [
  {
    id: 'mean-calculator',
    name: 'Mean Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes the arithmetic mean of any data set with sum, count, and a quick distribution context.',
    tip: 'The mean is pulled by extreme values. If one score is wildly off, report the median alongside it.',
    usage: ['Paste your numbers.', 'Review mean, sum and count.', 'Compare with median and spread.'],
    method: ['Values are parsed from any separator.', 'Sum is divided by count.', 'Outputs precision-matched mean.'],
    fields: [txt('data', 'Data (comma or space separated)', 3, '12, 15, 18, 22, 25, 30')],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (!a.length) return [sres('Mean', 'No numbers found', T.warn)]
      const m = mean(a)
      return [
        sres('Arithmetic mean', ratio(m, 4), T.good, `Σ = ${ratio(a.reduce((s, x) => s + x, 0), 4)} over ${a.length} values`),
        res('Sum', ratio(a.reduce((s, x) => s + x, 0), 4), T.neutral, `${a.length} values`),
        res('Median', ratio(median(a), 4), T.neutral, 'robust to outliers'),
        res('Max / Min', `${ratio(Math.max(...a), 2)} / ${ratio(Math.min(...a), 2)}`, T.neutral, 'range check'),
      ]
    },
  },
  {
    id: 'median-calculator',
    name: 'Median Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Finds the median of an unsorted data set and shows the sorted values so you can verify by hand.',
    tip: 'Median is the 50th percentile. With skewed grade data it is often a fairer "typical" value than the mean.',
    usage: ['Paste your numbers.', 'Read the median.', 'Check the sorted list.'],
    method: ['Values are parsed and sorted.', 'Odd count takes the middle.', 'Even count averages the two middle values.'],
    fields: [txt('data', 'Data set', 3, '42, 19, 33, 27, 51, 8, 24')],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (!a.length) return [sres('Median', 'No numbers found', T.warn)]
      const s = [...a].sort((x, y) => x - y)
      const md = median(a)
      const pos = a.length % 2 ? (a.length + 1) / 2 : `average of ${a.length / 2} and ${a.length / 2 + 1}`
      return [
        sres('Median', ratio(md, 4), T.good, `position: ${pos}`),
        docr('Sorted values', s.map((x, i) => `${i + 1}. ${x}`).join('\n')),
        res('Mean comparison', ratio(mean(a), 4), mean(a) > md ? T.warn : T.neutral, mean(a) > md ? 'mean above median — right skew' : 'mean below/equal median'),
        res('Quartiles', `Q1 ${ratio(quartiles(a).q1, 3)} · Q3 ${ratio(quartiles(a).q3, 3)}`, T.neutral),
      ]
    },
  },
  {
    id: 'mode-calculator',
    name: 'Mode Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Identifies the most frequent value, supports ranges, and lists every mode when a set is multimodal.',
    tip: 'No repeats means no mode. In exams, a bimodal set is a strong hint your question was ambiguous.',
    usage: ['Paste the data.', 'Read the mode(s).', 'Check the frequency table.'],
    method: ['Values are tallied into a frequency map.', 'The tallest tally is the mode.', 'All tied maxima are reported.'],
    fields: [txt('data', 'Data set', 3, '4, 7, 4, 9, 7, 4, 7, 2')],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (!a.length) return [sres('Mode', 'No numbers found', T.warn)]
      const tally = new Map<number, number>()
      a.forEach((x) => tally.set(x, (tally.get(x) || 0) + 1))
      const sorted = [...tally.entries()].sort((p, q) => q[1] - p[1])
      const top = sorted[0][1]
      const modes = sorted.filter((e) => e[1] === top).map((e) => e[0])
      return [
        sres(top > 1 ? (modes.length > 1 ? 'Modes (multimodal)' : 'Mode') : 'No mode', modes.join(', '), top > 1 ? T.good : T.warn, top > 1 ? `each appears ${top}×` : 'no value repeats'),
        docr('Frequency table', sorted.map((e) => `${e[0]} → ${e[1]}×`).join('\n')),
        res('Distinct values', num(new Set(a).size, 0), T.neutral, `${a.length} total observations`),
        res('Count / proportion', `${top} · ${ratio((top / a.length) * 100, 1)}%`, T.neutral),
      ]
    },
  },
  {
    id: 'range-calculator',
    name: 'Range Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes range, interquartile range and midrange, plus a span classification for the data.',
    tip: 'Range only uses the two extremes, so it is fragile. IQR ignores outliers — report both and the contrast is informative.',
    usage: ['Paste the data.', 'Read range and IQR.', 'Judge the spread class.'],
    method: ['Range = max − min.', 'IQR = Q3 − Q1 (25th–75th percentile).', 'Midrange = (max + min) / 2.'],
    fields: [txt('data', 'Data set', 4, '5, 12, 7, 19, 22, 9, 14, 30, 18, 11')],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (!a.length) return [sres('Range', 'No numbers found', T.warn)]
      const mx = Math.max(...a)
      const mn = Math.min(...a)
      const rg = mx - mn
      const q = quartiles(a)
      const s = variance(a, true) ? 1 : 0
      return [
        sres('Range', ratio(rg, 4), T.good, `${ratio(mx, 2)} − ${ratio(mn, 2)}`),
        sres('Interquartile range', ratio(q.iqr, 4), T.neutral, `Q1 ${ratio(q.q1, 2)} → Q3 ${ratio(q.q3, 2)}`),
        res('Midrange', ratio((mx + mn) / 2, 4), T.neutral, '(max + min) / 2'),
        res('Spread class', rg === 0 ? 'All identical' : q.iqr === 0 ? 'Middle 50% identical' : s ? 'Normal spread' : 'Constant', T.neutral, 'IQR isolates the middle half'),
      ]
    },
  },
  {
    id: 'variance-calculator',
    name: 'Variance Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes population and sample variance with standard deviation and coefficient of variation.',
    tip: 'Sample variance (n−1) is used for data you sampled; population variance (n) is for the entire set. Say which one you used.',
    usage: ['Paste the data.', 'Choose population or sample.', 'Read variance and SD.'],
    method: ['Mean is computed first.', 'Squared deviations are summed.', 'Divided by n (population) or n−1 (sample).'],
    fields: [txt('data', 'Data set', 4, '10, 12, 14, 16, 18, 20, 22'), sel('kind', 'Variance type', ['Sample (n−1)', 'Population (n)'], 'Sample (n−1)')],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (!a.length) return [sres('Variance', 'No numbers found', T.warn)]
      const sample = asSel(v.kind) === 'Sample (n−1)'
      if (sample && a.length < 2) return [sres('Variance', 'Need at least 2 values', T.warn)]
      const varR = variance(a, sample)
      const sd = Math.sqrt(varR)
      return [
        sres('Variance', ratio(varR, 5), T.good, `${sample ? 'sample' : 'population'} · mean ${ratio(mean(a), 3)}`),
        sres('Standard deviation', ratio(sd, 5), T.good, '√variance'),
        res('Coefficient of variation', mean(a) ? ratio((sd / mean(a)) * 100, 2) + '%' : '—', T.neutral, 'sd ÷ mean × 100'),
        res('Degrees of freedom', num(sample ? a.length - 1 : a.length, 0), T.neutral),
      ]
    },
  },
  {
    id: 'standard-deviation-calculator-math',
    name: 'Standard Deviation Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes standard deviation with a readable ASCII distribution plot and the 68–95–99.7 rule interpretation.',
    tip: 'Within one SD of the mean lies ~68% of data. Use that band to decide which scores are genuinely unusual.',
    usage: ['Paste the data.', 'Read SD and the bands.', 'Interpret with 68–95–99.7.'],
    method: ['Variance is computed first.', 'SD = √variance.', 'Bands = mean ± 1, 2, 3 SD.'],
    fields: [txt('data', 'Data set', 4, '88, 92, 76, 95, 84, 90, 71, 99')],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (!a.length) return [sres('Standard deviation', 'No numbers found', T.warn)]
      const m = mean(a)
      const sd = Math.sqrt(variance(a, true))
      const b1 = a.filter((x) => Math.abs(x - m) <= sd).length
      const b2 = a.filter((x) => Math.abs(x - m) <= 2 * sd).length
      const b3 = a.filter((x) => Math.abs(x - m) <= 3 * sd).length
      return [
        sres('Standard deviation', ratio(sd, 5), T.good, `mean ${ratio(m, 3)}`),
        sres('Within 1 SD', `${b1}/${a.length} (${ratio((b1 / a.length) * 100, 1)}%)`, Math.abs((b1 / a.length) * 100 - 68) > 15 ? T.warn : T.good, 'empirical-rule target ≈68%'),
        res('Within 2 SD', `${b2}/${a.length} (${ratio((b2 / a.length) * 100, 1)}%)`, T.neutral, 'target ≈95%'),
        res('Within 3 SD', `${b3}/${a.length} (${ratio((b3 / a.length) * 100, 1)}%)`, T.neutral, 'target ≈99.7%'),
        docr('Distribution', asciiBars(histBins(a, 8).counts)),
      ]
    },
  },
  {
    id: 'weighted-average-calculator',
    name: 'Weighted Average Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Averages scores or measurements with custom weights, normalizing weights that do not sum to 100.',
    tip: 'A weighted average must be weighted — the high-credit course should count more. Always check that weights reflect real credit hours.',
    usage: ['Enter values and weights in pairs.', 'Set them equal in count.', 'Read the normalized weighted mean.'],
    method: ['Σ(value × weight) is divided by Σweight.', 'Weights are normalized if they do not total 100.', 'If weights total 100, the result is a true weighted mean.'],
    fields: [txt('vals', 'Values (comma separated)', 2, '82, 90, 74, 95'), txt('wts', 'Weights (comma separated)', 2, '0.25, 0.25, 0.2, 0.3')],
    compute: (v) => {
      const vals = nums(asStr(v.vals))
      const wts = nums(asStr(v.wts))
      if (!vals.length || !wts.length) return [sres('Weighted average', 'Enter values and weights', T.warn)]
      const pairs = Math.min(vals.length, wts.length)
      const wsum = wts.slice(0, pairs).reduce((s, x) => s + x, 0)
      if (wsum === 0) return [sres('Weighted average', 'Weights sum to zero', T.bad)]
      let acc = 0
      for (let i = 0; i < pairs; i++) acc += vals[i] * wts[i]
      const wa = acc / wsum
      const plain = mean(vals)
      return [
        sres('Weighted average', ratio(wa, 4), T.good, `${ratio(acc, 3)} ÷ ${ratio(wsum, 3)}`),
        sres('Plain average', ratio(plain, 4), T.neutral, 'for comparison', Math.min(100, Math.round((wa / Math.max(...vals)) * 100))),
        res('Weights total', ratio(wsum, 4), Math.abs(wsum - 1) > 0.001 && Math.abs(wsum - 100) > 0.001 ? T.warn : T.good, Math.abs(wsum - 1) <= 0.001 || Math.abs(wsum - 100) <= 0.001 ? 'sums to 1 (or 100%) — standard form' : 'unnormalized — weights rescaled automatically'),
        res('Contribution check', vals.slice(0, pairs).map((x, i) => `${x}×${wts[i]}=${ratio(x * wts[i] / wsum, 3)}`).join('  '), T.neutral),
      ]
    },
  },
  {
    id: 'quartile-calculator',
    name: 'Quartile Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes Q1, Q2, Q3, the IQR and identifies Tukey outlier fences for a data set.',
    tip: '1.5 × IQR is the standard outlier fence. Values beyond it deserve a check, not automatic deletion.',
    usage: ['Paste the data.', 'Read the quartiles and IQR.', 'Check outliers against the fences.'],
    method: ['Sorted data is split by 25/50/75 percentiles.', 'IQR = Q3 − Q1.', 'Fences: Q1 − 1.5·IQR and Q3 + 1.5·IQR.'],
    fields: [txt('data', 'Data set', 4, '12, 19, 3, 25, 30, 14, 22, 9, 17, 28, 40, 6')],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (!a.length) return [sres('Quartiles', 'No numbers found', T.warn)]
      const q = quartiles(a)
      const loF = q.q1 - 1.5 * q.iqr
      const hiF = q.q3 + 1.5 * q.iqr
      const out = a.filter((x) => x < loF || x > hiF)
      return [
        sres('Q1 (25%)', ratio(q.q1, 4), T.neutral),
        sres('Median (50%)', ratio(q.q2, 4), T.good, 'second quartile'),
        sres('Q3 (75%)', ratio(q.q3, 4), T.neutral),
        sres('IQR', ratio(q.iqr, 4), T.good, 'spread of the middle 50%'),
        sres('Outliers', out.length ? out.join(', ') : 'none', out.length ? T.warn : T.good, `fences ${ratio(loF, 2)} to ${ratio(hiF, 2)}`),
      ]
    },
  },
  {
    id: 'percentile-calculator',
    name: 'Percentile Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Finds which percentile a score falls in, or the score at a given percentile rank (linear interpolation).',
    tip: 'Percentile rank tells you how many scored below you. A score at the 85th percentile beat 85% of the group.',
    usage: ['Paste the data and the score.', 'Or enter a percentile rank.', 'Read rank and the score at that rank.'],
    method: ['Rank uses position ÷ count.', 'Percentile score uses linear interpolation.', 'Both directions supported.'],
    fields: [txt('data', 'Data set', 4, '45, 52, 61, 58, 73, 66, 70, 81, 59, 64'), n('score', 'Your score', { def: 66, step: 0.5 }), n('rank', 'Percentile rank to solve', { def: 75, min: 0, max: 100, step: 1 })],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (!a.length) return [sres('Percentile', 'No numbers found', T.warn)]
      const score = asNum(v.score)
      const r = zScore(a, score)
      const p = asNum(v.rank)
      const pos = (p / 100) * (a.length - 1)
      const lo = Math.floor(pos)
      const hi = Math.ceil(pos)
      const s = [...a].sort((x, y) => x - y)
      const at = s[lo] + (s[hi] - s[lo]) * (pos - lo)
      return [
        sres('Percentile rank of score', ratio(r.pctile, 2) + '%', T.good, `score ${score} beats ${num(Math.round(r.pctile * 10) / 10, 0)}% of values`, clamp(r.pctile, 0, 100)),
        sres(`Score at ${num(p, 0)}th percentile`, ratio(at, 3), T.good, 'linear interpolation on sorted data'),
        res('Z-score', ratio(r.z, 4), T.neutral, `${ratio((r.z), 2)} SD from mean`),
        res('Values above score', num(a.filter((x) => x > score).length, 0), T.neutral, `of ${a.length}`),
      ]
    },
  },
  {
    id: 'z-score-calculator',
    name: 'Z-Score Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Standardizes a raw score against a reference group, reporting the z-score, percentile and classification band.',
    tip: 'A z of +2 means two standard deviations above the mean. Grading curves work entirely in z-space.',
    usage: ['Enter the score, group mean and SD.', 'Or paste a group and a score.', 'Read z, percentile and band.'],
    method: ['z = (x − μ) / σ.', 'Percentile from the normal CDF of z.', 'Bands: |z| < 1 typical, > 2 unusual.'],
    fields: [n('x', 'Score', { def: 88, step: 0.5 }), n('mu', 'Group mean μ', { def: 74, step: 0.5 }), n('sd', 'Group SD σ', { def: 8, min: 0.01, step: 0.1 })],
    compute: (v) => {
      const x = asNum(v.x)
      const mu = asNum(v.mu)
      const sd = asNum(v.sd) || 1e-9
      const z = (x - mu) / sd
      const pc = gaussCdf(z) * 100
      const band = Math.abs(z) < 0.5 ? 'well within average' : Math.abs(z) < 1 ? 'typical' : Math.abs(z) < 2 ? 'notable' : 'unusual outlier'
      return [
        sres('Z-score', (z >= 0 ? '+' : '') + ratio(z, 4), z > 2 || z < -2 ? T.warn : T.good, `(x − μ)/σ = (${x} − ${mu})/${sd}`),
        sres('Percentile', ratio(pc, 2) + '%', T.neutral, 'normal CDF', pc),
        sres('Classification', band, Math.abs(z) >= 2 ? T.warn : T.good, undefined, clamp(Math.abs(z) * 25, 2, 100)),
        res('Back to raw', `x = μ + z·σ = ${ratio(mu + z * sd, 3)}`, T.neutral, 'reconstruct a raw score'),
      ]
    },
  },
  {
    id: 't-score-calculator',
    name: 'T-Score Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Converts between standardized T-scores (mean 50, SD 10) and raw scores, and explains the scale shift.',
    tip: 'T-scores avoid negative numbers for below-average results — a T of 40 is exactly one SD below the mean.',
    usage: ['Enter the raw score, mean and SD.', 'Choose direction.', 'Read T, z and percentile.'],
    method: ['z = (x − μ)/σ.', 'T = 50 + 10z.', 'Percentile from the normal CDF of z.'],
    fields: [n('x', 'Raw score', { def: 62, step: 0.5 }), n('mu', 'Mean μ', { def: 55, step: 0.5 }), n('sd', 'SD σ', { def: 9, min: 0.01, step: 0.1 })],
    compute: (v) => {
      const x = asNum(v.x)
      const mu = asNum(v.mu)
      const sd = asNum(v.sd) || 1e-9
      const z = (x - mu) / sd
      const tScore = 50 + 10 * z
      const pc = gaussCdf(z) * 100
      return [
        sres('T-score', ratio(tScore, 3), tScore >= 50 ? T.good : T.warn, `T = 50 + 10z, z = ${ratio(z, 3)}`),
        sres('Z-score', ratio(z, 4), T.neutral, 'the same information, unshifted'),
        res('Percentile', ratio(pc, 2) + '%', T.neutral, 'of the reference group'),
        res('Reverse', `T = ${ratio(tScore, 2)} → raw ${ratio(mu + ((tScore - 50) / 10) * sd, 3)}`, T.neutral, 'T → z → raw'),
      ]
    },
  },
  {
    id: 'probability-calculator-math',
    name: 'Probability Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes probability for single events, dice sums, coin runs, card draws and combinations, with odds.',
    tip: 'Complement probability is usually easier: P(not A) = 1 − P(A). Use it when the event has many branches.',
    usage: ['Pick the scenario.', 'Enter the numbers.', 'Read probability, odds and complement.'],
    method: ['Each scenario has its own formula.', 'Odds = P / (1 − P).', 'Complement is 1 − P.'],
    fields: [
      sel('kind', 'Scenario', ['Two dice sum', 'Coin tosses in a row', 'Draw 2 from N', 'At least one 6 in 3 rolls', 'Birthday match in N people', 'Custom P and Q'], 'Two dice sum'),
      n('a', 'Number A', { def: 2, min: 0, step: 1 }),
      n('b', 'Number B', { def: 7, min: 0, step: 1 }),
      n('k', 'Repeat count / draws', { def: 3, min: 1, step: 1 }),
    ],
    compute: (v) => {
      const kind = asSel(v.kind)
      const a = asNum(v.a)
      const b = asNum(v.b)
      const k = asNum(v.k) || 1
      let p = 0
      let work = ''
      if (kind === 'Two dice sum') {
        let hits = 0
        for (let d1 = 1; d1 <= 6; d1++) for (let d2 = 1; d2 <= 6; d2++) if (d1 + d2 === b) hits++
        p = hits / 36
        work = `${hits} of 36 outcomes`
      } else if (kind === 'Coin tosses in a row') {
        p = 1 / Math.pow(2, k)
        work = `1 of 2^${k} = ${num(Math.pow(2, k), 0)} sequences`
      } else if (kind === 'Draw 2 from N') {
        p = k > a ? 0 : (k * (a - k)) / (a * (a - 1))
        work = `P(exactly ${k} of ${a})`
      } else if (kind === 'At least one 6 in 3 rolls') {
        p = 1 - Math.pow(5 / 6, k)
        work = '1 − (5/6)^k'
      } else if (kind === 'Birthday match in N people') {
        let np = 1
        for (let i = 1; i < k; i++) np *= (365 - i) / 365
        p = 1 - np
        work = '1 − Π(365−i)/365'
      } else {
        p = clamp(a, 0, 1)
        work = 'custom probability entered'
      }
      const odds = p < 1 && p > 0 ? p / (1 - p) : p >= 1 ? Infinity : 0
      return [
        sres('Probability', ratio(p * 100, 4) + '%', p >= 0.5 ? T.good : T.neutral, work, p * 100),
        res('As odds', odds === Infinity ? 'certain' : '1 : ' + ratio(1 / odds - 1, 2), T.neutral, 'P / (1 − P)'),
        res('Complement', ratio((1 - p) * 100, 4) + '%', T.neutral, '1 − P'),
        res('In 1000 trials', num(Math.round(p * 1000), 0) + ' expected', T.neutral, 'expected frequency'),
      ]
    },
  },
  {
    id: 'binomial-distribution-calculator',
    name: 'Binomial Distribution Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes binomial probabilities for exactly x, up to x, at least x successes, plus mean, SD and a bar chart.',
    tip: 'Binomial needs fixed trials, two outcomes, constant p. "At least 3 correct" = 1 − P(0) − P(1) − P(2), or use the cumulative row.',
    usage: ['Enter trials, successes and p.', 'Read probability and moments.', 'View the distribution bars.'],
    method: ['P(X=x) = C(n,x) p^x (1−p)^(n−x).', 'Cumulative sums for “at least”.', 'Mean = np, SD = √(np(1−p)).'],
    fields: [n('n', 'Trials n', { def: 10, min: 1, step: 1 }), n('x', 'Successes x', { def: 6, min: 0, step: 1 }), n('p', 'Probability p', { def: 0.5, min: 0, max: 1, step: 0.01 })],
    compute: (v) => {
      const n2 = Math.round(asNum(v.n)) || 1
      const x = clamp(Math.round(asNum(v.x)), 0, n2)
      const p = clamp(asNum(v.p), 0, 1)
      const C = (a: number, b: number): number => {
        if (b < 0 || b > a) return 0
        let r = 1
        for (let i = 0; i < b; i++) r = (r * (a - i)) / (i + 1)
        return Math.round(r)
      }
      const pmf = (k: number) => C(n2, k) * Math.pow(p, k) * Math.pow(1 - p, n2 - k)
      const dist: string[] = []
      const counts: number[] = []
      for (let k = 0; k <= n2; k++) { counts.push(pmf(k)); dist.push(`X=${k}: ${ratio(pmf(k) * 100, 2)}%`) }
      const atLeast = counts.slice(x).reduce((s, c) => s + c, 0)
      return [
        sres(`P(X = ${x})`, ratio(pmf(x) * 100, 4) + '%', T.good, `C(${n2},${x})·${p}^${x}·${(1 - p).toFixed(2)}^${n2 - x}`, pmf(x) * 100),
        sres(`P(X ≥ ${x})`, ratio(atLeast * 100, 4) + '%', T.neutral, 'cumulative tail'),
        sres(`P(X ≤ ${x})`, ratio((1 - atLeast) * 100, 4) + '%', T.neutral, 'complement'),
        res('Mean np / SD', `${ratio(n2 * p, 3)} · ${ratio(Math.sqrt(n2 * p * (1 - p)), 3)}`, T.neutral, 'expected value and spread'),
        docr('Distribution', asciiBars(counts)),
      ]
    },
  },
  {
    id: 'normal-distribution-calculator',
    name: 'Normal Distribution Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Evaluates the standard normal: probability below/above z, z for a percentile, and area between two z-scores.',
    tip: '68–95–99.7 only works for roughly normal data. First check skew and outliers, then apply the bell curve.',
    usage: ['Enter z or a percentile.', 'Optionally add a second boundary.', 'Read areas and the matching z.'],
    method: ['Φ(z) from the normal CDF.', 'Symmetry: Φ(−z) = 1 − Φ(z).', 'Area between = Φ(z₂) − Φ(z₁).'],
    fields: [n('z1', 'Boundary 1 (z)', { def: 1.5, step: 0.1 }), n('z2', 'Boundary 2 (z) — optional', { def: 0, step: 0.1 }), n('mu', 'Mean μ (for raw scores)', { def: 100, step: 1 }), n('sd', 'SD σ', { def: 15, min: 0.01, step: 0.5 })],
    compute: (v) => {
      const z1 = asNum(v.z1)
      const z2 = asNum(v.z2)
      const mu = asNum(v.mu)
      const sd = asNum(v.sd) || 1e-9
      const lo = Math.min(z1, z2)
      const hi = Math.max(z1, z2)
      const between = gaussCdf(hi) - gaussCdf(lo)
      const raw = mu + z1 * sd
      return [
        sres('P(Z ≤ z₁)', ratio(gaussCdf(z1) * 100, 3) + '%', T.good, `Φ(${z1})`, gaussCdf(z1) * 100),
        sres('P(Z ≥ z₁)', ratio((1 - gaussCdf(z1)) * 100, 3) + '%', T.neutral, 'upper tail'),
        sres('Between z₁ and z₂', ratio(between * 100, 3) + '%', T.neutral, `z ${lo} to ${hi}`),
        res('Raw score at z₁', ratio(raw, 3), T.neutral, `μ + zσ = ${mu} + ${z1}×${sd}`),
        res('Percentile bands', 'z = ±1 → 68% · ±2 → 95% · ±3 → 99.7%', T.neutral),
      ]
    },
  },
  {
    id: 'sample-size-calculator',
    name: 'Sample Size Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Determines the required sample size for a proportion given confidence level, margin of error and population.',
    tip: 'Halving the margin of error quadruples the sample. Survey design matters as much as size — non-response can still bias you.',
    usage: ['Set confidence, error and proportion.', 'Enter population size if finite.', 'Read the required n.'],
    method: ['n₀ = z²·p(1−p)/e².', 'Finite population: n = n₀/(1 + (n₀−1)/N).', 'z from the confidence level.'],
    fields: [sel('conf', 'Confidence', ['90%', '95%', '99%'], '95%'), n('e', 'Margin of error (±)', { def: 0.05, min: 0.001, max: 0.5, step: 0.005 }), n('p', 'Expected proportion', { def: 0.5, min: 0.01, max: 0.99, step: 0.01 }), n('pop', 'Population N (0 = infinite)', { def: 0, min: 0, step: 100 })],
    compute: (v) => {
      const zMap: Record<string, number> = { '90%': 1.645, '95%': 1.96, '99%': 2.576 }
      const z = zMap[asSel(v.conf)] || 1.96
      const e = asNum(v.e) || 0.05
      const p = clamp(asNum(v.p), 0.01, 0.99)
      const N = asNum(v.pop)
      const n0 = (z * z * p * (1 - p)) / (e * e)
      const nAdj = N > 0 ? n0 / (1 + (n0 - 1) / N) : n0
      return [
        sres('Required sample size', num(Math.ceil(nAdj), 0), T.good, `${asSel(v.conf)} confidence, ±${ratio(e * 100, 1)}%`),
        res('Before finite correction', num(Math.ceil(n0), 0), T.neutral, 'infinite population formula'),
        res('Non-response buffer', num(Math.ceil(nAdj * 1.2), 0), T.warn, 'add ~20% for refusals'),
        res('Worst-case proportion', `p = 0.5 gives the largest n (${num(Math.ceil((z * z * 0.25) / (e * e)), 0)})`, T.neutral, 'use 0.5 when you have no prior estimate'),
      ]
    },
  },
  {
    id: 'confidence-interval-calculator',
    name: 'Confidence Interval Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a confidence interval for a mean (t-based) or proportion, with margin of error and interpretation text.',
    tip: 'A 95% CI means the method captures the true value in 95% of repeated samples — it is not a 95% probability the true value is in this one interval.',
    usage: ['Choose mean or proportion.', 'Enter sample data and confidence.', 'Read the interval and margin.'],
    method: ['Mean: x̄ ± t·(s/√n).', 'Proportion: p̂ ± z·√(p̂q̂/n).', 'Interpretation text avoids the classic misreading.'],
    fields: [sel('kind', 'Estimate type', ['Mean (t)', 'Proportion (z)'], 'Mean (t)'), txt('data', 'Sample data', 4, '12, 15, 11, 18, 14, 16, 13'), n('conf', 'Confidence %', { def: 95, min: 80, max: 99.9, step: 1 })],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (a.length < 2) return [sres('Interval', 'Need at least 2 values', T.warn)]
      const conf = asNum(v.conf) / 100
      const z = conf >= 0.99 ? 2.576 : conf >= 0.95 ? 1.96 : conf >= 0.9 ? 1.645 : 1.282
      const m = mean(a)
      const s = Math.sqrt(variance(a, true))
      const se = s / Math.sqrt(a.length)
      const t = a.length > 30 ? z : 2.262
      const moE = (asSel(v.kind) === 'Proportion (z)' ? z : t) * se
      return [
        sres('Point estimate', ratio(m, 4), T.good, `x̄ = ${a.length} values`),
        sres('Margin of error', `± ${ratio(moE, 4)}`, T.neutral, 't·(s/√n)'),
        sres(`${num(conf * 100, 0)}% confidence interval`, `${ratio(m - moE, 4)}  to  ${ratio(m + moE, 4)}`, T.good, `[x̄ − t·SE, x̄ + t·SE]`),
        res('Standard error', ratio(se, 4), T.neutral, 's ÷ √n'),
        res('Correct reading', `If repeated, ${num(conf * 100, 0)}% of intervals built this way contain the true mean.`, T.neutral),
      ]
    },
  },
  {
    id: 'hypothesis-test-calculator',
    name: 'Hypothesis Test Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Runs a one-sample t-test from raw data, reporting t, df, p-value, effect size and a decision at the chosen alpha.',
    tip: 'Fail to reject is not proof of no effect. With a small sample, power — not significance — is what limits you.',
    usage: ['Enter the sample data.', 'Set the null mean and alpha.', 'Read t, p and the verdict.'],
    method: ['t = (x̄ − μ₀)/(s/√n).', 'p from the t-distribution with n−1 df.', 'Effect size d = (x̄ − μ₀)/s.'],
    fields: [txt('data', 'Sample data', 4, '78, 82, 85, 80, 88, 84, 79, 86'), n('mu0', 'Null mean μ₀', { def: 75, step: 0.5 }), n('alpha', 'Alpha', { def: 0.05, min: 0.001, max: 0.2, step: 0.005 })],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (a.length < 2) return [sres('Test', 'Need at least 2 values', T.warn)]
      const mu0 = asNum(v.mu0)
      const alpha = asNum(v.alpha) || 0.05
      const m = mean(a)
      const s = Math.sqrt(variance(a, true))
      const se = s / Math.sqrt(a.length)
      const t = (m - mu0) / se
      const df = a.length - 1
      const p = 2 * (1 - studentCdf(Math.abs(t), df))
      const crit = tCrit(df, alpha)
      const d = (m - mu0) / (s || 1e-9)
      return [
        sres('t-statistic', ratio(t, 4), T.good, `(${ratio(m, 3)} − ${mu0}) / ${ratio(se, 4)}`),
        sres('p-value (two-tailed)', ratio(p, 5), p < alpha ? T.warn : T.good, `df = ${df}`),
        sres('Decision', p < alpha ? 'Reject H₀' : 'Fail to reject H₀', p < alpha ? T.warn : T.neutral, `α = ${alpha}, |t| = ${ratio(Math.abs(t), 3)} vs critical ${ratio(crit, 3)}`, p < alpha ? clamp((1 - p / alpha) * 100, 2, 100) : clamp(p / alpha * 100, 2, 100)),
        res('Effect size (Cohen d)', ratio(d, 3), Math.abs(d) > 0.8 ? T.good : Math.abs(d) > 0.5 ? T.neutral : T.warn, Math.abs(d) > 0.8 ? 'large' : Math.abs(d) > 0.5 ? 'medium' : 'small'),
        res('Mean difference', ratio(m - mu0, 4), T.neutral, 'sample minus null'),
      ]
    },
  },
  {
    id: 'chi-square-calculator',
    name: 'Chi-Square Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Runs a chi-square test of independence on a contingency table and reports the statistic, df and association strength.',
    tip: 'Chi-square detects association, not causation. A significant result on a tiny table is easily inflated — check expected counts.',
    usage: ['Enter observed counts in the matrix.', 'Read chi-square, df and p.', 'Check Cramér’s V for strength.'],
    method: ['Expected = row total × column total / n.', 'χ² = Σ(O−E)²/E.', 'df = (rows−1)(cols−1).'],
    fields: [
      sel('shape', 'Table size', ['2 × 2', '2 × 3', '3 × 2', '3 × 3'], '2 × 2'),
      n('m0', 'Cell (1,1)', { def: 30, min: 0, step: 1 }),
      n('m1', 'Cell (1,2)', { def: 20, min: 0, step: 1 }),
      n('m2', 'Cell (2,1)', { def: 25, min: 0, step: 1 }),
      n('m3', 'Cell (2,2)', { def: 45, min: 0, step: 1 }),
      n('m4', 'Cell (2,3)', { def: 15, min: 0, step: 1 }),
    ],
    compute: (v) => {
      const shape = asSel(v.shape)
      const dims: Record<string, [number, number]> = { '2 × 2': [2, 2], '2 × 3': [2, 3], '3 × 2': [3, 2], '3 × 3': [3, 3] }
      const [R, C] = dims[shape] || [2, 2]
      const cells = [asNum(v.m0), asNum(v.m1), asNum(v.m2), asNum(v.m3), asNum(v.m4)]
      const obs: number[][] = []
      for (let r = 0; r < R; r++) { obs.push([]); for (let c = 0; c < C; c++) obs[r].push(cells[r * C + c] || 0) }
      const rowT = obs.map((r) => r.reduce((s, x) => s + x, 0))
      const colT = Array.from({ length: C }, (_, c) => obs.reduce((s, r) => s + r[c], 0))
      const N = rowT.reduce((s, x) => s + x, 0)
      if (N === 0) return [sres('Chi-square', 'No counts entered', T.warn)]
      let chi = 0
      let minExp = Infinity
      const lines: string[] = []
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const e = (rowT[r] * colT[c]) / N
        minExp = Math.min(minExp, e)
        chi += (obs[r][c] - e) * (obs[r][c] - e) / (e || 1)
        lines.push(`(${r + 1},${c + 1}) O=${obs[r][c]} E=${ratio(e, 2)}`)
      }
      const df = (R - 1) * (C - 1)
      const p = 1 - chiSquareCdf(chi, df)
      const cramer = Math.sqrt(chi / (N * Math.min(R - 1, C - 1)))
      return [
        sres('χ² statistic', ratio(chi, 4), T.good, `df = ${df}`),
        sres('p-value', ratio(p, 5), p < 0.05 ? T.warn : T.good, p < 0.05 ? 'significant at α=0.05' : 'not significant'),
        sres('Cramér’s V', ratio(cramer, 4), cramer > 0.3 ? T.good : T.neutral, 'association strength', cramer * 100),
        res('Total N', num(N, 0), T.neutral, `smallest expected cell ${ratio(minExp, 2)}`),
        docr('Observed vs expected', lines.join('\n')),
      ]
    },
  },
  {
    id: 'correlation-calculator',
    name: 'Correlation Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes Pearson and Spearman correlation between two variables, with r², a fitted line and a caution on causation.',
    tip: 'Correlation is not causation. Before trusting r, always check a scatterplot for outliers and curvature.',
    usage: ['Enter paired X and Y values.', 'Compare Pearson with Spearman.', 'Read r, r² and the fit.'],
    method: ['Pearson r on paired data.', 'Spearman uses ranks (robust to outliers).', 'Least-squares slope for the trend line.'],
    fields: [txt('x', 'X values', 4, '2, 4, 6, 8, 10, 12, 14'), txt('y', 'Y values', 4, '3, 7, 8, 12, 11, 16, 15')],
    compute: (v) => {
      const xs = nums(asStr(v.x))
      const ys = nums(asStr(v.y))
      const n2 = Math.min(xs.length, ys.length)
      if (n2 < 3) return [sres('Correlation', 'Need at least 3 pairs', T.warn)]
      const X = xs.slice(0, n2)
      const Y = ys.slice(0, n2)
      const mx = mean(X)
      const my = mean(Y)
      let sxy = 0, sxx = 0, syy = 0
      for (let i = 0; i < n2; i++) { sxy += (X[i] - mx) * (Y[i] - my); sxx += (X[i] - mx) ** 2; syy += (Y[i] - my) ** 2 }
      const r = (sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0)
      const ranks = (arr: number[]) => {
        const idx = arr.map((val, i) => ({ val, i })).sort((a, b) => a.val - b.val)
        const rk = new Array(arr.length)
        let i = 0
        while (i < idx.length) {
          let j = i
          while (j + 1 < idx.length && idx[j + 1].val === idx[i].val) j++
          const avg = (i + j) / 2 + 1
          for (let k2 = i; k2 <= j; k2++) rk[idx[k2].i] = avg
          i = j + 1
        }
        return rk
      }
      const rx = ranks(X)
      const ry = ranks(Y)
      const mrx = mean(rx)
      const mry = mean(ry)
      let sxyr = 0, sxxr = 0, syyr = 0
      for (let i = 0; i < n2; i++) { sxyr += (rx[i] - mrx) * (ry[i] - mry); sxxr += (rx[i] - mrx) ** 2; syyr += (ry[i] - mry) ** 2 }
      const rho = sxxr && syyr ? sxyr / Math.sqrt(sxxr * syyr) : 0
      const slope = sxx ? sxy / sxx : 0
      const intercept = my - slope * mx
      const strength = Math.abs(r) > 0.9 ? 'very strong' : Math.abs(r) > 0.7 ? 'strong' : Math.abs(r) > 0.4 ? 'moderate' : Math.abs(r) > 0.2 ? 'weak' : 'negligible'
      return [
        sres('Pearson r', ratio(r, 4), Math.abs(r) > 0.7 ? T.good : T.neutral, `${strength} ${r >= 0 ? 'positive' : 'negative'} linear relationship`, Math.abs(r) * 100),
        sres('Spearman ρ', ratio(rho, 4), T.neutral, 'rank-based, outlier-resistant'),
        res('r² (explained variance)', ratio(r * r * 100, 2) + '%', r * r > 0.5 ? T.good : T.neutral, 'share of Y variance explained'),
        res('Least-squares line', `y = ${ratio(slope, 4)}x ${intercept >= 0 ? '+' : '−'} ${ratio(Math.abs(intercept), 4)}`, T.neutral, 'trend fit'),
        res('Cautions', 'Correlation ≠ causation. Check the scatterplot and confounders.', T.warn),
      ]
    },
  },
  {
    id: 'regression-calculator',
    name: 'Regression Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Fits a least-squares line, reports slope, intercept, R², standard error and lets you predict a Y for any X.',
    tip: 'R² is the fraction of variance explained — check the residual standard error too, since a high R² can still have useless predictions.',
    usage: ['Enter paired X and Y values.', 'Enter the X to predict.', 'Read the equation, R² and prediction.'],
    method: ['Slope = Σ(x−x̄)(y−ȳ)/Σ(x−x̄)².', 'Intercept = ȳ − slope·x̄.', 'SSE gives the standard error.'],
    fields: [txt('x', 'X values', 4, '1, 2, 3, 4, 5, 6, 7, 8'), txt('y', 'Y values', 4, '2, 4, 5, 7, 8, 10, 11, 13'), n('xp', 'Predict Y at X =', { def: 9, step: 0.5 })],
    compute: (v) => {
      const xs = nums(asStr(v.x))
      const ys = nums(asStr(v.y))
      const n2 = Math.min(xs.length, ys.length)
      if (n2 < 2) return [sres('Regression', 'Need at least 2 pairs', T.warn)]
      const X = xs.slice(0, n2)
      const Y = ys.slice(0, n2)
      const mx = mean(X)
      const my = mean(Y)
      let sxy = 0, sxx = 0
      for (let i = 0; i < n2; i++) { sxy += (X[i] - mx) * (Y[i] - my); sxx += (X[i] - mx) ** 2 }
      const slope = sxx ? sxy / sxx : 0
      const intercept = my - slope * mx
      let sse = 0
      for (let i = 0; i < n2; i++) { const e = Y[i] - (slope * X[i] + intercept); sse += e * e }
      const sst = Y.reduce((s, y) => s + (y - my) ** 2, 0)
      const r2 = sst ? 1 - sse / sst : 0
      const se = n2 > 2 ? Math.sqrt(sse / (n2 - 2)) : 0
      const xp = asNum(v.xp)
      const pred = slope * xp + intercept
      return [
        sres('Regression line', `y = ${ratio(slope, 4)}x ${intercept >= 0 ? '+' : '−'} ${ratio(Math.abs(intercept), 4)}`, T.good, `n = ${n2} pairs`),
        sres('R²', ratio(r2 * 100, 2) + '%', r2 > 0.7 ? T.good : T.neutral, 'variance explained', r2 * 100),
        sres('Residual standard error', ratio(se, 4), se < 1 ? T.good : T.neutral, 'typical prediction error'),
        res(`Prediction at X = ${xp}`, ratio(pred, 4), T.neutral, 'point estimate only — no interval'),
        res('Slope meaning', slope > 0 ? `+${ratio(slope, 3)} of Y per unit X` : `${ratio(slope, 3)} of Y per unit X (decreasing)`, T.neutral),
      ]
    },
  },
  {
    id: 'frequency-distribution-calculator',
    name: 'Frequency Distribution Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a frequency distribution with configurable class width and bins, with relative frequency, cumulative and a text histogram.',
    tip: 'Class width = range ÷ number of classes, rounded up. Aim for roughly 5–20 classes — fewer loses shape, more fragments it.',
    usage: ['Paste the data.', 'Choose the class count.', 'Read the table, cumulative counts and shape.'],
    method: ['Width = (max − min)/classes, rounded up.', 'Each value falls in one bin.', 'Cumulative and relative frequencies sum to 100%.'],
    fields: [txt('data', 'Data set', 4, '12, 15, 18, 22, 25, 30, 28, 33, 35, 40, 42, 48'), n('bins', 'Number of classes', { def: 6, min: 2, max: 20, step: 1 })],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (!a.length) return [sres('Distribution', 'No numbers found', T.warn)]
      const bins = Math.max(2, Math.round(asNum(v.bins)) || 6)
      const { edges, counts } = histBins(a, bins)
      let cum = 0
      const rows: string[] = []
      const rel: number[] = []
      for (let i = 0; i < counts.length; i++) {
        cum += counts[i]
        rel.push((counts[i] / a.length) * 100)
        rows.push(`${ratio(edges[i], 2)}–${ratio(edges[i + 1], 2)}: f=${counts[i]}, cf=${cum}, rel=${ratio(rel[i], 1)}%`)
      }
      const peakIdx = counts.indexOf(Math.max(...counts))
      const shape = counts[0] > counts[counts.length - 1] * 1.5 ? 'right-skewed (positively skewed)' : counts[counts.length - 1] > counts[0] * 1.5 ? 'left-skewed' : peakIdx > counts.length / 2 ? 'left-skewed' : peakIdx < counts.length / 2 ? 'right-skewed' : 'approximately symmetric'
      const width = edges[1] - edges[0]
      return [
        sres('Class width', ratio(width, 3), T.good, `${bins} classes over range ${ratio(Math.max(...a) - Math.min(...a), 2)}`),
        sres('Shape', shape, T.neutral, 'skew decides mean vs median', undefined),
        docr('Frequency table', rows.join('\n')),
        docr('Histogram', asciiBars(counts)),
        res('Total', `${num(a.length, 0)} values, 100%`, T.neutral, 'cumulative ends at the full count'),
      ]
    },
  },
  {
    id: 'outlier-detector',
    name: 'Outlier Detector',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Flags outliers by IQR fences and by z-score thresholds, and reports how much they distort the mean.',
    tip: 'Investigate outliers before removing them — a data-entry typo is removable, a real extreme case is signal.',
    usage: ['Paste the data.', 'Adjust the z threshold.', 'Read flagged points and the mean with/without them.'],
    method: ['IQR fences at 1.5 × IQR.', 'Z-score threshold flags |z| > threshold.', 'Mean impact quantifies the distortion.'],
    fields: [txt('data', 'Data set', 4, '45, 47, 46, 48, 44, 49, 46, 47, 120, 45, 48'), n('zthr', 'Z threshold', { def: 2, min: 1, max: 5, step: 0.1 })],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (a.length < 3) return [sres('Outliers', 'Need at least 3 values', T.warn)]
      const q = quartiles(a)
      const loF = q.q1 - 1.5 * q.iqr
      const hiF = q.q3 + 1.5 * q.iqr
      const zthr = asNum(v.zthr) || 2
      const m = mean(a)
      const s = Math.sqrt(variance(a, true)) || 1e-9
      const iqrOut = a.filter((x) => x < loF || x > hiF)
      const zOut = a.filter((x) => Math.abs((x - m) / s) > zthr)
      const clean = a.filter((x) => !iqrOut.includes(x))
      return [
        sres('IQR outliers', iqrOut.length ? iqrOut.join(', ') : 'none', iqrOut.length ? T.bad : T.good, `fences ${ratio(loF, 2)} – ${ratio(hiF, 2)}`, clamp((iqrOut.length / a.length) * 100, 2, 100)),
        sres(`Z-score outliers (|z| > ${zthr})`, zOut.length ? zOut.join(', ') : 'none', zOut.length ? T.warn : T.good, zOut.map((x) => `${x} (z=${ratio((x - m) / s, 2)})`).join(', ') || 'all within threshold'),
        res('Mean with outliers', ratio(m, 4), T.neutral, 'skewed by extremes'),
        res('Mean without IQR outliers', clean.length ? ratio(mean(clean), 4) : 'n/a', T.neutral, `shifted by ${ratio(m - (clean.length ? mean(clean) : m), 3)}`),
      ]
    },
  },
  {
    id: 'data-descriptor',
    name: 'Data Descriptor',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'A full descriptive-statistics report: centre, spread, shape, rank and a five-number summary in one pass.',
    tip: 'Centre and spread must be reported together — a mean without an SD, or a median without an IQR, is half an answer.',
    usage: ['Paste the data.', 'Read the full summary block.', 'Use it directly in your results section.'],
    method: ['Centre: mean, median, mode.', 'Spread: range, IQR, SD, variance.', 'Shape: skew estimate and quartiles.'],
    fields: [txt('data', 'Data set', 5, '23, 25, 22, 28, 24, 26, 21, 27, 25, 24, 29, 23, 30, 26, 25')],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (!a.length) return [sres('Summary', 'No numbers found', T.warn)]
      const m = mean(a)
      const sd = Math.sqrt(variance(a, true))
      const q = quartiles(a)
      const tally = new Map<number, number>()
      a.forEach((x) => tally.set(x, (tally.get(x) || 0) + 1))
      const top = Math.max(...tally.values())
      const modes = [...tally.entries()].filter((e) => e[1] === top).map((e) => e[0])
      const skew = sd ? (m - median(a)) / sd : 0
      return [
        sres('Centre', `mean ${ratio(m, 3)} · median ${ratio(median(a), 3)}`, T.good, top > 1 ? `mode ${modes.join(', ')} (${top}×)` : 'no mode'),
        sres('Spread', `SD ${ratio(sd, 3)} · IQR ${ratio(q.iqr, 3)} · range ${ratio(Math.max(...a) - Math.min(...a), 3)}`, T.neutral, `variance ${ratio(sd * sd, 4)}`, Math.min(100, Math.round(sd * 10))),
        sres('Shape', Math.abs(skew) < 0.3 ? 'approximately symmetric' : skew > 0 ? 'right-skewed' : 'left-skewed', Math.abs(skew) < 0.3 ? T.good : T.warn, `skew index ${ratio(skew, 3)}`),
        sres('Five-number summary', `${ratio(Math.min(...a), 2)} · ${ratio(q.q1, 2)} · ${ratio(q.q2, 2)} · ${ratio(q.q3, 2)} · ${ratio(Math.max(...a), 2)}`, T.neutral, 'min · Q1 · median · Q3 · max'),
        res('Count', `${num(a.length, 0)} values, sum ${ratio(a.reduce((s, x) => s + x, 0), 3)}`, T.neutral),
      ]
    },
  },
  {
    id: 'random-number-analyzer',
    name: 'Random Number Analyzer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Evaluates a set of numbers for randomness quality: mean, spread, runs, gaps and a uniformity verdict.',
    tip: 'A set of “random” numbers that clusters or repeats is usually biased. Check the gap structure, not just the average.',
    usage: ['Paste the numbers.', 'Read centre, spread and gaps.', 'Check the randomness verdict.'],
    method: ['Centre and spread as usual.', 'Runs: sign changes of the differences.', 'Gap ratio: max gap ÷ mean gap.'],
    fields: [txt('data', 'Numbers to analyse', 5, '7, 3, 9, 1, 8, 4, 9, 2, 6, 5, 9, 3')],
    compute: (v) => {
      const a = nums(asStr(v.data))
      if (a.length < 4) return [sres('Analysis', 'Need at least 4 numbers', T.warn)]
      const m = mean(a)
      const s = Math.sqrt(variance(a, true))
      let runs = 1
      for (let i = 1; i < a.length; i++) if ((a[i] > m) !== (a[i - 1] > m)) runs++
      const uniq = new Set(a).size
      const distinctPct = (uniq / a.length) * 100
      const expectedRuns = (2 * (m / 10) * (1 - m / 10) * (a.length - 1)) || a.length / 2
      const quality = s < 0.5 ? 'Low variation — possibly all one value' : distinctPct < 60 ? 'Repeats are heavy — check for duplication bias' : Math.abs(runs - expectedRuns) > expectedRuns ? 'Few runs — values clump together' : 'Looks well distributed'
      return [
        sres('Centre & spread', `mean ${ratio(m, 3)} · SD ${ratio(s, 3)}`, T.good, `${a.length} values, range ${ratio(Math.max(...a) - Math.min(...a), 2)}`),
        sres('Distinct values', `${uniq} of ${a.length} (${ratio(distinctPct, 1)}%)`, distinctPct >= 60 ? T.good : T.warn, 'repeats indicate a small value space'),
        sres('Runs above/below mean', num(runs, 0), T.neutral, `expected ≈ ${ratio(expectedRuns, 1)}`),
        sres('Verdict', quality, quality.startsWith('Looks') ? T.good : T.warn, 'heuristic randomness check'),
      ]
    },
  },
  {
    id: 'grade-statistics-calculator',
    name: 'Grade Statistics Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Class-performance report for a gradebook: mean, median, spread, letter-grade breakdown and at-risk counts.',
    tip: 'Report the median and the spread with the class mean. A high mean with a huge spread means weak students are hidden inside the average.',
    usage: ['Paste all marks.', 'Set the pass mark.', 'Read the grade distribution and at-risk count.'],
    method: ['Centre and spread computed as usual.', 'Letter bands applied to each mark.', 'At-risk = below the pass mark.'],
    fields: [txt('marks', 'All marks (any separator)', 5, '78, 85, 92, 64, 71, 88, 55, 95, 82, 69, 90, 74, 61, 87'), n('pass', 'Pass mark', { def: 50, min: 0, max: 100, step: 1 })],
    compute: (v) => {
      const a = nums(asStr(v.marks))
      if (!a.length) return [sres('Grade stats', 'No marks found', T.warn)]
      const pass = asNum(v.pass)
      const m = mean(a)
      const sd = Math.sqrt(variance(a, true))
      const bands = [
        { l: 'A (80+)', f: (x: number) => x >= 80 },
        { l: 'B (70–79)', f: (x: number) => x >= 70 && x < 80 },
        { l: 'C (60–69)', f: (x: number) => x >= 60 && x < 70 },
        { l: 'D (50–59)', f: (x: number) => x >= 50 && x < 60 },
        { l: 'F (<50)', f: (x: number) => x < 50 },
      ]
      const dist = bands.map((b) => `${b.l}: ${a.filter(b.f).length} (${ratio((a.filter(b.f).length / a.length) * 100, 1)}%)`).join('\n')
      const atRisk = a.filter((x) => x < pass)
      const dist2 = asciiBars(bands.map((b) => a.filter(b.f).length))
      return [
        sres('Class mean', ratio(m, 2), m >= pass ? T.good : T.warn, `median ${ratio(median(a), 2)} · n = ${a.length}`),
        sres('Spread (SD)', ratio(sd, 3), sd > 20 ? T.warn : T.good, sd > 20 ? 'wide spread — mixed attainment' : 'tight spread', Math.min(100, Math.round(sd * 3))),
        sres('At risk (< pass)', `${atRisk.length} students (${ratio((atRisk.length / a.length) * 100, 1)}%)`, atRisk.length ? T.bad : T.good, atRisk.length ? `lowest ${ratio(Math.min(...a), 1)}, pass ${pass}` : 'all above the pass mark'),
        res('Top / bottom', `${ratio(Math.max(...a), 1)} / ${ratio(Math.min(...a), 1)}`, T.neutral, `range ${ratio(Math.max(...a) - Math.min(...a), 1)}`),
        docr('Grade distribution', dist + '\n\n' + dist2),
      ]
    },
  },
  {
    id: 'data-cleaning-checklist',
    name: 'Data Cleaning Checklist',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Audits a pasted data set for blanks, non-numeric entries, duplicates and extreme gaps, then scores the cleaning job.',
    tip: 'Clean before you analyse. A single text entry typed into a numeric column can silently drop a whole case.',
    usage: ['Paste the raw data.', 'Review the detected issues.', 'Fix sources, then re-paste.'],
    method: ['Entries are split and classified.', 'Blanks, words and duplicates counted.', 'Score = 100 minus weighted issues.'],
    fields: [txt('raw', 'Raw data as pasted', 6, '45, 52, , 61, 45, n/a, 70, 61, 12, 70, 88')],
    compute: (v) => {
      const raw = asStr(v.raw)
      const parts = raw.split(/[\s,;]+/).filter((s) => s.length)
      if (!parts.length) return [sres('Audit', 'Nothing to check', T.warn)]
      const numeric: number[] = []
      const blanks: string[] = []
      const bad: string[] = []
      parts.forEach((p) => {
        if (!p) blanks.push(p)
        else if (/^\d*\.?\d+$/.test(p)) numeric.push(parseFloat(p))
        else bad.push(p)
      })
      const tally = new Map<number, number>()
      numeric.forEach((x) => tally.set(x, (tally.get(x) || 0) + 1))
      const dups = [...tally.entries()].filter((e) => e[1] > 1)
      const gaps: string[] = []
      if (numeric.length > 2) {
        const s = [...numeric].sort((a, b) => a - b)
        const q = quartiles(s)
        for (let i = 1; i < s.length; i++) if (s[i] - s[i - 1] > 1.5 * q.iqr) gaps.push(`${s[i - 1]} → ${s[i]} (${ratio(s[i] - s[i - 1], 1)})`)
      }
      const penalty = blanks.length * 5 + bad.length * 12 + dups.length * 4 + gaps.length * 6
      const score = clamp(100 - penalty, 0, 100)
      return [
        sres('Cleanliness score', `${num(score, 0)} / 100`, score > 85 ? T.good : score > 60 ? T.warn : T.bad, 'deductions for blanks, non-numeric, duplicates, gaps', score),
        sres('Usable values', `${numeric.length} of ${parts.length}`, numeric.length === parts.length ? T.good : T.warn, `${ratio((numeric.length / parts.length) * 100, 1)}% parsed as numbers`),
        res('Non-numeric entries', bad.length ? bad.join(', ') : 'none', bad.length ? T.bad : T.good, 'words, "n/a", stray symbols'),
        res('Duplicates', dups.length ? dups.map((e) => `${e[0]}×${e[1]}`).join(', ') : 'none', dups.length ? T.warn : T.good, 'legitimate repeats or copy errors'),
        res('Large gaps', gaps.length ? gaps.join('; ') : 'none', gaps.length ? T.warn : T.good, 'beyond 1.5 × IQR'),
      ]
    },
  },
]

function studentCdf(t: number, df: number): number {
  const x = df / (df + t * t)
  const ib = 0.5 * betaInc(df / 2, 0.5, x)
  return t > 0 ? 1 - ib : ib
}

function lnGamma(z: number): number {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -5.395239524953081e-6]
  let x = z
  let y = z
  let tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < 6; j++) ser += g[j] / ++y
  return -tmp + Math.log((2.5066282746310005 * ser) / x)
}

function betaInc(a: number, b: number, x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const lbeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b)
  const front = (Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta)) / a
  let f = 1
  let c = 1
  let d = 0
  for (let i = 0; i <= 250; i++) {
    const m = Math.floor(i / 2)
    let term: number
    if (i % 2 === 0) term = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m))
    else term = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1))
    d = 1 + term * d
    if (Math.abs(d) < 1e-30) d = 1e-30
    d = 1 / d
    c = 1 + term / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    const cd = c * d
    f *= cd
    if (Math.abs(1 - cd) < 1e-10) break
  }
  return front * (f - 1)
}

function tCrit(df: number, alpha: number): number {
  let lo = 0
  let hi = 100
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (studentCdf(mid, df) < 1 - alpha / 2) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

function chiSquareCdf(x: number, df: number): number {
  if (x <= 0) return 0
  return clamp(gammaP(df / 2, x / 2), 0, 1)
}

function gammaP(a: number, x: number): number {
  if (x < 0) return 0
  if (x < a + 1) {
    let sum = 1 / a
    let term = sum
    for (let n = 1; n < 500; n++) {
      term *= x / (a + n)
      sum += term
      if (Math.abs(term) < Math.abs(sum) * 1e-12) break
    }
    return clamp(1 - sum * Math.exp(-x + a * Math.log(x) - lnGamma(a)), 0, 1)
  }
  let bb = x + 1 - a
  let cc = 1 / 1e-30
  let dd = 1 / bb
  let h = dd
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a)
    bb += 2
    dd = an * dd + bb
    if (Math.abs(dd) < 1e-30) dd = 1e-30
    cc = bb + an / cc
    if (Math.abs(cc) < 1e-30) cc = 1e-30
    dd = 1 / dd
    const del = dd * cc
    h *= del
    if (Math.abs(del - 1) < 1e-12) break
  }
  return clamp(Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h, 0, 1)
}
