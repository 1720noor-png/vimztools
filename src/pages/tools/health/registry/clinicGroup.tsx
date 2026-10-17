import { Brain, ClipboardList, Smile, Flame, Server, Waves, Shield, Activity, Droplets, Droplet, TestTube, Beaker, Microscope, Gauge, PlusCircle, Ratio, Wind } from 'lucide-react'
import type { ReactNode } from 'react'
import type { HealthToolConfig, HealthResult } from '../HealthGenericTool'
import { phq9Severity, gad7Severity, rosenbergSelfEsteem, burnoutScore } from '../../../../lib/health/mentalDiabetes'
import {
  meldScore, meldNaScore, qsofaScore, qsofaBand, cha2ds2Vasc, cha2ds2VascBand,
  hasBled, hasBledBand, wellsDvt, wellsDvtBand, wellsPe, wellsPeBand,
  childPugh, childPughBand,
} from '../../../../lib/health/clinical'
import {
  anionGap, correctedCalcium, correctedSodium, bunCreatinineRatio, absoluteNeutrophilCount,
  absoluteLymphocyteCount, glucoseMmolToMg, glucoseMgToMmol, cholesterolMmolToMg,
  cholesterolMgToMmol, hbgdlToGperL, hbGperLtoGdl,
} from '../../../../lib/health/labs'

const ME = 'Mental Wellness'
const MS = 'Medical Scores & Clinical'
const BT = 'Blood Tests & Lab'

export const clinicGroup: Record<string, HealthToolConfig> = {}

clinicGroup['phq9-screener'] = {
  id: 'phq9-screener',
  title: 'PHQ-9 Depression Screener',
  description: 'The 9-item PHQ-9 questionnaire for tracking depressive symptoms over 2 weeks.',
  icon: <Brain className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'Over the last 2 weeks, how often were you bothered by each item? (0 = not at all, 3 = nearly every day)',
  sub: ME,
  emoji: '🧠',
  accent: 'text-purple-600 bg-purple-50 border-purple-200',
  fields: [
    { key: 'q1', label: '1. Little interest or pleasure doing things', type: 'number', min: 0, max: 3 },
    { key: 'q2', label: '2. Feeling down, depressed or hopeless', type: 'number', min: 0, max: 3 },
    { key: 'q3', label: '3. Trouble falling/staying asleep or sleeping too much', type: 'number', min: 0, max: 3 },
    { key: 'q4', label: '4. Feeling tired or having little energy', type: 'number', min: 0, max: 3 },
    { key: 'q5', label: '5. Poor appetite or overeating', type: 'number', min: 0, max: 3 },
    { key: 'q6', label: '6. Feeling bad about yourself, a failure or letting others down', type: 'number', min: 0, max: 3 },
    { key: 'q7', label: '7. Trouble concentrating on things', type: 'number', min: 0, max: 3 },
    { key: 'q8', label: '8. Moving/speaking slowly, or being fidgety/restless', type: 'number', min: 0, max: 3 },
    { key: 'q9', label: '9. Thoughts you would be better off dead or self-harm', type: 'number', min: 0, max: 3 },
  ],
  compute: (values) => {
    const r = phq9Severity(Array.from({ length: 9 }, (_, i) => values[`q${i + 1}`] ?? NaN))
    if (r === null) return null
    const tone: HealthResult['tone'] = r.total <= 9 ? (r.total <= 4 ? 'good' : 'ok') : r.total <= 19 ? 'warn' : 'danger'
    const dangerous = (values.q9 ?? 0) > 0
    return { title: 'PHQ-9 total', value: r.total.toFixed(0), unit: '/27', tone, badge: r.band, note: dangerous ? 'Any self-harm thoughts (Q9 > 0) deserve immediate professional support regardless of total.' : 'A screening tool - only a professional can diagnose depression.' }
  },
  howItWorks: [
    { title: 'Rate each of the 9 items', text: 'Score each 0-3 over the last two weeks.' },
    { title: 'Add the scores', text: 'Total runs 0-27.' },
    { title: 'Read the severity band', text: 'Minimal, mild, moderate, or severe.' },
  ],
  tips: [
    'Seek immediate help if you have any thoughts of self-harm.',
    'A high score is a prompt to see a professional, not a verdict.',
    'Take the screen again after 2-4 weeks to track change.',
  ],
}

