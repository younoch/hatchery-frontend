import { readFileSync } from 'fs'
import { resolve } from 'path'

const bnPath = resolve(import.meta.dirname, '../src/shared/locales/bn.json')
const enPath = resolve(import.meta.dirname, '../src/shared/locales/en.json')

const bn = JSON.parse(readFileSync(bnPath, 'utf-8'))
const en = JSON.parse(readFileSync(enPath, 'utf-8'))

function getAllKeys(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const keys = new Set<string>()
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const nestedKeys = getAllKeys(obj[key], fullKey)
      nestedKeys.forEach(k => keys.add(k))
    } else {
      keys.add(fullKey)
    }
  }
  return keys
}

const bnKeys = getAllKeys(bn)
const enKeys = getAllKeys(en)

const missingInEn = [...bnKeys].filter(k => !enKeys.has(k))
const missingInBn = [...enKeys].filter(k => !bnKeys.has(k))

if (missingInEn.length > 0 || missingInBn.length > 0) {
  if (missingInEn.length > 0) {
    console.error('Missing keys in en.json:')
    missingInEn.forEach(k => console.error(`  - ${k}`))
  }
  if (missingInBn.length > 0) {
    console.error('Missing keys in bn.json:')
    missingInBn.forEach(k => console.error(`  - ${k}`))
  }
  process.exit(1)
}

console.log('i18n keys match between bn.json and en.json')
