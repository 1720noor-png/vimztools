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

export const SUBJECT = 'Masonry & Concrete Volume'

export const MOD10_SPECS: CivicSpec[] = [
  {
    id: 'concrete-slab-volume-bags-sizer',
    name: 'Concrete Slab, Footing & Pre-Mix Bag Sizer',
    subject: SUBJECT,
    blurb: 'Calculate wet concrete volume in cubic yards (yd³) and cubic meters (m³), required 80-lb / 60-lb pre-mix bags, and water mixing ratios for slabs, patios, and post footings.',
    tip: '1 cubic yard of concrete equals 27 cubic feet and requires approximately forty-five 80-lb bags or sixty 60-lb bags. Always order 10% extra for subgrade unevenness and spillage.',
    usage: [
      'Enter slab or trench length and width in feet.',
      'Enter slab depth/thickness in inches (4" standard for patios/sidewalks, 6" for vehicle driveways).',
      'Select concrete packaging: Ready-Mix Truck (Yards³) vs Pre-Mix Bags (80-lb/60-lb).',
    ],
    method: [
      'Volume (Cubic Feet) = Length * Width * (Depth_Inches / 12).',
      'Cubic Yards = (Cubic_Feet / 27) * 1.10 (10% spillage buffer).',
      '80-lb Bags = Cubic_Yards * 45.',
      '60-lb Bags = Cubic_Yards * 60.',
    ],
    fields: [
      n('slabLengthFt', 'Slab / Trench Length (Feet)', 20.0, 1.0, 200.0, 0.5),
      n('slabWidthFt', 'Slab / Trench Width (Feet)', 12.0, 1.0, 100.0, 0.5),
      n('slabThicknessInches', 'Slab Thickness (Inches)', 4.0, 2.0, 24.0, 0.5),
      sel('mixPackaging', 'Concrete Delivery Method', [
        'Pre-Mix 80-lb Bags (0.60 cu ft / bag)',
        'Pre-Mix 60-lb Bags (0.45 cu ft / bag)',
        'Ready-Mix Concrete Transit Truck (Cubic Yards)',
      ]),
    ],
    compute: (v) => {
      const len = asNum(v, 'slabLengthFt', 20.0)
      const wid = asNum(v, 'slabWidthFt', 12.0)
      const thickInches = asNum(v, 'slabThicknessInches', 4.0)
      const pkg = asSel(v, 'mixPackaging', '80-lb')

      const netCuFt = len * wid * (thickInches / 12.0)
      const grossCuFt = netCuFt * 1.10 // 10% buffer
      const grossCuYds = grossCuFt / 27.0

      const bags80 = Math.ceil(grossCuFt / 0.60)
      const bags60 = Math.ceil(grossCuFt / 0.45)
      const totalWeightLbs = grossCuYds * 4050 // ~4,050 lbs per cubic yard

      return [
        res('Ready-Mix Volume Required', `${grossCuYds.toFixed(2)} Cubic Yards (${(grossCuYds * 0.7645).toFixed(2)} m³)`, 'good', 'Includes 10% subgrade variance buffer'),
        res('Pre-Mix 80-lb Bag Count', `${bags80} Bags (80-lb)`, pkg.includes('80-lb') ? 'good' : 'neutral', `Total dry weight: ${fmtNum(bags80 * 80)} lbs`),
        res('Pre-Mix 60-lb Bag Count', `${bags60} Bags (60-lb)`, pkg.includes('60-lb') ? 'good' : 'neutral', `Total dry weight: ${fmtNum(bags60 * 60)} lbs`),
        res('Total Cured Weight', `${fmtNum(Math.round(totalWeightLbs))} lbs (${(totalWeightLbs / 2000).toFixed(1)} Tons)`, 'neutral', 'Structural dead load'),
        pctres('Buffer Reserve Allocation', '10% Subgrade Allowance', 10, 'good', `Dimensions: ${len}' x ${wid}' @ ${thickInches}" depth`),
      ]
    },
  },
]
