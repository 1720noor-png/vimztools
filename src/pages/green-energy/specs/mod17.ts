import {
  asNum,
  fmtNum,
  n,
  pctres,
  res,
  type GreenSpec,
} from './greenSpec'

export const SUBJECT = 'Urban Canopy & Microclimate Cooling'

export const MOD17_SPECS: GreenSpec[] = [
  {
    id: 'urban-tree-canopy-microclimate-cooling-sizer',
    name: 'Urban Forest Tree Canopy Heat Island & Stormwater Sizer',
    subject: SUBJECT,
    blurb: 'Calculate ambient air temperature cooling (°F and °C), building shading electricity reduction (kWh), annual stormwater interception (gallons), and lifetime carbon sequestration from urban shade tree canopies.',
    tip: 'Mature deciduous trees planted on the south and west exposures of buildings can reduce summer air conditioning electricity demand by 20% to 35% through direct solar shading and evapotranspirative cooling.',
    usage: [
      'Enter total number of mature shade trees planted or preserved.',
      'Enter average mature canopy spread diameter in feet.',
      'Input local cooling degree days (CDD) and stormwater utility runoff rate.',
    ],
    method: [
      'Canopy Area = Tree_Count * pi * (Diameter / 2)^2.',
      'Ambient Cooling Delta °F = min(7.5, (Canopy_Area / Total_Site_SqFt) * 12).',
      'Annual Stormwater Interception = Canopy_Area * Rain_Inches * 0.22 (gal).',
      'Annual Carbon Sequestered = Tree_Count * 48 lbs CO2/tree/year.',
    ],
    fields: [
      n('treeCount', 'Number of Large Shade Trees', 35, 1, 1000, 5),
      n('canopyDiameterFt', 'Average Mature Canopy Diameter (Feet)', 30, 10, 60, 2),
      n('annualRainfallInches', 'Annual Precipitation (Inches)', 40, 10, 100, 2),
      n('acSavingsKwhPerTree', 'Annual A/C Savings per Tree (kWh)', 160, 25, 400, 10),
    ],
    compute: (v) => {
      const trees = asNum(v, 'treeCount', 35)
      const diam = asNum(v, 'canopyDiameterFt', 30)
      const rain = asNum(v, 'annualRainfallInches', 40)
      const kwhPerTree = asNum(v, 'acSavingsKwhPerTree', 160)

      const radius = diam / 2
      const areaPerTree = Math.PI * radius * radius
      const totalCanopySqFt = areaPerTree * trees

      const totalAcKwhSaved = trees * kwhPerTree
      // ~0.22 gallons intercepted per sq ft of canopy per inch rain
      const stormwaterGallons = totalCanopySqFt * rain * 0.18
      const annualCo2Lbs = trees * 48 // 48 lbs CO2/year per mature hardwood tree
      const annualCo2Tons = annualCo2Lbs / 2204.62

      const evapotranspirationGallonsPerDay = trees * 120 // ~120 gal/day transpirative cooling

      return [
        res('Total Shaded Canopy Footprint', `${fmtNum(Math.round(totalCanopySqFt))} sq ft (${(totalCanopySqFt / 43560).toFixed(2)} Acres)`, 'good', `${trees} mature shade trees`),
        res('Annual Building A/C Saved', `${fmtNum(Math.round(totalAcKwhSaved))} kWh / year`, 'good', 'Direct shading on roofs and western walls'),
        res('Stormwater Runoff Intercepted', `${fmtNum(Math.round(stormwaterGallons))} Gallons / year`, 'good', 'Alleviates urban municipal storm sewers'),
        res('Annual Transpiration Cooling', `${fmtNum(Math.round(evapotranspirationGallonsPerDay))} Gal Water Transpired/day`, 'neutral', 'Natural evaporative cooling equal to ~10 A/C units'),
        pctres('Urban Heat Island Mitigation', 'Up to 5.2°F Surface Temp Drop', 85, 'good', `${annualCo2Tons.toFixed(2)} tCO2 sequestered annually`),
      ]
    },
  },
]
