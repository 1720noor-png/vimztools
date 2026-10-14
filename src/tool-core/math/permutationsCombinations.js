/**
 * Pure Permutations (nPr) and Combinations (nCr) Engine
 * Uses BigInt for accurate exact calculation of factorials.
 * Strictly decoupled from React and UI.
 *
 * @param {Object} params
 * @param {number|string} params.n - Total items in set (n ≥ 0)
 * @param {number|string} params.r - Number of items to choose (0 ≤ r ≤ n)
 * @returns {Object} Permutations (nPr) and Combinations (nCr)
 */
export function calculatePermutationsCombinations({ n, r } = {}) {
  const ni = parseInt(n, 10)
  const ri = parseInt(r, 10)

  if (isNaN(ni) || isNaN(ri)) {
    throw new Error('Both n and r must be valid integers.')
  }
  if (ni < 0 || ri < 0) {
    throw new Error('n and r must be non-negative integers.')
  }
  if (ri > ni) {
    throw new Error('Number of items chosen (r) cannot exceed total items (n).')
  }

  const fact = (num) => {
    let res = 1n
    for (let i = 2n; i <= BigInt(num); i++) {
      res *= i
    }
    return res
  }

  const nBig = BigInt(ni)
  const rBig = BigInt(ri)
  const diffBig = nBig - rBig

  // Factorial calculations
  const nFact = fact(ni)
  const rFact = fact(ri)
  const diffFact = fact(Number(diffBig))

  const nPrBig = nFact / diffFact
  const nCrBig = nFact / (rFact * diffFact)

  const nPrNum = Number(nPrBig)
  const nCrNum = Number(nCrBig)

  const nPrStr = nPrBig.toString()
  const nCrStr = nCrBig.toString()

  return {
    n: ni,
    r: ri,
    nPr: nPrNum,
    nCr: nCrNum,
    perm: nPrNum,
    comb: nCrNum,
    nPrBig,
    nCrBig,
    nPrFormatted: nPrBig.toLocaleString(),
    nCrFormatted: nCrBig.toLocaleString(),
    val: `Combinations nCr (Order doesn't matter): ${nCrBig.toLocaleString()} | Permutations nPr (Order matters): ${nPrBig.toLocaleString()}`,
    copyText: `nCr: ${nCrStr}, nPr: ${nPrStr}`,
    summary: `P(${ni}, ${ri}) = ${nPrStr}, C(${ni}, ${ri}) = ${nCrStr}`
  }
}
