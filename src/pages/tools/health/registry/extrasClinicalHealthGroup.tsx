import { Stethoscope, FlaskConical, Wind, Droplet, Activity, Gauge, HeartPulse, Timer, Waves, Scale } from 'lucide-react'
import type { HealthToolConfig } from '../HealthGenericTool'
import {
  sofaScore, apache2Simplified, serumOsmolality, rdwBand, nlrRatio, agrRatio,
} from '../../../../lib/health/clinicalExtra.ts'
import {
  fev1FvcRatio, fvcPredicted, sfRatio, borgBand, mrcGrade, pcrBand, uacrBand, fenaPct,
} from '../../../../lib/health/kidneyResp.ts'
import { cholesterolMmolToMg, cholesterolMgToMmol } from '../../../../lib/health/labs.ts'

const MS = 'Medical Scores & Clinical'
const BT = 'Blood Tests & Lab'
const RS = 'Respiratory Health'
const KD = 'Kidney & Renal'

export const extrasClinicalHealthGroup: Record<string, HealthToolConfig> = {}

const SOFA_OPTS = [
  { value: '0', label: '0 - normal' },
  { value: '1', label: '1 - mild derangement' },
  { value: '2', label: '2 - moderate derangement' },
  { value: '3', label: '3 - severe derangement' },
  { value: '4', label: '4 - extreme derangement' },
]

extrasClinicalHealthGroup['sofa-score'] = {
  id: 'sofa-score',
  title: 'SOFA Score Calculator',
  description: 'A full SOFA scoring walkthrough across six organ systems (educational).',
  icon: <Stethoscope className="h-6 w-6" />,
  breadcrumb: 'Health / Medical Scores & Clinical',
  instruction: 'Pick the 0-4 score for each of the six systems.',
  sub: MS,
  emoji: '🏥',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'resp', label: 'Respiratory (PaO2/FiO2)', type: 'select', options: SOFA_OPTS },
    { key: 'coag', label: 'Coagulation (platelets)', type: 'select', options: SOFA_OPTS },
    { key: 'liver', label: 'Liver (bilirubin)', type: 'select', options: SOFA_OPTS },
    { key: 'cardio', label: 'Cardiovascular (MAP / pressors)', type: 'select', options: SOFA_OPTS },
    { key: 'cns', label: 'CNS (GCS)', type: 'select', options: SOFA_OPTS },
    { key: 'renal', label: 'Renal (creatinine / urine output)', type: 'select', options: SOFA_OPTS },
  ],
  compute: (values) => {
    const r = sofaScore([values.resp ?? NaN, values.coag ?? NaN, values.liver ?? NaN, values.cardio ?? NaN, values.cns ?? NaN, values.renal ?? NaN])
    if (r === null) return null
    return { title: 'SOFA total', value: r.total.toFixed(0), unit: '/24', tone: r.total < 2 ? 'good' : r.total <= 3 ? 'ok' : 'warn', badge: r.band, note: 'Each system scores 0-4. Rising totals track multi-organ dysfunction - a hospital tool, used here purely for education.' }
  },
  howItWorks: [
    { title: 'Score six systems', text: 'Resp, clotting, liver, heart, brain, kidney.' },
    { title: 'Sum them', text: 'Total out of 24.' },
    { title: 'Read the trend', text: 'Changes matter more than one point.' },
  ],
  tips: [
    'Day-to-day progression is what clinicians watch.',
    'This is not a self-diagnosis tool.',
    'Crisis symptoms = emergency care, not a score.',
  ],
}

