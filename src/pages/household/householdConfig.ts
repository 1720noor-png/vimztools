import {
  Sparkles,
  Shirt,
  CookingPot,
  ShoppingCart,
  PiggyBank,
  Lightbulb,
  Droplets,
  HousePlus,
  Hammer,
  Wrench,
  Sprout,
  PawPrint,
  Users,
  Package,
  Flame,
  type LucideIcon,
} from 'lucide-react'
import type { Tool } from '../../lib/catalog'
import { householdSpecs } from './specs'

export interface HouseholdSubcategory {
  id: string
  title: string
  emoji: string
  tagline: string
  description: string
  icon: LucideIcon
  bg: string
  border: string
  accent: string
  darkBg: string
  toolIds: string[]
}

export const HOUSEHOLD_CATEGORY = 'household'
export const HOUSEHOLD_CATEGORY_NAME = 'Household'

export const HOUSEHOLD_TOOLS: Tool[] = householdSpecs.map((spec) => ({
  id: spec.id,
  name: spec.name,
  categoryId: HOUSEHOLD_CATEGORY,
  category: HOUSEHOLD_CATEGORY_NAME,
  description: spec.blurb,
  keywords: [
    spec.id,
    ...spec.name.toLowerCase().split(/[\s-]+/),
    spec.sub.toLowerCase(),
    'household',
    'home',
  ],
  path: `/household/${spec.subId}/${spec.id}`,
  icon: 'Home',
  subcategory: spec.sub,
}))

const idsBySubId: Record<string, string[]> = {}
for (const spec of householdSpecs) {
  if (!idsBySubId[spec.subId]) {
    idsBySubId[spec.subId] = []
  }
  idsBySubId[spec.subId].push(spec.id)
}

