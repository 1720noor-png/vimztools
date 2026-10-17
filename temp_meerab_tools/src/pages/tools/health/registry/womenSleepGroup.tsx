import { CalendarHeart, Baby, Moon, Plane, TestTubes, ShieldCheck, Wheat, Scale } from 'lucide-react'
import type { HealthToolConfig } from '../HealthGenericTool'
import {
  naegeleDueDate, gestationalAge, lutealPhaseFertileWindow, acogPregnancyWeightGain,
  breastfeedingCalorieBonus, recommendedSleepHours, jetLagDays, quicki, pediatricBSA, infantAge,
} from '../../../../lib/health/womenSleep'
import { diabetesRiskScore, diabetesRiskBand, carbGramPerKgTarget } from '../../../../lib/health/mentalDiabetes'

const WO = "Women's Health"
const SL = 'Sleep & Recovery'
const DI = 'Diabetes & Blood Sugar'
const BA = 'Baby & Kids'

export const womenSleepGroup: Record<string, HealthToolConfig> = {}

womenSleepGroup['pregnancy-due-date'] = {
  id: 'pregnancy-due-date',
  title: 'Pregnancy Due Date Calculator',
  description: 'Estimate a due date from the first day of the last menstrual period (LMP).',
  icon: <CalendarHeart className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter the first day of your last menstrual period.',
  sub: WO,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [{ key: 'lmp', label: 'Last menstrual period (date)', type: 'date' }],
  compute: (values) => {
    if (values.lmp === null) return null
    const due = naegeleDueDate(new Date(values.lmp).toISOString().slice(0, 10))
    if (due === null) return null
    const label = due.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    return { title: 'Estimated due date', value: label, unit: '', tone: 'good', badge: "Naegele's rule (+ 280 days)", note: 'Only ~4% of babies arrive exactly on the due date - usually within 2 weeks either side.' }
  },
  howItWorks: [
    { title: 'Enter LMP date', text: 'First day of the last period.' },
    { title: 'Add 280 days', text: '40 weeks \u00d7 7 days gives the classic estimate.' },
    { title: 'Let ultrasound refine it', text: 'Early ultrasound dating often adjusts the guess.' },
  ],
  tips: [
    'Early ultrasound dating is usually more accurate than LMP alone.',
    'The 280-day count assumes a 28-day cycle with day-14 ovulation.',
    'Share the estimate with your maternity care team for planning.',
  ],
}

womenSleepGroup['gestational-age'] = {
  id: 'gestational-age',
  title: 'Gestational Age Check',
  description: 'Work out current pregnancy week and day from your LMP.',
  icon: <CalendarHeart className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter the first day of your last menstrual period.',
  sub: WO,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [{ key: 'lmp', label: 'Last menstrual period (date)', type: 'date' }],
  compute: (values) => {
    if (values.lmp === null) return null
    const ga = gestationalAge(new Date(values.lmp).toISOString().slice(0, 10))
    if (ga === null) return null
    const trimester = ga.weeks < 13 ? 'First trimester' : ga.weeks < 27 ? 'Second trimester' : 'Third trimester'
    return { title: 'Gestational age', value: `${ga.weeks}w ${ga.days}d`, unit: '', tone: 'good', badge: trimester, note: 'Trimester boundaries are approximate - personalised dating comes from scans.' }
  },
  howItWorks: [
    { title: 'Enter your LMP', text: 'First day of last period.' },
    { title: 'We count the days', text: 'Days since LMP become weeks + days.' },
    { title: 'See the trimester', text: 'A rough stage label appears from the week count.' },
  ],
  tips: [
    'Early pregnancy symptoms and periods both move the estimate.',
    'Scans between 8-13 weeks give the most reliable dating.',
    "Ask your team which dating they're using for milestones.",
  ],
}