extrasClinicalHealthGroup['apache2-score'] = {
  id: 'apache2-score',
  title: 'APACHE II (Simplified) Score',
  description: 'A simplified point estimate of ICU-grade physiology scoring.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Medical Scores & Clinical',
  instruction: 'Enter the simplified inputs - intended for educational reference only.',
  sub: MS,
  emoji: '🩺',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'age', label: 'Age (years)', type: 'number', min: 16, max: 90, placeholder: 'e.g. 58' },
    { key: 'chronic', label: 'Severe chronic organ failure', type: 'bool' },
    { key: 'gcs', label: 'GCS score (3-15)', type: 'number', min: 3, max: 15, placeholder: 'e.g. 12' },
    { key: 'hr', label: 'Heart rate (bpm)', type: 'number', min: 20, max: 300, placeholder: 'e.g. 110' },
    { key: 'map', label: 'Mean arterial pressure (mmHg)', type: 'number', min: 20, max: 250, placeholder: 'e.g. 85' },
    { key: 'temp', label: 'Temperature (°C)', type: 'number', min: 30, max: 45, step: 0.1, placeholder: 'e.g. 37.5' },
  ],
  compute: (values) => {
    const s = apache2Simplified(values.age ?? NaN, values.chronic === 1, values.gcs ?? NaN, values.hr ?? NaN, values.map ?? NaN, values.temp ?? NaN)
    if (s === null) return null
    return { title: 'Simplified APACHE II', value: s.toFixed(0), unit: 'points', tone: s < 10 ? 'good' : s < 20 ? 'ok' : 'warn', badge: s < 10 ? 'Low-moderate range' : s < 20 ? 'Moderate range' : 'High range - critical care territory', note: 'A heavily simplified educational total. Real APACHE II uses lab values, chronic disease and admission category - your ICU team computes it.' }
  },
  howItWorks: [
    { title: 'Enter inputs', text: 'Age, GCS, vitals, chronic status.' },
    { title: 'Add point tables', text: 'Physiology scored against norms.' },
    { title: 'Read the total', text: 'Higher = sicker physiology.' },
  ],
  tips: [
    'Hospital-scope tool - not for home triage.',
    'Trends beat single snapshots.',
    'Trust on-scene professionals over any app score.',
  ],
}

extrasClinicalHealthGroup['serum-osmolality'] = {
  id: 'serum-osmolality',
  title: 'Serum Osmolality Calculator',
  description: 'Estimate calculated serum osmolality from three common labs.',
  icon: <FlaskConical className="h-6 w-6" />,
  breadcrumb: 'Health / Medical Scores & Clinical',
  instruction: 'Enter sodium, glucose and BUN from a recent lab panel.',
  sub: MS,
  emoji: '🧪',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'na', label: 'Sodium (mEq/L)', type: 'number', min: 100, max: 180, placeholder: 'e.g. 140' },
    { key: 'glu', label: 'Glucose (mg/dL)', type: 'number', min: 20, max: 1200, placeholder: 'e.g. 180' },
    { key: 'bun', label: 'BUN (mg/dL)', type: 'number', min: 1, max: 300, placeholder: 'e.g. 60' },
  ],
  compute: (values) => {
    const o = serumOsmolality(values.na ?? NaN, values.glu ?? NaN, values.bun ?? NaN)
    if (o === null) return null
    return { title: 'Serum osmolality', value: o.osm.toFixed(0), unit: 'mOsm/kg', tone: o.band === 'Typical range' ? 'good' : o.band === 'High osmolality' ? 'warn' : 'ok', badge: o.band, note: 'Formula: 2×Na + glucose/18 + BUN/2.8. Typical is about 275-295 mOsm/kg. Use with your care team - never to self-diagnose.' }
  },
  howItWorks: [
    { title: 'Pull the labs', text: 'Na, glucose, BUN.' },
    { title: 'Apply the formula', text: '2×Na plus the two ratios.' },
    { title: 'Read the band', text: '275-295 mOsm/kg typical.' },
  ],
  tips: [
    'High osmolality is common with very high sugar.',
    'The same labs feed the anion gap and other checks.',
    'Lab comments always trump this estimate.',
  ],
}

