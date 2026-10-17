import {
  Smile, Sparkles, Thermometer, Droplet, Wind, Moon, ShieldCheck, Activity,
  Timer, Gauge, Heart, Droplets, Flower2, Sun, BatteryCharging, Waves, Brain, Repeat,
} from 'lucide-react'
import type { HealthToolConfig } from '../HealthGenericTool'
import {
  brushingHabitScore, brushingScoreBand, flossingStatus, whiteningFrequency,
  fluorideCoverage, dryMouthScore, dryMouthBand, badBreathScore, badBreathBand,
  gumHealthScore, gumHealthBand, scalpHealthScore, scalpHealthBand, hairWashFrequency,
  skinMoistureRoutine, moleAwarenessScore, moleAwarenessBand,
} from '../../../../lib/health/dentalBeauty.ts'
import {
  rhinitisScore, rhinitisBand, soreThroatScore, soreThroatBand, coughScore,
  headacheSeverity, nauseaScore, nauseaBand, diarrheaStatus, constipationScore,
  constipationBand, lymphNodeScore, rashScore, rashBand, dizzinessScore,
  fatigueScore, fatigueBand, insomniaScore, insomniaBand, eyeStrainScore,
  eyeStrainBand, refluxScore, refluxBand,
} from '../../../../lib/health/symptomChecks.ts'

const DE = 'Dental Health'
const HS = 'Hair & Skin'
const SY = 'Symptoms & Self-Check'

export const extrasDentalBeautySymptomGroup: Record<string, HealthToolConfig> = {}

extrasDentalBeautySymptomGroup['brushing-habit-score'] = {
  id: 'brushing-habit-score',
  title: 'Brushing Habit Score',
  description: 'Turn your daily brushing and flossing habits into a 0-100 oral-care score.',
  icon: <Smile className="h-6 w-6" />,
  breadcrumb: 'Health / Dental Health',
  instruction: 'Answer three short habit questions.',
  sub: DE,
  emoji: '🦷',
  accent: 'text-blue-600 bg-blue-50 border-blue-200',
  fields: [
    { key: 'count', label: 'Times you brush per day', type: 'number', min: 0, max: 4, placeholder: 'e.g. 2' },
    { key: 'duration', label: 'Duration of a typical brush (min)', type: 'number', min: 0, max: 10, step: 0.5, placeholder: 'e.g. 2' },
    { key: 'flossDays', label: 'Days you floss per week', type: 'number', min: 0, max: 7, placeholder: 'e.g. 7' },
    { key: 'tongue', label: 'I clean my tongue', type: 'bool' },
    { key: 'soft', label: 'I use a soft-bristle brush', type: 'bool' },
  ],
  compute: (values) => {
    const s = brushingHabitScore(values.count ?? NaN, values.duration ?? NaN, values.flossDays ?? NaN, values.tongue === 1, values.soft === 1)
    if (s === null) return null
    return { title: 'Brushing habit score', value: s.toFixed(0), unit: '/100', tone: s >= 80 ? 'good' : s >= 60 ? 'ok' : s >= 40 ? 'warn' : 'warn', badge: brushingScoreBand(s), note: 'Two minutes, twice a day, plus daily flossing and tongue cleaning carries most of the points.' }
  },
  howItWorks: [
    { title: 'Enter habits', text: 'Count, duration, flossing.' },
    { title: 'Add extras', text: 'Tongue cleaning and soft bristles.' },
    { title: 'Get the score', text: '0-100 with a band.' },
  ],
  tips: [
    'Split 2 minutes into quadrants of 30 s.',
    'Floss before you brush - it distributes fluoride.',
    'Replace the brush every 3 months.',
  ],
}

extrasDentalBeautySymptomGroup['flossing-schedule-check'] = {
  id: 'flossing-schedule-check',
  title: 'Flossing Schedule Status',
  description: 'See where your flossing routine sits vs the daily gold standard.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Dental Health',
  instruction: 'Enter the days per week you currently floss.',
  sub: DE,
  emoji: '🦷',
  accent: 'text-blue-600 bg-blue-50 border-blue-200',
  fields: [
    { key: 'days', label: 'Days flossing per week', type: 'number', min: 0, max: 7, placeholder: 'e.g. 3' },
  ],
  compute: (values) => {
    const f = flossingStatus(values.days ?? NaN)
    if (f === null) return null
    return { title: 'Flossing status', value: `${f.times}`, unit: 'days/week', tone: f.times >= 7 ? 'good' : f.times >= 4 ? 'ok' : 'warn', badge: f.band, note: 'Daily flossing reaches the ~40% of tooth surfaces a brush alone misses.' }
  },
  howItWorks: [
    { title: 'Count your days', text: 'Times flossed last week.' },
    { title: 'Compare to 7', text: 'Daily is the target.' },
    { title: 'Read the band', text: 'Building, almost daily, or daily.' },
  ],
  tips: [
    'Tie flossing to brushing - same routine slot.',
    'Keep a roll at your desk to lower friction.',
    'Waxed floss is easier for tight contacts.',
  ],
}

