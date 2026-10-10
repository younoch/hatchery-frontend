import { readFileSync } from 'fs'
import { resolve } from 'path'

const bnPath = resolve(import.meta.dirname, '../src/shared/locales/bn.json')
const enPath = resolve(import.meta.dirname, '../src/shared/locales/en.json')
const styleguideBnPath = resolve(import.meta.dirname, '../src/mobile/views/styleguide.bn.json')
const styleguideEnPath = resolve(import.meta.dirname, '../src/mobile/views/styleguide.en.json')

const bn = JSON.parse(readFileSync(bnPath, 'utf-8'))
const en = JSON.parse(readFileSync(enPath, 'utf-8'))
const styleguideBn = JSON.parse(readFileSync(styleguideBnPath, 'utf-8'))
const styleguideEn = JSON.parse(readFileSync(styleguideEnPath, 'utf-8'))

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

function compareKeys(
  first: Record<string, unknown>,
  second: Record<string, unknown>,
  firstName: string,
  secondName: string
): boolean {
  const firstKeys = getAllKeys(first)
  const secondKeys = getAllKeys(second)
  const missingInSecond = [...firstKeys].filter(key => !secondKeys.has(key))
  const missingInFirst = [...secondKeys].filter(key => !firstKeys.has(key))

  if (missingInSecond.length > 0 || missingInFirst.length > 0) {
    if (missingInSecond.length > 0) {
      console.error(`Missing keys in ${secondName}:`)
      missingInSecond.forEach(key => console.error(`  - ${key}`))
    }
    if (missingInFirst.length > 0) {
      console.error(`Missing keys in ${firstName}:`)
      missingInFirst.forEach(key => console.error(`  - ${key}`))
    }
    return false
  }

  console.log(`i18n keys match between ${firstName} and ${secondName}`)
  return true
}

const sharedLocalesMatch = compareKeys(bn, en, 'bn.json', 'en.json')
const styleguideLocalesMatch = compareKeys(
  styleguideBn,
  styleguideEn,
  'styleguide.bn.json',
  'styleguide.en.json'
)

const heavyBnPath = resolve(import.meta.dirname, '../src/mobile/views/heavy.bn.json')
const heavyEnPath = resolve(import.meta.dirname, '../src/mobile/views/heavy.en.json')
const heavyBn = JSON.parse(readFileSync(heavyBnPath, 'utf-8'))
const heavyEn = JSON.parse(readFileSync(heavyEnPath, 'utf-8'))
const heavyLocalesMatch = compareKeys(heavyBn, heavyEn, 'heavy.bn.json', 'heavy.en.json')

if (!sharedLocalesMatch || !styleguideLocalesMatch || !heavyLocalesMatch) process.exitCode = 1