extrasClinicalHealthGroup['cholesterol-unit-converter'] = {
  id: 'cholesterol-unit-converter',
  title: 'Cholesterol Unit Converter',
  description: 'Convert cholesterol readings between mg/dL and mmol/L.',
  icon: <FlaskConical className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter a value and pick the direction to convert.',
  sub: BT,
  emoji: '🧪',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'value', label: 'Cholesterol value', type: 'number', min: 0.1, max: 1000, step: 0.1, placeholder: 'e.g. 200' },
    { key: 'dir', label: 'Convert from', type: 'select', options: [{ value: 'to-mmol', label: 'mg/dL to mmol/L' }, { value: 'to-mg', label: 'mmol/L to mg/dL' }] },
  ],
  compute: (values) => {
    const v = values.value ?? NaN
    if (!Number.isFinite(v) || v <= 0) return null
    if (values.dir === 2) {
      const out = cholesterolMmolToMg(v)
      if (out === null) return null
      return { title: 'Converted', value: out.toFixed(0), unit: 'mg/dL', tone: 'ok', badge: 'mmol/L to mg/dL', note: 'Factor used: 38.67 mg/dL per mmol/L (applies to TC, LDL and HDL).' }
    }
    const out = cholesterolMgToMmol(v)
    if (out === null) return null
    return { title: 'Converted', value: out.toFixed(2), unit: 'mmol/L', tone: 'ok', badge: 'mg/dL to mmol/L', note: 'Factor used: 1 mg/dL = 0.0259 mmol/L.' }
  },
  howItWorks: [
    { title: 'Enter the value', text: 'Lab result, either unit.' },
    { title: 'Pick direction', text: 'mg/dL to mmol/L or back.' },
    { title: 'Read the answer', text: 'Instant conversion.' },
  ],
  tips: [
    'The US uses mg/dL; most of the world uses mmol/L.',
    'Same factor works for TC, LDL and HDL.',
    'Add the number to your lab sheet for cross-checks.',
  ],
}

extrasClinicalHealthGroup['hemoglobin-unit-converter'] = {
  id: 'hemoglobin-unit-converter',
  title: 'Hemoglobin Unit Converter',
  description: 'Convert hemoglobin between g/dL and mmol/L.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter a value and pick the direction to convert.',
  sub: BT,
  emoji: '🩸',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'value', label: 'Hemoglobin value', type: 'number', min: 0.1, max: 500, step: 0.1, placeholder: 'e.g. 14.0' },
    { key: 'dir', label: 'Convert from', type: 'select', options: [{ value: 'gdl-to-mmol', label: 'g/dL to mmol/L' }, { value: 'mmol-to-gdl', label: 'mmol/L to g/dL' }] },
  ],
  compute: (values) => {
    const v = values.value ?? NaN
    if (!Number.isFinite(v) || v <= 0) return null
    if (values.dir === 1) {
      const out = v * 0.6206
      return { title: 'Converted', value: out.toFixed(1), unit: 'mmol/L', tone: 'ok', badge: 'g/dL to mmol/L', note: 'Factor used: 1 g/dL \u2248 0.62 mmol/L. Adult typical range ~13-17 g/dL (8.1-10.5 mmol/L).' }
    }
    const out = v / 0.6206
    return { title: 'Converted', value: out.toFixed(1), unit: 'g/dL', tone: 'ok', badge: 'mmol/L to g/dL', note: 'Factor used: 1 mmol/L \u2248 1.61 g/dL.' }
  },
  howItWorks: [
    { title: 'Enter the value', text: 'From your CBC report.' },
    { title: 'Pick direction', text: 'g/dL to mmol/L or back.' },
    { title: 'Read the answer', text: 'Converted on the spot.' },
  ],
  tips: [
    'Most reports already state both units.',
    'Trends across visits beat a single reading.',
    'Ask your lab sheet to stay consistent in one unit.',
  ],
}

