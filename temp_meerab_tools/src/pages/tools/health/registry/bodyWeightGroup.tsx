import { Scale, Ruler, PersonStanding, TrendingDown, Target, Gauge, Weight, Apple, Beef, Wheat, PieChart, Flame, Popcorn, Activity } from 'lucide-react'
import type { HealthToolConfig, HealthResult } from '../HealthGenericTool'
import {
  bodyShape, absi, absiBand, bmi, healthyWeightRange, idealBodyWeightVentilation,
  midParentalHeight, adjustedBodyWeight, weightChangeKg, weightLossPct, weightGainPct,
  weightLossTimelineWeeks, weightLossRateKgPerWeek,
} from '../../../../lib/health/weight'
import {
  netCarbs, netCarbsToGlucoseEffectKcal, dailyProteinTargetKgPerDay, dailyFiberTargetKcal,
  macroSplitFromKcal, calorieIntakeTarget, roastedPortionCalories,
} from '../../../../lib/health/nutrition'
import { fin } from '../../../../lib/health/guard'

const BAW = 'Body & Weight'
const WM = 'Weight Management'
const NUT = 'Nutrition & Calories'

export const bodyWeightGroup: Record<string, HealthToolConfig> = {}

bodyWeightGroup['child-height-predictor'] = {
  id: 'child-height-predictor',
  title: 'Child Height Predictor',
  description: 'Estimate your child\u2019s adult target height with the mid-parental (Tanner) method.',
  icon: <Ruler className="h-6 w-6" />,
  breadcrumb: 'Health / Body & Weight',
  instruction: 'Enter both parents\u2019 heights to estimate the mid-parental target height.',
  sub: BAW,
  emoji: '🧍',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'sex', label: 'Child sex', type: 'select', options: [{ value: '1', label: 'Male' }, { value: '0', label: 'Female' }] },
    { key: 'motherCm', label: 'Mother\u2019s height (cm)', type: 'number', placeholder: 'e.g. 165' },
    { key: 'fatherCm', label: 'Father\u2019s height (cm)', type: 'number', placeholder: 'e.g. 178' },
  ],
  compute: (values) => {
    const h = midParentalHeight(values.sex === 1 ? 'male' : 'female', values.motherCm ?? NaN, values.fatherCm ?? NaN)
    if (h === null) return null
    return {
      title: 'Mid-parental target height',
      value: h.toFixed(1),
      unit: 'cm',
      tone: 'good',
      badge: 'Estimated adult height',
      note: 'About 95% of children will fall within about ±8.5 cm of this estimate.',
    }
  },
  howItWorks: [
    { title: 'Add both parents\u2019 heights', text: 'Enter mother and father heights in centimetres.' },
    { title: 'We average and adjust for sex', text: 'The Tanner method adds 13 cm for boys and subtracts 13 cm for girls from the parental average.' },
    { title: 'Track growth over time', text: 'Compare the estimate with growth chart percentiles at each check-up.' },
  ],
  tips: [
    'This is a genetic estimate - nutrition and health during childhood also play a big role.',
    'Pediatricians use growth-chart percentiles together with this number.',
    'Talk to your child\u2019s doctor if growth percentiles change sharply over time.',
  ],
}

bodyWeightGroup['body-shape-finder'] = {
  id: 'body-shape-finder',
  title: 'Body Shape Finder',
  description: 'Use your waist-to-hip ratio to see where your body tends to carry weight.',
  icon: <PersonStanding className="h-6 w-6" />,
  breadcrumb: 'Health / Body & Weight',
  instruction: 'Measure your natural waist and widest hip to classify your body shape pattern.',
  sub: BAW,
  emoji: '🧍',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'waistCm', label: 'Waist (cm)', type: 'number', placeholder: 'e.g. 82' },
    { key: 'hipCm', label: 'Hip (cm)', type: 'number', placeholder: 'e.g. 98' },
  ],
  compute: (values) => {
    const shape = bodyShape(values.waistCm ?? NaN, values.hipCm ?? NaN)
    const w = fin(values.waistCm ?? NaN)
    const h = fin(values.hipCm ?? NaN)
    if (w === null || h === null || w <= 0 || h <= 0) return null
    return { title: 'Waist-to-hip ratio', value: (w / h).toFixed(2), unit: 'WHR', tone: 'ok', badge: shape, note: 'Body shape is just one piece of the picture - blood pressure, lipids and lifestyle matter too.' }
  },
  howItWorks: [
    { title: 'Take two measurements', text: 'Measure the narrowest waist point and the widest hip point.' },
    { title: 'We divide waist by hip', text: 'The waist-to-hip ratio describes where fat tends to sit.' },
    { title: 'Read your pattern', text: 'Higher ratios suggest a more central (apple) pattern.' },
  ],
  tips: [
    'Measure without pulling the tape tight, after a normal exhalation.',
    'Central weight is linked with higher cardiometabolic risk - focus on diet and activity.',
    'Use the same taping technique each time for consistent tracking.',
  ],
}

