/**
 * Pure BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure) Engine
 * Uses the Mifflin-St Jeor equation.
 * Strictly decoupled from React and UI.
 *
 * @param {Object} params
 * @param {number|string} params.weightKg - Weight in kilograms
 * @param {number|string} params.heightCm - Height in centimeters
 * @param {number|string} params.age - Age in years (10-100)
 * @param {string} [params.gender='male'] - 'male' or 'female'
 * @param {number|string} [params.activity=1.375] - Activity factor (1.2 to 1.9)
 * @returns {Object} BMR, TDEE, and caloric goal targets
 */
export function calculateBmrTdee({
  weightKg,
  heightCm,
  age,
  gender = 'male',
  activity = 1.375
} = {}) {
  const w = parseFloat(weightKg)
  const h = parseFloat(heightCm)
  const a = parseInt(age, 10)
  const g = (gender || 'male').toLowerCase().trim()
  const act = parseFloat(activity) || 1.375

  if (isNaN(w) || w <= 20 || w > 350) {
    throw new Error('Please enter a realistic weight between 20 kg and 350 kg.')
  }
  if (isNaN(h) || h < 80 || h > 260) {
    throw new Error('Please enter a realistic height between 80 cm and 260 cm.')
  }
  if (isNaN(a) || a < 10 || a > 120) {
    throw new Error('Please enter a valid age between 10 and 120 years.')
  }
  if (g !== 'male' && g !== 'female') {
    throw new Error('Gender must be "male" or "female".')
  }

  let bmr = 0
  if (g === 'male') {
    bmr = 10 * w + 6.25 * h - 5 * a + 5
  } else {
    bmr = 10 * w + 6.25 * h - 5 * a - 161
  }

  const tdee = bmr * act
  const cutCal = Math.max(1200, Math.round(tdee - 500))
  const bulkCal = Math.round(tdee + 500)
  const bmrRound = Math.round(bmr)
  const tdeeRound = Math.round(tdee)

  return {
    gender: g,
    age: a,
    weightKg: w,
    heightCm: h,
    bmr: bmrRound,
    tdee: tdeeRound,
    weightLossCalories: cutCal,
    muscleGainCalories: bulkCal,
    summary: `BMR: ${bmrRound} kcal/day | Maintenance (TDEE): ${tdeeRound} kcal/day | Weight Loss (-500 kcal): ${cutCal} kcal/day`
  }
}