extrasClinicalHealthGroup['rdw-check'] = {
  id: 'rdw-check',
  title: 'RDW-CV Check',
  description: 'Interpret red-cell distribution width from your CBC lab result.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter your RDW-CV percentage from the CBC.',
  sub: BT,
  emoji: '🔴',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'rdw', label: 'RDW-CV (%)', type: 'number', min: 10, max: 30, step: 0.1, placeholder: 'e.g. 13.5' },
  ],
  compute: (values) => {
    const v = values.rdw ?? NaN
    const b = rdwBand(v)
    if (b === null) return null
    return { title: 'RDW reading', value: v.toFixed(1), unit: '%', tone: v <= 14.5 ? 'good' : 'ok', badge: b, note: 'RDW measures how varied red-cell sizes are. High RDW often appears during deficiency-tracking (iron/B12) work-ups - one clue, not a verdict.' }
  },
  howItWorks: [
    { title: 'Find RDW on CBC', text: 'Often listed as RDW-CV.' },
    { title: 'Compare to 14.5%', text: 'Typical upper cut.' },
    { title: 'Read the clue', text: 'High = more size variation.' },
  ],
  tips: [
    'Pair RDW with MCV for the classic pattern.',
    'One high RDW alone is never a diagnosis.',
    'Review trends with your provider alongside ferritin.',
  ],
}

extrasClinicalHealthGroup['nlr-check'] = {
  id: 'nlr-check',
  title: 'Neutrophil-Lymphocyte Ratio',
  description: 'Compute NLR from neutrophils and lymphocytes in your CBC.',
  icon: <HeartPulse className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter the absolute neutrophil and lymphocyte counts (10^9/L).',
  sub: BT,
  emoji: '🧫',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'anc', label: 'Neutrophils (10^9/L)', type: 'number', min: 0.1, max: 100, step: 0.1, placeholder: 'e.g. 6' },
    { key: 'alc', label: 'Lymphocytes (10^9/L)', type: 'number', min: 0.1, max: 200, step: 0.1, placeholder: 'e.g. 2' },
  ],
  compute: (values) => {
    const n = nlrRatio(values.anc ?? NaN, values.alc ?? NaN)
    if (n === null) return null
    return { title: 'NLR', value: n.ratio.toFixed(1), unit: '', tone: n.ratio < 3 ? 'good' : n.ratio <= 5 ? 'ok' : 'warn', badge: n.band, note: 'NLR = neutrophils ÷ lymphocytes. It tracks with systemic stress and inflammation in research - an educational window into your review.' }
  },
  howItWorks: [
    { title: 'Locate both counts', text: 'Absolute values, not %.' },
    { title: 'Divide', text: 'Neutrophils ÷ lymphocytes.' },
    { title: 'Read the ratio', text: 'Rises with inflammation.' },
  ],
  tips: [
    'Stress and infection shift NLR quickly.',
    'Not a diagnostic number by itself.',
    'Same blood draw as other labs - no extra test.',
  ],
}

extrasClinicalHealthGroup['agr-check'] = {
  id: 'agr-check',
  title: 'Albumin-Globulin Ratio',
  description: 'Derive the A/G ratio from albumin and total protein.',
  icon: <Waves className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter albumin and total protein in g/dL.',
  sub: BT,
  emoji: '🧪',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'alb', label: 'Albumin (g/dL)', type: 'number', min: 1, max: 6, step: 0.1, placeholder: 'e.g. 4' },
    { key: 'tp', label: 'Total protein (g/dL)', type: 'number', min: 3, max: 12, step: 0.1, placeholder: 'e.g. 7' },
  ],
  compute: (values) => {
    const a = agrRatio(values.alb ?? NaN, values.tp ?? NaN)
    if (a === null) return null
    return { title: 'A/G ratio', value: a.ratio.toFixed(2), unit: '', tone: a.ratio >= 1 && a.ratio <= 2.5 ? 'good' : 'ok', badge: a.band, note: 'A/G = albumin ÷ (total protein − albumin). Typical is ~1-2.5. A reversed (<1) ratio leans toward globulin dominance - a lab clue for your doctor.' }
  },
  howItWorks: [
    { title: 'Enter two labs', text: 'Albumin + total protein.' },
    { title: 'Globulin = total − albumin', text: 'Implied subtraction.' },
    { title: 'Divide', text: 'Albumin ÷ globulin.' },
  ],
  tips: [
    'Reversals are non-specific - many causes.',
    'Pair with protein electrophoresis for detail.',
    'Let your clinician put the number in context.',
  ],
}