womenSleepGroup['fertile-window-finder'] = {
  id: 'fertile-window-finder',
  title: 'Fertile Window Finder',
  description: 'Estimate your fertile window from an average cycle length.',
  icon: <CalendarHeart className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter your average cycle length in days (21-45).',
  sub: WO,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [{ key: 'cycle', label: 'Cycle length (days)', type: 'number', min: 21, max: 45, placeholder: 'e.g. 28' }],
  compute: (values) => {
    const w = lutealPhaseFertileWindow(values.cycle ?? NaN)
    if (w === null) return null
    return { title: 'Estimated fertile window', value: `Days ${w.fertileStart}-${w.fertileEnd}`, unit: 'of cycle', tone: 'ok', badge: `Ovulation \u2248 day ${w.ovulationDay}`, note: 'Assumes a fixed ~14-day luteal phase - tracking symptoms or tests improves accuracy.' }
  },
  howItWorks: [
    { title: 'Know your cycle length', text: 'Average days from one period start to the next.' },
    { title: 'Back-calculate ovulation', text: 'Ovulation \u2248 cycle length - 14.' },
    { title: 'Window = 5 days before + 1 after', text: 'Sperm survive days, so the fertile window starts early.' },
  ],
  tips: [
    'Cycle length varies month to month - track several cycles.',
    'Combine with BBT or LH strips for a firmer answer.',
    'This is planning help, not full fertility advice.',
  ],
}

womenSleepGroup['pregnancy-weight-gain'] = {
  id: 'pregnancy-weight-gain',
  title: 'Pregnancy Weight Gain Guide',
  description: 'See IOM/ACOG-inspired weight gain ranges based on starting BMI.',
  icon: <Scale className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter your pre-pregnancy BMI.',
  sub: WO,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [{ key: 'bmi', label: 'Pre-pregnancy BMI', type: 'number', step: 0.1, placeholder: 'e.g. 22' }],
  compute: (values) => {
    const r = acogPregnancyWeightGain(values.bmi ?? NaN)
    if (r === null) return null
    return { title: 'Suggested gain range', value: `${r.lowKg}-${r.highKg}`, unit: 'kg total', tone: 'good', badge: r.label, note: 'Ranges are population guidance - individual plans vary with twins, health and history.' }
  },
  howItWorks: [
    { title: 'Enter starting BMI', text: 'From your pre-pregnancy weight and height.' },
    { title: 'Match your category', text: 'Underweight, normal, overweight or obese.' },
    { title: 'Read the range', text: 'Total gain for the whole pregnancy.' },
  ],
  tips: [
    'Gain is not linear - little early, most in the third trimester.',
    'Let your care team personalise the advice.',
    'Focus on food quality rather than the scale alone.',
  ],
}

womenSleepGroup['breastfeeding-calories'] = {
  id: 'breastfeeding-calories',
  title: 'Breastfeeding Calorie Bonus',
  description: 'Estimate the extra daily calories often suggested while breastfeeding.',
  icon: <Baby className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter months since birth (up to ~12+).',
  sub: WO,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [{ key: 'months', label: 'Months postpartum', type: 'number', placeholder: 'e.g. 4' }],
  compute: (values) => {
    const kcal = breastfeedingCalorieBonus(values.months ?? NaN)
    if (kcal === null) return null
    return { title: 'Extra calories suggested', value: kcal.toFixed(0), unit: 'kcal/day', tone: 'ok', badge: 'On top of maintenance', note: 'Numbers come from general dietary guidance - appetite and supply should lead.' }
  },
  howItWorks: [
    { title: 'Enter months since birth', text: '0-6, 7-12, or later.' },
    { title: 'Apply the bonus tier', text: '~500 kcal early, ~400 at 7-12 months, ~300 after.' },
    { title: 'Add to maintenance', text: 'Aim for your maintenance plus the bonus.' },
  ],
  tips: [
    'Frequent feeding burns more - follow hunger signals.',
    'Hydration is as important as calories.',
    'If supply drops, review sleep, fluids and intake with a lactation consultant.',
  ],
}

