import { Footprints, Timer, Flame, Activity, Dumbbell, Bike, Waves, HeartPulse, Gauge, Repeat } from 'lucide-react'
import type { HealthToolConfig } from '../HealthGenericTool'
import { stepsToCalories, metCaloriesBurned, runningMet, cyclingMet, swimmingMet, strengthMet, paceMinPerKm } from '../../../../lib/health/fitness'
import { walkingPace, workoutDurationMinutes, kcalPerHourFromMet, trainingVolumeKg } from '../../../../lib/health/fitnessPlanner'
import { hrReserveValue, karvonenTargetFromReserve, ldlHdlRatio, ldlHdlBand, hrRecoveryDrop, hrRecoveryBand, cvRiskScore, cvRiskBand, framinghamPoints, framinghamBand, ascvdPoints, ascvdBand } from '../../../../lib/health/cardiovascularRisk'

const FU = 'Fitness & Exercise'
const HE = 'Heart & Cardiovascular'

export const extrasFitnessHeartGroup: Record<string, HealthToolConfig> = {}

extrasFitnessHeartGroup['walking-pace'] = {
  id: 'walking-pace',
  title: 'Walking Pace Calculator',
  description: 'Convert walk distance and time into minutes per km plus walking calories.',
  icon: <Footprints className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter the distance you walked and how long it took.',
  sub: FU,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'distance', label: 'Distance (km)', type: 'number', min: 0.1, max: 100, step: 0.1, placeholder: 'e.g. 5' },
    { key: 'minutes', label: 'Time (minutes)', type: 'number', min: 1, max: 600, placeholder: 'e.g. 60' },
    { key: 'weight', label: 'Body weight (kg) - for calories', type: 'number', min: 30, max: 300, placeholder: 'e.g. 70' },
  ],
  compute: (values) => {
    const p = walkingPace(values.distance ?? NaN, values.minutes ?? NaN)
    const kcal = values.weight ? metCaloriesBurned(3.5, values.weight, values.minutes ?? NaN) : null
    if (p === null) return null
    return { title: 'Walking pace', value: p.minPerKm.toFixed(1), unit: 'min/km', tone: 'good', badge: kcal !== null ? `~${Math.round(kcal)} kcal burned` : 'About 3.5 MET effort', note: `That works out to ${p.kmh.toFixed(1)} km/h - a brisk, moderate walk. Add hills or a weighted vest to raise intensity.` }
  },
  howItWorks: [
    { title: 'Enter distance', text: 'Km walked.' },
    { title: 'Enter time', text: 'Minutes spent walking.' },
    { title: 'Compute pace', text: 'Time \u00f7 distance in km.' },
  ],
  tips: [
    'Brisk walking burns roughly 3.5 METs.',
    'Walking 30 minutes a day is a proven baseline habit.',
    'Cadence above 120 steps/min raises intensity meaningfully.',
  ],
}

extrasFitnessHeartGroup['steps-to-calories'] = {
  id: 'steps-to-calories',
  title: 'Steps to Calories Calculator',
  description: 'Estimate calories burned from your daily step count and body weight.',
  icon: <Footprints className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter your steps today and your body weight.',
  sub: FU,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'steps', label: 'Daily steps', type: 'number', min: 0, max: 100000, placeholder: 'e.g. 8000' },
    { key: 'weight', label: 'Body weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 70' },
  ],
  compute: (values) => {
    const kcal = stepsToCalories(values.steps ?? NaN, values.weight ?? NaN)
    if (kcal === null) return null
    return { title: 'Calories from steps', value: kcal.toFixed(0), unit: 'kcal', tone: 'good', badge: values.steps && values.steps >= 7500 ? 'Active day' : 'Getting moving helps', note: 'Estimate uses a stride of ~0.7 m and typical walking economy. Strolling burns less per step than a brisk pace.', pct: Math.min(100, ((values.steps ?? 0) / 10000) * 100) }
  },
  howItWorks: [
    { title: 'Enter steps', text: 'Your daily count.' },
    { title: 'Enter weight', text: 'Heavier bodies burn more.' },
    { title: 'Convert', text: 'Steps \u2192 km \u2192 kcal.' },
  ],
  tips: [
    '10,000 steps is a popular but arbitrary target.',
    'Add 30 brisk minutes for an extra calorie boost.',
    'Consistency beats an occasional marathon day.',
  ],
}

