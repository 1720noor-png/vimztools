import { Baby, Milk, Droplets, Scale, Ruler, Sparkles, Thermometer, Sun, SmilePlus, Pill, Clock, Repeat, CalendarClock, Timer, AlertTriangle, Coins, SlidersHorizontal } from 'lucide-react'
import type { HealthToolConfig } from '../HealthGenericTool'
import {
  feedingInterval, milkVolumePerFeed, diaperCountByAge, percentileBand,
  milestoneForAge, feverDoseMg, nextGrowthSpurt, teethingStage,
} from '../../../../lib/health/babyCare'
import {
  spacedDosingTimes, daysOfSupply, missedDoseAdvice, interactionTier,
  steadyStateDays, monthlyCost, doseUnitConvert, daysToExpiry,
} from '../../../../lib/health/medicationPlan'

const BK = 'Baby & Kids'
const MED = 'Medication'

const M2 = [
  { value: '1', label: 'Other / unsorted' },
  { value: '2', label: 'NSAID (ibuprofen, naproxen)' },
  { value: '3', label: 'Blood thinner (warfarin, DOAC)' },
  { value: '4', label: 'SSRI antidepressant' },
  { value: '5', label: 'Metformin' },
  { value: '6', label: 'Statin (atorvastatin, etc.)' },
]
const LABEL: Record<string, string> = { 1: 'Other', 2: 'NSAID', 3: 'Blood thinner', 4: 'SSRI', 5: 'Metformin', 6: 'Statin' }

export const extrasBabyMedGroup: Record<string, HealthToolConfig> = {}

extrasBabyMedGroup['baby-feeding-interval'] = {
  id: 'baby-feeding-interval',
  title: 'Baby Feeding Interval Guide',
  description: 'See the typical feeding rhythm for your baby\u2019s age.',
  icon: <Milk className="h-6 w-6" />,
  breadcrumb: 'Health / Baby & Kids',
  instruction: 'Enter your baby\u2019s age in days.',
  sub: BK,
  emoji: '🍼',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'age', label: 'Baby\u2019s age (days)', type: 'number', min: 0, max: 365, placeholder: 'e.g. 21' },
  ],
  compute: (values) => {
    const r = feedingInterval(values.age ?? NaN)
    if (r === null) return null
    return { title: 'Typical rhythm', value: `${r.minHrs}-${r.maxHrs}`, unit: 'h between', tone: 'good', badge: r.perDay, note: 'Babies cluster-feed and drop wake feeds as they grow. Feed on demand - these are ranges, not rules.' }
  },
  howItWorks: [
    { title: 'Enter age', text: 'Days since birth.' },
    { title: 'Read the band', text: '2-3h, 3-4h, or 4-5h.' },
    { title: 'Watch hunger cues', text: 'Crying is a late cue.' },
  ],
  tips: [
    'Early cues: rooting, lip smacking, hand chewing.',
    'Newborns often feed 8-12 times per day.',
    'Wet nappies are the best hydration check.',
  ],
}

extrasBabyMedGroup['baby-milk-volume'] = {
  id: 'baby-milk-volume',
  title: 'Baby Milk Volume Estimator',
  description: 'Estimate a typical volume per feed from weight and age.',
  icon: <Droplets className="h-6 w-6" />,
  breadcrumb: 'Health / Baby & Kids',
  instruction: 'Enter your baby\u2019s weight in kg and age in months.',
  sub: BK,
  emoji: '🥛',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', min: 1, max: 40, step: 0.1, placeholder: 'e.g. 4.5' },
    { key: 'age', label: 'Age (months)', type: 'number', min: 0, max: 24, placeholder: 'e.g. 1' },
  ],
  compute: (values) => {
    const ml = milkVolumePerFeed(values.weight ?? NaN, values.age ?? NaN)
    if (ml === null) return null
    return { title: 'Typical per feed', value: ml.toFixed(0), unit: 'ml', tone: 'ok', badge: `~${values.weight} kg total ~150 ml/kg/day`, note: 'A rough guide using 150 ml/kg/day split across feeds. Breastfed babies self-regulate - volume matters most for bottle-fed formula.' }
  },
  howItWorks: [
    { title: 'Weigh baby', text: 'Current kg.' },
    { title: 'Find age', text: 'In months.' },
    { title: 'Split the day', text: '150 ml/kg ÷ feeds.' },
  ],
  tips: [
    'Growth, not volume, is the real metric.',
    'Paced bottle feeding helps avoid overfeeding.',
    'Wonder weeks and spells affect appetite - briefly.',
  ],
}