bodyWeightGroup['absi-body-shape-index'] = {
  id: 'absi-body-shape-index',
  title: 'ABSI Body Shape Index',
  description: 'A body-shape index that adds waist size to BMI and height.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Body & Weight',
  instruction: 'Enter waist, height, weight, age, and sex to get an ABSI value with a reference band.',
  sub: BAW,
  emoji: '🧍',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'waistCm', label: 'Waist (cm)', type: 'number', placeholder: 'e.g. 88' },
    { key: 'heightCm', label: 'Height (cm)', type: 'number', placeholder: 'e.g. 172' },
    { key: 'weightKg', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 74' },
    { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 38' },
    { key: 'sex', label: 'Sex', type: 'select', options: [{ value: '0', label: 'Female' }, { value: '1', label: 'Male' }] },
  ],
  compute: (values) => {
    const a = absi(values.waistCm ?? NaN, values.heightCm ?? NaN, values.weightKg ?? NaN)
    if (a === null) return null
    const band = absiBand(a, values.age ?? NaN, values.sex !== 1)
    return { title: 'ABSI value', value: a.toFixed(3), unit: 'm\u00b9\u00b7\u2075\u2077/kg\u00b2\u00b3', tone: band.includes('Above') ? 'danger' : band.includes('Below') ? 'good' : 'ok', badge: band, note: 'ABSI adjusts for the risk that high waist circumference adds beyond BMI.' }
  },
  howItWorks: [
    { title: 'Collect inputs', text: 'Waist, height, weight, age and sex - all measured calmly at the same time of day.' },
    { title: 'We normalise waist to body size', text: 'ABSI = waist / (BMI\u2154 \u00d7 height\u00bd) using metres.' },
    { title: 'Compare with your age band', text: 'Your value is placed against reference ranges for your sex and age.' },
  ],
  tips: [
    'Measure your waist just above the belly button, breathing out normally.',
    'ABSI is a research metric - treat it as one signal, not a diagnosis.',
    'Combine with BMI and lifestyle changes for the full picture.',
  ],
}

bodyWeightGroup['healthy-weight-range'] = {
  id: 'healthy-weight-range',
  title: 'Healthy Weight Range',
  description: 'Find the healthy BMI weight range (18.5-24.9) for your height.',
  icon: <Scale className="h-6 w-6" />,
  breadcrumb: 'Health / Body & Weight',
  instruction: 'Enter your height in centimetres to see the healthy weight band.',
  sub: BAW,
  emoji: '🧍',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [{ key: 'heightCm', label: 'Height (cm)', type: 'number', placeholder: 'e.g. 175' }],
  compute: (values) => {
    const r = healthyWeightRange(values.heightCm ?? NaN)
    if (r === null) return null
    return { title: 'Healthy weight band', value: `${r.lowKg.toFixed(1)} - ${r.highKg.toFixed(1)}`, unit: 'kg', tone: 'good', badge: 'BMI 18.5-24.9', note: 'Athletes and people with high muscle mass may sit above this range at the same fitness level.' }
  },
  howItWorks: [
    { title: 'Enter your height', text: 'One number - height in centimetres.' },
    { title: 'We compute both BMI boundaries', text: '18.5 \u00d7 height\u00b2 and 24.9 \u00d7 height\u00b2 give the low and high ends.' },
    { title: 'Aim for the band', text: 'Staying inside the band roughly matches a healthy BMI.' },
  ],
  tips: [
    'Weight goals should always consider muscle mass and frame size.',
    'Slow, steady changes beat crash diets for keeping the range.',
    'Use the same conditions (morning, after bathroom) when weighing.',
  ],
}

