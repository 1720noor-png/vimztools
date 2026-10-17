const fs = require('fs')

const files = fs.readdirSync('dist/assets').filter((f) => f.startsWith('index-') && f.endsWith('.js'))
const bundleFile = 'dist/assets/' + files[0]
console.log('Inspecting compiled bundle:', bundleFile)
const code = fs.readFileSync(bundleFile, 'utf8')

// Match any categoryId with backticks, double quotes, or single quotes
const catMatches = [...code.matchAll(/categoryId:\s*[`"']([^`"']+)[`"']/g)].map((m) => m[1])
console.log('Total tool categoryId assignments:', catMatches.length)

const counts = {}
for (const c of catMatches) {
  counts[c] = (counts[c] || 0) + 1
}

console.log('\n--- LIVE PRODUCTION TOOLS BREAKDOWN BY CATEGORY ---')
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(25)}: ${v} tools`)
}

console.log('----------------------------------------------------')
console.log(`TOTAL PRODUCTION TOOLS IN COMPILED APP: ${catMatches.length}`)
console.log('----------------------------------------------------')
