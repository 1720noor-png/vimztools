/**
 * Pure Time Zone Converter Engine
 * Zero external dependencies. Node.js & Browser compatible.
 */

export const COMMON_TIMEZONE_ALIASES = {
  utc: 'UTC',
  gmt: 'UTC',
  pkt: 'Asia/Karachi',
  ist: 'Asia/Kolkata',
  est: 'America/New_York',
  edt: 'America/New_York',
  cst: 'America/Chicago',
  cdt: 'America/Chicago',
  mst: 'America/Denver',
  mdt: 'America/Denver',
  pst: 'America/Los_Angeles',
  pdt: 'America/Los_Angeles',
  bst: 'Europe/London',
  wet: 'Europe/London',
  cet: 'Europe/Paris',
  cest: 'Europe/Paris',
  eet: 'Europe/Athens',
  jst: 'Asia/Tokyo',
  kst: 'Asia/Seoul',
  aest: 'Australia/Sydney',
  aedt: 'Australia/Sydney',
  nzst: 'Pacific/Auckland',
  sgt: 'Asia/Singapore',
  hkt: 'Asia/Hong_Kong',
  dubai: 'Asia/Dubai',
  gst: 'Asia/Dubai'
};

/**
 * Normalizes timezone code or alias to valid IANA timezone string
 * @param {string} tz
 * @returns {string}
 */
export function normalizeTimezone(tz) {
  if (!tz || typeof tz !== 'string') return 'UTC';
  const clean = tz.trim().toLowerCase();
  if (COMMON_TIMEZONE_ALIASES[clean]) {
    return COMMON_TIMEZONE_ALIASES[clean];
  }
  // Try directly using Intl.DateTimeFormat
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    throw new Error(`Unsupported or unrecognized time zone: "${tz}".`);
  }
}

/**
 * Formats a Date object into time and date string within a specific time zone
 */
function formatInZone(date, timeZone, use12h = false) {
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: use12h
  });

  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return {
    time: timeFormatter.format(date),
    date: dateFormatter.format(date)
  };
}

/**
 * Converts a time and date between time zones.
 *
 * @param {Object} params
 * @param {string} [params.time='12:00'] - Time in HH:MM (24-hour format)
 * @param {string} [params.date] - Date in YYYY-MM-DD format (defaults to current date)
 * @param {string} [params.fromZone='UTC'] - Source time zone code or alias (e.g. 'PKT', 'UTC', 'America/New_York')
 * @param {string} [params.toZone='America/New_York'] - Target time zone code or alias
 * @param {boolean} [params.use12h=false] - Whether to format times in 12-hour AM/PM format
 * @returns {{
 *   fromZone: string,
 *   toZone: string,
 *   inputTime: string,
 *   inputDate: string,
 *   convertedTime: string,
 *   convertedDate: string,
 *   dayDifference: number,
 *   dayDiffLabel: string,
 *   summary: string
 * }}
 */
export function convertTimeZone({ time = '12:00', date, fromZone = 'UTC', toZone = 'America/New_York', use12h = false }) {
  const fromTz = normalizeTimezone(fromZone);
  const toTz = normalizeTimezone(toZone);

  let year, month, day;
  if (date && typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    const parts = date.trim().split('-').map(Number);
    year = parts[0];
    month = parts[1] - 1;
    day = parts[2];
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
    day = now.getDate();
  }

  const timeMatch = String(time).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) {
    throw new Error(`Invalid time format: "${time}". Expected HH:MM (e.g. "14:30").`);
  }

  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Hours must be 0-23 and minutes 0-59.');
  }

  // Construct UTC instant using approximate offset computation
  const baseUtc = new Date(Date.UTC(year, month, day, hours, minutes, 0));

  // Determine local offset in source timezone
  const sourceFmt = formatInZone(baseUtc, fromTz);
  const [sYear, sMonth, sDay] = sourceFmt.date.split('-').map(Number);
  const [sHour, sMin] = sourceFmt.time.replace(/[^0-9:]/g, '').split(':').map(Number);

  const sourceDiffMs = Date.UTC(sYear, sMonth - 1, sDay, sHour, sMin) - baseUtc.getTime();
  const instantUtc = new Date(baseUtc.getTime() - sourceDiffMs);

  // Format into target timezone
  const sourceResult = formatInZone(instantUtc, fromTz, use12h);
  const targetResult = formatInZone(instantUtc, toTz, use12h);

  const d1 = new Date(sourceResult.date);
  const d2 = new Date(targetResult.date);
  const dayDiff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

  const dayDiffLabel = dayDiff === 0 ? 'same day' : (dayDiff > 0 ? '+1 day' : '-1 day');

  const summary = `${sourceResult.time} ${fromZone.toUpperCase()} = ${targetResult.time} ${toZone.toUpperCase()} (${dayDiffLabel})`;

  return {
    fromZone: fromTz,
    toZone: toTz,
    inputTime: sourceResult.time,
    inputDate: sourceResult.date,
    convertedTime: targetResult.time,
    convertedDate: targetResult.date,
    dayDifference: dayDiff,
    dayDiffLabel,
    summary
  };
}
