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

export const SUBJECT = 'EV Charging & Fleet Electrification'

export const MOD03_SPECS: GreenSpec[] = [
  {
    id: 'ev-charging-time-kw-calculator',
    name: 'EV Charging Duration, Energy Delivery & Range-Per-Hour Sizer',
    subject: SUBJECT,
    blurb: 'Calculate exact charging time from state-of-charge (SoC) start to finish across Level 1, Level 2, and DC Fast Chargers, factoring in onboard charger limits and ambient thermal tapering.',
    tip: 'Level 2 240V/48A charging adds ~35-45 miles of range per hour, whereas Level 1 120V/12A adds only 3-5 miles per hour.',
    usage: [
      'Select EV battery pack usable capacity (kWh).',
      'Select starting and target State of Charge (% SoC).',
      'Select charging equipment voltage and amperage.',
    ],
    method: [
      'Delivered kWh = Pack_Capacity * ((Target_SoC - Start_SoC) / 100) / Charging_Efficiency 0.88.',
      'Charge Time (Hours) = Delivered_kWh / Charger_kW.',
    ],
    fields: [
      n('batteryPackKwh', 'EV Usable Battery Pack (kWh)', 75, 20, 200, 1),
      n('startSoc', 'Starting State of Charge (%)', 20, 0, 95, 5),
      n('targetSoc', 'Target State of Charge (%)', 80, 10, 100, 5),
      sel('chargerType', 'Charging Station Specification', [
        'Level 2: 240V / 48A (11.5 kW Home/Fleet Hardwired)',
        'Level 2: 240V / 32A (7.7 kW Standard NEMA 14-50)',
        'Level 1: 120V / 12A (1.4 kW Standard Wall Outlet)',
        'DC Fast Charge: 150 kW Commercial High-Power',
        'DC Fast Charge: 350 kW Ultra-Fast CCS/NACS',
      ]),
      n('vehicleEfficiency', 'Vehicle Efficiency (Miles / kWh)', 3.6, 1.5, 5.0, 0.1),
    ],
    compute: (v) => {
      const pack = asNum(v, 'batteryPackKwh', 75)
      const start = asNum(v, 'startSoc', 20)
      const end = asNum(v, 'targetSoc', 80)
      const type = asSel(v, 'chargerType', 'Level 2: 240V / 48A')
      const eff = asNum(v, 'vehicleEfficiency', 3.6)

      const socDelta = Math.max(1, end - start)
      const netKwhNeeded = pack * (socDelta / 100)

      let chargerKw = 11.5
      let chargeLoss = 0.90
      if (type.includes('32A')) { chargerKw = 7.7; chargeLoss = 0.88 }
      else if (type.includes('Level 1')) { chargerKw = 1.4; chargeLoss = 0.82 }
      else if (type.includes('150 kW')) { chargerKw = 110; chargeLoss = 0.92 } // Average taper
      else if (type.includes('350 kW')) { chargerKw = 210; chargeLoss = 0.93 } // Average taper

      const grossKwh = netKwhNeeded / chargeLoss
      const totalHours = grossKwh / chargerKw

      const hoursPart = Math.floor(totalHours)
      const minsPart = Math.round((totalHours - hoursPart) * 60)
      const addedMiles = netKwhNeeded * eff
      const milesPerHour = (chargerKw * chargeLoss) * eff

      return [
        res('Estimated Charge Duration', `${hoursPart}h ${minsPart}m`, totalHours > 8 ? 'warn' : 'good', `${start}% -> ${end}% SoC`),
        res('Energy Drawn from Grid', `${grossKwh.toFixed(1)} kWh`, 'neutral', `Delivers ${netKwhNeeded.toFixed(1)} kWh into battery`),
        res('Range Added', `${fmtNum(addedMiles)} miles (${fmtNum(addedMiles * 1.609)} km)`, 'good', `@ ${eff} mi/kWh efficiency`),
        pctres('Effective Charge Speed', `${milesPerHour.toFixed(0)} mi/hr Range Added`, Math.min(100, Math.round(milesPerHour)), 'good'),
      ]
    },
  },
  {
    id: 'commercial-fleet-electrification-tco-calculator',
    name: 'Commercial Fleet ICE vs EV Total Cost of Ownership (TCO) Sizer',
    subject: SUBJECT,
    blurb: 'Compare capital expenditure, diesel/gasoline fuel vs electric utility charging, and preventative maintenance over 5 years across commercial vehicle fleets.',
    tip: 'Electric commercial delivery vans typically save 60-70% in fuel and 40% in brake/powertrain maintenance compared to diesel equivalents.',
    usage: [
      'Enter total vehicle fleet count.',
      'Enter annual average miles driven per vehicle.',
      'Input local diesel/gasoline prices and industrial electricity rates.',
    ],
    method: [
      'Annual Fuel Cost ICE = (Miles / MPG) * Fuel_Price.',
      'Annual Fuel Cost EV = (Miles / Mi_per_kWh) * Electric_Rate.',
      '5-Year Net TCO Delta = (Capex_EV - Capex_ICE) + 5 * (Fuel_EV - Fuel_ICE + Maint_EV - Maint_ICE).',
    ],
    fields: [
      n('fleetSize', 'Total Vehicles in Fleet', 10, 1, 500, 1),
      n('annualMiles', 'Annual Miles per Vehicle', 25000, 5000, 100000, 1000),
      n('fuelPricePerGal', 'Diesel / Gas Cost ($/Gallon)', 3.85, 2.0, 7.0, 0.05),
      n('electricRateKwh', 'Fleet Charging Rate ($/kWh)', 0.14, 0.04, 0.40, 0.01),
      n('iceMpg', 'ICE Fleet Average MPG', 12, 5, 35, 1),
      n('evMiPerKwh', 'EV Fleet Average Mi/kWh', 2.2, 1.0, 4.5, 0.1),
    ],
    compute: (v) => {
      const fleet = asNum(v, 'fleetSize', 10)
      const miles = asNum(v, 'annualMiles', 25000)
      const gasPrice = asNum(v, 'fuelPricePerGal', 3.85)
      const elecrate = asNum(v, 'electricRateKwh', 0.14)
      const mpg = asNum(v, 'iceMpg', 12)
      const evEff = asNum(v, 'evMiPerKwh', 2.2)

      const annualIceFuel = (miles / mpg) * gasPrice * fleet
      const annualEvFuel = (miles / evEff) * elecrate * fleet

      const annualIceMaint = miles * 0.11 * fleet
      const annualEvMaint = miles * 0.06 * fleet

      const annualOpExIce = annualIceFuel + annualIceMaint
      const annualOpExEv = annualEvFuel + annualEvMaint
      const annualOpExSavings = annualOpExIce - annualOpExEv
      const fiveYearOpExSavings = annualOpExSavings * 5

      const co2TonsAvoided = ((miles * fleet) / mpg) * 0.01018 // ~10.18 kg CO2 per gallon of diesel

      return [
        res('Annual Fuel & Maint Savings', fmtMoney(annualOpExSavings), 'good', `Across ${fleet} fleet vehicles`),
        res('5-Year Operational Savings', fmtMoney(fiveYearOpExSavings), 'good', 'Reinvestable operational capital'),
        res('Annual Diesel Avoided', `${fmtNum(Math.round((miles / mpg) * fleet))} Gallons`, 'good', 'Direct liquid fuel displacement'),
        pctres('OpEx Reduction Ratio', `${Math.round((annualOpExSavings / annualOpExIce) * 100)}% Lower Operating Cost`, Math.round((annualOpExSavings / annualOpExIce) * 100), 'good'),
        res('Annual Scope 1 Carbon Offset', `${co2TonsAvoided.toFixed(1)} Metric Tons CO2e`, 'good', 'Zero tailpipe emissions'),
      ]
    },
  },
]
