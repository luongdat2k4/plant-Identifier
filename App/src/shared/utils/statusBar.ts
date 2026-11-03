import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

/** Colours of the phone status bar for each kind of view; they match the page header underneath. */
export const BAR = {
  page: '#f1faf3',
  hero: '#dcebdf',
  white: '#ffffff',
  scanAsk: '#bfe2c6',
  intro: '#e3f3e6',
  camera: '#000000',
} as const

let last = ''

/** Tints the native status bar. `lightBackground` picks dark icons; does nothing outside the native app. */
export async function setStatusBar(color: string, lightBackground = true) {
  const key = `${color}|${lightBackground}`
  if (!Capacitor.isNativePlatform() || key === last) return
  last = key
  try {
    await StatusBar.setBackgroundColor({ color })
    // Capacitor naming: Style.Light = dark icons (for light backgrounds), Style.Dark = light icons.
    await StatusBar.setStyle({ style: lightBackground ? Style.Light : Style.Dark })
  } catch { /* plugin unavailable (older build): keep the system colour */ }
}

function channels(hex: string): number[] {
  const value = hex.replace('#', '')
  return [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16))
}
/** Blends two #rrggbb colours; t = 0 gives `from`, t = 1 gives `to`. */
export function mixColor(from: string, to: string, t: number): string {
  const a = channels(from)
  const b = channels(to)
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('')}`
}
