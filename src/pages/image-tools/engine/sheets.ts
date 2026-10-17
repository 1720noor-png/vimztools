import { mmToPx, planContactSheet, planSheet } from './geometry.ts'
import { makeSurface, type Surface } from './ops.ts'
import { safeDiv } from './values.ts'

export interface SheetOptions {
  gap: number
  bg: string
  cols?: number
  square?: boolean
  cellMax?: number
}

export function composeContactSheet(sources: Surface[], o: SheetOptions): Surface {
  const list = sources.length ? sources : []
  const cell = Math.max(24, Math.round(o.cellMax ?? 320))
  const layout = planContactSheet({ count: Math.max(1, list.length), cellMax: cell, gap: o.gap, cols: o.cols, square: o.square !== false })
  const out = makeSurface(layout.w, layout.h, o.bg || '#ffffff')
  list.forEach((s, i) => {
    const p = layout.positions[i]
    if (!p) return
    out.ctx.imageSmoothingQuality = 'high'
    const ratio = s.w / s.h
    if (o.square === false) {
      out.ctx.drawImage(s.canvas, p.x, p.y, p.w, p.h)
      return
    }
    if (ratio > 1) {
      const dh = p.h / ratio
      out.ctx.drawImage(s.canvas, p.x, p.y + (p.h - dh) / 2, p.w, dh)
    } else {
      const dw = p.w * ratio
      out.ctx.drawImage(s.canvas, p.x + (p.w - dw) / 2, p.y, dw, p.h)
    }
  })
  return out
}

/**
 * Lay fixed-size ID/passport cells onto a physical page with cut marks.
 * Returns one surface per page, so a 20-photo request can span two A4 sheets.
 */
export function composeIdSheets(
  sources: Surface[],
  o: {
    page: string
    dpi: number
    wMm: number
    hMm: number
    gapMm: number
    marginMm: number
    cutMarks: boolean
  },
): Surface[] {
  const list = sources.length ? sources : []
  const plan = planSheet({
    page: o.page,
    dpi: o.dpi,
    wMm: o.wMm,
    hMm: o.hMm,
    cols: 99,
    rows: 99,
    gapMm: o.gapMm,
    marginMm: o.marginMm,
    count: Math.max(1, list.length),
  })
  const pages: Surface[] = []
  const gapPx = mmToPx(o.gapMm, o.dpi)
  for (let p = 0; p < plan.pages; p++) {
    const page = makeSurface(plan.pageW, plan.pageH, '#ffffff')
    const slice = list.slice(p * plan.perPage, (p + 1) * plan.perPage)
    slice.forEach((s, i) => {
      const c = i % plan.cols
      const r = Math.floor(safeDiv(i, plan.cols, 0))
      const x = plan.originX + c * (plan.cellW + gapPx)
      const y = plan.originY + r * (plan.cellH + gapPx)
      drawContained(page, s, x, y, plan.cellW, plan.cellH)
      if (o.cutMarks) {
        page.ctx.strokeStyle = '#9ca3af'
        page.ctx.lineWidth = 1
        page.ctx.setLineDash([4, 4])
        page.ctx.strokeRect(x + 0.5, y + 0.5, plan.cellW - 1, plan.cellH - 1)
        page.ctx.setLineDash([])
      }
    })
    pages.push(page)
  }
  return pages
}

/** Draw a source centred inside a cell, preserving aspect ratio. */
function drawContained(page: Surface, s: Surface, x: number, y: number, w: number, h: number): void {
  page.ctx.imageSmoothingQuality = 'high'
  const ratio = safeDiv(s.w, s.h, 1)
  const cellRatio = safeDiv(w, h, 1)
  if (ratio > cellRatio) {
    const dh = safeDiv(w, ratio, h)
    page.ctx.drawImage(s.canvas, x, y + (h - dh) / 2, w, dh)
  } else {
    const dw = h * ratio
    page.ctx.drawImage(s.canvas, x + (w - dw) / 2, y, dw, h)
  }
}

export function composeGrid(sources: Surface[], o: SheetOptions): Surface {
  return composeContactSheet(sources, { ...o, square: false })
}

export function combineImages(sources: Surface[], axis: 'x' | 'y', gap: number, bg: string): Surface {
  const list = sources.length ? sources : []
  if (list.length === 0) return makeSurface(10, 10, bg)
  if (axis === 'x') {
    const w = list.reduce((a, s) => a + s.w, 0) + gap * Math.max(0, list.length - 1)
    const h = Math.max(...list.map((s) => s.h))
    const out = makeSurface(w, h, bg)
    let x = 0
    for (const s of list) {
      out.ctx.imageSmoothingQuality = 'high'
      out.ctx.drawImage(s.canvas, x, 0)
      x += s.w + gap
    }
    return out
  }
  const w = Math.max(...list.map((s) => s.w))
  const h = list.reduce((a, s) => a + s.h, 0) + gap * Math.max(0, list.length - 1)
  const out = makeSurface(w, h, bg)
  let y = 0
  for (const s of list) {
    out.ctx.imageSmoothingQuality = 'high'
    out.ctx.drawImage(s.canvas, 0, y)
    y += s.h + gap
  }
  return out
}