extrasDentalBeautySymptomGroup['teeth-whitening-check'] = {
  id: 'teeth-whitening-check',
  title: 'Teeth Whitening Frequency',
  description: 'Check your whitening frequency against enamel-safety guidance.',
  icon: <Sparkles className="h-6 w-6" />,
  breadcrumb: 'Health / Dental Health',
  instruction: 'Enter how often you whiten and whether your teeth are sensitive.',
  sub: DE,
  emoji: '🦷',
  accent: 'text-blue-600 bg-blue-50 border-blue-200',
  fields: [
    { key: 'sessions', label: 'Whitening sessions per month', type: 'number', min: 0, max: 30, placeholder: 'e.g. 2' },
    { key: 'sensitive', label: 'My teeth are often sensitive', type: 'bool' },
  ],
  compute: (values) => {
    const w = whiteningFrequency(values.sessions ?? NaN, values.sensitive === 1)
    if (w === null) return null
    return { title: 'Whitening frequency', value: `${values.sessions}/month`, unit: '', tone: w.band === 'Low frequency' ? 'good' : 'warn', badge: w.band, note: w.note }
  },
  howItWorks: [
    { title: 'Count sessions', text: 'Per month, all methods.' },
    { title: 'Note sensitivity', text: 'A guard for enamel comfort.' },
    { title: 'Read the verdict', text: 'Low, moderate or high frequency.' },
  ],
  tips: [
    'More teeth whitening is not always better.',
    'Over-the-counter kits should follow the box caps.',
    'Sensitivity that lingers calls for a dentist check.',
  ],
}

extrasDentalBeautySymptomGroup['fluoride-coverage'] = {
  id: 'fluoride-coverage',
  title: 'Fluoride Coverage Check',
  description: 'Check how many core fluoride sources you use for cavity protection.',
  icon: <ShieldCheck className="h-6 w-6" />,
  breadcrumb: 'Health / Dental Health',
  instruction: 'Tick the fluoride sources that apply to you.',
  sub: DE,
  emoji: '🦷',
  accent: 'text-blue-600 bg-blue-50 border-blue-200',
  fields: [
    { key: 'water', label: 'Tap water is fluoridated where I live', type: 'bool' },
    { key: 'paste', label: 'Toothpaste contains fluoride', type: 'bool' },
    { key: 'varnish', label: 'Dentist-applied fluoride (varnish/rinse)', type: 'bool' },
  ],
  compute: (values) => {
    const f = fluorideCoverage(values.water === 1, values.paste === 1, values.varnish === 1)
    if (f === null) return null
    return { title: 'Fluoride coverage', value: f.count.toFixed(0), unit: '/3 sources', tone: f.count >= 2 ? 'good' : f.count === 1 ? 'ok' : 'warn', badge: f.band, note: 'Fluoride strengthens enamel and repairs early decay. Adults get most of it from toothpaste plus fluoridated water.' }
  },
  howItWorks: [
    { title: 'Tick your sources', text: 'Water, paste, dentist.' },
    { title: 'Count them', text: '0 to 3.' },
    { title: 'Read the coverage', text: 'Two-plus is the strong zone.' },
  ],
  tips: [
    'Look for 1,000-1,500 ppm fluoride on the tube.',
    'Don\u2019t rinse straight after brushing - let it sit.',
    'Kids should use an age-appropriate pea-size smear.',
  ],
}

extrasDentalBeautySymptomGroup['dry-mouth-check'] = {
  id: 'dry-mouth-check',
  title: 'Dry Mouth Check',
  description: 'Screen for common dry-mouth (xerostomia) markers and triggers.',
  icon: <Droplet className="h-6 w-6" />,
  breadcrumb: 'Health / Dental Health',
  instruction: 'Tick the signals that describe your mouth right now.',
  sub: DE,
  emoji: '💧',
  accent: 'text-blue-600 bg-blue-50 border-blue-200',
  fields: [
    { key: 'dry', label: 'Dry, sticky-feeling throat or mouth', type: 'bool' },
    { key: 'sticky', label: 'Saliva feels thick or sticky', type: 'bool' },
    { key: 'night', label: 'Wake thirsty at night', type: 'bool' },
    { key: 'sips', label: 'Need sips of water through the day', type: 'bool' },
    { key: 'sjogren', label: 'Pair with dry eyes (possible Sjogren trait)', type: 'bool' },
  ],
  compute: (values) => {
    const s = dryMouthScore(values.dry === 1, values.sticky === 1, values.night === 1, values.sips === 1, values.sjogren === 1)
    if (s === null) return null
    return { title: 'Dry-mouth signals', value: s.toFixed(0), unit: '/5', tone: s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: dryMouthBand(s), note: 'Saliva protects teeth and digestion. Persistent dryness can come from medications, mouth breathing or other conditions - dental follow-up helps.' }
  },
  howItWorks: [
    { title: 'Tick the markers', text: 'Five common signals.' },
    { title: 'Count them', text: 'Score 0-5.' },
    { title: 'Read the band', text: 'Occasional to pronounced.' },
  ],
  tips: [
    'Room air is drier with heating or AC on.',
    'Sugar-free gum and sips of water help.', 
    'Salt-rinse or hydration are first-line nudges.',
  ],
}

extrasDentalBeautySymptomGroup['bad-breath-check'] = {
  id: 'bad-breath-check',
  title: 'Bad Breath Check',
  description: 'Spot the everyday causes behind persistent bad breath (halitosis).',
  icon: <Wind className="h-6 w-6" />,
  breadcrumb: 'Health / Dental Health',
  instruction: 'Tick the factors that are usually true for you.',
  sub: DE,
  emoji: '🫁',
  accent: 'text-blue-600 bg-blue-50 border-blue-200',
  fields: [
    { key: 'tongue', label: 'White-coated tongue', type: 'bool' },
    { key: 'dry', label: 'Dry mouth often', type: 'bool' },
    { key: 'gums', label: 'Gums bleed when brushing', type: 'bool' },
    { key: 'drip', label: 'Post-nasal drip / allergies', type: 'bool' },
    { key: 'garlic', label: 'Garlic/onion-rich diet', type: 'bool' },
  ],
  compute: (values) => {
    const s = badBreathScore(values.tongue === 1, values.dry === 1, values.gums === 1, values.drip === 1, values.garlic === 1)
    if (s === null) return null
    return { title: 'Halitosis clues', value: s.toFixed(0), unit: '/5', tone: s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: badBreathBand(s), note: 'Most bad breath starts on the tongue and between teeth. Gums that bleed need a dentist, not just mint.' }
  },
  howItWorks: [
    { title: 'Tick the causes', text: 'Five everyday triggers.' },
    { title: 'Count them', text: 'Score 0-5.' },
    { title: 'Read the mix', text: 'One cause vs several.' },
  ],
  tips: [
    'Brush the tongue surface or use a scraper.',
    'Floss once a day to reach the odor zone.',
    'Persistent smell despite care = dental appointment.',
  ],
}

