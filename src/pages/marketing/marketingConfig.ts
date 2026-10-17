import {
  Search,
  PenLine,
  Share2,
  Target,
  TrendingUp,
  Link2,
  MapPin,
  ShoppingCart,
  Mail,
  Funnel,
  FileSearch,
  FileText,
  Users,
  Play,
  Smartphone,
  Calculator,
  ClipboardList,
  Star,
  Sparkles,
  MessageSquare,
  Newspaper,
  Crosshair,
  type LucideIcon,
} from 'lucide-react'
import { tools, type Tool } from '../../lib/catalog'

export interface MarketingSubcategory {
  id: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: string
}

export const MARKETING_CATEGORY = 'marketers-seo'

export const marketingSubcategories: MarketingSubcategory[] = [
  {
    id: 'seo',
    title: 'Search Engine Optimization (SEO) Tools',
    tagline: 'Technical, on-page & link SEO audits and generators',
    description:
      'Structured data, internal link equity, redirects, anchor text, hreflang, robots and sitemaps, Core Web Vitals, SERP widths, headings and Knowledge Graph entities.',
    icon: Search,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'content',
    title: 'Content Marketing & Copywriting Helpers',
    tagline: 'Frameworks, audits, tone & CTAs for content teams',
    description:
      'AIDA and PAS copy, email subject line testing, content decay and topic clusters, persona alignment, tone of voice, sentence density and CTA generators.',
    icon: PenLine,
    accent: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    id: 'smm',
    title: 'Social Media Marketing (SMM) Utilities',
    tagline: 'Posting times, grids, captions, calendars & hooks',
    description:
      'Optimal posting windows, profile grid planning, emoji sentiment, character limits, short-form hooks, winner picking, calendars, bio pages and carousels.',
    icon: Share2,
    accent: 'text-violet-600 bg-violet-50 border-violet-200',
  },
  {
    id: 'paid-ads',
    title: 'Paid Ads & Campaign Calculators',
    tagline: 'CAC, LTV, ROAS, budgets & ad fatigue math',
    description:
      'CAC and LTV, LTV:CAC, break-even ROAS, PPC budgets, ad fatigue caps, target CPL, ROAS vs margin and ad copy character previews.',
    icon: Target,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'analytics',
    title: 'Analytics, Growth & URL Utilities',
    tagline: 'Retention, testing, funnels, UTMs & event naming',
    description:
      'Cohort retention and churn, A/B significance, bounce vs exit, UTM links, funnel drop-off, organic vs paid ROI, GA4 event names and referral rewards.',
    icon: TrendingUp,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'keyword-content',
    title: 'Keyword & Content Research',
    tagline: 'Discovery, intent, clustering & content gap mining',
    description:
      'Keyword research and long-tails, difficulty and intent classification, clustering and grouping, LSI and related keywords, content gaps, topic clusters, ideas and question keywords — plus Google Suggest extraction and cannibalization checks.',
    icon: Search,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'link-building',
    title: 'Link Building & Outreach',
    tagline: 'Backlink audit, anchors, broken link funnels & outreach',
    description:
      'Backlink checkers and quality scoring, opportunity finders, broken link harvesting, anchor text strategy and distribution, internal link suggestions, link reclamation, guest post and outreach email generators, competitor backlink analysis and exchange-risk checks.',
    icon: Link2,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'local-seo',
    title: 'Local SEO',
    tagline: 'Google Business Profile, citations, reviews & local pages',
    description:
      'Local SEO audits, Google Business Profile descriptions, local keywords and ranking checks, NAP and citation consistency, LocalBusiness schema, review and request messages, local and service-area landing pages and local FAQ generators.',
    icon: MapPin,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Marketing',
    tagline: 'Product copy, titles, schemas, ads & review replies',
    description:
      'Product descriptions and titles, product SEO and keyword generators, meta descriptions, category copy, comparison content, review responses, shopping ad copy, Product schema, e-commerce FAQs and image alt text generators.',
    icon: ShoppingCart,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'email-marketing',
    title: 'Email Marketing',
    tagline: 'Subject lines, copy, workflows & spam checks',
    description:
      'Subject line and copy generators, cold and newsletter emails, welcome and follow-up flows, abandoned cart and promotional emails, CTAs, previews, length scoring, spam word checks and signature builders.',
    icon: Mail,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'conversion-cro',
    title: 'Conversion & CRO',
    tagline: 'Landing pages, CTAs, A/B testing & funnel math',
    description:
      'Conversion-rate calculators, landing page analyzers, CTA generators and strength checks, headline generators, A/B test and sample-size math, form and checkout and lead funnel conversions, plus value-prop and landing copy generators.',
    icon: Funnel,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'website-seo-audit',
    title: 'Website SEO Audit',
    tagline: 'Score, meta, sitemaps, schema & URL hygiene',
    description:
      'SEO score and meta-tag checks, meta title and description generators, heading and alt text audits, broken link and canonical checks, robots.txt and sitemap builders, hreflang, schema and Open Graph/Twitter card generators and URL structure analysis.',
    icon: FileSearch,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'on-page-seo',
    title: 'On-Page SEO',
    tagline: 'Density, placement, readability & snippet targets',
    description:
      'On-page checks for keywords, density and placement, readability scoring, content optimization, title and meta checks, H1-H6 heading analysis, internal linking, image SEO, featured snippets, FAQ schemas and friendly URL generation.',
    icon: FileText,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'influencer-affiliate',
    title: 'Influencer & Affiliate Marketing',
    tagline: 'Rates, ROI, commissions, EPC & creator briefs',
    description:
      'Influencer engagement, ROI and pricing calculators, affiliate commission, revenue, EPC and conversion math, affiliate link builders, influencer briefs and outreach generators, brand collaboration emails and affiliate content ideas.',
    icon: Users,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'youtube-video',
    title: 'YouTube & Video Marketing',
    tagline: 'Titles, tags, scripts, hooks & video math',
    description:
      'YouTube title, description, tag and hashtag generators, keyword research, thumbnail text, engagement and CPM calculators, revenue projections, video SEO scores, scripts, shorts ideas, hooks and channel-name generators.',
    icon: Play,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'app-aso',
    title: 'App Store & ASO',
    tagline: 'Keywords, ASO scores, metadata & ratings',
    description:
      'App Store keywords and ASO scores, app title, description, subtitle and keyword-density generators, rating calculators, review responses, screenshot text, category research and competitor ASO analysis.',
    icon: Smartphone,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'mk-calculators',
    title: 'Marketing Calculators',
    tagline: 'ROI, ROAS, CAC, LTV, CPM, CPC & break-even',
    description:
      'ROI and ROAS, CAC and LTV, CPL and CPA, CPM and CPC, CTR and conversion rate, break-even and budget calculators, customer acquisition cost and customer lifetime value math.',
    icon: Calculator,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'mk-strategy',
    title: 'Marketing Strategy & Planning',
    tagline: 'Plans, calendars, personas, SWOT & SMART goals',
    description:
      'Marketing plan and strategy planners, campaign and content-calendar planners, funnel planning, buyer and customer persona generators, target audience, SWOT and competitor templates, campaign briefs and SMART goal generators.',
    icon: ClipboardList,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'branding',
    title: 'Branding & Business Marketing',
    tagline: 'Names, slogans, voice, story & positioning',
    description:
      'Business and brand name generators, slogans and taglines, brand voice, story, value proposition and USP generators, missions, bios, About pages, color palettes and positioning statements.',
    icon: Star,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'ai-marketing',
    title: 'AI Marketing Tools',
    tagline: 'Prompts, briefs, ad copy & repurposing playbooks',
    description:
      'AI marketing prompt and content brief generators, ad copy, SEO content, social posts, emails, product descriptions and blog outlines for AI, content repurposing playbooks, marketing and campaign idea engines and AI persona prompts.',
    icon: Sparkles,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'customer-reputation',
    title: 'Customer & Reputation Marketing',
    tagline: 'Reviews, CSAT, NPS, churn & survey generators',
    description:
      'Customer review and feedback analysis, review responses, CSAT, NPS, retention and churn calculators, complaint response and testimonial generators, customer survey and feedback form design.',
    icon: MessageSquare,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'pr-media',
    title: 'PR & Media Marketing',
    tagline: 'Press releases, pitches, embargoes & announcements',
    description:
      'Press release and headline generators, media pitches, journalist outreach emails, PR campaign planners, media contact emails, newsworthy story ideation, and company and event announcement generators.',
    icon: Newspaper,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'competitor-research',
    title: 'Competitor Research',
    tagline: 'SEO, keywords, content gaps, backlinks & SERPs',
    description:
      'Competitor SEO, keyword and domain comparisons, content gaps, backlink comparisons, traffic estimation, ad-copy and social analysis, SERP competitor finders and competitor content idea generators.',
    icon: Crosshair,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
]

export function findMarketingSubcategory(subId: string): MarketingSubcategory | undefined {
  return marketingSubcategories.find((s) => s.id === subId)
}

export function marketingToolsFor(subId: string): Tool[] {
  const sub = findMarketingSubcategory(subId)
  if (!sub) return []
  return tools.filter((t) => t.categoryId === MARKETING_CATEGORY && t.subcategory === sub.title)
}

export function marketingToolCount(subId: string): number {
  return marketingToolsFor(subId).length
}

export const MARKETING_TOTAL_TOOLS = marketingSubcategories.reduce(
  (sum, s) => sum + marketingToolCount(s.id),
  0,
)