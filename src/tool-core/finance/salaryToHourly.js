/**
 * Salary to Hourly Wage Converter
 * Converts annual salary into hourly, daily, weekly, and monthly rates.
 *
 * @param {Object} params
 * @param {number|string} params.salary - Annual salary ($)
 * @param {number|string} [params.hoursWeek=40] - Working hours per week
 * @param {number|string} [params.weeksYear=52] - Working weeks per year
 * @returns {Object} Calculated metrics
 */
export function calculateSalaryToHourly({ salary, hoursWeek = 40, weeksYear = 52 }) {
  const s = typeof salary === 'string' ? parseFloat(salary) : Number(salary)
  const h = hoursWeek !== undefined && hoursWeek !== '' ? Number(hoursWeek) : 40
  const w = weeksYear !== undefined && weeksYear !== '' ? Number(weeksYear) : 52

  if (isNaN(s) || s <= 0) {
    throw new Error('Enter a valid positive annual salary.')
  }
  if (isNaN(h) || h <= 0 || isNaN(w) || w <= 0) {
    throw new Error('Working hours and weeks must be greater than zero.')
  }

  const hourly = s / (h * w)
  const weekly = hourly * h
  const daily = weekly / 5
  const monthly = s / 12

  return {
    salary: s,
    hoursWeek: h,
    weeksYear: w,
    hourly,
    daily,
    weekly,
    monthly,
    hourlyRate: hourly,
    monthlyRate: monthly,
    formattedHourly: hourly.toFixed(2),
    formattedDaily: daily.toFixed(2),
    formattedWeekly: weekly.toFixed(2),
    formattedMonthly: monthly.toFixed(2),
    summary: `Hourly: $${hourly.toFixed(2)} | Daily: $${daily.toFixed(2)} | Weekly: $${weekly.toFixed(2)} | Monthly: $${monthly.toFixed(2)}`
  }
}
