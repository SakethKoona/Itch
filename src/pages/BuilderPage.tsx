import { useState, useMemo, useRef } from 'react'
import { ArrowLeft, Loader2, Check, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BlocksTab } from '@/components/BlocksTab'
import { WorkspaceTab } from '@/components/WorkspaceTab'
import { CompletenessChecker } from '@/components/CompletenessChecker'
import { useTutorial } from '@/components/TutorialOverlay'
import { serializeWorkspace } from '@/lib/serialize'
import { compileEnv } from '@/lib/api'
import { upsertEnv, type SavedEnv } from '@/lib/storage'
import type { Block, BlockType, TaskBlock, TaskSetBlock } from '@/lib/types'

// ── Right panel ───────────────────────────────────────────────────────────────

function RightPanel() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="shrink-0 px-4 py-2.5 border-b border-border">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Results</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16 text-center px-6">
        <p className="text-[13px] font-medium text-muted-foreground">No results yet</p>
        <p className="text-[11px] text-muted-foreground/50 leading-snug">
          Run training to see how your agent performed.
        </p>
      </div>
    </div>
  )
}

// ── Builder page ──────────────────────────────────────────────────────────────

type Props = {
  initial: SavedEnv
  onBack: (saved: SavedEnv) => void
}

export function BuilderPage({ initial, onBack }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(initial.blocks)
  const [name, setName] = useState(initial.name)
  const [compiling, setCompiling] = useState(false)
  const [compileError, setCompileError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  const { show: showTutorial } = useTutorial()
  const workspaceJSON = useMemo(() => serializeWorkspace(blocks), [blocks])
  const envBlockExists = blocks.some(b => b.type === 'env')

  const currentEnv = (): SavedEnv => ({
    ...initial,
    name: name.trim() || 'Untitled Environment',
    blocks,
    updatedAt: new Date().toISOString(),
  })

  const handleSave = () => {
    upsertEnv(currentEnv())
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1800)
  }

  const handleBack = () => {
    const env = currentEnv()
    upsertEnv(env)
    onBack(env)
  }

  const handleBlockDrop = (type: BlockType, x: number, y: number) => {
    if (type === 'env' && envBlockExists) return
    const id = crypto.randomUUID()
    let newBlock: Block
    if (type === 'env') {
      newBlock = { id, type: 'env', description: '', x, y }
    } else if (type === 'tool') {
      newBlock = { id, type: 'tool', name: '', functionality: '', inputs: [], x, y }
    } else if (type === 'taskset') {
      newBlock = { id, type: 'taskset', name: '', children: [], x, y }
    } else if (type === 'database') {
      newBlock = { id, type: 'database', name: '', description: '', x, y }
    } else {
      newBlock = { id, type: 'task', prompt: '', graders: [], x, y }
    }
    setBlocks(prev => [...prev, newBlock])
  }

  const handleBlockUpdate = (id: string, patch: Partial<Block>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...patch } as Block : b))
  }

  const handleBlocksBatchUpdate = (updates: { id: string; patch: Partial<Block> }[]) => {
    setBlocks(prev => {
      let next = [...prev]
      for (const { id, patch } of updates) {
        next = next.map(b => b.id === id ? { ...b, ...patch } as Block : b)
      }
      return next
    })
  }

  const handleBlockDelete = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  // Absorb a canvas task block into a TaskSet's children
  const handleTaskAbsorb = (taskId: string, taskSetId: string) => {
    setBlocks(prev => {
      const task = prev.find(b => b.id === taskId) as TaskBlock | undefined
      if (!task) return prev
      const child: TaskBlock = { ...task, x: 0, y: 0 }
      return prev
        .filter(b => b.id !== taskId)
        .map(b =>
          b.id === taskSetId && b.type === 'taskset'
            ? { ...b, children: [...(b as TaskSetBlock).children, child] } as Block
            : b,
        )
    })
  }

  // Eject a child task from a TaskSet back onto the canvas
  const handleTaskPopOut = (taskSetId: string, task: TaskBlock) => {
    setBlocks(prev => {
      const taskSet = prev.find(b => b.id === taskSetId) as TaskSetBlock | undefined
      if (!taskSet) return prev
      const ejected: TaskBlock = {
        ...task,
        x: taskSet.x + 360,
        y: taskSet.y,
      }
      return prev
        .map(b =>
          b.id === taskSetId
            ? { ...b, children: (b as TaskSetBlock).children.filter(c => c.id !== task.id) } as Block
            : b,
        )
        .concat(ejected)
    })
  }

  const handleCompile = async () => {
    setCompiling(true)
    setCompileError(null)
    try {
      await compileEnv(workspaceJSON)
    } catch (e) {
      setCompileError(String(e))
    } finally {
      setCompiling(false)
    }
  }

  const toolCount = blocks.filter(b => b.type === 'tool').length
  const taskCount = blocks.filter(b => b.type === 'task').length

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-2.5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="size-3.5" />
          Environments
        </button>

        <Separator orientation="vertical" className="h-4" />

        <input
          ref={nameRef}
          className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none border-none p-0"
          value={name}
          placeholder="Untitled Environment"
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && nameRef.current?.blur()}
        />

        <Separator orientation="vertical" className="h-4" />

        <span className="text-xs text-muted-foreground shrink-0">
          {toolCount} tool{toolCount !== 1 ? 's' : ''} · {taskCount} task{taskCount !== 1 ? 's' : ''}
        </span>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            type="button"
            onClick={showTutorial}
            title="How it works"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
            style={{ color: 'oklch(0.40 0.04 62)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.92 0.015 75)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <HelpCircle className="size-3.5" />
            How it works
          </button>
          <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5">
            {savedFlash
              ? <><Check className="size-3.5 text-emerald-600" /><span className="text-emerald-600">Saved</span></>
              : 'Save'
            }
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={blocks.length === 0 || compiling}
            onClick={handleCompile}
            className="gap-1.5"
          >
            {compiling && <Loader2 className="size-3.5 animate-spin" />}
            Compile
          </Button>
        </div>
      </header>

      {compileError && (
        <div className="shrink-0 bg-destructive/10 border-b border-destructive/20 px-6 py-2 text-sm text-destructive">
          {compileError}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Block palette */}
        <aside className="w-52 shrink-0 border-r border-border flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Blocks</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <BlocksTab envBlockExists={envBlockExists} />
          </div>
        </aside>

        {/* Middle: Canvas */}
        <main className="flex-1 overflow-hidden border-r border-border flex flex-col">
          <div className="px-4 py-2.5 border-b border-border shrink-0 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Workspace
              {blocks.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
                  {blocks.length}
                </span>
              )}
            </p>
            {blocks.length > 0 && (
              <Button variant="ghost" size="xs" onClick={() => setBlocks([])} className="text-muted-foreground hover:text-destructive">
                Clear all
              </Button>
            )}
          </div>
          <div className="relative flex-1 overflow-hidden">
            <WorkspaceTab
              blocks={blocks}
              onBlockDrop={handleBlockDrop}
              onBlockUpdate={handleBlockUpdate}
              onBlocksBatchUpdate={handleBlocksBatchUpdate}
              onBlockDelete={handleBlockDelete}
              onTaskPopOut={handleTaskPopOut}
              onTaskAbsorb={handleTaskAbsorb}
            />
            <CompletenessChecker blocks={blocks} />
          </div>
        </main>

        {/* Right panel */}
        <aside className="w-72 shrink-0 flex flex-col overflow-hidden border-l border-border">
          <RightPanel />
        </aside>
      </div>
    </div>
  )
}
