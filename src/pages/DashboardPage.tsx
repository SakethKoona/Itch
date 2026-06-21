import { useState } from 'react'
import { Blocks, Plus, Trash2, Wrench, ListChecks, ArrowRight, Sparkles, Package, Headphones, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type SavedEnv, deleteEnv, upsertEnv } from '@/lib/storage'
import { TEMPLATES, forkTemplate } from '@/lib/templates'
import { TutorialOverlay, useTutorial } from '@/components/TutorialOverlay'
import type { Block } from '@/lib/types'

type Props = {
  envs: SavedEnv[]
  onNew: () => void
  onOpen: (env: SavedEnv) => void
  onDelete: (id: string) => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function envStats(blocks: Block[]) {
  const env = blocks.find(b => b.type === 'env')
  const tools = blocks.filter(b => b.type === 'tool').length
  const tasks = blocks.filter(b => b.type === 'task').length
  const description = env?.type === 'env' ? env.description : ''
  return { description, tools, tasks }
}

function EnvCard({ env, onOpen, onDelete }: { env: SavedEnv; onOpen: () => void; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { description, tools, tasks } = envStats(env.blocks)

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-border bg-card hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 overflow-hidden cursor-pointer"
      onClick={onOpen}
    >
      <div className="h-1 w-full" style={{ background: 'linear-gradient(to right, #BE5A2E, #3F7A74, #B26B74)' }} />
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-snug line-clamp-1 text-foreground">
            {env.name}
          </h3>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
            className="shrink-0 opacity-0 group-hover:opacity-100 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
          {description || <span className="italic opacity-50">No environment description</span>}
        </p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {tools > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: '#e8efee', border: '1px solid #c8dbd9', color: '#2d5f59' }}>
                <Wrench className="size-2.5" />
                {tools} {tools === 1 ? 'tool' : 'tools'}
              </span>
            )}
            {tasks > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: '#f5edee', border: '1px solid #e4d0d2', color: '#8a5456' }}>
                <ListChecks className="size-2.5" />
                {tasks} {tasks === 1 ? 'task' : 'tasks'}
              </span>
            )}
            {tools === 0 && tasks === 0 && (
              <span className="text-[10px] text-muted-foreground/50 italic">Empty</span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground/60">{formatDate(env.updatedAt)}</span>
        </div>
      </div>
      <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="size-3.5 text-primary" />
      </div>
      {confirmDelete && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/95 backdrop-blur-sm p-4"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-sm font-medium text-center">Delete "{env.name}"?</p>
          <p className="text-xs text-muted-foreground text-center">This can't be undone.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>Delete</Button>
          </div>
        </div>
      )}
    </div>
  )
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  'tpl-inventory': <Package className="size-4" />,
  'tpl-support':   <Headphones className="size-4" />,
  'tpl-research':  <Search className="size-4" />,
}

function TemplateCard({ template, onUse }: { template: typeof TEMPLATES[0]; onUse: () => void }) {
  const tools = template.blocks.filter(b => b.type === 'tool').length
  const tasks = template.blocks.filter(b => b.type === 'task').length

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 overflow-hidden">
      <div className="h-1 w-full" style={{ background: 'linear-gradient(to right, #f7ebe6, #e8efee, #f5edee)' }} />
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center size-8 rounded-lg shrink-0" style={{ background: '#f7ebe6', color: '#924824' }}>
            {TEMPLATE_ICONS[template.id] ?? <Blocks className="size-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground mb-0.5">{template.name}</h3>
            <p className="text-xs text-muted-foreground leading-snug">{template.tagline}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: '#e8efee', border: '1px solid #c8dbd9', color: '#2d5f59' }}>
              <Wrench className="size-2.5" />
              {tools} {tools === 1 ? 'tool' : 'tools'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: '#f5edee', border: '1px solid #e4d0d2', color: '#8a5456' }}>
              <ListChecks className="size-2.5" />
              {tasks} {tasks === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onUse}
          >
            Use template
          </Button>
        </div>
      </div>
    </div>
  )
}

function WelcomeCard({ onTour }: { onTour: () => void }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border p-6 sm:p-8"
      style={{ background: 'oklch(0.56 0.15 52 / 0.08)', borderColor: 'oklch(0.56 0.15 52 / 0.22)' }}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: '#BE5A2E' }}>
            New here?
          </p>
          <h1 className="font-semibold text-2xl leading-snug" style={{ color: 'oklch(0.16 0.035 58)' }}>
            Build a training world for your AI — no experience needed
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'oklch(0.40 0.04 62)' }}>
            Drag blocks onto the canvas to set up what your agent can do and what it should practice.
            Start from a template or build from scratch.
          </p>
        </div>
        <button
          type="button"
          onClick={onTour}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all"
          style={{ background: '#BE5A2E' }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.filter = '')}
        >
          Take the tour
          <span aria-hidden>→</span>
        </button>
      </div>
    </section>
  )
}

export function DashboardPage({ envs, onNew, onOpen, onDelete }: Props) {
  const { visible: tutorialVisible, dismiss: dismissTutorial, show: showTutorial } = useTutorial()

  const handleDelete = (id: string) => {
    deleteEnv(id)
    onDelete(id)
  }

  const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
    const now = new Date().toISOString()
    const { name, blocks } = forkTemplate(template)
    const env: SavedEnv = { id: crypto.randomUUID(), name, blocks, createdAt: now, updatedAt: now }
    upsertEnv(env)
    onOpen(env)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {tutorialVisible && <TutorialOverlay onDone={dismissTutorial} />}

      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-8 rounded-lg" style={{ background: 'oklch(0.56 0.15 52 / 0.12)' }}>
            <Blocks className="size-4" style={{ color: '#BE5A2E' }} />
          </div>
          <div>
            <p className="font-semibold text-sm tracking-tight">Itch</p>
            <p className="text-[10px] text-muted-foreground">Visual RL environment builder</p>
          </div>
        </div>
        <Button onClick={onNew} size="sm" className="gap-1.5">
          <Plus className="size-3.5" />
          New Environment
        </Button>
      </header>

      {/* Body */}
      <main className="flex-1 px-8 py-8 max-w-5xl mx-auto w-full flex flex-col gap-10">

        <WelcomeCard onTour={showTutorial} />

        {/* Templates section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-3.5 text-primary/60" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Start from a template
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map(t => (
              <TemplateCard key={t.id} template={t} onUse={() => handleUseTemplate(t)} />
            ))}
          </div>
        </section>

        {/* User environments section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Your Environments
              {envs.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground normal-case tracking-normal">
                  {envs.length}
                </span>
              )}
            </h2>
          </div>

          {envs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 rounded-xl border-2 border-dashed border-border text-center">
              <div className="flex items-center justify-center size-12 rounded-xl bg-muted/60">
                <Blocks className="size-5 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No environments yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pick a template above or start from scratch.
                </p>
              </div>
              <Button onClick={onNew} size="sm" variant="outline" className="gap-1.5">
                <Plus className="size-3.5" />
                Start from scratch
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {envs.map(env => (
                <EnvCard
                  key={env.id}
                  env={env}
                  onOpen={() => onOpen(env)}
                  onDelete={() => handleDelete(env.id)}
                />
              ))}
              <button
                type="button"
                onClick={onNew}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border transition-all h-[152px] text-muted-foreground group"
              style={{ '--hover-color': '#BE5A2E' } as React.CSSProperties}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#BE5A2E66'; e.currentTarget.style.background = '#f7ebe6'; e.currentTarget.style.color = '#BE5A2E' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; e.currentTarget.style.color = '' }}
              >
                <Plus className="size-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">New Environment</span>
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
