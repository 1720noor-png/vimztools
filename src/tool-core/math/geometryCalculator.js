/**
 * Pure 2D & 3D Geometry Calculator Engine
 * Zero external dependencies. Node.js & Browser compatible.
 */

export const SUPPORTED_SHAPES = ['circle', 'rectangle', 'triangle', 'sphere', 'cylinder', 'prism'];

/**
 * Calculates geometric metrics (area, perimeter, volume, surface area)
 * for 2D shapes and 3D solids.
 *
 * @param {Object} params
 * @param {'circle'|'rectangle'|'triangle'|'sphere'|'cylinder'|'prism'} params.shape - Target geometric shape
 * @param {number|string} [params.a] - Generic dimension 1 (radius for circle/sphere/cylinder, length for rectangle/prism, base for triangle)
 * @param {number|string} [params.b] - Generic dimension 2 (width for rectangle/prism, height for triangle/cylinder)
 * @param {number|string} [params.c] - Generic dimension 3 (height/depth for prism)
 * @param {number|string} [params.radius] - Explicit radius alias
 * @param {number|string} [params.length] - Explicit length alias
 * @param {number|string} [params.width] - Explicit width alias
 * @param {number|string} [params.height] - Explicit height alias
 * @param {number|string} [params.base] - Explicit base alias
 * @returns {{
 *   shape: string,
 *   is3D: boolean,
 *   area: number|null,
 *   perimeter: number|null,
 *   volume: number|null,
 *   surfaceArea: number|null,
 *   formula: string,
 *   summary: string
 * }}
 */
export function calculateGeometry(params = {}) {
  const shape = (params.shape || 'circle').toLowerCase().trim();

  if (!SUPPORTED_SHAPES.includes(shape)) {
    throw new Error(`Unsupported shape: "${shape}". Supported shapes are: ${SUPPORTED_SHAPES.join(', ')}.`);
  }

  // Resilient input resolution
  const valA = Number(params.radius ?? params.length ?? params.base ?? params.a ?? 0);
  const valB = Number(params.width ?? params.height ?? params.b ?? 0);
  const valC = Number(params.c ?? params.height ?? 0);

  if (isNaN(valA) || isNaN(valB) || isNaN(valC)) {
    throw new Error('All shape dimensions must be valid numbers.');
  }

  if (valA < 0 || valB < 0 || valC < 0) {
    throw new Error('Shape dimensions cannot be negative.');
  }

  let area = null;
  let perimeter = null;
  let volume = null;
  let surfaceArea = null;
  let formula = '';
  const is3D = ['sphere', 'cylinder', 'prism'].includes(shape);

  if (shape === 'circle') {
    if (valA === 0) throw new Error('Circle radius must be greater than 0.');
    area = Math.PI * valA * valA;
    perimeter = 2 * Math.PI * valA;
    formula = 'Area = π × r², Circumference = 2 × π × r';
  } else if (shape === 'rectangle') {
    if (valA === 0 || valB === 0) throw new Error('Rectangle length and width must be greater than 0.');
    area = valA * valB;
    perimeter = 2 * (valA + valB);
    formula = 'Area = length × width, Perimeter = 2 × (length + width)';
  } else if (shape === 'triangle') {
    if (valA === 0 || valB === 0) throw new Error('Triangle base and height must be greater than 0.');
    area = 0.5 * valA * valB;
    perimeter = valA + valB + Math.sqrt(valA * valA + valB * valB); // right-triangle hypotenuse
    formula = 'Area = 0.5 × base × height, Perimeter = a + b + √(a² + b²)';
  } else if (shape === 'sphere') {
    if (valA === 0) throw new Error('Sphere radius must be greater than 0.');
    volume = (4 / 3) * Math.PI * Math.pow(valA, 3);
    surfaceArea = 4 * Math.PI * valA * valA;
    formula = 'Volume = (4/3) × π × r³, Surface Area = 4 × π × r²';
  } else if (shape === 'cylinder') {
    if (valA === 0 || valB === 0) throw new Error('Cylinder radius and height must be greater than 0.');
    volume = Math.PI * valA * valA * valB;
    surfaceArea = (2 * Math.PI * valA * valB) + (2 * Math.PI * valA * valA);
    formula = 'Volume = π × r² × h, Surface Area = 2πrh + 2πr²';
  } else if (shape === 'prism') {
    if (valA === 0 || valB === 0 || valC === 0) throw new Error('Rectangular prism length, width, and height must be greater than 0.');
    volume = valA * valB * valC;
    surfaceArea = 2 * ((valA * valB) + (valB * valC) + (valA * valC));
    formula = 'Volume = l × w × h, Surface Area = 2(lw + wh + lh)';
  }

  const round = (num) => {
    if (num === null) return null;
    const r = Math.round(num * 10000) / 10000;
    return Number.isInteger(r) ? r : Number(r.toFixed(4));
  };

  const areaRounded = round(area);
  const perimRounded = round(perimeter);
  const volRounded = round(volume);
  const surfRounded = round(surfaceArea);

  const summary = is3D
    ? `${shape.toUpperCase()}: Volume = ${volRounded} unit³, Surface Area = ${surfRounded} unit²`
    : `${shape.toUpperCase()}: Area = ${areaRounded} unit², Perimeter = ${perimRounded} units`;

  return {
    shape,
    is3D,
    area: areaRounded,
    perimeter: perimRounded,
    volume: volRounded,
    surfaceArea: surfRounded,
    formula,
    summary
  };
}
