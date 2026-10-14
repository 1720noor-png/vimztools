/**
 * Pure Age & Date Difference Calculation Engine
 * Zero external dependencies. Node.js & Browser compatible.
 */

const ZODIAC_SIGNS = [
  { sign: 'Capricorn', fromMonth: 12, fromDay: 22, toMonth: 1, toDay: 19 },
  { sign: 'Aquarius', fromMonth: 1, fromDay: 20, toMonth: 2, toDay: 18 },
  { sign: 'Pisces', fromMonth: 2, fromDay: 19, toMonth: 3, toDay: 20 },
  { sign: 'Aries', fromMonth: 3, fromDay: 21, toMonth: 4, toDay: 19 },
  { sign: 'Taurus', fromMonth: 4, fromDay: 20, toMonth: 5, toDay: 20 },
  { sign: 'Gemini', fromMonth: 5, fromDay: 21, toMonth: 6, toDay: 20 },
  { sign: 'Cancer', fromMonth: 6, fromDay: 21, toMonth: 7, toDay: 22 },
  { sign: 'Leo', fromMonth: 7, fromDay: 23, toMonth: 8, toDay: 22 },
  { sign: 'Virgo', fromMonth: 8, fromDay: 23, toMonth: 9, toDay: 22 },
  { sign: 'Libra', fromMonth: 9, fromDay: 23, toMonth: 10, toDay: 22 },
  { sign: 'Scorpio', fromMonth: 10, fromDay: 23, toMonth: 11, toDay: 21 },
  { sign: 'Sagittarius', fromMonth: 11, fromDay: 22, toMonth: 12, toDay: 21 }
];

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Gets Zodiac sign from month (1-12) and day (1-31)
 */
export function getZodiacSign(month, day) {
  for (const z of ZODIAC_SIGNS) {
    if (
      (month === z.fromMonth && day >= z.fromDay) ||
      (month === z.toMonth && day <= z.toDay)
    ) {
      return z.sign;
    }
  }
  return 'Capricorn';
}

/**
 * Parses input string into Date object
 * @param {string|Date} dateInput
 * @returns {Date}
 */
export function parseDate(dateInput) {
  if (dateInput instanceof Date && !isNaN(dateInput)) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }

  if (typeof dateInput === 'string') {
    const parts = dateInput.trim().split(/[-/]/);
    if (parts.length === 3) {
      let year, month, day;
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = Number(parts[0]);
        month = Number(parts[1]) - 1;
        day = Number(parts[2]);
      } else {
        // DD-MM-YYYY or MM-DD-YYYY
        day = Number(parts[0]);
        month = Number(parts[1]) - 1;
        year = Number(parts[2]);
      }
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }

    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
  }

  throw new Error(`Invalid date format: "${dateInput}". Please use YYYY-MM-DD.`);
}

/**
 * Calculates exact age in years, months, and days plus lifetime milestones.
 *
 * @param {Object} params
 * @param {string|Date} params.birthDate - Date of birth
 * @param {string|Date} [params.targetDate] - Target calculation date (defaults to current date)
 * @returns {{
 *   years: number,
 *   months: number,
 *   days: number,
 *   totalDays: number,
 *   totalWeeks: number,
 *   totalHours: number,
 *   nextBirthday: {
 *     date: string,
 *     daysUntil: number,
 *     dayOfWeek: string
 *   },
 *   zodiac: string,
 *   summary: string
 * }}
 */
export function calculateAge({ birthDate, targetDate }) {
  if (!birthDate) {
    throw new Error('Birth date is required.');
  }

  const birth = parseDate(birthDate);
  const target = targetDate ? parseDate(targetDate) : new Date();
  target.setHours(0, 0, 0, 0);

  if (birth > target) {
    throw new Error('Birth date cannot be in the future relative to the target date.');
  }

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // Days in previous month
    const prevMonthDays = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Total elapsed time metrics
  const diffMs = target.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  // Next birthday calculation
  const currentYear = target.getFullYear();
  let nextBday = new Date(currentYear, birth.getMonth(), birth.getDate());
  if (nextBday < target) {
    nextBday = new Date(currentYear + 1, birth.getMonth(), birth.getDate());
  }

  const nextDiffMs = nextBday.getTime() - target.getTime();
  const daysUntilNext = Math.ceil(nextDiffMs / (1000 * 60 * 60 * 24));
  const nextDayOfWeek = DAYS_OF_WEEK[nextBday.getDay()];

  const pad = (n) => String(n).padStart(2, '0');
  const nextBdayStr = `${nextBday.getFullYear()}-${pad(nextBday.getMonth() + 1)}-${pad(nextBday.getDate())}`;

  const zodiac = getZodiacSign(birth.getMonth() + 1, birth.getDate());

  const summary = `${years} Years, ${months} Months, ${days} Days old (${totalDays.toLocaleString()} total days lived)`;

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalHours,
    nextBirthday: {
      date: nextBdayStr,
      daysUntil: daysUntilNext,
      dayOfWeek: nextDayOfWeek
    },
    zodiac,
    summary
  };
}

/**
 * Calculates absolute date difference between two dates.
 */
export function calculateDateDifference({ startDate, endDate }) {
  if (!startDate || !endDate) {
    throw new Error('Both start date and end date are required.');
  }

  const d1 = parseDate(startDate);
  const d2 = parseDate(endDate);

  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;

  return {
    days,
    weeks,
    remainingDays,
    summary: `${days} days (${weeks} weeks, ${remainingDays} days)`
  };
}