extrasBabyMedGroup['baby-diaper-count'] = {
  id: 'baby-diaper-count',
  title: 'Diaper Count Check',
  description: 'Typical wet-diaper counts by age - a simple hydration signal.',
  icon: <Baby className="h-6 w-6" />,
  breadcrumb: 'Health / Baby & Kids',
  instruction: 'Enter your baby\u2019s age in months.',
  sub: BK,
  emoji: '🚼',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'age', label: 'Age (months)', type: 'number', min: 0, max: 48, placeholder: 'e.g. 3' },
  ],
  compute: (values) => {
    const d = diaperCountByAge(values.age ?? NaN)
    if (d === null) return null
    return { title: 'Typical wet diapers', value: `${d.min}-${d.max}`, unit: '/day', tone: 'ok', badge: `Age ${values.age} months`, note: 'Wet diapers are the everyday hydration check for babies who cannot tell you. A drop below the range, or days with none, needs a professional look.' }
  },
  howItWorks: [
    { title: 'Note age', text: 'Months.' },
    { title: 'Read the range', text: 'Expected wet diapers/day.' },
    { title: 'Count today', text: 'Compare honestly.' },
  ],
  tips: [
    '6+ wet diapers daily is a solid newborn signal.',
    'Dark or scanty urine in babies = call for advice.',
    'After ~6 months, solids change the pattern.',
  ],
}

extrasBabyMedGroup['baby-weight-percentile'] = {
  id: 'baby-weight-percentile',
  title: 'Baby Weight Percentile Estimator',
  description: 'Compare your baby\u2019s weight against a simplified typical band.',
  icon: <Scale className="h-6 w-6" />,
  breadcrumb: 'Health / Baby & Kids',
  instruction: 'Enter weight in kg and age in months (0-24).',
  sub: BK,
  emoji: '⚖️',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', min: 1, max: 40, step: 0.1, placeholder: 'e.g. 7.9' },
    { key: 'age', label: 'Age (months)', type: 'number', min: 0, max: 24, placeholder: 'e.g. 6' },
  ],
  compute: (values) => {
    const w = percentileBand(values.weight ?? NaN, values.age ?? NaN, 'weight')
    if (w === null) return null
    return { title: 'Weight band', value: `${w.z > 0 ? '+' : ''}${w.z}`, unit: 'SD', tone: Math.abs(w.z) <= 1 ? 'good' : Math.abs(w.z) <= 2 ? 'ok' : 'warn', badge: w.band, note: `Simplified typical average for this age is about ${w.expected.toFixed(1)} kg. Growth velocity (the curve) matters far more than any single point.` }
  },
  howItWorks: [
    { title: 'Weigh accurately', text: 'Same scale, minimal clothes.' },
    { title: 'Enter age', text: 'Completed months.' },
    { title: 'Read the band', text: 'How far from typical average.' },
  ],
  tips: [
    'Every baby charts their own curve.',
    'Per-centile drops across growth charts > single visits.',
    'Boys and girls use different WHO charts.',
  ],
}

