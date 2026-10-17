import { Activity, Gauge, Sunrise, Timer, Wheat, Syringe, Brain, Apple, HeartPulse, Sprout, ShieldCheck, Wind, Repeat, BatteryCharging, HandHeart, PhoneCall } from 'lucide-react'
import type { HealthToolConfig } from '../HealthGenericTool'
import {
  a1cToEag, eagToA1c, dawnRise, insulinSensitivityFactor,
  carbRatioPerUnit, correctionDose, hypoAwarenessScore, glycemicLoad,
} from '../../../../lib/health/diabetesCare'
import {
  moodScoreCard, stressCopingCount, resilienceScore, panicLog,
  ruminationScore, digitalDetoxScore, selfCompassionScore, supportCheck,
} from '../../../../lib/health/mentalScore'

const DI = 'Diabetes & Blood Sugar'
const ME = 'Mental Wellness'

export const extrasDiabetesMentalGroup: Record<string, HealthToolConfig> = {}

extrasDiabetesMentalGroup['a1c-to-glucose-calculator'] = {
  id: 'a1c-to-glucose-calculator',
  title: 'A1C to Glucose Converter',
  description: 'Convert an HbA1c value into the estimated average glucose (eAG) in mg/dL.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Diabetes & Blood Sugar',
  instruction: 'Enter your HbA1c percentage.',
  sub: DI,
  emoji: '🍬',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'a1c', label: 'HbA1c (%)', type: 'number', min: 2, max: 20, step: 0.1, placeholder: 'e.g. 7.0' },
  ],
  compute: (values) => {
    const eag = a1cToEag(values.a1c ?? NaN)
    if (eag === null) return null
    return { title: 'Estimated average glucose', value: eag.toFixed(0), unit: 'mg/dL', tone: (values.a1c ?? 0) < 7 ? 'good' : (values.a1c ?? 0) < 8 ? 'ok' : 'warn', badge: `From A1C ${values.a1c}`, note: 'Formula: eAG = 28.7 × A1C − 46.7. It averages glucose over ~3 months - a single fasting number is not the same measure.' }
  },
  howItWorks: [
    { title: 'Enter A1C', text: 'Your last lab value in %.' },
    { title: 'Apply the formula', text: '28.7 × A1C − 46.7.' },
    { title: 'Read eAG', text: 'Rough average blood sugar.' },
  ],
  tips: [
    'A1C 6.5%+ is a diagnostic threshold for diabetes.',
    'eAG is a helpful bridge to day-to-day meter numbers.',
    'One A1C result should always be confirmed before acting.',
  ],
}

extrasDiabetesMentalGroup['glucose-to-a1c-estimator'] = {
  id: 'glucose-to-a1c-estimator',
  title: 'Glucose to A1C Estimator',
  description: 'Estimate an equivalent HbA1c from an average glucose reading.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Diabetes & Blood Sugar',
  instruction: 'Enter your average glucose in mg/dL (from a CGM or log over weeks).',
  sub: DI,
  emoji: '🍬',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'eag', label: 'Average glucose (mg/dL)', type: 'number', min: 30, max: 600, placeholder: 'e.g. 154' },
  ],
  compute: (values) => {
    const a1c = eagToA1c(values.eag ?? NaN)
    if (a1c === null) return null
    return { title: 'Estimated A1C', value: a1c.toFixed(1), unit: '%', tone: a1c < 5.7 ? 'good' : a1c < 6.5 ? 'ok' : 'warn', badge: `eAG ${values.eag} mg/dL`, note: 'Inverse of the A1C formula. Short-term averages (a few days) match A1C poorly - only consistent weeks give a fair estimate.' }
  },
  howItWorks: [
    { title: 'Average readings', text: 'Collect 2-4 weeks of data.' },
    { title: 'Enter the mean', text: 'mg/dL average.' },
    { title: 'Estimate A1C', text: '(eAG + 46.7) ÷ 28.7.' },
  ],
  tips: [
    'CGM time-in-range tells you more than A1C alone.',
    'Ask your provider for a real lab A1C annually.',
    'Anemia and kidney issues can skew the A1C lab test.',
  ],
}