extrasDentalBeautySymptomGroup['gum-health-check'] = {
  id: 'gum-health-check',
  title: 'Gum Health Check',
  description: 'Screen for signs of gum inflammation (gingivitis) worth a dentist look.',
  icon: <Heart className="h-6 w-6" />,
  breadcrumb: 'Health / Dental Health',
  instruction: 'Tick the gum signs you have noticed lately.',
  sub: DE,
  emoji: '❤️',
  accent: 'text-blue-600 bg-blue-50 border-blue-200',
  fields: [
    { key: 'bleed', label: 'Gums bleed when I brush or floss', type: 'bool' },
    { key: 'redness', label: 'Gums look red rather than pink', type: 'bool' },
    { key: 'swell', label: 'Gums look puffy or swollen', type: 'bool' },
    { key: 'recede', label: 'Gums pulling back from teeth', type: 'bool' },
    { key: 'taste', label: 'Bad taste even with good brushing', type: 'bool' },
  ],
  compute: (values) => {
    const s = gumHealthScore(values.bleed === 1, values.redness === 1, values.swell === 1, values.recede === 1, values.taste === 1)
    if (s === null) return null
    return { title: 'Gum signs', value: s.toFixed(0), unit: '/5', tone: s >= 4 ? 'danger' : s >= 2 ? 'warn' : 'ok', badge: gumHealthBand(s), note: 'Bleeding gums are the classic gingivitis signal - usually reversible with better cleaning and a professional clean.' }
  },
  howItWorks: [
    { title: 'Inspect the gums', text: 'Look and feel for five signs.' },
    { title: 'Count them', text: 'Score 0-5.' },
    { title: 'Route to care', text: 'Higher scores point to the dentist.' },
  ],
  tips: [
    'Healthy gums rarely bleed during brushing.',
    'Angle the brush 45\u00b0 into the gum line.',
    'Receding gums and new gaps need professional input.',
  ],
}

extrasDentalBeautySymptomGroup['scalp-health-check'] = {
  id: 'scalp-health-check',
  title: 'Scalp Health Check',
  description: 'Rate common scalp imbalance signals like dandruff, oil and itching.',
  icon: <Sparkles className="h-6 w-6" />,
  breadcrumb: 'Health / Hair & Skin',
  instruction: 'Tick the signals your scalp shows week to week.',
  sub: HS,
  emoji: '💇',
  accent: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
  fields: [
    { key: 'dandruff', label: 'Visible dandruff flakes', type: 'bool' },
    { key: 'dry', label: 'Scalp feels dry or tight', type: 'bool' },
    { key: 'oily', label: 'Scalp gets oily quickly', type: 'bool' },
    { key: 'itch', label: 'Frequent itching', type: 'bool' },
    { key: 'flakes', label: 'Flaking even after washing', type: 'bool' },
  ],
  compute: (values) => {
    const s = scalpHealthScore(values.dandruff === 1, values.dry === 1, values.oily === 1, values.itch === 1, values.flakes === 1)
    if (s === null) return null
    return { title: 'Scalp signals', value: s.toFixed(0), unit: '/5', tone: s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: scalpHealthBand(s), note: 'Dandruff, oil and itch often mean the scalp microbiome or moisture balance is off - shampoo choice and frequency matter.' }
  },
  howItWorks: [
    { title: 'Notice scalp states', text: 'Five common signals.' },
    { title: 'Count them', text: 'Score 0-5.' },
    { title: 'Read the band', text: 'Calm to visibly bothered.' },
  ],
  tips: [
    'Let damp-but-not-wet hair and scalp cool.',
    'Anti-dandruff shampoos need contact time.',
    'Persistent itch with flakes is worth a check-up.',
  ],
}

extrasDentalBeautySymptomGroup['hair-wash-frequency'] = {
  id: 'hair-wash-frequency',
  title: 'Hair Wash Frequency Plan',
  description: 'Get a realistic weekly wash cadence based on your scalp type.',
  icon: <Droplets className="h-6 w-6" />,
  breadcrumb: 'Health / Hair & Skin',
  instruction: 'Pick your scalp type and how often you style your hair.',
  sub: HS,
  emoji: '💇',
  accent: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
  fields: [
    { key: 'scalp', label: 'Scalp type', type: 'select', options: [{ value: '1', label: 'Normal' }, { value: '2', label: 'Oily' }, { value: '3', label: 'Dry' }, { value: '4', label: 'Dandruff-prone' }] },
    { key: 'styling', label: 'Days I style hair per week', type: 'number', min: 1, max: 7, placeholder: 'e.g. 4' },
  ],
  compute: (values) => {
    const h = hairWashFrequency(values.scalp ?? NaN, values.styling ?? NaN)
    if (h === null) return null
    return { title: 'Suggested washes', value: h.washesPerWeek.toFixed(0), unit: 'per week', tone: 'ok', badge: h.band, note: 'There is no universal rule - oily scalps tolerate more washing; dry and curly hair benefits from less. Adjust to how your scalp feels after 2 weeks.' }
  },
  howItWorks: [
    { title: 'Pick style phase', text: 'Oily, normal, dry, dandruff.' },
    { title: 'Note styling days', text: 'For real-world rhythm.' },
    { title: 'Read the cadence', text: 'Adjust up or down.' },
  ],
  tips: [
    'Over-washing dry hair strips protective oils.',
    'Under-washing oily scalps lets sebum build up.',
    'Warm water, not hot, keeps scalp calmer.',
  ],
}