export function composeCollageLayout(sources: Surface[], o: SheetOptions & { layout: 'rows' | 'cols' | 'grid' | 'strip' | 'mosaic' }): Surface {
  const list = sources.length ? sources : []
  const gap = Math.max(0, o.gap)
  const bg = o.bg || '#ffffff'
  if (o.layout === 'strip') {
    const height = Math.max(1, Math.round(o.cellMax ?? 300))
    const cells = list.map((s) => {
      const r = safeDiv(s.w, s.h, 1)
      return { w: Math.max(1, Math.round(height * r)), h: height }
    })
    const w = cells.reduce((a, c) => a + c.w, 0) + gap * Math.max(0, list.length - 1)
    const out = makeSurface(w, height, bg)
    let x = 0
    list.forEach((s, i) => {
      out.ctx.imageSmoothingQuality = 'high'
      out.ctx.drawImage(s.canvas, x, 0, cells[i].w, height)
      x += cells[i].w + gap
    })
    return out
  }
  if (o.layout === 'rows') {
    const rowH = Math.max(1, Math.round(o.cellMax ?? 300))
    const rows: Surface[][] = []
    const perRow = Math.max(1, Math.floor(Math.sqrt(list.length || 1)))
    for (let i = 0; i < list.length; i += perRow) rows.push(list.slice(i, i + perRow))
    const rowWidths = rows.map((r) => r.reduce((a, s) => a + s.w, 0) + gap * Math.max(0, r.length - 1))
    const w = Math.max(1, ...rowWidths)
    const h = rows.length * rowH + gap * Math.max(0, rows.length - 1)
    const out = makeSurface(w, h, bg)
    let y = 0
    rows.forEach((r) => {
      let x = 0
      for (const s of r) {
        out.ctx.imageSmoothingQuality = 'high'
        out.ctx.drawImage(s.canvas, x, y, s.w, rowH)
        x += s.w + gap
      }
      y += rowH + gap
    })
    return out
  }
  if (o.layout === 'cols') {
    const colW = Math.max(1, Math.round(o.cellMax ?? 300))
    const perCol = Math.max(1, Math.floor(Math.sqrt(list.length || 1)))
    const cols: Surface[][] = []
    for (let i = 0; i < list.length; i += perCol) cols.push(list.slice(i, i + perCol))
    const w = cols.length * colW + gap * Math.max(0, cols.length - 1)
    const colHeights = cols.map((c) => c.reduce((a, s) => a + s.h, 0) + gap * Math.max(0, c.length - 1))
    const h = Math.max(1, ...colHeights)
    const out = makeSurface(w, h, bg)
    cols.forEach((c, ci) => {
      let y = 0
      const x = ci * (colW + gap)
      for (const s of c) {
        out.ctx.imageSmoothingQuality = 'high'
        out.ctx.drawImage(s.canvas, x, y, colW, s.h)
        y += s.h + gap
      }
    })
    return out
  }
  if (o.layout === 'mosaic') {
    const cell = Math.max(16, Math.round(o.cellMax ?? 200))
    const cols = o.cols ?? Math.max(1, Math.ceil(Math.sqrt(list.length || 1)))
    const rows = Math.max(1, Math.ceil(safeDiv(list.length, cols, 1)))
    const w = cols * cell + gap * (cols - 1)
    const h = rows * cell + gap * (rows - 1)
    const out = makeSurface(w, h, bg)
    list.forEach((s, i) => {
      const c = i % cols
      const r = Math.floor(safeDiv(i, cols, 0))
      drawContained(out, s, c * (cell + gap), r * (cell + gap), cell, cell)
    })
    return out
  }
  return composeContactSheet(list, { ...o, square: true })
}

export function composeBeforeAfter(before: Surface, after: Surface, splitPct: number): Surface {
  const w = Math.max(before.w, after.w)
  const h = Math.max(before.h, after.h)
  const out = makeSurface(w, h)
  out.ctx.imageSmoothingQuality = 'high'
  out.ctx.drawImage(after.canvas, 0, 0, w, h)
  const split = Math.max(0, Math.min(100, splitPct)) / 100
  const clipW = Math.round(w * split)
  if (clipW > 0) {
    out.ctx.save()
    out.ctx.beginPath()
    out.ctx.rect(0, 0, clipW, h)
    out.ctx.clip()
    out.ctx.drawImage(before.canvas, 0, 0, w, h)
    out.ctx.restore()
  }
  if (clipW > 1 && clipW < w - 1) {
    out.ctx.strokeStyle = '#ffffff'
    out.ctx.lineWidth = 2
    out.ctx.beginPath()
    out.ctx.moveTo(clipW, 0)
    out.ctx.lineTo(clipW, h)
    out.ctx.stroke()
  }
  return out
}
