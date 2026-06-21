import { Cpu, Wrench, ListChecks, Layers, MessageSquare, Activity, Database, Variable } from 'lucide-react'
import { BLOCK_COLORS } from '@/lib/blockColors'
import type { PaletteTemplate } from '@/lib/types'

type Props = {
  template: PaletteTemplate
  disabled?: boolean
}

const ICONS = {
  env: Cpu, tool: Wrench, task: ListChecks, taskset: Layers,
  database: Database,
  'tool-input': Variable,
  'answer-check': MessageSquare, 'state-check': Activity,
}

export function DraggableBlockTemplate({ template, disabled = false }: Props) {
  const Icon = ICONS[template.type]
  const colors = BLOCK_COLORS[template.type]

  return (
    <div
      draggable={!disabled}
      onDragStart={e => {
        if (disabled) return
        e.dataTransfer.setData('blockType', template.type)
        e.dataTransfer.effectAllowed = 'copy'

        const ghost = document.createElement('div')
        ghost.style.cssText = [
          'position:fixed', 'top:-9999px', 'left:-9999px',
          `background:${colors.bg}`,
          `box-shadow:0 3px 0 0 ${colors.dark}`,
          'color:white', 'font-size:11px', 'font-weight:700',
          'letter-spacing:0.05em', 'text-transform:uppercase',
          'padding:6px 14px', 'border-radius:8px',
          'white-space:nowrap', 'pointer-events:none',
        ].join(';')
        ghost.textContent = template.label
        document.body.appendChild(ghost)
        e.dataTransfer.setDragImage(ghost, 14, 14)
        requestAnimationFrame(() => document.body.removeChild(ghost))
      }}
      className="select-none"
      style={{
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'grab',
      }}
    >

      {/* Block chip */}
      <div
        className="rounded-lg overflow-hidden transition-transform active:scale-95"
        style={{ boxShadow: `0 3px 0 0 ${colors.dark}` }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ backgroundColor: colors.bg }}
        >
          <Icon className="size-3.5 text-white shrink-0" />
          <span className="text-[11px] font-bold text-white tracking-wide">{template.label}</span>
          {disabled && (
            <span className="ml-auto text-[10px] text-white/50">added</span>
          )}
        </div>
      </div>
    </div>
  )
}