extrasClinicalHealthGroup['fev1-fvc-ratio'] = {
  id: 'fev1-fvc-ratio',
  title: 'FEV1/FVC Ratio',
  description: 'Compute the spirometry airway-obstruction ratio from two values.',
  icon: <Wind className="h-6 w-6" />,
  breadcrumb: 'Health / Respiratory Health',
  instruction: 'Enter FEV1 and FVC in litres from a spirometry report.',
  sub: RS,
  emoji: '🫁',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'fev1', label: 'FEV1 (L)', type: 'number', min: 0.1, max: 8, step: 0.01, placeholder: 'e.g. 2.5' },
    { key: 'fvc', label: 'FVC (L)', type: 'number', min: 0.1, max: 9, step: 0.01, placeholder: 'e.g. 3.5' },
  ],
  compute: (values) => {
    const r = fev1FvcRatio(values.fev1 ?? NaN, values.fvc ?? NaN)
    if (r === null) return null
    return { title: 'FEV1/FVC', value: r.ratio.toFixed(2), unit: '', tone: r.ratio >= 0.7 ? 'good' : 'warn', badge: r.band, note: 'Below 0.70 raises the classic obstructive pattern flag (asthma/COPD usual suspects). A single number never sets a diagnosis - spirometry interpretation needs your clinician.' }
  },
  howItWorks: [
    { title: 'Find the values', text: 'FEV1 and FVC in litres.' },
    { title: 'Divide', text: 'FEV1 ÷ FVC.' },
    { title: 'Compare to 0.70', text: 'Obstruction flag under it.' },
  ],
  tips: [
    'Best-effort blows matter - technique is everything.',
    'Post-bronchodilator changes are the gold test.',
    'Bring your full spirometry sheet to the consult.',
  ],
}

extrasClinicalHealthGroup['fvc-predicted'] = {
  id: 'fvc-predicted',
  title: 'FVC Predicted & % Achieved',
  description: 'Estimate an expected FVC from age, height and sex, then compare your measured value.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Respiratory Health',
  instruction: 'Enter height, age and sex, plus your measured FVC if you have one.',
  sub: RS,
  emoji: '📊',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'height', label: 'Height (cm)', type: 'number', min: 120, max: 220, placeholder: 'e.g. 170' },
    { key: 'age', label: 'Age (years)', type: 'number', min: 15, max: 90, placeholder: 'e.g. 45' },
    { key: 'female', label: 'Female', type: 'bool' },
    { key: 'measured', label: 'Measured FVC (L) - optional', type: 'number', min: 0.1, max: 9, step: 0.01, placeholder: 'e.g. 3.8' },
  ],
  compute: (values) => {
    const p = fvcPredicted(values.height ?? NaN, values.age ?? NaN, values.female === 1)
    if (p === null) return null
    if (values.measured === null) return { title: 'Predicted FVC', value: p.predicted.toFixed(2), unit: 'L', tone: 'ok', badge: 'Population estimate', note: p.band + ' Your lab report\u2019s own predicted reference supersedes this.' }
    const pct = Math.round((values.measured / p.predicted) * 100)
    return { title: 'Measured vs predicted', value: `${pct}`, unit: '%', tone: pct >= 80 ? 'good' : pct >= 60 ? 'ok' : 'warn', badge: pct >= 80 ? 'Within typical range (≥80%)' : pct >= 60 ? 'Mild restriction signal' : 'Moderate-severe gap', note: `Predicted ~${p.predicted.toFixed(2)} L; you measured ${values.measured.toFixed(2)} L. Trend and symptoms, not one number, guide your clinician.` }
  },
  howItWorks: [
    { title: 'Enter basics', text: 'Height, age, sex.' },
    { title: 'Get the estimate', text: 'Formulaic normal FVC.' },
    { title: 'Compare measured', text: '% of predicted.' },
  ],
  tips: [
    '80% of predicted is a common reference line.',
    'Prediction formulas are population averages.',
    'Restriction is one pattern - your team maps it.',
  ],
}