extrasDiabetesMentalGroup['dawn-phenomenon-check'] = {
  id: 'dawn-phenomenon-check',
  title: 'Dawn Phenomenon Check',
  description: 'Compare your bedtime and morning glucose to spot a morning rise.',
  icon: <Sunrise className="h-6 w-6" />,
  breadcrumb: 'Health / Diabetes & Blood Sugar',
  instruction: 'Enter your glucose before bed and the first reading after waking.',
  sub: DI,
  emoji: '🌅',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'bed', label: 'Bedtime glucose (mg/dL)', type: 'number', min: 40, max: 600, placeholder: 'e.g. 110' },
    { key: 'wake', label: 'Morning fasting glucose (mg/dL)', type: 'number', min: 40, max: 600, placeholder: 'e.g. 150' },
  ],
  compute: (values) => {
    const r = dawnRise(values.bed ?? NaN, values.wake ?? NaN)
    if (r === null) return null
    return { title: 'Morning change', value: `${r.diffMg > 0 ? '+' : ''}${r.diffMg}`, unit: 'mg/dL', tone: r.rising ? 'warn' : 'good', badge: r.rising ? 'Glucose rose overnight' : 'No meaningful overnight rise', note: r.rising ? 'A climb over ~20 mg/dL before eating is the classic dawn phenomenon - the body releases glucose in the early morning. Pattern matters more than one night.' : 'Fasting matched bedtime glucose closely - no dawn rise detected tonight.' }
  },
  howItWorks: [
    { title: 'Check at bedtime', text: 'Log your glucose.' },
    { title: 'Check after waking', text: 'Before any food.' },
    { title: 'Compare', text: 'A 20+ mg/dL climb signals dawn rise.' },
  ],
  tips: [
    'The dose of evening insulin affects this number.',
    'Wake-time checks must come before breakfast.',
    'Repeated rises are a care-team conversation, not a fix session.',
  ],
}

extrasDiabetesMentalGroup['insulin-sensitivity-factor'] = {
  id: 'insulin-sensitivity-factor',
  title: 'Insulin Sensitivity Factor (1700 Rule)',
  description: 'Estimate how many mg/dL one unit of rapid insulin lowers your glucose.',
  icon: <Timer className="h-6 w-6" />,
  breadcrumb: 'Health / Diabetes & Blood Sugar',
  instruction: 'Enter your total daily dose (TDD) of rapid insulin.',
  sub: DI,
  emoji: '💉',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'tdd', label: 'Total daily insulin (U)', type: 'number', min: 5, max: 300, placeholder: 'e.g. 50' },
  ],
  compute: (values) => {
    const isf = insulinSensitivityFactor(values.tdd ?? NaN)
    if (isf === null) return null
    return { title: '1 unit lowers you about', value: isf.toFixed(0), unit: 'mg/dL', tone: 'ok', badge: '1700 rule guideline', note: 'This is a starting estimate only - real sensitivity comes from tracking your own responses. Only healthcare teams set dosing.' }
  },
  howItWorks: [
    { title: 'Find your TDD', text: 'Insulin over 24 hours.' },
    { title: 'Apply 1700 rule', text: '1700 ÷ TDD.' },
    { title: 'Compare later', text: 'Adjust only with your team.' },
  ],
  tips: [
    'Sensitivity shifts with weight, illness and exercise.',
    'This is education, not a dosing prescription.',
    'Never change insulin without professional guidance.',
  ],
}

extrasDiabetesMentalGroup['carb-ratio-calculator'] = {
  id: 'carb-ratio-calculator',
  title: 'Carb Ratio Calculator (450 Rule)',
  description: 'Estimate grams of carbohydrate covered by one unit of rapid insulin.',
  icon: <Wheat className="h-6 w-6" />,
  breadcrumb: 'Health / Diabetes & Blood Sugar',
  instruction: 'Enter your total daily insulin dose (TDD).',
  sub: DI,
  emoji: '🍞',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'tdd', label: 'Total daily insulin (U)', type: 'number', min: 5, max: 300, placeholder: 'e.g. 50' },
  ],
  compute: (values) => {
    const ratio = carbRatioPerUnit(values.tdd ?? NaN)
    if (ratio === null) return null
    return { title: '1 unit covers about', value: ratio.toFixed(1), unit: 'g carbs', tone: 'ok', badge: '450 rule guideline', note: 'A ballpark starting point. Real ratios are refined from your own carb-and-glucose records under clinical supervision.' }
  },
  howItWorks: [
    { title: 'Enter TDD', text: 'Your 24-hour total.' },
    { title: 'Divide 450 by it', text: 'Example 450 ÷ 50 = 9.' },
    { title: 'Fine-tune', text: 'Track actual outcomes.' },
  ],
  tips: [
    'Meal-type and timing change the ratio needed.',
    'Count carbs consistently for honest data.',
    'Adjustments belong in the care plan with your team.',
  ],
}

