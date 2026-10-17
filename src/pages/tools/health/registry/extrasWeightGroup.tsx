import { Scale, TrendingUp, Target, Gauge, Pizza, Flame, CloudSun, Droplets, Apple, TrendingDown } from 'lucide-react'
import type { HealthToolConfig } from '../HealthGenericTool'
import { weightLossPct, weightGainPct, weightChangeKg } from '../../../../lib/health/weight'
import { calorieSurplusKcal } from '../../../../lib/health/nutrition'
import { weightAtBmi, weightGoalPlan, weightGainPlan, maintenanceWeightKg, fatGramsFromKcal, servingNutrition, hydrationNeedsMl, hotWeatherFluidMl } from '../../../../lib/health/objectives'

const BW = 'Body & Weight'
const WM = 'Weight Management'
const NU = 'Nutrition & Calories'
const HY = 'Hydration'

export const extrasWeightGroup: Record<string, HealthToolConfig> = {}

extrasWeightGroup['weight-loss-percentage'] = {
  id: 'weight-loss-percentage',
  title: 'Weight Loss Percentage Calculator',
  description: 'Show how much of your starting weight you have already lost as a percentage.',
  icon: <TrendingDown className="h-6 w-6" />,
  breadcrumb: 'Health / Body & Weight',
  instruction: 'Enter your starting and current weight.',
  sub: BW,
  emoji: '🧍',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'start', label: 'Starting weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 90' },
    { key: 'current', label: 'Current weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 84' },
  ],
  compute: (values) => {
    const pct = weightLossPct(values.start ?? NaN, values.current ?? NaN)
    const lost = weightChangeKg(values.current ?? NaN, values.start ?? NaN)
    if (pct === null || lost === null) return null
    return { title: 'Weight lost', value: pct.toFixed(1), unit: '%', tone: pct >= 4 ? 'warn' : 'good', badge: pct >= 10 ? 'Over 10% - excellent progress' : pct >= 4 ? 'Meaningful loss recorded' : 'Early stage of the journey', note: `That is ${lost.toFixed(1)} kg down from your start. Even 5-10% loss measurably improves heart, blood sugar and joints.`, pct: Math.min(100, pct * 10) }
  },
  howItWorks: [
    { title: 'Enter start weight', text: 'The number you began from.' },
    { title: 'Enter current weight', text: 'Today\u2019s reading.' },
    { title: 'See the %', text: 'Loss relative to the start value.' },
  ],
  tips: [
    'Calculate with the same scale time of day.',
    'Losing 5-10% of your body weight has real health benefits.',
    'A loss plateau of 2+ weeks is a sign to revisit your plan.',
  ],
}

extrasWeightGroup['weight-gain-calculator'] = {
  id: 'weight-gain-calculator',
  title: 'Weight Gain Calculator',
  description: 'Track how many kilos you have gained from your starting weight and by how much.',
  icon: <TrendingUp className="h-6 w-6" />,
  breadcrumb: 'Health / Body & Weight',
  instruction: 'Enter your starting and current weight.',
  sub: BW,
  emoji: '🧍',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'start', label: 'Starting weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 60' },
    { key: 'current', label: 'Current weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 66' },
  ],
  compute: (values) => {
    const pct = weightGainPct(values.start ?? NaN, values.current ?? NaN)
    const gained = weightChangeKg(values.current ?? NaN, values.start ?? NaN)
    if (pct === null || gained === null) return null
    return { title: 'Weight gained', value: gained.toFixed(1), unit: 'kg', tone: pct > 5 ? 'warn' : 'ok', badge: pct >= 5 ? 'Rapid gain - review intake' : 'Gain is being tracked', note: `${pct.toFixed(1)}% of your start weight. If fat gain is unwanted, a modest daily surplus of 300-500 kcal builds mass slowly.` }
  },
  howItWorks: [
    { title: 'Enter start weight', text: 'Your original baseline.' },
    { title: 'Enter current weight', text: 'The latest measurement.' },
    { title: 'Read gain', text: 'Kg and % gained since start.' },
  ],
  tips: [
    'Aim to gain 0.25-0.5 kg per week for quality mass.',
    'Pair surplus calories with resistance training.',
    'Use a moving 7-day average to filter daily swings.',
  ],
}

