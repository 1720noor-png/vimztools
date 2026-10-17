import {
  asNum,
  fmtNum,
  n,
  pctres,
  res,
  type GreenSpec,
} from './greenSpec'

export const SUBJECT = 'Wind Turbines & Aerodynamics'

export const MOD05_SPECS: GreenSpec[] = [
  {
    id: 'wind-turbine-betz-limit-power-calculator',
    name: 'Wind Turbine Power Output & Betz Limit Aerodynamics Sizer',
    subject: SUBJECT,
    blurb: 'Calculate theoretical and electrical power output (kW) from wind speed, rotor diameter, air density, and aerodynamic power coefficient (Cp) capped by Betz limit (59.3%).',
    tip: 'Power available in the wind scales with the cube of wind speed (v³). Doubling wind speed produces eight times (2³ = 8x) more kinetic power.',
    usage: [
      'Enter rotor diameter in meters.',
      'Enter average hub-height wind speed in meters/second (m/s).',
      'Specify local air density and drivetrain efficiency.',
    ],
    method: [
      'Swept Area A = pi * (Diameter / 2)^2.',
      'Wind Power P_wind = 0.5 * rho * A * v^3.',
      'Electrical Output = P_wind * Cp (0.35 - 0.48) * Drivetrain_Eff (0.92).',
      'Theoretical Betz Limit = P_wind * 0.593.',
    ],
    fields: [
      n('rotorDiameterM', 'Rotor Diameter (Meters)', 12, 1, 150, 1),
      n('windSpeedMs', 'Hub-Height Wind Speed (m/s)', 8.5, 2.0, 25.0, 0.5),
      n('airDensity', 'Air Density (kg/m³)', 1.225, 1.0, 1.35, 0.005),
      n('capacityFactor', 'Expected Annual Capacity Factor (%)', 32, 15, 55, 1),
    ],
    compute: (v) => {
      const diameter = asNum(v, 'rotorDiameterM', 12)
      const vSpeed = asNum(v, 'windSpeedMs', 8.5)
      const rho = asNum(v, 'airDensity', 1.225)
      const cf = asNum(v, 'capacityFactor', 32)

      const radius = diameter / 2
      const sweptArea = Math.PI * radius * radius

      const totalKineticPowerKw = (0.5 * rho * sweptArea * Math.pow(vSpeed, 3)) / 1000
      const betzTheoreticalKw = totalKineticPowerKw * 0.593
      const cpRotor = 0.42 // realistic modern blade aerodynamic efficiency
      const generatorEff = 0.92
      const electricalOutputKw = totalKineticPowerKw * cpRotor * generatorEff

      const annualMwh = (electricalOutputKw * (cf / 100) * 8760) / 1000
      const windSpeedMph = vSpeed * 2.23694

      return [
        res('Active Electrical Output', `${electricalOutputKw.toFixed(1)} kW`, 'good', `@ ${vSpeed} m/s (${windSpeedMph.toFixed(1)} mph)`),
        res('Swept Rotor Area', `${fmtNum(Math.round(sweptArea))} m² (${fmtNum(Math.round(sweptArea * 10.764))} sq ft)`, 'neutral'),
        res('Theoretical Betz Max', `${betzTheoreticalKw.toFixed(1)} kW`, 'neutral', 'Betz Law theoretical upper ceiling (59.3%)'),
        res('Projected Annual Generation', `${annualMwh.toFixed(1)} MWh / year`, 'good', `@ ${cf}% annual capacity factor`),
        pctres('Aerodynamic Extraction Efficiency', `${(cpRotor * 100).toFixed(1)}% Cp Efficiency`, Math.round(cpRotor * 100), 'good', 'Advanced NACA airfoil lift profile'),
      ]
    },
  },
]
