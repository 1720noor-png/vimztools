import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DPI_BY_GROUP, MIME_BY_GROUP, EXT_BY_GROUP, acceptString, baseOf, canExport, clampNum, defaultParams,
  describeFileSize, extOf, groupOfFile, groupOfMime, groupOfName, nativelyDecodable, numOf, parseList,
  parsePair, roundPx, safeDiv, safePct, selectOf, strOf, boolOf, multiset,
} from './values.ts'
import {
  ID_PHOTO_SIZES, MAX_PIXELS, NAMED_RATIOS, PAGE_SIZES, SOCIAL_PRESETS, aspectRatio, bytesForPixels,
  clampCanvasSize, gcd, idPhotoHeadroom, inchesToMm, megapixels, mmToPx, nearestRatioName, planContactSheet,
  planSheet, printQualityVerdict, pxToMm, resolveFit, simplifyRatio, totalPixels,
} from './geometry.ts'
import {
  cmykToRgb, contrastRatio, describeColor, hexToRgb, hsvToRgb, luminance, mixColors,
  parseHexColor, rgbToCmyk, rgbToHex, rgbToHsl, rgbToHsv, rgbToLab,
} from './colors.ts'
import { extractPalette } from './pixels.ts'
import { parseBmp, parseIco, parseTiff, sniffContainer, buildIco, parseJpegMetadata, parsePngMetadata, parseWebpMetadata } from './decode.ts'
import { opsOf, resolveOutGroup, stripExt } from './run.ts'
import { escapeHtml, outputName, jsonBlob } from './outputs.ts'
import type { ImageToolSpec, ParamValues } from './types.ts'

test('groupOfMime handles aliases, casing and parameters', () => {
  assert.equal(groupOfMime('image/JPEG'), 'jpeg')
  assert.equal(groupOfMime('image/png; charset=binary'), 'png')
  assert.equal(groupOfMime('image/x-ms-bmp'), 'bmp')
  assert.equal(groupOfMime('image/heif-sequence'), 'heic')
  assert.equal(groupOfMime('application/zip'), null)
  assert.equal(groupOfMime(undefined), null)
  assert.equal(groupOfMime(''), null)
})

test('groupOfName falls back to the extension and tolerates odd names', () => {
  assert.equal(groupOfName('photo.JPG'), 'jpeg')
  assert.equal(groupOfName('scan.tiff'), 'tiff')
  assert.equal(groupOfName('noextension'), null)
  assert.equal(groupOfName('archive.tar.gz'), null)
  assert.equal(extOf('a.b.c.png'), 'png')
  assert.equal(baseOf('a.b.c.png'), 'a.b.c')
  assert.equal(baseOf('nodot'), 'nodot')
  assert.equal(baseOf('.hidden'), '.hidden')
})

test('groupOfFile prefers the declared mime type', () => {
  assert.equal(groupOfFile({ name: 'weird.xyz', type: 'image/png' }), 'png')
  assert.equal(groupOfFile({ name: 'photo.bmp', type: '' }), 'bmp')
  assert.equal(groupOfFile({ name: 'photo.bmp', type: 'application/octet-stream' }), 'bmp')
})

test('every group has a mime, extension and dpi with safe fallbacks', () => {
  const groups = Object.keys(MIME_BY_GROUP) as Array<keyof typeof MIME_BY_GROUP>
  assert.ok(groups.length >= 12)
  for (const g of groups) {
    assert.equal(typeof MIME_BY_GROUP[g], 'string')
    assert.match(EXT_BY_GROUP[g], /^[a-z0-9]+$/)
    assert.ok(DPI_BY_GROUP[g] > 0, `${g} dpi must be positive`)
  }
  assert.equal(DPI_BY_GROUP.tiff, 300)
  assert.equal(DPI_BY_GROUP.pdf, 300)
})

test('canExport refuses containers no browser will encode', () => {
  assert.equal(canExport('jpeg'), true)
  assert.equal(canExport('png'), true)
  assert.equal(canExport('avif'), false)
  assert.equal(canExport('heic'), false)
  assert.equal(canExport('ico'), false)
})

test('nativelyDecodable never claims unknown formats', () => {
  assert.equal(nativelyDecodable(null), false)
  assert.equal(nativelyDecodable('bmp'), true)
  assert.equal(typeof nativelyDecodable('png'), 'boolean')
})

test('acceptString merges mime types and extensions without duplicates', () => {
  const s = acceptString(['jpeg', 'png'])
  assert.ok(s.includes('image/jpeg'))
  assert.ok(s.includes('.jpg'))
  assert.equal(s.split(',').length, 4)
})

