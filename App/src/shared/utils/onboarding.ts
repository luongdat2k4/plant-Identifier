const key = 'plantin-onboarded'

/** True once the intro screens have been seen (or skipped). Storage failures count as "seen" so the app is never blocked. */
export function hasOnboarded(): boolean {
  try { return localStorage.getItem(key) === '1' } catch { return true }
}
export function markOnboarded() {
  try { localStorage.setItem(key, '1') } catch { /* storage unavailable */ }
}