extrasFitnessHeartGroup['exercise-calories'] = {
  id: 'exercise-calories',
  title: 'Exercise Calories Calculator',
  description: 'Pick an activity MET and see the calories burned for your weight and duration.',
  icon: <Flame className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Choose your activity, enter weight and workout minutes.',
  sub: FU,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'met', label: 'Activity intensity (MET)', type: 'select', options: [{ value: '2', label: '2 - light stretching/walk' }, { value: '3.5', label: '3.5 - brisk walk' }, { value: '5', label: '5 - cycling, moderate' }, { value: '7', label: '7 - jogging, calisthenics' }, { value: '8', label: '8 - vigorous aerobics' }, { value: '10', label: '10 - running, swimming laps' }] },
    { key: 'weight', label: 'Body weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 70' },
    { key: 'minutes', label: 'Workout minutes', type: 'number', min: 1, max: 600, placeholder: 'e.g. 45' },
  ],
  compute: (values) => {
    const kcal = metCaloriesBurned(values.met ?? NaN, values.weight ?? NaN, values.minutes ?? NaN)
    if (kcal === null) return null
    return { title: 'Calories burned', value: kcal.toFixed(0), unit: 'kcal', tone: 'good', badge: `MET ${values.met} medium intensity`, note: 'MET tables give population averages - actual burn varies with efficiency, hills and temp.' }
  },
  howItWorks: [
    { title: 'Pick a MET', text: 'Rough intensity of the activity.' },
    { title: 'Enter weight', text: 'Bigger bodies do more work.' },
    { title: 'Multiply', text: 'MET \u00d7 weight \u00d7 hours.' },
  ],
  tips: [
    'MET 1 = sitting at rest; 2+ starts moving.',
    'Add 10% for hilly or hot sessions.',
    'Prefer consistency over one long blow-out.',
  ],
}

extrasFitnessHeartGroup['workout-duration'] = {
  id: 'workout-duration',
  title: 'Workout Duration Calculator',
  description: 'Estimate how long a distance takes at your planned speed.',
  icon: <Timer className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter the distance and your average speed.',
  sub: FU,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'distance', label: 'Distance (km)', type: 'number', min: 0.1, max: 200, step: 0.1, placeholder: 'e.g. 10' },
    { key: 'speed', label: 'Average speed (km/h)', type: 'number', min: 1, max: 40, placeholder: 'e.g. 8' },
  ],
  compute: (values) => {
    const mins = workoutDurationMinutes(values.distance ?? NaN, values.speed ?? NaN)
    if (mins === null) return null
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return { title: 'Workout duration', value: h > 0 ? `${h}h ${m}m` : `${m} min`, unit: '', tone: 'ok', badge: `${values.speed} km/h average`, note: 'Add time for warm-up, cooldown and any rest stops to plan your full session window.' }
  },
  howItWorks: [
    { title: 'Enter distance', text: 'Km to cover.' },
    { title: 'Enter speed', text: 'km/h you plan to hold.' },
    { title: 'Solve for time', text: 'Distance \u00f7 speed.' },
  ],
  tips: [
    'Start 10% slower than your target speed.',
    'Account for terrain - trails slow you down.',
    'Negative splits feel great at the finish.',
  ],
}

