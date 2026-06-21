import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Block, TaskBlock, TaskSetBlock } from '@/lib/types'

type Check = {
  label: string
  detail: string
  status: 'pass' | 'warn' | 'empty'
}

function buildChecks(blocks: Block[]): Check[] {
  const envBlock = blocks.find(b => b.type === 'env')
  const tools = blocks.filter(b => b.type === 'tool')
  const canvasTasks = blocks.filter(b => b.type === 'task') as TaskBlock[]
  const taskSetChildren = (blocks.filter(b => b.type === 'taskset') as TaskSetBlock[])
    .flatMap(ts => ts.children)
  const tasks = [...canvasTasks, ...taskSetChildren]
  const tasksWithoutGraders = tasks.filter(t => t.graders.length === 0)
  const tasksWithBadWeights = tasks.filter(t =>
    t.graders.length > 0 &&
    Math.round(t.graders.reduce((s, g) => s + g.weight, 0)) !== 100
  )

  return [
    {
      label: 'Environment block',
      detail: envBlock
        ? envBlock.description.trim() ? 'Description set' : 'Description is empty'
        : 'Drag an Environment block onto the canvas',
      status: !envBlock ? 'empty' : !envBlock.description.trim() ? 'warn' : 'pass',
    },
    {
      label: 'At least one tool',
      detail: tools.length > 0
        ? `${tools.length} tool${tools.length !== 1 ? 's' : ''} defined`
        : 'Agents need tools to take actions',
      status: tools.length === 0 ? 'empty' : 'pass',
    },
    {
      label: 'At least one task',
      detail: tasks.length > 0
        ? `${tasks.length} task${tasks.length !== 1 ? 's' : ''} defined`
        : 'Tasks define what the agent is evaluated on',
      status: tasks.length === 0 ? 'empty' : 'pass',
    },
    {
      label: 'All tasks have graders',
      detail: tasksWithoutGraders.length === 0
        ? tasks.length === 0 ? 'No tasks yet' : 'Every task has at least one grader'
        : `${tasksWithoutGraders.length} task${tasksWithoutGraders.length !== 1 ? 's' : ''} missing graders`,
      status: tasks.length === 0 ? 'empty' : tasksWithoutGraders.length > 0 ? 'warn' : 'pass',
    },
    {
      label: 'Grader weights sum to 100',
      detail: tasksWithBadWeights.length === 0
        ? tasks.length === 0 ? 'No tasks yet' : 'All weights add up correctly'
        : `${tasksWithBadWeights.length} task${tasksWithBadWeights.length !== 1 ? 's' : ''} with weights ≠ 100`,
      status: tasks.length === 0 ? 'empty' : tasksWithBadWeights.length > 0 ? 'warn' : 'pass',
    },
  ]
}

function statusColor(passed: number, total: number) {
  const pct = passed / total
  if (pct === 1) return '#10b981'   // green
  if (pct >= 0.6) return '#f59e0b'  // amber
  return '#f43f5e'                   // rose
}

export function CompletenessChecker({ blocks }: { blocks: Block[] }) {
  const checks = buildChecks(blocks)
  const passed = checks.filter(c => c.status === 'pass').length
  const total = checks.length
  const pct = Math.round((passed / total) * 100)
  const dot = statusColor(passed, total)

  return (
    <div className="group absolute bottom-5 left-5 z-20 cursor-default">

      {/* Resting pill — fades away on hover */}
      <div className="
        absolute bottom-0 left-0
        flex items-center gap-1.5 px-2.5 py-1.5
        rounded-full border border-black/[0.06]
        bg-white/60 backdrop-blur-sm
        shadow-sm pointer-events-none
        transition-opacity duration-200
        opacity-40 group-hover:opacity-0
      ">
        <div className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: dot }}>
          {passed}/{total}
        </span>
      </div>

      {/* Expanded card — fades in on hover */}
      <div className="
        w-56 rounded-2xl border border-black/[0.07]
        bg-white/90 backdrop-blur-md
        shadow-xl shadow-black/10
        p-4 flex flex-col gap-3
        opacity-0 group-hover:opacity-100
        translate-y-1.5 group-hover:translate-y-0
        pointer-events-none group-hover:pointer-events-auto
        transition-all duration-200 ease-out
      ">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-black/35">
            Completeness
          </span>
          <span className="text-[11px] font-bold tabular-nums" style={{ color: dot }}>
            {pct}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-black/8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: dot }}
          />
        </div>

        {/* Checks */}
        <div className="flex flex-col gap-2">
          {checks.map(check => (
            <div key={check.label} className="flex items-start gap-2">
              {check.status === 'pass'  && <CheckCircle2 className="size-3.5 shrink-0 mt-px" style={{ color: '#10b981' }} />}
              {check.status === 'warn'  && <AlertCircle  className="size-3.5 shrink-0 mt-px" style={{ color: '#f59e0b' }} />}
              {check.status === 'empty' && <Circle       className="size-3.5 shrink-0 mt-px text-black/20" />}
              <div className="flex flex-col min-w-0">
                <span className={cn(
                  'text-[11px] font-medium leading-snug',
                  check.status === 'pass' ? 'text-black/80' : 'text-black/45'
                )}>
                  {check.label}
                </span>
                <span className="text-[10px] text-black/35 leading-snug">{check.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