test('describeFileSize is human readable and safe for bad input', () => {
  assert.equal(describeFileSize(512), '512 B')
  assert.equal(describeFileSize(2048), '2.0 KB')
  assert.equal(describeFileSize(5 * 1024 * 1024), '5.00 MB')
  assert.equal(describeFileSize(-1), '—')
  assert.equal(describeFileSize(NaN), '—')
})

test('clampNum, roundPx and safeDiv survive zeros, NaN and Infinity', () => {
  assert.equal(clampNum(5, 0, 10), 5)
  assert.equal(clampNum(-5, 0, 10), 0)
  assert.equal(clampNum(NaN, 0, 10), 0)
  assert.equal(clampNum(Infinity, 0, 10), 10)
  assert.equal(roundPx(0), 1)
  assert.equal(roundPx(-3), 1)
  assert.equal(roundPx(NaN), 1)
  assert.equal(safeDiv(10, 0, 7), 7)
  assert.equal(safeDiv(10, 2), 5)
  assert.equal(safeDiv(NaN, 2, 1), 1)
  assert.equal(safePct(1, 0, 0), 0)
  assert.equal(safePct(1, 4), 25)
})

test('param coercion handles strings, booleans and junk', () => {
  const v: ParamValues = { a: '12.5px', b: 'true', c: '1', d: 'nope', e: 7, f: 'off' }
  assert.equal(numOf(v, 'a', 0), 12.5)
  assert.equal(numOf(v, 'd', 3), 3)
  assert.equal(numOf(v, 'a', 0, 0, 10), 10)
  assert.equal(numOf(v, 'e', 0), 7)
  assert.equal(boolOf(v, 'b'), true)
  assert.equal(boolOf(v, 'c'), true)
  assert.equal(boolOf(v, 'f'), false)
  assert.equal(strOf(v, 'e', 'x'), '7')
  assert.equal(strOf(v, 'missing', 'fallback'), 'fallback')
  assert.equal(selectOf(v, 'missing', 'first'), 'first')
  assert.equal(selectOf({ k: 'second' }, 'k', 'first'), 'second')
})

test('defaultParams covers every ParamDef kind', () => {
  const out = defaultParams([
    { key: 'n', label: 'n', kind: 'number' },
    { key: 's', label: 's', kind: 'slider', min: 1, max: 5 },
    { key: 'sel', label: 'sel', kind: 'select', options: ['x', 'y'] },
    { key: 'c', label: 'c', kind: 'color' },
    { key: 't', label: 't', kind: 'toggle' },
    { key: 'p', label: 'p', kind: 'pair' },
    { key: 'txt', label: 'txt', kind: 'text' },
  ])
  assert.equal(out.n, 0)
  assert.equal(out.s, 1)
  assert.equal(out.sel, 'x')
  assert.equal(out.c, '#0EA5E9')
  assert.equal(out.t, false)
  assert.equal(out.p, '0,0')
  assert.equal(out.txt, '')
})

test('parsePair and parseList ignore separators and non-numbers', () => {
  assert.deepEqual(parsePair('1920 x 1080'), [1920, 1080])
  assert.deepEqual(parsePair('nope'), [0, 0])
  assert.deepEqual(parsePair('7', [1, 1]), [1, 1])
  assert.deepEqual(parseList('1 2,3;4'), [1, 2, 3, 4])
  assert.deepEqual(parseList(''), [])
})

test('resolveFit never returns NaN geometry, even from a 0x0 source', () => {
  const cover = resolveFit(0, 0, 100, 50, 'cover')
  assert.ok(Number.isFinite(cover.w) && cover.w > 0)
  assert.ok(Number.isFinite(cover.sx) && cover.sx > 0)
  const fit = resolveFit(4000, 100, 100, 100, 'fit')
  assert.equal(fit.w, 100)
  assert.ok(fit.sx < 1)
  const exact = resolveFit(10, 10, 0, 0, 'exact')
  assert.equal(exact.w, 1)
  assert.equal(exact.h, 1)
  const fill = resolveFit(10, 10, 200, 40, 'fill')
  assert.equal(fill.sx, 20)
  assert.equal(fill.sy, 4)
})

test('mm/px/inch conversions use a safe dpi fallback', () => {
  assert.equal(mmToPx(25.4, 96), 96)
  assert.equal(mmToPx(25.4, 0), 96)
  assert.equal(mmToPx(25.4, -300), 96)
  assert.equal(mmToPx(NaN, 300), 1)
  assert.equal(pxToMm(96, 96), 25.4)
  assert.equal(pxToMm(96, 0), 25.4)
  assert.equal(inchesToMm(2), 50.8)
  assert.equal(inchesToMm(NaN), 0)
})

