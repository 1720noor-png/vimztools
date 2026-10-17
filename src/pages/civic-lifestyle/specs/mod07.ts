import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Plumbing Hydraulics & Flow Rate'

export const MOD07_SPECS: CivicSpec[] = [
  {
    id: 'plumbing-fixture-flow-rate-pressure-drop-sizer',
    name: 'Plumbing Fixture Flow Rate (GPM) & Pipe Pressure Drop Sizer',
    subject: SUBJECT,
    blurb: 'Calculate residential fixture flow rates (Gallons Per Minute), Hazen-Williams pipe friction head loss, and dynamic water pressure (PSI) at simultaneous demand fixtures.',
    tip: 'Residential water pressure should remain between 45 and 65 PSI. Pressure below 40 PSI causes weak showers, while pressure above 80 PSI damages valves and voids appliance warranties.',
    usage: [
      'Enter static street/well water supply pressure (PSI).',
      'Select pipe material (Copper Type L, PEX, Galvanized Steel) and inside diameter.',
      'Enter total pipe run length in feet and simultaneous demand flow rate in GPM.',
    ],
    method: [
      'Hazen-Williams Pressure Loss h_f = 10.67 * L * Q^1.852 / (C^1.852 * d^4.87) in ft head.',
      'Pressure Drop (PSI) = h_f * 0.4335.',
      'Dynamic Terminal Pressure = Static_Supply_PSI - Pressure_Drop.',
    ],
    fields: [
      n('staticSupplyPsi', 'Static Supply Pressure (PSI)', 60, 20, 120, 1),
      sel('pipeMaterial', 'Plumbing Pipe Material', [
        'PEX Plastic Tubing (C = 150 - Smooth)',
        'Copper Type L (C = 140 - Standard Residential)',
        'Galvanized Steel / Corroded Iron (C = 100 - Rough)',
      ]),
      sel('pipeDiameter', 'Nominal Pipe Diameter', [
        '3/4" Inch Main Branch (0.75" ID)',
        '1/2" Inch Fixture Run (0.50" ID)',
        '1" Inch Main Service Line (1.00" ID)',
      ]),
      n('pipeRunLengthFt', 'Pipe Run Length to Fixture (Feet)', 65, 5, 400, 5),
      n('demandFlowGpm', 'Simultaneous Water Demand (GPM)', 5.5, 0.5, 30.0, 0.5),
    ],
    compute: (v) => {
      const staticPsi = asNum(v, 'staticSupplyPsi', 60)
      const mat = asSel(v, 'pipeMaterial', 'Copper')
      const diamStr = asSel(v, 'pipeDiameter', '3/4"')
      const length = asNum(v, 'pipeRunLengthFt', 65)
      const gpm = asNum(v, 'demandFlowGpm', 5.5)

      const c = mat.includes('PEX') ? 150 : mat.includes('Copper') ? 140 : 100
      const d = diamStr.includes('1/2') ? 0.50 : diamStr.includes('1"') ? 1.00 : 0.75

      // Hazen-Williams formula for head loss in feet:
      // h_f = (0.2083 * (100 / C)^1.852 * Q^1.852 / d^4.8655) * (L / 100)
      const headLossPer100Ft = 0.2083 * Math.pow(100 / c, 1.852) * Math.pow(gpm, 1.852) / Math.pow(d, 4.8655)
      const totalHeadLossFt = headLossPer100Ft * (length / 100.0)
      const psiDrop = totalHeadLossFt * 0.4335

      const dynamicPsi = Math.max(0, staticPsi - psiDrop)

      const isPsiGood = dynamicPsi >= 40 && dynamicPsi <= 75
      const tone: 'good' | 'warn' | 'bad' | 'neutral' = isPsiGood ? 'good' : dynamicPsi < 35 ? 'bad' : 'warn'

      return [
        res('Dynamic Terminal Pressure', `${dynamicPsi.toFixed(1)} PSI`, tone, isPsiGood ? 'Optimal pressure at active fixture' : dynamicPsi < 40 ? 'Low pressure: Consider upsizing pipe' : 'High pressure: Install PRV valve'),
        res('Friction Pressure Drop', `${psiDrop.toFixed(1)} PSI Loss`, psiDrop > 15 ? 'warn' : 'good', `Across ${length} ft of ${diamStr} pipe`),
        res('Water Flow Velocity', `${((0.408 * gpm) / (d * d)).toFixed(1)} ft/s`, ((0.408 * gpm) / (d * d)) > 8 ? 'warn' : 'good', 'Recommended velocity < 8 ft/s to prevent water hammer'),
        pctres('Flow Delivery Efficiency', `${Math.round((dynamicPsi / staticPsi) * 100)}% Supply Pressure Retained`, Math.round((dynamicPsi / staticPsi) * 100), tone),
      ]
    },
  },
]
