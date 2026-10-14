/**
 * Pure Universal Unit Converter Engine
 * Zero external dependencies. Node.js & Browser compatible.
 */

export const UNIT_CATEGORIES = {
  length: {
    name: 'Length',
    base: 'm',
    units: {
      m: { name: 'Meters (m)', factor: 1, aliases: ['meter', 'meters', 'metre', 'metres', 'm'] },
      km: { name: 'Kilometers (km)', factor: 1000, aliases: ['kilometer', 'kilometers', 'kilometre', 'kilometres', 'km'] },
      cm: { name: 'Centimeters (cm)', factor: 0.01, aliases: ['centimeter', 'centimeters', 'centimetre', 'centimetres', 'cm'] },
      mm: { name: 'Millimeters (mm)', factor: 0.001, aliases: ['millimeter', 'millimeters', 'millimetre', 'millimetres', 'mm'] },
      mi: { name: 'Miles (mi)', factor: 1609.344, aliases: ['mile', 'miles', 'mi'] },
      yd: { name: 'Yards (yd)', factor: 0.9144, aliases: ['yard', 'yards', 'yd'] },
      ft: { name: 'Feet (ft)', factor: 0.3048, aliases: ['foot', 'feet', 'ft'] },
      in: { name: 'Inches (in)', factor: 0.0254, aliases: ['inch', 'inches', 'in'] },
      nm: { name: 'Nanometers (nm)', factor: 1e-9, aliases: ['nanometer', 'nanometers', 'nm'] },
      um: { name: 'Micrometers (µm)', factor: 1e-6, aliases: ['micrometer', 'micrometers', 'micron', 'um'] }
    }
  },
  mass: {
    name: 'Mass & Weight',
    base: 'kg',
    units: {
      kg: { name: 'Kilograms (kg)', factor: 1, aliases: ['kilogram', 'kilograms', 'kilo', 'kilos', 'kg'] },
      g: { name: 'Grams (g)', factor: 0.001, aliases: ['gram', 'grams', 'g', 'gm'] },
      mg: { name: 'Milligrams (mg)', factor: 0.000001, aliases: ['milligram', 'milligrams', 'mg'] },
      lb: { name: 'Pounds (lb)', factor: 0.45359237, aliases: ['pound', 'pounds', 'lb', 'lbs'] },
      oz: { name: 'Ounces (oz)', factor: 0.028349523125, aliases: ['ounce', 'ounces', 'oz'] },
      ton: { name: 'Metric Tons (t)', factor: 1000, aliases: ['ton', 'tons', 'tonne', 'tonnes', 't'] },
      stone: { name: 'Stone (st)', factor: 6.35029318, aliases: ['stone', 'st'] }
    }
  },
  speed: {
    name: 'Speed',
    base: 'kmh',
    units: {
      kmh: { name: 'Kilometers per hour (km/h)', factor: 1, aliases: ['kmh', 'km/h', 'kph'] },
      mph: { name: 'Miles per hour (mph)', factor: 1.609344, aliases: ['mph', 'miles per hour', 'mi/h'] },
      ms: { name: 'Meters per second (m/s)', factor: 3.6, aliases: ['m/s', 'ms', 'mps', 'meters per second'] },
      knot: { name: 'Knots (kts)', factor: 1.852, aliases: ['knot', 'knots', 'kt', 'kts'] },
      fts: { name: 'Feet per second (ft/s)', factor: 1.09728, aliases: ['ft/s', 'fps', 'feet per second'] }
    }
  },
  area: {
    name: 'Area',
    base: 'sqm',
    units: {
      sqm: { name: 'Square Meters (m²)', factor: 1, aliases: ['sqm', 'm2', 'm²', 'square meter', 'square meters'] },
      sqkm: { name: 'Square Kilometers (km²)', factor: 1000000, aliases: ['sqkm', 'km2', 'km²', 'square kilometer', 'square kilometers'] },
      sqft: { name: 'Square Feet (ft²)', factor: 0.09290304, aliases: ['sqft', 'ft2', 'ft²', 'square feet', 'square foot'] },
      sqyd: { name: 'Square Yards (yd²)', factor: 0.83612736, aliases: ['sqyd', 'yd2', 'yd²', 'square yard', 'square yards'] },
      acre: { name: 'Acres', factor: 4046.8564224, aliases: ['acre', 'acres'] },
      ha: { name: 'Hectares (ha)', factor: 10000, aliases: ['hectare', 'hectares', 'ha'] }
    }
  },
  volume: {
    name: 'Volume',
    base: 'l',
    units: {
      l: { name: 'Liters (L)', factor: 1, aliases: ['liter', 'liters', 'litre', 'litres', 'l'] },
      ml: { name: 'Milliliters (mL)', factor: 0.001, aliases: ['milliliter', 'milliliters', 'ml'] },
      m3: { name: 'Cubic Meters (m³)', factor: 1000, aliases: ['m3', 'm³', 'cubic meter', 'cubic meters'] },
      gal: { name: 'US Gallons (gal)', factor: 3.785411784, aliases: ['gal', 'gallon', 'gallons', 'us gal'] },
      cup: { name: 'US Cups (cup)', factor: 0.2365882365, aliases: ['cup', 'cups'] },
      floz: { name: 'Fluid Ounces (fl oz)', factor: 0.0295735295625, aliases: ['fl oz', 'floz', 'fluid ounce', 'fluid ounces'] }
    }
  }
};