extrasFitnessHeartGroup['exercise-met'] = {
  id: 'exercise-met',
  title: 'Exercise MET Calculator',
  description: 'See the calories-per-hour an activity MET represents at your body weight.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Pick a MET level and enter your weight to see kcal/hour.',
  sub: FU,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'met', label: 'MET level', type: 'select', options: [{ value: '1.5', label: '1.5 - office work' }, { value: '3', label: '3 - easy walking' }, { value: '5', label: '5 - moderate cycling' }, { value: '8', label: '8 - aerobic dance rower' }, { value: '12', label: '12 - fast running' }] },
    { key: 'weight', label: 'Body weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 70' },
  ],
  compute: (values) => {
    const perHour = kcalPerHourFromMet(values.met ?? NaN, values.weight ?? NaN)
    if (perHour === null) return null
    return { title: 'Calories per hour', value: perHour.toFixed(0), unit: 'kcal/h', tone: 'good', badge: `MET ${values.met}`, note: 'One MET equals the energy of sitting quietly. Exercise escalates from ~2 (walking) to 12+ (fast running).' }
  },
  howItWorks: [
    { title: 'Pick MET', text: 'The activity intensity.' },
    { title: 'Enter weight', text: 'Your body mass.' },
    { title: 'Multiply', text: 'MET \u00d7 kg = kcal/hour.' },
  ],
  tips: [
    'A 30-minute session at 5 MET burns ~ 2.5 kcal/kg.',
    'Interval bursts push the average MET up.',
    'MET values are averages - intensity within an activity varies.',
  ],
}

extrasFitnessHeartGroup['running-calories'] = {
  id: 'running-calories',
  title: 'Running Calories Calculator',
  description: 'Estimate the calories burned during a run based on weight and time.',
  icon: <Footprints className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter your weight and total run minutes.',
  sub: FU,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'weight', label: 'Body weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 70' },
    { key: 'minutes', label: 'Run minutes', type: 'number', min: 1, max: 600, placeholder: 'e.g. 40' },
    { key: 'pace', label: 'Pace estimate', type: 'select', options: [{ value: '8.4', label: '~7:05 min/km' }, { value: '8.8', label: '~6:50 min/km' }, { value: '9.8', label: '~6:05 min/km' }, { value: '10.5', label: '~5:45 min/km' }, { value: '11.5', label: '~5:15 min/km' }] },
  ],
  compute: (values) => {
    const minPerKm = paceMinPerKm(values.pace ?? NaN)
    const kcal = runningMet(values.weight ?? NaN, values.minutes ?? NaN)
    if (kcal === null || minPerKm === null) return null
    const dist = (values.minutes ?? 0) / minPerKm
    return { title: 'Calories burned', value: kcal.toFixed(0), unit: 'kcal', tone: 'good', badge: `~${dist.toFixed(1)} km at that pace`, note: 'Running roughly burns 1 kcal per kg per km plus the speed-ratio correction - faster sessions add a little more.', pct: Math.min(100, (kcal / 1200) * 100) }
  },
  howItWorks: [
    { title: 'Enter weight', text: 'Your body mass.' },
    { title: 'Enter run time', text: 'Total minutes.' },
    { title: 'Pick pace', text: 'Adjusts the burn slightly.' },
  ],
  tips: [
    'A 70 kg runner burns ~650 kcal in 60 minutes.',
    'Running terrain and wind change the real number.',
    'Refuel within a couple of hours on long runs.',
  ],
}

extrasFitnessHeartGroup['cycling-calories'] = {
  id: 'cycling-calories',
  title: 'Cycling Calories Calculator',
  description: 'Estimate calories burned cycling based on weight and time.',
  icon: <Bike className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter your weight and ride duration.',
  sub: FU,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'weight', label: 'Body weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 70' },
    { key: 'minutes', label: 'Ride minutes', type: 'number', min: 1, max: 600, placeholder: 'e.g. 90' },
  ],
  compute: (values) => {
    const kcal = cyclingMet(values.weight ?? NaN, values.minutes ?? NaN)
    if (kcal === null) return null
    return { title: 'Calories burned', value: kcal.toFixed(0), unit: 'kcal', tone: 'good', badge: 'Casual-to-moderate riding', note: 'Cycling at a comfortable pace burns fewer calories per minute than running but is easy to sustain far longer.' }
  },
  howItWorks: [
    { title: 'Enter weight', text: 'Body mass in kg.' },
    { title: 'Enter time', text: 'Minutes in the saddle.' },
    { title: 'Estimate', text: 'Moderate MET \u00d7 weight \u00d7 hours.' },
  ],
  tips: [
    'Drafting behind a group cuts effort significantly.',
    'Climbing doubles the burn of flat cruising.',
    'Long steady rides are phenomenal base builders.',
  ],
}