extrasBabyMedGroup['baby-length-percentile'] = {
  id: 'baby-length-percentile',
  title: 'Baby Length Percentile Estimator',
  description: 'Compare your baby\u2019s length against a simplified typical band.',
  icon: <Ruler className="h-6 w-6" />,
  breadcrumb: 'Health / Baby & Kids',
  instruction: 'Enter length in cm and age in months (0-24).',
  sub: BK,
  emoji: '📏',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'length', label: 'Length (cm)', type: 'number', min: 40, max: 110, step: 0.5, placeholder: 'e.g. 66' },
    { key: 'age', label: 'Age (months)', type: 'number', min: 0, max: 24, placeholder: 'e.g. 5' },
  ],
  compute: (values) => {
    const l = percentileBand(values.length ?? NaN, values.age ?? NaN, 'length')
    if (l === null) return null
    return { title: 'Length band', value: `${l.z > 0 ? '+' : ''}${l.z}`, unit: 'SD', tone: Math.abs(l.z) <= 1 ? 'good' : Math.abs(l.z) <= 2 ? 'ok' : 'warn', badge: l.band, note: `Typical average length for this age is about ${l.expected} cm. Genetics and measurement technique both shift this number.` }
  },
  howItWorks: [
    { title: 'Measure flat', text: 'Lying down, legs straight.' },
    { title: 'Enter age', text: 'Completed months.' },
    { title: 'Read the band', text: 'SD distance from average.' },
  ],
  tips: [
    'Length curves track pace, not one visit.',
    'Hard to measure squirming babies - repeat twice.',
    'Focus on steady progress over exact centiles.',
  ],
}

extrasBabyMedGroup['baby-milestones-check'] = {
  id: 'baby-milestones-check',
  title: 'Baby Milestones Check',
  description: 'See what skills are typical to expect around your baby\u2019s age.',
  icon: <Sparkles className="h-6 w-6" />,
  breadcrumb: 'Health / Baby & Kids',
  instruction: 'Enter your baby\u2019s age in months.',
  sub: BK,
  emoji: '🌟',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'age', label: 'Age (months)', type: 'number', min: 0, max: 36, placeholder: 'e.g. 4' },
  ],
  compute: (values) => {
    const m = milestoneForAge(values.age ?? NaN)
    if (m === null) return null
    return { title: 'What to look for', value: `${values.age} months`, unit: '', tone: 'ok', badge: 'Typical developmental windows', note: m + ' Ranges are broad - early or late by a few weeks is normal. Aim for the overall pattern, not each checkbox.' }
  },
  howItWorks: [
    { title: 'Enter age', text: 'Current months.' },
    { title: 'Read the window', text: 'Skills typical near this age.' },
    { title: 'Note delays', text: 'Consistent gaps = screening chat.' },
  ],
  tips: [
    'Premature babies work from corrected age.',
    'One skipped skill is not a red flag by itself.',
    'Early intervention works best when started early.',
  ],
}

extrasBabyMedGroup['baby-fever-dose'] = {
  id: 'baby-fever-dose',
  title: 'Baby Fever Dose Guide',
  description: 'See the standard paracetamol dose range by weight (educational only).',
  icon: <Thermometer className="h-6 w-6" />,
  breadcrumb: 'Health / Baby & Kids',
  instruction: 'Enter your child\u2019s weight in kg.',
  sub: BK,
  emoji: '🤒',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', min: 1, max: 120, step: 0.1, placeholder: 'e.g. 12' },
  ],
  compute: (values) => {
    const d = feverDoseMg(values.weight ?? NaN)
    if (d === null) return null
    return { title: 'Per-dose max (15 mg/kg)', value: d.perDose.toFixed(0), unit: 'mg', tone: 'ok', badge: `Up to ${d.maxPerDay.toFixed(0)} mg per day`, note: 'Informational only - always use the product\u2019s syringe for the measured formula concentration and check with your pharmacist or doctor for your child.' }
  },
  howItWorks: [
    { title: 'Weigh the child', text: 'kg today.' },
    { title: 'Apply 15 mg/kg', text: 'Standard paracetamol dose.' },
    { title: 'Space 4-6h', text: 'No more than 4 doses/day.' },
  ],
  tips: [
    'Never double up acetaminophen products.',
    'Fever is a sign, not the enemy - comfort the child.',
    'Under 3 months with fever: call your doctor.',
  ],
}

