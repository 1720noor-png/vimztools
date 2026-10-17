import {
  asStr,
  n,
  pctres,
  res,
  txt,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Readability & Clear Communication'

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (w.length <= 3) return 1
  const clean = w.replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '')
  const matches = clean.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

export const MOD02_SPECS: CivicSpec[] = [
  {
    id: 'flesch-kincaid-reading-grade-sizer',
    name: 'Flesch-Kincaid & Gunning Fog Readability Grade Sizer',
    subject: SUBJECT,
    blurb: 'Calculate Flesch Reading Ease score, Flesch-Kincaid US school grade level, Gunning Fog index, and average sentence length to ensure plain-language accessibility.',
    tip: 'Government agencies and healthcare communications aim for a 7th to 8th-grade reading level (Flesch score 60-70) to ensure comprehension by over 85% of the general public.',
    usage: [
      'Paste draft text or communication copy into the input box.',
      'Adjust sample text length if evaluating excerpts.',
      'Review grade levels, reading ease scores, and sentence complexity metrics.',
    ],
    method: [
      'Flesch Reading Ease = 206.835 - 1.015*(Words/Sentences) - 84.6*(Syllables/Words).',
      'Flesch-Kincaid Grade = 0.39*(Words/Sentences) + 11.8*(Syllables/Words) - 15.59.',
      'Gunning Fog Index = 0.4 * ((Words/Sentences) + 100*(Complex_Words/Words)).',
    ],
    fields: [
      txt(
        'textSample',
        'Text Passage to Analyze',
        'Clear communication helps everyone understand important information quickly and easily. When you write using plain language, your readers spend less time struggling with complicated words and more time acting on your guidance. Simple sentences and everyday vocabulary make documents accessible to everyone regardless of their reading background.',
        5,
      ),
      n('targetMaxGrade', 'Target Maximum Grade Level', 8, 4, 16, 1),
    ],
    compute: (v) => {
      const text = asStr(v, 'textSample', '').trim()

      if (!text || text.length < 10) {
        return [
          res('Readability Status', 'Please enter text to analyze', 'neutral'),
        ]
      }

      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
      const numSentences = Math.max(1, sentences.length)

      const words = text.split(/\s+/).filter((w) => w.replace(/[^a-zA-Z]/g, '').length > 0)
      const numWords = Math.max(1, words.length)

      let totalSyllables = 0
      let complexWords = 0
      for (const w of words) {
        const syl = countSyllables(w)
        totalSyllables += syl
        if (syl >= 3) complexWords++
      }

      const wordsPerSentence = numWords / numSentences
      const syllablesPerWord = totalSyllables / numWords
      const complexWordPct = (complexWords / numWords) * 100

      const readingEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord
      const fkGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59
      const gunningFog = 0.4 * (wordsPerSentence + complexWordPct)

      const clampedEase = Math.max(0, Math.min(100, Math.round(readingEase)))
      const displayGrade = Math.max(1, Math.min(18, Math.round(fkGrade * 10) / 10))

      let audience = 'Plain English (8th-9th Grade)'
      let tone: 'good' | 'warn' | 'bad' | 'neutral' = 'good'

      if (displayGrade <= 6) {
        audience = 'Conversational / Elementary (5th-6th Grade)'
        tone = 'good'
      } else if (displayGrade <= 8) {
        audience = 'Universal Accessibility (7th-8th Grade Target)'
        tone = 'good'
      } else if (displayGrade <= 12) {
        audience = 'High School Level'
        tone = 'neutral'
      } else {
        audience = 'Academic / Technical / Legal'
        tone = 'warn'
      }

      return [
        res('Flesch Reading Ease', `${clampedEase} / 100`, tone, clampedEase >= 60 ? 'Plain English comprehension' : 'Difficult / Dense prose'),
        res('Flesch-Kincaid Grade Level', `Grade ${displayGrade.toFixed(1)}`, tone, audience),
        res('Gunning Fog Index', `${gunningFog.toFixed(1)}`, 'neutral', `Years of formal education required`),
        res('Sentence Complexity', `${wordsPerSentence.toFixed(1)} words/sentence`, wordsPerSentence <= 20 ? 'good' : 'warn', `${numWords} total words across ${numSentences} sentences`),
        pctres('Plain Language Accessibility Index', `${clampedEase}% Clarity Score`, clampedEase, tone),
      ]
    },
  },
]
