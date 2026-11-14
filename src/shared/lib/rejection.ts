// Rejections the user can fix by editing the reading. Everything else (id_conflict,
// payload_too_large, invalid_uuid, an unknown code) can only be deleted (decision 2026-11-14).
const FIXABLE = new Set([
  'out_of_range',
  'recorded_at_in_future',
  'tank_not_found',
  'invalid_datetime',
  'invalid_format',
  'invalid_type',
  'required',
  'too_long',
  'not_allowed',
])

const MESSAGE_KEYS: Partial<Record<string, string>> = {
  out_of_range: 'sync.rejected.out_of_range',
  recorded_at_in_future: 'sync.rejected.recorded_at_in_future',
  tank_not_found: 'sync.rejected.tank_not_found',
  id_conflict: 'sync.rejected.cannot_fix',
  invalid_uuid: 'sync.rejected.cannot_fix',
  payload_too_large: 'sync.rejected.payload_too_large',
  invalid_datetime: 'sync.rejected.general',
  invalid_format: 'sync.rejected.general',
  invalid_type: 'sync.rejected.general',
  required: 'sync.rejected.general',
  too_long: 'sync.rejected.general',
  not_allowed: 'sync.rejected.general',
}

// The i18n key of the message for the error code the server gave a rejected reading.
export function rejectionMessageKey(code: string | undefined): string {
  return (code ? MESSAGE_KEYS[code] : undefined) ?? 'sync.rejected.unknown'
}

export function isFixable(code: string | undefined): boolean {
  return code !== undefined && FIXABLE.has(code)
}