extrasWeightGroup['weight-loss-goal'] = {
  id: 'weight-loss-goal',
  title: 'Weight Loss Goal Calculator',
  description: 'Turn a target weight and timeframe into a safe weekly loss and daily deficit.',
  icon: <Target className="h-6 w-6" />,
  breadcrumb: 'Health / Weight Management',
  instruction: 'Enter your current weight, target weight and how many weeks you plan to take.',
  sub: WM,
  emoji: '⚖️',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'start', label: 'Current weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 95' },
    { key: 'target', label: 'Target weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 85' },
    { key: 'weeks', label: 'Goal duration (weeks)', type: 'number', min: 1, max: 104, placeholder: 'e.g. 16' },
  ],
  compute: (values) => {
    const r = weightGoalPlan(values.start ?? NaN, values.target ?? NaN, values.weeks ?? NaN)
    if (r === null) return null
    const safe = r.rateKgPerWeek <= 1
    return { title: 'Total loss needed', value: r.lossKg.toFixed(1), unit: 'kg', tone: r.rateKgPerWeek <= 1 ? 'good' : 'warn', badge: safe ? `${r.rateKgPerWeek.toFixed(2)} kg/week - safe pace` : `${r.rateKgPerWeek.toFixed(2)} kg/week - too fast`, note: `You will burn about ${r.dailyDeficitKcal} kcal per day above normal intake to hit this timeline. Weekly loss above 1 kg is hard to sustain and often includes muscle.`, pct: Math.min(100, r.rateKgPerWeek * 100) }
  },
  howItWorks: [
    { title: 'Give weights', text: 'Current and target kilos.' },
    { title: 'Set the weeks', text: 'How long the goal takes.' },
    { title: 'Check the pace', text: 'Weekly rate plus daily deficit.' },
  ],
  tips: [
    'Keep weekly loss under 1 kg for sustainable fat loss.',
    'Split that daily deficit across food and movement.',
    'Recompute every 4 weeks as your weight changes.',
  ],
}

extrasWeightGroup['weight-gain-planner'] = {
  id: 'weight-gain-planner',
  title: 'Weight Gain Planner',
  description: 'Calculate the weekly gain pace and daily calorie surplus to reach a heavier target.',
  icon: <TrendingUp className="h-6 w-6" />,
  breadcrumb: 'Health / Weight Management',
  instruction: 'Enter your current weight, goal weight and the number of weeks you have.',
  sub: WM,
  emoji: '⚖️',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'start', label: 'Current weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 62' },
    { key: 'target', label: 'Goal weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 70' },
    { key: 'weeks', label: 'Goal duration (weeks)', type: 'number', min: 1, max: 104, placeholder: 'e.g. 24' },
  ],
  compute: (values) => {
    const r = weightGainPlan(values.start ?? NaN, values.target ?? NaN, values.weeks ?? NaN)
    if (r === null) return null
    return { title: 'Total gain needed', value: r.gainKg.toFixed(1), unit: 'kg', tone: 'ok', badge: `${r.rateKgPerWeek.toFixed(2)} kg/week plan`, note: `About ${r.dailySurplusKcal} surplus kcal per day. Slow, steady gains let more of it become muscle when paired with progressive training.` }
  },
  howItWorks: [
    { title: 'Enter start and goal', text: 'Current to target weight.' },
    { title: 'Pick a timeframe', text: 'Weeks available.' },
    { title: 'Read the surplus', text: 'Daily kcal and weekly pace.' },
  ],
  tips: [
    '0.25-0.5 kg per week is the quality-gain sweet spot.',
    'Prioritise protein: roughly 1.6-2.2 g per kg of body weight.',
    'Train with progressive overload so the extra fuels muscle.',
  ],
}

