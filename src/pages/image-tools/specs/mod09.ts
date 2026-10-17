import { adjust, clr, fmtParam, n, pr, sel, sl, tg, txt, tool } from '../engine/factories.ts'
import { SOCIAL_PRESETS } from '../engine/geometry.ts'
import { captionDraft } from '../engine/runners.ts'
import type { ImageToolSpec, Op, ParamValues } from '../engine/types.ts'

const SUB = 'social-media' as const

function safeArea(v: ParamValues): Op[] {
  return v.safe === 'on' ? [{ op: 'border', width: 24, color: '#0EA5E9', style: 'dashed' }] : []
}

function coverTo(w: number, h: number): Op[] {
  return [
    { op: 'aspect', ratio: w / h, mode: 'cover' },
    { op: 'resize', w: Math.round(w), h: Math.round(h), mode: 'cover', unit: 'px' },
  ]
}

const PLACEMENT_SIZES: Record<string, [number, number]> = {
  'Feed 1200x630': [1200, 630],
  'Cover 1640x856': [1640, 856],
  'Square 1080x1080': [1080, 1080],
  'Story 1080x1920': [1080, 1920],
}

const PIN_SIZES: Record<string, [number, number]> = {
  '2:3 standard': [1000, 1500],
  '1000x1500 tall': [1000, 1500],
  '1:1 square': [1000, 1000],
}

const SHAPE_RATIOS: Record<string, number> = {
  '1:1 square': 1,
  '4:5 portrait': 4 / 5,
  '1.91:1 landscape': 1.91,
}