womenSleepGroup['sleep-requirement'] = {
  id: 'sleep-requirement',
  title: 'Recommended Sleep by Age',
  description: 'Find the sleep duration range experts recommend for your age.',
  icon: <Moon className="h-6 w-6" />,
  breadcrumb: 'Health / Sleep & Recovery',
  instruction: 'Enter age in years (use 0 for babies under 1).',
  sub: SL,
  emoji: '💤',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [{ key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 34' }],
  compute: (values) => {
    const r = recommendedSleepHours(values.age ?? NaN)
    if (r === null) return null
    return { title: 'Recommended sleep', value: `${r.low}-${r.high}`, unit: 'hours', tone: 'good', badge: 'U.S. consensus ranges', note: 'These are population bands - quality and consistency matter as much as exact hours.' }
  },
  howItWorks: [
    { title: 'Enter your age', text: 'We map to age-band recommendations.' },
    { title: 'Read the range', text: 'Adult bands shrink with age.' },
    { title: 'Match your needs', text: 'Try to land inside the window most nights.' },
  ],
  tips: [
    'Consistent bedtimes beat occasional longer sleeps.',
    'Short naps won\u2019t fix a chronic nightly shortfall.',
    'Poor sleep persisting for weeks deserves a sleep review.',
  ],
}

womenSleepGroup['jet-lag-recovery'] = {
  id: 'jet-lag-recovery',
  title: 'Jet Lag Recovery Planner',
  description: 'Estimate how many days jet lag usually takes after crossing time zones.',
  icon: <Plane className="h-6 w-6" />,
  breadcrumb: 'Health / Sleep & Recovery',
  instruction: 'Enter the time-zone shift and whether you flew east or west.',
  sub: SL,
  emoji: '💤',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'shift', label: 'Time zones crossed', type: 'number', min: 1, max: 12, placeholder: 'e.g. 6' },
    { key: 'dir', label: 'Direction', type: 'select', options: [{ value: '0', label: 'East' }, { value: '1', label: 'West' }] },
  ],
  compute: (values) => {
    const d = jetLagDays(values.shift ?? NaN, values.dir === 1 ? 'west' : 'east')
    if (d === null) return null
    return { title: 'Estimated recovery', value: d.toFixed(1), unit: 'days', tone: 'ok', badge: values.dir === 1 ? 'West travel (usually easier)' : 'East travel', note: 'Eastward jet lag is typically tougher because resetting earlier is harder.' }
  },
  howItWorks: [
    { title: 'Count the shift', text: 'Hours your body clock must move.' },
    { title: 'Adjust for direction', text: 'Westbound recovers slightly faster.' },
    { title: 'Read the estimate', text: 'About 0.6 days per eastward hour, less westbound.' },
  ],
  tips: [
    'Shift meals and sleep toward destination times before flying.',
    'Get morning light after landing - it resets the clock.',
    'Short-acting sleep aids cautiously, only per advice.',
  ],
}

