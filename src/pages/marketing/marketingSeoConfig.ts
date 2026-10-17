import { marketingSeoSpecs } from './specs'
import type { Tool } from '../../lib/catalog'

export const MARKETING_CATEGORY = 'marketers-seo'
export const MARKETING_CATEGORY_NAME = 'Marketers & SEO Specialists'

function deriveKeywords(name: string): string[] {
  const words = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
  const base = inferKeywords(name)
  return Array.from(new Set([...words, ...base])).slice(0, 12)
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'of', 'to', 'a', 'an', 'in', 'on', 'with', 'by', 'from',
  'vs', 'or', 'at', 'as', 'per', 'net', 'pay', 'tool', 'tools', 'your', 'you',
  'it', 'is', 'are', 'for', 'this', 'that',
])

function inferKeywords(name: string): string[] {
  const lower = name.toLowerCase()
  const out: string[] = []
  const matchers: Array<[RegExp, string]> = [
    [/keyword/i, 'keyword research'],
    [/difficulty/i, 'keyword difficulty'],
    [/backlink/i, 'backlinks'],
    [/link building/i, 'link building'],
    [/outreach/i, 'outreach'],
    [/local/i, 'local seo'],
    [/schema/i, 'schema markup'],
    [/review/i, 'reviews'],
    [/email/i, 'email marketing'],
    [/subject line|subject/i, 'email subject'],
    [/cta/i, 'cta'],
    [/conversion/i, 'conversion'],
    [/landing page/i, 'landing page'],
    [/meta description/i, 'meta description'],
    [/meta title|title tag/i, 'meta title'],
    [/sitemap/i, 'sitemap'],
    [/robots/i, 'robots.txt'],
    [/hreflang/i, 'hreflang'],
    [/youtube/i, 'youtube'],
    [/video/i, 'video marketing'],
    [/influencer/i, 'influencer marketing'],
    [/affiliate/i, 'affiliate marketing'],
    [/app store|aso|app /i, 'app store optimization'],
    [/roi/i, 'roi'],
    [/roas/i, 'roas'],
    [/cac|acquisition cost/i, 'cac'],
    [/ltv|lifetime value/i, 'ltv'],
    [/cpl/i, 'cost per lead'],
    [/cpa/i, 'cost per acquisition'],
    [/cpm/i, 'cost per mille'],
    [/cpc/i, 'cost per click'],
    [/ctr|click through/i, 'ctr'],
    [/press release/i, 'press release'],
    [/pitch/i, 'media pitch'],
    [/persona/i, 'persona'],
    [/swot/i, 'swot'],
    [/calendar/i, 'content calendar'],
    [/funnel/i, 'marketing funnel'],
    [/nps/i, 'nps'],
    [/csat|satisfaction/i, 'csat'],
    [/churn/i, 'churn'],
    [/retention/i, 'retention'],
    [/testimonial/i, 'testimonial'],
    [/slogan|tagline/i, 'slogan'],
    [/brand name|business name/i, 'brand name'],
    [/mission/i, 'mission'],
    [/value proposition|usp/i, 'value proposition'],
    [/competitor/i, 'competitor analysis'],
    [/serp/i, 'serp'],
  ]
  for (const [re, tag] of matchers) {
    if (re.test(lower) && !out.includes(tag)) out.push(tag)
  }
  return out
}

export const MARKETING_SEO_TOOLS: Tool[] = marketingSeoSpecs.map((spec) => ({
  id: spec.id,
  name: spec.name,
  categoryId: MARKETING_CATEGORY,
  category: MARKETING_CATEGORY_NAME,
  description: spec.blurb,
  keywords: deriveKeywords(spec.name),
  path: `/tools/${MARKETING_CATEGORY}/${spec.id}`,
  icon: 'Megaphone',
  subcategory: spec.subject,
}))

export const MARKETING_SEO_TOTAL_TOOLS = MARKETING_SEO_TOOLS.length

export function marketingSeoToolCount(subject: string): number {
  return MARKETING_SEO_TOOLS.filter((t) => t.subcategory === subject).length
}