clinicGroup['gad7-screener'] = {
  id: 'gad7-screener',
  title: 'GAD-7 Anxiety Screener',
  description: 'A 7-item check of generalised anxiety symptoms over the last 2 weeks.',
  icon: <ClipboardList className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'Rate each item over the last 2 weeks (0 = not at all, 3 = nearly every day).',
  sub: ME,
  emoji: '🧠',
  accent: 'text-purple-600 bg-purple-50 border-purple-200',
  fields: [
    { key: 'q1', label: '1. Feeling nervous, anxious or on edge', type: 'number', min: 0, max: 3 },
    { key: 'q2', label: '2. Not being able to stop or control worrying', type: 'number', min: 0, max: 3 },
    { key: 'q3', label: '3. Worrying too much about different things', type: 'number', min: 0, max: 3 },
    { key: 'q4', label: '4. Trouble relaxing', type: 'number', min: 0, max: 3 },
    { key: 'q5', label: '5. Being so restless that it is hard to sit still', type: 'number', min: 0, max: 3 },
    { key: 'q6', label: '6. Becoming easily annoyed or irritable', type: 'number', min: 0, max: 3 },
    { key: 'q7', label: '7. Feeling afraid something awful might happen', type: 'number', min: 0, max: 3 },
  ],
  compute: (values) => {
    const r = gad7Severity(Array.from({ length: 7 }, (_, i) => values[`q${i + 1}`] ?? NaN))
    if (r === null) return null
    return { title: 'GAD-7 total', value: r.total.toFixed(0), unit: '/21', tone: r.total <= 9 ? (r.total <= 4 ? 'good' : 'ok') : 'warn', badge: r.band, note: 'Screening help only - a clinician interprets the score in context.' }
  },
  howItWorks: [
    { title: 'Rate 7 items', text: '0-3 each for the last two weeks.' },
    { title: 'Sum them up', text: 'Maximum total 21.' },
    { title: 'Read the band', text: 'Minimal, mild, moderate, or severe.' },
  ],
  tips: [
    'Panic symptoms sometimes need the same attention as worry.',
    'Breathing exercises and physical activity help mild anxiety.',
    'Repeated high scores warrant a chat with a professional.',
  ],
}

clinicGroup['self-esteem-check'] = {
  id: 'self-esteem-check',
  title: 'Self-Esteem Check (Rosenberg)',
  description: 'The classic 10-item Rosenberg self-esteem scale.',
  icon: <Smile className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'For each statement (0 = strongly agree, 3 = strongly disagree) select your agreement.',
  sub: ME,
  emoji: '🧠',
  accent: 'text-purple-600 bg-purple-50 border-purple-200',
  fields: [
    { key: 'q1', label: '1. On the whole I am satisfied with myself', type: 'select', options: [{ value: '0', label: 'Strongly agree' }, { value: '1', label: 'Agree' }, { value: '2', label: 'Disagree' }, { value: '3', label: 'Strongly disagree' }] },
    { key: 'q2', label: '2. At times I think I am no good at all', type: 'select', options: [{ value: '0', label: 'Strongly agree' }, { value: '1', label: 'Agree' }, { value: '2', label: 'Disagree' }, { value: '3', label: 'Strongly disagree' }] },
    { key: 'q3', label: '3. I feel I have a number of good qualities', type: 'select', options: [{ value: '0', label: 'Strongly agree' }, { value: '1', label: 'Agree' }, { value: '2', label: 'Disagree' }, { value: '3', label: 'Strongly disagree' }] },
    { key: 'q4', label: '4. I am able to do things as well as most people', type: 'select', options: [{ value: '0', label: 'Strongly agree' }, { value: '1', label: 'Agree' }, { value: '2', label: 'Disagree' }, { value: '3', label: 'Strongly disagree' }] },
    { key: 'q5', label: '5. I feel I do not have much to be proud of', type: 'select', options: [{ value: '0', label: 'Strongly agree' }, { value: '1', label: 'Agree' }, { value: '2', label: 'Disagree' }, { value: '3', label: 'Strongly disagree' }] },
    { key: 'q6', label: '6. I certainly feel useless at times', type: 'select', options: [{ value: '0', label: 'Strongly agree' }, { value: '1', label: 'Agree' }, { value: '2', label: 'Disagree' }, { value: '3', label: 'Strongly disagree' }] },
    { key: 'q7', label: '7. I feel I am a person of worth, at least on an equal plane with others', type: 'select', options: [{ value: '0', label: 'Strongly agree' }, { value: '1', label: 'Agree' }, { value: '2', label: 'Disagree' }, { value: '3', label: 'Strongly disagree' }] },
    { key: 'q8', label: '8. I wish I could have more respect for myself', type: 'select', options: [{ value: '0', label: 'Strongly agree' }, { value: '1', label: 'Agree' }, { value: '2', label: 'Disagree' }, { value: '3', label: 'Strongly disagree' }] },
    { key: 'q9', label: '9. All in all I am inclined to feel that I am a failure', type: 'select', options: [{ value: '0', label: 'Strongly agree' }, { value: '1', label: 'Agree' }, { value: '2', label: 'Disagree' }, { value: '3', label: 'Strongly disagree' }] },
    { key: 'q10', label: '10. I take a positive attitude toward myself', type: 'select', options: [{ value: '0', label: 'Strongly agree' }, { value: '1', label: 'Agree' }, { value: '2', label: 'Disagree' }, { value: '3', label: 'Strongly disagree' }] },
  ],
  compute: (values) => {
    const items = Array.from({ length: 10 }, (_, i) => values[`q${i + 1}`] ?? NaN)
    const r = rosenbergSelfEsteem(items)
    if (r === null) return null
    return { title: 'Self-esteem score', value: r.total.toFixed(0), unit: '/30', tone: r.total < 15 ? 'warn' : 'good', badge: r.band, note: 'The scale is scored in its standard orientation; item wording reverses on some questions.' }
  },
  howItWorks: [
    { title: 'Answer 10 statements', text: 'Agree-disagree options per item.' },
    { title: 'Scores are summed', text: 'Standard 0-30 orientation.' },
    { title: 'Read the band', text: 'Low, normal, or healthy range.' },
  ],
  tips: [
    'Self-esteem fluctuates - one low score is not your identity.',
    'Compare over weeks rather than judging a single day.',
    'Support, therapy or coaching can help if it stays low.',
  ],
}

