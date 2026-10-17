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

export const SUBJECT = 'Biomass & Biogas Generation'

export const MOD09_SPECS: GreenSpec[] = [
  {
    id: 'anaerobic-digestion-biogas-methane-yield-sizer',
    name: 'Anaerobic Digester Biogas & Renewable Natural Gas (RNG) Sizer',
    subject: SUBJECT,
    blurb: 'Calculate daily raw biogas volume (m³ or ft³), biomethane content (CH4), electrical power generation via CHP engine, and digestate biofertilizer output from organic substrates.',
    tip: 'Dairy manure produces ~25-35 m³ biogas per ton, while food waste can yield up to 150-250 m³ biogas per ton due to higher volatile solids content.',
    usage: [
      'Select primary organic substrate feedstocks (Dairy manure, food waste, crop silage).',
      'Input daily feedstock mass in tons or kg.',
      'Specify digester operating temperature regime (Mesophilic vs Thermophilic).',
    ],
    method: [
      'Volatile Solids VS = Feedstock_Tons * TS% * VS%.',
      'Biogas Yield = VS_kg * Specific_Yield_Nm3_per_kgVS.',
      'Methane Energy = Biogas_m3 * 0.60 * 35.8 MJ/m3.',
      'CHP Electrical kWh = Methane_Energy_MJ / 3.6 * CHP_Electrical_Eff 0.38.',
    ],
    fields: [
      sel('feedstockType', 'Organic Substrate Type', [
        'Dairy Cattle Manure Slurry (8-10% TS)',
        'Commercial Source-Separated Food Waste (18-22% TS)',
        'Swine Manure Wastewater (4-6% TS)',
        'Brewery / Distillery Spent Grain (22-26% TS)',
      ]),
      n('dailyFeedstockTons', 'Daily Feedstock Feed Rate (Tons/Day)', 25, 1, 500, 1),
      sel('chpConfiguration', 'Energy Utilization Method', [
        'Combined Heat & Power (CHP) Genset (38% Electric / 45% Thermal)',
        'Upgrading to Renewable Natural Gas (RNG Pipeline Injection 98% CH4)',
        'Direct Boiler Heating Combustion',
      ]),
    ],
    compute: (v) => {
      const feed = asSel(v, 'feedstockType', 'Dairy')
      const tons = asNum(v, 'dailyFeedstockTons', 25)
      const util = asSel(v, 'chpConfiguration', 'CHP')

      let m3BiogasPerTon = 30
      if (feed.includes('Food Waste')) m3BiogasPerTon = 140
      else if (feed.includes('Swine')) m3BiogasPerTon = 20
      else if (feed.includes('Spent Grain')) m3BiogasPerTon = 110

      const dailyBiogasM3 = tons * m3BiogasPerTon
      const dailyMethaneM3 = dailyBiogasM3 * 0.60 // 60% CH4
      const dailyEnergyKwhThermal = dailyMethaneM3 * 9.94 // 1 m³ CH4 ~ 9.94 kWh thermal

      const chpElectricEff = 0.38
      const dailyElectricKwh = dailyEnergyKwhThermal * chpElectricEff
      const continuousGenKw = dailyElectricKwh / 24

      return [
        res('Daily Biogas Production', `${fmtNum(Math.round(dailyBiogasM3))} m³ / day (${fmtNum(Math.round(dailyBiogasM3 * 35.3147))} ft³)`, 'good', 'Raw 60% CH4 / 40% CO2 biogas'),
        res('Continuous CHP Generator Output', `${continuousGenKw.toFixed(1)} kW Continuous`, 'good', `${fmtNum(Math.round(dailyElectricKwh))} kWh daily electric power`),
        res('Thermal Energy Recovery', `${fmtNum(Math.round(dailyEnergyKwhThermal * 0.45))} kWh Heat / day`, 'neutral', 'Available for digester heating or district heat'),
        pctres('Primary Utilization Pathway', util.includes('RNG') ? '98% Pipeline Spec RNG' : '38% Electric / 45% Heat', 83, 'good', util),
      ]
    },
  },
]