extrasDentalBeautySymptomGroup['skin-moisture-plan'] = {
  id: 'skin-moisture-plan',
  title: 'Skin Moisture Plan',
  description: 'Build a small, seasonal-proof moisturizing routine for your skin type.',
  icon: <Flower2 className="h-6 w-6" />,
  breadcrumb: 'Health / Hair & Skin',
  instruction: 'Pick your face/body skin type and tick environmental factors.',
  sub: HS,
  emoji: '🌸',
  accent: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
  fields: [
    { key: 'type', label: 'Skin type', type: 'select', options: [{ value: '1', label: 'Oily' }, { value: '2', label: 'Combination / normal' }, { value: '3', label: 'Dry' }, { value: '4', label: 'Sensitive' }] },
    { key: 'season', label: 'Cold dry season where I live', type: 'bool' },
    { key: 'heat', label: 'Heated indoor air much of the day', type: 'bool' },
    { key: 'shower', label: 'Long hot showers are my habit', type: 'bool' },
  ],
  compute: (values) => {
    const m = skinMoistureRoutine(values.type ?? NaN, values.season === 1, values.heat === 1, values.shower === 1)
    if (m === null) return null
    return { title: 'Plan goals', value: m.count.toFixed(0), unit: 'steps', tone: m.count >= 4 ? 'good' : m.count >= 2 ? 'ok' : 'warn', badge: m.band, note: m.goals.join('; ') }
  },
  howItWorks: [
    { title: 'Pick the type', text: 'Four common categories.' },
    { title: 'Add environment', text: 'Season, heating, showers.' },
    { title: 'Read the goal list', text: 'Two to six habit steps.' },
  ],
  tips: [
    'Apply moisturizer within 3 minutes of washing.',
    'Dry winter air usually means a thicker product.',
    'Sensitive skin: fewer ingredients, fragrance-free.',
  ],
}

extrasDentalBeautySymptomGroup['mole-awareness-check'] = {
  id: 'mole-awareness-check',
  title: 'Mole Awareness Check',
  description: 'Review personal factors that raise the value of regular skin self-checks.',
  icon: <Sun className="h-6 w-6" />,
  breadcrumb: 'Health / Hair & Skin',
  instruction: 'Tick the statements that apply to your skin history.',
  sub: HS,
  emoji: '🔍',
  accent: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
  fields: [
    { key: 'many', label: 'More than 30 moles', type: 'bool' },
    { key: 'changed', label: 'A mole has changed shape/color', type: 'bool' },
    { key: 'itch', label: 'A mole itches or bleeds', type: 'bool' },
    { key: 'family', label: 'Family history of skin cancer', type: 'bool' },
    { key: 'sunburns', label: 'History of severe sunburns', type: 'bool' },
  ],
  compute: (values) => {
    const s = moleAwarenessScore(values.many === 1, values.changed === 1, values.itch === 1, values.family === 1, values.sunburns === 1)
    if (s === null) return null
    return { title: 'Awareness score', value: s.toFixed(0), unit: '/5', tone: s >= 3 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: moleAwarenessBand(s), note: 'This is a self-check reminder, not a diagnosis. The ABCDE rule (Asymmetry, Border, Colour, Diameter, Evolving) guides what to show a dermatologist.' }
  },
  howItWorks: [
    { title: 'Reflect on moles', text: 'Count, changes, symptoms.' },
    { title: 'Add risk history', text: 'Family and sunburns.' },
    { title: 'Read the band', text: 'Route to self-checks or a review.' },
  ],
  tips: [
    'New mole after age 30 is worth attention.',
    'Use the back of a mirror or ask a partner.',
    'A changing mole deserves an actual consult.',
  ],
}

extrasDentalBeautySymptomGroup['hayfever-check'] = {
  id: 'hayfever-check',
  title: 'Hay Fever Symptom Check',
  description: 'Score the classic allergic-rhinitis pattern from your current symptoms.',
  icon: <Wind className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Tick the symptoms you notice, especially during a pollen season.',
  sub: SY,
  emoji: '🤧',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'sneeze', label: 'Sneezing in bursts', type: 'bool' },
    { key: 'runny', label: 'Runny or blocked nose', type: 'bool' },
    { key: 'eyes', label: 'Itchy, watery eyes', type: 'bool' },
    { key: 'nitch', label: 'Itchy nose or palate', type: 'bool' },
    { key: 'congest', label: 'Congestion that lingers', type: 'bool' },
    { key: 'season', label: 'Comes and goes with seasons', type: 'bool' },
  ],
  compute: (values) => {
    const s = rhinitisScore(values.sneeze === 1, values.runny === 1, values.eyes === 1, values.nitch === 1, values.congest === 1, values.season === 1)
    if (s === null) return null
    return { title: 'Rhinitis score', value: s.toFixed(0), unit: '/6', tone: s >= 5 ? 'warn' : s >= 3 ? 'ok' : 'good', badge: rhinitisBand(s), note: 'Itchy eyes plus seasonal rhythm are the strongest hay-fever hints. A pharmacist can advise antihistamine options.' }
  },
  howItWorks: [
    { title: 'Tick symptoms', text: 'Six allergy markers.' },
    { title: 'Count them', text: 'Score 0-6.' },
    { title: 'Read the shape', text: 'Allergy-shaped or not.' },
  ],
  tips: [
    'Shower and change clothes after outdoor time.',
    'Keep windows closed on high-pollen days.',
    'Eye itch + seasonal pattern leans allergy.',
  ],
}