bodyWeightGroup['ideal-weight-ventilation'] = {
  id: 'ideal-weight-ventilation',
  title: 'Ideal Weight (Ventilation Standard)',
  description: 'Estimate the classic ideal body weight formula used in medical ventilation dosing.',
  icon: <Weight className="h-6 w-6" />,
  breadcrumb: 'Health / Body & Weight',
  instruction: 'Enter height and sex to get the classic Devine ideal body weight.',
  sub: BAW,
  emoji: '🧍',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'heightCm', label: 'Height (cm)', type: 'number', placeholder: 'e.g. 180' },
    { key: 'sex', label: 'Sex', type: 'select', options: [{ value: '1', label: 'Male' }, { value: '0', label: 'Female' }] },
  ],
  compute: (values) => {
    const w = idealBodyWeightVentilation(values.heightCm ?? NaN, values.sex === 1 ? 'male' : 'female')
    if (w === null) return null
    return { title: 'Ideal body weight', value: w.toFixed(1), unit: 'kg', tone: 'ok', badge: 'Devine formula', note: 'This classical estimate is a reference used in clinical settings - not a personal weight goal.' }
  },
  howItWorks: [
    { title: 'Enter height and sex', text: 'Two quick fields.' },
    { title: 'Apply the Devine baseline', text: 'We start from 50 kg (men) or 45.5 kg (women) at 152 cm.' },
    { title: 'Add 2.3 kg per inch', text: 'Above 152 cm, 2.3 kg is added per extra inch of height.' },
  ],
  tips: [
    'IBW is a dosing reference, not an aesthetic target.',
    'Healthy individual weights vary widely above and below IBW.',
    'Only healthcare teams should use IBW for medication decisions.',
  ],
}

bodyWeightGroup['adjusted-body-weight'] = {
  id: 'adjusted-body-weight',
  title: 'Adjusted Body Weight',
  description: 'Apply the 25% correction rule between actual and ideal body weight.',
  icon: <Target className="h-6 w-6" />,
  breadcrumb: 'Health / Body & Weight',
  instruction: 'Enter actual weight and ideal body weight to compute adjusted body weight.',
  sub: WM,
  emoji: '⚖️',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'actualKg', label: 'Actual weight (kg)', type: 'number', placeholder: 'e.g. 92' },
    { key: 'ibwKg', label: 'Ideal body weight (kg)', type: 'number', placeholder: 'e.g. 70' },
  ],
  compute: (values) => {
    const a = adjustedBodyWeight(values.actualKg ?? NaN, values.ibwKg ?? NaN)
    if (a === null) return null
    const above = (values.actualKg ?? NaN) > (values.ibwKg ?? NaN)
    return { title: 'Adjusted body weight', value: a.toFixed(1), unit: 'kg', tone: 'ok', badge: above ? '25% correction applied' : 'At or below IBW - no correction', note: 'Clinicians often dose some medications against adjusted weight in obesity.' }
  },
  howItWorks: [
    { title: 'Provide two weights', text: 'Your actual weight and the ideal body weight for your height.' },
    { title: 'Settle the gap by a quarter', text: 'When actual weight exceeds IBW, only 25% of the excess is added back.' },
    { title: 'Read the result', text: 'Adjusted weight sits between actual and ideal - the standard dosing reference.' },
  ],
  tips: [
    'Use a UK/US healthy-weight tool first to find your IBW reference.',
    'Adjusted body weight is a clinical convention, not a weight-loss target.',
    'Never self-dose medications - check with a pharmacist or doctor.',
  ],
}