/**
 * Normalizes a unit string or alias to standard unit key and category
 * @param {string} unitStr
 * @param {string} [hintCategory]
 * @returns {{ category: string, unitKey: string, unitObj: Object } | null}
 */
export function resolveUnit(unitStr, hintCategory = null) {
  if (!unitStr || typeof unitStr !== 'string') return null;
  const clean = unitStr.trim().toLowerCase();

  const searchCats = hintCategory && UNIT_CATEGORIES[hintCategory]
    ? [hintCategory]
    : Object.keys(UNIT_CATEGORIES);

  for (const catKey of searchCats) {
    const cat = UNIT_CATEGORIES[catKey];
    for (const [uKey, uObj] of Object.entries(cat.units)) {
      if (uKey.toLowerCase() === clean) {
        return { category: catKey, unitKey: uKey, unitObj: uObj };
      }
      if (uObj.aliases && uObj.aliases.some((a) => a.toLowerCase() === clean)) {
        return { category: catKey, unitKey: uKey, unitObj: uObj };
      }
    }
  }

  return null;
}

/**
 * Converts a numeric value from one measurement unit to another.
 * 
 * @param {Object} params
 * @param {number|string} params.value - Numeric quantity to convert
 * @param {string} params.fromUnit - Source unit code or alias (e.g. 'km', 'miles', 'kg', 'lb')
 * @param {string} params.toUnit - Target unit code or alias
 * @param {string} [params.category] - Optional category override ('length', 'mass', 'speed', 'area', 'volume')
 * @returns {{
 *   value: number,
 *   fromUnit: string,
 *   toUnit: string,
 *   fromUnitName: string,
 *   toUnitName: string,
 *   category: string,
 *   result: number,
 *   resultFormatted: string,
 *   formula: string,
 *   summary: string
 * }}
 */
export function convertUnit({ value, fromUnit, toUnit, category }) {
  const numVal = Number(value);
  if (value === undefined || value === null || isNaN(numVal)) {
    throw new Error('A valid numeric value is required.');
  }

  if (!fromUnit || !toUnit) {
    throw new Error('Both source unit (fromUnit) and target unit (toUnit) are required.');
  }

  // Resolve source unit
  const sourceResolved = resolveUnit(fromUnit, category);
  if (!sourceResolved) {
    throw new Error(`Unknown source unit: "${fromUnit}".`);
  }

  // Resolve target unit (either within provided category or globally)
  const targetResolved = resolveUnit(toUnit, category);
  if (!targetResolved) {
    throw new Error(`Unknown target unit: "${toUnit}".`);
  }

  if (sourceResolved.category !== targetResolved.category) {
    throw new Error(`Cannot convert between incompatible categories: "${sourceResolved.category}" and "${targetResolved.category}".`);
  }

  const determinedCat = sourceResolved.category;
  const fromFactor = sourceResolved.unitObj.factor;
  const toFactor = targetResolved.unitObj.factor;

  // Convert via base unit
  const baseValue = numVal * fromFactor;
  let rawResult = baseValue / toFactor;

  // Clean floating-point precision artifacts (e.g. 1.9999999999999996 -> 2)
  const result = Math.abs(rawResult - Math.round(rawResult)) < 1e-12
    ? Math.round(rawResult)
    : rawResult;

  const resultFormatted = Number.isInteger(result)
    ? result.toString()
    : result.toFixed(6).replace(/\.?0+$/, '');

  const formula = `${numVal} ${sourceResolved.unitObj.name} × (${fromFactor} / ${toFactor}) = ${resultFormatted} ${targetResolved.unitObj.name}`;
  const summary = `${numVal} ${sourceResolved.unitKey} = ${resultFormatted} ${targetResolved.unitKey}`;

  return {
    value: numVal,
    fromUnit: sourceResolved.unitKey,
    toUnit: targetResolved.unitKey,
    fromUnitName: sourceResolved.unitObj.name,
    toUnitName: targetResolved.unitObj.name,
    category: determinedCat,
    result,
    resultFormatted,
    formula,
    summary
  };
}

/**
 * Returns available categories and their units
 */
export function getUnitCategories() {
  return Object.keys(UNIT_CATEGORIES).map((key) => ({
    key,
    name: UNIT_CATEGORIES[key].name,
    base: UNIT_CATEGORIES[key].base,
    units: Object.keys(UNIT_CATEGORIES[key].units).map((uKey) => ({
      key: uKey,
      name: UNIT_CATEGORIES[key].units[uKey].name
    }))
  }));
}
