/**
 * Attendance Calculator Engine
 * Calculates current attendance percentage and either:
 * - Number of upcoming classes you can miss while maintaining target attendance
 * - Number of consecutive upcoming classes you must attend to achieve target attendance
 *
 * @param {Object} params
 * @param {number|string} params.attended - Total classes attended (whole number >= 0)
 * @param {number|string} params.total - Total classes held (whole number > 0)
 * @param {number|string} [params.target=75] - Target attendance percentage (0 < target <= 100)
 * @returns {Object} Comprehensive attendance status and recommendation
 */
export function calculateAttendance({
  attended,
  total,
  target = 75
}) {
  if (
    attended === undefined ||
    attended === '' ||
    total === undefined ||
    total === ''
  ) {
    throw new Error('Enter whole numbers: classes attended (0 or more) and total classes (above 0).')
  }

  const att = Number(attended)
  const tot = Number(total)

  if (!Number.isInteger(att) || !Number.isInteger(tot) || att < 0 || tot <= 0) {
    throw new Error('Enter whole numbers: classes attended (0 or more) and total classes (above 0).')
  }

  if (att > tot) {
    throw new Error('Classes attended cannot be more than total classes.')
  }

  const tg = target !== undefined && target !== '' ? Number(target) : 75
  if (isNaN(tg) || !(tg > 0 && tg <= 100)) {
    throw new Error('Target must be above 0 and at most 100.')
  }

  const pct = (att / tot) * 100
  let canMiss = null
  let mustAttend = null
  let canReachTarget = true

  let msg = `Current attendance: ${pct.toFixed(2)}%. `
  if (pct >= tg) {
    canMiss = Math.floor((att * 100) / tg - tot + 1e-9)
    msg += `You can miss ${canMiss} more class(es) and stay at or above ${tg}%.`
  } else if (tg === 100) {
    canReachTarget = false
    msg += 'You cannot reach 100% because past absences cannot be undone.'
  } else {
    mustAttend = Math.ceil((tg * tot - 100 * att) / (100 - tg) - 1e-9)
    msg += `Attend the next ${mustAttend} class(es) in a row to reach ${tg}%.`
  }

  return {
    attended: att,
    total: tot,
    target: tg,
    percentage: Number(pct.toFixed(2)),
    formattedPercentage: pct.toFixed(2),
    canMiss,
    mustAttend,
    canReachTarget,
    message: msg
  }
}