clinicGroup['burnout-score'] = {
  id: 'burnout-score',
  title: 'Burnout Score Check',
  description: 'A quick exhaustion + cynicism + reduced efficacy score from 0-10 ratings.',
  icon: <Flame className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'Rate fatigue, cynicism and feeling of accomplishment each 0-10.',
  sub: ME,
  emoji: '🧠',
  accent: 'text-purple-600 bg-purple-50 border-purple-200',
  fields: [
    { key: 'fatigue', label: 'Exhaustion / fatigue (0-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 7' },
    { key: 'cynicism', label: 'Cynicism / detachment (0-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 6' },
    { key: 'efficacy', label: 'Feeling of accomplishment (0-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 7' },
  ],
  compute: (values) => {
    const r = burnoutScore(values.fatigue ?? NaN, values.cynicism ?? NaN, values.efficacy ?? NaN)
    if (r === null) return null
    return { title: 'Burnout score', value: r.total.toFixed(0), unit: '/30', tone: r.total <= 10 ? 'good' : r.total <= 16 ? 'ok' : 'warn', badge: r.band, note: 'Lower "accomplishment" adds points, mirroring the classic three burnout dimensions.' }
  },
  howItWorks: [
    { title: 'Rate three dimensions', text: 'Exhaustion, cynicism, accomplishment.' },
    { title: 'Invert accomplishment', text: 'Low accomplishment adds to the score.' },
    { title: 'Sum 0-30', text: 'Higher equals stronger burnout signal.' },
  ],
  tips: [
    'Chronic stress, weak breaks and unclear roles feed burnout.',
    'Rest, boundaries and talking help - some need formal support.',
    'Recovery takes weeks, not a single weekend.',
  ],
}

clinicGroup['meld-score'] = {
  id: 'meld-score',
  title: 'MELD & MELD-Na Liver Score',
  description: 'Estimate liver disease severity with the MELD and MELD-Na scores.',
  icon: <Server className="h-6 w-6" />,
  breadcrumb: 'Health / Medical Scores & Clinical',
  instruction: 'Enter bilirubin, INR and creatinine. Mark dialysis if applicable.',
  sub: MS,
  emoji: '🏥',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'bili', label: 'Bilirubin (mg/dL)', type: 'number', placeholder: 'e.g. 2.0' },
    { key: 'inr', label: 'INR', type: 'number', step: 0.1, placeholder: 'e.g. 1.5' },
    { key: 'creat', label: 'Creatinine (mg/dL)', type: 'number', placeholder: 'e.g. 1.5' },
    { key: 'sodium', label: 'Sodium (mEq/L)', type: 'number', placeholder: 'e.g. 132' },
    { key: 'renal', label: 'On dialysis / renal failure', type: 'bool' },
  ],
  compute: (values) => {
    const meld = meldScore(values.bili ?? NaN, values.inr ?? NaN, values.creat ?? NaN, values.renal === 1)
    if (meld === null) return null
    const meldNa = values.sodium !== null && Number.isFinite(values.sodium ?? NaN) ? meldNaScore(meld, values.sodium) : null
    const risk = meld >= 25 ? 'high' : meld >= 15 ? 'warn' : 'ok'
    return {
      title: 'MELD score',
      value: meld.toFixed(0),
      unit: '6-40',
      tone: risk as HealthResult['tone'],
      badge: meldNa !== null ? `MELD-Na \u2248 ${meldNa}` : 'MELD',
      note: 'Used for transplant-listing priority. Educational estimate - clinical assessment always applies.',
    }
  },
  howItWorks: [
    { title: 'Enter the three labs', text: 'Bilirubin, INR and creatinine.' },
    { title: 'Log-transform and weigh', text: 'MELD = 3.78\u00b7ln(bili) + 11.2\u00b7ln(INR) + 9.57\u00b7ln(creat) + 6.43.' },
    { title: 'Add the sodium term', text: 'MELD-Na adjusts for low sodium.' },
  ],
  tips: [
    'Creatinine caps at 4, and dialysis counts as a renal failure flag.',
    'Higher scores mean higher short-term mortality risk.',
    'Only clinicians should use these scores for decisions.',
  ],
}