extrasClinicalHealthGroup['sf-ratio'] = {
  id: 'sf-ratio',
  title: 'SpO2/FiO2 (S/F) Ratio',
  description: 'Estimate oxygenation from pulse oximetry and inspired oxygen.',
  icon: <HeartPulse className="h-6 w-6" />,
  breadcrumb: 'Health / Respiratory Health',
  instruction: 'Enter pulse-ox SpO2 (%) and the oxygen you are receiving (%).',
  sub: RS,
  emoji: '🫁',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'spo2', label: 'SpO2 (%)', type: 'number', min: 50, max: 100, placeholder: 'e.g. 96' },
    { key: 'fio2', label: 'FiO2 (%)', type: 'number', min: 21, max: 100, placeholder: 'e.g. 21' },
  ],
  compute: (values) => {
    const s = sfRatio(values.spo2 ?? NaN, values.fio2 ?? NaN)
    if (s === null) return null
    return { title: 'S/F ratio', value: s.sf.toFixed(0), unit: '', tone: s.sf >= 315 ? 'good' : s.sf >= 235 ? 'ok' : s.sf >= 175 ? 'warn' : 'danger', badge: s.band, note: 'Oxygenation falls as the ratio drops. Low S/F means the lungs are working harder to oxygenate - a useful trend to bring to your care team.' }
  },
  howItWorks: [
    { title: 'Read SpO2', text: 'Pulse-ox percentage.' },
    { title: 'Know FiO2', text: 'Room air = 21%.' },
    { title: 'Divide', text: 'S/F = SpO2 ÷ FiO2 fraction.' },
  ],
  tips: [
    'Room-air SpO2 under 94% is worth a call.',
    'Nail polish and cold hands skew pulse-ox.',
    'Trends across hours beat single readings.',
  ],
}

extrasClinicalHealthGroup['borg-scale'] = {
  id: 'borg-scale',
  title: 'Borg Scale (Dyspnea)',
  description: 'Use the classic 0-10 breathlessness scale to rate how hard breathing feels.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Respiratory Health',
  instruction: 'Pick the number that matches how breathless you feel right now.',
  sub: RS,
  emoji: '😮‍💨',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'score', label: 'Breathlessness right now', type: 'select', options: [{ value: '0', label: '0 - nothing at all' }, { value: '1', label: '1 - very light' }, { value: '2', label: '2 - light' }, { value: '3', label: '3 - moderate' }, { value: '4', label: '4 - somewhat severe' }, { value: '5', label: '5 - severe' }, { value: '6', label: '6 - very severe' }, { value: '7', label: '7 - very, very severe' }, { value: '8', label: '8 - near maximal' }, { value: '9', label: '9 - almost maximal' }, { value: '10', label: '10 - maximal' }] },
  ],
  compute: (values) => {
    const b = borgBand(values.score ?? NaN)
    if (b === null) return null
    return { title: 'Borg level', value: b, unit: '', tone: (values.score ?? 0) <= 2 ? 'good' : (values.score ?? 0) <= 4 ? 'ok' : (values.score ?? 0) <= 6 ? 'warn' : 'danger', badge: `Score ${values.score}/10`, note: 'The Borg CR-10 is a standard bedside scale. Rating breathlessness consistently lets you and your team see how it changes across exercises or days.' }
  },
  howItWorks: [
    { title: 'Stop and assess', text: 'How hard is breathing now?' },
    { title: 'Match a number', text: '0-10 descriptors.' },
    { title: 'Repeat over time', text: 'Consistency reveals trends.' },
  ],
  tips: [
    'Rate before and after exertion to see shift.',
    'Sudden 4+ jumps deserve professional contact.',
    'Pair the score with SpO2 when you have it.',
  ],
}