extrasFitnessHeartGroup['swimming-calories'] = {
  id: 'swimming-calories',
  title: 'Swimming Calories Calculator',
  description: 'Estimate calories burned swimming laps based on weight and time.',
  icon: <Waves className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter your weight and swim minutes.',
  sub: FU,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'weight', label: 'Body weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 70' },
    { key: 'minutes', label: 'Swim minutes', type: 'number', min: 1, max: 600, placeholder: 'e.g. 45' },
  ],
  compute: (values) => {
    const kcal = swimmingMet(values.weight ?? NaN, values.minutes ?? NaN)
    if (kcal === null) return null
    return { title: 'Calories burned', value: kcal.toFixed(0), unit: 'kcal', tone: 'good', badge: 'Steady lap swimming', note: 'Water resistance works the whole body, so swimming burns more per minute than casual cycling while being kind to joints.' }
  },
  howItWorks: [
    { title: 'Enter weight', text: 'Body mass in kg.' },
    { title: 'Enter time', text: 'Minutes in the pool.' },
    { title: 'Estimate', text: 'Swimming MET \u00d7 weight \u00d7 hours.' },
  ],
  tips: [
    'Cool water and poor technique silently raise effort.',
    'Drills with a kickboard change the muscle demands.',
    'Swimming pairs brilliantly with strength work.',
  ],
}

extrasFitnessHeartGroup['strength-training-calculator'] = {
  id: 'strength-training-calculator',
  title: 'Strength Training Calculator',
  description: 'Total the volume (sets × reps × kg) of a lift and its rough calorie cost.',
  icon: <Dumbbell className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter sets, reps and the weight, then the minutes spent lifting.',
  sub: FU,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'sets', label: 'Sets', type: 'number', min: 1, max: 20, placeholder: 'e.g. 4' },
    { key: 'reps', label: 'Reps per set', type: 'number', min: 1, max: 100, placeholder: 'e.g. 10' },
    { key: 'weight', label: 'Weight (kg)', type: 'number', min: 0, max: 500, placeholder: 'e.g. 60' },
    { key: 'minutes', label: 'Session minutes', type: 'number', min: 1, max: 300, placeholder: 'e.g. 50' },
  ],
  compute: (values) => {
    const vol = trainingVolumeKg(values.sets ?? NaN, values.reps ?? NaN, values.weight ?? NaN)
    const kcal = strengthMet(values.weight ?? NaN, values.minutes ?? NaN)
    if (vol === null || kcal === null) return null
    return { title: 'Training volume', value: vol.toFixed(0), unit: 'kg', tone: 'ok', badge: `~${Math.round(kcal)} kcal this session`, note: 'Volume load is the classic driver of hypertrophy. Strength sessions are usually more efficient at building power than burning calories.' }
  },
  howItWorks: [
    { title: 'Enter sets×reps', text: 'Your scheme.' },
    { title: 'Enter weight', text: 'Kg on the bar.' },
    { title: 'Multiply', text: 'Sets \u00d7 reps \u00d7 kg.' },
  ],
  tips: [
    'Progressive overload = slowly add reps or kg.',
    'Leave 1-2 reps in reserve on most sets.',
    'Rest 2-3 minutes on big compound lifts.',
  ],
}

