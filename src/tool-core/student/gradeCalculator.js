export const GRADE_SCALE = [
  [90, 'A'],
  [80, 'B'],
  [70, 'C'],
  [60, 'D'],
  [0, 'F']
]

/**
 * Grade Calculator Engine
 * Calculates total marks, aggregate percentage, and letter grade from assessments.
 *
 * @param {Object} params
 * @param {Array<{name?: string, marks: number|string, total: number|string}>} params.assessments - List of assessments
 * @param {Array<[number, string]>} [params.scale] - Optional custom grading scale [[minPercent, gradeLetter]]
 * @returns {Object} Calculated grade breakdown
 */
export function calculateGrade({
  assessments = [],
  scale = GRADE_SCALE
}) {
  const validAssessments = assessments.filter(
    (a) => a && (a.marks !== '' || a.total !== '') && (a.marks !== undefined || a.total !== undefined)
  )

  if (!validAssessments.length) {
    throw new Error('Enter marks and total marks for at least one assessment.')
  }

  for (const item of validAssessments) {
    const m = item.marks !== undefined && item.marks !== '' ? Number(item.marks) : NaN
    const t = item.total !== undefined && item.total !== '' ? Number(item.total) : NaN

    if (
      isNaN(m) ||
      isNaN(t) ||
      t <= 0 ||
      m < 0 ||
      m > t
    ) {
      const label = item.name ? item.name : 'assessment'
      throw new Error(`Check “${label}”: total must be above 0 and marks must be between 0 and the total.`)
    }
  }

  const totalMarksObtained = validAssessments.reduce((sum, a) => sum + Number(a.marks), 0)
  const totalMarksPossible = validAssessments.reduce((sum, a) => sum + Number(a.total), 0)
  const percentage = (totalMarksObtained / totalMarksPossible) * 100

  const matchedGrade = scale.find(([min]) => percentage >= min)
  const letterGrade = matchedGrade ? matchedGrade[1] : 'F'

  return {
    assessments: validAssessments,
    totalMarksObtained,
    totalMarksPossible,
    percentage: Number(percentage.toFixed(2)),
    formattedPercentage: percentage.toFixed(2),
    grade: letterGrade,
    summary: `${totalMarksObtained} / ${totalMarksPossible} = ${percentage.toFixed(2)}% · Grade ${letterGrade}`
  }
}
