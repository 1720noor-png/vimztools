export const GRADE_POINTS = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D': 1.0,
  'F': 0.0
}

/**
 * GPA & CGPA Calculator Engine (4.0 Scale)
 * Computes semester GPA and cumulative CGPA based on letter grades and credit hours.
 *
 * @param {Object} params
 * @param {Array<{grade: string, credits: number|string, name?: string}>} params.courses - List of courses
 * @param {number|string} [params.previousCgpa] - Previous cumulative GPA (0 - 4.0)
 * @param {number|string} [params.previousCredits] - Previous total credit hours
 * @returns {Object} Comprehensive GPA breakdown
 */
export function calculateGpa({
  courses = [],
  previousCgpa,
  previousCredits
}) {
  const validCourses = courses.filter((c) => c && c.credits !== '' && c.credits !== undefined)

  if (!validCourses.length) {
    throw new Error('Enter credit hours greater than 0 for every course you list.')
  }

  for (const c of validCourses) {
    const cr = Number(c.credits)
    if (isNaN(cr) || cr <= 0) {
      throw new Error('Enter credit hours greater than 0 for every course you list.')
    }
    const grade = (c.grade || 'A').toUpperCase()
    if (GRADE_POINTS[grade] === undefined) {
      throw new Error(`Invalid letter grade: "${c.grade}". Allowed grades are A, A-, B+, B, B-, C+, C, C-, D, F.`)
    }
  }

  const semesterCredits = validCourses.reduce((sum, c) => sum + Number(c.credits), 0)
  const semesterPoints = validCourses.reduce((sum, c) => sum + GRADE_POINTS[c.grade.toUpperCase()] * Number(c.credits), 0)
  const gpa = semesterPoints / semesterCredits

  let cgpa = null
  const hasPrevG = previousCgpa !== undefined && previousCgpa !== ''
  const hasPrevC = previousCredits !== undefined && previousCredits !== ''

  if (hasPrevG || hasPrevC) {
    const pg = Number(previousCgpa)
    const pc = Number(previousCredits)
    if (!hasPrevG || !hasPrevC || isNaN(pg) || isNaN(pc) || pg < 0 || pg > 4 || pc <= 0) {
      throw new Error('For CGPA enter both a previous CGPA (0–4) and previous credit hours above 0, or leave both empty.')
    }
    cgpa = Number(((pg * pc + semesterPoints) / (pc + semesterCredits)).toFixed(2))
  }

  return {
    courses: validCourses,
    semesterCredits,
    semesterPoints,
    gpa: Number(gpa.toFixed(2)),
    formattedGpa: gpa.toFixed(2),
    cgpa,
    formattedCgpa: cgpa !== null ? cgpa.toFixed(2) : null,
    summary: `GPA: ${gpa.toFixed(2)} from ${semesterCredits} credit hours${cgpa !== null ? ` | Cumulative CGPA: ${cgpa.toFixed(2)}` : ''}`
  }
}