extrasDiabetesMentalGroup['insulin-correction-dose'] = {
  id: 'insulin-correction-dose',
  title: 'Insulin Correction Dose',
  description: 'Estimate a bolus correction for a high glucose reading above target.',
  icon: <Syringe className="h-6 w-6" />,
  breadcrumb: 'Health / Diabetes & Blood Sugar',
  instruction: 'Enter your current glucose, target glucose and sensitivity factor.',
  sub: DI,
  emoji: '💉',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'glucose', label: 'Current glucose (mg/dL)', type: 'number', min: 40, max: 600, placeholder: 'e.g. 180' },
    { key: 'target', label: 'Target glucose (mg/dL)', type: 'number', min: 70, max: 200, placeholder: 'e.g. 120' },
    { key: 'isf', label: 'Sensitivity factor (mg/dL per U)', type: 'number', min: 10, max: 100, placeholder: 'e.g. 30' },
  ],
  compute: (values) => {
    const g = values.glucose ?? NaN
    const t = values.target ?? NaN
    const dose = correctionDose(g, t, values.isf ?? NaN)
    if (dose === null) return null
    if (dose === 0) return { title: 'Correction dose', value: '0', unit: 'U', tone: 'good', badge: 'Below target - no correction', note: 'Glucose is already at or below target, so no extra bolus is suggested by this estimate.' }
    return { title: 'Suggested correction', value: dose.toFixed(1), unit: 'U', tone: 'warn', badge: `${g - t} mg/dL over target`, note: 'Illustrative math only - real boluses depend on carbs, activity and your plan. Never adjust insulin without your care team.' }
  },
  howItWorks: [
    { title: 'Enter glucose', text: 'Your current number.' },
    { title: 'Set the target', text: 'Your agreed fasting target.' },
    { title: 'Divide by ISF', text: 'Amount above ÷ drop per unit.' },
  ],
  tips: [
    'Round to the nearest 0.5 U as your pen allows.',
    'Active insulin from a previous dose still counts.',
    'Low readings plus corrections = speak to your team.',
  ],
}

extrasDiabetesMentalGroup['hypo-awareness-score'] = {
  id: 'hypo-awareness-score',
  title: 'Hypo Awareness Score',
  description: 'Score your low-glucose episode pattern into an awareness signal.',
  icon: <Brain className="h-6 w-6" />,
  breadcrumb: 'Health / Diabetes & Blood Sugar',
  instruction: 'Enter recent low episodes per week and the two warning flags that apply.',
  sub: DI,
  emoji: '📉',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'hypos', label: 'Lows per week', type: 'number', min: 0, max: 50, placeholder: 'e.g. 2' },
    { key: 'ignored', label: 'I often do not feel lows coming', type: 'bool' },
    { key: 'nocturnal', label: 'Lows happen while I sleep', type: 'bool' },
  ],
  compute: (values) => {
    const s = hypoAwarenessScore(values.hypos ?? NaN, values.ignored === 1, values.nocturnal === 1)
    if (s === null) return null
    return { title: 'Awareness score', value: s.toFixed(0), unit: '/100', tone: s >= 70 ? 'good' : s >= 45 ? 'ok' : 'warn', badge: s >= 70 ? 'Strong hypo awareness' : s >= 45 ? 'Some warning signs fading' : 'Impaired awareness - high caution', note: 'Repeated lows blunt the body\u2019s alarm system. With impaired awareness, treat any reading under 70 mg/dL fast - and let your team know.', pct: s }
  },
  howItWorks: [
    { title: 'Count lows', text: 'Sub-70 episodes weekly.' },
    { title: 'Add warning flags', text: 'Missed symptoms, night events.' },
    { title: 'Read the signal', text: 'Lower score = lower awareness.' },
  ],
  tips: [
    'The 15-15 rule: 15g carbs, wait 15 minutes.',
    'Wear identification if you take insulin and drive.',
    'Recovering awareness takes weeks of avoiding lows.',
  ],
}

