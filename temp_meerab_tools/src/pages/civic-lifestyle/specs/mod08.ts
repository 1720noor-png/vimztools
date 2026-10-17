import {
  asNum,
  asSel,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Home Improvement & Paint Coverage'

export const MOD08_SPECS: CivicSpec[] = [
  {
    id: 'architectural-paint-coverage-gallons-sizer',
    name: 'Interior & Exterior Wall Paint Coverage Gallon Sizer',
    subject: SUBJECT,
    blurb: 'Calculate exact paint volume in gallons, liters, and quarts required for multi-coat architectural painting projects, deducting doors, windows, and account for drywall texture absorption.',
    tip: 'One standard gallon of interior acrylic latex paint covers 350 to 400 square feet on smooth primed walls, but only 250 to 300 square feet on rough textured drywall or unprimed masonry.',
    usage: [
      'Enter room perimeter or total wall length in feet.',
      'Enter ceiling wall height in feet.',
      'Enter count of doors and windows to deduct.',
    ],
    method: [
      'Gross Wall Area = Perimeter * Height.',
      'Deductions = (Doors * 21 sq ft) + (Windows * 15 sq ft).',
      'Net Paintable Sq Ft = Gross_Area - Deductions.',
      'Total Gallons = ceil((Net_Sq_Ft * Coats) / Coverage_Per_Gallon).',
    ],
    fields: [
      n('wallPerimeterFt', 'Total Wall Length / Perimeter (Feet)', 56, 10, 500, 2),
      n('wallHeightFt', 'Ceiling / Wall Height (Feet)', 9.0, 7.0, 20.0, 0.5),
      n('doorsCount', 'Number of Doors to Deduct', 2, 0, 20, 1),
      n('windowsCount', 'Number of Windows to Deduct', 3, 0, 20, 1),
      sel('wallSurfaceTexture', 'Wall Surface & Drywall Texture', [
        'Smooth Primed Drywall (380 sq ft / gallon)',
        'Light Orange Peel Texture (320 sq ft / gallon)',
        'Heavy Knockdown / Raw Stucco (260 sq ft / gallon)',
      ]),
      sel('coatsRequired', 'Paint Coats Required', ['2 Coats (Standard Professional Finish)', '1 Coat (Touch-up / Same Color)', '3 Coats (Deep Tone / Unprimed Surface)']),
    ],
    compute: (v) => {
      const perim = asNum(v, 'wallPerimeterFt', 56)
      const height = asNum(v, 'wallHeightFt', 9.0)
      const doors = asNum(v, 'doorsCount', 2)
      const windows = asNum(v, 'windowsCount', 3)
      const texture = asSel(v, 'wallSurfaceTexture', 'Smooth')
      const coatsStr = asSel(v, 'coatsRequired', '2 Coats')

      const grossArea = perim * height
      const deductions = doors * 21 + windows * 15
      const netArea = Math.max(10, grossArea - deductions)

      let coveragePerGal = 380
      if (texture.includes('Orange Peel')) coveragePerGal = 320
      else if (texture.includes('Knockdown')) coveragePerGal = 260

      const coats = coatsStr.startsWith('1') ? 1 : coatsStr.startsWith('3') ? 3 : 2
      const totalCoverageNeeded = netArea * coats
      const exactGallons = totalCoverageNeeded / coveragePerGal
      const buyGallons = Math.ceil(exactGallons)

      return [
        res('Recommended Paint Purchase', `${buyGallons} Gallons (${(buyGallons * 3.785).toFixed(1)} L)`, 'good', `${coats} coats on ${fmtNum(Math.round(netArea))} net sq ft`),
        res('Exact Theoretical Volume', `${exactGallons.toFixed(2)} Gallons`, 'neutral', 'Before rounding up for retail packaging'),
        res('Net Paintable Surface Area', `${fmtNum(Math.round(netArea))} sq ft`, 'good', `Gross ${fmtNum(Math.round(grossArea))} sq ft minus ${deductions} sq ft doors/windows`),
        pctres('Wall Surface Efficiency', `${Math.round((netArea / grossArea) * 100)}% Paintable Area`, Math.round((netArea / grossArea) * 100), 'good'),
      ]
    },
  },
]