clinicGroup['qsofa-screener'] = {
  id: 'qsofa-screener',
  title: 'qSOFA Sepsis Screen',
  description: 'The quick SOFA screen for possible sepsis outside the ICU.',
  icon: <Shield className="h-6 w-6" />,
  breadcrumb: 'Health / Medical Scores & Clinical',
  instruction: 'Enter respiratory rate, systolic pressure and whether mentation is altered.',
  sub: MS,
  emoji: '🏥',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'rr', label: 'Respiratory rate (breaths/min)', type: 'number', placeholder: 'e.g. 24' },
    { key: 'sbp', label: 'Systolic BP (mmHg)', type: 'number', placeholder: 'e.g. 95' },
    { key: 'altered', label: 'Altered mentation (GCS < 15)', type: 'bool' },
  ],
  compute: (values) => {
    const s = qsofaScore(values.rr ?? NaN, values.sbp ?? NaN, values.altered === 1)
    if (s === null) return null
    return { title: 'qSOFA', value: s.toFixed(0), unit: '/3', tone: s >= 2 ? 'danger' : 'good', badge: qsofaBand(s), note: 'A score of 2+ in a person with suspected infection flags urgent review.' }
  },
  howItWorks: [
    { title: 'Collect three vitals', text: 'RR, SBP and mental status.' },
    { title: 'Score each', text: 'RR 22+, SBP 100 or less, altered mentation.' },
    { title: 'Add the points', text: '2 or more means sepsis may be present.' },
  ],
  tips: [
    'qSOFA is a screen, not the whole sepsis diagnostic picture.',
    'Time matters - sepsis needs rapid treatment.',
    'Call emergency services for suspected sepsis with 2+ points.',
  ],
}

clinicGroup['cha2ds2-vasc'] = {
  id: 'cha2ds2-vasc',
  title: 'CHA2DS2-VASc Stroke Risk',
  description: 'Estimate stroke risk in atrial fibrillation with the CHA2DS2-VASc score.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Medical Scores & Clinical',
  instruction: 'Answer age and medical history questions for the stroke-risk score.',
  sub: MS,
  emoji: '🏥',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 68' },
    { key: 'female', label: 'Female sex', type: 'bool' },
    { key: 'chf', label: 'Heart failure', type: 'bool' },
    { key: 'htn', label: 'Hypertension', type: 'bool' },
    { key: 'stroke', label: 'Prior stroke / TIA', type: 'bool' },
    { key: 'vascular', label: 'Vascular disease', type: 'bool' },
    { key: 'diabetes', label: 'Diabetes', type: 'bool' },
  ],
  compute: (values) => {
    const score = cha2ds2Vasc(values.age ?? NaN, values.female === 1, values.chf === 1, values.htn === 1, values.stroke === 1, values.vascular === 1, values.diabetes === 1)
    if (score === null) return null
    return { title: 'CHA2DS2-VASc', value: score.toFixed(0), unit: 'points', tone: score === 0 ? 'good' : score === 1 ? 'ok' : 'warn', badge: cha2ds2VascBand(score), note: 'Pairs with a bleeding score (like HAS-BLED) when deciding anticoagulation in AF.' }
  },
  howItWorks: [
    { title: 'Answer the items', text: 'Age gets extra weight (75+ scores 2).' },
    { title: 'Points accumulate', text: 'CHF, HTN, diabetes, stroke, vascular each add.' },
    { title: 'Read the risk', text: '0 is low; higher scores drive anticoagulation.' },
  ],
  tips: [
    'This applies to people in atrial fibrillation, not everyone.',
    'Decision-making balances stroke and bleeding risk.',
    'Discuss the score with a cardiologist or GP.',
  ],
}

clinicGroup['has-bled-check'] = {
  id: 'has-bled-check',
  title: 'HAS-BLED Bleeding Risk',
  description: 'Estimate major bleeding risk if anticoagulation is under consideration.',
  icon: <Droplets className="h-6 w-6" />,
  breadcrumb: 'Health / Medical Scores & Clinical',
  instruction: 'Tick the HAS-BLED criteria that apply.',
  sub: MS,
  emoji: '🏥',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'htn', label: 'Uncontrolled hypertension', type: 'bool' },
    { key: 'renal', label: 'Abnormal renal function', type: 'bool' },
    { key: 'liver', label: 'Abnormal liver function', type: 'bool' },
    { key: 'stroke', label: 'Prior stroke', type: 'bool' },
    { key: 'bleed', label: 'Prior major bleeding', type: 'bool' },
    { key: 'labile', label: 'Labile INR', type: 'bool' },
    { key: 'age', label: 'Age over 65', type: 'bool' },
    { key: 'drugs', label: 'Antiplatelets or NSAIDs', type: 'bool' },
    { key: 'alcohol', label: 'Excess alcohol', type: 'bool' },
  ],
  compute: (values) => {
    const score = hasBled(values.htn === 1, values.renal === 1, values.liver === 1, values.stroke === 1, values.bleed === 1, values.labile === 1, values.age === 1, values.drugs === 1, values.alcohol === 1)
    return { title: 'HAS-BLED', value: score.toFixed(0), unit: '/9', tone: score >= 3 ? 'warn' : 'good', badge: hasBledBand(score), note: 'A high score flags caution and modifiable factors, not a ban on anticoagulation.' }
  },
  howItWorks: [
    { title: 'Tick applicable criteria', text: 'Nine yes/no items.' },
    { title: 'Count the ticks', text: 'Each yes adds 1.' },
    { title: 'Interpret', text: '3+ signals elevated bleeding risk.' },
  ],
  tips: [
    'Points often identify things you can fix: BP, alcohol, NSAIDs.',
    'Clinicians weigh HAS-BLED against stroke risk together.',
    'Never start or stop blood thinners without medical advice.',
  ],
}