extrasBabyMedGroup['growth-spurt-planner'] = {
  id: 'growth-spurt-planner',
  title: 'Growth Spurt Planner',
  description: 'Know when the next fussy, feed-hungry growth spurt is coming.',
  icon: <Sun className="h-6 w-6" />,
  breadcrumb: 'Health / Baby & Kids',
  instruction: 'Enter your baby\u2019s age in weeks.',
  sub: BK,
  emoji: '🌱',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'age', label: 'Age (weeks)', type: 'number', min: 0, max: 110, placeholder: 'e.g. 10' },
  ],
  compute: (values) => {
    const s = nextGrowthSpurt(values.age ?? NaN)
    if (s === null) return null
    return { title: 'Next expected spurt', value: s, unit: '', tone: 'ok', badge: 'Growth spurts are temporary', note: 'Spurts bring extra feeding, fussing and sleep changes for 2-3 days - then a growth jump. Expect them, ride them out.' }
  },
  howItWorks: [
    { title: 'Enter age', text: 'In weeks.' },
    { title: 'Find next window', text: 'Known spurt ages listed.' },
    { title: 'Prepare', text: 'Extra snuggles and feeds.' },
  ],
  tips: [
    'Cluster feeding is normal during spurts.',
    'Sleep may briefly get worse before it gets better.',
    'Weight jumps confirm the spurt did its job.',
  ],
}

extrasBabyMedGroup['baby-teething-schedule'] = {
  id: 'baby-teething-schedule',
  title: 'Baby Teething Schedule',
  description: 'See which teeth typically arrive around your baby\u2019s age.',
  icon: <SmilePlus className="h-6 w-6" />,
  breadcrumb: 'Health / Baby & Kids',
  instruction: 'Enter your baby\u2019s age in months.',
  sub: BK,
  emoji: '🦷',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'age', label: 'Age (months)', type: 'number', min: 0, max: 40, placeholder: 'e.g. 9' },
  ],
  compute: (values) => {
    const t = teethingStage(values.age ?? NaN)
    if (t === null) return null
    const present = t.present.length ? t.present.join(', ') : 'Tiny buds - nothing cutting yet'
    return { title: 'Teething stage', value: `${values.age} months`, unit: '', tone: 'ok', badge: present, note: t.next ? `Often up next: ${t.next}. Timing is very variable - order matters more than exact weeks.` : 'All primary teeth in or close - the full set usually arrives by ~2.5 years.' }
  },
  howItWorks: [
    { title: 'Enter age', text: 'Months.' },
    { title: 'Read the order', text: 'Incisors, then molars/canines.' },
    { title: 'Sooth, don\u2019t fear', text: 'Chewing helps; gels with care.' },
  ],
  tips: [
    'Cold washcloths beat over-the-counter gels.',
    'Teething does not cause real fevers - check anyway.',
    'Brush the new tooth the moment it appears.',
  ],
}

extrasBabyMedGroup['dose-time-planner'] = {
  id: 'dose-time-planner',
  title: 'Dose Time Planner',
  description: 'Evenly spread daily doses across waking hours for any schedule.',
  icon: <Clock className="h-6 w-6" />,
  breadcrumb: 'Health / Medication',
  instruction: 'Enter how many times per day the medicine is taken.',
  sub: MED,
  emoji: '💊',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'doses', label: 'Doses per day', type: 'select', options: [{ value: '1', label: '1 (daily)' }, { value: '2', label: '2 (bid)' }, { value: '3', label: '3 (tid)' }, { value: '4', label: '4 (qid)' }] },
  ],
  compute: (values) => {
    const s = spacedDosingTimes(values.doses ?? 2)
    if (s === null) return null
    return { title: 'Suggested times', value: s.times.join(' · '), unit: '', tone: 'ok', badge: `Every ${s.intervalHrs}`, note: 'Even spacing keeps medicine levels steady. Anchor against your meals and sleep and set phone alarms - consistency is how these work.' }
  },
  howItWorks: [
    { title: 'Pick dose count', text: '1-4 per day.' },
    { title: 'Split 24 hours', text: 'Even waking spacing.' },
    { title: 'Set reminders', text: 'Alarm = adherence.' },
  ],
  tips: [
    'Twice daily ≈ every 12 hours, tripled ≈ 8 hours.',
    'Some meds are food-bound - read the label.',
    'Repeat the same schedule on weekends too.',
  ],
}