extrasWeightGroup['goal-weight-calculator'] = {
  id: 'goal-weight-calculator',
  title: 'Goal Weight Calculator',
  description: 'Find the weight that matches a target BMI for your height.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Weight Management',
  instruction: 'Enter your height and choose a target BMI.',
  sub: WM,
  emoji: '⚖️',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'height', label: 'Height (cm)', type: 'number', min: 90, max: 250, placeholder: 'e.g. 172' },
    { key: 'bmi', label: 'Target BMI', type: 'select', options: [{ value: '18.5', label: '18.5 - lower healthy band' }, { value: '22', label: '22 - near-band midpoint' }, { value: '24.9', label: '24.9 - upper healthy band' }, { value: '27', label: '27 - overweight territory' }] },
  ],
  compute: (values) => {
    const w = weightAtBmi(values.bmi ?? NaN, values.height ?? NaN)
    if (w === null) return null
    return { title: 'Goal weight', value: w.toFixed(0), unit: 'kg', tone: 'good', badge: 'BMI-aligned target', note: 'This is the weight at which your height lands on the selected BMI. Your personal goal can sit anywhere within a healthy band.' }
  },
  howItWorks: [
    { title: 'Enter height', text: 'In centimetres.' },
    { title: 'Pick a target BMI', text: 'Healthy bands and adjacent.' },
    { title: 'Get the weight', text: 'Weight = BMI \u00d7 height squared.' },
  ],
  tips: [
    'A BMI of 18.5-24.9 is the conventional healthy band.',
    'Muscular people can sit higher while staying lean.',
    'Use a realistic BMI you can sustain long term.',
  ],
}

extrasWeightGroup['maintenance-weight-calculator'] = {
  id: 'maintenance-weight-calculator',
  title: 'Maintenance Weight Calculator',
  description: 'Estimate the weight you would settle at for a given daily calorie intake and activity.',
  icon: <Scale className="h-6 w-6" />,
  breadcrumb: 'Health / Weight Management',
  instruction: 'Enter your typical daily intake and choose your per-kg activity factor.',
  sub: WM,
  emoji: '⚖️',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'kcal', label: 'Daily calorie intake', type: 'number', min: 800, max: 6000, placeholder: 'e.g. 2400' },
    { key: 'factor', label: 'Activity factor (kcal per kg per day)', type: 'select', options: [{ value: '28', label: '28 - sedentary' }, { value: '31', label: '31 - light activity' }, { value: '35', label: '35 - moderately active' }, { value: '40', label: '40 - very active' }] },
  ],
  compute: (values) => {
    const w = maintenanceWeightKg(values.kcal ?? NaN, values.factor ?? NaN)
    if (w === null) return null
    return { title: 'Estimated weight', value: w.toFixed(0), unit: 'kg', tone: 'ok', badge: 'Equilibrium estimate', note: 'If you consistently eat this many calories, weight tends to drift toward this figure for your activity level. It is a rough anchor, not a prescription.' }
  },
  howItWorks: [
    { title: 'Enter daily kcal', text: 'Your honest daily intake.' },
    { title: 'Pick activity factor', text: 'kcal per kg per day band.' },
    { title: 'Divide them', text: 'Weight = intake \u00f7 factor.' },
  ],
  tips: [
    'Use a 2-week food log for a truer intake number.',
    'Activity factors vary person to person.',
    'Adjust the factor when your weight steadies or shifts.',
  ],
}

extrasWeightGroup['fat-intake-target'] = {
  id: 'fat-intake-target',
  title: 'Fat Intake Calculator',
  description: 'Convert a calorie budget and target fat percentage into daily fat grams.',
  icon: <Pizza className="h-6 w-6" />,
  breadcrumb: 'Health / Nutrition & Calories',
  instruction: 'Enter your daily calories and the percentage you want to come from fat.',
  sub: NU,
  emoji: '🥗',
  accent: 'text-lime-600 bg-lime-50 border-lime-200',
  fields: [
    { key: 'kcal', label: 'Daily calories', type: 'number', min: 800, max: 6000, placeholder: 'e.g. 2000' },
    { key: 'pct', label: 'Fat % of calories', type: 'select', options: [{ value: '20', label: '20% - lower fat' }, { value: '25', label: '25%' }, { value: '30', label: '30% - balanced' }, { value: '35', label: '35%' }] },
  ],
  compute: (values) => {
    const g = fatGramsFromKcal(values.kcal ?? NaN, values.pct ?? NaN)
    if (g === null) return null
    return { title: 'Fat target', value: g.toFixed(0), unit: 'g/day', tone: 'good', badge: `${values.pct}% of calories as fat`, note: 'Fat provides 9 kcal per gram. Most balanced diets land between 20-35% of daily energy from fat.' }
  },
  howItWorks: [
    { title: 'Set daily calories', text: 'Your energy budget.' },
    { title: 'Choose fat %', text: '20-35% typical range.' },
    { title: 'Convert to grams', text: 'kcal \u00d7 % \u00f7 9.' },
  ],
  tips: [
    'Prefer unsaturated sources: nuts, olive oil, fish.',
    'Trans fats from fried and ultra-processed foods are the ones to cut.',
    'Fat aids vitamin absorption and hormone balance.',
  ],
}

