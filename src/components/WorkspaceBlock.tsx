import { useState } from 'react'
import { Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react'
import { EnvFields } from './BlockFields/EnvFields'
import { ToolFields } from './BlockFields/ToolFields'
import { TaskFields } from './BlockFields/TaskFields'
import { DatabaseFields } from './BlockFields/DatabaseFields'
import { templateForType, isConnectable, hasTopSocket } from '@/lib/types'
import { BLOCK_COLORS } from '@/lib/blockColors'
import type { Block, TaskBlock, ToolBlock, EnvBlock, DatabaseBlock } from '@/lib/types'

export const KNOB_H = 12
export const KNOB_W = 40
export const KNOB_LEFT = 18

type Props = {
  block: Block
  taskIndex?: number
  onUpdate: (patch: Partial<Block>) => void
  onDelete: () => void
  onGripMouseDown: (e: React.MouseEvent) => void
}

function blockSummary(block: Block): string {
  if (block.type === 'env')  return (block as EnvBlock).description.trim() || 'No description'
  if (block.type === 'tool') return (block as ToolBlock).functionality.trim() || 'No functionality'
  if (block.type === 'task') {
    const t = block as TaskBlock
    const prompt = t.prompt.trim()
    const graderCount = t.graders.length
    const preview = prompt ? (prompt.length > 40 ? prompt.slice(0, 40) + '…' : prompt) : 'No prompt'
    return graderCount > 0 ? `${preview}  ·  ${graderCount} grader${graderCount !== 1 ? 's' : ''}` : preview
  }
  if (block.type === 'database') {
    const d = block as DatabaseBlock
    return d.description.trim() || 'No description'
  }
  return ''
}

export function WorkspaceBlock({ block, taskIndex, onUpdate, onDelete, onGripMouseDown }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const tmpl = templateForType(block.type)
  const colors = BLOCK_COLORS[block.type]
  const connectable = isConnectable(block)
  const showTopSocket = hasTopSocket(block)

  const title =
    block.type === 'env'      ? 'Environment' :
    block.type === 'tool'     ? ((block as ToolBlock).name.trim() || 'Tool') :
    block.type === 'database' ? ((block as DatabaseBlock).name.trim() || 'Storage') :
                                `Task ${taskIndex !== undefined ? taskIndex + 1 : ''}`

  const Chevron = collapsed ? ChevronRight : ChevronDown

  return (
    <div
      className="relative select-none"
      style={{ paddingTop: showTopSocket ? KNOB_H : 0 }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Top socket — a recessed hole the peg above slots into */}
      {showTopSocket && (
        <div
          data-block-socket={block.id}
          className="absolute"
          style={{
            top: 0, left: KNOB_LEFT,
            width: KNOB_W, height: KNOB_H,
            background: 'rgba(0,0,0,0.38)',
            borderRadius: '5px 5px 0 0',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.55), inset 0 1px 3px rgba(0,0,0,0.4)',
          }}
        />
      )}

      {/* Main block */}
      <div
        className="w-72 overflow-hidden"
        style={{
          borderRadius: collapsed ? 12 : 12,
          boxShadow: `0 6px 0 0 ${colors.dark}, 0 10px 28px rgba(60,40,20,0.22), inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
      >
        {/* Header — drag handle */}
        <div
          className="flex items-center gap-1.5 px-3 py-2.5 cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: colors.bg }}
          onMouseDown={onGripMouseDown}
        >
          <GripVertical className="size-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.45)' }} />

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setCollapsed(c => !c) }}
            onMouseDown={e => e.stopPropagation()}
            className="shrink-0 rounded p-0.5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            <Chevron className="size-3" />
          </button>

          {collapsed ? (
            /* Collapsed: show title + one-line preview */
            <span className="flex-1 min-w-0 text-[10px] text-white/80 truncate leading-tight">
              <span className="font-bold uppercase tracking-wider text-white">{tmpl.label} · {title}</span>
              {' '}
              <span className="opacity-70">{blockSummary(block)}</span>
            </span>
          ) : (
            /* Expanded: show title only */
            <span className="text-[11px] font-bold text-white uppercase tracking-wider flex-1 truncate">
              {tmpl.label} · {title}
            </span>
          )}

          <button
            type="button"
            onClick={onDelete}
            onMouseDown={e => e.stopPropagation()}
            className="shrink-0 rounded p-0.5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.55)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {/* Body — hidden when collapsed */}
        {!collapsed && (
          <div className="p-3" style={{ backgroundColor: colors.light }}>
            {block.type === 'env'      && <EnvFields      block={block} onUpdate={p => onUpdate(p as Partial<Block>)} />}
            {block.type === 'tool'     && <ToolFields     block={block} onUpdate={p => onUpdate(p as Partial<Block>)} />}
            {block.type === 'task'     && <TaskFields     block={block} onUpdate={p => onUpdate(p as Partial<Block>)} />}
            {block.type === 'database' && <DatabaseFields block={block as DatabaseBlock} onUpdate={p => onUpdate(p as Partial<Block>)} />}
          </div>
        )}
      </div>

      {/* Bottom peg — raised tab that slots into the socket below */}
      {connectable && (
        <div
          data-block-peg={block.id}
          className="absolute"
          style={{
            bottom: -KNOB_H, left: KNOB_LEFT,
            width: KNOB_W, height: KNOB_H,
            backgroundColor: colors.bg,
            borderRadius: '0 0 6px 6px',
            boxShadow: `0 6px 0 ${colors.dark}, inset 0 2px 0 rgba(255,255,255,0.2), inset -2px 0 0 rgba(0,0,0,0.1), inset 2px 0 0 rgba(255,255,255,0.08)`,
            zIndex: 2,
          }}
        />
      )}
    </div>
  )
}
