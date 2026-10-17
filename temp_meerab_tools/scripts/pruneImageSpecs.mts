import { readFileSync, writeFileSync } from 'node:fs'

const REMOVE = new Set([
  'profile-picture-resizer@mod09',
  'batch-image-resizer@mod02',
  'ico-converter@mod20',
  'ai-inpainter@mod14',
  'horizontal-flip@mod02',
  'vertical-flip@mod02',
  'lossy-compressor@mod03',
  'flickr-watermark@mod06',
  'social-watermark-protector@mod09',
  'logo-monochrome-maker@mod20',
  'complementary-color-finder@mod16',
  'photo-calendar-page@mod19',
  'tiff-watermark@mod06',
  'image-to-text-file@mod12',
  'instagram-grid-planner@mod09',
  'poster-print-scaler@mod19',
  'photo-booklet-maker@mod19',
  'image-color-profile-info@mod15',
  'document-screenshot-to-pdf@mod12',
])

const ALSO_IN = {
  'watermark-batch': null,
  'ecommerce-batch-processor': null,
  'image-to-word-text': null,
  'image-to-excel-table': null,
  'image-to-pdf-batch': null,
  'batch-ocr-processor': null,
  'batch-ocr': null,
  'background-replacer-batch': ['ecommerce'],
}

const files = [
  'mod02', 'mod03', 'mod05', 'mod06', 'mod09', 'mod10', 'mod12', 'mod13', 'mod14', 'mod15', 'mod16', 'mod18', 'mod19', 'mod20',
]

for (const f of files) {
  const path = `src/pages/image-tools/specs/${f}.ts`
  let src = readFileSync(path, 'utf8')
  let removed = 0

  for (const key of REMOVE) {
    const [id, mod] = key.split('@')
    if (mod !== f) continue
    const start = src.indexOf(`id: '${id}'`)
    if (start === -1) { console.log(`MISS ${key}`); continue }
    let open = src.lastIndexOf('tool({', start)
    if (open === -1) { console.log(`NO TOOL OPEN ${key}`); continue }
    if (src.slice(0, open).split('\n').pop().trim() !== '') { console.log(`NOT AT LINE START ${key}`); continue }
    let depth = 0
    let i = open + 'tool('.length
    for (; i < src.length; i++) {
      const c = src[i]
      if (c === '(' || c === '{' || c === '[') depth++
      else if (c === ')' || c === '}' || c === ']') {
        depth--
        if (depth === 0) { i++; break }
      }
    }
    while (src[i] !== '\n' && i < src.length) i++
    const head = src.lastIndexOf('\n', open) + 1
    src = src.slice(0, head) + src.slice(i + 1)
    removed++
  }

  for (const [id, subs] of Object.entries(ALSO_IN)) {
    if (!src.includes(`id: '${id}'`)) continue
    if (subs === null) {
      src = src.replace(new RegExp(`\\s*alsoIn: \\[[^\\]]*\\],(?=\\s*icon: 'Logo')`, 'g'), '')
      src = src.replace(new RegExp(`(id: '${id}',[\\s\\S]{0,400}?)\\s*alsoIn: \\[[^\\]]*\\],`), '$1')
    } else {
      src = src.replace(new RegExp(`alsoIn: \\[[^\\]]*\\],(?=[\\s\\S]{0,200}?id: '${id}')`, 'g'), `alsoIn: ['${subs[0]}'],`)
      src = src.replace(new RegExp(`(id: '${id}',[\\s\\S]{0,200}?)alsoIn: \\[[^\\]]*\\],`), `$1alsoIn: ['${subs[0]}'],`)
    }
  }

  writeFileSync(path, src, 'utf8')
  console.log(f, 'removed', removed, 'alsoInLeft', (src.match(/alsoIn: \[/g) || []).length)
}
