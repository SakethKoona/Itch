import { useRef, useState, useEffect, useCallback } from 'react'
import { LayoutGrid } from 'lucide-react'
import { WorkspaceBlock } from './WorkspaceBlock'
import { TaskSetBlock } from './TaskSetBlock'
import type { Block, BlockType, TaskBlock, TaskSetBlock as TaskSetBlockType } from '@/lib/types'
import { isConnectable } from '@/lib/types'

type Props = {
  blocks: Block[]
  onBlockDrop: (type: BlockType, x: number, y: number) => void
  onBlockUpdate: (id: string, patch: Partial<Block>) => void
  onBlocksBatchUpdate: (updates: { id: string; patch: Partial<Block> }[]) => void
  onBlockDelete: (id: string) => void
  onTaskPopOut: (taskSetId: string, task: TaskBlock) => void
  onTaskAbsorb: (taskId: string, taskSetId: string) => void
}

type View = { x: number; y: number; scale: number }
type PanState = { mouseX: number; mouseY: number; viewX: number; viewY: number }
type BlockDrag = { id: string; offsetX: number; offsetY: number; chainIds: string[] }

const SCALE_MIN = 0.2
const SCALE_MAX = 3
const SNAP_PX = 20    // screen pixels for snap detection
const CHAIN_TOL = 4   // world pixels for chain detection

function computeChain(
  startId: string,
  blocks: Block[],
  heights: Map<string, number>,
): string[] {
  const chain = new Set<string>([startId])
  let frontier = blocks.filter(b => b.id === startId)

  while (frontier.length > 0) {
    const next: Block[] = []
    for (const parent of frontier) {
      if (!isConnectable(parent)) continue
      const pH = heights.get(parent.id) ?? 0
      for (const b of blocks) {
        if (chain.has(b.id) || !isConnectable(b)) continue
        if (
          Math.abs(b.y - (parent.y + pH)) < CHAIN_TOL &&
          Math.abs(b.x - parent.x) < CHAIN_TOL
        ) {
          chain.add(b.id)
          next.push(b)
        }
      }
    }
    frontier = next
  }

  return [...chain]
}

// Highlight / un-highlight a taskset mouth element directly (no React re-render)
function setMouthHighlight(taskSetId: string | null, blocks: Block[]) {
  document.querySelectorAll<HTMLElement>('[data-taskset-mouth]').forEach(el => {
    el.style.outline = ''
    el.style.outlineOffset = ''
  })
  if (taskSetId) {
    const ts = blocks.find(b => b.id === taskSetId)
    const colors = ts ? `2px dashed #0d9488` : ''
    const el = document.querySelector<HTMLElement>(`[data-taskset-mouth="${taskSetId}"]`)
    if (el) {
      el.style.outline = '2px dashed #0d9488'
      el.style.outlineOffset = '-2px'
    }
  }
}

// Glow the peg or socket of the snap target
function applySnapGlow(id: string, attr: 'data-block-peg' | 'data-block-socket') {
  const el = document.querySelector<HTMLElement>(`[${attr}="${id}"]`)
  if (el) {
    el.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.95), 0 0 12px 4px rgba(255,255,255,0.6)'
    el.style.transition = 'box-shadow 0.08s ease'
  }
}

function clearSnapGlow(ref: { id: string; attr: string } | null) {
  if (!ref) return
  const el = document.querySelector<HTMLElement>(`[${ref.attr}="${ref.id}"]`)
  if (el) {
    el.style.boxShadow = ''
    el.style.transition = ''
  }
}

// Apply / clear the "lifted" shadow on all blocks in a drag chain
function applyDragLift(ids: string[]) {
  ids.forEach(id => {
    const el = document.querySelector<HTMLElement>(`[data-block-id="${id}"]`)
    if (el) el.style.filter = 'drop-shadow(0 14px 24px rgba(0,0,0,0.45))'
  })
}

function clearDragLift() {
  document.querySelectorAll<HTMLElement>('[data-block-id]').forEach(el => {
    el.style.filter = ''
  })
}

