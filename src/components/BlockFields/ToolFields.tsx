import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ToolBlock, ToolInput, ToolInputType } from '@/lib/types'

const INPUT_TYPES: ToolInputType[] = ['string', 'number', 'boolean', 'array', 'object']

const TYPE_COLORS: Record<ToolInputType, string> = {
  string:  '#6366f1',
  number:  '#10b981',
  boolean: '#f59e0b',
  array:   '#8b5cf6',
  object:  '#3b82f6',
}

type Props = {
  block: ToolBlock
  onUpdate: (patch: Partial<ToolBlock>) => void
}

type InputRowProps = {
  input: ToolInput
  onChange: (patch: Partial<ToolInput>) => void
  onDelete: () => void
}

function InputRow({ input, onChange, onDelete }: InputRowProps) {
  const color = TYPE_COLORS[input.inputType]
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-white/50 px-2.5 py-2 ring-1 ring-black/5">
      {/* Top row: type select + name + required + delete */}
      <div className="flex items-center gap-1.5">
        <select
          value={input.inputType}
          onChange={e => onChange({ inputType: e.target.value as ToolInputType })}
          className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white border-0 cursor-pointer focus:outline-none"
          style={{ backgroundColor: color }}
        >
          {INPUT_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input
          type="text"
          className="flex-1 min-w-0 rounded border border-black/10 bg-white/80 px-1.5 py-0.5 text-[11px] font-mono placeholder:text-black/25 focus:outline-none focus:ring-1 focus:ring-black/20"
          placeholder="param_name"
          value={input.name}
          onChange={e => onChange({ name: e.target.value })}
        />

        <label className="flex items-center gap-1 shrink-0 cursor-pointer select-none">
          <input
            type="checkbox"
            className="size-3 cursor-pointer"
            style={{ accentColor: '#6366f1' }}
            checked={input.required}
            onChange={e => onChange({ required: e.target.checked })}
          />
          <span className="text-[10px] text-black/40">req</span>
        </label>

        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 rounded p-0.5 text-black/25 hover:text-black/60 transition-colors"
        >
          <X className="size-3" />
        </button>
      </div>

      {/* Description */}
      <input
        type="text"
        className="w-full rounded border border-black/10 bg-white/80 px-2 py-1 text-[11px] placeholder:text-black/25 focus:outline-none focus:ring-1 focus:ring-black/20"
        placeholder="What this parameter is for…"
        value={input.description}
        onChange={e => onChange({ description: e.target.value })}
      />
    </div>
  )
}

export function ToolFields({ block, onUpdate }: Props) {
  const [dropActive, setDropActive] = useState(false)

  const updateInput = (id: string, patch: Partial<ToolInput>) =>
    onUpdate({ inputs: block.inputs.map(i => i.id === id ? { ...i, ...patch } : i) })

  const deleteInput = (id: string) =>
    onUpdate({ inputs: block.inputs.filter(i => i.id !== id) })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.getData('blockType') !== 'tool-input') {
      // peek at type during dragover isn't reliable in all browsers; allow and filter on drop
    }
    setDropActive(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDropActive(false)
    if (e.dataTransfer.getData('blockType') !== 'tool-input') return
    onUpdate({
      inputs: [...block.inputs, {
        id: crypto.randomUUID(),
        name: '',
        inputType: 'string',
        description: '',
        required: false,
      }],
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-black/40">Name</label>
        <input
          type="text"
          className="w-full rounded border border-black/10 bg-white/70 px-2.5 py-1.5 text-xs font-mono placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
          placeholder="e.g. run_python"
          value={block.name}
          onChange={e => onUpdate({ name: e.target.value })}
        />
      </div>

      {/* Functionality */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-black/40">Functionality</label>
        <textarea
          rows={2}
          className="w-full resize-none rounded border border-black/10 bg-white/70 px-2.5 py-2 text-xs placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/20 leading-relaxed"
          placeholder="Describe what this tool does…"
          value={block.functionality}
          onChange={e => onUpdate({ functionality: e.target.value })}
        />
      </div>

      {/* Input list */}
      {block.inputs.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-black/40">Inputs</label>
            <span className="text-[10px] text-black/30">
              {block.inputs.length} param{block.inputs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="relative flex flex-col gap-1 pl-4">
            <div className="absolute left-[7px] bg-black/10" style={{ top: 14, bottom: 14, width: 2 }} />
            {block.inputs.map(input => (
              <div key={input.id} className="relative">
                <div className="absolute bg-black/10" style={{ left: -9, top: '50%', width: 10, height: 2, transform: 'translateY(-50%)' }} />
                <InputRow
                  input={input}
                  onChange={p => updateInput(input.id, p)}
                  onDelete={() => deleteInput(input.id)}
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
          dropActive ? 'border-indigo-400 bg-indigo-50/40' : 'border-black/12 bg-white/20'
        )}
      >
        <p className="text-[10px] text-black/35 leading-snug">
          {block.inputs.length === 0
            ? <>Drop an <span className="font-semibold">Input</span> block here</>
            : <span className="font-semibold">+ drop another input</span>
          }
        </p>
      </div>
    </div>
  )
}