extrasBabyMedGroup['med-supply-stock'] = {
  id: 'med-supply-stock',
  title: 'Medication Supply Days',
  description: 'See how long your remaining pills will last at your dose.',
  icon: <Pill className="h-6 w-6" />,
  breadcrumb: 'Health / Medication',
  instruction: 'Enter pills remaining and how many doses you take per day.',
  sub: MED,
  emoji: '💊',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'units', label: 'Tablets / doses remaining', type: 'number', min: 0, max: 1000, placeholder: 'e.g. 30' },
    { key: 'perDay', label: 'Doses per day', type: 'number', min: 1, max: 24, placeholder: 'e.g. 1' },
  ],
  compute: (values) => {
    const days = daysOfSupply(values.units ?? NaN, values.perDay ?? NaN)
    if (days === null) return null
    return { title: 'Supply lasts', value: days.toFixed(0), unit: 'days', tone: days >= 5 ? 'good' : days >= 2 ? 'ok' : 'warn', badge: `Reorder when ~${Math.max(7, Math.ceil(days / 5) * 7)} days out`, note: 'Reorder before the last few days - pharmacies and refills take time. Set the reminder now.' }
  },
  howItWorks: [
    { title: 'Count remaining', text: 'Units on hand.' },
    { title: 'Enter daily dose', text: 'Units per day.' },
    { title: 'Divide', text: 'Units ÷ daily dose.' },
  ],
  tips: [
    'Refill windows usually open ~7 days early.',
    'Store meds away from heat and humidity.',
    'Set a recurring reminder to reorder monthly.',
  ],
}

extrasBabyMedGroup['missed-dose-helper'] = {
  id: 'missed-dose-helper',
  title: 'Missed Dose Helper',
  description: 'General steps for a missed dose based on how often you take it.',
  icon: <Repeat className="h-6 w-6" />,
  breadcrumb: 'Health / Medication',
  instruction: 'Choose how often the medicine is normally taken.',
  sub: MED,
  emoji: '🔄',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'interval', label: 'Usual dosing interval', type: 'select', options: [{ value: '1', label: 'Every 1-2 hours (tightening)' }, { value: '4', label: 'Every 4 hours' }, { value: '6', label: 'Every 6 hours' }, { value: '8', label: 'Every 8 hours (tid)' }, { value: '12', label: 'Every 12 hours (bid)' }, { value: '24', label: 'Once daily' }] },
  ],
  compute: (values) => {
    const a = missedDoseAdvice(values.interval ?? 8)
    if (a === null) return null
    return { title: 'What to do', value: 'General rule', unit: '', tone: 'warn', badge: 'Never double up', note: a + ' Check your specific medication leaflet - some classes have their own rules, and insulin or thinning agents have urgent ones.' }
  },
  howItWorks: [
    { title: 'Note the gap', text: 'How late are you?' },
    { title: 'Apply generic rule', text: 'Asap, unless next dose soon.' },
    { title: 'Never double', text: 'One missed ≠ two now.' },
  ],
  tips: [
    'Birth control and antibiotics have specific windows.',
    'Set a second alarm as your catch-all.',
    'Log missed doses for your pharmacy or doctor.',
  ],
}