bodyWeightGroup['weight-change-tracker'] = {
  id: 'weight-change-tracker',
  title: 'Weight Change Tracker',
  description: 'See the exact kg change and percentage lost or gained between two weights.',
  icon: <TrendingDown className="h-6 w-6" />,
  breadcrumb: 'Health / Weight Management',
  instruction: 'Enter your starting and current weight to see absolute and percentage change.',
  sub: WM,
  emoji: '⚖️',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'startKg', label: 'Starting weight (kg)', type: 'number', placeholder: 'e.g. 85' },
    { key: 'currentKg', label: 'Current weight (kg)', type: 'number', placeholder: 'e.g. 81' },
  ],
  compute: (values) => {
    const s = values.startKg ?? NaN
    const c = values.currentKg ?? NaN
    const delta = weightChangeKg(s, c)
    if (delta === null) return null
    const losing = delta < 0
    const pct = losing ? weightLossPct(s, c) : weightGainPct(s, c)
    const tone: HealthResult['tone'] = losing ? (pct !== null && pct < 1 ? 'ok' : 'good') : 'warn'
    return {
      title: losing ? 'Weight lost' : 'Weight gained',
      value: Math.abs(delta).toFixed(1),
      unit: 'kg',
      tone,
      badge: `${Math.abs(pct ?? 0).toFixed(1)}% ${losing ? 'lost' : 'gained'}`,
      note: 'Weigh yourself at the same time each day and compare weekly averages for the truest trend.',
    }
  },
  howItWorks: [
    { title: 'Add your two weights', text: 'Start weight and the most recent weigh-in.' },
    { title: 'We compute change', text: 'Absolute kg difference plus the percentage relative to start.' },
    { title: 'Track the trend', text: 'Weekly averages smooth daily water-swing noise.' },
  ],
  tips: [
    'Hydration and time of day can move the scale up to ±1.5 kg.',
    'A 5-10% loss is a well-studied health benefit target.',
    'Log your numbers in the same conditions every time.',
  ],
}

bodyWeightGroup['weight-loss-timeline'] = {
  id: 'weight-loss-timeline',
  title: 'Weight Loss Timeline Planner',
  description: 'Estimate how many weeks a calorie deficit will take to reach a target weight.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Weight Management',
  instruction: 'Enter start weight, target weight and your average daily calorie deficit.',
  sub: WM,
  emoji: '⚖️',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'startKg', label: 'Start weight (kg)', type: 'number', placeholder: 'e.g. 90' },
    { key: 'targetKg', label: 'Target weight (kg)', type: 'number', placeholder: 'e.g. 80' },
    { key: 'deficit', label: 'Daily deficit (kcal)', type: 'number', placeholder: 'e.g. 500' },
  ],
  compute: (values) => {
    const weeks = weightLossTimelineWeeks(values.startKg ?? NaN, values.targetKg ?? NaN, values.deficit ?? NaN)
    if (weeks === null) return null
    const rate = weeks > 0 ? (values.startKg! - values.targetKg!) / weeks : null
    return {
      title: 'Estimated timeline',
      value: weeks.toFixed(1),
      unit: 'weeks',
      tone: rate !== null && rate > 1 ? 'warn' : 'ok',
      badge: rate !== null ? `About ${rate.toFixed(1)} kg per week` : 'Enter a positive deficit',
      note: 'Assumes ~7,700 kcal per kg of fat. Real life slows, plateaus and speeds up.',
    }
  },
  howItWorks: [
    { title: 'Set your numbers', text: 'Start, target and the daily deficit you plan to hold.' },
    { title: 'Convert fat to energy', text: 'We use the ~7,700 kcal needed per kg of weight lost.' },
    { title: 'Divide across the week', text: 'Total deficit / (daily deficit \u00d7 7) gives the weeks.' },
  ],
  tips: [
    'Deficits above ~750 kcal/day become hard to sustain and lose muscle.',
    'Aim for 0.5-1 kg per week for sustainable loss.',
    'Including strength training protects muscle during a deficit.',
  ],
}

