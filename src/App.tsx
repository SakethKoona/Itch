import { useState } from 'react'
import { DashboardPage } from '@/pages/DashboardPage'
import { BuilderPage } from '@/pages/BuilderPage'
import { loadEnvs, upsertEnv, type SavedEnv } from '@/lib/storage'

type Page =
  | { name: 'dashboard' }
  | { name: 'builder'; env: SavedEnv }

function newEnv(): SavedEnv {
  const now = new Date().toISOString()
  return { id: crypto.randomUUID(), name: 'Untitled Environment', blocks: [], createdAt: now, updatedAt: now }
}

export default function App() {
  const [envs, setEnvs] = useState<SavedEnv[]>(loadEnvs)
  const [page, setPage] = useState<Page>({ name: 'dashboard' })

  const refreshEnvs = () => setEnvs(loadEnvs())

  const handleNew = () => {
    const env = newEnv()
    upsertEnv(env)
    setEnvs(loadEnvs())
    setPage({ name: 'builder', env })
  }

  const handleOpen = (env: SavedEnv) => {
    setEnvs(loadEnvs())
    setPage({ name: 'builder', env })
  }

  const handleBack = (saved: SavedEnv) => {
    refreshEnvs()
    setPage({ name: 'dashboard' })
    // update the local list with the saved version
    setEnvs(prev => {
      const idx = prev.findIndex(e => e.id === saved.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [saved, ...prev]
    })
  }

  const handleDelete = (id: string) => {
    setEnvs(prev => prev.filter(e => e.id !== id))
  }

  if (page.name === 'builder') {
    return <BuilderPage initial={page.env} onBack={handleBack} />
  }

  return (
    <DashboardPage
      envs={envs}
      onNew={handleNew}
      onOpen={handleOpen}
      onDelete={handleDelete}
    />
  )
}