export const SOCIAL_SPECS: ImageToolSpec[] = [
  tool({
    id: 'social-media-resizer',
    name: 'Social Media Resizer',
    sub: SUB,
    icon: 'Share2',
    blurb: 'Resize one photo to any platform size in a single pass.',
    tip: 'Export each size from the original rather than upscaling one master. Upscaling never adds real detail.',
    params: [
      sel('preset', 'Preset pack', Object.keys(SOCIAL_PRESETS), 'instagram-post'),
      pr('custom', 'Custom size (px)', '1200,630'),
      tg('safe', 'Show safe-area guides'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => {
      const preset = SOCIAL_PRESETS[String(v.preset)] ?? SOCIAL_PRESETS['instagram-post']
      return [...coverTo(preset.w, preset.h), ...safeArea(v)]
    },
  }),
  tool({
    id: 'instagram-post-resizer',
    name: 'Instagram Post Resizer',
    sub: SUB,
    icon: 'Instagram',
    blurb: 'Crop a photo to the 1:1, 4:5 or 1.91:1 shapes Instagram accepts.',
    tip: 'Use 4:5 for feed posts and 1:1 for the grid. 4:5 takes up the most screen space.',
    params: [
      sel('shape', 'Post shape', Object.keys(SHAPE_RATIOS), '4:5 portrait'),
      n('width', 'Width (px)', 1080, 100, 4000, 10, 'px'),
      tg('safe', 'Show safe-area guides'),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const ratio = SHAPE_RATIOS[String(v.shape)] ?? 4 / 5
      const w = Math.round(Number(v.width ?? 1080))
      return [...coverTo(w, w / ratio), ...safeArea(v)]
    },
  }),
  tool({
    id: 'instagram-story-resizer',
    name: 'Instagram Story Resizer',
    sub: SUB,
    icon: 'Zap',
    blurb: 'Size a photo for a 9:16 Story or Reel cover.',
    tip: 'Leave the top and bottom fifth empty — Stories put your profile and captions there.',
    params: [
      n('width', 'Width (px)', 1080, 320, 2160, 10, 'px'),
      tg('safe', 'Show safe-area guides'),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const w = Math.round(Number(v.width ?? 1080))
      return [...coverTo(w, (w * 16) / 9), ...safeArea(v)]
    },
  }),
  tool({
    id: 'facebook-post-resizer',
    name: 'Facebook Post Resizer',
    sub: SUB,
    icon: 'Facebook',
    blurb: 'Fit a photo to a Facebook feed, cover, square or story size.',
    tip: 'Desktop shows only 820×312 of a cover. Keep logos inside that band, not the full 1640×856.',
    params: [
      sel('target', 'Placement', Object.keys(PLACEMENT_SIZES), 'Feed 1200x630'),
      tg('safe', 'Show safe-area guides'),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const [w, h] = PLACEMENT_SIZES[String(v.target)] ?? PLACEMENT_SIZES['Feed 1200x630']
      return [...coverTo(w, h), ...safeArea(v)]
    },
  }),
  tool({
    id: 'twitter-header-resizer',
    name: 'Twitter Header Resizer',
    sub: SUB,
    icon: 'Twitter',
    blurb: 'Resize an image to the 1500×500 X header spec.',
    tip: 'The avatar covers the lower-left corner. Keep important detail away from it.',
    params: [
      n('width', 'Width (px)', 1500, 800, 3000, 10, 'px'),
      tg('safe', 'Show safe-area guides'),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const w = Math.round(Number(v.width ?? 1500))
      return [...coverTo(w, w / 3), ...safeArea(v)]
    },
  }),
  tool({
    id: 'linkedin-banner-resizer',
    name: 'LinkedIn Banner Resizer',
    sub: SUB,
    icon: 'Linkedin',
    blurb: 'Size a personal profile or company banner for LinkedIn.',
    tip: 'Keep logos off the left third — the profile photo sits there on both layouts.',
    params: [
      sel('kind', 'Banner type', ['Personal 1584x396', 'Company 1128x191', 'Square avatar 800x800'], 'Personal 1584x396'),
      tg('safe', 'Show safe-area guides'),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const map: Record<string, [number, number]> = {
        'Personal 1584x396': [1584, 396],
        'Company 1128x191': [1128, 191],
        'Square avatar 800x800': [800, 800],
      }
      const [w, h] = map[String(v.kind)] ?? map['Personal 1584x396']
      return [...coverTo(w, h), ...safeArea(v)]
    },
  }),
  tool({
    id: 'youtube-thumbnail-resizer',
    name: 'YouTube Thumbnail Resizer',
    sub: SUB,
    icon: 'Youtube',
    blurb: 'Build a 16:9 thumbnail that stays readable at small sizes.',
    tip: 'Keep text to five words or fewer. A thumbnail gets about one second of attention.',
    params: [
      n('width', 'Width (px)', 1280, 640, 2560, 10, 'px'),
      clr('overlay', 'Overlay tint', '#0F172A'),
      sl('overlayStrength', 'Overlay strength', 0, 0, 0.8, 0.05, '', 'Darkens the image so text stays readable'),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const w = Math.round(Number(v.width ?? 1280))
      const ops = coverTo(w, (w * 9) / 16)
      if (Number(v.overlayStrength ?? 0) > 0) {
        ops.push({ op: 'background', mode: 'color', color: String(v.overlay ?? '#0F172A'), color2: '#0EA5E9', blur: 0, tolerance: 0, feather: 0, keepColor: 'keep' })
      }
      return ops
    },
  }),
  tool({
    id: 'pinterest-pin-resizer',
    name: 'Pinterest Pin Resizer',
    sub: SUB,
    icon: 'Pin',
    blurb: 'Size a tall image for Pinterest pins.',
    tip: 'Pinterest rewards tall images with one clear subject. Vertical beats square here.',
    params: [sel('ratio', 'Pin shape', Object.keys(PIN_SIZES), '2:3 standard'), tg('safe', 'Show safe-area guides'), fmtParam()],
    outGroup: 'jpeg',
    build: (v) => {
      const [w, h] = PIN_SIZES[String(v.ratio)] ?? PIN_SIZES['2:3 standard']
      return [...coverTo(w, h), ...safeArea(v)]
    },
  }),
  tool({
    id: 'tiktok-video-cover-resizer',
    name: 'TikTok Video Cover Resizer',
    sub: SUB,
    icon: 'Music',
    blurb: 'Create a 9:16 cover frame for a TikTok video.',
    tip: 'Captions cover the lower third of a TikTok. Keep your text in the upper third.',
    params: [
      n('width', 'Width (px)', 1080, 320, 2160, 10, 'px'),
      tg('safe', 'Show safe-area guides'),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const w = Math.round(Number(v.width ?? 1080))
      return [...coverTo(w, (w * 16) / 9), ...safeArea(v)]
    },
  }),
  tool({
    id: 'cover-photo-generator',
    name: 'Cover Photo Generator',
    sub: SUB,
    icon: 'LayoutTemplate',
    blurb: 'Generate a cover photo with a darkened base and a caption bar.',
    tip: 'A darkened copy of the photo behind the text is the most readable cover treatment.',
    params: [
      txt('title', 'Title', 'Headline'),
      n('width', 'Width (px)', 1200, 320, 3000, 10, 'px'),
      n('barHeight', 'Bar height', 22, 8, 60, 1, '%'),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const w = Math.round(Number(v.width ?? 1200))
      return [
        ...coverTo(w, (w * 9) / 16),
        adjust({ brightness: -0.15 }),
        {
          op: 'watermarkText',
          text: String(v.title ?? 'Headline'),
          fontSize: Math.round(w / 14),
          opacity: 0.95,
          color: '#FFFFFF',
          x: 50,
          y: 78,
          rotation: 0,
          font: 'sans-serif',
          tile: false,
        },
      ]
    },
  }),
  tool({
    id: 'social-media-caption-generator',
    name: 'Social Media Caption Generator',
    sub: SUB,
    icon: 'MessageSquare',
    blurb: 'Draft caption and hashtag sets you can copy for each platform.',
    tip: 'Platform limits matter: X caps at 280 characters, LinkedIn rewards long text.',
    params: [
      txt('topic', 'What is the post about?', 'new product launch'),
      sel('platform', 'Platform', ['Instagram', 'Facebook', 'X', 'LinkedIn', 'TikTok'], 'Instagram'),
      n('hashtags', 'Hashtags', 8, 0, 30, 1),
    ],
    kind: 'text',
    custom: captionDraft,
  }),
  tool({
    id: 'meme-generator',
    name: 'Meme Generator',
    sub: SUB,
    icon: 'Laugh',
    blurb: 'Add classic top-and-bottom caption bars to any image.',
    tip: 'White text with a dark outline stays readable on any photo. Long captions never do.',
    params: [
      txt('top', 'Top text', 'TOP TEXT'),
      txt('bottom', 'Bottom text', 'BOTTOM TEXT'),
      n('fontSize', 'Font size', 64, 16, 400, 1, 'px'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => {
      const fs = Math.round(Number(v.fontSize ?? 64))
      return [
        { op: 'watermarkText', text: String(v.top ?? 'TOP TEXT'), fontSize: fs, opacity: 1, color: '#FFFFFF', x: 50, y: 8, rotation: 0, font: 'sans-serif', tile: false },
        { op: 'watermarkText', text: String(v.bottom ?? 'BOTTOM TEXT'), fontSize: fs, opacity: 1, color: '#FFFFFF', x: 50, y: 92, rotation: 0, font: 'sans-serif', tile: false },
      ]
    },
  }),
  tool({
    id: 'facebook-cover-cropper',
    name: 'Facebook Cover Cropper',
    sub: SUB,
    icon: 'Crop',
    blurb: 'Crop a wide photo to a mobile-safe Facebook cover.',
    tip: 'Keep anything important inside the centre band. Phones crop hard on both sides.',
    params: [sel('device', 'Primary view', ['Desktop 820x312', 'Mobile 640x360'], 'Desktop 820x312'), fmtParam()],
    outGroup: 'jpeg',
    build: (v) => {
      const [w, h] = String(v.device) === 'Mobile 640x360' ? [640, 360] : [820, 312]
      return coverTo(w, h)
    },
  }),
]