extrasBabyMedGroup['med-interaction-check'] = {
  id: 'med-interaction-check',
  title: 'Medication Interaction Check',
  description: 'A quick risk-tier read across common medicine families (informational).',
  icon: <AlertTriangle className="h-6 w-6" />,
  breadcrumb: 'Health / Medication',
  instruction: 'Pick the two medicine families you take.',
  sub: MED,
  emoji: '⚠️',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'a', label: 'Medicine A', type: 'select', options: M2 } ,
    { key: 'b', label: 'Medicine B', type: 'select', options: M2 },
  ],
  compute: (values) => {
    if (values.a === null || values.b === null) return null
    const a = (values.a === 2 ? 'nsaid' : values.a === 3 ? 'anticoag' : values.a === 4 ? 'ssri' : values.a === 5 ? 'metformin' : values.a === 6 ? 'statin' : 'other') as string
    const b = (values.b === 2 ? 'nsaid' : values.b === 3 ? 'anticoag' : values.b === 4 ? 'ssri' : values.b === 5 ? 'metformin' : values.b === 6 ? 'statin' : 'other') as string
    const a0 = interactionTier(a, b)
    if (a0 === null) return null
    return { title: 'Interaction tier', value: 'Review', unit: '', tone: a0.startsWith('High') ? 'danger' : a0.startsWith('Watch') ? 'warn' : 'ok', badge: `${LABEL[values.a]} + ${LABEL[values.b]}`, note: a0 }
  },
  howItWorks: [
    { title: 'Pick two medicines', text: 'From common families.' },
    { title: 'Check the pairing', text: 'Against known patterns.' },
    { title: 'Confirm with a pro', text: 'Pharmacy keeps the full list.' },
  ],
  tips: [
    'Herbs and supplements interact too - list them.',
    'Grapefruit juice alters many medicine levels.',
    'Bring your full list to any pharmacist visit.',
  ],
}

extrasBabyMedGroup['half-life-steady-state'] = {
  id: 'half-life-steady-state',
  title: 'Half-Life to Steady State',
  description: 'Estimate when a medicine reaches steady state from its half-life.',
  icon: <Timer className="h-6 w-6" />,
  breadcrumb: 'Health / Medication',
  instruction: 'Enter the medicine\u2019s half-life in hours (check the leaflet).',
  sub: MED,
  emoji: '⏱️',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'hl', label: 'Half-life (hours)', type: 'number', min: 0.5, max: 720, step: 0.5, placeholder: 'e.g. 24' },
  ],
  compute: (values) => {
    const d = steadyStateDays(values.hl ?? NaN)
    if (d === null) return null
    return { title: 'Steady state in about', value: d.toFixed(0), unit: 'days', tone: 'ok', badge: '~5 half-lives', note: 'Full effect builds over about 5 half-lives. Missing days around then resets progress - consistency really matters for long-acting meds.' }
  },
  howItWorks: [
    { title: 'Find half-life', text: 'On the leaflet in hours.' },
    { title: 'Multiply by 5', text: 'Time to steady state.' },
    { title: 'Plan effects', text: 'Don\u2019t judge day 1.' },
  ],
  tips: [
    'Some meds take weeks regardless - half-life is a guide.',
    'Every person metabolizes a bit differently.',
    'Tell your doctor if effects never seem to arrive.',
  ],
}

extrasBabyMedGroup['med-monthly-cost'] = {
  id: 'med-monthly-cost',
  title: 'Medication Monthly Cost',
  description: 'Estimate your 30-day spend from cost per dose and daily count.',
  icon: <Coins className="h-6 w-6" />,
  breadcrumb: 'Health / Medication',
  instruction: 'Enter the cost of one dose and how many you take per day.',
  sub: MED,
  emoji: '💰',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'cost', label: 'Cost per dose (your currency)', type: 'number', min: 0, max: 1000, step: 0.01, placeholder: 'e.g. 2.5' },
    { key: 'perDay', label: 'Doses per day', type: 'number', min: 1, max: 24, placeholder: 'e.g. 2' },
  ],
  compute: (values) => {
    const c = monthlyCost(values.cost ?? NaN, values.perDay ?? NaN)
    if (c === null) return null
    return { title: 'Monthly cost', value: c.toFixed(2), unit: '', tone: 'ok', badge: '30.4-day month used', note: 'Compare generic vs brand and check pharmacy discount plans - for chronic meds the yearly number is surprisingly large.' }
  },
  howItWorks: [
    { title: 'Price one dose', text: 'Per tablet/unit.' },
    { title: 'Times daily count', text: 'Doses per day.' },
    { title: 'Times ~30', text: 'Roughly a month.' },
  ],
  tips: [
    'Generics usually cost a fraction of brands.',
    '90-day supplies often cost less per dose.',
    'Discount card sites can beat in-store pricing.',
  ],
}