export const householdSubcategories: HouseholdSubcategory[] = [
  {
    id: 'cleaning',
    title: 'Cleaning',
    emoji: '🧹',
    tagline: 'Schedules, timers & surface safety',
    description: 'Cleaning schedules, room timers, safe cleaner matching and deep-cleaning estimators.',
    icon: Sparkles,
    bg: '#ECFDF5',
    border: '#10B981',
    accent: '#10B981',
    darkBg: '#0c2b22',
    toolIds: idsBySubId['cleaning'] ?? [],
  },
  {
    id: 'laundry',
    title: 'Laundry',
    emoji: '👕',
    tagline: 'Wash loads, drying & fabric care',
    description: 'Laundry planning, load and detergent estimates, drying times, ironing heat and stains.',
    icon: Shirt,
    bg: '#E0F2FE',
    border: '#38BDF8',
    accent: '#38BDF8',
    darkBg: '#0c2233',
    toolIds: idsBySubId['laundry'] ?? [],
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    emoji: '🍳',
    tagline: 'Cooking, recipes & storage planning',
    description: 'Storage capacity, food safety timers, recipe yield calculators and cooking cost estimators.',
    icon: CookingPot,
    bg: '#FFEDD5',
    border: '#FB923C',
    accent: '#FB923C',
    darkBg: '#2f1d10',
    toolIds: idsBySubId['kitchen'] ?? [],
  },
  {
    id: 'grocery',
    title: 'Grocery',
    emoji: '🛒',
    tagline: 'Lists, costs & shopping budgets',
    description: 'Build grocery lists, estimate shopping costs, split receipts and track grocery budgets.',
    icon: ShoppingCart,
    bg: '#FEF9C3',
    border: '#EAB308',
    accent: '#EAB308',
    darkBg: '#322a0e',
    toolIds: idsBySubId['grocery'] ?? [],
  },
  {
    id: 'budget',
    title: 'Budget',
    emoji: '💰',
    tagline: 'Household cash flow & debt planning',
    description: 'Budgets, bills, cash flow, debt-to-income and savings planners for the whole home.',
    icon: PiggyBank,
    bg: '#DCFCE7',
    border: '#22C55E',
    accent: '#22C55E',
    darkBg: '#0e2a1a',
    toolIds: idsBySubId['budget'] ?? [],
  },
  {
    id: 'electricity',
    title: 'Electricity',
    emoji: '💡',
    tagline: 'Wattage, appliance load & tariffs',
    description: 'Calculate appliance wattage, peak vs off-peak costs, home load and energy efficiency.',
    icon: Lightbulb,
    bg: '#F3E8FF',
    border: '#A855F7',
    accent: '#A855F7',
    darkBg: '#241733',
    toolIds: idsBySubId['electricity'] ?? [],
  },
  {
    id: 'utilities',
    title: 'Utilities',
    emoji: '🚰',
    tagline: 'Water, gas, LPG & internet bills',
    description: 'Track water usage, gas cylinder lifespan, internet data consumption and utility budgets.',
    icon: Droplets,
    bg: '#E0F2FE',
    border: '#06B6D4',
    accent: '#06B6D4',
    darkBg: '#08262e',
    toolIds: idsBySubId['utilities'] ?? [],
  },
  {
    id: 'home-planning',
    title: 'Home Planning',
    emoji: '🏡',
    tagline: 'Room space, furniture & lighting',
    description: 'Furniture placement, walking space clearance, lighting requirements and room decor planning.',
    icon: HousePlus,
    bg: '#F5F5DC',
    border: '#D4A373',
    accent: '#D4A373',
    darkBg: '#2b2617',
    toolIds: idsBySubId['home-planning'] ?? [],
  },
  {
    id: 'diy',
    title: 'DIY',
    emoji: '🔨',
    tagline: 'Wood, paint, concrete & projects',
    description: 'Material calculators for lumber, drywall, paint, concrete, screws and DIY project timelines.',
    icon: Hammer,
    bg: '#FFEDD5',
    border: '#F97316',
    accent: '#F97316',
    darkBg: '#2f1c10',
    toolIds: idsBySubId['diy'] ?? [],
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    emoji: '🔧',
    tagline: 'Filters, appliances & inspections',
    description: 'Track appliance service dates, HVAC filter swaps, roof maintenance and warranty schedules.',
    icon: Wrench,
    bg: '#F1F5F9',
    border: '#64748B',
    accent: '#64748B',
    darkBg: '#1b2432',
    toolIds: idsBySubId['maintenance'] ?? [],
  },
  {
    id: 'gardening',
    title: 'Gardening',
    emoji: '🌱',
    tagline: 'Plant care, watering & soil prep',
    description: 'Watering calculators, drip irrigation sizing, soil amendments, pot sizes and planting schedules.',
    icon: Sprout,
    bg: '#DCFCE7',
    border: '#16A34A',
    accent: '#16A34A',
    darkBg: '#0e2718',
    toolIds: idsBySubId['gardening'] ?? [],
  },
  {
    id: 'pets',
    title: 'Pets',
    emoji: '🐾',
    tagline: 'Feeding, health, vaccines & routines',
    description: 'Pet food portions, age conversion, vaccination and grooming schedules, plus new pet preparation.',
    icon: PawPrint,
    bg: '#FDF2F8',
    border: '#F472B6',
    accent: '#F472B6',
    darkBg: '#331b2a',
    toolIds: idsBySubId['pets'] ?? [],
  },
  {
    id: 'family',
    title: 'Family',
    emoji: '👨‍👩‍👧',
    tagline: 'Chores, schedules, routines & parties',
    description: 'Family chore rotas, daily routines, screen time limits, party budgets and emergency contact sheets.',
    icon: Users,
    bg: '#FAF5FF',
    border: '#C084FC',
    accent: '#C084FC',
    darkBg: '#291d3a',
    toolIds: idsBySubId['family'] ?? [],
  },
  {
    id: 'moving',
    title: 'Moving',
    emoji: '📦',
    tagline: 'Boxes, truck sizing & relocation checklists',
    description: 'Moving cost and truck size calculators, box counts, room-by-room packing and relocation timelines.',
    icon: Package,
    bg: '#FFEDD5',
    border: '#E11D48',
    accent: '#E11D48',
    darkBg: '#33111f',
    toolIds: idsBySubId['moving'] ?? [],
  },
  {
    id: 'safety',
    title: 'Safety',
    emoji: '🔥',
    tagline: 'Emergency kits, fire plans & readiness',
    description: 'Home emergency kits, smoke alarm testing, water storage calculators and home safety inspections.',
    icon: Flame,
    bg: '#FEE2E2',
    border: '#EF4444',
    accent: '#EF4444',
    darkBg: '#331313',
    toolIds: idsBySubId['safety'] ?? [],
  },
]

export function findHouseholdSubcategory(subId: string): HouseholdSubcategory | undefined {
  return householdSubcategories.find((s) => s.id === subId)
}

export const HOUSEHOLD_TOTAL_FOLDERS = householdSubcategories.length
export const HOUSEHOLD_TOTAL_TOOLS = householdSubcategories.reduce((sum, s) => sum + s.toolIds.length, 0)