extrasWeightGroup['calorie-surplus-calculator'] = {
  id: 'calorie-surplus-calculator',
  title: 'Calorie Surplus Calculator',
  description: 'See how far your daily intake sits above maintenance and what that means weekly.',
  icon: <Flame className="h-6 w-6" />,
  breadcrumb: 'Health / Nutrition & Calories',
  instruction: 'Enter your maintenance calories and what you actually eat each day.',
  sub: NU,
  emoji: '🥗',
  accent: 'text-lime-600 bg-lime-50 border-lime-200',
  fields: [
    { key: 'maintenance', label: 'Maintenance calories', type: 'number', min: 800, max: 6000, placeholder: 'e.g. 2400' },
    { key: 'intake', label: 'Your daily intake', type: 'number', min: 800, max: 8000, placeholder: 'e.g. 2900' },
  ],
  compute: (values) => {
    const s = calorieSurplusKcal(values.intake ?? NaN, values.maintenance ?? NaN)
    if (s === null) return null
    return { title: 'Daily surplus', value: s.toFixed(0), unit: 'kcal', tone: s <= 500 ? 'ok' : 'warn', badge: s <= 300 ? 'Modest surplus' : s <= 700 ? 'Moderate surplus' : 'Large surplus', note: `A weekly surplus of about ${Math.round((s * 7) / 7700 * 10) / 10} kg of stored energy. Useful for muscle gain; excessive if fat gain is unwanted.`, pct: Math.min(100, (s / 1000) * 100) }
  },
  howItWorks: [
    { title: 'Enter maintenance', text: 'Kcal to hold weight.' },
    { title: 'Enter intake', text: 'What you actually eat.' },
    { title: 'Subtract', text: 'Intake minus maintenance.' },
  ],
  tips: [
    'A 300-500 kcal surplus suits most muscle-gain phases.',
    'Surplus size and weeks-to-goal are linked.',
    'Most of a very large surplus becomes stored fat.',
  ],
}

extrasWeightGroup['nutrition-label-calculator'] = {
  id: 'nutrition-label-calculator',
  title: 'Nutrition Label Calculator',
  description: 'Scale per-100g label values to what a single serving of the food contains.',
  icon: <Apple className="h-6 w-6" />,
  breadcrumb: 'Health / Nutrition & Calories',
  instruction: 'Copy the per-100g values from the label and enter your portion weight.',
  sub: NU,
  emoji: '🥗',
  accent: 'text-lime-600 bg-lime-50 border-lime-200',
  fields: [
    { key: 'kcal', label: 'kcal per 100g', type: 'number', min: 0, max: 1000, step: 0.1, placeholder: 'e.g. 180' },
    { key: 'protein', label: 'Protein per 100g (g)', type: 'number', min: 0, max: 100, step: 0.1, placeholder: 'e.g. 6' },
    { key: 'carbs', label: 'Carbs per 100g (g)', type: 'number', min: 0, max: 100, step: 0.1, placeholder: 'e.g. 20' },
    { key: 'fat', label: 'Fat per 100g (g)', type: 'number', min: 0, max: 100, step: 0.1, placeholder: 'e.g. 8' },
    { key: 'fiber', label: 'Fiber per 100g (g)', type: 'number', min: 0, max: 100, step: 0.1, placeholder: 'e.g. 3' },
    { key: 'serving', label: 'Your serving (g)', type: 'number', min: 1, max: 2000, placeholder: 'e.g. 150' },
  ],
  compute: (values) => {
    const n = servingNutrition(values.kcal ?? NaN, values.protein ?? NaN, values.carbs ?? NaN, values.fat ?? NaN, values.fiber ?? NaN, values.serving ?? NaN)
    if (n === null) return null
    return { title: 'Per-100g → to your serving', value: `${n.kcal} kcal`, unit: '', tone: 'ok', badge: `Protein ${n.proteinG}g · Carbs ${n.carbsG}g · Fat ${n.fatG}g · Fiber ${n.fiberG}g`, note: 'Weigh your portion to stay accurate - estimating by eye usually over-serves by 20-40%.' }
  },
  howItWorks: [
    { title: 'Read the label', text: 'Take the per-100g line.' },
    { title: 'Enter portion weight', text: 'How many grams you eat.' },
    { title: 'Scale up', text: 'Every value \u00d7 (serving \u00f7 100).' },
  ],
  tips: [
    'A kitchen scale beats guessing portions.',
    'Packaged labels show per-100g and per-serving on purpose.',
    'Track the serving you actually eat, not the suggested one.',
  ],
}

