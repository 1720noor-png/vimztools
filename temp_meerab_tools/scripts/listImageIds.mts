import { imageToolSpecs, placementsOf } from '../src/pages/image-tools/specs/index.ts'
const subs = [...new Set(imageToolSpecs.map((s) => s.sub))].sort()
for (const sub of subs) {
  const list = imageToolSpecs.filter((s) => placementsOf(s).includes(sub))
  console.log('\n## ' + sub + ' (' + list.length + ')')
  console.log(list.map((s) => s.id + (s.alsoIn ? ' [' + s.alsoIn.join(',') + ']' : '')).join('\n'))
}
