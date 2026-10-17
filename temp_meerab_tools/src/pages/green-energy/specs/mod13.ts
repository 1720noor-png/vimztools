import {
  asNum,
  asSel,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type GreenSpec,
} from './greenSpec'

export const SUBJECT = 'Embodied Carbon & Green Building Materials'

export const MOD13_SPECS: GreenSpec[] = [
  {
    id: 'mass-timber-vs-concrete-embodied-carbon-sizer',
    name: 'Mass Timber vs Reinforced Concrete Embodied Carbon Sizer',
    subject: SUBJECT,
    blurb: 'Compare upfront cradle-to-gate embodied carbon (A1-A3 Global Warming Potential kgCO2e) and biogenic carbon sequestration between Cross-Laminated Timber (CLT) and reinforced concrete structural designs.',
    tip: 'Cement production accounts for ~8% of total global greenhouse gas emissions. Mass timber acts as a physical carbon sink, sequestering ~1 ton of atmospheric CO2 per cubic meter of wood.',
    usage: [
      'Enter total gross building floor area in square feet.',
      'Specify total structural frame floor levels.',
      'Select concrete mix type (Standard OPC vs Low-Carbon Pozzolan Slag replacement).',
    ],
    method: [
      'Concrete GWP = Volume_m3 * Concrete_Intensity (320-420 kgCO2e/m3).',
      'Mass Timber GWP = Volume_m3 * Timber_Intensity (110 kgCO2e/m3).',
      'Biogenic Carbon Sequestration CLT = Volume_m3 * -780 kgCO2/m3.',
      'Net Carbon Delta = Concrete_GWP - (Mass_Timber_GWP + Sequestration).',
    ],
    fields: [
      n('buildingGrossSqFt', 'Gross Building Floor Area (Sq Ft)', 65000, 5000, 1000000, 2500),
      n('numberOfStories', 'Number of Structural Stories', 5, 1, 30, 1),
      sel('concreteMixType', 'Baseline Concrete Specification', [
        'Standard Portland Cement OPC (400 kgCO2e/m³)',
        '30% Fly Ash / Slag Replacement (290 kgCO2e/m³)',
        '50% Low-Carbon Pozzolan (210 kgCO2e/m³)',
      ]),
      n('cltSlabThicknessInches', 'CLT Floor Slab Thickness (Inches)', 7.0, 4.0, 12.0, 0.5),
    ],
    compute: (v) => {
      const sqft = asNum(v, 'buildingGrossSqFt', 65000)
      const concreteType = asSel(v, 'concreteMixType', 'Standard')
      const slabThick = asNum(v, 'cltSlabThicknessInches', 7.0)

      const sqMeters = sqft * 0.0929
      const timberVolumeM3 = sqMeters * (slabThick * 0.0254) * 1.15 // 15% columns/glulam beams
      const concreteVolumeM3 = sqMeters * (8.5 * 0.0254) * 1.25 // Equivalent post-tensioned concrete volume

      let concreteIntensity = 400
      if (concreteType.includes('30%')) concreteIntensity = 290
      else if (concreteType.includes('50%')) concreteIntensity = 210

      const concreteTotalCo2Kg = concreteVolumeM3 * concreteIntensity
      const timberManufactureCo2Kg = timberVolumeM3 * 115
      const timberBiogenicStoredCo2Kg = timberVolumeM3 * 780 // net sequestered CO2

      const netTimberCo2Kg = timberManufactureCo2Kg - timberBiogenicStoredCo2Kg
      const netSavingsTonsCo2 = (concreteTotalCo2Kg - netTimberCo2Kg) / 1000
      const reductionPct = Math.round(((concreteTotalCo2Kg - timberManufactureCo2Kg) / concreteTotalCo2Kg) * 100)

      return [
        res('Net Avoided Carbon', `${fmtNum(Math.round(netSavingsTonsCo2))} Metric Tons CO2e`, 'good', 'Combines avoided cement emissions + wood carbon storage'),
        res('Baseline Concrete Emissions', `${fmtNum(Math.round(concreteTotalCo2Kg / 1000))} tCO2e`, 'warn', `A1-A3 embodied cradle-to-gate`),
        res('Timber Biogenic Carbon Stored', `${fmtNum(Math.round(timberBiogenicStoredCo2Kg / 1000))} tCO2 Locked`, 'good', 'Permanently sequestered inside building structure'),
        pctres('Upfront Embodied Reduction', `${reductionPct}% Lower Emissions`, reductionPct, 'good', 'Excluding end-of-life deconstruction credits'),
      ]
    },
  },
]