clinicGroup['wells-dvt'] = {
  id: 'wells-dvt',
  title: 'Wells DVT Score',
  description: 'Score pre-test probability of deep vein thrombosis with Wells criteria.',
  icon: <Waves className="h-6 w-6" />,
  breadcrumb: 'Health / Medical Scores & Clinical',
  instruction: 'Tick each Wells DVT criterion that applies.',
  sub: MS,
  emoji: '🏥',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'cancer', label: 'Active cancer', type: 'bool' },
    { key: 'paralysis', label: 'Paralysis / recent plaster', type: 'bool' },
    { key: 'bedridden', label: 'Bedridden 3+ days / major surgery within 4 weeks', type: 'bool' },
    { key: 'tenderness', label: 'Localised calf tenderness', type: 'bool' },
    { key: 'swollen', label: 'Entire leg swollen', type: 'bool' },
    { key: 'calf', label: 'Calf at least 3 cm larger', type: 'bool' },
    { key: 'edema', label: 'Pitting oedema in affected leg', type: 'bool' },
    { key: 'veins', label: 'Collateral superficial veins', type: 'bool' },
    { key: 'altdx', label: 'Alternative diagnosis at least as likely', type: 'bool' },
  ],
  compute: (values) => {
    const score = wellsDvt(values.cancer === 1, values.paralysis === 1, values.bedridden === 1, values.tenderness === 1, values.swollen === 1, values.calf === 1, values.edema === 1, values.veins === 1, values.altdx === 1)
    return { title: 'Wells DVT', value: score.toFixed(0), unit: 'points', tone: score > 2 ? 'warn' : score >= 1 ? 'ok' : 'good', badge: wellsDvtBand(score), note: 'An alternative diagnosis subtracts 2 points.' }
  },
  howItWorks: [
    { title: 'Score the criteria', text: 'Each yes adds 1 except the alternative diagnosis (-2).' },
    { title: 'Sum the total', text: 'Low, moderate, or high pretest probability.' },
    { title: 'Guide imaging', text: 'High scores generally prompt ultrasound.' },
  ],
  tips: [
    'DVT suspicion with leg swelling needs prompt evaluation.',
    'Immobility and recent surgery are the strongest setting clues.',
    'This screen does not replace a doctor\u2019s assessment or D-dimer.',
  ],
}

clinicGroup['wells-pe'] = {
  id: 'wells-pe',
  title: 'Wells PE Score',
  description: 'Estimate pre-test probability of pulmonary embolism with Wells criteria.',
  icon: <Wind className="h-6 w-6" />,
  breadcrumb: 'Health / Medical Scores & Clinical',
  instruction: 'Tick each Wells PE criterion that applies.',
  sub: MS,
  emoji: '🏥',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'likely', label: 'PE is the most likely diagnosis', type: 'bool' },
    { key: 'dvt', label: 'Signs of DVT', type: 'bool' },
    { key: 'tachy', label: 'Heart rate over 100', type: 'bool' },
    { key: 'prior', label: 'Prior DVT or PE', type: 'bool' },
    { key: 'surgery', label: 'Recent surgery or immobilisation', type: 'bool' },
    { key: 'hemoptysis', label: 'Coughing blood', type: 'bool' },
    { key: 'cancer', label: 'Active cancer', type: 'bool' },
  ],
  compute: (values) => {
    const score = wellsPe(values.likely === 1, values.dvt === 1, values.tachy === 1, values.prior === 1, values.surgery === 1, values.hemoptysis === 1, values.cancer === 1)
    return { title: 'Wells PE', value: score.toFixed(0), unit: 'points', tone: score > 6 ? 'warn' : score >= 2 ? 'ok' : 'good', badge: wellsPeBand(score), note: 'Sudden breathlessness or chest pain with these findings needs urgent assessment.' }
  },
  howItWorks: [
    { title: 'Score each criterion', text: 'Items carry 1-3 points each.' },
    { title: 'Sum the total', text: 'Low <2, moderate 2-6, high >6.' },
    { title: 'Act on it', text: 'High scores and clinical signs warrant urgent imaging.' },
  ],
  tips: [
    'Sudden shortness of breath is always worth urgent review.',
    'PE and DVT share risk factors - immobility, surgery, cancer.',
    'This score supports, never replaces, emergency assessment.',
  ],
}