extrasDiabetesMentalGroup['glycemic-load-calculator'] = {
  id: 'glycemic-load-calculator',
  title: 'Glycemic Load Calculator',
  description: 'Combine glycemic index and carb grams to estimate blood-sugar impact.',
  icon: <Apple className="h-6 w-6" />,
  breadcrumb: 'Health / Diabetes & Blood Sugar',
  instruction: 'Enter the food\u2019s glycemic index and the carbs you will eat.',
  sub: DI,
  emoji: '🍎',
  accent: 'text-teal-600 bg-teal-50 border-teal-200',
  fields: [
    { key: 'gi', label: 'Glycemic index (0-100)', type: 'number', min: 0, max: 100, placeholder: 'e.g. 55' },
    { key: 'carbs', label: 'Carbohydrates (g)', type: 'number', min: 0, max: 200, placeholder: 'e.g. 40' },
  ],
  compute: (values) => {
    const g = glycemicLoad(values.gi ?? NaN, values.carbs ?? NaN)
    if (g === null) return null
    return { title: 'Glycemic load', value: g.gl.toFixed(1), unit: '', tone: g.band === 'Low' ? 'good' : g.band === 'Medium' ? 'ok' : 'warn', badge: `${g.band} load`, note: 'GL = GI ÷ 100 × carbs. Unlike GI alone, load accounts for how much you actually eat - the number that drives glucose rise.' }
  },
  howItWorks: [
    { title: 'Find GI', text: 'Food index 0-100.' },
    { title: 'Weigh the carbs', text: 'Your serving in grams.' },
    { title: 'Multiply', text: 'GI/100 × carbs = GL.' },
  ],
  tips: [
    'Low GL < 10, medium 11-19, high 20+.',
    'Watermelon has high GI but low GL per serving.',
    'Portion size is the real lever on blood sugar.',
  ],
}

extrasDiabetesMentalGroup['mood-score-card'] = {
  id: 'mood-score-card',
  title: 'Daily Mood Score Card',
  description: 'Turn mood, energy, sleep and stress into a single daily snapshot out of 100.',
  icon: <HeartPulse className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'Rate today\u2019s mood, energy and stress, and log your sleep hours.',
  sub: ME,
  emoji: '🧠',
  accent: 'text-violet-600 bg-violet-50 border-violet-200',
  fields: [
    { key: 'mood', label: 'Mood (1-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 7' },
    { key: 'energy', label: 'Energy (1-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 6' },
    { key: 'sleep', label: 'Sleep last night (hours)', type: 'number', min: 0, max: 14, step: 0.5, placeholder: 'e.g. 7.5' },
    { key: 'stress', label: 'Stress (1-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 4' },
  ],
  compute: (values) => {
    const s = moodScoreCard(values.mood ?? NaN, values.energy ?? NaN, values.sleep ?? NaN, values.stress ?? NaN)
    if (s === null) return null
    return { title: 'Mood snapshot', value: s.toFixed(0), unit: '/100', tone: s >= 70 ? 'good' : s >= 45 ? 'ok' : 'warn', badge: s >= 70 ? 'Solid day' : s >= 45 ? 'Mixed day' : 'Tough day', note: 'Mood, energy, sleep and stress fold together. Trend this daily and patterns - not single days - reveal what truly helps.', pct: s }
  },
  howItWorks: [
    { title: 'Rate 4 inputs', text: 'Mood, energy, sleep, stress.' },
    { title: 'Blend weighted', text: 'Everything matters, mood most.' },
    { title: 'Watch the trend', text: 'Same card daily shows shifts.' },
  ],
  tips: [
    'Score at the same time each evening.',
    'A week of lows worth discussing with someone.',
    'Short records beat long, abandoned ones.',
  ],
}