test('aspect ratio helpers simplify correctly and name known ratios', () => {
  assert.equal(aspectRatio(16, 9).toFixed(4), '1.7778')
  assert.equal(aspectRatio(10, 0), 1)
  assert.equal(gcd(12, 18), 6)
  assert.equal(gcd(0, 0), 1)
  assert.equal(simplifyRatio(1920, 1080).text, '16:9')
  assert.equal(simplifyRatio(0, 0).text, '1:1')
  assert.equal(nearestRatioName(1), '1:1 square')
  assert.equal(nearestRatioName(16 / 9), '16:9 widescreen')
  assert.equal(nearestRatioName(7.3), 'Custom')
  assert.ok(NAMED_RATIOS.length >= 10)
})

test('planSheet fits cells onto a page and reports page count', () => {
  const layout = planSheet({ page: 'a4', dpi: 300, wMm: 35, hMm: 45, cols: 0, rows: 0, gapMm: 2, marginMm: 5, count: 20 })
  assert.ok(layout.cols >= 4, '35mm cells fit across A4')
  assert.ok(layout.rows >= 4, '45mm cells fit down A4')
  assert.equal(layout.pages, 1)
  const many = planSheet({ page: 'a4', dpi: 300, wMm: 51, hMm: 51, cols: 0, rows: 0, gapMm: 2, marginMm: 5, count: 200 })
  assert.ok(many.pages > 1)
  assert.ok(many.cellW > 0 && many.cellH > 0)
  assert.equal(PAGE_SIZES.a4.label.includes('A4'), true)
})

test('planSheet with zero dpi and huge cells still returns a usable layout', () => {
  const layout = planSheet({ page: 'a4', dpi: 0, wMm: 10000, hMm: 10000, cols: 0, rows: 0, gapMm: 0, marginMm: 0, count: 1 })
  assert.equal(layout.cols, 1)
  assert.equal(layout.rows, 1)
  assert.equal(layout.pages, 1)
  assert.ok(layout.cellW > 0)
})

test('planContactSheet lays out every cell without overlap', () => {
  const plan = planContactSheet({ count: 7, cellMax: 100, gap: 10, square: true })
  assert.equal(plan.positions.length, 7)
  assert.equal(plan.w, plan.cols * 100 + (plan.cols - 1) * 10)
  assert.equal(plan.h, plan.rows * 100 + (plan.rows - 1) * 10)
  for (const p of plan.positions) {
    assert.ok(p.x + p.w <= plan.w)
    assert.ok(p.y + p.h <= plan.h)
  }
  const single = planContactSheet({ count: 1, cellMax: 50, gap: 0, square: true })
  assert.equal(single.cols, 1)
  assert.equal(single.rows, 1)
})

test('print quality verdict and byte estimates', () => {
  assert.equal(printQualityVerdict(600, 51, 300).verdict, 'print')
  assert.equal(printQualityVerdict(450, 51, 300).verdict, 'acceptable')
  assert.equal(printQualityVerdict(100, 51, 300).verdict, 'screen')
  assert.equal(printQualityVerdict(0, 51, 0).tone, 'bad')
  assert.equal(bytesForPixels(100, 100, 24), 30000)
  assert.equal(bytesForPixels(0, 0, 0), 0)
  assert.equal(bytesForPixels(10, 10, 0), 300)
  assert.equal(megapixels(2000, 1000), 2)
  assert.equal(totalPixels(-5, 10), 10)
})

test('clampCanvasSize enforces the pixel budget', () => {
  assert.equal(clampCanvasSize(4000, 3000).clamped, false)
  const big = clampCanvasSize(20000, 20000)
  assert.equal(big.clamped, true)
  assert.ok(big.w * big.h <= MAX_PIXELS)
  const custom = clampCanvasSize(10000, 10000, 1000)
  assert.ok(custom.w * custom.h <= 1000)
  assert.ok(clampCanvasSize(0, 0).w >= 1)
})

test('preset tables are internally consistent', () => {
  for (const [key, p] of Object.entries(SOCIAL_PRESETS)) {
    assert.ok(p.w > 0 && p.h > 0, key)
    assert.equal(typeof p.label, 'string')
  }
  for (const [key, p] of Object.entries(ID_PHOTO_SIZES)) {
    assert.ok(p.wMm > 0 && p.hMm > 0, key)
  }
  assert.equal(idPhotoHeadroom(45, 'full'), 0)
  assert.equal(idPhotoHeadroom(45, 'passport'), 5)
  assert.equal(idPhotoHeadroom(0, 'passport'), 5)
})