clinicGroup['child-pugh'] = {
  id: 'child-pugh',
  title: 'Child-Pugh Liver Score',
  description: 'Classify liver cirrhosis severity with the Child-Pugh system.',
  icon: <Server className="h-6 w-6" />,
  breadcrumb: 'Health / Medical Scores & Clinical',
  instruction: 'Enter the labs and severity of ascites/encephalopathy.',
  sub: MS,
  emoji: '🏥',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'bili', label: 'Bilirubin (mg/dL)', type: 'number', placeholder: 'e.g. 2.5' },
    { key: 'alb', label: 'Albumin (g/dL)', type: 'number', placeholder: 'e.g. 3.0' },
    { key: 'inr', label: 'INR', type: 'number', step: 0.1, placeholder: 'e.g. 1.8' },
    { key: 'ascites', label: 'Ascites', type: 'select', options: [{ value: '0', label: 'None (1 pt)' }, { value: '1', label: 'Mild (2 pts)' }, { value: '2', label: 'Moderate-severe (3 pts)' }] },
    { key: 'enc', label: 'Encephalopathy', type: 'select', options: [{ value: '0', label: 'None (1 pt)' }, { value: '1', label: 'Grades 1-2 (2 pts)' }, { value: '2', label: 'Grades 3-4 (3 pts)' }] },
  ],
  compute: (values) => {
    const t = childPugh(values.bili ?? NaN, values.alb ?? NaN, values.inr ?? NaN, values.ascites ?? NaN, values.enc ?? NaN)
    if (t === null) return null
    return { title: 'Child-Pugh total', value: t.toFixed(0), unit: '/15', tone: t <= 6 ? 'good' : t <= 9 ? 'ok' : 'warn', badge: childPughBand(t), note: 'Each lab maps to 1-3 points; total classifies A, B or C.' }
  },
  howItWorks: [
    { title: 'Enter three labs', text: 'Bilirubin, albumin, INR.' },
    { title: 'Add clinical layers', text: 'Ascites and encephalopathy points.' },
    { title: 'Read the class', text: 'A (5-6), B (7-9) or C (10-15).' },
  ],
  tips: [
    'Child-Pugh guides prognosis and surgery planning.',
    'Class C carries the weakest reserves - specialist care needed.',
    'Treat as educational; a hepatologist must confirm staging.',
  ],
}

clinicGroup['anion-gap'] = {
  id: 'anion-gap',
  title: 'Anion Gap Calculator',
  description: 'Compute the plasma anion gap from sodium, chloride and bicarbonate.',
  icon: <TestTube className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter sodium, chloride and bicarbonate in mEq/L.',
  sub: BT,
  emoji: '🧪',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'na', label: 'Sodium (mEq/L)', type: 'number', placeholder: 'e.g. 140' },
    { key: 'cl', label: 'Chloride (mEq/L)', type: 'number', placeholder: 'e.g. 104' },
    { key: 'hco3', label: 'Bicarbonate (mEq/L)', type: 'number', placeholder: 'e.g. 24' },
  ],
  compute: (values) => {
    const g = anionGap(values.na ?? NaN, values.cl ?? NaN, values.hco3 ?? NaN)
    if (g === null) return null
    return { title: 'Anion gap', value: g.toFixed(1), unit: 'mEq/L', tone: g >= 12 ? 'warn' : 'good', badge: g >= 12 ? 'Elevated - check causes' : 'Typical range (4-12)', note: 'Anion gap = Na - (Cl + HCO3). High gaps point to certain acidosis causes.' }
  },
  howItWorks: [
    { title: 'Enter three electrolytes', text: 'Sodium, chloride, bicarbonate.' },
    { title: 'Sum the anions', text: 'Add chloride and bicarbonate.' },
    { title: 'Subtract from sodium', text: 'That difference is the gap.' },
  ],
  tips: [
    'Used alongside blood gases when acidosis is suspected.',
    'An elevated gap (with lowered HCO3) suggests metabolic acidosis.',
    'Let a clinician interpret it with the full picture.',
  ],
}

clinicGroup['corrected-calcium'] = {
  id: 'corrected-calcium',
  title: 'Corrected Calcium',
  description: 'Adjust serum calcium for albumin levels.',
  icon: <Beaker className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter serum calcium and albumin.',
  sub: BT,
  emoji: '🧪',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'ca', label: 'Calcium (mg/dL)', type: 'number', placeholder: 'e.g. 8.5' },
    { key: 'alb', label: 'Albumin (g/dL)', type: 'number', placeholder: 'e.g. 4.5' },
  ],
  compute: (values) => {
    const c = correctedCalcium(values.ca ?? NaN, values.alb ?? NaN)
    if (c === null) return null
    return { title: 'Corrected calcium', value: c.toFixed(1), unit: 'mg/dL', tone: c < 8.5 || c > 10.5 ? 'warn' : 'good', badge: c < 8.5 || c > 10.5 ? 'Outside typical range' : 'Typical range', note: 'Ca = measured + 0.8 \u00d7 (4 - albumin).' }
  },
  howItWorks: [
    { title: 'Enter calcium and albumin', text: 'Both mg/dL and g/dL respectively.' },
    { title: 'Apply the correction', text: 'Add 0.8 per g/dL albumin below 4.' },
    { title: 'Read the adjusted value', text: 'That is the value clinicians interpret.' },
  ],
  tips: [
    'Low albumin falsely lowers total calcium.',
    'Ionised calcium is the alternative direct measurement.',
    'Symptoms guide urgency more than the number alone.',
  ],
}