extrasFitnessHeartGroup['hr-reserve-calculator'] = {
  id: 'hr-reserve-calculator',
  title: 'Heart Rate Reserve Calculator',
  description: 'Carve your max-to-resting range into Karvonen training zones.',
  icon: <HeartPulse className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter resting heart rate and your age-based max.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [
    { key: 'rest', label: 'Resting heart rate (bpm)', type: 'number', min: 30, max: 120, placeholder: 'e.g. 60' },
    { key: 'max', label: 'Max heart rate (bpm) - or leave blank to estimate by age in next field', type: 'number', min: 100, max: 220, placeholder: 'e.g. 185' },
    { key: 'intensity', label: 'Training intensity', type: 'select', options: [{ value: '60', label: '60% - endurance base' }, { value: '70', label: '70% - aerobic' }, { value: '80', label: '80% - threshold' }, { value: '90', label: '90% - VO2 work' }] },
  ],
  compute: (values) => {
    const reserve = hrReserveValue(values.max ?? NaN, values.rest ?? NaN)
    const target = karvonenTargetFromReserve(values.rest ?? NaN, reserve ?? NaN, values.intensity ?? NaN)
    if (reserve === null || target === null || values.rest === null) return null
    return { title: 'Heart rate reserve', value: reserve.toFixed(0), unit: 'bpm', tone: 'good', badge: `Target ≈ ${target} bpm at ${values.intensity}%`, note: `Reserve = max − resting. Karvonen ties your zone to that personal band, so it beats fixed percentage training.`, pct: Math.min(100, reserve) }
  },
  howItWorks: [
    { title: 'Enter resting HR', text: 'Pulse on waking, roughly.' },
    { title: 'Enter max HR', text: 'Measured or age-estimated.' },
    { title: 'Pick intensity', text: 'Zone from 60-90%.' },
  ],
  tips: [
    'A lower resting HR often tracks with fitness.',
    'Recheck your resting HR every few weeks.',
    'In the comfort zone now, tighten it later.',
  ],
}

extrasFitnessHeartGroup['cv-risk-score'] = {
  id: 'cv-risk-score',
  title: 'Cardiovascular Risk Score',
  description: 'A simple 0-9 lifestyle and history check of cardiovascular risk factors.',
  icon: <HeartPulse className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Tick the factors that describe you.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [
    { key: 'age', label: 'Your age', type: 'number', min: 18, max: 110, placeholder: 'e.g. 52' },
    { key: 'male', label: 'Male (risk factor in most scoring models)', type: 'bool' },
    { key: 'smoker', label: 'Current smoker', type: 'bool' },
    { key: 'diabetes', label: 'Diabetes', type: 'bool' },
    { key: 'htn', label: 'Treat me for high blood pressure', type: 'bool' },
    { key: 'family', label: 'Early heart disease in family', type: 'bool' },
    { key: 'bmi', label: 'BMI over 30', type: 'bool' },
    { key: 'sedentary', label: 'Mostly sedentary days', type: 'bool' },
  ],
  compute: (values) => {
    const s = cvRiskScore(values.age ?? NaN, values.male === 1, values.smoker === 1, values.diabetes === 1, values.htn === 1, values.family === 1, values.bmi === 1, values.sedentary === 1)
    if (s === null) return null
    return { title: 'CV risk score', value: s.toFixed(0), unit: '/9', tone: s >= 7 ? 'danger' : s >= 5 ? 'warn' : s >= 3 ? 'ok' : 'good', badge: cvRiskBand(s), note: 'Notice how many items are changeable: smoking, weight and activity can all shift within months.', pct: Math.round((s / 9) * 100) }
  },
  howItWorks: [
    { title: 'Enter age', text: 'Used for the age factor.' },
    { title: 'Tick the rest', text: 'History and habits.' },
    { title: 'Count them', text: '0-9 factor score.' },
  ],
  tips: [
    'Most of these factors respond to lifestyle change.',
    'Use the score to start a conversation with your doctor.',
    'Re-score every 6-12 months to see movement.',
  ],
}