extrasWeightGroup['hydration-needs'] = {
  id: 'hydration-needs',
  title: 'Hydration Needs Calculator',
  description: 'Personal fluid target from weight, age, exercise and outdoor temperature.',
  icon: <Droplets className="h-6 w-6" />,
  breadcrumb: 'Health / Hydration',
  instruction: 'Enter your details for a daily hydration target.',
  sub: HY,
  emoji: '💧',
  accent: 'text-sky-600 bg-sky-50 border-sky-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', min: 20, max: 300, placeholder: 'e.g. 70' },
    { key: 'age', label: 'Age (years)', type: 'number', min: 1, max: 120, placeholder: 'e.g. 32' },
    { key: 'exercise', label: 'Exercise minutes today', type: 'number', min: 0, max: 480, placeholder: 'e.g. 45' },
    { key: 'temp', label: 'Outside temperature (°C)', type: 'number', min: -10, max: 50, placeholder: 'e.g. 28' },
  ],
  compute: (values) => {
    const ml = hydrationNeedsMl(values.weight ?? NaN, values.age ?? NaN, values.exercise ?? NaN, values.temp ?? NaN)
    if (ml === null) return null
    return { title: 'Daily fluid target', value: (ml / 1000).toFixed(1), unit: 'L', tone: 'good', badge: ml >= 2500 ? 'Higher needs - hot or active' : 'Typical range', note: `About ${ml.toFixed(0)} ml total. Over age 50 the per-kg base drops slightly; heat and exercise add on top.` }
  },
  howItWorks: [
    { title: 'Enter weight and age', text: 'Sets the body-size base.' },
    { title: 'Add exercise', text: '+12 ml per active minute.' },
    { title: 'Add heat', text: 'Extra for warm days >25°C.' },
  ],
  tips: [
    'Sip through the day instead of chugging.',
    'Urine should look pale yellow, not dark.',
    'Thirst usually trails actual need - drink before you feel it.',
  ],
}

extrasWeightGroup['hot-weather-hydration'] = {
  id: 'hot-weather-hydration',
  title: 'Hot Weather Hydration Planner',
  description: 'Extra fluid guidance for hot, humid days and outdoor activity.',
  icon: <CloudSun className="h-6 w-6" />,
  breadcrumb: 'Health / Hydration',
  instruction: 'Enter the conditions and how long you will be active outside.',
  sub: HY,
  emoji: '💧',
  accent: 'text-sky-600 bg-sky-50 border-sky-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', min: 20, max: 300, placeholder: 'e.g. 70' },
    { key: 'temp', label: 'Temperature (°C)', type: 'number', min: 0, max: 50, placeholder: 'e.g. 36' },
    { key: 'humidity', label: 'Humidity (%)', type: 'number', min: 0, max: 100, placeholder: 'e.g. 75' },
    { key: 'minutes', label: 'Outdoor activity (min)', type: 'number', min: 0, max: 480, placeholder: 'e.g. 90' },
  ],
  compute: (values) => {
    const ml = hotWeatherFluidMl(values.weight ?? NaN, values.temp ?? NaN, values.humidity ?? NaN, values.minutes ?? NaN)
    if (ml === null) return null
    return { title: 'Fluid for the day', value: (ml / 1000).toFixed(1), unit: 'L', tone: ml >= 3500 ? 'warn' : 'ok', badge: ml >= 3500 ? 'Very high requirements' : 'Heat-adjusted plan', note: `Roughly ${ml.toFixed(0)} ml. Above 28°C with high humidity your cooling system works harder than the thermometer alone suggests.`, pct: Math.min(100, (ml / 5000) * 100) }
  },
  howItWorks: [
    { title: 'Enter conditions', text: 'Temp, humidity, weight.' },
    { title: 'Add activity', text: 'Minutes you will be outside.' },
    { title: 'Scale fluids', text: 'Heat and sweat bump the base.' },
  ],
  tips: [
    'High humidity means sweat evaporates poorly - keep sipping.',
    'Take bottles on any outdoor shift over 60 minutes.',
    'If you feel dizzy or disoriented, cool down fast and drink.',
  ],
}