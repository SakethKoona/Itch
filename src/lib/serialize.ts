import type { Block, Grader, TaskBlock, DatabaseBlock, ToolInput } from './types'
import type { TrainingConfig } from '@/components/TrainingPanel'

// ─── JSON types ────────────────────────────────────────────────────────────
export type GraderJSON = {
  graderType: 'answer' | 'state'
  weight: number
  condition: string
}

export type EnvBlockJSON      = { type: 'env';      description: string }
export type ToolInputJSON     = { name: string; type: string; description: string; required: boolean }
export type ToolBlockJSON     = { type: 'tool'; name: string; functionality: string; inputs: ToolInputJSON[] }
export type TaskBlockJSON     = { type: 'task';     prompt: string; graders: GraderJSON[] }
export type TaskSetBlockJSON  = { type: 'taskset';  name: string; tasks: TaskBlockJSON[] }
export type DatabaseBlockJSON = { type: 'database'; name: string; description: string }
export type BlockJSON = EnvBlockJSON | ToolBlockJSON | TaskBlockJSON | TaskSetBlockJSON | DatabaseBlockJSON

export type WorkspaceJSON = {
  version: 1
  training: TrainingConfig
  blocks: BlockJSON[]
}

function serializeGrader({ graderType, weight, condition }: Grader): GraderJSON {
  return { graderType, weight, condition }
}

function serializeTask(task: TaskBlock): TaskBlockJSON {
  return { type: 'task', prompt: task.prompt, graders: task.graders.map(serializeGrader) }
}

export function serializeWorkspace(blocks: Block[], training: TrainingConfig): WorkspaceJSON {
  return {
    version: 1,
    training,
    blocks: blocks.map(block => {
      if (block.type === 'env')  return { type: 'env', description: block.description }
      if (block.type === 'tool') return {
        type: 'tool', name: block.name, functionality: block.functionality,
        inputs: block.inputs.map((i: ToolInput) => ({ name: i.name, type: i.inputType, description: i.description, required: i.required })),
      }
      if (block.type === 'task') return serializeTask(block)
      if (block.type === 'taskset') return { type: 'taskset', name: block.name, tasks: block.children.map(serializeTask) }
      return { type: 'database', name: block.name, description: block.description }
    }),
  }
}
