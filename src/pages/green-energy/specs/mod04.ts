import {
  asNum,
  asSel,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type GreenSpec,
} from './greenSpec'

export const SUBJECT = 'Heat Pumps & Clean HVAC'

export const MOD04_SPECS: GreenSpec[] = [
  {
    id: 'heat-pump-cop-heating-savings-calculator',
    name: 'Air-Source Heat Pump COP vs Fossil Heating Cost Sizer',
    subject: SUBJECT,
    blurb: 'Calculate annual heating energy consumption, operating cost, and carbon reduction when replacing natural gas, fuel oil, or resistance heating with an inverter heat pump.',
    tip: 'Modern cold-climate heat pumps maintain a Coefficient of Performance (COP) > 2.0 even at -15°C (5°F), extracting warmth from freezing outside air.',
    usage: [
      'Enter home annual heating requirement in Therms, Gallons of Oil, or kWh.',
      'Select current heating fuel source.',
      'Select heat pump HSPF2 or seasonal COP rating.',
    ],
    method: [
      '1 Therm Natural Gas = 29.3 kWh thermal energy.',
      '1 Gallon Heating Oil = 40.7 kWh thermal energy.',
      'Heat Pump Electric kWh = Total_Thermal_kWh / Heat_Pump_COP.',
    ],
    fields: [
      sel('currentFuel', 'Current Heating Fuel Type', [
        'Natural Gas (Therms)',
        'Fuel Oil #2 (Gallons)',
        'Electric Resistance Baseboards (kWh)',
        'Propane LPG (Gallons)',
      ]),
      n('annualFuelUnits', 'Annual Fuel Consumption (Units)', 850, 100, 5000, 25),
      n('fuelCostPerUnit', 'Current Fuel Unit Cost ($)', 1.45, 0.5, 6.0, 0.05),
      n('electricRateKwh', 'Electricity Cost ($/kWh)', 0.17, 0.05, 0.50, 0.01),
      sel('heatPumpRating', 'Heat Pump Efficiency Rating', [
        'Cold-Climate Inverter (COP 3.2 / HSPF2 10.0)',
        'Standard Inverter (COP 2.8 / HSPF2 9.0)',
        'Geothermal Ground-Source (COP 4.2 / EER 22)',
      ]),
    ],
    compute: (v) => {
      const fuel = asSel(v, 'currentFuel', 'Natural Gas')
      const units = asNum(v, 'annualFuelUnits', 850)
      const fuelCost = asNum(v, 'fuelCostPerUnit', 1.45)
      const elecrate = asNum(v, 'electricRateKwh', 0.17)
      const hpStr = asSel(v, 'heatPumpRating', 'Cold-Climate')

      let thermalKwh = units * 29.3 // Gas default
      let baselineCo2Kg = units * 5.3 // kg per therm
      if (fuel.includes('Oil')) {
        thermalKwh = units * 40.7
        baselineCo2Kg = units * 10.2
      } else if (fuel.includes('Resistance')) {
        thermalKwh = units
        baselineCo2Kg = units * 0.38
      } else if (fuel.includes('Propane')) {
        thermalKwh = units * 26.8
        baselineCo2Kg = units * 5.7
      }

      const cop = hpStr.includes('Geothermal') ? 4.2 : hpStr.includes('Cold-Climate') ? 3.2 : 2.8
      const heatPumpKwh = thermalKwh / cop
      const baselineCost = units * fuelCost
      const heatPumpCost = heatPumpKwh * elecrate
      const annualSavings = baselineCost - heatPumpCost
      const heatPumpCo2Kg = heatPumpKwh * 0.35 // US grid average ~0.35 kg/kWh
      const co2AvoidedTons = Math.max(0, (baselineCo2Kg - heatPumpCo2Kg) / 1000)

      return [
        res('Heat Pump Annual Electric Cost', fmtMoney(heatPumpCost), 'good', `${fmtNum(Math.round(heatPumpKwh))} kWh consumed`),
        res('Baseline Heating Cost', fmtMoney(baselineCost), 'neutral', `Current ${fuel.split(' ')[0]} spend`),
        res('Annual Operational Savings', fmtMoney(annualSavings), annualSavings > 0 ? 'good' : 'warn', annualSavings > 0 ? 'Direct utility savings' : 'Consider off-peak electric rates'),
        pctres('Heating Efficiency Multiplier', `${(cop * 100).toFixed(0)}% Thermal Efficiency`, Math.min(100, Math.round(cop * 25)), 'good', `Delivers ${cop.toFixed(1)} units of heat per 1 unit electricity`),
        res('Annual Carbon Abatement', `${co2AvoidedTons.toFixed(2)} Metric Tons CO2e`, 'good', 'Scope 1 fossil fuel elimination'),
      ]
    },
  },
  {
    id: 'manual-j-cooling-heating-tonnage-sizer',
    name: 'HVAC Cooling & Heating Tonnage (BTU/hr) Sizer',
    subject: SUBJECT,
    blurb: 'Estimate sensible and latent HVAC heating/cooling loads in BTUs and equipment tonnage based on conditioned square footage, ceiling heights, and climate zones.',
    tip: '1 Ton of HVAC cooling equals 12,000 BTU/hr. Oversizing HVAC leads to short-cycling, high indoor humidity, and accelerated compressor wear.',
    usage: [
      'Enter total conditioned living area in square feet.',
      'Select ceiling height and home insulation quality.',
      'Select regional climate design zone.',
    ],
    method: [
      'Base BTU = Sq_Ft * Base_Factor (20 to 35 BTU/sq ft depending on insulation and climate).',
      'Ceiling Height Multiplier = Height / 8.0.',
      'Tonnage = Total_BTU / 12000.',
    ],
    fields: [
      n('squareFeet', 'Conditioned Living Area (Sq Ft)', 2200, 400, 10000, 50),
      n('ceilingHeight', 'Average Ceiling Height (Feet)', 9, 8, 16, 1),
      sel('insulationGrade', 'Envelope Insulation Grade', [
        'High Efficiency (2x6 Walls, Triple Pane, R-49 Attic)',
        'Standard Modern (2x4 Walls, Double Pane, R-38 Attic)',
        'Older / Uninsulated (Pre-1980, Drafty, R-19 Attic)',
      ]),
      sel('climateZone', 'Regional Climate Zone', [
        'Zone 4-5: Moderate / Balanced (Mid-Atlantic, Midwest)',
        'Zone 1-2: Hot & Humid (Florida, Texas Gulf)',
        'Zone 6-7: Severe Cold (New England, Upper Midwest, Canada)',
      ]),
    ],
    compute: (v) => {
      const sqft = asNum(v, 'squareFeet', 2200)
      const height = asNum(v, 'ceilingHeight', 9)
      const grade = asSel(v, 'insulationGrade', 'Standard')
      const zone = asSel(v, 'climateZone', 'Moderate')

      let btuPerSqFt = 24
      if (grade.includes('Older')) btuPerSqFt += 8
      if (grade.includes('High Efficiency')) btuPerSqFt -= 5
      if (zone.includes('Hot & Humid')) btuPerSqFt += 4
      if (zone.includes('Severe Cold')) btuPerSqFt += 6

      const heightFactor = height / 8.0
      const totalBtu = sqft * btuPerSqFt * heightFactor
      const rawTons = totalBtu / 12000
      const roundedTons = Math.ceil(rawTons * 2) / 2 // round up to nearest 0.5 ton

      return [
        res('Recommended HVAC Capacity', `${roundedTons.toFixed(1)} Tons`, 'good', `${fmtNum(Math.round(totalBtu))} BTU/hr required`),
        res('Cooling & Heating Load Density', `${(totalBtu / sqft).toFixed(1)} BTU / sq ft`, 'neutral', `Factoring ${height}ft ceilings`),
        res('Airflow Requirement (CFM)', `${fmtNum(Math.round(roundedTons * 400))} CFM`, 'good', 'Standard 400 CFM per cooling ton'),
        pctres('Envelope Performance Index', grade.includes('High') ? '88% High Retention' : grade.includes('Standard') ? '65% Standard' : '38% High Infiltration', grade.includes('High') ? 88 : grade.includes('Standard') ? 65 : 38, grade.includes('Older') ? 'warn' : 'good'),
      ]
    },
  },
]
