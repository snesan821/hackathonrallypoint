/**
 * Patches @clerk/nextjs package.json to add the "react-server" export condition
 * required by Next.js 15 App Router RSC compilation.
 * Run via postinstall.
 */
const fs = require('fs')
const path = require('path')

const pkgPaths = [
  path.resolve(__dirname, '../node_modules/@clerk/nextjs/package.json'),
]

// Also find the pnpm store copy
const pnpmStore = path.resolve(__dirname, '../node_modules/.pnpm')
if (fs.existsSync(pnpmStore)) {
  const entries = fs.readdirSync(pnpmStore)
  for (const entry of entries) {
    if (entry.startsWith('@clerk+nextjs@')) {
      pkgPaths.push(path.join(pnpmStore, entry, 'node_modules/@clerk/nextjs/package.json'))
    }
  }
}

for (const pkgPath of pkgPaths) {
  if (!fs.existsSync(pkgPath)) continue
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const serverExport = pkg.exports?.['./server']
  if (serverExport && !serverExport['react-server']) {
    serverExport['react-server'] = './dist/esm/server/index.js'
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    console.log(`✅ Patched react-server condition in ${pkgPath}`)
  } else {
    console.log(`ℹ️  Already patched or not found: ${pkgPath}`)
  }
}
