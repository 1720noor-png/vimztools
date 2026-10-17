import {
  asNum,
  fmtNum,
  n,
  pctres,
  res,
  type GreenSpec,
} from './greenSpec'

export const SUBJECT = 'Rainwater Harvesting & Water Conservation'

export const MOD11_SPECS: GreenSpec[] = [
  {
    id: 'rainwater-harvesting-tank-capacity-sizer',
    name: 'Rooftop Rainwater Harvesting Cistern & Storage Sizer',
    subject: SUBJECT,
    blurb: 'Calculate annual harvested rainwater volume (gallons and liters), required cistern storage capacity, and water supply independence based on roof footprint and local precipitation.',
    tip: '1 inch of rainfall on a 1,000 sq ft roof yields approximately 623 gallons of freshwater before runoff filter coefficient losses.',
    usage: [
      'Enter catchment roof surface area in square feet.',
      'Enter average annual rainfall in inches.',
      'Enter daily non-potable water demand (irrigation, toilet flushing) in gallons.',
    ],
    method: [
      'Annual Gallons = Catchment_SqFt * Rainfall_Inches * 0.623 * Runoff_Coeff (0.85).',
      'Recommended Cistern Storage = Daily_Demand * Dry_Spell_Days (21 days).',
    ],
    fields: [
      n('roofFootprintSqFt', 'Catchment Roof Area (Sq Ft)', 2500, 200, 50000, 100),
      n('annualRainfallInches', 'Average Annual Rainfall (Inches)', 38, 5, 120, 1),
      n('dailyDemandGallons', 'Daily Non-Potable Water Demand (Gallons)', 85, 10, 2000, 5),
      n('dryPeriodDays', 'Maximum Dry Spell Consecutive Days', 25, 7, 90, 1),
    ],
    compute: (v) => {
      const roof = asNum(v, 'roofFootprintSqFt', 2500)
      const rain = asNum(v, 'annualRainfallInches', 38)
      const dailyDemand = asNum(v, 'dailyDemandGallons', 85)
      const dryDays = asNum(v, 'dryPeriodDays', 25)

      const runoffCoeff = 0.88 // Metal or smooth tile roof
      const firstFlushDerate = 0.95

      const annualHarvestGallons = roof * rain * 0.6233 * runoffCoeff * firstFlushDerate
      const annualDemandGallons = dailyDemand * 365
      const cisternCapacityGallons = dailyDemand * dryDays

      const selfSufficiencyPct = Math.min(100, Math.round((annualHarvestGallons / annualDemandGallons) * 100))

      return [
        res('Annual Harvest Potential', `${fmtNum(Math.round(annualHarvestGallons))} Gallons (${fmtNum(Math.round(annualHarvestGallons * 3.78541))} L)`, 'good', `From ${rain}" rainfall across ${fmtNum(roof)} sq ft`),
        res('Recommended Cistern Size', `${fmtNum(Math.round(cisternCapacityGallons))} Gallons`, 'neutral', `Provides ${dryDays} days of buffer storage`),
        res('Annual Demand Offset', `${fmtNum(Math.round(annualDemandGallons))} Gallons / year`, 'neutral', `At ${dailyDemand} gal/day consumption`),
        pctres('Water Independence Ratio', `${selfSufficiencyPct}% Non-Potable Autonomy`, selfSufficiencyPct, 'good', 'Replaces municipal treated water for irrigation & toilets'),
      ]
    },
  },
]
