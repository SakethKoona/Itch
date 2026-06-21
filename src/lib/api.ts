import type { WorkspaceJSON } from './serialize'

export async function compileEnv(payload: WorkspaceJSON): Promise<void> {
  const res = await fetch('/api/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
}
