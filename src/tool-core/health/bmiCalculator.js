/**
 * Pure Body Mass Index (BMI) Engine
 * Calculates BMI, WHO weight category, and healthy weight range.
 * Strictly decoupled from React and UI.
 *
 * @param {Object} params
 * @param {number|string} params.weight - Weight in kg (or lbs if unit is imperial)
 * @param {number|string} params.height - Height in cm (or inches if unit is imperial)
 * @param {string} [params.unit='metric'] - 'metric' or 'imperial'
 * @returns {Object} BMI value, category, and healthy weight boundaries
 */
export function calculateBmi({ weight, height, unit = 'metric' } = {}) {
  let w = parseFloat(weight)
  let h = parseFloat(height)

  if (isNaN(w) || w <= 0) {
    throw new Error('Please enter a valid positive weight.')
  }
  if (isNaN(h) || h <= 0) {
    throw new Error('Please enter a valid positive height.')
  }

  let heightMeters = 0
  let weightKg = 0

  if (unit === 'imperial') {
    // Height in inches, weight in lbs
    heightMeters = h * 0.0254
    weightKg = w * 0.453592
  } else {
    // Height in cm (or meters if <= 2.5)
    heightMeters = h > 3 ? h / 100 : h
    weightKg = w
  }

  if (heightMeters <= 0.5 || heightMeters >= 2.8) {
    throw new Error('Please enter a realistic height between 50 cm and 280 cm.')
  }

  const bmi = weightKg / (heightMeters * heightMeters)
  const bmiFormatted = bmi.toFixed(1)
  const bmiNum = parseFloat(bmiFormatted)

  let category = 'Normal / Healthy Weight'
  let risk = 'Low risk of weight-related health issues.'

  if (bmiNum < 18.5) {
    category = 'Underweight'
    risk = 'Increased risk of nutritional deficiency and osteoporosis.'
  } else if (bmiNum <= 24.9) {
    category = 'Normal / Healthy Weight'
    risk = 'Lowest risk of weight-related illnesses.'
  } else if (bmiNum <= 29.9) {
    category = 'Overweight'
    risk = 'Moderate risk of cardiovascular disease and hypertension.'
  } else {
    category = 'Obesity Range'
    risk = 'High risk of type 2 diabetes, heart disease, and hypertension.'
  }

  const minHealthyKg = 18.5 * heightMeters * heightMeters
  const maxHealthyKg = 24.9 * heightMeters * heightMeters

  return {
    bmi: bmiNum,
    bmiFormatted,
    category,
    risk,
    heightMeters,
    weightKg,
    healthyWeightMinKg: parseFloat(minHealthyKg.toFixed(1)),
    healthyWeightMaxKg: parseFloat(maxHealthyKg.toFixed(1)),
    val: `BMI: ${bmiFormatted} (${category})`,
    summary: `BMI is ${bmiFormatted} (${category}). Healthy weight for this height is ${minHealthyKg.toFixed(1)} - ${maxHealthyKg.toFixed(1)} kg.`
  }
}
