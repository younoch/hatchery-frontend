// A temporary password for a new user or a reset: 10 characters with at least one letter and one
// digit (the backend rule), without characters that look alike (0 O 1 l I). The admin hands it to
// the user; the app shows it once and never stores it.
const LETTERS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
const DIGITS = '23456789'

function randomIndex(max: number): number {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return (values[0] ?? 0) % max
}

export function generateTemporaryPassword(length = 10): string {
  const all = LETTERS + DIGITS
  const chars = [
    LETTERS.charAt(randomIndex(LETTERS.length)),
    DIGITS.charAt(randomIndex(DIGITS.length)),
  ]
  while (chars.length < length) chars.push(all.charAt(randomIndex(all.length)))
  // Shuffled, so the guaranteed letter and digit are not always first.
  return chars
    .map(char => ({ char, key: randomIndex(1_000_000_000) }))
    .sort((a, b) => a.key - b.key)
    .map(item => item.char)
    .join('')
}