extrasDiabetesMentalGroup['stress-coping-score'] = {
  id: 'stress-coping-score',
  title: 'Stress Coping Score',
  description: 'Count how many healthy coping habits you actually used this week.',
  icon: <Sprout className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'Tick the coping practices you used in the last week.',
  sub: ME,
  emoji: '🌿',
  accent: 'text-violet-600 bg-violet-50 border-violet-200',
  fields: [
    { key: 'move', label: 'Moved my body (even short walks)', type: 'bool' },
    { key: 'sleep', label: 'Protected 7-8h sleep most nights', type: 'bool' },
    { key: 'nature', label: 'Time outdoors or in daylight', type: 'bool' },
    { key: 'connect', label: 'Talked with a friend / family', type: 'bool' },
    { key: 'unplug', label: 'Screen-free break each day', type: 'bool' },
    { key: 'breathe', label: 'Slowed down / breathing pause', type: 'bool' },
  ],
  compute: (values) => {
    const n = stressCopingCount([values.move === 1, values.sleep === 1, values.nature === 1, values.connect === 1, values.unplug === 1, values.breathe === 1])
    if (n === null) return null
    return { title: 'Coping habits used', value: n.toFixed(0), unit: '/6', tone: n >= 5 ? 'good' : n >= 3 ? 'ok' : 'warn', badge: n >= 5 ? 'Toolkit is loaded' : n >= 3 ? 'Building your toolbox' : 'Pick one new habit this week', note: `You used ${n} of 6 healthy coping buckets. ${n < 2 ? 'Start with any single one - movement has the fastest payoff.' : 'Even one more active habit shifts weekly stress noticeably.'}`, pct: (n / 6) * 100 }
  },
  howItWorks: [
    { title: 'Reflect on the week', text: 'Which habits showed up?' },
    { title: 'Count the buckets', text: 'Out of six.' },
    { title: 'Read the balance', text: 'More buckets = steadier coping.' },
  ],
  tips: [
    'Aim for 3+ buckets most weeks.',
    'Replace one scroll session with one walk.',
    'Coping is a skillset, refreshed like any muscle.',
  ],
}

extrasDiabetesMentalGroup['resilience-score-card'] = {
  id: 'resilience-score-card',
  title: 'Resilience Score Card',
  description: 'A five-factor read of how well your buffers hold under pressure.',
  icon: <ShieldCheck className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'Rate each statement 1 (rarely) to 4 (almost always).',
  sub: ME,
  emoji: '🛡️',
  accent: 'text-violet-600 bg-violet-50 border-violet-200',
  fields: [
    { key: 'bounce', label: 'I bounce back after setbacks (1-4)', type: 'number', min: 1, max: 4, placeholder: 'e.g. 3' },
    { key: 'support', label: 'I have people I can turn to (1-4)', type: 'number', min: 1, max: 4, placeholder: 'e.g. 4' },
    { key: 'purpose', label: 'I feel my days have purpose (1-4)', type: 'number', min: 1, max: 4, placeholder: 'e.g. 3' },
    { key: 'adapt', label: 'I adapt when plans change (1-4)', type: 'number', min: 1, max: 4, placeholder: 'e.g. 2' },
    { key: 'care', label: 'I care for myself under stress (1-4)', type: 'number', min: 1, max: 4, placeholder: 'e.g. 2' },
  ],
  compute: (values) => {
    const r = resilienceScore([values.bounce ?? NaN, values.support ?? NaN, values.purpose ?? NaN, values.adapt ?? NaN, values.care ?? NaN])
    if (r === null) return null
    return { title: 'Resilience', value: r.total.toFixed(0), unit: '/20', tone: r.pct >= 70 ? 'good' : r.pct >= 40 ? 'ok' : 'warn', badge: r.band, note: 'Resilience is built, not fixed. Your lowest-rated factor is the first place to put a small habit.', pct: r.pct }
  },
  howItWorks: [
    { title: 'Self-rate 5 items', text: 'Each 1-4.' },
    { title: 'Sum to 20', text: 'Higher = stronger buffers.' },
    { title: 'Target the weak spot', text: 'Build one factor at a time.' },
  ],
  tips: [
    'Reaching out under stress IS a resilience skill.',
    'Purpose and connection are the biggest amplifiers.',
    'Re-score monthly to watch the build.',
  ],
}

