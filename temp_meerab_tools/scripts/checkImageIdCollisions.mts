import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { imageToolSpecs } from '../src/pages/image-tools/specs/index.ts'

function walk(dir) {
  const out = []
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === 'dist' || e === '.git') continue
    const p = path.join(dir, e)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.(ts|tsx)$/.test(e)) out.push(p)
  }
  return out
}

const files = walk('src')
const existing = new Map()
for (const f of files) {
  if (f.includes('image-tools')) continue
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(/\bid:\s*'([a-z0-9][a-z0-9-]*)'/g)) {
    const id = m[1]
    if (!existing.has(id)) existing.set(id, f)
  }
}
console.log('scanned files:', files.length, 'existing ids:', existing.size)

const mine = new Set(imageToolSpecs.map((s) => s.id))
const collisions = [...mine].filter((id) => existing.has(id))
console.log('new-vs-existing collisions:', collisions.length)
for (const c of collisions) console.log('  ', c, '<-', existing.get(c))
console.log('RESULT', collisions.length === 0 ? 'CLEAN' : 'HAS_COLLISIONS')
