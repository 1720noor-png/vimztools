import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BookOpen,
  ChevronsUp,
  Coffee,
  Droplets,
  Eye,
  Flower2,
  Grid,
  Layers,
  Monitor,
  Moon,
  Package,
  PaintBucket,
  Ruler,
  ShieldCheck,
  Sun,
  Utensils,
  Volume2,
  Wind,
  Zap,
} from 'lucide-react'
import type { Tool } from '../../lib/catalog'
import { civicSpecs } from './specs'

export interface CivicSubcategory {
  id: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: string
  toolIds: string[]
}

export const CIVIC_CATEGORY = 'civic-lifestyle'
export const CIVIC_CATEGORY_NAME = 'Everyday Utilities & Accessibility'

export const civicSubcategories: CivicSubcategory[] = [
  {
    id: 'wcag-contrast',
    title: 'Web Accessibility & WCAG Contrast',
    tagline: 'WCAG 2.2 AA (4.5:1), AAA (7.0:1) & APCA perceptual color contrast sizer',
    description: 'Calculate mathematical contrast ratios between foreground text and background colors according to WCAG 2.1/2.2 standards.',
    icon: Eye,
    accent: '#7C3AED',
    toolIds: ['wcag-apca-color-contrast-checker'],
  },
  {
    id: 'readability-grade',
    title: 'Readability & Clear Communication',
    tagline: 'Flesch Reading Ease, Flesch-Kincaid school grade level & Gunning Fog',
    description: 'Calculate reading ease scores, grade levels, and sentence complexity metrics to ensure plain-language accessibility.',
    icon: BookOpen,
    accent: '#7C3AED',
    toolIds: ['flesch-kincaid-reading-grade-sizer'],
  },
  {
    id: 'ergonomic-desk',
    title: 'Workplace Ergonomics & Posture',
    tagline: 'Standing desk, chair pan height, elbow angle & monitor eye level sizer',
    description: 'Calculate precise anatomical heights for office chairs, seated desks, standing desks, and monitors based on BIFMA standards.',
    icon: Monitor,
    accent: '#7C3AED',
    toolIds: ['ergonomic-desk-chair-monitor-height-sizer'],
  },
  {
    id: 'solar-noon',
    title: 'Solar Angles & Heliophysics',
    tagline: 'Local solar noon meridian transit, peak altitude angle & day length sizer',
    description: 'Calculate exact local solar noon transit time, peak solar elevation angle, zenith angle, and daylight hours from latitude.',
    icon: Sun,
    accent: '#7C3AED',
    toolIds: ['solar-noon-zenith-angle-calculator'],
  },
  {
    id: 'noise-decibel',
    title: 'Acoustics & Hearing Conservation',
    tagline: 'dBA sound pressure dose, safe exposure limits & NIOSH/OSHA halving rates',
    description: 'Calculate maximum permissible daily acoustic sound exposure time before risk of permanent noise-induced sensorineural hearing loss.',
    icon: Volume2,
    accent: '#7C3AED',
    toolIds: ['decibel-sound-exposure-hearing-dosimeter'],
  },
  {
    id: 'sleep-cycles',
    title: 'Sleep Architecture & Circadian Rhythm',
    tagline: 'Ultradian 90-minute complete cycles (N1-N3, REM) & sleep inertia prevention',
    description: 'Calculate optimal bedtime or wake-up times synchronized with complete 90-minute sleep cycles to wake up refreshed.',
    icon: Moon,
    accent: '#7C3AED',
    toolIds: ['sleep-cycle-90min-alarm-calculator'],
  },
  {
    id: 'plumbing-hydraulics',
    title: 'Plumbing Hydraulics & Flow Rate',
    tagline: 'Hazen-Williams pipe friction head loss, fixture GPM & dynamic PSI sizer',
    description: 'Calculate residential fixture flow rates, pipe friction head loss, and dynamic water pressure at simultaneous demand fixtures.',
    icon: Droplets,
    accent: '#7C3AED',
    toolIds: ['plumbing-fixture-flow-rate-pressure-drop-sizer'],
  },
  {
    id: 'paint-coverage',
    title: 'Home Improvement & Paint Coverage',
    tagline: 'Multi-coat wall paint gallons, door/window deductions & drywall texture',
    description: 'Calculate exact paint volume in gallons, liters, and quarts required for multi-coat architectural painting projects.',
    icon: PaintBucket,
    accent: '#7C3AED',
    toolIds: ['architectural-paint-coverage-gallons-sizer'],
  },
  {
    id: 'flooring-tile',
    title: 'Flooring & Tile Estimation',
    tagline: 'Square footage, box packaging counts & 10-15% cut pattern waste sizer',
    description: 'Calculate exact tile counts, retail boxes required, square footage coverage, and cut waste buffers for tile layouts.',
    icon: Grid,
    accent: '#7C3AED',
    toolIds: ['floor-wall-tile-quantity-waste-sizer'],
  },
  {
    id: 'concrete-volume',
    title: 'Masonry & Concrete Volume',
    tagline: 'Cubic yards (yd³), 80-lb / 60-lb pre-mix bags & slab dead load weight',
    description: 'Calculate wet concrete volume in cubic yards and meters, required pre-mix bags, and water mixing ratios for slabs.',
    icon: Layers,
    accent: '#7C3AED',
    toolIds: ['concrete-slab-volume-bags-sizer'],
  },
  {
    id: 'garden-soil',
    title: 'Gardening & Soil Science',
    tagline: 'Raised bed soil volume, Mel\'s Mix 3-way potting ratios & compost sizer',
    description: 'Calculate soil volume in cubic feet and bulk cubic yards, 3-way potting mix ratios, and retail bag counts for garden beds.',
    icon: Flower2,
    accent: '#7C3AED',
    toolIds: ['raised-garden-bed-soil-compost-sizer'],
  },
  {
    id: 'lumber-takeoff',
    title: 'Carpentry & Lumber Takeoff',
    tagline: 'Board feet (FBM), nominal vs actual dimensions & linear footage estimator',
    description: 'Calculate lumber board feet (FBM), total linear footage, board pricing, and framing takeoff quantities.',
    icon: Ruler,
    accent: '#7C3AED',
    toolIds: ['lumber-board-feet-framing-sizer'],
  },
  {
    id: 'wire-gauge',
    title: 'Electrical Engineering & Wire Sizing',
    tagline: 'AWG copper gauge, continuous ampacity & NEC 3% voltage drop sizer',
    description: 'Size American Wire Gauge copper conductors, branch circuit breaker ampacity, and calculate percentage voltage drop over long runs.',
    icon: Zap,
    accent: '#7C3AED',
    toolIds: ['electrical-wire-gauge-voltage-drop-sizer'],
  },
  {
    id: 'hvac-filtration',
    title: 'Indoor Air Quality & HVAC Filtration',
    tagline: 'MERV 8-16 PM2.5 filtration efficiency vs blower static pressure drop',
    description: 'Compare particulate filtration efficiency against blower motor external static pressure drop across MERV filters.',
    icon: Wind,
    accent: '#7C3AED',
    toolIds: ['hvac-air-filter-merv-static-pressure-sizer'],
  },
  {
    id: 'baking-hydration',
    title: 'Artisan Baking & Baker’s Percentages',
    tagline: 'True baker\'s percentages, sourdough levain hydration & salt salinity sizer',
    description: 'Scale artisanal bread dough recipes using true baker’s percentages, factoring in levain hydration and salt percentages.',
    icon: Utensils,
    accent: '#7C3AED',
    toolIds: ['sourdough-bakers-hydration-percentage-sizer'],
  },
  {
    id: 'coffee-science',
    title: 'Coffee Science & Extraction Yield',
    tagline: 'SCA Golden Cup brew ratio, beverage TDS % & extraction yield sizer',
    description: 'Calculate water-to-coffee brew ratios (1:15 to 1:18), Total Dissolved Solids, and extraction yield percentages.',
    icon: Coffee,
    accent: '#7C3AED',
    toolIds: ['specialty-coffee-brew-ratio-tds-sizer'],
  },
  {
    id: 'cold-chain',
    title: 'Thermodynamics & Cold Chain Packaging',
    tagline: 'Dry ice sublimation rate (lbs/hr) & insulated cooler transit hold time',
    description: 'Calculate dry ice sublimation loss and required refrigerant mass to keep frozen biologics or foods cold during transit.',
    icon: Package,
    accent: '#7C3AED',
    toolIds: ['dry-ice-sublimation-cold-chain-sizer'],
  },
  {
    id: 'stair-framing',
    title: 'Stairway Carpentry & Building Codes',
    tagline: 'IRC R311.7 riser/tread compliance, Blondel comfort index & stringer cut',
    description: 'Calculate exact unit rise, unit run, total stair tread steps, stringer throat depth, and stringer length complying with IRC codes.',
    icon: ChevronsUp,
    accent: '#7C3AED',
    toolIds: ['staircase-stringer-rise-run-irc-sizer'],
  },
  {
    id: 'emergency-power',
    title: 'Emergency Preparedness & Generator Sizing',
    tagline: 'Continuous running watts, inductive motor starting surge & inlet sizing',
    description: 'Calculate required generator continuous running wattage and motor starting surge wattage for critical household appliances.',
    icon: ShieldCheck,
    accent: '#7C3AED',
    toolIds: ['backup-generator-running-surge-wattage-sizer'],
  },
  {
    id: 'appliance-energy',
    title: 'Energy Efficiency & Appliance Economics',
    tagline: 'Monthly operating kWh, phantom standby vampire drain & 10-year cost sizer',
    description: 'Calculate hourly, monthly, and annual electric utility operating costs and phantom standby vampire draw across home appliances.',
    icon: Activity,
    accent: '#7C3AED',
    toolIds: ['appliance-annual-electricity-cost-sizer'],
  },
]

export function findCivicSubcategory(id: string): CivicSubcategory | undefined {
  return civicSubcategories.find((s) => s.id === id)
}

export const CIVIC_TOOLS: Tool[] = civicSpecs.map((spec) => {
  const sub = civicSubcategories.find((s) => s.toolIds.includes(spec.id))
  return {
    id: spec.id,
    name: spec.name,
    categoryId: CIVIC_CATEGORY,
    category: CIVIC_CATEGORY_NAME,
    description: spec.blurb,
    keywords: [
      'utility',
      'lifestyle',
      'accessibility',
      'everyday',
      'calculator',
      ...(sub ? [sub.id, sub.title.toLowerCase()] : []),
      ...spec.name.toLowerCase().split(/\s+/),
    ],
    path: `/civic-lifestyle/${sub?.id ?? 'general'}/${spec.id}`,
    icon: 'Activity',
    subcategory: spec.subject,
  }
})