extrasDentalBeautySymptomGroup['sore-throat-check'] = {
  id: 'sore-throat-check',
  title: 'Sore Throat Check',
  description: 'Screen a sore throat for infection clues worth a professional look.',
  icon: <Thermometer className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Enter your symptoms and how long the sore throat has lasted.',
  sub: SY,
  emoji: '🩺',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'pain', label: 'Painful swallowing', type: 'bool' },
    { key: 'fever', label: 'Fever', type: 'bool' },
    { key: 'glands', label: 'Swollen neck glands', type: 'bool' },
    { key: 'patches', label: 'White patches on tonsils', type: 'bool' },
    { key: 'days', label: 'Duration (days)', type: 'number', min: 0, max: 30, placeholder: 'e.g. 3' },
  ],
  compute: (values) => {
    const s = soreThroatScore(values.pain === 1, values.fever === 1, values.glands === 1, values.patches === 1, values.days ?? NaN)
    if (s === null) return null
    return { title: 'Throat score', value: s.toFixed(0), unit: '/6', tone: s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: soreThroatBand(s), note: 'Most sore throats are viral and settle in a week. Fever with white patches or pain past 10 days leans toward a strep-style review.' }
  },
  howItWorks: [
    { title: 'Rate your symptoms', text: 'Five clues.' },
    { title: 'Factor the duration', text: 'Longer adds points.' },
    { title: 'Read the score', text: 'Higher = more review worthy.' },
  ],
  tips: [
    'Sip warm fluids and rest the voice.',
    'Honey in warm water can calm a viral throat.',
    'Difficulty breathing or swallowing is urgent.',
  ],
}

extrasDentalBeautySymptomGroup['cough-check'] = {
  id: 'cough-check',
  title: 'Cough Assessment',
  description: 'Weigh your cough type, duration and companions for a sensible next step.',
  icon: <Wind className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Pick your cough type and fill in the details.',
  sub: SY,
  emoji: '😷',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'type', label: 'Cough type', type: 'select', options: [{ value: '1', label: 'Dry tickle' }, { value: '2', label: 'Wet / productive' }, { value: '3', label: 'Both at different times' }] },
    { key: 'night', label: 'Worse at night or lying down', type: 'bool' },
    { key: 'fever', label: 'Fever present', type: 'bool' },
    { key: 'weeks', label: 'How long it has lasted (weeks)', type: 'number', min: 0, max: 52, placeholder: 'e.g. 1' },
    { key: 'smoke', label: 'I smoke or vape', type: 'bool' },
  ],
  compute: (values) => {
    const c = coughScore(values.type ?? NaN, values.night === 1, values.fever === 1, values.weeks ?? NaN, values.smoke === 1)
    if (c === null) return null
    return { title: 'Cough score', value: c.score.toFixed(0), unit: 'points', tone: c.score >= 4 ? 'warn' : c.score >= 2 ? 'ok' : 'good', badge: c.band, note: 'Most coughs clear within 3 weeks. A lingering cough past 3-8 weeks, or with fever, deserves a clinical look.' }
  },
  howItWorks: [
    { title: 'Type the cough', text: 'Dry, wet, or mixed.' },
    { title: 'Add context', text: 'Night, fever, weeks, smoking.' },
    { title: 'Read the band', text: 'Short-lived vs review worthy.' },
  ],
  tips: [
    'Hydration and steam help a dry cough.',
    'Post-nasal drip is a sneaky night-cough cause.',
    'Blood in sputum = urgent medical contact.',
  ],
}

extrasDentalBeautySymptomGroup['headache-severity-check'] = {
  id: 'headache-severity-check',
  title: 'Headache Severity Check',
  description: 'Rate headache severity and spot sudden-onset red flags.',
  icon: <Brain className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Rate your pain and tick the warning features that apply.',
  sub: SY,
  emoji: '🤕',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'pain', label: 'Pain level right now', type: 'select', options: [{ value: '0', label: '0' }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' }, { value: '7', label: '7' }, { value: '8', label: '8' }, { value: '9', label: '9' }, { value: '10', label: '10' }] },
    { key: 'nausea', label: 'Felt sick or nauseated', type: 'bool' },
    { key: 'light', label: 'Bothered by light or noise', type: 'bool' },
    { key: 'worst', label: 'Sudden worst headache of my life', type: 'bool' },
    { key: 'stiff', label: 'Stiff neck with the headache', type: 'bool' },
  ],
  compute: (values) => {
    const h = headacheSeverity(values.pain ?? NaN, values.nausea === 1, values.light === 1, values.worst === 1, values.stiff === 1)
    if (h === null) return null
    return { title: 'Headache points', value: h.score.toFixed(0), unit: 'flags', tone: h.score >= 5 ? 'danger' : h.score >= 3 ? 'warn' : h.score >= 2 ? 'ok' : 'good', badge: h.band, note: 'A sudden \u201cworst ever\u201d headache or headache with stiff neck can be an emergency - do not wait to seek help.' }
  },
  howItWorks: [
    { title: 'Rate the pain', text: '0-10 scale.' },
    { title: 'Tick danger signs', text: 'Sudden onset, stiff neck.' },
    { title: 'Read the flag', text: 'Red flags outrank pain level.' },
  ],
  tips: [
    'Sudden worst-ever headache: seek urgent care.',
    'Headache after a head injury needs a check.',
    'Track triggers when headaches return often.',
  ],
}