test('colour parsing accepts 3 and 6 digit hex, rejects junk', () => {
  assert.deepEqual(parseHexColor('#0EA5E9'), { r: 14, g: 165, b: 233 })
  assert.deepEqual(parseHexColor('0ea5e9'), { r: 14, g: 165, b: 233 })
  assert.deepEqual(parseHexColor('#fff'), { r: 255, g: 255, b: 255 })
  assert.deepEqual(parseHexColor('nope'), { r: 0, g: 0, b: 0 })
  assert.deepEqual(hexToRgb('#000000'), { r: 0, g: 0, b: 0 })
  assert.equal(rgbToHex(14, 165, 233), '#0EA5E9')
  assert.equal(rgbToHex(NaN, 999, -5), '#00FF00')
})

test('hsv round-trips rgb values', () => {
  const original = { r: 200, g: 40, b: 90 }
  const hsv = rgbToHsv(original)
  const back = hsvToRgb(hsv)
  assert.ok(Math.abs(back.r - original.r) <= 2)
  assert.ok(Math.abs(back.g - original.g) <= 2)
  assert.ok(Math.abs(back.b - original.b) <= 2)
  const grey = rgbToHsv({ r: 128, g: 128, b: 128 })
  assert.equal(grey.s, 0)
  assert.equal(hsvToRgb({ h: 0, s: 0, v: 100 }).r, 255)
})

test('cmyk, lab, luminance, contrast and mixing behave', () => {
  const white = rgbToCmyk({ r: 255, g: 255, b: 255 })
  assert.deepEqual([white.c, white.m, white.y, white.k], [0, 0, 0, 0])
  const black = rgbToCmyk({ r: 0, g: 0, b: 0 })
  assert.equal(black.k, 100)
  const back = cmykToRgb(0, 0, 0, 0)
  assert.deepEqual(back, { r: 255, g: 255, b: 255 })
  const lab = rgbToLab({ r: 255, g: 255, b: 255 })
  assert.equal(lab.L, 100)
  assert.ok(Math.abs(luminance({ r: 255, g: 255, b: 255 }) - 255) < 0.001)
  assert.equal(luminance({ r: 0, g: 0, b: 0 }), 0)
  const ratio = contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })
  assert.ok(Math.abs(ratio - 21) < 0.01)
  assert.equal(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 }), 1)
  assert.deepEqual(mixColors({ r: 0, g: 0, b: 0 }, { r: 100, g: 100, b: 100 }, 0.5), { r: 50, g: 50, b: 50 })
  const hsl = rgbToHsl({ r: 255, g: 0, b: 0 })
  assert.equal(hsl.h, 0)
  assert.equal(hsl.l, 50)
})

test('describeColor names common colours', () => {
  assert.equal(describeColor('#FFFFFF').name, 'White')
  assert.equal(describeColor('#000000').name, 'Black')
  assert.equal(describeColor('#808080').name, 'Grey')
  assert.equal(describeColor('#FF0000').name, 'Red')
  assert.equal(describeColor('#00FF00').name, 'Green')
  assert.equal(describeColor('#0000FF').name, 'Blue')
})

test('extractPalette returns sorted shares that add up to 1', () => {
  const w = 10
  const h = 10
  const data = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    const red = i < 50
    data[i * 4] = red ? 255 : 0
    data[i * 4 + 1] = red ? 0 : 0
    data[i * 4 + 2] = red ? 0 : 255
    data[i * 4 + 3] = 255
  }
  const pal = extractPalette(data, 2)
  assert.equal(pal.length, 2)
  assert.ok(pal[0].share >= pal[1].share)
  const total = pal.reduce((a, c) => a + c.share, 0)
  assert.ok(Math.abs(total - 1) < 0.001)
  assert.equal(extractPalette(new Uint8ClampedArray(0), 3).length, 0)
})

test('multiset helper flags duplicate ids', () => {
  const dupes = multiset(['a', 'b', 'a'])
  assert.equal(dupes.size, 1)
  assert.deepEqual([...dupes.keys()], ['a'])
  assert.equal(dupes.get('a'), 2)
  assert.equal(multiset(['a', 'b']).size, 0)
  assert.equal(multiset([]).size, 0)
})