clinicGroup['corrected-sodium'] = {
  id: 'corrected-sodium',
  title: 'Corrected Sodium',
  description: 'Adjust sodium upward when glucose is high.',
  icon: <Droplet className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter sodium and glucose.',
  sub: BT,
  emoji: '🧪',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'na', label: 'Sodium (mEq/L)', type: 'number', placeholder: 'e.g. 136' },
    { key: 'glucose', label: 'Glucose (mg/dL)', type: 'number', placeholder: 'e.g. 400' },
  ],
  compute: (values) => {
    const c = correctedSodium(values.na ?? NaN, values.glucose ?? NaN)
    if (c === null) return null
    return { title: 'Corrected sodium', value: c.toFixed(1), unit: 'mEq/L', tone: 'ok', badge: 'Adds ~2.4 mEq per 100 mg/dL glucose over 100', note: 'High glucose pulls water into the blood and dilutes sodium.' }
  },
  howItWorks: [
    { title: 'Enter sodium and glucose', text: 'Measured together, ideally.' },
    { title: 'Scale the glucose excess', text: '0.024 \u00d7 (glucose - 100) is added.' },
    { title: 'Read corrected sodium', text: 'Better reflects true sodium status in hyperglycaemia.' },
  ],
  tips: [
    'Relevant in diabetic emergencies and severe hyperglycaemia.',
    'Correction is an estimate clinicians combine with symptoms.',
    'This is one of several published adjustment methods.',
  ],
}

clinicGroup['bun-creatinine-ratio'] = {
  id: 'bun-creatinine-ratio',
  title: 'BUN:Creatinine Ratio',
  description: 'Compare blood urea nitrogen to creatinine to guide hydration questions.',
  icon: <Ratio className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter BUN and creatinine.',
  sub: BT,
  emoji: '🧪',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'bun', label: 'BUN (mg/dL)', type: 'number', placeholder: 'e.g. 20' },
    { key: 'creat', label: 'Creatinine (mg/dL)', type: 'number', placeholder: 'e.g. 1.0' },
  ],
  compute: (values) => {
    const r = bunCreatinineRatio(values.bun ?? NaN, values.creat ?? NaN)
    if (r === null) return null
    return { title: 'BUN:Creatinine ratio', value: r.toFixed(0), unit: 'ratio', tone: r >= 20 || r < 10 ? 'warn' : 'ok', badge: r >= 20 ? 'High - often dehydration/GI bleeding' : r < 10 ? 'Low - consider muscle/liver factors' : 'Typical (10-20)', note: 'A classic ratio, but a rough one - always read with the full clinical context.' }
  },
  howItWorks: [
    { title: 'Enter both values', text: 'BUN and creatinine, same units.' },
    { title: 'Divide', text: 'BUN \u00f7 creatinine.' },
    { title: 'Interpret the band', text: 'High ratios commonly flag prerenal/dehydration.' },
  ],
  tips: [
    'Diet, muscle mass and protein load all move BUN.',
    'Trends matter more than a single reading.',
    'Use alongside exam and vitals before concluding anything.',
  ],
}

clinicGroup['absolute-neutrophil-count'] = {
  id: 'absolute-neutrophil-count',
  title: 'Absolute Neutrophil Count (ANC)',
  description: 'Convert a WBC count and neutrophil percentage into ANC.',
  icon: <Microscope className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter WBC (thousand/µL) and neutrophil percentage.',
  sub: BT,
  emoji: '🧪',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'wbc', label: 'WBC (thousand/\u00b5L)', type: 'number', placeholder: 'e.g. 6.0' },
    { key: 'neut', label: 'Neutrophils (%)', type: 'number', placeholder: 'e.g. 60' },
  ],
  compute: (values) => {
    const anc = absoluteNeutrophilCount(values.wbc ?? NaN, values.neut ?? NaN)
    if (anc === null) return null
    return { title: 'Absolute neutrophil count', value: anc.toFixed(0), unit: 'cells/\u00b5L', tone: anc < 1500 ? 'warn' : 'good', badge: anc < 1500 ? 'Low (neutropenia <1,500)' : 'Normal course', note: 'Oncology patients often track this before chemotherapy decisions.' }
  },
  howItWorks: [
    { title: 'Enter WBC and %', text: 'From the CBC differential.' },
    { title: 'Multiply', text: 'WBC \u00d7 1000 \u00d7 (neut %/100).' },
    { title: 'Read cells/µL', text: 'Compare to the 1,500 threshold.' },
  ],
  tips: [
    'Low ANC raises infection risk - know your number.',
    'Fever with very low ANC is a medical urgency.',
    'Chemotherapy protocols often reference specific ANC cut-offs.',
  ],
}

clinicGroup['absolute-lymphocyte-count'] = {
  id: 'absolute-lymphocyte-count',
  title: 'Absolute Lymphocyte Count',
  description: 'Compute ALC from WBC and lymphocyte percentage.',
  icon: <Microscope className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter WBC (thousand/µL) and lymphocyte percentage.',
  sub: BT,
  emoji: '🧪',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'wbc', label: 'WBC (thousand/\u00b5L)', type: 'number', placeholder: 'e.g. 6.0' },
    { key: 'lymph', label: 'Lymphocytes (%)', type: 'number', placeholder: 'e.g. 25' },
  ],
  compute: (values) => {
    const alc = absoluteLymphocyteCount(values.wbc ?? NaN, values.lymph ?? NaN)
    if (alc === null) return null
    return { title: 'Absolute lymphocyte count', value: alc.toFixed(0), unit: 'cells/\u00b5L', tone: alc < 1000 ? 'warn' : 'good', badge: alc < 1000 ? 'Low (<1,000)' : 'Typical course', note: 'ALC matters in lymphomas, recovery after chemo, and HIV monitoring.' }
  },
  howItWorks: [
    { title: 'Enter WBC and %', text: 'From the CBC.' },
    { title: 'Multiply', text: 'WBC \u00d7 1000 \u00d7 (lymph %/100).' },
    { title: 'Read the number', text: 'Absolute cells per µL.' },
  ],
  tips: [
    'A single low ALC can be transient after infection.',
    'Persistent trends deserve discussion with a doctor.',
    'Normal bands vary by lab - compare to the reference on your report.',
  ],
}

