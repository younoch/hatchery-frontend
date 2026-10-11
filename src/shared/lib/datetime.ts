function pad(value: number): string {
  return String(value).padStart(2, '0')
}

// Value for <input type="datetime-local"> in the phone's local time.
export function toLocalInputValue(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function localInputToIso(value: string): string {
  return new Date(value).toISOString()
}