womenSleepGroup['quicki-check'] = {
  id: 'quicki-check',
  title: 'QUICKI Insulin Sensitivity',
  description: 'Estimate insulin sensitivity with the QUICKI index from fasting labs.',
  icon: <TestTubes className="h-6 w-6" />,
  breadcrumb: 'Health / Diabetes & Blood Sugar',
  instruction: 'Enter fasting insulin (µU/mL) and fasting glucose (mg/dL).',
  sub: DI,
  emoji: '🩸',
  accent: 'text-violet-600 bg-violet-50 border-violet-200',
  fields: [
    { key: 'insulin', label: 'Fasting insulin (\u00b5U/mL)', type: 'number', placeholder: 'e.g. 10' },
    { key: 'glucose', label: 'Fasting glucose (mg/dL)', type: 'number', placeholder: 'e.g. 92' },
  ],
  compute: (values) => {
    const q = quicki(values.insulin ?? NaN, values.glucose ?? NaN)
    if (q === null) return null
    return { title: 'QUICKI index', value: q.toFixed(3), unit: '', tone: q < 0.34 ? 'warn' : 'good', badge: q < 0.34 ? 'Suggests lower insulin sensitivity' : 'Within typical range', note: 'QUICKI = 1 / (log10 insulin + log10 glucose). Research use - interpret with a clinician.' }
  },
  howItWorks: [
    { title: 'Use fasting labs', text: 'Insulin and glucose must be fasting.' },
    { title: 'Log both values', text: 'Log10 of each, summed.' },
    { title: 'Invert the sum', text: 'The reciprocal is QUICKI.' },
  ],
  tips: [
    'Fasting is required - usually 8-12 hours.',
    'Clamp tests remain the gold standard; QUICKI is an estimate.',
    'Discuss results with your diabetes/metabolic care team.',
  ],
}

womenSleepGroup['diabetes-risk-check'] = {
  id: 'diabetes-risk-check',
  title: 'Type 2 Diabetes Risk Check',
  description: 'A lifestyle-based snapshot of type 2 diabetes risk factors.',
  icon: <ShieldCheck className="h-6 w-6" />,
  breadcrumb: 'Health / Diabetes & Blood Sugar',
  instruction: 'Answer five quick questions about age and risk factors.',
  sub: DI,
  emoji: '🩸',
  accent: 'text-violet-600 bg-violet-50 border-violet-200',
  fields: [
    { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 48' },
    { key: 'female', label: 'Female sex', type: 'bool' },
    { key: 'htn', label: 'High blood pressure or on treatment', type: 'bool' },
    { key: 'sedentary', label: 'Physically inactive most days', type: 'bool' },
    { key: 'fam', label: 'Close family member with diabetes', type: 'bool' },
  ],
  compute: (values) => {
    const score = diabetesRiskScore(values.age ?? NaN, values.female === 1, values.htn === 1, values.sedentary === 1, values.fam === 1)
    if (score === null) return null
    const band = diabetesRiskBand(score)
    return {
      title: 'Risk factor score',
      value: score.toFixed(0),
      unit: 'points',
      tone: score > 5 ? 'warn' : score > 2 ? 'ok' : 'good',
      badge: band,
      note: 'A quick screen inspired by common risk questionnaires - not a blood-test substitute.',
    }
  },
  howItWorks: [
    { title: 'Answer the questions', text: 'Age plus four lifestyle/medical factors.' },
    { title: 'Points add up', text: 'Each factor contributes its weight.' },
    { title: 'Read the band', text: 'Low / moderate / higher risk zones.' },
  ],
  tips: [
    'The best screen remains a fasting glucose or HbA1c blood test.',
    'Weight loss of 5-10% strongly lowers lifetime diabetes risk.',
    'Use the result to motivate a screening appointment.',
  ],
}

womenSleepGroup['daily-carb-target'] = {
  id: 'daily-carb-target',
  title: 'Daily Carb Target by Style',
  description: 'Estimate daily carb grams for keto, moderate, or liberal eating patterns.',
  icon: <Wheat className="h-6 w-6" />,
  breadcrumb: 'Health / Diabetes & Blood Sugar',
  instruction: 'Enter weight and choose a carb style.',
  sub: DI,
  emoji: '🩸',
  accent: 'text-violet-600 bg-violet-50 border-violet-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 70' },
    { key: 'style', label: 'Carb style', type: 'select', options: [{ value: '0', label: 'Keto (0.5 g/kg)' }, { value: '1', label: 'Moderate (2.2 g/kg)' }, { value: '2', label: 'Liberal (3.5 g/kg)' }] },
  ],
  compute: (values) => {
    const style = values.style
    const s = style === 0 ? 'keto' : style === 2 ? 'liberal' : 'moderate'
    const g = carbGramPerKgTarget(values.weight ?? NaN, s)
    if (g === null) return null
    return { title: 'Daily carb target', value: g.toFixed(0), unit: 'g/day', tone: 'ok', badge: s.charAt(0).toUpperCase() + s.slice(1), note: 'For people with diabetes, actual targets come from your glucose patterns and care plan.' }
  },
  howItWorks: [
    { title: 'Enter body weight', text: 'Kilograms, current weight.' },
    { title: 'Pick the pattern', text: 'Keto, moderate, or liberal carb style.' },
    { title: 'Multiply per kg', text: 'g/kg \u00d7 weight = daily grams.' },
  ],
  tips: [
    'Keto is not required for diabetes management - many styles work.',
    'Fiber-rich carb sources are easier on glucose.',
    'Check with your care team before big carb changes if on medication.',
  ],
}

