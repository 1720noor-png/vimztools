/**
 * Pure Ideal Body Weight (IBW) Engine
 * Calculates healthy target body weight based on the clinical Devine Formula.
 * Strictly decoupled from React and UI.
 *
 * @param {Object} params
 * @param {number|string} params.heightCm - Height in centimeters (100cm - 250cm)
 * @param {string} [params.gender='male'] - Biological sex ('male' or 'female')
 * @returns {Object} Ideal body weight metrics in kg and lbs
 */
export function calculateIdealBodyWeight({ heightCm, gender = 'male' } = {}) {
  const h = parseFloat(heightCm)
  const g = (gender || 'male').toLowerCase().trim()

  if (isNaN(h) || h < 100 || h > 250) {
    throw new Error('Please enter a valid height between 100 cm and 250 cm.')
  }
  if (g !== 'male' && g !== 'female') {
    throw new Error('Gender must be either "male" or "female".')
  }

  const inchesOver60 = (h / 2.54) - 60
  const baseDevine = g === 'male' ? 50 : 45.5
  const devineKg = baseDevine + (2.3 * Math.max(0, inchesOver60))
  const ibwLbs = devineKg * 2.20462

  const devineKgFormatted = devineKg.toFixed(1)
  const ibwLbsFormatted = ibwLbs.toFixed(1)

  return {
    heightCm: h,
    gender: g,
    devineKg,
    ibwLbs,
    devineKgFormatted,
    ibwLbsFormatted,
    val: `Ideal Weight: ${devineKgFormatted} kg (${ibwLbsFormatted} lbs) [Devine Formula]`,
    copyText: `Ideal Body Weight: ${devineKgFormatted} kg (${ibwLbsFormatted} lbs)`,
    summary: `Ideal Body Weight: ${devineKgFormatted} kg (${ibwLbsFormatted} lbs)`
  }
}
