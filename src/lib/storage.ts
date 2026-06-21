import type { Block } from './types'

export type SavedEnv = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  blocks: Block[]
}

const KEY = 'rl-env-builder:environments'

export function loadEnvs(): SavedEnv[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function upsertEnv(env: SavedEnv): void {
  const all = loadEnvs()
  const idx = all.findIndex(e => e.id === env.id)
  if (idx >= 0) all[idx] = env
  else all.unshift(env)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function deleteEnv(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(loadEnvs().filter(e => e.id !== id)))
}
