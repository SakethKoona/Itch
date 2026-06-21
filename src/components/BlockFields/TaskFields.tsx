import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TaskBlock, Grader, SubBlockType } from '@/lib/types'

type Props = {
  block: TaskBlock
  onUpdate: (patch: Partial<TaskBlock>) => void
}

const GRADER_COLORS = {
  answer: { bg: '#f43f5e', label: 'Answer' },
  state:  { bg: '#f59e0b', label: 'State'  },
}

type GraderRowProps = {
  grader: Grader
  onChange: (patch: Partial<Grader>) => void
  onDelete: () => void
}

function GraderRow({ grader, onChange, onDelete }: GraderRowProps) {
  const c = GRADER_COLORS[grader.graderType]
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-white/50 px-2.5 py-2 ring-1 ring-black/5">
      {/* Top row: badge + weight + delete */}
      <div className="flex items-center gap-1.5">
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: c.bg }}
        >
          {c.label}
        </span>
        <span className="text-[10px] text-black/35 font-medium">weight</span>
        <input
          type="number"
          min={0} max={100}
          className="w-12 rounded border border-black/10 bg-white/80 px-1 py-0.5 text-[11px] text-center focus:outline-none focus:ring-1 focus:ring-black/20"
          value={grader.weight}
          onChange={e => onChange({ weight: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
        />
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto shrink-0 rounded p-0.5 text-black/25 hover:text-black/60 transition-colors"
        >
          <X className="size-3" />
        </button>
      </div>
      {/* Condition textarea */}
      <textarea
        rows={2}
        className="w-full resize-none rounded border border-black/10 bg-white/80 px-2 py-1.5 text-[11px] leading-relaxed placeholder:text-black/25 focus:outline-none focus:ring-1 focus:ring-black/20"
        placeholder={grader.graderType === 'answer'
          ? "agent's answer contains…"
          : "environment state where…"}
        value={grader.condition}
        onChange={e => onChange({ condition: e.target.value })}
      />
    </div>
  )
}

export function TaskFields({ block, onUpdate }: Props) {
  const [dropActive, setDropActive] = useState(false)

  const updateGrader = (id: string, patch: Partial<Grader>) =>
    onUpdate({ graders: block.graders.map(g => g.id === id ? { ...g, ...patch } : g) })

  const deleteGrader = (id: string) =>
    onUpdate({ graders: block.graders.filter(g => g.id !== id) })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDropActive(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDropActive(false)
    const type = e.dataTransfer.getData('blockType') as SubBlockType
    if (type !== 'answer-check' && type !== 'state-check') return
    const newGrader: Grader = {
      id: crypto.randomUUID(),
      graderType: type === 'answer-check' ? 'answer' : 'state',
      weight: 0,
      condition: '',
    }
    const next = [...block.graders, newGrader]
    const n = next.length
    const base = parseFloat((100 / n).toFixed(1))
    const redistributed = next.map((g, i) => ({
      ...g,
      weight: i < n - 1 ? base : parseFloat((100 - base * (n - 1)).toFixed(1)),
    }))
    onUpdate({ graders: redistributed })
  }

  const totalWeight = block.graders.reduce((s, g) => s + g.weight, 0)
  const weightOk = totalWeight === 100

  return (
    <div className="flex flex-col gap-3">
      {/* Prompt */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-black/40">
          Prompt
        </label>
        <textarea
          className="min-h-[60px] w-full resize-none rounded border border-black/10 bg-white/70 px-2.5 py-2 text-xs placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
          placeholder="What should the agent do?"
          value={block.prompt}
          onChange={e => onUpdate({ prompt: e.target.value })}
        />
      </div>

      {/* Grader tree */}
      {block.graders.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-black/40">
              Graders
            </label>
            <span className={cn(
              'text-[10px] font-semibold tabular-nums',
              weightOk ? 'text-emerald-600' : 'text-rose-500'
            )}>
              {totalWeight}/100
            </span>
          </div>

          {/* Tree connector list */}
          <div className="relative flex flex-col gap-1 pl-4">
            {/* Vertical line */}
            <div
              className="absolute left-[7px] bg-black/10"
              style={{ top: 14, bottom: 14, width: 2 }}
            />
            {block.graders.map((grader) => (
              <div key={grader.id} className="relative">
                {/* Horizontal connector */}
                <div
                  className="absolute bg-black/10"
                  style={{ left: -9, top: '50%', width: 10, height: 2, transform: 'translateY(-50%)' }}
                />
                <GraderRow
                  grader={grader}
                  onChange={p => updateGrader(grader.id, p)}
                  onDelete={() => deleteGrader(grader.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={() => setDropActive(false)}
        onDrop={handleDrop}
        className={cn(
          'rounded-lg border-2 border-dashed transition-colors text-center py-3',
          dropActive
            ? 'border-black/30 bg-white/40'
            : 'border-black/12 bg-white/20'
        )}
      >
        <p className="text-[10px] text-black/35 leading-snug">
          {block.graders.length === 0
            ? <>Drop an <span className="font-semibold">Answer Check</span> or <span className="font-semibold">State Check</span> block here</>
            : <span className="font-semibold">+ drop another grader</span>
          }
        </p>
      </div>
    </div>
  )
}