extrasDentalBeautySymptomGroup['nausea-check'] = {
  id: 'nausea-check',
  title: 'Nausea & Vomiting Check',
  description: 'Weigh nausea burden, dehydration risk and duration together.',
  icon: <Waves className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Enter your nausea details from the last 24 hours.',
  sub: SY,
  emoji: '🤢',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'episodes', label: 'Episodes today', type: 'number', min: 0, max: 20, placeholder: 'e.g. 3' },
    { key: 'vomit', label: 'Vomiting', type: 'bool' },
    { key: 'fever', label: 'Fever', type: 'bool' },
    { key: 'diarrhea', label: 'Diarrhea', type: 'bool' },
    { key: 'dehyd', label: 'Dark urine / dry mouth', type: 'bool' },
    { key: 'days', label: 'Duration (days)', type: 'number', min: 0, max: 30, placeholder: 'e.g. 1' },
  ],
  compute: (values) => {
    const s = nauseaScore(values.episodes ?? NaN, values.vomit === 1, values.fever === 1, values.diarrhea === 1, values.dehyd === 1, values.days ?? NaN)
    if (s === null) return null
    return { title: 'Nausea score', value: s.toFixed(0), unit: '/8', tone: s >= 5 ? 'warn' : s >= 3 ? 'ok' : 'good', badge: nauseaBand(s), note: 'Vomiting plus diarrhea drains fluids fast - your priority is small sips or oral rehydration, and a review if you cannot hold fluids.' }
  },
  howItWorks: [
    { title: 'Count episodes', text: 'Today plus duration.' },
    { title: 'Tick companions', text: 'Fever, diarrhea, dehydration.' },
    { title: 'Read the score', text: 'Higher = more careful hydration.' },
  ],
  tips: [
    'Sip small amounts - don\u2019t chug.',
    'Bland, gentle foods after settling.',
    'Inability to keep water down for a day = review.',
  ],
}

extrasDentalBeautySymptomGroup['diarrhea-check'] = {
  id: 'diarrhea-check',
  title: 'Diarrhea Severity Check',
  description: 'Assess diarrhea frequency, blood, fever and duration together.',
  icon: <Droplet className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Enter what your last 24 hours have looked like.',
  sub: SY,
  emoji: '🚽',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'stools', label: 'Loose stools in 24 h', type: 'number', min: 0, max: 30, placeholder: 'e.g. 5' },
    { key: 'blood', label: 'Blood in stool', type: 'bool' },
    { key: 'fever', label: 'Fever', type: 'bool' },
    { key: 'days', label: 'Duration (days)', type: 'number', min: 0, max: 30, placeholder: 'e.g. 2' },
  ],
  compute: (values) => {
    const d = diarrheaStatus(values.stools ?? NaN, values.blood === 1, values.fever === 1, values.days ?? NaN)
    if (d === null) return null
    return { title: 'Diarrhea score', value: d.score.toFixed(0), unit: 'points', tone: d.score >= 5 ? 'danger' : d.score >= 3 ? 'warn' : d.score >= 1 ? 'ok' : 'good', badge: d.band, note: 'Most bouts are viral and short. Blood, high fever, or a week-plus of diarrhea merits a true clinical review.' }
  },
  howItWorks: [
    { title: 'Count stools', text: 'Last 24 hours.' },
    { title: 'Check companions', text: 'Blood, fever, duration.' },
    { title: 'Read the band', text: 'Mild bout to high concern.' },
  ],
  tips: [
    'Rehydrate - water plus electrolytes beats plain water.',
    'Avoid dairy and heavy grease while it runs.',
    'Blood in stool deserves prompt review.',
  ],
}

extrasDentalBeautySymptomGroup['constipation-check'] = {
  id: 'constipation-check',
  title: 'Constipation Check',
  description: 'Screen stool frequency and comfort for a constipation pattern.',
  icon: <Timer className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Enter how many bowel movements you average per week and the signals.',
  sub: SY,
  emoji: '🪨',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'bms', label: 'Bowel movements per week', type: 'number', min: 0, max: 30, placeholder: 'e.g. 3' },
    { key: 'strain', label: 'Straining on most occasions', type: 'bool' },
    { key: 'hard', label: 'Stools often hard or lumpy', type: 'bool' },
    { key: 'bloat', label: 'Bloating or fullness', type: 'bool' },
  ],
  compute: (values) => {
    const s = constipationScore(values.bms ?? NaN, values.strain === 1, values.hard === 1, values.bloat === 1)
    if (s === null) return null
    return { title: 'Constipation score', value: s.toFixed(0), unit: '/6', tone: s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: constipationBand(s), note: 'Fewer than three weekly movements with straining and hard stools is the classic pattern. Fiber, fluids and movement are first-line.' }
  },
  howItWorks: [
    { title: 'Count weekly bms', text: 'Averaged over a week.' },
    { title: 'Note the signals', text: 'Strain, hard stool, bloating.' },
    { title: 'Read the band', text: 'Regular to frequent constipation.' },
  ],
  tips: [
    'Water plus fiber beats either alone.',
    'Move after meals - gentle walks help.',
    'Persistent change in bowel habit needs a review.',
  ],
}

extrasDentalBeautySymptomGroup['lymph-node-check'] = {
  id: 'lymph-node-check',
  title: 'Lymph Node Self-Check',
  description: 'Screen swollen lymph nodes for features that matter for follow-up.',
  icon: <ShieldCheck className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Enter how many sites feel swollen and the details.',
  sub: SY,
  emoji: '🪖',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'sites', label: 'Swollen node sites', type: 'number', min: 0, max: 8, placeholder: 'e.g. 1' },
    { key: 'tender', label: 'Tender when pressed', type: 'bool' },
    { key: 'fever', label: 'Fever present', type: 'bool' },
    { key: 'weeks', label: 'Duration (weeks)', type: 'number', min: 0, max: 52, placeholder: 'e.g. 1' },
  ],
  compute: (values) => {
    const l = lymphNodeScore(values.sites ?? NaN, values.tender === 1, values.fever === 1, values.weeks ?? NaN)
    if (l === null) return null
    return { title: 'Node score', value: l.score.toFixed(0), unit: 'points', tone: l.score >= 5 ? 'danger' : l.score >= 3 ? 'warn' : l.score >= 1 ? 'ok' : 'good', badge: l.band, note: 'Small tender nodes that come with a cold usually settle by themselves. Nodes that persist several weeks without a clear cause deserve a review.' }
  },
  howItWorks: [
    { title: 'Note the sites', text: 'Neck, armpit, groin clusters.' },
    { title: 'Check feel', text: 'Tender vs firm, size, time.' },
    { title: 'Read the band', text: 'Reaction vs prolonged.' },
  ],
  tips: [
    'Tender + small + short-lived = usual infection reaction.',
    'Hard, painless and growing slowly = show a clinician.',
    'Glands that last 4+ weeks merit a check.',
  ],
}

