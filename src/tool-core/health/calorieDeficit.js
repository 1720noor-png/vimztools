/**
 * Pure Calorie Deficit & Weight Loss Planner Engine
 * Calculates daily caloric deficit needed to achieve target weight goal safely.
 * Strictly decoupled from React and UI.
 *
 * @param {Object} params
 * @param {number|string} params.currentWeight - Current body weight
 * @param {number|string} params.targetWeight - Target goal body weight
 * @param {number|string} params.maintenanceTdee - Daily maintenance calories (TDEE)
 * @param {number|string} params.timelineWeeks - Timeline duration in weeks
 * @param {string} [params.unit='lbs'] - 'lbs' or 'kg'
 * @returns {Object} Target daily caloric intake and weekly loss rate
 */
export function calculateCalorieDeficit({
  currentWeight,
  targetWeight,
  maintenanceTdee,
  timelineWeeks,
  unit = 'lbs'
} = {}) {
  const cw = parseFloat(currentWeight)
  const tw = parseFloat(targetWeight)
  const tdee = parseFloat(maintenanceTdee)
  const weeks = parseFloat(timelineWeeks)

  if (isNaN(cw) || isNaN(tw) || isNaN(tdee) || isNaN(weeks)) {
    throw new Error('All inputs must be valid numeric values.')
  }
  if (cw <= tw) {
    throw new Error('Current weight must be greater than target goal weight for a calorie deficit.')
  }
  if (tdee <= 800) {
    throw new Error('Maintenance calories (TDEE) must be at least 800 kcal.')
  }
  if (weeks <= 0) {
    throw new Error('Timeline weeks must be greater than 0.')
  }

  const weightToLose = cw - tw
  const totalLbsToLose = unit === 'kg' ? weightToLose * 2.20462 : weightToLose

  const totalCalorieDeficitNeeded = totalLbsToLose * 3500
  const totalDays = weeks * 7
  const dailyDeficit = totalCalorieDeficitNeeded / totalDays
  const targetDailyCalories = tdee - dailyDeficit

  const lbsPerWeek = totalLbsToLose / weeks
  const kgPerWeek = lbsPerWeek / 2.20462

  const isAggressive = dailyDeficit > 1000
  const isTooLow = targetDailyCalories < 1200

  return {
    currentWeight: cw,
    targetWeight: tw,
    maintenanceTdee: tdee,
    timelineWeeks: weeks,
    totalWeightToLose: weightToLose,
    totalLbsToLose: parseFloat(totalLbsToLose.toFixed(1)),
    dailyDeficit: Math.round(dailyDeficit),
    targetDailyCalories: Math.round(targetDailyCalories),
    lossRatePerWeekLbs: parseFloat(lbsPerWeek.toFixed(2)),
    lossRatePerWeekKg: parseFloat(kgPerWeek.toFixed(2)),
    isAggressive,
    isTooLow,
    val: `Target Daily Intake: ${Math.round(targetDailyCalories)} kcal/day (${Math.round(dailyDeficit)} kcal deficit/day for ${lbsPerWeek.toFixed(1)} lbs/wk loss)`,
    copyText: `Eat ${Math.round(targetDailyCalories)} kcal/day to lose ${totalLbsToLose.toFixed(1)} lbs in ${weeks} weeks.`,
    summary: `Eat ${Math.round(targetDailyCalories)} kcal/day (${Math.round(dailyDeficit)} kcal deficit) to lose ${weightToLose} ${unit} over ${weeks} weeks (${lbsPerWeek.toFixed(1)} lbs/week).`
  }
}
