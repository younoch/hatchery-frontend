import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sharedComponentsDir = join(root, 'src/shared/components')
const layoutDir = join(root, 'src/shared/components/layout')
const viewDir = join(root, 'src')
const assetsDir = join(root, 'dist/assets')

async function collectVueFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(entry => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? collectVueFiles(path) : entry.name.endsWith('.vue') ? [path] : []
    })
  )
  return nested.flat()
}

function addTokens(value, tokens) {
  for (const token of value.split(/\s+/).filter(Boolean)) tokens.add(token)
}

function addStringLiterals(value, tokens, utilityOnly = false) {
  const literals = /'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)"/gs
  const utilityPrefix =
    /^(?:!?-?(?:m|p)(?:[trblxyse])?-|space-[xy]-|scroll-[mp]|(?:min|max|size|w|h|gap|grid-cols|grid-rows|items|justify|self|place|rounded|border|bg|text|font|leading|shadow|outline|z|top|bottom|left|right|rotate|transition|duration|shrink|grow|list|whitespace|overflow|pointer-events|cursor|content|fill|stroke|decoration|opacity|order|aspect|object|basis|flex)-)/
  const standaloneUtility =
    /^(?:flex|inline-flex|grid|block|inline|hidden|absolute|relative|sticky|fixed|static)$/

  for (const match of value.matchAll(literals)) {
    const literal = match[1] ?? match[2]
    if (!utilityOnly) {
      addTokens(literal, tokens)
      continue
    }
    for (const token of literal.split(/\s+/).filter(Boolean)) {
      if (utilityPrefix.test(token) || standaloneUtility.test(token)) tokens.add(token)
    }
  }
}

function escapeClassName(token) {
  return token.replace(/[^a-zA-Z0-9_-]/g, character => `\\${character}`)
}

function hasSelector(css, token) {
  const selector = `.${escapeClassName(token)}`
  let index = css.indexOf(selector)
  while (index !== -1) {
    const next = css[index + selector.length]
    if (!next || /[.:,{\s>#[\]]/.test(next)) return true
    index = css.indexOf(selector, index + selector.length)
  }
  return false
}

async function collectRelevantVueFiles() {
  const [componentEntries, layoutFiles, viewFiles] = await Promise.all([
    readdir(sharedComponentsDir, { withFileTypes: true }),
    collectVueFiles(layoutDir),
    collectVueFiles(viewDir).then(files => files.filter(file => /\/views\//.test(file))),
  ])
  const componentFiles = componentEntries
    .filter(entry => entry.isFile() && entry.name.endsWith('.vue'))
    .map(entry => join(sharedComponentsDir, entry.name))

  return [...new Set([...componentFiles, ...layoutFiles, ...viewFiles])]
}

const files = await collectRelevantVueFiles()
const classes = new Set()
for (const file of files) {
  const source = await readFile(file, 'utf8')
  for (const match of source.matchAll(/(?:^|\s)class\s*=\s*(["'])(.*?)\1/gs)) {
    addTokens(match[2], classes)
  }
  for (const match of source.matchAll(/(?:\:class|v-bind:class)\s*=\s*(["'])(.*?)\1/gs)) {
    addStringLiterals(match[2], classes)
  }
  for (const match of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    addStringLiterals(match[1], classes, true)
  }
}

const fontWeightClasses = ['font-medium', 'font-semibold']
for (const token of fontWeightClasses) classes.add(token)

const assets = (await readdir(assetsDir)).filter(name => name.endsWith('.css')).sort()
if (assets.length === 0) throw new Error('No built CSS found. Run pnpm build first.')
const cssFiles = assets.map(file => join(assetsDir, file))
const css = (await Promise.all(cssFiles.map(async file => readFile(file, 'utf8')))).join('\n')
const missing = [...classes].filter(token => !hasSelector(css, token)).sort()

console.log(
  `Checked ${classes.size} class tokens in ${files.length} shared component/layout/view vue files against ${cssFiles.length} CSS asset file(s).`
)
console.log(
  `Font-weight selectors: ${fontWeightClasses.map(token => `${token}=${hasSelector(css, token) ? 'present' : 'MISSING'}`).join(', ')}`
)
if (missing.length > 0) {
  console.error(`Missing CSS selectors (${missing.length}): ${missing.join(', ')}`)
  process.exitCode = 1
} else {
  console.log('Missing CSS selectors: none')
}