extrasBabyMedGroup['dose-unit-converter'] = {
  id: 'dose-unit-converter',
  title: 'Dose Unit Converter (mg / mcg)',
  description: 'Convert medicine amounts between milligrams and micrograms.',
  icon: <SlidersHorizontal className="h-6 w-6" />,
  breadcrumb: 'Health / Medication',
  instruction: 'Enter the amount and pick the direction.',
  sub: MED,
  emoji: '🔢',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'value', label: 'Amount', type: 'number', min: 0, max: 1000000, step: 0.1, placeholder: 'e.g. 0.5' },
    { key: 'from', label: 'Convert from', type: 'select', options: [{ value: '1', label: 'mg' }, { value: '2', label: 'mcg' }] },
    { key: 'to', label: 'Convert to', type: 'select', options: [{ value: '1', label: 'mg' }, { value: '2', label: 'mcg' }] },
  ],
  compute: (values) => {
    const from = values.from === 2 ? 'mcg' : 'mg'
    const to = values.to === 2 ? 'mcg' : 'mg'
    const r = doseUnitConvert(values.value ?? NaN, from, to)
    if (r === null) return null
    return { title: `Converted amount`, value: r.toLocaleString('en-US', { maximumFractionDigits: 2 }), unit: to, tone: 'ok', badge: `1 mg = 1000 mcg`, note: 'Liquid formulations list per-mL strength - always read the concentration when converting drops, nebulizers or syringes.' }
  },
  howItWorks: [
    { title: 'Enter amount', text: 'Current value.' },
    { title: 'Choose direction', text: 'mg \u2194 mcg.' },
    { title: 'Read the result', text: '1000 \u00d7 for mg\u2192mcg.' },
  ],
  tips: [
    'mcg stands for microgram (not mg!).',
    'A decimal \u201cleaning\u201d here can be 1000x wrong.',
    'Double-check with your pharmacist on anything critical.',
  ],
}

extrasBabyMedGroup['med-expiry-check'] = {
  id: 'med-expiry-check',
  title: 'Medication Expiry Check',
  description: 'See how many days a medicine has before it expires.',
  icon: <CalendarClock className="h-6 w-6" />,
  breadcrumb: 'Health / Medication',
  instruction: 'Enter the expiry date printed on the package.',
  sub: MED,
  emoji: '🗓️',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'exp', label: 'Expiry date', type: 'date' },
  ],
  compute: (values) => {
    if (values.exp === null) return null
    const iso = new Date(values.exp).toISOString().slice(0, 10)
    const d = daysToExpiry(iso)
    if (d === null) return null
    return { title: 'Days until expiry', value: d.toFixed(0), unit: 'days', tone: d > 30 ? 'good' : d > 7 ? 'ok' : 'warn', badge: d === 0 ? 'Expired today' : `Expires ${iso}`, note: d === 0 ? 'Expired medicines can lose potency - replace them.' : 'Most meds stay effective until the printed date. beyond it, effectiveness slowly drops - check each one before relying on it.' }
  },
  howItWorks: [
    { title: 'Read the date', text: 'MM/YYYY on the pack.' },
    { title: 'Compare to today', text: 'Days difference.' },
    { title: 'Decide', text: 'Reorder soon; purge old stock.' },
  ],
  tips: [
    'Liquid meds expire sooner once opened.',
    'Creams and inhalers carry special warnings.',
    'Declare old meds at your pharmacy - don\u2019t flush them.',
  ],
}