export const folderAccent: Record<string, string> = {
  'money-budget': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'home-household': 'text-sky-600 bg-sky-50 border-sky-200',
  'cooking-kitchen': 'text-orange-600 bg-orange-50 border-orange-200',
  'study-education': 'text-violet-600 bg-violet-50 border-violet-200',
  'career-work': 'text-rose-600 bg-rose-50 border-rose-200',
  fitness: 'text-lime-600 bg-lime-50 border-lime-200',
  'household-life': 'text-teal-600 bg-teal-50 border-teal-200',
  'beauty-care': 'text-pink-600 bg-pink-50 border-pink-200',
  'femhealth-pmos': 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
  'office-utilities': 'text-cyan-600 bg-cyan-50 border-cyan-200',
  'student-tools': 'text-violet-600 bg-violet-50 border-violet-200',
}

export const folderAccentTone = (id: string): string =>
  folderAccent[id] ?? 'text-primary-600 bg-primary-50 border-primary-200'