import {
  asNum,
  asSel,
  fmtBytes,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Digital Steganography & Watermarking'

export const MOD11_SPECS: CyberSpec[] = [
  {
    id: 'lsb-steganography-capacity-calculator',
    name: 'Least Significant Bit (LSB) Steganographic Payload Sizer',
    subject: SUBJECT,
    blurb: 'Calculate maximum payload bytes that can be concealed inside PNG / uncompressed images without causing visible pixel distortion.',
    tip: 'Modifying only the lowest 1-2 bits per color channel (R, G, B) is imperceptible to the human eye, yielding ~37.5 KB of hidden payload per Megapixel.',
    usage: [
      'Enter carrier image dimensions (width & height in pixels).',
      'Select bits embedded per color channel (1-bit safe vs 2-bit aggressive).',
      'Inspect total concealable payload capacity in KB / MB.',
    ],
    method: [
      'Capacity (Bytes) = (Width * Height * Channels * Bits_Per_Channel) / 8.',
      'Assumes 3 color channels (Red, Green, Blue) excluding Alpha.',
    ],
    fields: [
      n('width', 'Image Width (Pixels)', 1920, 100, 10000, 100),
      n('height', 'Image Height (Pixels)', 1080, 100, 10000, 100),
      sel('bitsPerChannel', 'Embedding Depth', ['1 Bit per Channel (Maximum Invisibility - Recommended)', '2 Bits per Channel (Higher Capacity, Low Artifacts)', '4 Bits per Channel (Visible Color Banding Risk)']),
    ],
    compute: (v) => {
      const w = asNum(v, 'width', 1920)
      const h = asNum(v, 'height', 1080)
      const depth = asSel(v, 'bitsPerChannel', '1 Bit')

      let bits = 1
      if (depth.startsWith('2')) bits = 2
      else if (depth.startsWith('4')) bits = 4

      const totalPixels = w * h
      const channels = 3
      const totalBitsConcealed = totalPixels * channels * bits
      const totalBytes = totalBitsConcealed / 8

      const tone = bits === 1 ? 'good' : bits === 2 ? 'warn' : 'bad'

      return [
        res('Concealable Payload Capacity', fmtBytes(totalBytes), 'good', `Across ${fmtNum(totalPixels)} pixels`),
        res('Visual Steganographic Risk', bits === 1 ? 'Zero Perceptible Artifacts' : bits === 2 ? 'Subtle Noise in Flat Colors' : 'Noticeable Color Distortion', tone),
        pctres('Steganographic Capacity', `${fmtBytes(totalBytes)} Payload`, bits === 1 ? 95 : bits === 2 ? 70 : 40, tone),
        res('Embedding Density', `${bits} bit(s) / color channel (${bits * 3} bits / pixel)`, 'neutral'),
      ]
    },
  },
  {
    id: 'invisible-watermark-robustness-estimator',
    name: 'Invisible Forensic Watermark Robustness Estimator',
    subject: SUBJECT,
    blurb: 'Estimate digital watermark survivability against lossy JPEG re-compression, web screenshotting, and aspect-ratio cropping.',
    tip: 'Spatial domain watermarks (LSB) are destroyed by lossy JPEG compression; transform-domain watermarks (DCT / DWT) survive 70% quality compression.',
    usage: [
      'Select watermarking domain (Spatial LSB vs Frequency DCT / DWT).',
      'Select anticipated adversarial distortion (JPEG re-encoding, Screenshot crop).',
      'Review forensic watermark survivability rate.',
    ],
    method: [
      'Models Discrete Cosine Transform (DCT) spread-spectrum watermarking resilience against lossy transformations.',
    ],
    fields: [
      sel('domain', 'Watermarking Domain', ['Discrete Cosine Transform (DCT Frequency Domain)', 'Discrete Wavelet Transform (DWT Multi-Resolution)', 'Spatial LSB (Least Significant Bit)']),
      sel('attack', 'Target Channel Attack', ['Lossy JPEG Compression (Quality 75)', 'Resizing & Downsampling (50%)', 'Aggressive Cropping (20% perimeter cut)']),
    ],
    compute: (v) => {
      const d = asSel(v, 'domain', 'DCT')
      const a = asSel(v, 'attack', 'Lossy JPEG')

      let survivalPct = 85
      let tone: 'good' | 'warn' | 'bad' = 'good'

      if (d.startsWith('Spatial')) {
        survivalPct = a.startsWith('Lossy') ? 5 : 20
        tone = 'bad'
      } else if (d.startsWith('Discrete Cosine')) {
        survivalPct = a.startsWith('Lossy') ? 92 : a.startsWith('Resizing') ? 85 : 70
        tone = survivalPct >= 80 ? 'good' : 'warn'
      } else {
        survivalPct = a.startsWith('Lossy') ? 88 : a.startsWith('Resizing') ? 94 : 75
        tone = 'good'
      }

      return [
        res('Watermark Survivability', `${survivalPct}% Recovery Probability`, tone),
        res('Active Embedding Domain', d.split('(')[0].trim(), 'good'),
        pctres('Forensic Resilience', `${survivalPct}% Intact`, survivalPct, tone),
        res('Adversarial Threat', a, 'neutral'),
      ]
    },
  },
]