bodyWeightGroup['weight-loss-rate-check'] = {
  id: 'weight-loss-rate-check',
  title: 'Weight Loss Rate Check',
  description: 'Check whether your current rate of loss falls in the sustainable range.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Weight Management',
  instruction: 'Enter kg lost and the number of weeks to see your average rate.',
  sub: WM,
  emoji: '⚖️',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'kgLost', label: 'Kilograms lost', type: 'number', placeholder: 'e.g. 3' },
    { key: 'weeks', label: 'Weeks elapsed', type: 'number', placeholder: 'e.g. 6' },
  ],
  compute: (values) => {
    const rate = weightLossRateKgPerWeek(values.kgLost ?? NaN, values.weeks ?? NaN)
    if (rate === null) return null
    return {
      title: 'Average loss rate',
      value: rate.toFixed(2),
      unit: 'kg/week',
      tone: rate > 1 ? 'warn' : rate < 0.5 ? 'ok' : 'good',
      badge: rate > 1 ? 'Losing fast - review sustainability' : rate < 0.5 ? 'Slow and steady' : 'Sustainable pace (0.5-1 kg/week)',
      note: 'Faster loss is often mostly water and muscle early on.',
    }
  },
  howItWorks: [
    { title: 'Total up your loss', text: 'How many kilograms have you actually lost?' },
    { title: 'Divide by weeks', text: 'Rate = kg lost \u00f7 weeks elapsed.' },
    { title: 'Compare to the range', text: '0.5-1 kg/week is the commonly cited sustainable band.' },
  ],
  tips: [
    'Include a rest week and weigh-in averages to avoid noise.',
    'If you are losing over 1 kg/week, consider adding calories back.',
    'Muscle-preserving protein and training matter more than speed.',
  ],
}

bodyWeightGroup['net-carb-calculator'] = {
  id: 'net-carb-calculator',
  title: 'Net Carb Calculator',
  description: 'Subtract fiber from total carbohydrates to estimate net carbs.',
  icon: <Wheat className="h-6 w-6" />,
  breadcrumb: 'Health / Nutrition & Calories',
  instruction: 'Enter total carbs and fiber from a food label.',
  sub: NUT,
  emoji: '🥗',
  accent: 'text-lime-600 bg-lime-50 border-lime-200',
  fields: [
    { key: 'totalCarbs', label: 'Total carbs (g)', type: 'number', placeholder: 'e.g. 36' },
    { key: 'fiber', label: 'Fiber (g)', type: 'number', placeholder: 'e.g. 8' },
  ],
  compute: (values) => {
    const n = netCarbs(values.totalCarbs ?? NaN, values.fiber ?? NaN)
    if (n === null) return null
    return { title: 'Net carbohydrates', value: n.toFixed(0), unit: 'g', tone: 'ok', badge: 'Total carbs minus fiber', note: 'Net carb counting is a convention used by low-carb eaters - fiber is subtracted because it is not digested the same way.' }
  },
  howItWorks: [
    { title: 'Read the label', text: 'Find total carbohydrate and dietary fiber per serving.' },
    { title: 'Subtract fiber', text: 'Net carbs = total carbs - fiber (never below zero).' },
    { title: 'Use it consistently', text: 'Apply the same convention every time for comparable tracking.' },
  ],
  tips: [
    'Different regions list "net carbs" differently - food labels always show total carbs.',
    'Fiber is still a carb that delivers calories and gut benefits.',
    'For diabetes carb-counting, follow the guidance of your care team.',
  ],
}