extrasDentalBeautySymptomGroup['rash-check'] = {
  id: 'rash-check',
  title: 'Rash Self-Check',
  description: 'Assess how a rash is behaving - itch, spread, fever and blisters.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Tick the rash behaviors you have noticed.',
  sub: SY,
  emoji: '🩹',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'itch', label: 'Itchy', type: 'bool' },
    { key: 'spread', label: 'Spreading to new areas', type: 'bool' },
    { key: 'fever', label: 'Fever with the rash', type: 'bool' },
    { key: 'blisters', label: 'Blisters or weeping', type: 'bool' },
    { key: 'days', label: 'Duration (days)', type: 'number', min: 0, max: 60, placeholder: 'e.g. 3' },
  ],
  compute: (values) => {
    const s = rashScore(values.itch === 1, values.spread === 1, values.fever === 1, values.blisters === 1, values.days ?? NaN)
    if (s === null) return null
    return { title: 'Rash score', value: s.toFixed(0), unit: '/7', tone: s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: rashBand(s), note: 'A spreading rash with fever, or blisters forming, is more than cosmetic - let a clinician take a look.' }
  },
  howItWorks: [
    { title: 'Notice the behavior', text: 'Itch, spread, blisters.' },
    { title: 'Add systemic signs', text: 'Fever changes the picture.' },
    { title: 'Read the band', text: 'Local reaction vs broader.' },
  ],
  tips: [
    'Photo the rash over days to track change.',
    'Rash plus fever: get a timely clinical look.',
    'Stop any new product that started it.',
  ],
}

extrasDentalBeautySymptomGroup['dizziness-check'] = {
  id: 'dizziness-check',
  title: 'Dizziness Check',
  description: 'Separate simple light-headedness from dizziness worth urgent attention.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Tick the type and companions of your dizziness.',
  sub: SY,
  emoji: '🌀',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'light', label: 'Light-headed, about to faint', type: 'bool' },
    { key: 'spin', label: 'Spinning sensation (vertigo)', type: 'bool' },
    { key: 'falls', label: 'Actually fell or nearly fell', type: 'bool' },
    { key: 'chest', label: 'Chest pain or pressure', type: 'bool' },
    { key: 'pals', label: 'Heart palpitations / racing', type: 'bool' },
    { key: 'mins', label: 'Episode length (minutes)', type: 'number', min: 0, max: 600, placeholder: 'e.g. 5' },
  ],
  compute: (values) => {
    const d = dizzinessScore(values.light === 1, values.spin === 1, values.falls === 1, values.chest === 1, values.pals === 1, values.mins ?? NaN)
    if (d === null) return null
    return { title: 'Dizziness score', value: d.score.toFixed(0), unit: 'flags', tone: d.score >= 5 ? 'danger' : d.score >= 3 ? 'warn' : d.score >= 1 ? 'ok' : 'good', badge: d.band, note: 'Dizziness with chest pain, a fall, or fainting is an emergency-style picture. Simple light-headedness from standing too fast usually passes.' }
  },
  howItWorks: [
    { title: 'Name the feeling', text: 'Light-headed or spinning.' },
    { title: 'Check companions', text: 'Falls, chest pain, racing heart.' },
    { title: 'Read the flag', text: 'Emergency signs outrank the rest.' },
  ],
  tips: [
    'Stand up slowly if it\u2019s position-triggered.',
    'Feeling faint: sit low, head between knees.',
    'Chest pain plus dizziness: urgent care now.',
  ],
}

extrasDentalBeautySymptomGroup['fatigue-check'] = {
  id: 'fatigue-check',
  title: 'Fatigue Severity Check',
  description: 'Rate your energy, sleep and burden to weigh a fatigue picture.',
  icon: <BatteryCharging className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Rate how drained you feel and fill in the details.',
  sub: SY,
  emoji: '😴',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'energy', label: 'Energy on a 0-10 scale (0 = drained)', type: 'select', options: [{ value: '0', label: '0' }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' }, { value: '7', label: '7' }, { value: '8', label: '8' }, { value: '9', label: '9' }, { value: '10', label: '10' }] },
    { key: 'sleep', label: 'Average sleep (hours/night)', type: 'number', min: 0, max: 24, step: 0.5, placeholder: 'e.g. 7' },
    { key: 'focus', label: 'Feels like \u201cbrain fog\u201d', type: 'bool' },
    { key: 'mood', label: 'Irritable or low since it began', type: 'bool' },
    { key: 'weeks', label: 'Duration (weeks)', type: 'number', min: 0, max: 52, placeholder: 'e.g. 3' },
  ],
  compute: (values) => {
    const s = fatigueScore(values.energy ?? NaN, values.sleep ?? NaN, values.focus === 1, values.mood === 1, values.weeks ?? NaN)
    if (s === null) return null
    return { title: 'Fatigue score', value: s.toFixed(0), unit: '/9', tone: s >= 7 ? 'danger' : s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: fatigueBand(s), note: 'Fatigue lasting four-plus weeks despite reasonable sleep is worth exploring - sleep, iron, thyroid, mood and stress are common threads.' }
  },
  howItWorks: [
    { title: 'Rate energy', text: 'And note sleep hours.' },
    { title: 'Add companions', text: 'Focus and mood changes.' },
    { title: 'Read the score', text: 'Includes duration weight.' },
  ],
  tips: [
    'Consistent sleep timing beats a long lie-in.',
    'Persistent fatigue + brain fog merits a check-up.',
    'Gradual energy dips deserve the same look as sudden.',
  ],
}

