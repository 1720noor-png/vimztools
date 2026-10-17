import { imageToolSpecs, imagePlacements, validateImageSpecCounts, placementsOf } from '../src/pages/image-tools/specs/index.ts'

const bySub = new Map<string, number>()
for (const s of imageToolSpecs) for (const sub of placementsOf(s)) bySub.set(sub, (bySub.get(sub) ?? 0) + 1)
console.log('folders', bySub.size)
console.log([...bySub.entries()].map(([k, v]) => `${k}=${v}`).join(' '))
console.log('identities', imageToolSpecs.length)
console.log('placements', imagePlacements.length)
const r = validateImageSpecCounts()
console.log('dupIds', r.duplicateIds.length, r.duplicateIds.slice(0, 10))
console.log('dupPlacements', r.duplicatePlacements.length, r.duplicatePlacements.slice(0, 10))
console.log('missing copy', imageToolSpecs.filter((s) => !s.id || !s.name || !s.blurb || !s.tip).map((s) => s.id))