bodyWeightGroup['protein-daily-target'] = {
  id: 'protein-daily-target',
  title: 'Daily Protein Target',
  description: 'Estimate your daily protein needs from body weight and activity level.',
  icon: <Beef className="h-6 w-6" />,
  breadcrumb: 'Health / Nutrition & Calories',
  instruction: 'Enter your weight and activity level to get a protein target in grams.',
  sub: NUT,
  emoji: '🥗',
  accent: 'text-lime-600 bg-lime-50 border-lime-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 70' },
    { key: 'activity', label: 'Activity level', type: 'select', options: [{ value: '0', label: 'Sedentary (0.8 g/kg)' }, { value: '1', label: 'Active (1.2 g/kg)' }, { value: '2', label: 'Athlete (1.6 g/kg)' }, { value: '3', label: 'Strength training (1.8 g/kg)' }] },
  ],
  compute: (values) => {
    const a = values.activity
    const level = a === 1 ? 'active' : a === 2 ? 'athlete' : a === 3 ? 'strength' : 'sedentary'
    const g = dailyProteinTargetKgPerDay(values.weight ?? NaN, level)
    if (g === null) return null
    return { title: 'Protein target', value: g.toFixed(0), unit: 'g/day', tone: 'good', badge: level === 'sedentary' ? 'Maintenance baseline' : 'Match to your training load', note: 'Spread protein across 3-5 meals for better daily coverage.' }
  },
  howItWorks: [
    { title: 'Pick an activity tier', text: 'Choose the multiplier that fits how you train.' },
    { title: 'Multiply by your weight', text: 'Target = weight \u00d7 the per-kg factor for your tier.' },
    { title: 'Plan your meals', text: 'Divide the grams across meals and snacks.' },
  ],
  tips: [
    '~20-40 g protein per meal is a practical single-meal target.',
    'High-protein diets can also support muscle while losing weight.',
    'Kidney patients should confirm protein goals with their clinician.',
  ],
}

bodyWeightGroup['fiber-daily-target'] = {
  id: 'fiber-daily-target',
  title: 'Daily Fiber Target',
  description: 'Get a fiber goal based on your calorie intake (14 g per 1,000 kcal).',
  icon: <Apple className="h-6 w-6" />,
  breadcrumb: 'Health / Nutrition & Calories',
  instruction: 'Enter your typical daily calorie intake.',
  sub: NUT,
  emoji: '🥗',
  accent: 'text-lime-600 bg-lime-50 border-lime-200',
  fields: [{ key: 'calories', label: 'Daily calories (kcal)', type: 'number', placeholder: 'e.g. 2200' }],
  compute: (values) => {
    const f = dailyFiberTargetKcal(values.calories ?? NaN)
    if (f === null) return null
    return { title: 'Fiber target', value: f.toFixed(0), unit: 'g/day', tone: 'good', badge: '14 g per 1,000 kcal', note: 'Most people land in the 25-38 g/day zone with this rule.' }
  },
  howItWorks: [
    { title: 'Enter your calories', text: 'Your typical daily intake.' },
    { title: 'Apply the 14 g rule', text: 'Fiber grams = kcal \u00f7 1,000 \u00d7 14.' },
    { title: 'Build around plants', text: 'Vegetables, fruit, wholegrains and legumes deliver fiber naturally.' },
  ],
  tips: [
    'Raise fiber gradually and drink plenty of water to avoid bloating.',
    'Whole-food fiber beats supplements for gut health.',
    'Beans, oats, berries and seeds are fiber powerhouses.',
  ],
}

bodyWeightGroup['macro-ratio-checker'] = {
  id: 'macro-ratio-checker',
  title: 'Macro Ratio Checker',
  description: 'Convert a calorie target and macro percentages into grams of carbs, protein and fat.',
  icon: <PieChart className="h-6 w-6" />,
  breadcrumb: 'Health / Nutrition & Calories',
  instruction: 'Enter total calories and your carb/protein/fat percentages (must total 100).',
  sub: NUT,
  emoji: '🥗',
  accent: 'text-lime-600 bg-lime-50 border-lime-200',
  fields: [
    { key: 'kcal', label: 'Total calories (kcal)', type: 'number', placeholder: 'e.g. 2000' },
    { key: 'carbs', label: 'Carbs (%)', type: 'number', placeholder: 'e.g. 50' },
    { key: 'protein', label: 'Protein (%)', type: 'number', placeholder: 'e.g. 20' },
    { key: 'fat', label: 'Fat (%)', type: 'number', placeholder: 'e.g. 30' },
  ],
  compute: (values) => {
    const m = macroSplitFromKcal(values.kcal ?? NaN, values.carbs ?? NaN, values.protein ?? NaN, values.fat ?? NaN)
    if (m === null) return null
    return {
      title: 'Daily macro amounts',
      value: `${m.carbsG} / ${m.proteinG} / ${m.fatG.toFixed(0)}`,
      unit: 'g (C / P / F)',
      tone: 'good',
      badge: '4 / 4 / 9 kcal rule',
      note: 'Carbs and protein supply 4 kcal per gram; fat supplies 9 kcal per gram.',
    }
  },
  howItWorks: [
    { title: 'Set calories and ratios', text: 'Percentages must add to 100.' },
    { title: 'Convert each percent to kcal', text: 'E.g. 50% of 2000 kcal = 1000 kcal of carbs.' },
    { title: 'Divide by energy density', text: 'Carbs/protein \u00f7 4 and fat \u00f7 9 gives grams.' },
  ],
  tips: [
    'Any balanced ratio works if it is sustainable - no single split is magic.',
    'Prioritise protein on a deficit to protect muscle.',
    'Dietitian guidance beats over-optimising macro numbers alone.',
  ],
}