extrasDentalBeautySymptomGroup['insomnia-check'] = {
  id: 'insomnia-check',
  title: 'Insomnia Self-Check',
  description: 'Screen the classic insomnia pattern across night and daytime signals.',
  icon: <Moon className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Fill in how most of your nights look.',
  sub: SY,
  emoji: '🌙',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'latency', label: 'Time to fall asleep (min)', type: 'number', min: 0, max: 240, placeholder: 'e.g. 45' },
    { key: 'wakings', label: 'Night-time wakings', type: 'number', min: 0, max: 10, placeholder: 'e.g. 2' },
    { key: 'early', label: 'Wake too early and can\u2019t return', type: 'bool' },
    { key: 'unrefreshed', label: 'Wake unrefreshed', type: 'bool' },
    { key: 'weeks', label: 'Duration (weeks)', type: 'number', min: 0, max: 52, placeholder: 'e.g. 4' },
  ],
  compute: (values) => {
    const s = insomniaScore(values.latency ?? NaN, values.wakings ?? NaN, values.early === 1, values.unrefreshed === 1, values.weeks ?? NaN)
    if (s === null) return null
    return { title: 'Insomnia score', value: s.toFixed(0), unit: '/8', tone: s >= 5 ? 'warn' : s >= 3 ? 'ok' : 'good', badge: insomniaBand(s), note: 'Sleeping badly three-plus nights weekly for a month is the insomnia benchmark - CBT for insomnia (not just pills) is the top treatment.' }
  },
  howItWorks: [
    { title: 'Measure the night', text: 'Latency, wakings, early wake.' },
    { title: 'Add daytime cost', text: 'Unrefreshed signals.' },
    { title: 'Weigh duration', text: 'Four weeks flips chronic.' },
  ],
  tips: [
    'Get up if awake 20 minutes - keep bed for sleep.',
    'Dim lights and no screens an hour pre-bed.',
    'Consistent wake time anchors the rhythm.',
  ],
}

extrasDentalBeautySymptomGroup['eye-strain-check'] = {
  id: 'eye-strain-check',
  title: 'Digital Eye Strain Check',
  description: 'Weigh screen time and ergonomics for an eye-strain pattern.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Enter your screen habits and any eye symptoms.',
  sub: SY,
  emoji: '👀',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'screen', label: 'Screen hours per day', type: 'number', min: 0, max: 20, placeholder: 'e.g. 8' },
    { key: 'dry', label: 'Eyes feel dry or gritty', type: 'bool' },
    { key: 'blur', label: 'Vision blurs during screen time', type: 'bool' },
    { key: 'head', label: 'Headaches after screen sessions', type: 'bool' },
    { key: 'dist', label: 'Screen distance (cm)', type: 'number', min: 10, max: 150, placeholder: 'e.g. 50' },
  ],
  compute: (values) => {
    const s = eyeStrainScore(values.screen ?? NaN, values.dry === 1, values.blur === 1, values.head === 1, values.dist ?? NaN)
    if (s === null) return null
    return { title: 'Strain score', value: s.toFixed(0), unit: '/6', tone: s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: eyeStrainBand(s), note: 'Staring reduces blinking, drying the eyes. The 20-20-20 rule (every 20 min, look 20 ft away, 20 s) is the classic reset.' }
  },
  howItWorks: [
    { title: 'Count screen hours', text: 'And check the distance.' },
    { title: 'Note symptoms', text: 'Dry, blur, headaches.' },
    { title: 'Read the band', text: 'Coping to significant strain.' },
  ],
  tips: [
    'Blink deliberately - screens cut blink rate in half.',
    'Set your monitor an arm\u2019s length away.',
    'Lubricating drops help dry, gritty eyes.',
  ],
}

extrasDentalBeautySymptomGroup['acid-reflux-check'] = {
  id: 'acid-reflux-check',
  title: 'Acid Reflux Check',
  description: 'Score heartburn frequency plus the subtler reflux signals together.',
  icon: <Repeat className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Enter how often heartburn hits and tick the subtler signs.',
  sub: SY,
  emoji: '🔥',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'heartburn', label: 'Heartburn episodes per week', type: 'number', min: 0, max: 20, placeholder: 'e.g. 2' },
    { key: 'regurg', label: 'Food/acid coming back up', type: 'bool' },
    { key: 'ncough', label: 'Cough worse at night', type: 'bool' },
    { key: 'hoarse', label: 'Hoarse voice in the morning', type: 'bool' },
    { key: 'sour', label: 'Sour taste on waking', type: 'bool' },
  ],
  compute: (values) => {
    const s = refluxScore(values.heartburn ?? NaN, values.regurg === 1, values.ncough === 1, values.hoarse === 1, values.sour === 1)
    if (s === null) return null
    return { title: 'Reflux score', value: s.toFixed(0), unit: '/6', tone: s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: refluxBand(s), note: 'Two-plus heartburn days a week is the usual reflux benchmark. Night cough and morning hoarseness are the silent-style clues.' }
  },
  howItWorks: [
    { title: 'Count heartburn', text: 'Episodes per week.' },
    { title: 'Add silent signs', text: 'Night cough, hoarse, sour.' },
    { title: 'Read the score', text: 'Occasional to frequent.' },
  ],
  tips: [
    'Eat 2-3 hours before lying down.',
    'Elevate the head of the bed, not just pillows.',
    'Frequent symptoms deserve a proper review.',
  ],
}