/**
 * Pure Temperature Converter Engine (Celsius, Fahrenheit, Kelvin)
 * Zero external dependencies. Node.js & Browser compatible.
 */

const ABSOLUTE_ZERO_CELSIUS = -273.15;
const ABSOLUTE_ZERO_FAHRENHEIT = -459.67;

/**
 * Normalizes temperature unit string
 * @param {string} unit
 * @returns {'c'|'f'|'k'}
 */
export function normalizeTempUnit(unit) {
  if (!unit || typeof unit !== 'string') return 'c';
  const clean = unit.trim().toLowerCase().replace(/°/g, '');
  if (['c', 'celsius', 'centigrade'].includes(clean)) return 'c';
  if (['f', 'fahrenheit'].includes(clean)) return 'f';
  if (['k', 'kelvin'].includes(clean)) return 'k';
  throw new Error(`Invalid temperature unit: "${unit}". Use 'c', 'f', or 'k'.`);
}

/**
 * Converts a temperature value to Celsius, Fahrenheit, and Kelvin simultaneously.
 *
 * @param {Object} params
 * @param {number|string} params.value - Numeric temperature value
 * @param {string} [params.fromUnit='c'] - Source unit ('c', 'f', 'k')
 * @returns {{
 *   input: number,
 *   fromUnit: 'c'|'f'|'k',
 *   celsius: number,
 *   fahrenheit: number,
 *   kelvin: number,
 *   formattedCelsius: string,
 *   formattedFahrenheit: string,
 *   formattedKelvin: string,
 *   summary: string
 * }}
 */
export function convertTemperature({ value, fromUnit = 'c' }) {
  const numVal = Number(value);
  if (value === undefined || value === null || isNaN(numVal)) {
    throw new Error('A valid numeric temperature value is required.');
  }

  const unit = normalizeTempUnit(fromUnit);

  let c = 0;
  if (unit === 'c') {
    c = numVal;
  } else if (unit === 'f') {
    c = (numVal - 32) * (5 / 9);
  } else if (unit === 'k') {
    c = numVal - 273.15;
  }

  // Physical constraint: cannot be below absolute zero
  if (c < ABSOLUTE_ZERO_CELSIUS - 0.0001) {
    throw new Error(`Temperature cannot be below absolute zero (0 K, ${ABSOLUTE_ZERO_CELSIUS} °C, ${ABSOLUTE_ZERO_FAHRENHEIT} °F).`);
  }

  const f = (c * (9 / 5)) + 32;
  const k = c + 273.15;

  const round = (n) => {
    const r = Math.round(n * 100) / 100;
    return Number.isInteger(r) ? r : Number(r.toFixed(2));
  };

  const cRounded = round(c);
  const fRounded = round(f);
  const kRounded = round(k);

  const formattedCelsius = `${cRounded} °C`;
  const formattedFahrenheit = `${fRounded} °F`;
  const formattedKelvin = `${kRounded} K`;

  const summary = `${cRounded} °C | ${fRounded} °F | ${kRounded} K`;

  return {
    input: numVal,
    fromUnit: unit,
    celsius: cRounded,
    fahrenheit: fRounded,
    kelvin: kRounded,
    formattedCelsius,
    formattedFahrenheit,
    formattedKelvin,
    summary
  };
}
