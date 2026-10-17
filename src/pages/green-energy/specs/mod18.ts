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

export const SUBJECT = 'Industrial Waste Heat & ORC Recovery'

export const MOD18_SPECS: GreenSpec[] = [
  {
    id: 'industrial-waste-heat-recovery-orc-sizer',
    name: 'Industrial Waste Heat Organic Rankine Cycle (ORC) Power Sizer',
    subject: SUBJECT,
    blurb: 'Calculate net electric generation capacity (kW and MW) and fuel cost displacement from flue gas, cement kiln, glass furnace, or compressor exhaust heat using low-temperature ORC fluid cycles.',
    tip: 'Organic Rankine Cycle (ORC) uses heavy molecular organic fluids with low boiling points, allowing clean electricity generation from exhaust streams as cool as 90°C to 250°C (194°F - 482°F).',
    usage: [
      'Enter waste heat exhaust flue gas mass flow rate in kg/second or lbs/hr.',
      'Enter exhaust stream inlet temperature (°C).',
      'Select ORC organic working fluid cycle technology.',
    ],
    method: [
      'Thermal Heat Available Q_th = Mass_Flow * Cp_flue (1.08 kJ/kg·K) * (T_in - T_out 110°C).',
      'Net ORC Power kW = Q_th * ORC_Efficiency (14% to 22%).',
      'Annual Generation MWh = Net_ORC_kW * 8000 Operating_Hours / 1000.',
    ],
    fields: [
      n('exhaustTempC', 'Exhaust Gas Temperature (°C)', 240, 90, 650, 5),
      n('exhaustFlowKgSec', 'Exhaust Mass Flow Rate (kg/sec)', 15.0, 1.0, 100.0, 0.5),
      sel('orcWorkingFluid', 'ORC Working Fluid Class', [
        'Cyclopentane / Hydrocarbon (High Temp > 220°C - 19% Eff)',
        'HFO-1233zd(E) Eco-Refrigerant (Mid Temp 140-220°C - 15% Eff)',
        'Low-GWP Blend (Low Temp 90-140°C - 11% Eff)',
      ]),
      n('plantOperatingHours', 'Annual Operating Hours (Hours/Year)', 7800, 2000, 8760, 100),
    ],
    compute: (v) => {
      const tempC = asNum(v, 'exhaustTempC', 240)
      const flow = asNum(v, 'exhaustFlowKgSec', 15.0)
      const fluid = asSel(v, 'orcWorkingFluid', 'Cyclopentane')
      const hours = asNum(v, 'plantOperatingHours', 7800)

      const stackExitTempC = 110 // Minimum exhaust temp to prevent acid condensation
      const deltaT = Math.max(10, tempC - stackExitTempC)
      const specificHeatAir = 1.08 // kJ/kg·K

      const thermalPowerKw = flow * specificHeatAir * deltaT

      let orcEff = 0.15
      if (fluid.includes('High Temp')) orcEff = 0.19
      else if (fluid.includes('Mid Temp')) orcEff = 0.15
      else if (fluid.includes('Low Temp')) orcEff = 0.11

      const electricalPowerKw = thermalPowerKw * orcEff
      const annualMwh = (electricalPowerKw * hours) / 1000
      const co2AvoidedTons = annualMwh * 0.38 // Grid displacement

      return [
        res('Continuous ORC Electric Output', `${electricalPowerKw >= 1000 ? (electricalPowerKw / 1000).toFixed(2) + ' MW' : electricalPowerKw.toFixed(0) + ' kW'}`, 'good', 'Zero incremental fuel consumption'),
        res('Thermal Energy Captured', `${fmtNum(Math.round(thermalPowerKw))} kWth`, 'neutral', `From ${tempC}°C stack cooled to ${stackExitTempC}°C`),
        res('Annual Clean Electricity Produced', `${fmtNum(Math.round(annualMwh))} MWh / year`, 'good', `@ ${hours} annual industrial operating hours`),
        res('Annual Scope 2 Carbon Offset', `${fmtNum(Math.round(co2AvoidedTons))} Metric Tons CO2e`, 'good', 'Replaces grid electricity on site'),
        pctres('Thermal-to-Electric Conversion', `${(orcEff * 100).toFixed(1)}% ORC Efficiency`, Math.round(orcEff * 100), 'good'),
      ]
    },
  },
]