clinicGroup['glucose-unit-converter'] = {
  id: 'glucose-unit-converter',
  title: 'Blood Glucose Unit Converter',
  description: 'Convert glucose between mg/dL and mmol/L instantly.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Blood Tests & Lab',
  instruction: 'Enter a value and the unit you want it converted to.',
  sub: BT,
  emoji: '🧪',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'val', label: 'Glucose value', type: 'number', placeholder: 'e.g. 100' },
    { key: 'dir', label: 'Convert to', type: 'select', options: [{ value: '0', label: 'mmol/L (from mg/dL)' }, { value: '1', label: 'mg/dL (from mmol/L)' }] },
  ],
  compute: (values) => {
    const v = values.val ?? NaN
    const conv = values.dir === 1 ? glucoseMmolToMg(v) : glucoseMgToMmol(v)
    if (conv === null) return null
    const unit = values.dir === 1 ? 'mg/dL' : 'mmol/L'
    const factor = values.dir === 1 ? '\u00d7 18.0155' : '\u00f7 18.0155'
    return { title: 'Converted glucose', value: conv.toFixed(values.dir === 1 ? 1 : 2), unit, tone: 'ok', badge: `Factor ${factor}`, note: '18.0155 is the molar mass of glucose in g/mol.' }
  },
  howItWorks: [
    { title: 'Enter the reading', text: 'Any glucose value.' },
    { title: 'Pick the output unit', text: 'mg/dL or mmol/L.' },
    { title: 'We scale by 18.0155', text: 'Multiply or divide accordingly.' },
  ],
  tips: [
    'Many meters allow both units - set the one you read best.',
    'Beware mix-ups in reports; converting avoids dosing errors.',
    'Keep a paper copy or app note of your numbers.',
  ],
}

const converterConfig = (id: string, title: string, description: string, icon: ReactNode, breadcrumb: string, instruction: string, sub: string, emoji: string, accent: string, toSi: (x: number) => number | null, toUs: (x: number) => number | null, scale: number, siUnit: string, usUnit: string): HealthToolConfig => ({
  id,
  title,
  description,
  icon,
  breadcrumb,
  instruction,
  sub,
  emoji,
  accent,
  fields: [
    { key: 'val', label: 'Value to convert', type: 'number', placeholder: 'e.g. 5.2' },
    { key: 'dir', label: 'Convert to', type: 'select', options: [{ value: '0', label: `${usUnit} → ${siUnit}` }, { value: '1', label: `${siUnit} → ${usUnit}` }] },
  ],
  compute: (values) => {
    const v = values.val ?? NaN
    const conv = values.dir === 1 ? toUs(v) : toSi(v)
    if (conv === null) return null
    const unit = values.dir === 1 ? usUnit : siUnit
    return { title: 'Converted value', value: conv.toFixed(scale), unit, tone: 'ok', badge: 'Unit converter', note: 'Converted, not clinically interpreted - compare against your lab\u2019s reference range.' }
  },
  howItWorks: [
    { title: 'Enter the value', text: 'Whatever the source unit.' },
    { title: 'Choose the target', text: 'Which unit you want out.' },
    { title: 'Read the result', text: 'Scaled by the precise conversion factor.' },
  ],
  tips: [
    'Always confirm units on your lab report before converting.',
    'Different labs may print different reference ranges.',
    'Share converted numbers with your provider in the unit they use.',
  ],
})

clinicGroup['cholesterol-unit-converter'] = converterConfig(
  'cholesterol-unit-converter',
  'Cholesterol Unit Converter',
  'Convert cholesterol between mmol/L and mg/dL.',
  <PlusCircle className="h-6 w-6" />,
  'Health / Blood Tests & Lab',
  'Enter a cholesterol value and target unit.',
  BT,
  '🧪',
  'text-rose-600 bg-rose-50 border-rose-200',
  cholesterolMgToMmol,
  cholesterolMmolToMg,
  2,
  'mmol/L',
  'mg/dL',
)

clinicGroup['hemoglobin-unit-converter'] = converterConfig(
  'hemoglobin-unit-converter',
  'Hemoglobin Unit Converter',
  'Convert hemoglobin between g/dL and g/L.',
  <TestTube className="h-6 w-6" />,
  'Health / Blood Tests & Lab',
  'Enter a hemoglobin value and target unit.',
  BT,
  '🧪',
  'text-rose-600 bg-rose-50 border-rose-200',
  hbGperLtoGdl,
  hbgdlToGperL,
  1,
  'g/L',
  'g/dL',
)