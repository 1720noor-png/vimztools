import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BatteryCharging,
  Car,
  CloudRain,
  Compass,
  Droplets,
  Factory,
  FileText,
  Flame,
  Home,
  Leaf,
  Lightbulb,
  Server,
  Sun,
  Trees,
  TrendingDown,
  Wind,
  Zap,
} from 'lucide-react'
import type { Tool } from '../../lib/catalog'
import { greenEnergySpecs } from './specs'

export interface GreenSubcategory {
  id: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: string
  toolIds: string[]
}

export const GREEN_ENERGY_CATEGORY = 'green-energy'
export const GREEN_ENERGY_CATEGORY_NAME = 'Sustainable Energy & Climate Tech'

export const greenSubcategories: GreenSubcategory[] = [
  {
    id: 'solar-pv',
    title: 'Solar Photovoltaic & Panel Sizing',
    tagline: 'Rooftop solar kWp sizing, peak sun hours & inverter DC/AC ratio clipping',
    description: 'Calculate solar system capacity in kilowatt-peak (kWp), required roof surface area, and annual clean electricity generation.',
    icon: Sun,
    accent: '#16A34A',
    toolIds: ['solar-pv-array-capacity-calculator', 'solar-inverter-dc-ac-ratio-clipping-analyzer'],
  },
  {
    id: 'battery-storage',
    title: 'Battery Storage & BESS Sizing',
    tagline: 'Stationary BESS capacity, C-rate, and LFP calendar & cycle fade degradation',
    description: 'Calculate usable battery energy storage capacity (kWh), continuous discharge power (kW), and C-rate based on critical load backup.',
    icon: BatteryCharging,
    accent: '#16A34A',
    toolIds: ['bess-capacity-c-rate-sizer', 'battery-lfp-calendar-cycle-degradation-calculator'],
  },
  {
    id: 'ev-fleet',
    title: 'EV Charging & Fleet Electrification',
    tagline: 'Level 1-2 & DC fast charge duration, range added, and commercial fleet TCO',
    description: 'Calculate charging times, kWh delivered, and model 5-year operating savings when converting diesel fleets to commercial EVs.',
    icon: Car,
    accent: '#16A34A',
    toolIds: ['ev-charging-time-kw-calculator', 'commercial-fleet-electrification-tco-calculator'],
  },
  {
    id: 'heat-pumps',
    title: 'Heat Pumps & Clean HVAC',
    tagline: 'Cold-climate COP vs gas heating costs & Manual J BTU sizing',
    description: 'Calculate annual heating energy consumption, operating cost, and carbon reduction when replacing natural gas with heat pumps.',
    icon: Flame,
    accent: '#16A34A',
    toolIds: ['heat-pump-cop-heating-savings-calculator', 'manual-j-cooling-heating-tonnage-sizer'],
  },
  {
    id: 'wind-turbines',
    title: 'Wind Turbines & Aerodynamics',
    tagline: 'Betz limit theoretical maximum, rotor swept area & kinetic power output',
    description: 'Calculate theoretical and electrical power output (kW) from wind speed, rotor diameter, air density, and aerodynamic Cp factor.',
    icon: Wind,
    accent: '#16A34A',
    toolIds: ['wind-turbine-betz-limit-power-calculator'],
  },
  {
    id: 'carbon-accounting',
    title: 'Carbon Accounting & GHG Protocols',
    tagline: 'Scope 1, 2, and 3 corporate emissions & SBTi decarbonization pathways',
    description: 'Calculate organization-wide carbon dioxide equivalent (tCO2e) emissions across direct fuel, purchased grid, and value chain.',
    icon: Leaf,
    accent: '#16A34A',
    toolIds: ['ghg-protocol-scope1-2-3-carbon-calculator'],
  },
  {
    id: 'building-envelope',
    title: 'Building Envelope & Thermal Insulation',
    tagline: 'Assembly R-value, U-factor & framing thermal bridging derate sizer',
    description: 'Calculate effective assembly U-factor, parallel-path framing thermal bridging losses, and heating season heat loss.',
    icon: Home,
    accent: '#16A34A',
    toolIds: ['building-envelope-r-value-u-factor-sizer'],
  },
  {
    id: 'micro-hydro',
    title: 'Micro-Hydro Power & Water Turbines',
    tagline: 'Gross vs net hydraulic head, stream GPM flow & 24/7 continuous electric power',
    description: 'Calculate continuous electrical generation (Watts and kW) from gross hydraulic head (vertical drop) and water flow rate.',
    icon: Droplets,
    accent: '#16A34A',
    toolIds: ['micro-hydro-turbine-power-head-flow-calculator'],
  },
  {
    id: 'biomass-biogas',
    title: 'Biomass & Biogas Generation',
    tagline: 'Anaerobic digester biogas volume, biomethane CH4 yield & CHP engine sizer',
    description: 'Calculate daily raw biogas volume, biomethane content, and electrical power generation via CHP engine from organic wastes.',
    icon: Factory,
    accent: '#16A34A',
    toolIds: ['anaerobic-digestion-biogas-methane-yield-sizer'],
  },
  {
    id: 'peak-shaving',
    title: 'Peak Shaving & Grid Arbitrage',
    tagline: 'Commercial demand charge reduction & battery peak clipping capacity sizer',
    description: 'Calculate monthly utility demand charge savings and required battery kW power rating to clip 15-minute facility peak spikes.',
    icon: TrendingDown,
    accent: '#16A34A',
    toolIds: ['commercial-peak-shaving-demand-charge-sizer'],
  },
  {
    id: 'rainwater-harvesting',
    title: 'Rainwater Harvesting & Water Conservation',
    tagline: 'Rooftop runoff catchment yield, cistern storage size & dry spell autonomy',
    description: 'Calculate annual harvested rainwater volume (gallons and liters), required cistern storage capacity, and water supply independence.',
    icon: CloudRain,
    accent: '#16A34A',
    toolIds: ['rainwater-harvesting-tank-capacity-sizer'],
  },
  {
    id: 'commercial-lighting',
    title: 'Commercial Lighting & LED Retrofit',
    tagline: 'Fluorescent to LED wattage reduction, HVAC cooling interaction & simple payback',
    description: 'Calculate annual kWh electrical energy savings, HVAC cooling load reduction, and simple payback period for upgrading lighting.',
    icon: Lightbulb,
    accent: '#16A34A',
    toolIds: ['commercial-led-lighting-retrofit-payback-calculator'],
  },
  {
    id: 'embodied-carbon',
    title: 'Embodied Carbon & Green Building Materials',
    tagline: 'Cross-Laminated Timber (CLT) vs reinforced concrete GWP & biogenic storage',
    description: 'Compare upfront cradle-to-gate embodied carbon (A1-A3 GWP) and biogenic carbon sequestration between CLT and concrete designs.',
    icon: Trees,
    accent: '#16A34A',
    toolIds: ['mass-timber-vs-concrete-embodied-carbon-sizer'],
  },
  {
    id: 'data-center-efficiency',
    title: 'Data Center Efficiency & PUE Sizer',
    tagline: 'Power Usage Effectiveness (PUE) ratio, free-cooling & chiller overhead savings',
    description: 'Calculate Power Usage Effectiveness (PUE), chiller facility overhead power (kW), and annual carbon footprint of server compute.',
    icon: Server,
    accent: '#16A34A',
    toolIds: ['data-center-pue-cooling-efficiency-sizer'],
  },
  {
    id: 'green-hydrogen',
    title: 'Green Hydrogen & Fuel Cells',
    tagline: 'Water electrolysis PEM/Alkaline kWh/kg specific energy & Levelized Cost (LCOH)',
    description: 'Calculate daily green hydrogen yield, demineralized water requirements, electrical energy consumption, and Levelized Cost of Hydrogen.',
    icon: Zap,
    accent: '#16A34A',
    toolIds: ['green-hydrogen-water-electrolysis-kwh-kg-sizer'],
  },
  {
    id: 'off-grid-systems',
    title: 'Off-Grid Solar & Islanded Power Systems',
    tagline: 'Stand-alone off-grid PV sizing & days of overcast autonomy battery buffer',
    description: 'Size stand-alone off-grid solar PV arrays and battery banks to guarantee continuous 100% uptime through extended winter overcast conditions.',
    icon: Compass,
    accent: '#16A34A',
    toolIds: ['off-grid-solar-battery-autonomy-sizer'],
  },
  {
    id: 'urban-canopy',
    title: 'Urban Canopy & Microclimate Cooling',
    tagline: 'Urban forest shade canopy, heat island cooling delta & stormwater interception',
    description: 'Calculate ambient air temperature cooling (°F and °C), building shading electricity reduction (kWh), and stormwater interception.',
    icon: Trees,
    accent: '#16A34A',
    toolIds: ['urban-tree-canopy-microclimate-cooling-sizer'],
  },
  {
    id: 'waste-heat-recovery',
    title: 'Industrial Waste Heat & ORC Recovery',
    tagline: 'Organic Rankine Cycle (ORC) power generation from low-temperature flue gas',
    description: 'Calculate net electric generation capacity (kW and MW) and fuel cost displacement from flue gas using low-temperature ORC fluid cycles.',
    icon: Factory,
    accent: '#16A34A',
    toolIds: ['industrial-waste-heat-recovery-orc-sizer'],
  },
  {
    id: 'rec-procurement',
    title: 'Renewable Energy Certificates (REC) & PPAs',
    tagline: 'Scope 2 market-based accounting: Unbundled EACs vs Virtual PPA CfD hedge',
    description: 'Model corporate clean electricity procurement pathways comparing unbundled EACs/RECs against Virtual Power Purchase Agreements.',
    icon: FileText,
    accent: '#16A34A',
    toolIds: ['rec-unbundled-vs-vpna-procurement-sizer'],
  },
  {
    id: 'csrd-esg',
    title: 'ESG Climate Disclosures & CSRD Metrics',
    tagline: 'CSRD ESRS E1 carbon intensity (tCO2e/$M), SBTi 1.5°C & EU Taxonomy CapEx',
    description: 'Score enterprise readiness under European Corporate Sustainability Due Diligence, calculating revenue carbon intensity and SBTi trajectory.',
    icon: BarChart3,
    accent: '#16A34A',
    toolIds: ['csrd-esrs-e1-climate-disclosure-score-sizer'],
  },
]

export function findGreenSubcategory(id: string): GreenSubcategory | undefined {
  return greenSubcategories.find((s) => s.id === id)
}

export const GREEN_ENERGY_TOOLS: Tool[] = greenEnergySpecs.map((spec) => {
  const sub = greenSubcategories.find((s) => s.toolIds.includes(spec.id))
  return {
    id: spec.id,
    name: spec.name,
    categoryId: GREEN_ENERGY_CATEGORY,
    category: GREEN_ENERGY_CATEGORY_NAME,
    description: spec.blurb,
    keywords: [
      'green',
      'clean energy',
      'solar',
      'climate',
      'sustainability',
      ...(sub ? [sub.id, sub.title.toLowerCase()] : []),
      ...spec.name.toLowerCase().split(/\s+/),
    ],
    path: `/green-energy/${sub?.id ?? 'general'}/${spec.id}`,
    icon: 'Leaf',
    subcategory: spec.subject,
  }
})