export function WorkspaceTab({
  blocks,
  onBlockDrop,
  onBlockUpdate,
  onBlocksBatchUpdate,
  onBlockDelete,
  onTaskPopOut,
  onTaskAbsorb,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<View>({ x: 40, y: 40, scale: 1 })
  const blockHeightsRef = useRef<Map<string, number>>(new Map())
  const hoveredTaskSetRef = useRef<string | null>(null)
  const snapHighlightRef = useRef<{ id: string; attr: string } | null>(null)
  const [view, setViewState] = useState<View>({ x: 40, y: 40, scale: 1 })
  const [panStart, setPanStart] = useState<PanState | null>(null)
  const [blockDrag, setBlockDrag] = useState<BlockDrag | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const setView = useCallback((v: View) => {
    viewRef.current = v
    setViewState(v)
  }, [])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
      const v = viewRef.current
      const newScale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, v.scale * factor))
      const worldX = (mouseX - v.x) / v.scale
      const worldY = (mouseY - v.y) / v.scale
      setView({ scale: newScale, x: mouseX - worldX * newScale, y: mouseY - worldY * newScale })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [setView])

  const toWorld = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const v = viewRef.current
    return {
      x: (clientX - rect.left - v.x) / v.scale,
      y: (clientY - rect.top - v.y) / v.scale,
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return
    e.preventDefault()
    const v = viewRef.current
    setPanStart({ mouseX: e.clientX, mouseY: e.clientY, viewX: v.x, viewY: v.y })
  }

  const handleGripMouseDown = (e: React.MouseEvent, block: Block) => {
    e.preventDefault()
    e.stopPropagation()
    const world = toWorld(e.clientX, e.clientY)
    const chainIds = computeChain(block.id, blocks, blockHeightsRef.current)
    applyDragLift(chainIds)
    setBlockDrag({
      id: block.id,
      offsetX: world.x - block.x,
      offsetY: world.y - block.y,
      chainIds,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (panStart) {
      const v = viewRef.current
      setView({
        ...v,
        x: panStart.viewX + e.clientX - panStart.mouseX,
        y: panStart.viewY + e.clientY - panStart.mouseY,
      })
      return
    }

    if (blockDrag) {
      const world = toWorld(e.clientX, e.clientY)
      const scale = viewRef.current.scale
      const SNAP = SNAP_PX / scale

      let newX = world.x - blockDrag.offsetX
      let newY = world.y - blockDrag.offsetY

      // Snap dragged connectable block to nearby connectable blocks
      const dragged = blocks.find(b => b.id === blockDrag.id)
      let newSnapId: string | null = null
      let newSnapAttr: 'data-block-peg' | 'data-block-socket' | null = null

      if (dragged && isConnectable(dragged)) {
        const draggedEl = document.querySelector(`[data-block-id="${blockDrag.id}"]`) as HTMLElement
        const draggedH = draggedEl ? draggedEl.offsetHeight / scale : 0

        for (const block of blocks) {
          if (blockDrag.chainIds.includes(block.id) || !isConnectable(block)) continue
          const el = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement
          if (!el) continue
          const blockH = el.offsetHeight / scale

          // Snap top of dragged → bottom of target (dragged goes below)
          if (Math.abs(newY - (block.y + blockH)) < SNAP && Math.abs(newX - block.x) < SNAP * 2) {
            newY = block.y + blockH
            newX = block.x
            newSnapId = block.id
            newSnapAttr = 'data-block-peg'
            break
          }
          // Snap bottom of dragged → top of target (dragged goes above)
          if (Math.abs((newY + draggedH) - block.y) < SNAP && Math.abs(newX - block.x) < SNAP * 2) {
            newY = block.y - draggedH
            newX = block.x
            newSnapId = block.id
            newSnapAttr = 'data-block-socket'
            break
          }
        }
      }

      // Update snap glow
      const prev = snapHighlightRef.current
      if (newSnapId && newSnapAttr) {
        if (!prev || prev.id !== newSnapId || prev.attr !== newSnapAttr) {
          clearSnapGlow(prev)
          applySnapGlow(newSnapId, newSnapAttr)
          snapHighlightRef.current = { id: newSnapId, attr: newSnapAttr }
        }
      } else if (prev) {
        clearSnapGlow(prev)
        snapHighlightRef.current = null
      }

      // Compute delta from current position of dragged block
      const draggedBlock = blocks.find(b => b.id === blockDrag.id)
      if (!draggedBlock) return
      const dx = newX - draggedBlock.x
      const dy = newY - draggedBlock.y

      // Move entire chain
      const updates = blockDrag.chainIds.map(id => {
        const b = blocks.find(b => b.id === id)!
        return { id, patch: { x: b.x + dx, y: b.y + dy } as Partial<Block> }
      })
      onBlocksBatchUpdate(updates)

      // If dragging a task, check if it's hovering over a TaskSet mouth (DOM hit-test)
      if (draggedBlock.type === 'task') {
        let foundId: string | null = null
        document.querySelectorAll<HTMLElement>('[data-taskset-mouth]').forEach(el => {
          const rect = el.getBoundingClientRect()
          if (
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top  && e.clientY <= rect.bottom
          ) {
            foundId = el.dataset.tasksetMouth ?? null
          }
        })
        if (foundId !== hoveredTaskSetRef.current) {
          hoveredTaskSetRef.current = foundId
          setMouthHighlight(foundId, blocks)
        }
      }
    }
  }

  const handleMouseUp = () => {
    const absorbed = hoveredTaskSetRef.current
    const dragId = blockDrag?.id
    hoveredTaskSetRef.current = null
    setMouthHighlight(null, blocks)
    clearSnapGlow(snapHighlightRef.current)
    snapHighlightRef.current = null
    clearDragLift()
    setPanStart(null)
    setBlockDrag(null)

    // Absorb the dragged task into the hovered TaskSet
    if (absorbed && dragId) {
      const dragged = blocks.find(b => b.id === dragId)
      if (dragged?.type === 'task') {
        onTaskAbsorb(dragId, absorbed)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const type = e.dataTransfer.getData('blockType')
    if (!type || type === 'answer-check' || type === 'state-check' || type === 'tool-input') return
    const world = toWorld(e.clientX, e.clientY)
    onBlockDrop(type as BlockType, world.x - 160, world.y - 20)
  }

  const cursor = panStart ? 'grabbing' : blockDrag ? 'grabbing' : 'grab'

  let taskCounter = 0

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundColor: 'oklch(0.94 0.016 82)',
        backgroundImage: 'radial-gradient(oklch(0.16 0.035 58 / 0.09) 1.4px, transparent 1.4px)',
        backgroundSize: `${24 * view.scale}px ${24 * view.scale}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
      }}
    >
      <div
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Transform layer */}
        <div
          style={{
            position: 'absolute',
            transformOrigin: '0 0',
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          {blocks.map(block => {
            const taskIndex = block.type === 'task' ? taskCounter++ : undefined
            // Blocks higher on screen (lower y) get higher z-index so their bottom pegs
            // render above the socket area of the block below them.
            const zIndex = Math.max(1, 10000 - Math.round(block.y))

            return (
              <div
                key={block.id}
                data-block-id={block.id}
                ref={el => { if (el) blockHeightsRef.current.set(block.id, el.offsetHeight) }}
                style={{ position: 'absolute', left: block.x, top: block.y, zIndex }}
              >
                {block.type === 'taskset' ? (
                  <TaskSetBlock
                    block={block}
                    onUpdate={p => onBlockUpdate(block.id, p as Partial<Block>)}
                    onDelete={() => onBlockDelete(block.id)}
                    onGripMouseDown={e => handleGripMouseDown(e, block)}
                    onPopOut={task => onTaskPopOut(block.id, task)}
                  />
                ) : (
                  <WorkspaceBlock
                    block={block}
                    taskIndex={taskIndex}
                    onUpdate={patch => onBlockUpdate(block.id, patch)}
                    onDelete={() => onBlockDelete(block.id)}
                    onGripMouseDown={e => handleGripMouseDown(e, block)}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {dragOver && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-primary/40 bg-primary/5" />
      )}

      {blocks.length === 0 && !dragOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center pointer-events-none">
          <LayoutGrid className="size-12 text-muted-foreground/20" />
          <p className="text-sm font-medium text-muted-foreground/40">Drag blocks onto the canvas</p>
          <p className="text-xs text-muted-foreground/30">Scroll to zoom · Drag background to pan</p>
        </div>
      )}

      <div className="absolute bottom-3 right-3 rounded-md bg-background/80 border border-border px-2 py-1 text-[10px] font-mono text-muted-foreground pointer-events-none backdrop-blur-sm">
        {Math.round(view.scale * 100)}%
      </div>
    </div>
  )
}