womenSleepGroup['infant-age'] = {
  id: 'infant-age',
  title: 'Infant Age Calculator',
  description: 'Convert a baby\u2019s birth date into weeks and days old.',
  icon: <Baby className="h-6 w-6" />,
  breadcrumb: 'Health / Baby & Kids',
  instruction: 'Enter the baby\u2019s date of birth.',
  sub: BA,
  emoji: '👶',
  accent: 'text-sky-600 bg-sky-50 border-sky-200',
  fields: [{ key: 'dob', label: 'Date of birth', type: 'date' }],
  compute: (values) => {
    if (values.dob === null) return null
    const age = infantAge(new Date(values.dob).toISOString().slice(0, 10))
    if (age === null) return null
    return { title: 'Baby\u2019s age', value: `${age.weeks} weeks ${age.days} days`, unit: '', tone: 'good', badge: age.days === 0 ? 'Whole weeks' : 'Weeks + days', note: 'Great for feeding schedules, growth checks and milestone windows.' }
  },
  howItWorks: [
    { title: 'Enter the birth date', text: 'Day the baby was born.' },
    { title: 'Count from then to now', text: 'Total days become weeks and days.' },
    { title: 'Use for schedules', text: 'Feeds, sleep windows and growth check-ins.' },
  ],
  tips: [
    'Most baby schedules are based on weeks since birth.',
    'Recheck after milestone weights and length visits.',
    'Ask your pediatrician about corrected age for prematurity.',
  ],
}

womenSleepGroup['pediatric-bsa'] = {
  id: 'pediatric-bsa',
  title: 'Child Body Surface Area (BSA)',
  description: 'Estimate a child\u2019s body surface area with the Mosteller formula.',
  icon: <Scale className="h-6 w-6" />,
  breadcrumb: 'Health / Baby & Kids',
  instruction: 'Enter the child\u2019s height and weight.',
  sub: BA,
  emoji: '👶',
  accent: 'text-sky-600 bg-sky-50 border-sky-200',
  fields: [
    { key: 'height', label: 'Height (cm)', type: 'number', placeholder: 'e.g. 120' },
    { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 25' },
  ],
  compute: (values) => {
    const bsa = pediatricBSA(values.height ?? NaN, values.weight ?? NaN)
    if (bsa === null) return null
    return { title: 'Body surface area', value: bsa.toFixed(2), unit: 'm\u00b2', tone: 'ok', badge: 'Mosteller formula', note: 'BSA is frequently used to scale medication doses and IV fluids for children.' }
  },
  howItWorks: [
    { title: 'Enter height and weight', text: 'Recent measurements both needed.' },
    { title: 'Apply Mosteller', text: 'BSA = \u221a(height \u00d7 weight / 3600).' },
    { title: 'Read m\u00b2', text: 'Standard square metres value.' },
  ],
  tips: [
    'BSA changes quickly as kids grow - use fresh measurements.',
    'Dosing calculators are tools; a pharmacist confirms doses.',
    'Never scale adult doses without professional guidance.',
  ],
}