bodyWeightGroup['calorie-intake-planner'] = {
  id: 'calorie-intake-planner',
  title: 'Calorie Intake Planner',
  description: 'Estimate maintenance calories with the Mifflin-St Jeor equation and activity factor.',
  icon: <Flame className="h-6 w-6" />,
  breadcrumb: 'Health / Nutrition & Calories',
  instruction: 'Enter your details to estimate daily maintenance calories.',
  sub: NUT,
  emoji: '🥗',
  accent: 'text-lime-600 bg-lime-50 border-lime-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 70' },
    { key: 'height', label: 'Height (cm)', type: 'number', placeholder: 'e.g. 175' },
    { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 30' },
    { key: 'sex', label: 'Sex', type: 'select', options: [{ value: '1', label: 'Male' }, { value: '0', label: 'Female' }] },
    { key: 'activity', label: 'Activity factor', type: 'select', options: [{ value: '1.2', label: 'Sedentary (1.2)' }, { value: '1.375', label: 'Light (1.375)' }, { value: '1.55', label: 'Moderate (1.55)' }, { value: '1.725', label: 'Heavy (1.725)' }] },
  ],
  compute: (values) => {
    const act = Number(values.activity ?? NaN)
    const kcal = calorieIntakeTarget(values.weight ?? NaN, values.height ?? NaN, values.age ?? NaN, values.sex === 1 ? 'male' : 'female', fin(act) as 1.2 | 1.375 | 1.55 | 1.725)
    if (kcal === null) return null
    return { title: 'Maintenance calories', value: kcal.toFixed(0), unit: 'kcal/day', tone: 'ok', badge: 'Mifflin-St Jeor estimate', note: 'Estimates vary by ±10%; adjust with a few weeks of real tracking.' }
  },
  howItWorks: [
    { title: 'Enter body details', text: 'Weight, height, age and sex.' },
    { title: 'We calculate BMR', text: 'Mifflin-St Jeor: 10\u00d7kg + 6.25\u00d7cm - 5\u00d7age, plus 5 (male) or -161 (female).' },
    { title: 'Multiply by activity', text: 'An activity factor converts BMR into daily maintenance.' },
  ],
  tips: [
    'Caps/cups estimates beat "eat less" for consistency.',
    'Track for 2-3 weeks and adjust ±200 kcal based on the scale.',
    'Recheck your number every 5-10 kg of change.',
  ],
}

bodyWeightGroup['carb-glucose-effect'] = {
  id: 'carb-glucose-effect',
  title: 'Carb to Glucose Effect',
  description: 'See how many calories\u2019 worth of glucose your net carbs provide.',
  icon: <Wheat className="h-6 w-6" />,
  breadcrumb: 'Health / Nutrition & Calories',
  instruction: 'Enter the net carbs you plan to eat in a meal or snack.',
  sub: NUT,
  emoji: '🥗',
  accent: 'text-lime-600 bg-lime-50 border-lime-200',
  fields: [{ key: 'netCarbs', label: 'Net carbs (g)', type: 'number', placeholder: 'e.g. 45' }],
  compute: (values) => {
    const kcal = netCarbsToGlucoseEffectKcal(values.netCarbs ?? NaN)
    if (kcal === null) return null
    return { title: 'Glucose energy', value: kcal.toFixed(0), unit: 'kcal', tone: 'ok', badge: '4 kcal per gram of carb', note: 'This is the energy carbs provide before considering digestion and fiber.' }
  },
  howItWorks: [
    { title: 'Count the carbs', text: 'Net carbs grams for the item.' },
    { title: 'Multiply by 4', text: 'Each gram of digestible carbohydrate provides ~4 kcal.' },
    { title: 'Read the total', text: 'A quick way to compare carbohydrate loads between foods.' },
  ],
  tips: [
    'Portion control drives glucose response at least as much as carb type.',
    'Pairing carbs with protein and fat slows sugar release.',
    'People with diabetes should use their own glucometer data to calibrate.',
  ],
}

