/**
 * Pure Quadratic Equation Solver Engine
 * Solves ax² + bx + c = 0 and computes real or complex roots and discriminant.
 * Strictly decoupled from React and UI.
 *
 * @param {Object} params
 * @param {number|string} params.a - Quadratic coefficient (a ≠ 0)
 * @param {number|string} params.b - Linear coefficient
 * @param {number|string} params.c - Constant term
 * @returns {Object} Calculated roots, discriminant, and formatting helpers
 */
export function solveQuadratic({ a, b, c } = {}) {
  const va = parseFloat(a)
  const vb = parseFloat(b)
  const vc = parseFloat(c)

  if (isNaN(va) || isNaN(vb) || isNaN(vc)) {
    throw new Error('All coefficients (a, b, c) must be valid numbers.')
  }
  if (va === 0) {
    throw new Error('Coefficient "a" cannot be zero in a quadratic equation.')
  }

  const discriminant = vb * vb - 4 * va * vc
  const discFormatted = discriminant.toFixed(2)

  if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant)
    const x1 = (-vb + sqrtD) / (2 * va)
    const x2 = (-vb - sqrtD) / (2 * va)
    return {
      type: 'two_real',
      a: va,
      b: vb,
      c: vc,
      discriminant,
      disc: discFormatted,
      x1,
      x2,
      x1Formatted: x1.toFixed(4),
      x2Formatted: x2.toFixed(4),
      val: `x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)} (Discriminant Δ = ${discriminant})`,
      copyText: `x1 = ${x1}, x2 = ${x2}`,
      summary: `x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`
    }
  }

  if (discriminant === 0) {
    const x = -vb / (2 * va)
    return {
      type: 'single_real',
      a: va,
      b: vb,
      c: vc,
      discriminant: 0,
      disc: '0.00',
      x1: x,
      x2: x,
      x1Formatted: x.toFixed(4),
      x2Formatted: x.toFixed(4),
      val: `Single Root x = ${x.toFixed(4)} (Discriminant Δ = 0)`,
      copyText: `x = ${x}`,
      summary: `Single Root x = ${x.toFixed(4)}`
    }
  }

  // Complex roots (discriminant < 0)
  const real = -vb / (2 * va)
  const imag = Math.abs(Math.sqrt(-discriminant) / (2 * va))
  const realFormatted = real.toFixed(4)
  const imagFormatted = imag.toFixed(4)

  return {
    type: 'complex',
    a: va,
    b: vb,
    c: vc,
    discriminant,
    disc: discFormatted,
    realPart: real,
    imagPart: imag,
    realFormatted,
    imagFormatted,
    roots: 'No real roots',
    val: `Complex Roots: x₁ = ${realFormatted} + ${imagFormatted}i, x₂ = ${realFormatted} - ${imagFormatted}i (Δ = ${discriminant})`,
    copyText: `x1 = ${realFormatted} + ${imagFormatted}i, x2 = ${realFormatted} - ${imagFormatted}i`,
    summary: `Complex Roots: ${realFormatted} ± ${imagFormatted}i`
  }
}
