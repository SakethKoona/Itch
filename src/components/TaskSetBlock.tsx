import { useState } from 'react'
import { GripVertical, Trash2, ArrowUpRight, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { TaskFields } from './BlockFields/TaskFields'
import { BLOCK_COLORS } from '@/lib/blockColors'
import { KNOB_H, KNOB_W, KNOB_LEFT } from './WorkspaceBlock'
import type { TaskSetBlock, TaskBlock } from '@/lib/types'

const ARM_W = 20         // width of the left arm of the C
const TASKSET_W = 340    // outer width of the C-block

type Props = {
  block: TaskSetBlock
  onUpdate: (patch: Partial<TaskSetBlock>) => void
  onDelete: () => void
  onGripMouseDown: (e: React.MouseEvent) => void
  onPopOut: (task: TaskBlock) => void  // eject a child task to the canvas
}

function ChildTaskCard({
  task,
  index,
  onUpdate,
  onDelete,
  onPopOut,
}: {
  task: TaskBlock
  index: number
  onUpdate: (patch: Partial<TaskBlock>) => void
  onDelete: () => void
  onPopOut: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const taskColors = BLOCK_COLORS['task']
  const Chevron = collapsed ? ChevronRight : ChevronDown

  const preview = task.prompt.trim()
    ? (task.prompt.length > 40 ? task.prompt.slice(0, 40) + '…' : task.prompt)
    : 'No prompt'
  const graderCount = task.graders.length

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ boxShadow: `0 4px 0 0 ${taskColors.dark}, 0 6px 16px rgba(60,40,20,0.18), inset 0 1px 0 rgba(255,255,255,0.12)` }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5"
        style={{ backgroundColor: taskColors.bg }}
      >
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          onMouseDown={e => e.stopPropagation()}
          className="shrink-0 rounded p-0.5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        >
          <Chevron className="size-3" />
        </button>

        {collapsed ? (
          <span className="flex-1 min-w-0 text-[10px] text-white/80 truncate">
            <span className="font-bold text-white">Task {index + 1}</span>
            {' '}
            <span className="opacity-70">{preview}{graderCount > 0 ? `  ·  ${graderCount}g` : ''}</span>
          </span>
        ) : (
          <span className="text-[10px] font-bold text-white uppercase tracking-wider flex-1">
            Task {index + 1}
          </span>
        )}

        <button
          type="button"
          title="Pop out to canvas"
          onClick={onPopOut}
          onMouseDown={e => e.stopPropagation()}
          className="shrink-0 rounded p-0.5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        >
          <ArrowUpRight className="size-3" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          onMouseDown={e => e.stopPropagation()}
          className="shrink-0 rounded p-0.5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        >
          <Trash2 className="size-3" />
        </button>
      </div>

      {/* Task fields — hidden when collapsed */}
      {!collapsed && (
        <div className="p-2.5" style={{ backgroundColor: taskColors.light }}>
          <TaskFields block={task} onUpdate={p => onUpdate(p as Partial<TaskBlock>)} />
        </div>
      )}
    </div>
  )
}

export function TaskSetBlock({ block, onUpdate, onDelete, onGripMouseDown, onPopOut }: Props) {
  const [dropActive, setDropActive] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const colors = BLOCK_COLORS['taskset']
  const Chevron = collapsed ? ChevronRight : ChevronDown

  const addChildTask = () => {
    const id = crypto.randomUUID()
    const newTask: TaskBlock = { id, type: 'task', prompt: '', graders: [], x: 0, y: 0 }
    onUpdate({ children: [...block.children, newTask] })
  }

  const updateChild = (childId: string, patch: Partial<TaskBlock>) => {
    onUpdate({
      children: block.children.map(c => c.id === childId ? { ...c, ...patch } : c),
    })
  }

  const deleteChild = (childId: string) => {
    onUpdate({ children: block.children.filter(c => c.id !== childId) })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.getData('blockType') === 'task' || true) {
      setDropActive(true)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDropActive(false)
    const type = e.dataTransfer.getData('blockType')
    if (type !== 'task') return
    const id = crypto.randomUUID()
    const newTask: TaskBlock = { id, type: 'task', prompt: '', graders: [], x: 0, y: 0 }
    onUpdate({ children: [...block.children, newTask] })
  }

  return (
    <div
      className="relative select-none"
      style={{ paddingTop: KNOB_H, width: TASKSET_W }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Top socket */}
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

      {/* Header */}
      <div
        className="flex items-center gap-1.5 px-3 py-2.5 cursor-grab active:cursor-grabbing rounded-t-xl"
        style={{
          backgroundColor: colors.bg,
          borderRadius: collapsed ? 12 : '12px 12px 0 0',
        }}
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
          <span className="flex-1 min-w-0 text-[10px] text-white/80 truncate">
            <span className="font-bold uppercase tracking-wider text-white">
              {block.name.trim() || 'Task Set'}
            </span>
            {' '}
            <span className="opacity-70">
              {block.children.length} task{block.children.length !== 1 ? 's' : ''}
            </span>
          </span>
        ) : (
          <input
            className="flex-1 min-w-0 bg-transparent text-[11px] font-bold text-white uppercase tracking-wider placeholder:text-white/40 focus:outline-none"
            placeholder="Task Set name…"
            value={block.name}
            onChange={e => onUpdate({ name: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
          />
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

      {/* C-body: left arm + mouth — hidden when collapsed */}
      {!collapsed && (
        <>
          <div className="flex" style={{ minHeight: 64 }}>
            {/* Left arm */}
            <div style={{ width: ARM_W, backgroundColor: colors.bg, flexShrink: 0 }} />

            {/* Mouth / inner area — data-taskset-mouth used for canvas-drag hit testing */}
            <div
              data-taskset-mouth={block.id}
              className="flex-1 flex flex-col gap-2 p-2 transition-colors"
              style={{ backgroundColor: colors.light }}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={() => setDropActive(false)}
              onDrop={handleDrop}
            >
              {block.children.map((task, i) => (
                <ChildTaskCard
                  key={task.id}
                  task={task}
                  index={i}
                  onUpdate={p => updateChild(task.id, p)}
                  onDelete={() => deleteChild(task.id)}
                  onPopOut={() => onPopOut(task)}
                />
              ))}

              {/* Drop zone / add button */}
              <div
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed py-2.5 transition-colors"
                style={{
                  borderColor: dropActive ? colors.bg : 'rgba(0,0,0,0.12)',
                  backgroundColor: dropActive ? `${colors.bg}18` : 'transparent',
                }}
              >
                <button
                  type="button"
                  onClick={addChildTask}
                  className="flex items-center gap-1.5 text-[10px] font-medium"
                  style={{ color: colors.bg }}
                  onMouseDown={e => e.stopPropagation()}
                >
                  <Plus className="size-3" />
                  Add task  ·  or drop a Task block here
                </button>
              </div>
            </div>
          </div>

          {/* Bottom cap */}
          <div
            className="rounded-b-xl"
            style={{ height: 14, backgroundColor: colors.bg }}
          />
        </>
      )}

      {/* Bottom peg */}
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
    </div>
  )
}
