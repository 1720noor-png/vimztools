const KNOWN_TITLES: Record<string, string> = {
  'career-work': 'Career & Work',
  'cooking-kitchen': 'Cooking & Kitchen',
  'home-household': 'Home & Household',
  'money-budget': 'Money & Budget',
  'study-education': 'Study & Education',
}

export function formatTitle(text: string): string {
  if (!text) return ''
  const key = text.trim().toLowerCase()
  if (KNOWN_TITLES[key]) return KNOWN_TITLES[key]
  return text
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}