extrasClinicalHealthGroup['mrc-dyspnea-scale'] = {
  id: 'mrc-dyspnea-scale',
  title: 'MRC Dyspnea Grade',
  description: 'Grade breathlessness by what activity leaves you short of breath.',
  icon: <Wind className="h-6 w-6" />,
  breadcrumb: 'Health / Respiratory Health',
  instruction: 'Pick the statement that best matches your everyday breathing.',
  sub: RS,
  emoji: '🪜',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'level', label: 'Which fits you best?', type: 'select', options: [{ value: '1', label: 'No breathlessness except strenuous exercise' }, { value: '2', label: 'Short of breath hurrying or on a slight hill' }, { value: '3', label: 'Walk slower than peers on level ground' }, { value: '4', label: 'Stop for breath after ~100 m on the level' }, { value: '5', label: 'Too breathless to leave the house / dressing' }] },
  ],
  compute: (values) => {
    const g = mrcGrade(values.level ?? 0)
    if (g === null) return null
    return { title: 'MRC grade', value: `${values.level}/5`, unit: '', tone: (values.level ?? 0) <= 2 ? 'good' : (values.level ?? 0) === 3 ? 'ok' : 'warn', badge: g, note: (values.level ?? 0) >= 3 ? 'Grade 3+ means daily activities are being limited - a solid reason to book a breathing check-up.' : 'Activities are mostly protected - keep up the movement without pushing through breathlessness.' }
  },
  howItWorks: [
    { title: 'Think of everyday tasks', text: 'Walking, hills, dressing.' },
    { title: 'Pick the closest', text: 'Grade 1-5.' },
    { title: 'Read the meaning', text: 'Higher = more limitation.' },
  ],
  tips: [
    'Grade 3+ often triggers an official assessment.',
    'Keep a two-week log before your appointment.',
    'Exercise programs help even at higher grades.',
  ],
}

extrasClinicalHealthGroup['pcr-check'] = {
  id: 'pcr-check',
  title: 'Protein-Creatinine Ratio',
  description: 'Estimate 24-hour urine protein load from a spot ratio.',
  icon: <Droplet className="h-6 w-6" />,
  breadcrumb: 'Health / Kidney & Renal',
  instruction: 'Enter urine protein and creatinine from the same spot sample.',
  sub: KD,
  emoji: '🧂',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'prot', label: 'Urine protein (mg/dL)', type: 'number', min: 0, max: 5000, placeholder: 'e.g. 30' },
    { key: 'cr', label: 'Urine creatinine (mg/dL)', type: 'number', min: 1, max: 1000, placeholder: 'e.g. 100' },
  ],
  compute: (values) => {
    const p = pcrBand(values.prot ?? NaN, values.cr ?? NaN)
    if (p === null) return null
    return { title: 'PCR', value: p.pcr.toFixed(0), unit: 'mg/g', tone: p.pcr < 150 ? 'good' : p.pcr < 500 ? 'ok' : 'warn', badge: p.band, note: 'Spot protein/creatinine correlates with the 24-hour gram total. Trending it across visits is what your nephrology team really watches.' }
  },
  howItWorks: [
    { title: 'Spot sample', text: 'Same void, both values.' },
    { title: 'Compare units', text: 'mg/dL ÷ mg/dL × 1000.' },
    { title: 'Read mg/g', text: '<150 typical; >500 high.' },
  ],
  tips: [
    'First-morning void is the most consistent.',
    'Infection in the urine raises protein false.',
    'Consistency across samples beats one number.',
  ],
}

