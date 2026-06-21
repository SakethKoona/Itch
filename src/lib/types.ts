// ─── Top-level block types ────────────────────────────────────────────────
export type BlockType = 'env' | 'tool' | 'task' | 'taskset' | 'database'

// ─── Sub-block types (drop inside canvas blocks) ─────────────────────────
export type SubBlockType = 'answer-check' | 'state-check' | 'tool-input'

export type AnyBlockType = BlockType | SubBlockType

// ─── Grader (lives inside a Task) ────────────────────────────────────────
export type GraderType = 'answer' | 'state'

export type Grader = {
  id: string
  graderType: GraderType
  weight: number
  condition: string
}

// ─── Top-level blocks ─────────────────────────────────────────────────────
export type EnvBlock = {
  id: string; type: 'env'
  description: string
  x: number; y: number
}

export type ToolInputType = 'string' | 'number' | 'boolean' | 'array' | 'object'

export type ToolInput = {
  id: string
  name: string
  inputType: ToolInputType
  description: string
  required: boolean
}

export type ToolBlock = {
  id: string; type: 'tool'
  name: string
  functionality: string
  inputs: ToolInput[]
  x: number; y: number
}

export type TaskBlock = {
  id: string; type: 'task'
  prompt: string
  graders: Grader[]
  x: number; y: number
}

export type TaskSetBlock = {
  id: string; type: 'taskset'
  name: string
  children: TaskBlock[]
  x: number; y: number
}

export type DatabaseBlock = {
  id: string; type: 'database'
  name: string
  description: string
  x: number; y: number
}

export type Block = EnvBlock | ToolBlock | TaskBlock | TaskSetBlock | DatabaseBlock

// Blocks that can snap/chain to each other
export function isConnectable(b: Block): b is EnvBlock | TaskBlock | TaskSetBlock | DatabaseBlock {
  return b.type === 'env' || b.type === 'task' || b.type === 'taskset' || b.type === 'database'
}

// Env is the root anchor — it has a bottom peg but no top socket
export function hasTopSocket(b: Block): boolean {
  return b.type === 'task' || b.type === 'taskset' || b.type === 'database'
}

// ─── Palette templates ────────────────────────────────────────────────────
export type PaletteTemplate = {
  type: AnyBlockType
  label: string
  description: string
  borderColor: string
  badgeBg: string
  badgeText: string
  iconColor: string
  isSubBlock: boolean
}

export const BLOCK_TEMPLATES: PaletteTemplate[] = [
  {
    type: 'env', label: 'Environment', isSubBlock: false,
    description: 'Describe what this RL environment is.',
    borderColor: 'border-l-violet-500', badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-700', iconColor: 'text-violet-500',
  },
  {
    type: 'tool', label: 'Tool', isSubBlock: false,
    description: 'Give the agent a callable tool.',
    borderColor: 'border-l-blue-500', badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700', iconColor: 'text-blue-500',
  },
  {
    type: 'task', label: 'Task', isSubBlock: false,
    description: 'A prompt the agent is evaluated on.',
    borderColor: 'border-l-emerald-500', badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700', iconColor: 'text-emerald-500',
  },
  {
    type: 'taskset', label: 'Task Set', isSubBlock: false,
    description: 'A named group of tasks forming a C-block.',
    borderColor: 'border-l-teal-500', badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-700', iconColor: 'text-teal-500',
  },
]

export const INTEGRATION_TEMPLATES: PaletteTemplate[] = [
  {
    type: 'database', label: 'Storage', isSubBlock: false,
    description: 'A persistent data store the agent can read and write.',
    borderColor: 'border-l-orange-500', badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700', iconColor: 'text-orange-500',
  },
]

export const SUB_BLOCK_TEMPLATES: PaletteTemplate[] = [
  {
    type: 'tool-input', label: 'Input', isSubBlock: true,
    description: 'A named parameter the tool accepts.',
    borderColor: 'border-l-indigo-500', badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-700', iconColor: 'text-indigo-500',
  },
  {
    type: 'answer-check', label: 'Answer Check', isSubBlock: true,
    description: "Grades based on what the agent says in its response.",
    borderColor: 'border-l-rose-500', badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700', iconColor: 'text-rose-500',
  },
  {
    type: 'state-check', label: 'State Check', isSubBlock: true,
    description: "Grades based on the state of the environment.",
    borderColor: 'border-l-amber-500', badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700', iconColor: 'text-amber-500',
  },
]

export function templateForType(type: AnyBlockType): PaletteTemplate {
  return [...BLOCK_TEMPLATES, ...INTEGRATION_TEMPLATES, ...SUB_BLOCK_TEMPLATES].find(t => t.type === type)!
}