test('stripExt and outputName produce safe file names', () => {
  assert.equal(stripExt('photo.jpg'), 'photo')
  assert.equal(stripExt('a.b.png'), 'a.b')
  assert.equal(stripExt('nodot'), 'nodot')
  assert.equal(outputName('photo.jpg', 'png', '-2'), 'photo-2.png')
  assert.equal(outputName('photo', 'webp'), 'photo.webp')
  assert.equal(outputName('photo.tar.gz', 'jpeg', ''), 'photo.tar.jpg')
})

test('escapeHtml blocks tag injection in generated documents', () => {
  assert.equal(escapeHtml('<script>'), '&lt;script&gt;')
  assert.equal(escapeHtml('a"b\'c&d'), 'a&quot;b&#39;c&amp;d')
})

test('run.ts helpers resolve ops and output groups', () => {
  const spec: ImageToolSpec = {
    id: 'x', name: 'x', sub: 'crop-resize', blurb: '', tip: '', icon: 'Image', kind: 'image',
    params: [{ key: 'format', label: 'Format', kind: 'select', options: ['image/png', 'image/jpeg'] }],
    ops: [{ op: 'rotate', deg: 90, expand: true }],
    outGroup: 'png',
  }
  assert.equal(resolveOutGroup({ format: 'image/webp' }, spec), 'webp')
  assert.equal(resolveOutGroup({}, spec), 'png')
  assert.equal(opsOf(spec, {}).length, 1)
  const dynamic: ImageToolSpec = { ...spec, pipeline: () => [{ op: 'flip', axis: 'x' }] }
  assert.equal(opsOf(dynamic, {})[0].op, 'flip')
})

test('BMP parser rejects non-BMP input and handles truncated headers', () => {
  assert.throws(() => parseBmp(new ArrayBuffer(4)), /too small|Not a BMP/i)
  const notBmp = new ArrayBuffer(64)
  new DataView(notBmp).setUint8(0, 0x41)
  assert.throws(() => parseBmp(notBmp), /Not a BMP/)
})

test('TIFF parser rejects non-TIFF input', () => {
  assert.throws(() => parseTiff(new ArrayBuffer(2)), /too small/i)
  const buf = new ArrayBuffer(16)
  const dv = new DataView(buf)
  dv.setUint8(0, 0x4d)
  dv.setUint16(2, 43, false)
  assert.throws(() => parseTiff(buf), /baseline TIFF/)
})

test('ICO parser rejects non-ICO input and empty directories', () => {
  assert.throws(() => parseIco(new ArrayBuffer(2)), /too small/i)
  const bad = new ArrayBuffer(6)
  assert.throws(() => parseIco(bad), /Not an ICO/)
  const empty = new ArrayBuffer(6)
  const dv = new DataView(empty)
  dv.setUint16(2, 1, true)
  dv.setUint16(4, 0, true)
  assert.throws(() => parseIco(empty), /no readable images/)
})

test('buildIco writes a valid directory', async () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
  const blob = buildIco([{ png, size: 4 }])
  const ab = await blob.arrayBuffer()
  const dv = new DataView(ab)
  assert.equal(dv.getUint16(0, true), 0)
  assert.equal(dv.getUint16(2, true), 1)
  assert.equal(dv.getUint16(4, true), 1)
  assert.equal(dv.getUint32(14, true), 4)
})

test('metadata parsers return rows for real headers and empty for junk', () => {
  assert.deepEqual(parseJpegMetadata(new ArrayBuffer(4)), [])
  assert.deepEqual(parsePngMetadata(new ArrayBuffer(4)), [])
  assert.deepEqual(parseWebpMetadata(new ArrayBuffer(8)), [])
  assert.equal(sniffContainer({ name: 'a.png' }), 'PNG (ISO/IEC 15948)')
  assert.equal(sniffContainer({ name: 'a.jpg' }), 'JFIF/EXIF (ISO/IEC 10918-1)')
  assert.equal(sniffContainer({ name: 'a.xyz' }), 'Unknown container')
})

test('PNG pHYs metadata is decoded into DPI', () => {
  const bytes = new Uint8Array(8 + 25 + 12)
  const dv = new DataView(bytes.buffer)
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  dv.setUint32(8, 9)
  bytes.set([0x70, 0x48, 0x59, 0x73], 12)
  dv.setUint32(16, 3937)
  dv.setUint32(20, 3937)
  bytes[24] = 1
  const rows = parsePngMetadata(bytes.buffer)
  assert.equal(rows.length, 1)
  assert.match(rows[0].value, /100 × 100 DPI/)
})

test('jsonBlob produces parseable JSON', async () => {
  const blob = jsonBlob({ a: 1 })
  assert.equal(blob.type, 'application/json')
  const parsed = JSON.parse(await blob.text())
  assert.equal(parsed.a, 1)
})
