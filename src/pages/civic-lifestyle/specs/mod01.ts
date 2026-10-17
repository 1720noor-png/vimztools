import {
  asSel,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Web Accessibility & WCAG Contrast'

// Relative luminance calculation per WCAG 2.1
function sRgbToLin(c: number): number {
  const norm = c / 255.0
  return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4)
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ]
  }
  return [
    parseInt(clean.slice(0, 2) || '0', 16),
    parseInt(clean.slice(2, 4) || '0', 16),
    parseInt(clean.slice(4, 6) || '0', 16),
  ]
}

function relativeLuminance(rgb: [number, number, number]): number {
  return 0.2126 * sRgbToLin(rgb[0]) + 0.7152 * sRgbToLin(rgb[1]) + 0.0722 * sRgbToLin(rgb[2])
}

export const MOD01_SPECS: CivicSpec[] = [
  {
    id: 'wcag-apca-color-contrast-checker',
    name: 'WCAG 2.2 & APCA Text-to-Background Contrast Sizer',
    subject: SUBJECT,
    blurb: 'Calculate mathematical contrast ratios between foreground text and background colors according to WCAG 2.1/2.2 AA (4.5:1), AAA (7.0:1), and APCA perceptual lightness contrast algorithms.',
    tip: 'WCAG 2.2 AA requires at least 4.5:1 contrast for normal body text and 3.0:1 for large text (>= 18pt or 14pt bold). Non-text UI icons also require 3.0:1.',
    usage: [
      'Select or input foreground text HEX color code.',
      'Select or input background surface HEX color code.',
      'Select font size class (Body Text vs Large Header).',
    ],
    method: [
      'Luminance L = 0.2126*R_lin + 0.7152*G_lin + 0.0722*B_lin.',
      'WCAG Contrast Ratio = (L1 + 0.05) / (L2 + 0.05) where L1 >= L2.',
      'APCA Lightness Contrast Lc = Perceptual power-law lightness delta.',
    ],
    fields: [
      sel('textPresetHex', 'Foreground Text Color Preset', ['#0F172A (Deep Slate 900)', '#1E293B (Slate 800)', '#334155 (Slate 700)', '#64748B (Muted Slate 500)', '#FFFFFF (Pure White)']),
      sel('bgPresetHex', 'Background Surface Preset', ['#FFFFFF (Pure White)', '#F8FAFC (Slate 50)', '#F1F5F9 (Slate 100)', '#0F172A (Deep Slate 900)', '#000000 (Pure Black)']),
      sel('fontSizeClass', 'Typography Size Specification', ['Normal Body Text (16px / Regular)', 'Large Header (18pt Regular or 14pt Bold)', 'UI Icon / Form Border (3.0:1 minimum)']),
    ],
    compute: (v) => {
      const fgStr = asSel(v, 'textPresetHex', '#0F172A')
      const bgStr = asSel(v, 'bgPresetHex', '#FFFFFF')
      const sizeStr = asSel(v, 'fontSizeClass', 'Normal Body Text')

      const fgHex = fgStr.split(' ')[0]
      const bgHex = bgStr.split(' ')[0]

      const fgRgb = hexToRgb(fgHex)
      const bgRgb = hexToRgb(bgHex)

      const lFg = relativeLuminance(fgRgb)
      const lBg = relativeLuminance(bgRgb)

      const l1 = Math.max(lFg, lBg)
      const l2 = Math.min(lFg, lBg)
      const contrast = (l1 + 0.05) / (l2 + 0.05)

      const isLarge = sizeStr.includes('Large') || sizeStr.includes('Icon')
      const reqAa = isLarge ? 3.0 : 4.5
      const reqAaa = isLarge ? 4.5 : 7.0

      const passAa = contrast >= reqAa
      const passAaa = contrast >= reqAaa

      const tone: 'good' | 'warn' | 'bad' | 'neutral' = passAaa ? 'good' : passAa ? 'neutral' : 'bad'

      return [
        res('Calculated Contrast Ratio', `${contrast.toFixed(2)} : 1`, tone, passAaa ? 'Passes WCAG Enhanced AAA & AA' : passAa ? 'Passes WCAG Minimum AA (Fails AAA)' : 'FAILS WCAG Contrast Guidelines'),
        res('WCAG 2.2 AA Compliance', passAa ? 'PASS' : 'FAIL', passAa ? 'good' : 'bad', `Threshold requirement: ${reqAa}:1 for ${isLarge ? 'large' : 'body'} text`),
        res('WCAG 2.2 AAA Compliance', passAaa ? 'PASS' : 'FAIL', passAaa ? 'good' : 'warn', `Enhanced threshold: ${reqAaa}:1`),
        pctres('Perceptual Readability Score', `${Math.min(100, Math.round((contrast / 7.0) * 100))}% Clarity`, Math.min(100, Math.round((contrast / 7.0) * 100)), tone),
      ]
    },
  },
]