extrasDiabetesMentalGroup['panic-attack-log'] = {
  id: 'panic-attack-log',
  title: 'Panic Attack Log',
  description: 'Log episode frequency, duration and intensity into an interference score.',
  icon: <Wind className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'Enter the last week\u2019s panic episodes and their typical length and strength.',
  sub: ME,
  emoji: '🌀',
  accent: 'text-violet-600 bg-violet-50 border-violet-200',
  fields: [
    { key: 'episodes', label: 'Episodes this week', type: 'number', min: 0, max: 30, placeholder: 'e.g. 2' },
    { key: 'duration', label: 'Typical duration (minutes)', type: 'number', min: 0, max: 120, placeholder: 'e.g. 15' },
    { key: 'intensity', label: 'Peak intensity (1-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 8' },
  ],
  compute: (values) => {
    const s = panicLog(values.episodes ?? NaN, values.duration ?? NaN, values.intensity ?? NaN)
    if (s === null) return null
    return { title: 'Panic interference', value: s.toFixed(0), unit: '/100', tone: s <= 25 ? 'good' : s <= 55 ? 'ok' : 'warn', badge: s <= 25 ? 'Occasional, manageable' : s <= 55 ? 'Interfering with days' : 'High interference - seek support', note: 'Frequency, not just strength, drives the score. Rising repeat episodes are a strong reason to see a clinician - this log gives concrete data to bring.', pct: s }
  },
  howItWorks: [
    { title: 'Count episodes', text: 'Over the last 7 days.' },
    { title: 'Log duration', text: 'Typical minutes per episode.' },
    { title: 'Rate intensity', text: 'Peak 0-10.' },
  ],
  tips: [
    'Grounding: name 5 things you see, hear, feel.',
    'Slow exhales longer than inhales calm the nervous system.',
    'Bring this log to your doctor - patterns speak.',
  ],
}

extrasDiabetesMentalGroup['rumination-check'] = {
  id: 'rumination-check',
  title: 'Rumination Check',
  description: 'Measure time and frequency lost to repetitive worry loops.',
  icon: <Repeat className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'Estimate how much of your day goes to the same replayed worry.',
  sub: ME,
  emoji: '🔁',
  accent: 'text-violet-600 bg-violet-50 border-violet-200',
  fields: [
    { key: 'hours', label: 'Hours lost to worry per day', type: 'number', min: 0, max: 24, step: 0.5, placeholder: 'e.g. 3' },
    { key: 'freq', label: 'Worry loops started per day', type: 'number', min: 0, max: 100, placeholder: 'e.g. 15' },
  ],
  compute: (values) => {
    const s = ruminationScore(values.hours ?? NaN, values.freq ?? NaN)
    if (s === null) return null
    return { title: 'Rumination load', value: s.toFixed(0), unit: '/100', tone: s <= 35 ? 'good' : s <= 65 ? 'ok' : 'warn', badge: s <= 35 ? 'Mind mostly at rest' : s <= 65 ? 'Frequent loops' : 'Heavy rumination', note: 'Rumination is worry on repeat - it feels productive but changes nothing. Time-boxing worry and writing it down interrupts the loop.', pct: s }
  },
  howItWorks: [
    { title: 'Log hours', text: 'Daily time in worry loops.' },
    { title: 'Count triggers', text: 'How often loops start.' },
    { title: 'Combine', text: 'Load = time + frequency.' },
  ],
  tips: [
    'Set a 15-minute \u201cworry window\u201d once a day.',
    'Write worries; paper empties the loop.',
    'Physical movement breaks mental circles fastest.',
  ],
}

extrasDiabetesMentalGroup['digital-detox-score'] = {
  id: 'digital-detox-score',
  title: 'Digital Detox Score',
  description: 'Score your phone-checking rhythm and unplugged time into focus health.',
  icon: <BatteryCharging className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'How often you check notifications, and how long you spent unplugged today.',
  sub: ME,
  emoji: '📵',
  accent: 'text-violet-600 bg-violet-50 border-violet-200',
  fields: [
    { key: 'check', label: 'Rough minutes between checks', type: 'number', min: 1, max: 120, placeholder: 'e.g. 20' },
    { key: 'unplug', label: 'Unplugged minutes today', type: 'number', min: 0, max: 480, placeholder: 'e.g. 90' },
  ],
  compute: (values) => {
    const s = digitalDetoxScore(values.check ?? NaN, values.unplug ?? NaN)
    if (s === null) return null
    return { title: 'Digital focus score', value: s.toFixed(0), unit: '/100', tone: s >= 70 ? 'good' : s >= 40 ? 'ok' : 'warn', badge: s >= 70 ? 'Attention is protected' : s >= 40 ? 'Interruptions drain you' : 'Phone owns the gaps', note: 'Fewer, bigger gaps between checks recover focus. Unplugged minutes rebuild attention reserves - both count here.', pct: s }
  },
  howItWorks: [
    { title: 'Time the gaps', text: 'Minutes without checking.' },
    { title: 'Log unplugged time', text: 'Today\u2019s total.' },
    { title: 'Blend the score', text: 'Gaps + true screen-free time.' },
  ],
  tips: [
    'Move apps off the home screen.',
    'One \u2018no phone\u2019 hour a day compounds fast.',
    'Silence non-essential notifications entirely.',
  ],
}

