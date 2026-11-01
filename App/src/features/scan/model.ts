import { state } from '../../shared/store'

export interface Scan { id: string; mode: 'Plant' | 'Disease' | 'Mushroom'; image: string; date: string; plantName?: string }

export function addScan(scan: Omit<Scan, 'id' | 'date'>) {
  state.value.scans.unshift({ ...scan, id: crypto.randomUUID(), date: new Date().toISOString() })
}