extrasClinicalHealthGroup['uacr-check'] = {
  id: 'uacr-check',
  title: 'Albumin-Creatinine Ratio (UACR)',
  description: 'Calculate the urine albumin-creatinine ratio used in kidney staging.',
  icon: <Scale className="h-6 w-6" />,
  breadcrumb: 'Health / Kidney & Renal',
  instruction: 'Enter urine albumin and creatinine from the spot sample.',
  sub: KD,
  emoji: '🧪',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'alb', label: 'Urine albumin (mg/L)', type: 'number', min: 0, max: 5000, placeholder: 'e.g. 20' },
    { key: 'cr', label: 'Urine creatinine (mg/dL)', type: 'number', min: 1, max: 1000, placeholder: 'e.g. 100' },
  ],
  compute: (values) => {
    const u = uacrBand(values.alb ?? NaN, values.cr ?? NaN)
    if (u === null) return null
    return { title: 'UACR', value: u.mgG.toFixed(0), unit: 'mg/g', tone: u.mgG < 30 ? 'good' : u.mgG < 300 ? 'ok' : 'warn', badge: u.band, note: 'UACR is part of CKD staging (A1/A2/A3). Under 30 mg/g is the low-albumin band; persistent higher values need your clinician\u2019s follow-up plan.' }
  },
  howItWorks: [
    { title: 'Read two values', text: 'Albumin (mg/L) + creatinine (mg/dL).' },
    { title: 'Convert and divide', text: '×100 to reach mg/g.' },
    { title: 'Map to A-band', text: 'A1 <30, A2 30-300, A3 >300.' },
  ],
  tips: [
    'Two abnormal spots in 3 months = official A-band.',
    'Exercise or high-protein meals can bump it once.',
    'Pair with eGFR for the full kidney picture.',
  ],
}

extrasClinicalHealthGroup['fena-check'] = {
  id: 'fena-check',
  title: 'Fractional Excretion of Sodium',
  description: 'Compute FENa from paired blood and urine sodium and creatinine.',
  icon: <Timer className="h-6 w-6" />,
  breadcrumb: 'Health / Kidney & Renal',
  instruction: 'Enter paired urine and serum sodium and creatinine values.',
  sub: KD,
  emoji: '⚗️',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'un', label: 'Urine sodium (mEq/L)', type: 'number', min: 0, max: 400, placeholder: 'e.g. 20' },
    { key: 'sn', label: 'Serum sodium (mEq/L)', type: 'number', min: 100, max: 180, placeholder: 'e.g. 140' },
    { key: 'uc', label: 'Urine creatinine (mg/dL)', type: 'number', min: 0.1, max: 1000, placeholder: 'e.g. 100' },
    { key: 'sc', label: 'Serum creatinine (mg/dL)', type: 'number', min: 0.1, max: 20, step: 0.1, placeholder: 'e.g. 1' },
  ],
  compute: (values) => {
    const f = fenaPct(values.un ?? NaN, values.sn ?? NaN, values.uc ?? NaN, values.sc ?? NaN)
    if (f === null) return null
    return { title: 'FENa', value: f.fena.toFixed(1), unit: '%', tone: f.fena < 1 ? 'ok' : f.fena <= 2 ? 'ok' : 'warn', badge: f.band, note: 'FENa = (U-Na × S-Cr) ÷ (S-Na × U-Cr) × 100. A classic acute-kidney-injury interpreter - an educational read best left to your nephrology team.' }
  },
  howItWorks: [
    { title: 'Collect paired labs', text: 'Urine + blood same time.' },
    { title: 'Cross-multiply', text: 'UNa×SCr over SNa×UCr.' },
    { title: 'Read the %', text: '<1 vs >2 patterns.' },
  ],
  tips: [
    'Diuretics scramble the FENa signal.',
    'Always grab urine and blood on the same draw.',
    'Use it as discussion fuel, not a conclusion.',
  ],
}