extrasDiabetesMentalGroup['self-compassion-check'] = {
  id: 'self-compassion-check',
  title: 'Self-Compassion Check',
  description: 'Rate kindness, mindfulness and common humanity toward yourself.',
  icon: <HandHeart className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'Rate each area 0-4 based on your last week.',
  sub: ME,
  emoji: '💗',
  accent: 'text-violet-600 bg-violet-50 border-violet-200',
  fields: [
    { key: 'kindness', label: 'Kind to myself when I fail (0-4)', type: 'number', min: 0, max: 4, placeholder: 'e.g. 2' },
    { key: 'mindful', label: 'I notice feelings without drowning (0-4)', type: 'number', min: 0, max: 4, placeholder: 'e.g. 3' },
    { key: 'humanity', label: 'I see struggles as human, not personal (0-4)', type: 'number', min: 0, max: 4, placeholder: 'e.g. 2' },
  ],
  compute: (values) => {
    const s = selfCompassionScore(values.kindness ?? NaN, values.mindful ?? NaN, values.humanity ?? NaN)
    if (s === null) return null
    return { title: 'Self-compassion', value: s.total.toFixed(0), unit: '/12', tone: s.pct >= 70 ? 'good' : s.pct >= 40 ? 'ok' : 'warn', badge: s.pct >= 70 ? 'Steady inner kindness' : s.pct >= 40 ? 'Building inner warmth' : 'Inner critic is loud', note: 'Self-compassion predicts resilience better than self-esteem. Talk to yourself like you would a friend - it is a trainable habit.', pct: s.pct }
  },
  howItWorks: [
    { title: 'Rate 3 pillars', text: 'Kindness, mindfulness, humanity.' },
    { title: 'Sum to 12', text: 'Higher = kind inner voice.' },
    { title: 'Pick the weak pillar', text: 'Practise it this week.' },
  ],
  tips: [
    'Reframe failure as data, not verdict.',
    'A gentle self-note beats a harsh inner critic.',
    'Common humanity: everyone struggles sometimes.',
  ],
}

extrasDiabetesMentalGroup['support-check'] = {
  id: 'support-check',
  title: 'Support Need Check',
  description: 'A reflective triage of when professional support is worth seeking.',
  icon: <PhoneCall className="h-6 w-6" />,
  breadcrumb: 'Health / Mental Wellness',
  instruction: 'Answer honestly - this is a self-check, not a diagnosis.',
  sub: ME,
  emoji: '🆘',
  accent: 'text-violet-600 bg-violet-50 border-violet-200',
  fields: [
    { key: 'hurt', label: 'I have had thoughts of harming myself', type: 'bool' },
    { key: 'weeks', label: 'Low mood or anxiety most days for 2+ weeks', type: 'bool' },
    { key: 'impact', label: 'It is hurting work, school or relationships', type: 'bool' },
  ],
  compute: (values) => {
    const r = supportCheck(values.hurt === 1, values.weeks === 1, values.impact === 1)
    if (r === null) return null
    return {
      title: 'Support level', value: `Level ${r.level}`, unit: '', tone: r.level === 0 ? 'good' : r.level === 1 ? 'ok' : r.level === 2 ? 'warn' : 'danger',
      badge: r.band,
      note: r.level === 3 ? 'If you are in crisis right now, contact a crisis line or emergency services immediately - you deserve safety now.' : 'Use this as a conversation starter with a doctor. Screening flags reasons to talk, not verdicts.',
    }
  },
  howItWorks: [
    { title: 'Answer 3 flags', text: 'Honest yes/no.' },
    { title: 'Read the level', text: '0-3 escalation.' },
    { title: 'Act on it', text: 'Match follow-up to urgency.' },
  ],
  tips: [
    'Self-harm or crisis thoughts = immediate professional contact.',
    'Two weeks of persistent lows is worth a screening.',
    'Your GP is a fine first stop - no referral needed.',
  ],
}