extrasFitnessHeartGroup['framingham-risk-calculator'] = {
  id: 'framingham-risk-calculator',
  title: 'Framingham-Style Risk Calculator',
  description: 'Framingham-style points for 10-year heart risk from classic inputs (educational).',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter the classic Framingham inputs. Educational estimate, not a diagnosis.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [
    { key: 'age', label: 'Age', type: 'number', min: 20, max: 110, placeholder: 'e.g. 58' },
    { key: 'male', label: 'Male', type: 'bool' },
    { key: 'chol', label: 'Total cholesterol (mg/dL)', type: 'number', min: 100, max: 400, placeholder: 'e.g. 220' },
    { key: 'hdl', label: 'HDL (mg/dL)', type: 'number', min: 20, max: 120, placeholder: 'e.g. 45' },
    { key: 'sbp', label: 'Systolic BP (mmHg)', type: 'number', min: 90, max: 220, placeholder: 'e.g. 140' },
    { key: 'smoker', label: 'Smoker', type: 'bool' },
    { key: 'diabetes', label: 'Diabetes', type: 'bool' },
  ],
  compute: (values) => {
    const p = framinghamPoints(values.age ?? NaN, values.male === 1, values.chol ?? NaN, values.hdl ?? NaN, values.sbp ?? NaN, values.smoker === 1, values.diabetes === 1)
    const band = framinghamBand(p, values.male === 1)
    if (p === null || band === null) return null
    return { title: 'Framingham-style points', value: p.toFixed(0), unit: 'pts', tone: p <= 6 ? 'good' : p <= 11 ? 'ok' : 'danger', badge: `${band.band} - ${band.risk}`, note: 'A simplified educational points version of the classic Framingham estimate. Use a clinician-validated calculator for medical decisions.', pct: Math.min(100, (p / 20) * 100) }
  },
  howItWorks: [
    { title: 'Enter age and sex', text: 'Drives the base points.' },
    { title: 'Add lipids and BP', text: 'Cholesterol, HDL, systolic.' },
    { title: 'Add smoking/diabetes', text: 'Read the risk band.' },
  ],
  tips: [
    'A newer lipid panel gives HDL and LDL together.',
    'Repeat panels after lifestyle changes to watch the points fall.',
    'Screening tools flag risk; clinicians decide treatment.',
  ],
}

extrasFitnessHeartGroup['ascvd-risk-score'] = {
  id: 'ascvd-risk-score',
  title: 'ASCVD Risk Estimator',
  description: 'Educational ASCVD-style scoring from the pooled-cohort risk factors.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter your numbers for an educational ASCVD-style risk band.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [
    { key: 'age', label: 'Age', type: 'number', min: 20, max: 110, placeholder: 'e.g. 60' },
    { key: 'male', label: 'Male', type: 'bool' },
    { key: 'chol', label: 'Total cholesterol (mg/dL)', type: 'number', min: 100, max: 400, placeholder: 'e.g. 230' },
    { key: 'hdl', label: 'HDL (mg/dL)', type: 'number', min: 20, max: 120, placeholder: 'e.g. 40' },
    { key: 'sbp', label: 'Systolic BP (mmHg)', type: 'number', min: 90, max: 220, placeholder: 'e.g. 150' },
    { key: 'smoker', label: 'Smoker', type: 'bool' },
    { key: 'diabetes', label: 'Diabetes', type: 'bool' },
  ],
  compute: (values) => {
    const p = ascvdPoints(values.age ?? NaN, values.male === 1, values.chol ?? NaN, values.hdl ?? NaN, values.sbp ?? NaN, values.smoker === 1, values.diabetes === 1)
    if (p === null) return null
    return { title: 'ASCVD-style points', value: p.toFixed(0), unit: 'pts', tone: p <= 9 ? 'good' : p <= 14 ? 'warn' : 'danger', badge: ascvdBand(p), note: 'Simplified educational version of pooled-cohort ASCVD logic covering stroke plus heart attack. Screen, then let a clinician run the full tool.', pct: Math.min(100, (p / 22) * 100) }
  },
  howItWorks: [
    { title: 'Enter demographics', text: 'Age and sex.' },
    { title: 'Add lab and BP', text: 'Cholesterol, HDL, SBP.' },
    { title: 'Add history', text: 'Smoking and diabetes.' },
  ],
  tips: [
    'ASCVD adds stroke risk on top of heart risk.',
    'Scores above the 10-year 7.5% band often trigger discussion.',
    'Low scores still warrant healthy habits.',
  ],
}