bodyWeightGroup['portion-calorie-calculator'] = {
  id: 'portion-calorie-calculator',
  title: 'Portion Calorie Calculator',
  description: 'Multiply calories-per-serving by the number of servings you actually eat.',
  icon: <Popcorn className="h-6 w-6" />,
  breadcrumb: 'Health / Nutrition & Calories',
  instruction: 'Enter portions eaten and the calories per single portion.',
  sub: NUT,
  emoji: '🥗',
  accent: 'text-lime-600 bg-lime-50 border-lime-200',
  fields: [
    { key: 'portions', label: 'Portions eaten', type: 'number', step: 0.1, placeholder: 'e.g. 1.5' },
    { key: 'perPortion', label: 'Calories per portion', type: 'number', placeholder: 'e.g. 250' },
  ],
  compute: (values) => {
    const kcal = roastedPortionCalories(values.portions ?? NaN, values.perPortion ?? NaN)
    if (kcal === null) return null
    return { title: 'Total calories', value: kcal.toFixed(0), unit: 'kcal', tone: 'ok', badge: 'Portions \u00d7 per-portion', note: 'Scan the label\u2019s serving size first - a "portion" is often more than one serving.' }
  },
  howItWorks: [
    { title: 'Count your real portions', text: 'Half portions are 0.5, seconds are 2, etc.' },
    { title: 'Look up per-porton kcal', text: 'From the label or a food database.' },
    { title: 'Multiply', text: 'Portions \u00d7 per-portion kcal = your total.' },
  ],
  tips: [
    'Eyeball portions between handfuls and kitchen scales.',
    'Liquid calories (drinks) are easy to forget - count them too.',
    'Weigh at least once to calibrate your eye.',
  ],
}

bodyWeightGroup['bmi-basic'] = {
  id: 'bmi-basic',
  title: 'Quick BMI Check',
  description: 'A fast BMI result from weight and height using the standard WHO categories.',
  icon: <Scale className="h-6 w-6" />,
  breadcrumb: 'Health / Body & Weight',
  instruction: 'Enter weight and height for an instant BMI category.',
  sub: BAW,
  emoji: '🧍',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 74' },
    { key: 'height', label: 'Height (cm)', type: 'number', placeholder: 'e.g. 172' },
  ],
  compute: (values) => {
    const b = bmi(values.weight ?? NaN, values.height ?? NaN)
    if (b === null) return null
    const badge = b < 18.5 ? 'Underweight' : b < 25 ? 'Healthy weight' : b < 30 ? 'Overweight' : 'Obesity'
    const tone: HealthResult['tone'] = b < 18.5 || b >= 30 ? 'warn' : b < 25 ? 'good' : 'ok'
    return { title: 'BMI', value: b.toFixed(1), unit: 'kg/m\u00b2', tone, badge, note: 'A screening index - it does not separate fat from muscle.' }
  },
  howItWorks: [
    { title: 'Enter weight and height', text: 'Metric values work best.' },
    { title: 'We divide by height squared', text: 'BMI = kg \u00f7 (metres)\u00b2.' },
    { title: 'Map to WHO categories', text: '18.5, 25 and 30 are the main cut-offs.' },
  ],
  tips: [
    'Athletes with high muscle can have a high BMI yet low body fat.',
    'Combine BMI with waist circumference for a fuller picture.',
    'BMI categories are population-level guides, not individual verdicts.',
  ],
}