import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Coffee Science & Extraction Yield'

export const MOD16_SPECS: CivicSpec[] = [
  {
    id: 'specialty-coffee-brew-ratio-tds-sizer',
    name: 'Specialty Coffee Brew Ratio & Extraction Yield Sizer',
    subject: SUBJECT,
    blurb: 'Calculate water-to-coffee brew ratios (1:15 to 1:18), Total Dissolved Solids (TDS %), and beverage extraction yield % based on Specialty Coffee Association (SCA) Golden Cup standards.',
    tip: 'The SCA Golden Cup standard defines ideal coffee extraction between 18.0% and 22.0% extraction yield with a beverage strength between 1.15% and 1.45% TDS.',
    usage: [
      'Enter ground coffee dry dose in grams.',
      'Select brewing method (Pour-Over V60, French Press, Aeropress, Chemex).',
      'Select target water brew ratio (e.g. 1:16 standard).',
    ],
    method: [
      'Total Water Weight (g) = Coffee_Dose_g * Brew_Ratio.',
      'Retained Spent Grounds Water = Coffee_Dose_g * 2.1 (absorption factor).',
      'Beverage Liquid Yield = Total_Water - Retained_Water.',
      'Extraction Yield % = (Beverage_Weight * TDS %) / Coffee_Dose_g.',
    ],
    fields: [
      n('coffeeDoseGrams', 'Ground Coffee Dry Dose (Grams)', 20.0, 5.0, 150.0, 0.5),
      sel('brewRatio', 'Brewing Ratio (Coffee to Water)', [
        '1:16.0 (Golden Cup Standard / Balanced)',
        '1:15.0 (Strong / High Body)',
        '1:17.0 (Bright / Delicate Single Origin)',
        '1:18.0 (Light / Tea-like Body)',
      ]),
      n('beverageTdsPct', 'Measured / Target Beverage TDS (%)', 1.30, 0.80, 2.50, 0.05),
    ],
    compute: (v) => {
      const dose = asNum(v, 'coffeeDoseGrams', 20.0)
      const ratioStr = asSel(v, 'brewRatio', '1:16')
      const tds = asNum(v, 'beverageTdsPct', 1.30) / 100

      let ratioNum = 16.0
      if (ratioStr.includes('1:15')) ratioNum = 15.0
      else if (ratioStr.includes('1:17')) ratioNum = 17.0
      else if (ratioStr.includes('1:18')) ratioNum = 18.0

      const totalWaterGrams = dose * ratioNum
      const retainedWaterGrams = dose * 2.1 // Coffee grounds retain ~2.1x their weight in water
      const beverageYieldGrams = Math.max(1, totalWaterGrams - retainedWaterGrams)

      const solublesDissolvedGrams = beverageYieldGrams * tds
      const extractionYieldPct = (solublesDissolvedGrams / dose) * 100

      const isExtractionIdeal = extractionYieldPct >= 18.0 && extractionYieldPct <= 22.0
      const tone: 'good' | 'warn' | 'bad' | 'neutral' = isExtractionIdeal ? 'good' : extractionYieldPct < 17.0 ? 'warn' : 'bad'

      return [
        res('Brew Water Required', `${totalWaterGrams.toFixed(0)} g (ml) Water`, 'good', `@ 1:${ratioNum.toFixed(1)} ratio with ${dose}g coffee`),
        res('Finished Beverage Volume', `${beverageYieldGrams.toFixed(0)} g (${(beverageYieldGrams / 29.57).toFixed(1)} fl oz)`, 'neutral', `After ~${retainedWaterGrams.toFixed(0)}g grounds absorption`),
        res('Extraction Yield', `${extractionYieldPct.toFixed(1)}% Extracted`, tone, isExtractionIdeal ? 'SCA Golden Cup Standard (18-22%)' : extractionYieldPct < 18 ? 'Under-extracted (Sour/Grassy): Grind finer' : 'Over-extracted (Bitter/Astringent): Grind coarser'),
        pctres('Extraction Balance Index', `${Math.round((extractionYieldPct / 22.0) * 100)}% Extraction Scale`, Math.min(100, Math.round((extractionYieldPct / 22.0) * 100)), tone),
      ]
    },
  },
]