extrasFitnessHeartGroup['ldl-hdl-ratio'] = {
  id: 'ldl-hdl-ratio',
  title: 'LDL : HDL Ratio Calculator',
  description: 'Compare your LDL against HDL as a useful lipid ratio.',
  icon: <Repeat className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter recent LDL and HDL readings.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [
    { key: 'ldl', label: 'LDL (mg/dL)', type: 'number', min: 20, max: 300, placeholder: 'e.g. 120' },
    { key: 'hdl', label: 'HDL (mg/dL)', type: 'number', min: 10, max: 150, placeholder: 'e.g. 45' },
  ],
  compute: (values) => {
    const r = ldlHdlRatio(values.ldl ?? NaN, values.hdl ?? NaN)
    if (r === null) return null
    return { title: 'LDL : HDL', value: r.toFixed(2), unit: ':1', tone: r < 2 ? 'good' : r < 3.5 ? 'ok' : 'warn', badge: ldlHdlBand(r), note: 'Below 2 is a favorable balance. The ratio adds context that either number alone misses - HDL helps carry cholesterol away.' }
  },
  howItWorks: [
    { title: 'Enter LDL', text: 'mg/dL from your panel.' },
    { title: 'Enter HDL', text: 'mg/dL from your panel.' },
    { title: 'Divide', text: 'LDL \u00f7 HDL.' },
  ],
  tips: [
    'Raise HDL with exercise and monounsaturated fats.',
    'Lower LDL with fiber, weight loss and less saturated fat.',
    'Ratios pair with absolute numbers - keep both in view.',
  ],
}

extrasFitnessHeartGroup['hr-recovery-check'] = {
  id: 'hr-recovery-check',
  title: 'Heart Rate Recovery Check',
  description: 'See how far your pulse drops one minute after peak effort.',
  icon: <HeartPulse className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter your peak HR during exercise and your HR one minute after stopping.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [
    { key: 'peak', label: 'Peak heart rate (bpm)', type: 'number', min: 80, max: 230, placeholder: 'e.g. 170' },
    { key: 'one', label: 'Heart rate 1 min after (bpm)', type: 'number', min: 40, max: 230, placeholder: 'e.g. 140' },
  ],
  compute: (values) => {
    const drop = hrRecoveryDrop(values.peak ?? NaN, values.one ?? NaN)
    if (drop === null) return null
    return { title: '1-minute drop', value: drop.toFixed(0), unit: 'bpm', tone: drop >= 22 ? 'good' : drop >= 12 ? 'ok' : 'warn', badge: hrRecoveryBand(drop), note: 'A quicker drop reflects better parasympathetic recovery and is a classic fitness signal seen on cardio tests.', pct: Math.min(100, (drop / 50) * 100) }
  },
  howItWorks: [
    { title: 'Reach peak effort', text: 'Sprint, hill, or max set.' },
    { title: 'Stop and time 60s', text: 'Then take your HR.' },
    { title: 'Subtract', text: 'Peak minus 1-minute HR.' },
  ],
  tips: [
    'A drop of 22+ bpm is a solid recovery sign.',
    'Test on an easy day, not after a brutal week.',
    'Improve it with consistent aerobic training.',
  ],
}