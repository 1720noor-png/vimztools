import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Indoor Air Quality & HVAC Filtration'

export const MOD14_SPECS: CivicSpec[] = [
  {
    id: 'hvac-air-filter-merv-static-pressure-sizer',
    name: 'HVAC Air Filter MERV Rating & Static Pressure Loss Sizer',
    subject: SUBJECT,
    blurb: 'Compare particulate filtration efficiency (PM2.5, pollen, pet dander, bacteria) against blower motor external static pressure drop (in. w.g.) across MERV 8, 11, 13, and 16 filters.',
    tip: 'While MERV 13 captures over 85% of fine respiratory droplets and wildfire smoke PM2.5, standard 1-inch filters create high air resistance that can reduce HVAC airflow by 15-20% if not upgraded to a 4-inch deep media cabinet.',
    usage: [
      'Select filter MERV rating (MERV 8, 11, 13, or 16).',
      'Select filter thickness (1-inch standard vs 4-inch deep pleated media).',
      'Enter total system airflow CFM (typically 400 CFM per cooling ton).',
    ],
    method: [
      'Clean Static Pressure Drop Delta_P (in. w.g.) scales with air velocity and media density.',
      '1" MERV 13: ~0.32 in. w.g. | 4" MERV 13: ~0.14 in. w.g. (56% lower resistance due to 4x surface area).',
      'PM2.5 Capture Efficiency: MERV 8 (20%), MERV 11 (65%), MERV 13 (85%), MERV 16 (95%).',
    ],
    fields: [
      sel('mervRating', 'Filter MERV Efficiency Rating', [
        'MERV 13 (Hospital / Wildfire Smoke / PM2.5 - 85% capture)',
        'MERV 11 (Pet Dander & Mold Spores - 65% capture)',
        'MERV 8 (Basic Dust & Pollen - 20% PM2.5 capture)',
        'MERV 16 (Near-HEPA Surgical Grade - 95% capture)',
      ]),
      sel('filterThickness', 'Filter Pleat Depth / Thickness', [
        '1-Inch Standard Grille Filter (High air resistance)',
        '4-Inch Deep Pleated Media Filter (High surface area / Low drop)',
        '2-Inch Commercial Pleated Filter',
      ]),
      n('systemAirflowCfm', 'Total System Airflow (CFM)', 1400, 400, 3000, 100),
    ],
    compute: (v) => {
      const merv = asSel(v, 'mervRating', 'MERV 13')
      const thick = asSel(v, 'filterThickness', '1-Inch')
      const cfm = asNum(v, 'systemAirflowCfm', 1400)

      let pm25Eff = 85
      let basePressureDrop = 0.28
      if (merv.includes('MERV 8')) { pm25Eff = 20; basePressureDrop = 0.15 }
      else if (merv.includes('MERV 11')) { pm25Eff = 65; basePressureDrop = 0.22 }
      else if (merv.includes('MERV 16')) { pm25Eff = 95; basePressureDrop = 0.42 }

      // 4-inch filters have ~3.5x to 4x the pleated surface area, lowering pressure drop dramatically
      let depthMultiplier = 1.0
      if (thick.includes('4-Inch')) depthMultiplier = 0.44
      else if (thick.includes('2-Inch')) depthMultiplier = 0.72

      // Velocity scaling factor relative to nominal 1200 CFM
      const cfmFactor = Math.pow(cfm / 1200.0, 1.4)
      const cleanDrop = basePressureDrop * depthMultiplier * cfmFactor

      const maxSafeBlowerDrop = 0.50 // Residential standard external static limit
      const isHighDrop = cleanDrop > 0.35
      const tone: 'good' | 'warn' | 'bad' | 'neutral' = isHighDrop ? 'warn' : 'good'

      return [
        res('Clean Filter Pressure Drop', `${cleanDrop.toFixed(3)} in. w.g.`, tone, isHighDrop ? 'High resistance: Risk of reduced HVAC airflow' : `Well below ${maxSafeBlowerDrop} in. w.g. blower limit`),
        res('PM2.5 Wildfire & Smoke Capture', `${pm25Eff}% Particulate Filtration`, 'good', 'Traps sub-micron combustion particles (0.3 - 1.0 micron)'),
        res('Recommended Replacement Interval', thick.includes('4-Inch') ? '6 to 9 Months' : '60 to 90 Days', 'neutral', 'Based on seasonal dust loading cycles'),
        pctres('Indoor Air Quality Protection', `${pm25Eff}% Clean Air Delivery`, pm25Eff, 'good', merv.split(' ')[0]),
      ]
    },
  },
]
