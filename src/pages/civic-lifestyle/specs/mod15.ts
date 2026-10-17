import {
  asNum,
  fmtNum,
  n,
  pctres,
  res,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Artisan Baking & Baker’s Percentages'

export const MOD15_SPECS: CivicSpec[] = [
  {
    id: 'sourdough-bakers-hydration-percentage-sizer',
    name: 'Sourdough Bread Baker’s Hydration & Recipe Sizer',
    subject: SUBJECT,
    blurb: 'Scale artisanal bread dough recipes using true baker’s percentages, factoring in levain / sourdough starter hydration (100%), total flour weight, and salt salinity.',
    tip: 'In baker’s math, total flour is always defined as exactly 100.0%. Beginner sourdough bakers should target 68-72% hydration, while open-crumb European baguettes and ciabattas range from 78% to 85%.',
    usage: [
      'Enter total flour weight in grams (or target loaf weight).',
      'Select target dough hydration percentage (typically 70% to 80%).',
      'Enter levain/starter percentage (typically 20%) and salt percentage (typically 2.0%).',
    ],
    method: [
      'Total Flour = 100%.',
      'Starter Flour = Levain_Weight / 2 (assuming 100% hydration starter).',
      'Starter Water = Levain_Weight / 2.',
      'True Total Hydration = (Added_Water + Starter_Water) / (Main_Flour + Starter_Flour) * 100.',
    ],
    fields: [
      n('totalFlourGrams', 'Main Flour Weight (Grams)', 900, 100, 10000, 50),
      n('targetHydrationPct', 'Target Overall Hydration (%)', 75.0, 50.0, 95.0, 0.5),
      n('levainPct', 'Active Sourdough Levain (%)', 20.0, 5.0, 40.0, 1.0),
      n('saltPct', 'Fine Sea Salt (%)', 2.1, 1.0, 3.5, 0.1),
    ],
    compute: (v) => {
      const flour = asNum(v, 'totalFlourGrams', 900)
      const targetHydr = asNum(v, 'targetHydrationPct', 75.0) / 100
      const levainRate = asNum(v, 'levainPct', 20.0) / 100
      const saltRate = asNum(v, 'saltPct', 2.1) / 100

      const levainGrams = flour * levainRate
      const starterFlour = levainGrams / 2.0
      const starterWater = levainGrams / 2.0

      const allFlour = flour + starterFlour
      const totalWaterNeeded = allFlour * targetHydr
      const waterToAddGrams = Math.max(0, totalWaterNeeded - starterWater)

      const saltGrams = flour * saltRate
      const totalBatchWeight = flour + waterToAddGrams + levainGrams + saltGrams
      const standardLoavesCount = totalBatchWeight / 850 // Standard 850g raw boule

      return [
        res('Water to Add (Grams)', `${fmtNum(Math.round(waterToAddGrams))} g Water`, 'good', `Room temperature / filtered water (${(targetHydr * 100).toFixed(1)}% true hydration)`),
        res('Active Levain (Starter)', `${fmtNum(Math.round(levainGrams))} g Levain`, 'neutral', `100% hydration sourdough starter (${(levainRate * 100).toFixed(0)}%)`),
        res('Fine Sea Salt', `${saltGrams.toFixed(1)} g Salt`, 'neutral', `${(saltRate * 100).toFixed(1)}% baker's salt ratio`),
        res('Total Batch Raw Dough Weight', `${fmtNum(Math.round(totalBatchWeight))} g (${standardLoavesCount.toFixed(1)} Loaves)`, 'good', 'Yields ~850g standard artisan boules'),
        pctres('Dough Hydration Level', `${(targetHydr * 100).toFixed(0)}% Overall Hydration`, Math.round(targetHydr * 100), targetHydr >= 0.78 ? 'warn' : 'good', targetHydr >= 0.78 ? 'Wet / High-hydration dough (requires coil folds)' : 'Moderate hydration (easy to shape)'),
      ]
    },
  },
]
