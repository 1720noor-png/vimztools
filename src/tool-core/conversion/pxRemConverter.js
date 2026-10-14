/**
 * Pure CSS Px to Rem & Em Unit Converter Engine
 * Zero external dependencies. Node.js & Browser compatible.
 */

/**
 * Converts pixel values to CSS REM, EM, PT, and percentage units.
 * 
 * @param {Object} params
 * @param {number|string} params.px - Pixel value to convert
 * @param {number|string} [params.basePx=16] - Base root font size in pixels (default: 16)
 * @returns {{
 *   px: number,
 *   basePx: number,
 *   rem: number,
 *   em: number,
 *   pt: number,
 *   percentage: number,
 *   formattedRem: string,
 *   formattedEm: string,
 *   formattedPt: string,
 *   formattedPercent: string,
 *   cssSnippet: string,
 *   summary: string
 * }}
 */
export function convertPxToUnits({ px, basePx = 16 }) {
  const numPx = Number(px);
  const numBase = basePx !== undefined && basePx !== null ? Number(basePx) : 16;

  if (px === undefined || px === null || isNaN(numPx)) {
    throw new Error('A valid pixel value is required.');
  }

  if (isNaN(numBase) || numBase <= 0) {
    throw new Error('Base root font size must be a positive number greater than 0.');
  }

  const rem = numPx / numBase;
  const em = rem;
  const pt = numPx * 0.75;
  const percentage = rem * 100;

  const round = (num, decimals = 4) => {
    const factor = Math.pow(10, decimals);
    const r = Math.round(num * factor) / factor;
    return Number.isInteger(r) ? r.toString() : r.toFixed(decimals).replace(/\.?0+$/, '');
  };

  const formattedRem = `${round(rem, 4)}rem`;
  const formattedEm = `${round(em, 4)}em`;
  const formattedPt = `${round(pt, 2)}pt`;
  const formattedPercent = `${round(percentage, 2)}%`;

  const cssSnippet = `font-size: ${formattedRem}; /* ${numPx}px at base ${numBase}px */`;
  const summary = `${numPx}px = ${formattedRem} (base: ${numBase}px)`;

  return {
    px: numPx,
    basePx: numBase,
    rem: Math.round(rem * 10000) / 10000,
    em: Math.round(em * 10000) / 10000,
    pt: Math.round(pt * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    formattedRem,
    formattedEm,
    formattedPt,
    formattedPercent,
    cssSnippet,
    summary
  };
}

/**
 * Converts REM value back to pixels based on base root font size.
 *
 * @param {Object} params
 * @param {number|string} params.rem - REM value
 * @param {number|string} [params.basePx=16] - Base root font size in pixels
 * @returns {{
 *   rem: number,
 *   basePx: number,
 *   px: number,
 *   formattedPx: string,
 *   summary: string
 * }}
 */
export function convertRemToPx({ rem, basePx = 16 }) {
  const numRem = Number(rem);
  const numBase = basePx !== undefined && basePx !== null ? Number(basePx) : 16;

  if (rem === undefined || rem === null || isNaN(numRem)) {
    throw new Error('A valid REM value is required.');
  }

  if (isNaN(numBase) || numBase <= 0) {
    throw new Error('Base root font size must be a positive number greater than 0.');
  }

  const px = numRem * numBase;
  const pxRounded = Math.round(px * 100) / 100;
  const formattedPx = `${Number.isInteger(pxRounded) ? pxRounded : pxRounded.toFixed(2)}px`;

  return {
    rem: numRem,
    basePx: numBase,
    px: pxRounded,
    formattedPx,
    summary: `${numRem}rem = ${formattedPx} (base: ${numBase}px)`
  };
}
