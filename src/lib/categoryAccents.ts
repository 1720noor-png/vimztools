import {
  FileText,
  GraduationCap,
  TrendingUp,
  HeartPulse,
  Home as HomeIcon,
  Images,
  Building2,
  Newspaper,
  Flower2,
  Boxes,
  FilePlus2,
  Sparkles,
  Terminal,
  ShieldAlert,
  Leaf,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ExactCategory {
  name: string
  path: string
  icon: LucideIcon
  bg: string
  bgDark: string
  accent: string
}

/**
 * Tier 1: Main Category Cards displayed on the homepage / main portal view
 * strictly complying with the Pastel Color Matrix (Directive 3 & 6):
 * - Health: Soft Rose (#FFE4E6 / #F43F5E)
 * - Household: Soft Warm Amber (#FEF3C7 / #F59E0B)
 * - Image Tools: Creative Sky Blue (#E0F2FE / #0EA5E9)
 * - Students & Academics: Clean Indigo (#EEF2FF / #4F46E5)
 * - SEO & Marketers: Slate Blue / Indigo Accent (#E0E7FF / #6366F1)
 * - PDF Utilities: Ice Blue (#F0F9FF / #0284C7)
 */
export const exactCategories: ExactCategory[] = [
  {
    name: 'Health',
    path: '/health',
    icon: HeartPulse,
    bg: '#FFE4E6',
    bgDark: '#3b1f24',
    accent: '#F43F5E',
  },
  {
    name: 'Household',
    path: '/household',
    icon: HomeIcon,
    bg: '#FEF3C7',
    bgDark: '#332a15',
    accent: '#F59E0B',
  },
  {
    name: 'Image Tools',
    path: '/image-tools',
    icon: Images,
    bg: '#E0F2FE',
    bgDark: '#0b2733',
    accent: '#0EA5E9',
  },
  {
    name: 'Students & Academics',
    path: '/students-academics',
    icon: GraduationCap,
    bg: '#EEF2FF',
    bgDark: '#1e1b4b',
    accent: '#4F46E5',
  },
  {
    name: 'SEO & Marketers',
    path: '/marketers-seo',
    icon: TrendingUp,
    bg: '#E0E7FF',
    bgDark: '#1c2242',
    accent: '#6366F1',
  },
  {
    name: 'Office & Corporate Utilities',
    path: '/office-corporate',
    icon: Building2,
    bg: '#ECFDF5',
    bgDark: '#14352a',
    accent: '#10B981',
  },
  {
    name: 'PDF Utilities',
    path: '/tools/pdf',
    icon: FileText,
    bg: '#F0F9FF',
    bgDark: '#0c2738',
    accent: '#0284C7',
  },
  {
    name: 'MS Word & Document Suite',
    path: '/tools/document-word',
    icon: FileText,
    bg: '#EFF6FF',
    bgDark: '#172554',
    accent: '#2563EB',
  },
  {
    name: 'AI & Machine Learning',
    path: '/ai-tools',
    icon: Sparkles,
    bg: '#F5F3FF',
    bgDark: '#1e1b4b',
    accent: '#8B5CF6',
  },
  {
    name: 'Developer & Cloud Suite',
    path: '/dev-cloud',
    icon: Terminal,
    bg: '#ECFEFF',
    bgDark: '#083344',
    accent: '#06B6D4',
  },
  {
    name: 'Cybersecurity, Privacy & Cryptography',
    path: '/cyber-security',
    icon: ShieldAlert,
    bg: '#FEF2F2',
    bgDark: '#450a0a',
    accent: '#EF4444',
  },
  {
    name: 'Sustainable Energy & Climate Tech',
    path: '/green-energy',
    icon: Leaf,
    bg: '#F0FDF4',
    bgDark: '#052e16',
    accent: '#16A34A',
  },
  {
    name: 'Fintech & Venture Economics',
    path: '/fintech-venture',
    icon: TrendingUp,
    bg: '#F0FDF4',
    bgDark: '#022c22',
    accent: '#0D9488',
  },
  {
    name: 'Everyday Utilities & Accessibility',
    path: '/civic-lifestyle',
    icon: Sparkles,
    bg: '#F5F3FF',
    bgDark: '#2e1065',
    accent: '#7C3AED',
  },
]

export const extendedCategoryAccents: ExactCategory[] = [
  ...exactCategories,
  {
    name: 'Blogs',
    path: '/blogs',
    icon: Newspaper,
    bg: '#FEF3C7',
    bgDark: '#3a3220',
    accent: '#F59E0B',
  },
  {
    name: 'Women',
    path: '/women',
    icon: Flower2,
    bg: '#FDF2F8',
    bgDark: '#3a2133',
    accent: '#F472B6',
  },
  {
    name: 'Office Utilities',
    path: '/tools/office-utilities',
    icon: Boxes,
    bg: '#EEF2FF',
    bgDark: '#262c49',
    accent: '#6366F1',
  },
  {
    name: 'Document Generators',
    path: '/tools/documents',
    icon: FilePlus2,
    bg: '#F0FDFA',
    bgDark: '#16302c',
    accent: '#14B8A6',
  },
  {
    name: 'Student Tools',
    path: '/students',
    icon: GraduationCap,
    bg: '#F3E8FF',
    bgDark: '#2c2140',
    accent: '#A855F7',
  },
  {
    name: 'Fitness & Health Goals',
    path: '/tools/fitness',
    icon: HeartPulse,
    bg: '#F7FEE7',
    bgDark: '#27380f',
    accent: '#84CC16',
  },
  {
    name: 'Cooking & Kitchen',
    path: '/tools/cooking-kitchen',
    icon: HomeIcon,
    bg: '#FFF7ED',
    bgDark: '#382313',
    accent: '#F97316',
  },
  {
    name: 'Money & Budget',
    path: '/tools/money-budget',
    icon: TrendingUp,
    bg: '#F0FDF4',
    bgDark: '#123320',
    accent: '#22C55E',
  },
  {
    name: 'Beauty & Skincare',
    path: '/tools/beauty-care',
    icon: Sparkles,
    bg: '#FDF4FF',
    bgDark: '#341938',
    accent: '#D946EF',
  },
  {
    name: 'Career & Work',
    path: '/tools/career-work',
    icon: Building2,
    bg: '#FFF1F2',
    bgDark: '#381c24',
    accent: '#E11D48',
  },
  {
    name: 'FemHealth & PMOS',
    path: '/tools/femhealth-pmos',
    icon: Flower2,
    bg: '#FDF2F8',
    bgDark: '#3a1f33',
    accent: '#E879F9',
  },
  {
    name: 'Home & Household',
    path: '/tools/home-household',
    icon: HomeIcon,
    bg: '#FEF3C7',
    bgDark: '#332a15',
    accent: '#F59E0B',
  },
  {
    name: 'Household & Life',
    path: '/tools/household-life',
    icon: HomeIcon,
    bg: '#F0FDFA',
    bgDark: '#16302c',
    accent: '#14B8A6',
  },
  {
    name: 'Study & Education',
    path: '/tools/study-education',
    icon: GraduationCap,
    bg: '#F3E8FF',
    bgDark: '#2c2140',
    accent: '#A855F7',
  },
  {
    name: 'Health & Life',
    path: '/tools/life',
    icon: HeartPulse,
    bg: '#FFF1F2',
    bgDark: '#361c22',
    accent: '#FB7185',
  },
]

export const DEFAULT_CATEGORY_ACCENT: ExactCategory = {
  name: 'Utilities',
  path: '/tools',
  icon: Boxes,
  bg: '#EEF2FF',
  bgDark: '#1e1b4b',
  accent: '#6366F1',
}

/**
 * Robust accent resolver that matches paths, prefixes, category slugs, and tool IDs
 */
export function getCategoryAccent(path?: string): ExactCategory | undefined {
  if (!path) return undefined
  const clean = path.trim().replace(/\/+$/, '')

  // 1. Direct exact match
  const exact = extendedCategoryAccents.find((c) => c.path === clean)
  if (exact) return exact

  // 2. Subpath match (e.g. /image-tools/crop-resize -> /image-tools)
  const sub = extendedCategoryAccents.find((c) => clean.startsWith(c.path + '/'))
  if (sub) return sub

  // 3. /tools/xxx handling
  if (clean.startsWith('/tools/')) {
    const rest = clean.slice('/tools/'.length)
    const catSegment = rest.split('/')[0]

    // Check /catSegment (e.g. /health, /image-tools, /students-academics)
    const directRoot = extendedCategoryAccents.find((c) => c.path === `/${catSegment}`)
    if (directRoot) return directRoot

    // Check alias mappings
    if (catSegment === 'image' || catSegment === 'image-tools') {
      return extendedCategoryAccents.find((c) => c.path === '/image-tools')
    }
    if (catSegment === 'health') {
      return extendedCategoryAccents.find((c) => c.path === '/health')
    }
    if (catSegment === 'household') {
      return extendedCategoryAccents.find((c) => c.path === '/household')
    }
    if (catSegment.includes('student') || catSegment.includes('academic') || catSegment.includes('study')) {
      return extendedCategoryAccents.find((c) => c.path === '/students-academics')
    }
    if (catSegment.includes('market') || catSegment.includes('seo')) {
      return extendedCategoryAccents.find((c) => c.path === '/marketers-seo')
    }
    if (catSegment.includes('office') || catSegment.includes('corporate')) {
      return extendedCategoryAccents.find((c) => c.path === '/office-corporate')
    }
    if (catSegment === 'word' || catSegment === 'document-word') {
      return extendedCategoryAccents.find((c) => c.path === '/tools/document-word')
    }
    if (catSegment === 'pdf') {
      return extendedCategoryAccents.find((c) => c.path === '/tools/pdf')
    }
  }

  // 4. Naked category slug matching (e.g. "health", "image-tools", "pdf")
  const slug = clean.replace(/^\//, '').split('/')[0]
  if (slug === 'health') return extendedCategoryAccents.find((c) => c.path === '/health')
  if (slug === 'image-tools' || slug === 'image') return extendedCategoryAccents.find((c) => c.path === '/image-tools')
  if (slug === 'household') return extendedCategoryAccents.find((c) => c.path === '/household')
  if (slug.includes('student') || slug.includes('academic')) return extendedCategoryAccents.find((c) => c.path === '/students-academics')
  if (slug.includes('market') || slug.includes('seo')) return extendedCategoryAccents.find((c) => c.path === '/marketers-seo')
  if (slug.includes('office') || slug.includes('corporate')) return extendedCategoryAccents.find((c) => c.path === '/office-corporate')
  if (slug === 'pdf') return extendedCategoryAccents.find((c) => c.path === '/tools/pdf')
  if (slug === 'blogs' || slug === 'blog') return extendedCategoryAccents.find((c) => c.path === '/blogs')

  return undefined
}