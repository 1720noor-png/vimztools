import { Dumbbell, HeartPulse, Sparkles, Sofa, Ribbon, ChefHat, type LucideIcon } from 'lucide-react'
import { tools, type Tool } from '../../lib/catalog'

export interface WomenSubcategory {
  id: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: string
  categoryId: string
}

export const womenSubcategories: WomenSubcategory[] = [
  {
    id: 'fitness',
    title: 'Fitness',
    tagline: 'Body composition, energy & nutrition math',
    description:
      'BMI, body fat, waist ratios, BMR/TDEE, calorie targets, macros, hydration, fasting schedules and strength potential.',
    icon: Dumbbell,
    accent: 'text-orange-600 bg-orange-50 border-orange-200',
    categoryId: 'fitness',
  },
  {
    id: 'life',
    title: 'Health & Life',
    tagline: 'Pregnancy, periods & everyday planning',
    description:
      'Due date and trimester tracking, ovulation and periods, water and calories, vaccinations and budget tracking.',
    icon: HeartPulse,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
    categoryId: 'life',
  },
  {
    id: 'beauty-care',
    title: 'Beauty & Care',
    tagline: 'Skincare, makeup, hair & fragrance',
    description:
      'Skincare routines, ingredient conflict and pore-clogging scanners, hair care advisories and perfume layering.',
    icon: Sparkles,
    accent: 'text-pink-600 bg-pink-50 border-pink-200',
    categoryId: 'beauty-care',
  },
  {
    id: 'household-life',
    title: 'Household',
    tagline: 'Laundry, cleaning, storage & home upkeep',
    description:
      'Stain removal, washing loads and drying, fabric care, plant schedules, storage planning and filter tracking.',
    icon: Sofa,
    accent: 'text-sky-600 bg-sky-50 border-sky-200',
    categoryId: 'household-life',
  },
  {
    id: 'femhealth-pmos',
    title: 'FemHealth & PMOS',
    tagline: 'PCOS, hormones & postpartum wellness',
    description:
      'Hirsutism scoring, PCOS and PMOS checks, cortisol and estrogen, diastasis recti and pelvic pain tracking.',
    icon: Ribbon,
    accent: 'text-rose-600 bg-rose-50 border-rose-200',
    categoryId: 'femhealth-pmos',
  },
  {
    id: 'cooking-kitchen',
    title: 'Cooking & Kitchen',
    tagline: 'Meal planning, portions, substitutes & conversions',
    description:
      'Timers, planners, ingredient and unit converters, portion and recipe math and substitute finders for the kitchen.',
    icon: ChefHat,
    accent: 'text-lime-600 bg-lime-50 border-lime-200',
    categoryId: 'cooking-kitchen',
  },
]

export function findWomenSubcategory(subId: string): WomenSubcategory | undefined {
  return womenSubcategories.find((s) => s.id === subId)
}

export function womenToolsFor(subId: string): Tool[] {
  const sub = findWomenSubcategory(subId)
  if (!sub) return []
  return tools.filter((t) => t.categoryId === sub.categoryId)
}

export function womenToolCount(subId: string): number {
  return womenToolsFor(subId).length
}

export const WOMEN_TOTAL_TOOLS = womenSubcategories.reduce((sum, s) => sum + womenToolCount(s.id), 0)