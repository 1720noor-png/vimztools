import {
  asNum,
  asSel,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Vision & Multimodal Token Sizing'

export const MOD12_SPECS: AiToolSpec[] = [
  {
    id: 'gpt4o-vision-token-calculator',
    name: 'GPT-4o Vision Image Token & Cost Sizer',
    subject: SUBJECT,
    blurb: 'Calculate exact vision token consumption and API cost for OpenAI high-detail vs low-detail image inputs.',
    tip: 'Low-detail mode always consumes a flat 85 tokens regardless of image size, ideal for basic scene classification.',
    usage: [
      'Enter image pixel width and height (e.g. 1920x1080).',
      'Select detail mode (High Detail vs Low Detail).',
      'Inspect calculated 512x512 tile divisions and token total.',
    ],
    method: [
      'Low detail: 85 tokens.',
      'High detail: Scale to fit 2048x2048, then scale shortest side to 768px. Divide into 512x512 tiles: 170 tokens/tile + 85 base tokens.',
    ],
    fields: [
      n('width', 'Image Width (pixels)', 1920, 100, 10000, 10),
      n('height', 'Image Height (pixels)', 1080, 100, 10000, 10),
      sel('detail', 'Vision Detail Mode', ['High Detail (Tile decomposition)', 'Low Detail (Flat 85 tokens)']),
    ],
    compute: (v) => {
      let w = asNum(v, 'width', 1920)
      let h = asNum(v, 'height', 1080)
      const detail = asSel(v, 'detail', 'High Detail (Tile decomposition)')

      if (detail.startsWith('Low')) {
        return [
          res('Vision Tokens Consumed', '85 tokens (Flat)', 'good', 'Low detail mode'),
          res('Cost per Image', fmtMoney((85 / 1_000_000) * 2.5, 5), 'good', 'At $2.50 / 1M input tokens'),
          pctres('Token Efficiency', 'Ultra High (Fixed)', 98, 'good'),
        ]
      }

      // High detail math
      // Step 1: scale to fit inside 2048x2048
      if (w > 2048 || h > 2048) {
        const scale = 2048 / Math.max(w, h)
        w = Math.round(w * scale)
        h = Math.round(h * scale)
      }

      // Step 2: scale shortest side to 768
      const shortest = Math.min(w, h)
      if (shortest > 768) {
        const scale2 = 768 / shortest
        w = Math.round(w * scale2)
        h = Math.round(h * scale2)
      }

      const tilesW = Math.ceil(w / 512)
      const tilesH = Math.ceil(h / 512)
      const totalTiles = tilesW * tilesH
      const tokens = totalTiles * 170 + 85
      const cost = (tokens / 1_000_000) * 2.5

      return [
        res('Vision Tokens Consumed', `${fmtNum(tokens)} tokens`, tokens > 1500 ? 'warn' : 'good', `${totalTiles} tiles (${tilesW}x${tilesH})`),
        res('Cost per Image (GPT-4o)', fmtMoney(cost, 4), 'good'),
        res('Scaled Tile Geometry', `${w}px × ${h}px`, 'neutral'),
        pctres('Tile Grid Utilization', `${totalTiles} Tiles`, Math.min(100, Math.round((totalTiles / 12) * 100)), 'neutral'),
      ]
    },
  },
  {
    id: 'video-frame-rate-token-budgeter',
    name: 'Multimodal Video Frame Extraction Token Budgeter',
    subject: SUBJECT,
    blurb: 'Calculate the enormous token volume generated when feeding video clips to Gemini 1.5 or GPT-4o at varying FPS.',
    tip: '1 frame per second (1 FPS) is sufficient for 95% of video QA and summary tasks, avoiding 5x token blowouts.',
    usage: [
      'Enter video duration in seconds or minutes.',
      'Select frame extraction frequency (0.5 fps, 1 fps, 2 fps, 4 fps).',
      'Review total frame count, context consumption, and ingestion cost.',
    ],
    method: [
      'Frames = DurationSeconds * FPS.',
      'Gemini Video: ~260 tokens / frame.',
    ],
    fields: [
      n('durationSec', 'Video Duration (seconds)', 120, 5, 7200, 10),
      sel('fps', 'Sampled Frame Rate', ['1 FPS (Standard Recommendation)', '0.5 FPS (1 frame every 2 seconds)', '2 FPS (Fast Action)', '4 FPS (High Fidelity)']),
    ],
    compute: (v) => {
      const sec = asNum(v, 'durationSec', 120)
      const fpsStr = asSel(v, 'fps', '1 FPS (Standard Recommendation)')

      let fps = 1.0
      if (fpsStr.startsWith('0.5')) fps = 0.5
      else if (fpsStr.startsWith('2')) fps = 2.0
      else if (fpsStr.startsWith('4')) fps = 4.0

      const totalFrames = Math.round(sec * fps)
      const tokensPerFrame = 260
      const totalTokens = totalFrames * tokensPerFrame
      const costGeminiFlash = (totalTokens / 1_000_000) * 0.075

      const tone = totalTokens > 100000 ? 'warn' : 'good'

      return [
        res('Total Video Tokens', `${fmtNum(totalTokens)} tokens`, tone),
        res('Extracted Frames', `${fmtNum(totalFrames)} frames`, 'neutral', `At ${fps} FPS for ${sec}s`),
        res('Estimated API Ingest Cost', fmtMoney(costGeminiFlash, 4), 'good', 'Gemini 1.5 Flash video tier'),
        pctres('1M Context Saturation', `${((totalTokens / 1_000_000) * 100).toFixed(1)}% of 1M Window`, Math.round((totalTokens / 1_000_000) * 100), tone),
      ]
    },
  },
]
